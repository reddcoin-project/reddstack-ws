// config.js
const fs = require('fs');
const os = require('os');

const config = {
    app: {
        port: 3000,
        logDir: ".reddstack-ws"
    },
    websocket: {
        key: '/home/path/to/ssl-certificates/localhost.key',
        cert: '/home/path/to/ReddStack/ssl-certificates/localhost.cert',
        port: 8081,

    },
    db: {
        host: 'localhost',
        port: 27017,
        name: 'db'
    }
};

function ensureExists(path, mask, cb) {
    if (typeof mask == 'function') { // allow the `mask` parameter to be optional
        cb = mask;
        mask = 0777;
    }
    fs.mkdir(path, mask, function(err) {
        if (err) {
            if (err.code == 'EEXIST') cb(null); // ignore the error if the folder already exists
            else cb(err); // something else went wrong
        } else cb(null); // successfully created folder
    });
}

let logLocation = os.homedir() +'/' + config.app.logDir;

ensureExists( logLocation, function(err) {
    if (err) {
        console.log('cannot create %s', logLocation)
    } // handle folder creation error
    else {
        console.log(' %s created', logLocation)
    }// we're all good
});

module.exports = config;