// Import the bitpipe module
const bitpipe = require('../../../index');

// Start the bitpipe with the specified lambda function
bitpipe.start({
    lambda: function(req, payload, pipe) {
        // Append timestamp
        payload.data[1] += ` [${Date.now()}]`;
        pipe(null, payload);
    }
});