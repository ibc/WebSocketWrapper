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


## Browserified library

Take a browserified version of the library from the `dist/` folder:

* `dist/websocketwrapper-X.Y.Z.js`: The uncompressed version.
* `dist/websocketwrapper-X.Y.Z.min.js`: The compressed production-ready version.
* `dist/websocketwrapper.js`: A copy of the uncompressed version.
* `dist/websocketwrapper.min.js`: A copy of the compressed version.

They expose the global `window.WebSocketWrapper` module.

```html
<script src='websocketwrapper-X.Y.Z.js'></script>
```


## Usage Example

```javascript
var ws = new WebSocketWrapper(url, protocol);

ws.setReconnectionDelay(5000);

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
