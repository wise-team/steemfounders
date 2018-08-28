let fs = require('fs');
let nodemailer = require('nodemailer');
let mg = require('nodemailer-mailgun-transport');

var auth = {
    auth: {
        api_key: process.env.MAILGUN_API_KEY,
        domain: process.env.MAILGUN_DOMAIN
    }
}

var nodemailerMailgun = nodemailer.createTransport(mg(auth));

module.exports.sendActivationEmail = (email, token, callback) => {

    let confirmationMail = fs.readFileSync('modules/emails/confirmation.html', 'utf-8');
    let link = process.env.WEBSITE_URL + '/validate?email=' + email + '&token=' + token;

    confirmationMail = confirmationMail.replace("{LINK}", link);

    nodemailerMailgun.sendMail({
        from: { name: 'Steemfounders', address: 'noreplay@steemfounders.com' },
        to: email,
        subject: 'Please confirm your Email account',
        html: confirmationMail
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

module.exports.sendRejectedInformation = (email, reason, callback) => {
    nodemailerMailgun.sendMail({
        from: { name: 'Steemfounders', address: 'noreplay@steemfounders.com' },
        to: email,
        subject: 'Your post has been rejected',
        html: 'Hi,<br>we are sorry to say that but your intruducing post has been rejected by one of ours moderators and it won\'t be published.<br><br>Here you can read moderator\'s explanation:<br><br><blockquote>' + reason + '</blockquote><br><br>You can contact with us using <a href=\"https://discord.gg/8NktdFh\">Discord</a>.<br>Steemfounders Team',
    }, callback);
}

module.exports.moderatorInformAboutNewPost = (email, callback) => {

    let newPostInformation = fs.readFileSync('modules/emails/new-post-to-moderate.html', 'utf-8');

    nodemailerMailgun.sendMail({
        from: { name: 'Steemfounders', address: 'noreplay@steemfounders.com' },
        to: email,
        subject: 'New post to moderate!',
        html: newPostInformation,
    }, callback);
}