var http = require('http'),
    https = require('https');

var api = require('./commands'),
    errors = require('./errors');

function Client (options) {
    this.opts = {
        host: '127.0.0.1',
        port: 45443,
        method: 'POST',
        user: '',
        pass: '',
        headers: {
            'Host': 'localhost',
            'Authorization': ''
        },
        passphrasecallback: null,
        https: false,
        ca: null
    };

    if (options) {
        this.set(options)
    }
}

Client.prototype = {

    invalid: function (command) {
        var args = Array.prototype.slice.call(arguments, 1);
        var fn = args.pop();

        if (typeof fn !== 'function') {
            fn = console.log
        }

        return fn(new Error('No such command "' + command + '"'))
    },

    send: function (command) {
        var self = this;
        var commandOptions = {};

        // Due to the horrible nature of this libraries architecture we need to botch it.
        // If the first element of the command array is an object then we need to extract
        // the actual command and then process the options.

        if (command instanceof Object) {
            commandOptions = command;
            command = commandOptions.command;
        }

        var args = Array.prototype.slice.call(arguments, 1);
        var callbackFunction;

        if (typeof args[args.length - 1] === 'function') {
            callbackFunction = args.pop().bind(this);
        } else {
            callbackFunction = console.log;
        }

        var rpcData = JSON.stringify({
            id: new Date().getTime(), method: command.toLowerCase(), params: args
        });

        var options = this.opts;
        options.headers['Content-Length'] = rpcData.length;

        var request;
        if (options.https === true) {
            request = https.request;
        } else {
            request = http.request;
        }

        var req = request(options, function (res) {
            var data = '';
            res.setEncoding('utf8');

            res.on('data', function (chunk) {
                data += chunk;
            });

            res.on('end', function () {

                try {
                    data = JSON.parse(data);
                } catch (exception) {

                    var errMsg = res.statusCode !== 200 ? 'Invalid params ' + res.statusCode : 'Failed to parse JSON';

                    errMsg += ' : ' + JSON.stringify(data);
                    return callbackFunction(new Error(errMsg));
                }

                if (data.error) {
                    if (data.error.code === errors.RPC_WALLET_UNLOCK_NEEDED && options.passphrasecallback) {
                        return self.unlock(command, args, false, callbackFunction);
                    } else if (data.error.code === errors.RPC_WALLET_ALREADY_UNLOCKED_STAKING_ONLY && options.passphrasecallback) {
                        return self.unlock(command, args, true, callbackFunction);
                    } else {
                        var err = new Error(JSON.stringify(data));
                        err.code = data.error.code;
                        return callbackFunction(err);
                    }
                }

                var result = (data.result !== null) ? data.result : data;

                callbackFunction(null, result);

                // Now lets handle the unlockToStaking function
                if (commandOptions.unlockToStaking !== undefined && commandOptions.unlockToStaking) {
                    // We need to relock incase the wallet hasn't already been locked back up from walletpassphrase command
                    self.send('walletlock', function() {
                        self.send('walletpassphrase', commandOptions.walletPassword, 99999999, true, function (err, result) {
                            commandOptions.walletPassword = null;
                        });
                    });
                }
            });
        });

        req.on('error', callbackFunction);
        req.end(rpcData);

        return this;
    },

    exec: function (command) {
        var func = api.isCommand(command) ? 'send' : 'invalid';

        return this[func].apply(this, arguments);
    },

    auth: function (user, pass) {
        if (user && pass) {
            this.opts.headers['Authorization'] = ('Basic ') + new Buffer(user + ':' + pass).toString('base64');
        }

        return this;
    },

    unlock: function (command, args, stakingUnlock, fn) {
        var self = this;

        var walletPassword = null;

        var retry = function (rpcError) {
            if (rpcError) {

                fn(rpcError);

            } else {

                var sendArgs = args.slice();

                // If we need to unlock back to staking then we will modify
                // the command to be an object, which will be picked up by
                // send. Which will handle it from there.

                // We can use the wallet password as it gets set before this function is called
                // its a weird event of functions being called.
                if (stakingUnlock) {
                    command = {
                        command: command,
                        unlockToStaking: stakingUnlock,
                        walletPassword: walletPassword
                    }
                }

                sendArgs.unshift(command);
                sendArgs.push(fn);

                // The apply() method calls a function with a given this value and arguments provided as an array.
                // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply

                self.send.apply(self, sendArgs);

                // Clear it immediately, don't know enough about JS to know if this is useless.
                walletPassword = null;

            }
        };

        // The line below calls the user specific callback with the 3 arguments: command, args, callback
        // Once the user has finished retrieving the passphrase, the callback will be called to complete
        // the actual command wanting to be performed in the first place.

        this.opts.passphrasecallback(command, args, function (error, passphrase, timeout, staking) {

            // Set the variable above as we need to use it in case of needing to re-unlock the wallet
            // back to staking mode.
            walletPassword = passphrase;

            // The application has called the actual "callback" parameter within their custom callback.

            if (staking == null || staking == undefined) {
                staking = false;
            }

            // If the wallet was currently staking we need to perform a few more steps.
            // 1. Lock the wallet
            // 2. Send the password to properly unlock it
            // 3. Actually send the command
            // 4. After the command, we need to re-unlock it to staking mode

            var handleRetry = function () {
                if (error) {
                    fn(error);
                } else {
                    // Send the unlock, and set the callback to the retry function which will
                    // re-call the original RPC command we intended.
                    self.send('walletpassphrase', passphrase, timeout, staking, retry);
                }
            };

            if (stakingUnlock) {
                // Since the wallet is partially locked, we have to lock it back to fully unlock it (logic)
                self.send('walletlock', function (err, info) {
                    handleRetry();
                });
            } else {
                // Since the wallet is locked fully, we will call it normally to unlock it
                handleRetry();
            }

        });
    },

    set: function (k, v) {
        var type = typeof(k);

        if (typeof(k) === 'object') {
            for (var key in k) {
                if (!k.hasOwnProperty(key)) {
                    continue; // Check
                }

                this.set(key, k[key]);
            }
            return;
        }

        var opts = this.opts;
        k = k.toLowerCase();

        if (opts.hasOwnProperty(k)) {
            opts[k] = v;
            if (/^(user|pass)$/.test(k)) {
                this.auth(opts.user, opts.pass)
            } else if (k === 'host') {
                opts.headers['Host'] = v
            } else if (k === 'passphrasecallback' ||
                k === 'https' ||
                k === 'ca') {
                opts[k] = v
            }
        }

        return this;
    },

    get: function (k) {
        //Special case for booleans
        if (this.opts[k] === false) {
            return false;
        } else {
            if (this.opts[k] !== false) {
                var opt = this.opts[k.toLowerCase()]
            }
            return  opt; //new Error('No such option "'+k+'" exists');
        }
    },

    errors: errors

};

api.commands.forEach(function (command) {
    var cp = Client.prototype;
    var tlc = [command.toLowerCase()];

    cp[command] = cp[tlc] = function () {
        cp.send.apply(this, tlc.concat(([]).slice.call(arguments)));
    };
});

module.exports = function (options) {
    return new Client(options)
};
