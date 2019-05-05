const fs = require('fs');
const WebSocket = require('ws');
const http = require('http');
const https = require('https');
const url = require('url');
const express = require('express');
const config = require('../config');

const {websocket:{key, cert, ca, httpPort, httpsPort, listeningIp}} = config;

let app = express();

// redirect unsecure http connection
app.use( function (req, res, next) {
    if(!req.secure) {
        var secureUrl = "https://" + req.headers['host'] + req.url;
        res.writeHead(301, { "Location":  secureUrl });
        res.end();
    }
    next();
});

app.get('/', function (req, res) {
    //res.send('Now using https..');
    res.sendFile(__dirname + '/www/ws.html');
});
app.get('/docs', function (req, res) {
    res.sendFile(__dirname + '/www/docs/index.html');
});

var certfile = fs.readFileSync(cert, 'utf8');
var keyfile = fs.readFileSync(key, 'utf8');
var cafile = fs.readFileSync(ca, 'utf8');


var creds = {
    cert: certfile,
    key: keyfile,
    ca: cafile
};

const httpServer = http.createServer(app);
const httpsServer = https.createServer(creds, app);

const wss = new WebSocket.Server({noServer: true} );

let userCount=0;
let userMax = 0;

wss.on('connection', function connection(ws) {
    userCount++;
    if (userCount >= userMax) {
        userMax = userCount
    }

    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
    });

    ws.send(`connection count ${userCount}`);

    ws.on('close', (code, reason) => {
        userCount--;
        console.log(`Client Disconnected Code [${code}]`)
    });

    ws.on('error', function (err) {
        console.log('Found error: ' + err);
    });
});

httpsServer.on('upgrade', function upgrade(request, socket, head) {
    const pathname = url.parse(request.url).pathname;

    if (pathname === '/websocket/') {
        wss.handleUpgrade(request, socket, head, function done(ws) {
            wss.emit('connection', ws, request);
        });
    } else {
        socket.destroy();
    }
});

// http server
httpServer.listen(httpPort, listeningIp,() => {
    console.log(`http server starting on ${listeningIp} and listening on port: ${httpPort}`)
});

// hhtps server
httpsServer.listen(httpsPort, listeningIp,() => {
    console.log(`https server starting on ${listeningIp} and listening on port: ${httpsPort}`)
});

setInterval(() => {
    let conns = {
        "type": "connections",
        "payload": {
            "max_users": userMax,
            "online_users": userCount
        }

    };

    wss.clients.forEach(s => {
        try {
            s.send(JSON.stringify(conns), function (error) {
                if (error === undefined)
                    return;
                else
                    console.log(`Async error: ${error}`)
            })
        } catch (e) {
            console.log("Sync error: " + e);
            s.close();
        }
    });
    console.log(`Users online: ${userCount}, Max Users: ${userMax}`)
}, 10 * 1000);