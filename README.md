radclient
============

Send packets to a [RADIUS](http://en.wikipedia.org/wiki/RADIUS) server and show reply.

This is a porting of [radclient](http://freeradius.org/radiusd/man/radclient.xhtml) utility to [node.js](http://nodejs.org), built on top of [node-radius](https://github.com/retailnext/node-radius) module.

## Examples

See `/examples` folder. But basically:

```js

var radclient = require('radclient');

// Sample Access-Request packet

var packet = {
  code: 'Access-Request',
  secret: 's3cr3t',
  identifier: 123,
  attributes: [
    ['NAS-IP-Address', '192.168.1.10'],
    ['User-Name', 'john'],
    ['User-Password', 'doe']
  ]
};

// Options

var options = {
  host: '192.168.1.20',
  timeout: 2000,
  retries: 3
};

// Go!

radclient(packet, options, function(err, response) {

  console.log(response);

  // ...

});

```

## radclient(packet, options, callback)

* `packet` (object|buffer): a RADIUS packet. You can pass an object with the args of [radius.encode](https://github.com/retailnext/node-radius#radiusencodeargs) function, or directly the encoded packet.

* `options` (object): radclient available options. They are:

    * `host` (string): RADIUS host (required)

    * `port` (number): RADIUS port (optional, default `1812`)

    * `timeout` (number): number of ms to wait for a RADIUS response before raising an ETIMEDOUT error (optional, default `2500`)

    * `retries` (number): number of times to retry to send packet again after a ETIMEDOUT error (optional, default `3`)

    * `dictionaries` (string): path for a folder with custom or vendor-specific RADIUS dictionaries (optional)

* `callback` (function): default `callback(err, response)` (required).

## Test

```bash
npm test
```

## Debug

This library is builded with [debug](https://github.com/visionmedia/debug) module.

If you want to see what's going on under the hood, simply prepend `DEBUG=radclient*` to your script execution.

With the provided example, you can simply do:

```bash
DEBUG=radclient* node examples/simple
```

## License

The MIT License (MIT)

Copyright (c) 2015 Michele Pangrazzi <<xmikex83@gmail.com>>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

