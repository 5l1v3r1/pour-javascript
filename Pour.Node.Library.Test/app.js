var prompt = require('prompt');
var logger = require('pour-azure-logger');

prompt.start();
prompt.get(['token'], function (err, result) {
    console.log('Testing token: "' + result.token + '"');
    logger.connect(result.token, function () {
        logger.info('From npm v13');
    });
    console.log('Complete');
});