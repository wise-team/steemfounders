let express = require('express');
let router = express.Router();
var bcrypt = require('bcrypt');
var steem = require('steem');
let getUrls = require('get-urls');
const isImage = require('is-image');
var nodemailer = require('nodemailer');
var mg = require('nodemailer-mailgun-transport');

let Users = require('../models/users.js');
let Posts = require('../models/posts.js');

// This is your API key that you retrieve from www.mailgun.com/cp (free up to 10K monthly emails)
var auth = {
    auth: {
      api_key: process.env.MAILGUN_API_KEY,
      domain: process.env.MAILGUN_DOMAIN
    }
  }
  
var nodemailerMailgun = nodemailer.createTransport(mg(auth));


function generateToken() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 36; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

router.get('/', (req, res, next) => {
    res.render('index', { account_number: 15, steem_transfered: 54, sbd_transfered: 23 });
});

router.get('/dashboard', (req, res, next) => {
    if (req.session.email) {
        if(!req.session.verified) {
            res.redirect('/register');
        } else {
            if(req.session.moderator) {
                res.redirect('/moderate');
            } else {
                Posts.findOne({ email: req.session.email }, function (err, post) {
                    if (!err) {
                        res.render('dashboard', { post: post });
                    } else {
                        res.redirect('/');
                    }
                })
            }  
        }             
    } else {
        res.redirect('/');
    }
});

router.get('/edit/:id', (req, res, next) => {
    if (req.session.email && req.session.moderator) {

        Posts.findOne({ _id: req.params.id }, function (err, post) {
            if (!err) {
                res.render('moderator-edit', { post: post });
            } else {
                res.redirect('/');
            }
        })        
    } else {
        res.redirect('/');
    }
});

router.get('/moderate', (req, res, next) => {
    if (req.session.email && req.session.moderator) {
        Posts.find({ status: 'added' }, function (err, posts) {
            if (!err) {
                res.render('moderate', { posts: posts });
            } else {
                res.redirect('/');
            }
        })
    } else {
        res.redirect('/');
    }
});

router.get('/register', (req, res) => {
    if (req.session.email) {
        if(!req.session.verified) {
            res.render('register');
        } else {
            res.redirect('/dashboard');    
        }
    } else {
        res.redirect('/');
    }
})

router.post('/register', (req, res) => {

    if (req.body.email) {
        console.log(req.body.email);
        Users.findOne({ email: req.body.email }, function (err, user) {
            if (!err && !user) {
                let user = new Users();
                user.email = req.body.email;
                user.token = generateToken();

                var link = process.env.WEBSITE_URL + '/validate?email=' + user.email + '&token=' + user.token;

                console.log(link);

                user.save((err) => {
                    if (err) {
                        console.log(err);
                        res.json({ error: "Something went wrong. Try again" });
                    } else {
                        nodemailerMailgun.sendMail({
                            from: 'noreplay@steemfounders.com',
                            to: user.email, // An array if you have multiple recipients.
                            subject: 'Please confirm your Email account',
                            html: 'Hello,<br>Please Click on the link to verify your email.<br><br><a href=' + link + '>Click here to verify</a><br><br>Steemfounders Team',
                          }, function (err, info) {
                            if (err) {
                                console.log('Error: ' + err);
                                res.json({ error: "Error occured. Try again" });
                            }
                            else {
                                res.json({ success: "Activation link sent" });
                                console.log('Response: ' + JSON.stringify(info, null, 10));
                            }
                          });
                    }
                })
            } else {
                res.json({ error: "Activation link already sent. Click <a id='resend'>here</a> to resend" });
            }
        })
    }
});

router.post('/finish', (req, res) => {

    if (req.body.password && req.body.password != '' && req.body.passwordConf && req.body.passwordConf != '' && req.body.account && req.body.account != '') {
        Users.findOne({ email: req.session.email }, function (err, user) {
            if (!err && user) {
                bcrypt.hash(req.body.password, 10, function (err, hash) {
                    user.hash = req.body.email;
                    user.account = req.body.account;
                    user.verified = true;
                    user.hash = hash;
                    user.save((err) => {
                        if (!err) {
                            res.json({success: 'Registration finished'});
                        } else {
                            console.log(err);
                            res.json({error: 'Error occured. Try again'});
                        }
                    })
                });
            } else {
                res.json({error: 'Error occured. Try again'});
            }
        })
    } else {
        res.json({error: 'Error occured. Try again'});
    }
});

