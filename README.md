# A Node.js Reddcoin Client

![Reddcoin](https://raw2.github.com/samvaughton/node-reddcoin/master/node-reddcoin.png)

node-reddcoin is a Reddcoin client for Node.js. It is a fork of node-dogecoin client (see fork) intended for use with Reddcoin. The purpose of this repository is:

* Provide a one-stop resource for the Node.js developer to get started with Reddcoin integration.
* Prevent would-be Reddcoin web developers worrying whether a DogeCoin client will work out of the box.
* Promote Node.js development of Reddcoin web apps.
* Identify and address any incompatibilities with the Reddcoin and DogeCoin APIs that exist now and/or in the future.

## Dependencies

You'll need a running instance of [reddcoind](https://github.com/reddcoin-project/reddcoin) to connect with.

Then, install the node-reddcoin NPM package.

`npm install node-reddcoin`

## Examples

```js
var reddcoin = require('node-reddcoin')()

reddcoin.auth('myusername', 'mypassword')

reddcoin.getDifficulty(function() {
    console.log(arguments);
})

```

## Options

You may pass options to the initialization function or to the `set` method.

```js

var reddcoin = require('reddcoin')({
    user:'user'
})

reddcoin.set('pass', 'somn')
reddcoin.set({port:22555})

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

You may pass an optional function `passphrasecallback` to the `node-reddcoin` initialization function to manage wallet unlocks. `passphrasecallback` should be a function accepting three arguments:

    function(command, args, callback) {}

+ **command** is the command that failed due to a locked wallet.
+ **args** is the arguments for the failed command.
+ **callback** is a typical node-style continuation callback of the form `function(err, passphrase, timeout) {}`. Call callback with the wallet passphrase and desired timeout from within your passphrasecallback to unlock the wallet.

You may hard code your passphrase (not recommended) as follows:

```js
var reddcoin = require('node-reddcoin')({
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

var reddcoin = require('node-reddcoin')({
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

By default `reddcoind` exposes its JSON-RPC interface via HTTP; that is, all RPC commands are transmitted in plain text across the network! To secure the JSON-RPC channel you can supply `reddcoind` with a self-signed SSL certificate and an associated private key to enable HTTPS. For example, in your `reddcoin.conf`:

    rpcssl=1
    rpcsslcertificatechainfile=/etc/ssl/certs/reddcoind.crt
    rpcsslprivatekeyfile=/etc/ssl/private/reddcoind.pem

In order to securely access an SSL encrypted JSON-RPC interface you need a copy of the self-signed certificate from the server: in this case `reddcoind.crt`. Pass your self-signed certificate in the `ca` option and set `https: true` and node-reddcoin is secured!
    
```js
var fs = require('fs')

var ca = fs.readFileSync('reddcoind.crt')

var reddcoin = require('node-reddcoin')({
  user: 'rpcusername',
  pass: 'rpcpassword',
  https: true,
  ca: ca
})
```


