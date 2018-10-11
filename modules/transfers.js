let CronJob = require('cron').CronJob;
let steem = require('steem');

let SteemAmountSent = 0;

module.exports.initialize = () => {
    console.log(" * Transfers module initialized");
    countTransfersFromBlockchain();
    new CronJob('*/10 * * * *', function () { countTransfersFromBlockchain() }, null, true, 'America/Los_Angeles');
}

module.exports.getSteemAmountSent = () => {
    return SteemAmountSent;
}

function countTransfersFromBlockchain () {
    steem.api.getAccountHistory('steemfounders', -1, 10000, function (err, result) {
        if (!err && result) {
            let sum = 0;
            result.forEach(res => {
                let operation = res[1]['op'][0];
                if (operation == 'transfer') {
                    let from = res[1]['op'][1].from;
                    let amount = res[1]['op'][1].amount;
                    if (from == 'steemfounders') {
                        sum += parseFloat(amount);
                    }
                }
            })
            SteemAmountSent = sum.toFixed(3);
        }
    });
}

