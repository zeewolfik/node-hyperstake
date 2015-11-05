var commands = module.exports.commands = [
    // v1.0.7.1
    'addMultiSigAddress', // <nrequired> <'["key","key"]'> [account]
    'addNode', // <node> <add|remove|onetry>
    'backupWallet', // <destination>
    'checkWallet',
    'createRawTransaction', // [{"txid":txid,"vout":n},...] {address:amount,...}
    'decodeRawTransaction', // <hex string>
    'delete', // <address>
    'dumpPrivKey', // <HyperStakeaddress>
    'exportDifficulty', // <interval> <directory>
    'getAccount', // <HyperStakeaddress>
    'getAccountAddress', // <account>
    'getAddedNodeInfo', // <dns> [node]
    'getAddressesByAccount', // <account>
    'getBalance', // [account] [minconf=1]
    'getBlock', // <hash> [txinfo]
    //'getBlock', // <number> [txinfo]
    'getBlockCount',
    'getBlockHash', // <index>
    'getblockTemplate', // [params]
    'getCheckpoint',
    'getConnectionCount',
    'getDifficulty',
    'getGenerate',
    'getHashesPerSec',
    'getInfo',
    'getMiningInfo',
    'getMoneySupply', // [height]
    'getNewAddress', // [account]
    'getNewPubKey', // [account]
    'getpeerinfo',
    'getrawmempool', //
    'getrawtransaction', // <txid> [verbose=0]
    'getreceivedbyaccount', // <account> [minconf=1]
    'getreceivedbyaddress', // <HyperStakeaddress> [minconf=1]
    'getstaketx', // <txid>
    'gettransaction', // <txid>
    'getwork', // [data]
    'getworkex', // [data, coinbase]
    'help', // [command]
    'importprivkey', // <HyperStakeprivkey> [label]
    'keypoolrefill', //
    'listaccounts', // [minconf=1]
    'listaddressgroupings', //
    'listreceivedbyaccount', // [minconf=1] [includeempty=false]
    'listreceivedbyaddress', // [minconf=1] [includeempty=false]
    'listsinceblock', // [blockhash] [target-confirmations]
    'listtransactions', // [account] [count=10] [from=0]
    'listunspent', // [minconf=1] [maxconf=9999999] ["address",...]
    'makekeypair', // [prefix]
    'moneysupply', //
    'move', // <fromaccount> <toaccount> <amount> [minconf=1] [comment]
    'repairwallet', //
    'resendtx', //
    'reservebalance', // [<reserve> [amount]]
    'sendalert', // <message> <privatekey> <minver> <maxver> <priority> <id> [cancelupto]
    'sendfrom', // <fromaccount> <toHyperStakeaddress> <amount> [minconf=1] [comment] [comment-to]
    'sendmany', // <fromaccount> {address:amount,...} [minconf=1] [comment]
    'sendrawtransaction', // <hex string>
    'sendtoaddress', // <HyperStakeaddress> <amount> [comment] [comment-to]
    'setaccount', // <HyperStakeaddress> <account>
    'setgenerate', // <generate> [genproclimit]
    'settxfee', // <amount>
    'signmessage', // <HyperStakeaddress> <message>
    'signrawtransaction', // <hex string> [{"txid":txid,"vout":n,"scriptPubKey":hex},...] [<privatekey1>,...] [sighashtype="ALL"]
    'stakeforcharity', // <HyperStake Address> <percent> [Change Address] [min amount] [max amount]
    'stop', // <detach>
    'submitblock', // <hex data> [optional-params-obj]
    'validateaddress', // <HyperStakeaddress>
    'validatepubkey', // <HyperStakepubkey>
    'verifymessage', // <HyperStakeaddress> <signature> <message>
    'walletlock', //
    'walletpassphrase', // <passphrase> <timeout> [mintonly]
    'walletpassphrasechange', // <oldpassphrase> <newpassphrase>
];

module.exports.isCommand = function (command) {
    command = command.toLowerCase();
    for (var i = 0, len = commands.length; i < len; i++) {
        if (commands[i].toLowerCase() === command) {
            return true
        }
    }

    return false;
};
