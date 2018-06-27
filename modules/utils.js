var nodemailer = require('nodemailer');
var steem = require('steem');
var mg = require('nodemailer-mailgun-transport');
var getSlug = require('speakingurl');
let getUrls = require('get-urls');
const isImage = require('is-image');

var auth = {
  auth: {
    api_key: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN
  }
}

var nodemailerMailgun = nodemailer.createTransport(mg(auth));

module.exports.sendActivationEmail = (email, token, callback) => {
  let link = process.env.WEBSITE_URL + '/validate?email=' + email + '&token=' + token;
  nodemailerMailgun.sendMail({
    from: { name: 'Steemfounders', address: 'noreplay@steemfounders.com' },
    to: email,
    subject: 'Please confirm your Email account',
    html: 'Hello,<br>Please Click on the link to verify your email.<br><br><a href=' + link + '>Click here to verify</a><br><br>Steemfounders Team',
  }, callback);
}

module.exports.sendInformationAfterAccountCreated = (email, callback) => {
  nodemailerMailgun.sendMail({
    from: { name: 'Steemfounders', address: 'noreplay@steemfounders.com' },
    to: email,
    subject: 'Your new Steem account is ready!',
    html: 'Hello,<br>we just created shining new account especially for You! Login at Steemfounders go get details.<br><br><a href="https://steemfounders.com/dashboard">Click here to get your account details</a><br><br>Steemfounders Team',
  }, callback);
}

module.exports.sendInformationAfterPostPublished = (email, post_link, callback) => {
  nodemailerMailgun.sendMail({
    from: { name: 'Steemfounders', address: 'noreplay@steemfounders.com' },
    to: email,
    subject: 'Your introducing post is now published',
    html: 'Hi,<br>we are glad to say that your intruducing post has been accepted by one of ours moderators and is now published on Steem!<br><br><a href=\"' + post_link + '\">Click here to read your post on Steemit</a><br><br>Steemfounders Team',
  }, callback);
}

module.exports.moderatorInformAboutNewPost = (email, callback) => {
  nodemailerMailgun.sendMail({
    from: { name: 'Steemfounders', address: 'noreplay@steemfounders.com' },
    to: email,
    subject: 'New post to moderate!',
    html: 'Dear moderator,<br>one of our user added new introducing post! If you have time, please look at it.<br><br><a href=\"https://steemfounders.com/moderate\">Open moderator dashboard</a><br><br>Steemfounders Team',
  }, callback);
}

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