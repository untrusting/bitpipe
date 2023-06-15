// Post multiple consecutive messages
const axios = require('axios');

// Set the host URL
const host = "http://localhost:8081";

// Define seed and run function
const seed = "#";
const run = async function(space) {
    return axios.post(`${host}/bitpipe`, {
        data: ["", space + seed]
    });
};

// Execute the code
(async () => {
    for (let i = 0; i < 30; i++) {
        let space = "#".repeat(i);
        let response = await run(space).catch(function(e) {
            console.log("Error", e);
        });
        await new Promise(done => setTimeout(done, 2000));
        console.log("response =", response.data);
    }
})();