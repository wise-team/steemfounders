let CronJob = require('cron').CronJob;
let steem = require('steem');

let latest = [];

module.exports.getLatest = () => {
    return latest;
}

function FetchLatestFromBlockchain() {

    var query = {
        tag: 'steemfounders',
        limit: 6
    };

    steem.api.getDiscussionsByBlog(
        query,
        function (err, result) {

            if (!err && result) {
                latest = [];

                result.forEach(post => {
                    let newPost = {
                        title: post.title.replace('[New author\'s introduction] ',''),
                        body: post.body.substring(120, 0),
                        permlink: post.permlink
                    };
                    
                    if(post.json_metadata) {
                        let metadata = JSON.parse(post.json_metadata);
                        if(metadata) {
                            newPost.image = metadata.image[0];
                        }
                    }
                    latest.push(newPost);
                });
            }
        });
}

module.exports.initialize = () => {
    
    new CronJob('* * * * *', function () { FetchLatestFromBlockchain() }, null, true, 'America/Los_Angeles');
}