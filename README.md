# A Node.js HyperStake Client

![HyperStake](https://raw2.github.com/zeewolfik/node-hyperstake/master/node-hyperstake.png)

node-hyperstake is a HyperStake client for Node.js. It is a fork of node-dogecoin client (see fork) intended for use with HyperStake. The purpose of this repository is:

* Provide a one-stop resource for the Node.js developer to get started with HyperStake integration.
* Prevent would-be HyperStake web developers worrying whether a DogeCoin client will work out of the box.
* Promote Node.js development of Hyperstake web apps.
* Identify and address any incompatibilities with the Hyperstake APIs that exist now and/or in the future.

## Dependencies

You'll need a running instance of [hyperstaked](https://github.com/hyperstake/hyperstake) to connect with.

Then, install the node-hyperstake NPM package.

`npm install node-hyperstake`

## Examples

```js
var hyperstake = require('node-hyperstake')()

hyperstake.auth('myusername', 'mypassword')

hyperstake.getDifficulty(function() {
    console.log(arguments);
})

```

## Options

You may pass options to the initialization function or to the `set` method.

```js

var hyperstake = require('hyperstake')({
    user:'user'
})

hyperstake.set('pass', 'somn')
hyperstake.set({port:22555})

```

Available options and default values:

+ host *127.0.0.1*
+ port *45443*
+ user
+ pass
+ passphrasecallback
+ https
+ ca

### Passphrase Callback

With an encryped wallet, any operation that accesses private keys requires a wallet unlock. A wallet is unlocked using the `walletpassphrase <passphrase> <timeout>` JSON-RPC method: the wallet will relock after `timeout` seconds.

You may pass an optional function `passphrasecallback` to the `node-hyperstake` initialization function to manage wallet unlocks. `passphrasecallback` should be a function accepting three arguments:

    function(command, args, callback) {}

+ **command** is the command that failed due to a locked wallet.
+ **args** is the arguments for the failed command.
+ **callback** is a typical node-style continuation callback of the form `function(err, passphrase, timeout) {}`. Call callback with the wallet passphrase and desired timeout from within your passphrasecallback to unlock the wallet.

You may hard code your passphrase (not recommended) as follows:

```js
var hyperstake = require('node-hyperstake')({
    passphrasecallback: function(command, args, callback) {
        callback(null, 'passphrase', 30);
    }
})
```

Because `passphrasecallback` is a continuation, you can retrieve the passphrase in an asynchronous manner. For example, by prompting the user:

```js
var readline = require('readline')

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

var hyperstake = require('node-hyperstake')({
  passphrasecallback: function(command, args, callback) {
    rl.question('Enter passphrase for "' + command + '" operation: ', function(passphrase) {
      if (passphrase) {
        callback(null, passphrase, 1)
      } else {
        callback(new Error('no passphrase entered'))
      }
    })
  }
})
```

### Secure RPC with SSL

By default `hyperstaked` exposes its JSON-RPC interface via HTTP; that is, all RPC commands are transmitted in plain text across the network! To secure the JSON-RPC channel you can supply `hyperstaked` with a self-signed SSL certificate and an associated private key to enable HTTPS. For example, in your `hyperstake.conf`:

    rpcssl=1
    rpcsslcertificatechainfile=/etc/ssl/certs/hyperstaked.crt
    rpcsslprivatekeyfile=/etc/ssl/private/hyperstaked.pem

In order to securely access an SSL encrypted JSON-RPC interface you need a copy of the self-signed certificate from the server: in this case `hyperstaked.crt`. Pass your self-signed certificate in the `ca` option and set `https: true` and node-hyperstake is secured!

```js
var fs = require('fs')

var ca = fs.readFileSync('hyperstaked.crt')

var hyperstake = require('node-hyperstake')({
  user: 'rpcusername',
  pass: 'rpcpassword',
  https: true,
  ca: ca
})
```
