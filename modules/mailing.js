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

    let accountCreated = fs.readFileSync('modules/emails/account-created.html', 'utf-8');

    nodemailerMailgun.sendMail({
        from: { name: 'Steemfounders', address: 'noreplay@steemfounders.com' },
        to: email,
        subject: 'Your new Steem account is ready!',
        html: accountCreated,
    }, callback);
}

module.exports.sendInformationAfterPostPublished = (email, post_link, callback) => {

    let postPublished = fs.readFileSync('modules/emails/post-published.html', 'utf-8');
    postPublished = postPublished.replace("{LINK}", post_link);

    nodemailerMailgun.sendMail({
        from: { name: 'Steemfounders', address: 'noreplay@steemfounders.com' },
        to: email,
        subject: 'Your introducing post is now published',
        html: postPublished,
    }, callback);
}

module.exports.sendRejectedInformation = (email, reason, callback) => {

    let postRejected = fs.readFileSync('modules/emails/post-rejected.html', 'utf-8');
    postRejected = postRejected.replace("{REASON}", reason);

    nodemailerMailgun.sendMail({
        from: { name: 'Steemfounders', address: 'noreplay@steemfounders.com' },
        to: email,
        subject: 'Your post has been rejected',
        html: postRejected,
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