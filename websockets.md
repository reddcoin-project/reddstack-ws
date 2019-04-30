# Websocket Definitions

Outline of the websocket send/receive data structure

## onConnection
This is sent from the server periodically for every existing connection.
### response
    {
        type: 'connections',
        payload: 
            {
                max_users: count,
                online_users: count
            }
    }
## init
Not Used: Placeholder
### send
    {
        type: 'init',
        payload:
    }
    
### response
    none
    
## tipurl
This is used to capture details of the url that a tip was performed against.
### send
    {
        type: 'tipurl',
        payload: 
            {
            }
    }
    
### response
    {
        type: 'tipurl',
        payload: 
            {
            }
    }

## network
This is used to return details on a specific user, and how they can be tipped and if the address is valid.
### send
    {
        type: 'network',
        payload: 
            {
                uid: 'user id',
            }
    }
    
### response
    {
        type: 'network',
        payload: 
            {
                username: 'username',
                network: 'network',
                namespace: 'namespace',
                valid: True: False,
                source: '',
                error: ''
            }
    }
    
## version
This is used to return the current and supported versions
### send
    {
        type: 'version',
        payload: 
            {
            }
    }
    
### response
    {
        type: 'version',
        payload: 
            {
                release: '0.99.9'
            }
    }