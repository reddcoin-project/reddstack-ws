// config.js
const fs = require('fs');
const os = require('os');

const config = {
    app: {
        logDir: ".reddstack-ws"
    },
    websocket: {
        key: '/path/to/ssh/privatekey.key',
        cert: '/path/to/ssh/certificate.crt',
        ca: '/path/to/ssh/bundle.ca-bundle',
        httpPort: 8080,
        httpsPort: 8443,
        listeningIp: '192.168.0.112'
        //listeningIp: '0.0.0.0'
        //listeningIp: '::'
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