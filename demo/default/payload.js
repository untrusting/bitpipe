const axios = require('axios');

// Set the host URL
const host = "http://localhost:8081";

// Make a POST request to the Bitpipe endpoint
axios.post(`${host}/bitpipe`, {
    data: ["0x6d02", "hello from datapay"]
}).then((response) => {
        // Log the response
        console.log("response =", response);
    }).catch((e) => {
        // Log any errors
        console.log("Error =", e);
    });