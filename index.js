/**
 * Expose the WebSocketWrapper class.
 */
module.exports = WebSocketWrapper;


/**
 * Dependencies.
 */
var debug = require('debug')('WebSocketWrapper');
var debugerror = require('debug')('WebSocketWrapper:ERROR');
debugerror.log = console.warn.bind(console);
// 'websocket' module uses the native WebSocket interface when bundled to run in a browser.
var W3CWebSocket = require('websocket').w3cwebsocket;


function WebSocketWrapper(url, protocols, origin, headers, requestOptions, clientConfig) {
	debug('new() | [url:%s, protocols:%s]', url, protocols);

	var self = this;

	// Create the native WebSocket instance.
	this.createWebSocket = function() {
		this.ws = new W3CWebSocket(url, protocols, origin, headers, requestOptions, clientConfig);

		this.ws.onopen = function(e) {
			_onopen.call(self, e);
		};

		this.ws.onerror = function(e) {
			_onerror.call(self, e);
		};

		this.ws.onclose = function(e) {
			_onclose.call(self, e);
		};

		if (this._onmessage) {
			this.ws.onmessage = this._onmessage;
		}

		if (this._binaryType) {
			this.ws.binaryType = this._binaryType;
		}
	};

	this.createWebSocket();

	// Flag indicating that WebSocket is closed by us.
	this.closed = false;

	// Flag indicating that an error happened while connecting.
	this.hasError = false;

	// Reconnecting flag.
	this.isReconnecting = false;

	// Reconnection timer.
	this.reconnectionTimer = null;

	// Reconnection delay.
	this.reconnectionDelay = 2000;
}


// Expose W3C WebSocket attributes.
Object.defineProperties(WebSocketWrapper.prototype, {
    url:            { get: function() { return this.ws.url;            } },
    readyState:     { get: function() { return this.ws.readyState;     } },
    protocol:       { get: function() { return this.ws.protocol;       } },
    extensions:     { get: function() { return this.ws.extensions;     } },
    bufferedAmount: { get: function() { return this.ws.bufferedAmount; } },

    CONNECTING:     { get: function() { return this.ws.CONNECTING;     } },
    OPEN:           { get: function() { return this.ws.OPEN;           } },
    CLOSING:        { get: function() { return this.ws.CLOSING;        } },
    CLOSED:         { get: function() { return this.ws.CLOSED;         } },

    // TODO: set when reconnected
    binaryType: {
        get: function() {
            return this.ws.binaryType;
        },
        set: function(type) {
        	this._binaryType = type;
            this.ws.binaryType = type;
        }
    },

    onmessage: {
    	get: function() {
    		return this.ws.onmessage;
    	},
    	set: function(handler) {
    		this._onmessage = handler;
    		this.ws.onmessage = handler;
    	}
    }
});


/**
 * Public API.
 */


WebSocketWrapper.prototype.send = function(data) {
	this.ws.send(data);
};


WebSocketWrapper.prototype.close = function(code, reason) {
	debug('close() | [code:%s, reason:%s]', code, reason);

	if (this.closed) { return; }
	this.closed = true;

	// Reset events.
	this.onopen = null;
	this.onerror = null;
	this.onmessage = null;

	// Stop the reconnection timer.
	clearTimeout(this.reconnectionTimer);

	if (this.ws.readyState === this.ws.OPEN) {
		try {
			this.ws.close(code, reason);
		} catch(error) {
			debugerror('close() | error closing the WebSocket: %o', error);
		}
	}
	else if (this.ws.readyState === this.ws.CONNECTING) {
		var ws = this.ws;

		ws.onopen = function() {
			try { ws.close(code, reason); } catch(error) {}
		};
	}
};


WebSocketWrapper.prototype.setReconnectionDelay = function(delay) {
	this.reconnectionDelay = delay;
};


/**
 * Private API.
 */


function _onopen(e) {
	// First connection.
	if (! this.isReconnecting) {
		debug('onopen()');

		if (this.onopen) {
			this.onopen(e);
		}
	}
	// Reconnection.
	else {
		debug('onreconnect()');

		if (this.onreconnect) {
			this.onreconnect(e);
		}
		else if (this.onopen) {
			this.onopen(e);
		}
	}
}


function _onerror(e) {
	debugerror('onerror() | event: %o', e);

	this.hasError = true;

	if (this.onerror) {
		this.onerror(e);
	}
}


function _onclose(e) {
	debug('onclose() | [code:%s, reason:"%s", wasClean:%s]', e.code, e.reason, e.wasClean);

	var self = this;

	if (this.onclose) {
		this.onclose(e);
	}

	// Don't try to reconnect if we closed the connection.
	if (this.closed) { return; }

	// Don't try to reconnect if an error happened while connecting.
	if (this.hasError) { return; }
	this.hasError = false;

	if (this.reconnectionDelay) {
		this.reconnectionTimer = setTimeout(function() {
			debug('reconnecting ...');

			self.isReconnecting = true;
			self.createWebSocket();
		}, this.reconnectionDelay);
	}
}
