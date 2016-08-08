# WebSocketWrapper

Wrapper over the WebSocket class to manage disconnections transparently.


## Installation

* With **npm**:

```bash
$ npm install websocketwrapper
```


## Usage in Node/Browserify

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

## `WebSocketWrapper` Class API

An instance of `WebSocketWrapper` holds an instance of a native [WebSocket](http://dev.w3.org/html5/websockets/). The exposed API is the same as the native one. Just some differences/additions are described below.


### `new WebSocketWrapper(url, protocols)` constructor

* `url` and `protocols` mean the same as in the native API.


### Events

`open` event is fired for the first WebSocket connection. If the connection is closed by the server or due to a netwotk error then `close` is fired and, after a delay, a new connection is attempted. If it connects to the server, `reconnect` event is fired.


### Custom API


#### `ws.reconnectionDelay` property

Reconnection delay (in milliseconds). Default value is 5000 ms. If it's set to 0 no reconnection attempt will be performed.

```javascript
ws.reconnectionDelay = 2000;
```



## Debugging

The library includes the Node [debug](https://github.com/visionmedia/debug) module and produces logs with prefix `WebSocketWrapper`.


## Author

Iñaki Baz Castillo.


## License

ISC.
