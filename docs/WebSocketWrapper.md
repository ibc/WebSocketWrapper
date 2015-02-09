# `WebSocketWrapper` Class API

An instance of `WebSocketWrapper` holds an instance of a native [WebSocket](http://dev.w3.org/html5/websockets/). The expoesd API is the same as the native one. Just the differences/additions are described below.


### `new WebSocketWrapper(url, protocols, origin, headers, requestOptions, clientConfig)` constructor

* `url` and `protocols` mean the same as in the native API.
* All the others are parameters for the [W3CWebSocket](https://github.com/theturtle32/WebSocket-Node/blob/master/docs/W3CWebSocket.md) class of the [WebSocket-Node](https://github.com/theturtle32/WebSocket-Node) library for Node.js.


### Events

`onopen()` is called for the first WebSocket connection. If the connection is closed by the server then `onclose()` is fired and, after a time delay, a new connection is attempted. If it connects to the server, `onreconnection()` is called on the `WebSocketWrapper` instance (if it's set by the user, otherwise `onopen()` will be called again).


### Methods


#### `setReconnectionDelay(delay)`

Reconnection delay (in milliseconds). Default value is 2000 ms. If it's set to 0 no reconnection attempt will be performed.
