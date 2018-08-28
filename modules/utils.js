
var steem = require('steem');
let getUrls = require('get-urls');
const isImage = require('is-image');

module.exports.generateToken = () => {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 36; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

module.exports.publishPostOnSteem = (post, callback) => {
  if (post) {
    if (post.body && post.title && post.tags) {
      var urls = getUrls(post.body);
      var links = [];
      var image = [];

      if(post.image && post.image != '') {
        image.push(post.image);
      }

      urls.forEach(url => {
          if (url[url.length - 1] == ')') {
              var trimmed = url.substring(0, url.length - 1);
          } else {
              var trimmed = url;
          }

          if (isImage(trimmed)) {
              image.push(trimmed);
          } else {
              links.push(trimmed);
          }
      });

      var jsonMetadata = {
        tags: post.tags.split(' '),
        app: "steemfounders/1.0",
        image: image,
        links: links,
        format: "markdown",
        moderator: post.moderator
      }
      steem.broadcast.comment(process.env.POSTING_KEY, "", post.tags.split(' ')[0], process.env.STEEM_USERNAME, post.permlink, post.title, post.body, jsonMetadata, function (err, result) {

        let post_info = post;
        setTimeout(function() {
          commentAddModeratorInfo(post_info);
        },30000);

        callback(err, result);
            
      });
    }
  }
}


function commentAddModeratorInfo(post) {
  if(post) {
    let title = 'RE: ' + post.title;
    let body = '';
    if(post.tags.split(' ')[0] == 'steemfounders-pl') {
      body = '**Ten post został sprawdzony i zaakceptowany przez @' + post.moderator + '**\n\nSkuteczność platformy Steemfounders zapewniają nasi moderatorzy, którzy zajmują się korektą i wyborem najlepszych zgłoszeń. Możesz zagłosować na ten komentarz, aby wesprzeć osobę odpowiedzialną za ten wpis.';
    } else {
      body = '**This post was moderated and accepted by @' + post.moderator + '**\n\nThe efficient operation of Steemfounders is ensured by our moderators, who deal with the correction and selection of all applications. You can vote for this comment to tip the person responsible for this post.';
    }
    let parentAuthor = process.env.STEEM_USERNAME;
    let parentPermlink = post.permlink;
    let author = process.env.STEEM_USERNAME;
    let commentPermlink = steem.formatter.commentPermlink(parentAuthor, parentPermlink);
    var commentMetadata = {
      tags: ['steemfounders'],
      app: "steemfounders/1.0",
    }

    steem.broadcast.comment(process.env.POSTING_KEY, parentAuthor, parentPermlink, author, commentPermlink, title, body, commentMetadata, (err, steemResponse) => {
      console.log(err, steemResponse);
    });
  }     
}

module.exports.commentAddAccountCreatedInfo = (post, user, callback) => {
  if(post && user) {
    let body = '';
    if(post.tags.split(' ')[0] == 'steemfounders-pl') {
      body = 'Sukces! Dzięki głosom społeczności, utworzone zostało konto @' + user.account + '. Pozostałe zdobyte przy pomocy tego posta tokeny, zostaną mu przekazane zaraz, po jego rozliczeniu.';
    } else {
      body = 'Success! Thanks to the votes from the community, an @' + user.account + ' account has been created. The remaining tokens from this post will be transferred to him immediately after the settlement.';
    }
    let title = 'RE: ' + post.title;
    let parentAuthor = process.env.STEEM_USERNAME;
    let parentPermlink = post.permlink;
    let author = process.env.STEEM_USERNAME;
    let commentPermlink = steem.formatter.commentPermlink(parentAuthor, parentPermlink);
    var commentMetadata = {
      tags: ['steemfounders'],
      app: "steemfounders/1.0",
    }

    steem.broadcast.comment(process.env.POSTING_KEY, parentAuthor, parentPermlink, author, commentPermlink, title, body, commentMetadata, (err, steemResponse) => {
      console.log(err, steemResponse);
      callback(err, steemResponse)

    });
  }  
}