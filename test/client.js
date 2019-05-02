const WebSocket = require('ws');

const url = 'wss://api.reddcoin.com';

const path = '/websocket/';



function launchClient (index) {

    const connection = new WebSocket(url+path,);

    connection.onopen = () => {
        console.log(`${index}: Connection opened`)
    };

    connection.onerror = error => {
        console.log(`${index}:WebSocket error: ${error}`)
    };

    connection.onmessage = e => {
        console.log(`${index}: ${e.data}`)
    };

}

for (i=0; i < 2000; i++) {
    launchClient(i);
}

