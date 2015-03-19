
/**
 * Module dependencies
 */

var path = require('path');

var radclient = require('..');
var radserver = require('./server');

var noop = function() {};
var radport = 60000;

function random(begin, end) {
  return Math.floor(Math.random() * (end - begin + 1 ) + begin);
}

var packet = {
  code: 'Access-Request',
  secret: 's€cre3t',
  identifier: random(0, 255),
  attributes: [
    ['NAS-IP-Address', '192.168.10.39'],
    ['User-Name', 'utente'],
    ['User-Password', 'uccellone231']
  ]
};


describe('radclient', function() {

  before(function(done) {
    radserver.bind(60000, '127.0.0.1', done);
  });

  after(function(done) {
    radserver.close(done);
  });


  it('Should throw if `host` option is missing', function() {
    var exception;

    try {
      radclient(packet, {});
    } catch(e) { exception = e; }

    exception.message.should.equal('option `host` must be a string');
  });


  it('Should throw if `callback` option is missing', function() {
    var exception;

    try {
      radclient(packet, { host: '192.168.100.102' });
    } catch(e) { exception = e; }

    exception.message.should.equal('option `callback` must be a function');
  });


  it('Should throw if `retries` option is not a number', function() {
    var exception;

    try {
      var options = {
        host: '192.168.100.102',
        retries: 'test'
      };

      radclient(packet, options, noop);
    } catch(e) { exception = e; }

    exception.message.should.equal('option `retries` must be a number');
  });


  it('Should throw if `timeout` option is not a number', function() {
    var exception;

    try {
      var options = {
        host: '192.168.100.102',
        timeout: 'test'
      };

      radclient(packet, options, noop);
    } catch(e) { exception = e; }

    exception.message.should.equal('option `timeout` must be a number');
  });


  it('Should retry specified times if an error is encountered', function(done) {
    var options = {
      host: '192.168.100.102',
      retries: 3,
      timeout: 1000,
      dictionaries: path.join(__dirname, '../dictionaries')
    };

    radclient(packet, options, function(err, res) {
      err.message.should.equal('Maximum retries exceeded');
      done();
    });
  });


  it('Should callback with error if packet is incorrect', function(done) {
    var options = {
      host: '192.168.100.102',
      retries: 3,
      timeout: 1000,
      dictionaries: path.join(__dirname, '../dictionaries')
    };

    radclient({packet: 'invalid'}, options, function(err, res) {
      err.should.be.ok;
      (!res).should.be.true;
      done();
    });
  });


  it('Should send a packet correctly', function(done) {
    var options = {
      host: '127.0.0.1',
      port: radport,
      retries: 3,
      timeout: 1000,
      dictionaries: path.join(__dirname, '../dictionaries')
    };

    radclient(packet, options, function(err, res) {
      res.code.should.equal('Access-Accept');
      res.attributes['Vendor-Specific']['WISPr-Location-ID'].should.equal('Test');
      done();
    });
  });

});
