# `WebSocketWrapper` Class API

An instance of `WebSocketWrapper` holds an instance of a native [WebSocket](http://dev.w3.org/html5/websockets/). The exposed API is the same as the native one. Just some differences/additions are described below.


### `new WebSocketWrapper(url, protocols, origin, headers, requestOptions, clientConfig)` constructor

* `url` and `protocols` mean the same as in the native API.
* All the others are parameters for the [W3CWebSocket](https://github.com/theturtle32/WebSocket-Node/blob/master/docs/W3CWebSocket.md) class of the [WebSocket-Node](https://github.com/theturtle32/WebSocket-Node) library for Node.js.


### Events

`open` event is fired for the first WebSocket connection. If the connection is closed by the server or due to a netwotk error then `close` is fired and, after a delay, a new connection is attempted. If it connects to the server, `reconnect` is fired on the `WebSocketWrapper` instance.


### Custom API


#### `ws.reconnectionDelay` property

Reconnection delay (in milliseconds). Default value is 5000 ms. If it's set to 0 no reconnection attempt will be performed.

```javascript
ws.reconnectionDelay = 2000;
```
