'use strict';
var https = require('https');

module.exports = {
  get: function(host, path, callback) {
    var options = {
        host: host,
        path: path,
        method: 'GET'
    };

    var req = https.request(options, (res) => {

        var body = '';

        res.on('data', (d) => {
            body += d;
        });

        res.on('end', function() {
            callback(null, body);
        });

    });
    req.end();

    req.on('error', (e) => {
      callback(e);
    });
  }
};
