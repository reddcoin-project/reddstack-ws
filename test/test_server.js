const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080, path:'/ws/' });

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