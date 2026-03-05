'use strict';

const WebSocket = require('ws');
const { NetworkError } = require('./errors');

const WS_URL = 'wss://sync.builtwith.com';

/**
 * Connect to the BuiltWith live feed WebSocket.
 * @param {string} key - API key
 * @param {object} opts - { onMessage, onError, onClose, debug }
 * @returns {{ close: Function }} - Object with close() to disconnect
 */
function connect(key, opts = {}) {
  const { onMessage, onError, onClose, debug } = opts;

  const url = `${WS_URL}?KEY=${encodeURIComponent(key)}`;
  if (debug) process.stderr.write(`[debug] WS connect: ${WS_URL}?KEY=REDACTED\n`);

  const ws = new WebSocket(url);

  ws.on('open', () => {
    if (debug) process.stderr.write('[debug] WS connection opened\n');
  });

  ws.on('message', (data) => {
    try {
      const parsed = JSON.parse(data.toString());
      if (onMessage) onMessage(parsed);
    } catch (_) {
      // Pass raw data if not JSON
      if (onMessage) onMessage({ raw: data.toString() });
    }
  });

  ws.on('error', (err) => {
    if (debug) process.stderr.write(`[debug] WS error: ${err.message}\n`);
    if (onError) onError(new NetworkError(`WebSocket error: ${err.message}`));
  });

  ws.on('close', (code, reason) => {
    if (debug) process.stderr.write(`[debug] WS closed: ${code} ${reason}\n`);
    if (onClose) onClose(code, reason);
  });

  return {
    close() {
      ws.close();
    },
  };
}

module.exports = { connect };
