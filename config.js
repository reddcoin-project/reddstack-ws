// config.js
const config = {
    app: {
        port: 3000
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

module.exports = config;