'use strict';

const config = require("./lib/config.js");

module.exports.index = (event, context, callback) => {
    const response = {
        statusCode: 200,
        body: JSON.stringify({
            test: 'Success',
            apiUrl: config.communityDataUrl
        }),
    };

    callback(null, response);
};
