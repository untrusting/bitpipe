const bitpipe = require('../../../index');

// Start the bitpipe with the specified lambda function
bitpipe.start({
    lambda: function(req, payload, pipe) {
        // Filter only "0x6d02"
        if (payload.data[0] !== "0x6d02") {
            pipe("Prefix must be 0x6d02", null);
        } else {
            pipe(null, payload);
        }
    }
});