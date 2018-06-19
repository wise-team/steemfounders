let CronJob = require('cron').CronJob;
let steem = require('steem');

let latest = [];

module.exports.getLatest = () => {
    return latest;
}