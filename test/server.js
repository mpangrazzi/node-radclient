/**
 * Module dependencies
 */

var dgram = require('dgram');
var debug = require('debug')('radclient:test-server');
var radius = require('radius');
var socket = dgram.createSocket('udp4');
var path = require('path');

var radsecret = 's€cre3t';

radius.add_dictionary(path.join(__dirname, '../dictionaries'));


// This a fake RADIUS server used for tests

exports.bind = function(port, host, callback) {

  socket.on('message', function(msg, rinfo) {

    var packet = radius.decode({
      packet: msg,
      secret: radsecret
    });

    debug('RADIUS server received message', packet);

    var response = radius.encode_response({
      packet: packet,
      secret: radsecret,
      code: 'Access-Accept',
      attributes: [
        ['Idle-Timeout', '300'],
        ['Vendor-Specific', 'WISPr', [
          ['WISPr-Location-ID', 'Test'],
          ['WISPr-Bandwidth-Max-Down', '2048000'],
          ['WISPr-Bandwidth-Max-Up', '2048000']
        ]],
        ['Session-Timeout', '12600']
      ]
    });

    this.send(response, 0, response.length, rinfo.port, rinfo.address, function(err, bytes) {
      debug('RADIUS server answered');
    });

  });

  socket.on('listening', function() {
    debug('RADIUS server listening on port %s', port);
    callback();
  });

  socket.bind(port);

};


exports.close = function(callback) {
  socket.close();
  callback();
};