router.post('/check', (req, res) => {
    if(req.body.account) {
        let error = steem.utils.validateAccountName(req.body.account);
        if(error) {
            res.json({error: error});
        } else {
            steem.api.getAccounts([req.body.account], function(err, result) {
                if(err || result.length) {
                    res.json({error: "Account with that name already exists"});
                } else {
                    res.json({success: "Account name is free"});
                }
            });
        }
    } else {
        res.json({error: "Account name cannot be ampty"});
    }
})

router.post('/add', (req, res) => {
    if(req.session.email) {
        if (req.body.title && req.body.title != '' && req.body.body && req.body.body != '' && req.body.tags && req.body.tags != '') {
            Posts.findOne({ email: req.session.email }, function (err, post) {
                if (!err) {
                    if(!post) {
                        post = new Posts();
                    }

                    post.title = req.body.title;
                    post.body = req.body.body;
                    post.tags = req.body.tags;
                    post.email = req.session.email;
                    post.status = 'added';

                    let image = req.body.image;
                    
                    if ( ! image || (image == '')) {
                        var urls = getUrls(req.body.body);
                        urls.forEach((url) => {
                            if ( ! image || (image == '')) {
                                if (url[url.length - 1] == ')') {
                                    var trimmed = url.substring(0, url.length - 1);
                                } else {
                                    var trimmed = url;
                                }
        
                                if (isImage(trimmed)) {
                                    image = trimmed;
                                }
                            }
                        });
                    }

                    post.image = image;
                    
                    post.save((err)=>{
                        res.redirect('/dashboard');
                    })
                    
                } else {
                    res.redirect('/');
                }
            })
        } else {
            res.redirect('/');
        }
    } else {
        res.redirect('/');
    }

});

router.post('/login', (req, res) => {

    if (req.body.password && req.body.password != '' && req.body.email && req.body.email != '') {
        Users.findOne({ email: req.body.email }, function (err, user) {
            if (!err && user) {
                bcrypt.compare(req.body.password, user.hash, function (err, result) {
                    if (!err && result) {
                        req.session.email = user.email;
                        req.session.verified = user.verified;
                        if(user.moderator) {
                            req.session.moderator = true;
                        }
                        res.redirect('/dashboard');
                    } else {
                        res.redirect('/');
                    }
                });
            } else {
                res.redirect('/');
            }
        })
    }
});

router.get('/validate', (req, res) => {
    if (req.query.token && req.query.token != '') {
        if (req.query.email && req.query.email != '') {
            Users.findOne({ email: req.query.email }, (err, user) => {
                if (!err && user) {
                    if (user.token == req.query.token) {

                        req.session.email = user.email;
                        req.session.verified = user.verified;

                        user.activated = true;
                        user.save((err) => {
                            if (err) {
                                console.log(err);
                            }
                            res.redirect('/register');
                        })
                    } else {

                    }
                }
            })
        } else {
            res.redirect('/');
        }
    } else {
        res.redirect('/');
    }

})

router.post('/resend', (req, res) => {
    if(req.body.email && req.body.email != '') {
        Users.findOne({email: req.body.email}, function(err, user) {
            if(!err && user) {
                var link = process.env.WEBSITE_URL + '/validate?email=' + user.email + '&token=' + user.token;
                nodemailerMailgun.sendMail({
                    from: 'noreplay@steemfounders.com',
                    to: req.body.email, // An array if you have multiple recipients.
                    subject: 'Please confirm your Email account',
                    html: 'Hello,<br>Please Click on the link to verify your email.<br><br><a href=' + link + '>Click here to verify</a><br><br>Steemfounders Team',
                  }, function (err, info) {
                    if (err) {
                        console.log('Error: ' + err);
                        res.json({ error: "Error occured. Try again" });
                    }
                    else {
                        res.json({ success: "Activation link resent. Delivery can take few minutes." });
                        console.log('Response: ' + JSON.stringify(info, null, 10));
                    }
                  });
            } else {
                res.json({ error: "Error occured. Try again" });
            }
        })
    } else {
        res.json({ error: "Error occured. Try again" });
    }
 
});

router.get('/logout', (req, res) => {
    req.session.email = null;
    req.session.verified = null;
    req.session.moderator = null;
    res.redirect('/');
});

router.get('*', (req, res) => {
    res.redirect('/');
});

module.exports = router;