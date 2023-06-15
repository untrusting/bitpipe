/*
	You can filter this transaction with the following bitquery:
	{
		"v": 3,
		"q": {
			"find": {
				"out.b0": { "op": 106 },
				"out.b1": { "op": 0 }
			}
		}
	}
*/
const axios = require('axios');

// Set the host URL
const host = "https://localhost:8081";

// Make a POST request to the Bitpipe endpoint
axios.post(`${host}/bitpipe`, {
    data: ["", "Hello from Bitpipe"]
}).then((response) => {
        // Log the response
        console.log("response =", response);
    }).catch((e) => {
        // Log any errors
        console.log("Error =", e);
    });