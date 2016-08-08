var debug = require('debug')('WebSocketWrapper');
var debugerror = require('debug')('WebSocketWrapper:ERROR');
var yaeti = require('yaeti');

debugerror.log = console.warn.bind(console);

function WebSocketWrapper()
{
	debug('new() [url:"%s", protocol:%s]', arguments[0], arguments[1]);

	// Make this an EventTarget
	yaeti.EventTarget.call(this);

	// Store arguments
	this._args = arguments;

	// The native WebSocket instance
	this._ws = null;

	// Create the native WebSocket
	createWebSocket.apply(this, this._args);

	// Flag indicating that WebSocket is closed by us
	this._closed = false;

	// Reconnecting flag
	this._isReconnecting = false;

	// Reconnection timer
	this._reconnectionTimer = null;

	// Reconnection delay
	this._reconnectionDelay = 5000;
	this._currentReconnectionDelay = this._reconnectionDelay;
}

Object.defineProperties(WebSocketWrapper.prototype,
	{
		url:            { get: function() { return this._ws.url;            } },
		readyState:     { get: function() { return this._ws.readyState;     } },
		protocol:       { get: function() { return this._ws.protocol;       } },
		extensions:     { get: function() { return this._ws.extensions;     } },
		bufferedAmount: { get: function() { return this._ws.bufferedAmount; } },

		CONNECTING:     { get: function() { return this._ws.CONNECTING;     } },
		OPEN:           { get: function() { return this._ws.OPEN;           } },
		CLOSING:        { get: function() { return this._ws.CLOSING;        } },
		CLOSED:         { get: function() { return this._ws.CLOSED;         } },

		binaryType:
		{
			get: function()
			{
				return this._ws.binaryType;
			},
			set: function(type)
			{
				this._binaryType = type;
				this._ws.binaryType = type;
			}
		},

		reconnectionDelay:
		{
			get: function()
			{
				return this._reconnectionDelay;
			},
			set: function(delay)
			{
				this._reconnectionDelay = delay;
				this._currentReconnectionDelay = delay;
			}
		}
	});

WebSocketWrapper.prototype.send = function(data)
{
	this._ws.send(data);
};

WebSocketWrapper.prototype.close = function(code, reason)
{
	if (this._closed)
		return;

	debug('close() [code:%s, reason:%o]', code, reason);

	this._closed = true;

	// Stop the reconnection timer
	clearTimeout(this._reconnectionTimer);

	try
	{
		this._ws.close(code || 1000, reason || 'user closure');
	}
	catch (error)
	{
		debugerror('close() failed: %o', error);
	}
};

function createWebSocket(url, protocols)
{
	var self = this;

	this._ws = new WebSocket(url, protocols);

	// Set previous binaryType if this is a reconnection
	if (this._binaryType)
		this._ws.binaryType = this._binaryType;

	this._ws.onopen = function(e)
	{
		// Reset current reconnection delay to the original value
		this._currentReconnectionDelay = this._reconnectionDelay;

		// First connection
		if (!self._isReconnecting)
		{
			debug('"open" event');

			self.dispatchEvent(e);
		}
		// Reconnection
		else
		{
			if (self.onreconnect || self._listeners.reconnect)
			{
				debug('"open" event (emitting "reconnect")');

				self.dispatchEvent(new yaeti.Event('reconnect'));
			}
			else
			{
				debug('"open" event');

				self.dispatchEvent(e);
			}
		}
	};

	this._ws.onerror = function(e)
	{
		debug('"error" event');

		self.dispatchEvent(e);
	};

	this._ws.onclose = function(e)
	{
		debug('"close" event| [code:%s, reason:%o, wasClean:%s]', e.code, e.reason, e.wasClean);

		try
		{
			self.dispatchEvent(e);
		}
		catch (error) {}

		// Don't try to reconnect if we closed the connection
		if (self._closed)
			return;

		if (self._reconnectionDelay)
		{
			debug('reconnecting in %s ms', self._currentReconnectionDelay);

			self._reconnectionTimer = setTimeout(function()
			{
				// Don't try to reconnect if we closed the connection
				if (self._closed)
					return;

				debug('reconnecting...');

				self._isReconnecting = true;
				createWebSocket.apply(self, self._args);
			}, self._currentReconnectionDelay);

			// Update current reconnecting delay
			self._currentReconnectionDelay = Math.min(self._currentReconnectionDelay * 1.5, 30000);
		}
	};

	this._ws.onmessage = function(e)
	{
		self.dispatchEvent(e);
	};
}

module.exports = WebSocketWrapper;
