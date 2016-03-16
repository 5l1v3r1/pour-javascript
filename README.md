Pour has what you need for Azure log management. It is lightweight, secure and fast. You can search, filter and easily scale.

## Install npm module.

From console, run the following command
```bash
npm install pour-azure-logger
```

==================================

## Generate an app token from the portal [www.trypour.com](http://www.trypour.com).

Login to [the portal](http://www.trypour.com).

Create a new app token using your storage account name and primary access key.

Copy the generated token.

NOTE: Detailed information on creating and retrieving storage account name and primary access key can be found [here](https://azure.microsoft.com/en-us/documentation/articles/storage-create-storage-account/).

==================================

## Start logging!

Import the library. 
```javascript
// Pour library
var logger = require('pour-azure-logger');
```

Initialize the logger.
```javascript
// Copy the app token generated in the previous step
logger.connect('paste-app-token-here', [callback]);
```

(Optional) Set common log properties via setContext method. You only need to set context information once just like initialization. Again ideally this can be done in your application's initialization logic. All the context information will be attached to each log message automatically. 
```javascript
// Set custom context information
logger.setContext('Environment', 'read-some-environment-value i.e. process.env.Environment');

// Set Azure role name and id as context to attach each log message
logger.setContext('RoleName', 'read-some-environment-value i.e. process.env.RoleName');
logger.setContext('RoleId', 'read-some-environment-value i.e. process.env.RoleId');
```

Start logging.
```javascript 
logger.critical('A critical message');
logger.error('An error message');
logger.warning('A warning message');
logger.info('An info message');
logger.verbose('A verbose message');
```