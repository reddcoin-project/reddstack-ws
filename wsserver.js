/*
    reddstack-ws provides a interface into the reddtack environment
    Copyright (C) 2019  gnasher@reddcoin.com

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const express = require('express');
const WebSocketServer = require('ws');
const geoip = require('geoip-lite');
const useragent = require('useragent');
const MongoClient = require('mongodb').MongoClient;
const config = require('./config');

const {websocket:{key, cert, port}} = config;
let releaseObj;

function getRelease(){
    fs.readFile(path.join(__dirname,'/clientRelease.json'), 'utf8', function (err, data) {
        if (err) throw err;
        releaseObj = JSON.parse(data);
        console.log(`${JSON.stringify(releaseObj)}`)
    });
}

function checkRelease() {
    getRelease();
    setInterval(getRelease,36000000);
}

checkRelease();


const serverOptions = {
};

const app = express();
const wssserver = http.Server(app);

function startWebSocketServer(db) {

    const wss = new WebSocketServer.Server({server: wssserver, path: '/websocket/', handshakeTimeout: 1000});

    wssserver.listen(port);


    let users = {};
    let userCount = 0;
    let userLastID = 0;
    let userMax = 0;

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

    function noop() {
        //console.log(`Ping received: Heartbeat`)
    }

    function heartbeat() {
        this.isAlive = true;
        //console.log(`Pong received: Heartbeat`)
    }

    wss.on('connection', (socket, req) => {
        userCount++;
        if (userCount >= userMax) {
            userMax = userCount
        }
        socket.isAlive = true;
        socket.on('pong', heartbeat);

        socket.upgradeReq = req;

        let id = userLastID++;
        let ip = socket.upgradeReq.headers['x-real-ip'] || socket.upgradeReq.connection.remoteAddress;
        let user = users[id] = {
            id: id,
            host: socket.upgradeReq.headers['host'],
            ip: ip,
            ipgeo: geoip.lookup(ip),
            ua: useragent.lookup(socket.upgradeReq.headers['user-agent']).toJSON(),
            date: Date.now(),
            updated: Date.now()
        };

        socket.on('message', msg => {
            try {
                msg = JSON.parse(msg)
            } catch (e) {
                return
            }
            console.log(`<= ${JSON.stringify(msg)}`);
            switch (msg.type) {
                case 'init':
                    break;
                case 'tipurl':
                    // console.log(`received tipurl: ${JSON.stringify(msg.payload)}`);
                    let urlDetails = getTipURLDetails(msg.payload, function (result) {
                        // console.log(result);
                        sendData('tipurl', result)
                    });
                    break;
                case 'network':
                    // console.log(`received network: ${JSON.stringify(msg.payload)}`);
                    let responsePayload = {};
                    if (msg.payload.uid && msg.payload.uid.length) {
                        let networkDetails = getNetworkDetails(msg.payload, function(result) {
                            // console.log(result);

                            if (result && result.length) {
                                responsePayload = result[0];
                                responsePayload['network'] = msg.payload.network;
                                responsePayload['namespace'] = msg.payload.namespace;
                            } else {
                                responsePayload['error'] = 'no result';
                                responsePayload['username'] = msg.payload.uid;
                                responsePayload['network'] = msg.payload.network;
                                responsePayload['valid'] = false;
                            }
                            responsePayload['source'] = msg.payload.source;
                            responsePayload['namespace'] = msg.payload.namespace;
                            sendData('network', responsePayload )
                        });
                    } else {
                        responsePayload['error'] = 'no user provided';
                        responsePayload['network'] = msg.payload.network;
                        responsePayload['valid'] = false;
                        responsePayload['source'] = msg.payload.source;
                        responsePayload['namespace'] = msg.payload.namespace;
                        sendData('network', responsePayload )
                    }
                    break;
                case 'version':
                    // console.log(`received version: ${JSON.stringify(msg.payload)}`);
                    //read version from file.. read direct from github when public
                    let payload = {};
                    payload['release'] = releaseObj.clientversion.release;
                    sendData('version', payload );


                    break;
                default:
                    console.log(`received default: ${JSON.stringify(msg)}`)
            }

        });

        socket.on('close', (code, reason) => {
            userCount--;
            console.log(`Client Disconnected Code [${code}]`)
        });

        socket.on('error', function (err) {
            console.log('Found error: ' + err);
        });

        socket.on('close', function () {
            console.log('connection closed.');
        });

        /* Function to send data back to client
        Take 'type' & 'payload'
        */
        function sendData (type, payload) {
            if (socket.readyState === socket.OPEN) {
                let payLoad = {
                    'type': type,
                    'payload': payload
                };

                try {
                    console.log (`=> ${JSON.stringify(payLoad)}`);
                    socket.send(JSON.stringify(payLoad), function (error) {
                        if (error === undefined)
                            return;
                        else
                            console.log(`Async error: ${error}`)
                    })
                } catch (e) {
                    console.log("Sync error: " + e);
                    socket.close();
                }


            }
        }
/*        setInterval(() => {
                if (socket.readyState === socket.OPEN) {
                    let payload = {
                        'type': 'date',
                        'payload': {
                            'date': new Date()
                        }
                    };

                    try {
                        socket.send(JSON.stringify(payload), function (error) {
                            if (error === undefined)
                                return;
                            else
                                console.log(`Async error: ${error}`)
                        })
                    } catch (e) {
                        console.log("Sync error: " + e);
                        socket.close();
                    }


                }

            },
            1000
        )*/
    });


    wss.on('error', err => console.error(err));

    const interval = setInterval(function ping() {
        console.log(`Number of clients ${wss.clients.size}`);
         wss.clients.forEach(function each(ws) {
            if (ws.isAlive === false) return ws.terminate();

            ws.isAlive = false;
            try {
                ws.ping(noop, false, function (error) {
                    if (error === undefined)
                        return;
                    else
                        console.log(`Async error: ${error}`)
                });
            } catch (e) {
                console.log("Sync error: " + e);
                ws.close();
            }

        });
    }, 30000);

    /*
    Query Database to save results of tipurl
    */
    function getTipURLDetails(data, callback) {
        //TODO
        // add the DB query/save logic
        let dbo = db.db("socialTips");
        data.timestamp = Date.now();

        return callback(data);

        dbo.collection("urls").find({}).toArray(function (err, result) {
            if (err) throw err;
            //console.log(result)
            return callback(result)
        });

    }

    /*
    Query Database to return details on user, based on network selected
     */
    function getNetworkDetails(data, callback) {
        let dbo = db.db("socialNetworks");
        let query = { network:data.network, username:data.uid}
        dbo.collection("networks").find(query).toArray(function (err,result) {
            if (err) throw err;
            return callback(result)
        });
    }
}

// Start the connection to mongoDB
startMongoDBConnection();

function startMongoDBConnection(){
   MongoClient.connect('mongodb://localhost:27017/', function(err, db) {
       if (err) throw err;
       // Start our websocket server
       startWebSocketServer(db);
   });
}