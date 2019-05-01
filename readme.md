# reddstack-ws
## Introduction
providing a websocket interface into the reddstack environment

## Running process

daemonizing of the process is performed using forever.
Please install

    $ [sudo] npm install forever -g

### forever configuration
adjust the paths in forever.json as required
eg

    {
      // forever config file for server.js
      "uid": "reddstack-ws",
      "append": true,
      "watch": true,
      "script" : "server.js",
      "logFile": "/home/user/.reddstack-ws/reddstack-ws.server.log",
      "outFile": "/home/user/.reddstack-ws/reddstack-ws.out.log",
      "errFile": "/home/user/.reddstack-ws/reddstack-ws.err.log"
    }
    
### start
    $ npm start
    
### stop
    $ npm stop
## Documentation
Documentation is automatically generated using postman & [docgen](https://github.com/thedevsaddam/docgen)

e.g.

    $ docgen build -i ReddID.postman_collection.json -o ./www/docs/index.html
