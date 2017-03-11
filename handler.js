'use strict';

module.exports.index = (event, context, callback) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      test: 'Success',
    }),
  };

  callback(null, response);
};
