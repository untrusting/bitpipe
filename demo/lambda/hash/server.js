const crypto = require('crypto');

// Define the sha256 function
const sha256 = (x) => crypto.createHash('sha256').update(x, 'utf8').digest('hex');

// Import the bitpipe module
const bitpipe = require('../../../index');

// Start the bitpipe with the specified lambda function
bitpipe.start({
    lambda: function(req, payload, pipe) {
        // Create a sha256 hash of the original data
        payload.data[1] = sha256(payload.data[1]);
        pipe(null, payload);
    }
});