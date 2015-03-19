
/**
 * Module dependencies
 */

var debug = require('debug')('radclient');
var radius = require('radius');
var dgram = require('dgram');
var fs = require('fs');
var path = require('path');
var util = require('util');

const RADIUS_PORT = 1812;
const DEFAULT_RETRIES = 3;
const DEFAULT_TIMEOUT = 2500;


/**
 * Send packet to RADIUS server with options
 *
 * @param  {object}   packet
 * @param  {object}   options
 * @callback onSuccess
 */

module.exports = function(packet, options, callback) {

  if (typeof options.host !== 'string') {
    throw new TypeError('option `host` must be a string');
  }

  if (typeof callback !== 'function') {
    throw new TypeError('option `callback` must be a function');
  }

  if (options.retries && typeof options.retries !== 'number') {
    throw new TypeError('option `retries` must be a number');
  }

  if (options.timeout && typeof options.timeout !== 'number') {
    throw new TypeError('option `timeout` must be a number');
  }

  if (options.dictionaries && typeof options.dictionaries !== 'string') {
    throw new TypeError('option `dictionaries` must be a string');
  }

  // Handling retries

  var retries = +options.retries || DEFAULT_RETRIES;

  var check = function(err, response) {

    if (err && err.retryable && --retries) {
      debug('Retries left: [%s]', retries);
      send(packet, options, check);
    } else {
      if (!retries) err = new Error('Maximum retries exceeded');
      callback(err, response);
    }

  };

  send(packet, options, check);

};


function send(packet, options, callback) {

  var localPort = +options.localPort || getEphemeralPort();
  var port = +options.port || RADIUS_PORT;
  var host = options.host;
  var ms = +options.timeout || DEFAULT_TIMEOUT;

  // add dictionaries (if needed)

  if (options.dictionaries) {
    radius.add_dictionary(options.dictionaries);
  }

  // Init timeout

  var t = setTimeout(function() {
    if (socket) socket.close();
    debug('ETIMEDOUT');

    var err = new Error('ETIMEDOUT');
    err.retryable = true;

    return callback(err);
  }, ms);

  var socket = dgram.createSocket('udp4');

  // Generic error handler

  socket.on('error', function(err) {
    return callback(err);
  });

  // Message handler

  socket.on('message', function(msg, rinfo) {

    debug('Received RADIUS response', rinfo);

    // Closing socket since we don't need it anymore

    socket.close();

    // Decode and verify RADIUS response

    var response = null;

    try {
      response = radius.decode({ packet: msg, secret: options.secret });
    } catch(e) {
      return callback(e);
    }

    debug('Decoded RADIUS response', response);

    var isValid = radius.verify_response({
      response: msg,
      request: encPacket,
      secret: packet.secret
    });

    debug('Response is %s', isValid ? 'valid' : 'invalid');

    if (!isValid) return callback(new Error('RADIUS response is invalid'));

    callback(null, response);
    clearTimeout(t);

  });

  // Send packet after binding is done (listening)

  socket.on('listening', function() {

    debug('Socket binded on port %s', localPort);

    this.send(encPacket, 0, encPacket.length, port, host, function(err, bytes) {
      if (err) return callback(err);
      debug('Sent %s bytes to %s:%s', bytes, host, port);
    });

  });

  // Encoding packet

  debug('Encoding packet %j', packet);

  try {
    var encPacket = radius.encode(packet);
  } catch(e) {
    debug('Failed to encode packet', e);
    return callback(e);
  }

  // Bind on localPort

  socket.bind(localPort);

}


/**
 * Get an Ephemeral Port
 * http://en.wikipedia.org/wiki/Ephemeral_port
 *
 * @return {number}
 */

function getEphemeralPort() {
  var begin = 49152;
  var end = 65535;

  return Math.floor(Math.random() * (end - begin + 1 ) + begin);
}
