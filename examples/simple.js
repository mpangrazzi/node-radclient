
/**
 * Module dependencies
 */

var radclient = require('..');
var colors = require('colors');
var path = require('path');

function random(begin, end) {
  return Math.floor(Math.random() * (end - begin + 1 ) + begin);
}

// Sample Access-Request packet

var packet = {
  code: 'Access-Request',
  secret: 'd3ath$t@r_Rd',
  identifier: random(0, 255),
  attributes: [
    ['NAS-IP-Address', '192.168.10.39'],
    ['User-Name', 'utente'],
    ['User-Password', 'uccellone231']
  ]
};

// Options

var options = {
  host: '192.168.100.102',
  dictionaries: path.join(__dirname, '../dictionaries')
};

// Go!

radclient(packet, options, function(err, response) {
  console.log('Error'.bold.white);
  console.log(err);

  if (response) {
    console.log('\nResponse'.bold.cyan);
    console.log(response);

    console.log('\nAttributes'.bold.green);
    console.log(response.attributes);
  }

});
