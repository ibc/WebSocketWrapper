# WebSocketWrapper

Wrapper over the WebSocket class to manage disconnections transparently.


## Installation

* With **npm**:

```bash
$ npm install websocketwrapper
```


## Usage in Node

```javascript
var WebSocketWrapper = require('websocketwrapper');
```


## Usage Example

```javascript
var ws = new WebSocketWrapper(url, protocol);

ws.reconnectionDelay = 5000;

ws.onopen = function() {
    console.log('connected');

    // Send some kind of registration message.
    ws.send('REGISTER');
};

ws.onreconnect = function() {
    console.log('reconnected');

    // Send some kind of registration message.
    ws.send('REGISTER');
};

ws.onmessage = function(e) {
    // do something
};
```


## Documentation

You can read the full [API documentation](docs/index.md) in the docs folder.


## Debugging

The library includes the Node [debug](https://github.com/visionmedia/debug) module. In order to enable debugging:

In Node set the `DEBUG=WebSocketWrapper*` environment variable before running the application, or set it at the top of the script:

```javascript
process.env.DEBUG = 'WebSocketWrapper*';
```

In the browser run `WebSocketWrapper.debug.enable('WebSocketWrapper*');` and reload the page. Note that the debugging settings are stored into the browser LocalStorage. To disable it run `WebSocketWrapper.debug.disable('WebSocketWrapper*');`.


## Author

Iñaki Baz Castillo.


## License

ISC.
