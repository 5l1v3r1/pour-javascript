// Retrieve dependencies
var http = require('http');
var https = require('https');
var CryptoJS = require("crypto-js");

// Create private properties
var _id = 0;
var _maxDate = (new Date(Date.UTC(9999, 11, 31, 23, 59, 59, 999))).getTime();
var _account, _key, _table;
var _context = _context || {};

function setContextInner(name, value) {
    _context[name] = value;
}

function freeContextInner(name) {
    if (name in _context) {
        delete _context[name];
    }
}

function createAuthHeaderForAppToken(appToken, dateHeader, pathAndQuery) {
    var stringToSign = appToken + '\n' + dateHeader + '\n' + pathAndQuery;
    var hash = CryptoJS.HmacSHA256(stringToSign, appToken);
    return CryptoJS.enc.Base64.stringify(hash);
}

function createLogMessage(account, key, table, message, level) {
    if (!account || account.length === 0 ||
        !key || key.length === 0 ||
        !table || table.length === 0 ||
        !message) {
        console.log('Request is skipped.');
        return;
    }
    
    var host = account + '.table.core.windows.net';
    var path = '/' + table;
    request(account, key, table, path, 'POST', getBody(message, level), 'application/json');
}

function request(account, key, table, path, method, body, contentType, callback) {
    var host = account + '.table.core.windows.net';
    var url = host + path;
    var dateHeaderValue = (new Date()).toUTCString();
    
    https.request({
        host: host,
        path: path,
        method: method,
        headers: {
            'Accept': 'application/json;odata=nometadata',
            'Authorization': createAuthHeader(account, key, path, method, contentType, dateHeaderValue),
            'Content-type': contentType,
            'Content-Length': body.length,
            'DataServiceVersion': '3.0;NetFx',
            'MaxDataServiceVersion': '3.0;NetFx',
            'x-ms-date': dateHeaderValue,
            'x-ms-version': '2013-08-15'
        }
    }, function (res) {
        if ((res.statusCode == '201' || res.statusCode == '409') && callback) {
            callback();
        }
    }).on('error', function (e) {
        console.log('There was an error in the request. Error: ' + e.message);
    }).end(body);
}

function createAuthHeader(account, key, path, method, contentType, dateHeader) {
    var canResource = '/' + account + path;
    var stringToSign = method + '\n\n' + contentType + '\n' + dateHeader + '\n' + canResource;
    var hash = CryptoJS.HmacSHA256(stringToSign, CryptoJS.enc.Base64.parse(key));
    return 'SharedKey ' + account + ':' + CryptoJS.enc.Base64.stringify(hash);
}

function getBody(message, level) {
    _id += 1;
    var now = new Date();
    var rowKey = ((_maxDate - now.getTime()) * 10000) + '-' + _id;
    var partitionKey = rowKey.substring(0, 5);
    var logMessage = {
        'Message': message, 
        'Level': level, 
        'EventTime': now,
        'EventTime@odata.type': 'Edm.DateTime',
        'RowKey': rowKey, 
        'PartitionKey': partitionKey
    };
    
    // Append context
    for (var key in _context) {
        if (key && !(key in logMessage)) {
            logMessage[key] = _context[key];
        }
    }
    
    return JSON.stringify(logMessage);
}

module.exports = {
    connect: function (appToken, callback) {
        var host = '43532227db0942388c5a047e7bdb0db5.cloudapp.net';
        var path = '/api/beta/search?token=' + appToken;
        var url = host + path;
        var dateHeaderValue = (new Date()).toUTCString();
        
        http.request({
            host: host,
            path: path,
            method: 'GET',
            headers: {
                'x-auth': createAuthHeaderForAppToken(appToken, dateHeaderValue, path),
                'x-datetime': dateHeaderValue,
                'x-app': appToken
            }
        }, function (res) {
            var body = '';
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                body += chunk;
            });
            res.on('end', function () {
                var parsedResponseArray = CryptoJS.enc.Base64.parse(body);
                var splittedResponse = parsedResponseArray.toString(CryptoJS.enc.Utf8).split('::');
                _account = splittedResponse[0];
                _key = splittedResponse[1];
                _table = 'Logs';
                
                // Create logs table
                request(_account, _key, _table, '/Tables', 'POST', '{ "TableName": "Logs" }', 'application/json', callback);
            });
        }).on('error', function (e) {
            console.log('There is an issue with given app token. Error: ' + e.message);
        }).end();
    },
    
    critical: function (message) {
        createLogMessage(_account, _key, _table, message, 0);
    },
    
    error: function (message) {
        createLogMessage(_account, _key, _table, message, 1);
    },
    
    warning: function (message) {
        createLogMessage(_account, _key, _table, message, 2);
    },
    
    info: function (message) {
        createLogMessage(_account, _key, _table, message, 3);
    },
    
    verbose: function (message) {
        createLogMessage(_account, _key, _table, message, 4);
    },
    
    setContext: function (name, value) {
        if (!name || !value) {
            return;
        }
        
        setContextInner(name, value);
    },
    
    freeContext: function (name) {
        if (!name) {
            return;
        }
        
        freeContextInner(name);
    }
};