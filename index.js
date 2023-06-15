const datapay = require('datapay');
const express = require('express');
const RpcClient = require('bitcoind-rpc');
const fs = require('fs');
const ip = require('ip');

// Read keyfile
const keyfile = fs.readFileSync(process.cwd() + '/.env', 'utf8');

// Parse keyfile into key-value pairs
const KEYS = keyfile.split(/[\n\r]+/).filter((i) => {
    return i;
}).map((i) => {
    let o = {};
    o.key = i.split("=")[0];
    o.val = i.split("=")[1];
    return o;
});

// Create a mapping of keys
let KEY_MAPPING = {};
KEYS.forEach((k) => {
    KEY_MAPPING[k.key] = k.val;
});

// Extract private keys
const PRIVATE_KEYS = KEYS.filter((p) => {
    return p;
}).map((k) => {
    return k.val;
});

let app = null;
let current_index = 0;

let rpc;

/**
 * Starts the server.
 * @param {Object} o - Configuration options.
 * @param {Function} o.lambda - Optional lambda function to transform the request payload.
 * @param {express.Application} o.app - Optional express application to use.
 * @param {number} o.port - Optional port number for the server.
 * @param {Function} o.onconnect - Optional function to execute when the server starts listening.
 */
const start = (o) => {
    let lambda = null;
    let port = 8081;
    if (o) {
        lambda = o.lambda;
        if (o.app) {
            app = o.app;
        } else {
            app = express();
        }
        if (o.port) {
            port = o.port;
        } else if (KEY_MAPPING.PORT) {
            port = KEY_MAPPING.PORT;
        }
    } else {
        lambda = null;
        app = express();
    }

    app.use(express.urlencoded({
        extended: true
    }));
    app.use(express.json());
    app.use(express.static('public'));

    if (KEY_MAPPING.LOCAL) {
        // Create local RPC client
        rpc = new RpcClient({
            'protocol': 'http',
            'user': KEY_MAPPING.rpc_user ? KEY_MAPPING.rpc_user : 'root',
            'pass': KEY_MAPPING.rpc_pass ? KEY_MAPPING.rpc_pass : 'bitcoin',
            'host': KEY_MAPPING.host ? KEY_MAPPING.host : ip.address(),
            'port': '8332',
            'limit': 15
        });
    } else {
        // Use remote insight
    }

    /**
     * Handler for the root route.
     * @param {express.Request} req - The request object.
     * @param {express.Response} res - The response object.
     */
    app.get('/', (req, res) => {
        res.send('Hello Bitpipe!\n\nMake a POST request to:' + req.protocol + "://" + req.headers.host + req.originalUrl + "/bitpipe with a datapay payload.\n\nMore at https://github.com/unwriter/datapay");
    });

    /**
     * Handler for the bitpipe route.
     * @param {express.Request} req - The request object.
     * @param {express.Response} res - The response object.
     */
    app.post('/bitpipe', (req, res) => {
        // "tx" is always treated as signed
        let signed = req.body.tx ? true : false;
        let payload = req.body;
        if (!signed) {
            if (!PRIVATE_KEYS || PRIVATE_KEYS.length === 0) {
                console.log("Please add private keys to .env file");
                console.log("Example:\n");
                console.log("PRIVATEKEY1=17HTwz6MnLoFCHad3M4Z8dC9XZAHMW4YPm");
                console.log("PRIVATEKEY2=1AatAGkeVN9RFk8qqrmg8BmFiyouHuMsgY");
                res.json({
                    success: false,
                    message: "The server doesn't have a signer key"
                });
                return;
            }
        }

        current_index = (current_index < PRIVATE_KEYS.length - 1 ? current_index + 1 : 0); // Shuffle through

        if (lambda) {
            lambda(req, payload, (err, transformed) => {
                run(err, transformed, res);
            });
        } else {
            run(null, payload, res);
        }
    });

    if (o && o.onconnect) {
        app.listen(port, o.onconnect);
    } else {
        app.listen(port);
    }
};

/**
 * Runs the data transaction.
 * @param {Error} err - An error object if an error occurred, null otherwise.
 * @param {Object} payload - The transaction payload.
 * @param {express.Response} res - The response object.
 */
const run = (err, payload, res) => {
    let current_key = PRIVATE_KEYS[current_index];
    if (err) {
        console.log("Error", err);
    } else {
        if (payload.pay) {
            payload.pay.key = current_key;
        } else {
            payload.pay = {
                key: current_key
            };
        }
        if (KEY_MAPPING.DEBUG) console.log('payload = ', payload);
        if (KEY_MAPPING.LOCAL) {
            datapay.build(payload, (err, signed_tx) => {
                if (KEY_MAPPING.DEBUG) console.log("signed tx = ", signed_tx);
                rpc.sendRawTransaction(signed_tx, (err, r) => {
                    if (err) {
                        console.log("error: ", err);
                        res.json({
                            success: false,
                            message: err.toString()
                        });
                    } else {
                        if (KEY_MAPPING.DEBUG) console.log("success: ", r);
                        res.json({
                            success: true,
                            r: r
                        });
                    }
                });
            });
        } else {
            datapay.send(payload, (e, r) => {
                if (e) {
                    console.log("error: ", e);
                    res.json({
                        success: false,
                        message: e.toString()
                    });
                } else {
                    if (KEY_MAPPING.DEBUG) console.log("success: ", r);
                    res.json({
                        success: true,
                        r: r
                    });
                }
            });
        }
    }
};

// If the script is run directly, start the server
if (require.main === module) {
    start();
} else {
    // Export the start function for external use
    module.exports = {
        start: start
    };
}