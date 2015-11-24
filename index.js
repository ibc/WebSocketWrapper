/**
 * Expose the WebSocketWrapper class.
 */
module.exports = WebSocketWrapper;


var
	/**
	 * Dependencies.
	 */
	debug = require('debug')('WebSocketWrapper'),
	debugerror = require('debug')('WebSocketWrapper:ERROR'),
	// 'websocket' module uses the native WebSocket interface when bundled to run in a browser.
	W3CWebSocket = require('websocket').w3cwebsocket,
	yaeti = require('yaeti');


debugerror.log = console.warn.bind(console);


function WebSocketWrapper() {
	debug('new() | [url:"%s", protocol:%s]', arguments[0], arguments[1]);

	// Make this an EventTarget.
	yaeti.EventTarget.call(this);

	// Store arguments.
	this.args = arguments;

	// The native WebSocket instance.
	this._ws = null;

	// Create the native WebSocket.
	createWebSocket.apply(this, this.args);

	// Flag indicating that WebSocket is closed by us.
	this._closed = false;

	// Flag indicating that an error happened while connecting.
	this._hasError = false;

	// Reconnecting flag.
	this._isReconnecting = false;

	// Reconnection timer.
	this._reconnectionTimer = null;

	// Reconnection delay.
	this._reconnectionDelay = 5000;
}


Object.defineProperties(WebSocketWrapper.prototype, {
	url:            { get: function () { return this._ws.url;            } },
	readyState:     { get: function () { return this._ws.readyState;     } },
	protocol:       { get: function () { return this._ws.protocol;       } },
	extensions:     { get: function () { return this._ws.extensions;     } },
	bufferedAmount: { get: function () { return this._ws.bufferedAmount; } },

	CONNECTING:     { get: function () { return this._ws.CONNECTING;     } },
	OPEN:           { get: function () { return this._ws.OPEN;           } },
	CLOSING:        { get: function () { return this._ws.CLOSING;        } },
	CLOSED:         { get: function () { return this._ws.CLOSED;         } },

	binaryType: {
		get: function () {
			return this._ws.binaryType;
		},
		set: function (type) {
			this._binaryType = type;
			this._ws.binaryType = type;
		}
	},

	reconnectionDelay: {
		get: function () {
			return this._reconnectionDelay;
		},
		set: function (delay) {
			this._reconnectionDelay = delay;
		}
	}
});


/**
 * Public API.
 */


WebSocketWrapper.prototype.send = function (data) {
	this._ws.send(data);
};


WebSocketWrapper.prototype.close = function (code, reason) {
	if (this._closed) {
		return;
	}

	debug('close() | [code:%s, reason:%s]', code, reason);

	this._closed = true;

	// Stop the reconnection timer.
	clearTimeout(this._reconnectionTimer);

	try {
		this._ws.close(code || 1000, reason || 'user closure');
	} catch (error) {
		debugerror('close() failed: %o', error);
	}
};


/**
 * Private API.
 */


function createWebSocket(url, protocols, origin, headers, requestOptions, clientConfig) {
	var self = this;

	this._ws = new W3CWebSocket(url, protocols, origin, headers, requestOptions, clientConfig);

	this._ws.onopen = function (e) {
		// First connection.
		if (!self._isReconnecting) {
			debug('firing "open"');

			self.dispatchEvent(e);
		// Reconnection.
		} else {
			if (self.onreconnect || self._listeners.reconnect) {
				debug('reconnected, firing "reconnect"');

				self.dispatchEvent(new yaeti.Event('reconnect'));
			} else {
				debug('reconnected, firing "open"');

				self.dispatchEvent(e);
			}
		}
	};

	this._ws.onerror = function (e) {
		debug('firing "error"');

		self._hasError = true;
		self.dispatchEvent(e);
	};

	this._ws.onclose = function (e) {
		debug('firing "close" | [code:%s, reason:"%s", wasClean:%s]', e.code, e.reason, e.wasClean);

		try {
			self.dispatchEvent(e);
		} catch (error) {}

		// Don't try to reconnect if we closed the connection or an error happened while connecting.
		if (self._closed || self._hasError) {
			return;
		}

		self._hasError = false;

		if (self._reconnectionDelay) {
			debug('will try to reconnect in %s ms', self._reconnectionDelay);

			self._reconnectionTimer = setTimeout(function () {
				debug('reconnecting ...');

				self._isReconnecting = true;
				createWebSocket.apply(self, self.args);
			}, self._reconnectionDelay);
		}
	};

	this._ws.onmessage = function (e) {
		self.dispatchEvent(e);
	};

	// Set previous binaryType if this is a reconnection.
	if (this._binaryType) {
		this._ws.binaryType = this._binaryType;
	}
}
