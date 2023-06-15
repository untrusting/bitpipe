const axios = require('axios');

// Set the host URL
const host = "http://localhost:8081";

// Define the transactions (txs) array
const txs = [
    { data: ["0x6d02", "hello from datapay"] },
    { data: ["0x6d02", "world from datapay"] },
    { data: ["0x6d02", "bye from datapay"] }
];

// Define the run function
const run = function(tx) {
    axios.post(`${host}/bitpipe`, tx).then((response) => {
            console.log("response =", response.data);
        }).catch((e) => {
            console.log("Error =", e);
        });
};

// Execute the code
(async () => {
    for (let i = 0; i < txs.length; i++) {
        await run(txs[i]);
    }
})();