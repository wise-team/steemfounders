let express = require('express');
let router = express.Router();
var bcrypt = require('bcrypt');
var steem = require('steem');
var getSlug = require('speakingurl');
let getUrls = require('get-urls');
const isImage = require('is-image');

let Users = require('../models/users.js');
let Posts = require('../models/posts.js');
let utils = require('../modules/utils.js');
let mailing = require('../modules/mailing.js');
let latest = require('../modules/latest-posts.js');
let transfers = require('../modules/transfers.js');

router.get('/', (req, res, next) => {
    Posts.countDocuments({ created: true }, (err, count) => {
        if (!err && count) {
            res.render('index', { account_number: count, steem_transfered: transfers.getSteemAmountSent(), latest: latest.getLatest() });
        } else {
            res.render('index', { account_number: 0, steem_transfered: transfers.getSteemAmountSent(), latest: latest.getLatest() });
        }
    })
});

router.get('/steem', (req, res, next) => {
    res.render('steem');
});

router.get('/dashboard', (req, res, next) => {
    if (req.session.email) {
        if (!req.session.verified) {
            res.redirect('/register');
        } else {
            if (req.session.moderator) {
                res.redirect('/moderate');
            } else {
                Posts.findOne({ email: req.session.email }, function (err, post) {
                    if (!err) {
                        Users.findOne({ email: req.session.email }, function (err, user) {
                            if (!err && user) {
                                res.render('dashboard', { post: post, user: user });
                            } else {
                                res.redirect('/');
                            }
                        })
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

router.post('/assing-moderator', (req, res, next) => {
    if (req.session.email && req.session.moderator && req.session.admin) {
        Users.findOne({ email: req.body.email }, (err, user) => {
            if (err || user == null) res.json({ error: "Error occured. Try again." });
            else {
                user.moderator = true;
                user.save((err) => {
                    if (err) console.log(err);
                    else res.json({ success: "Moderator permissions assigned" });
                });
            }
        });
    } else {
        res.json({ error: "Error occured. Try again... or maybe don't." })
    }
});

router.post('/create-account', async function (req, res, next) {

    try {
        if (!req.session.email || !req.session.moderator) throw new Error('Not authorized');

        let post = await Posts.findOne({ _id: req.body.id });

        if (!post) throw new Error('Post not found');
        if (post.status != 'published') throw new Error('Post not published');

        let user = await Users.findOne({ email: post.email });

        if (!user) throw new Error('User not found');
        if (user.created) throw new Error('User already created');

        var password = steem.formatter.createSuggestedPassword();
        var publicKeys = steem.auth.generateKeys(user.account, password, ['owner', 'active', 'posting', 'memo']);
        let keys = steem.auth.getPrivateKeys(user.account, password);

        await user.update({
            steem_password: password,
            steem_keys: keys
        });

        let chainProps = await steem.api.getChainPropertiesAsync();

        var fee = chainProps.account_creation_fee;

        var jsonMetadata = '';

        var owner = {
            weight_threshold: 1,
            account_auths: [],
            key_auths: [[publicKeys.owner, 1]]
        };
        var active = {
            weight_threshold: 1,
            account_auths: [],
            key_auths: [[publicKeys.active, 1]]
        };
        var posting = {
            weight_threshold: 1,
            account_auths: [],
            key_auths: [[publicKeys.posting, 1]]
        };
        var memoKey = publicKeys.memo;

        await steem.broadcast.accountCreateAsync(process.env.POSTING_KEY, fee, process.env.STEEM_USERNAME, user.account, owner, active, posting, memoKey, jsonMetadata);

        await post.update({ created: true});
        await user.update({ created: true});

        mailing.sendInformationAfterAccountCreated(user.email, (err, info) => {
            utils.commentAddAccountCreatedInfo(post, user, (err, response) => {
                res.json({ success: "Account created" })
            });
        });

    } catch (error) {
        res.json({ error: "Error occured. Try again" })
    }
});

router.get('/moderate', (req, res, next) => {
    if (req.session.email && req.session.moderator) {
        Posts.find({ status: 'added' }, function (err, posts) {
            if (!err) {
                Posts.find({ status: 'published', created: false }, function (err, published) {
                    if (!err) {
                        res.render('moderate', { posts: posts, published: published, admin: req.session.admin });
                    } else {
                        res.redirect('/');
                    }
                })
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
        if (!req.session.verified) {
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
                user.token = utils.generateToken();

                user.save((err) => {
                    if (err) {
                        console.log(err);
                        res.json({ error: "Something went wrong. Try again" });
                    } else {
                        mailing.sendActivationEmail(user.email, user.token, function (err, info) {
                            if (err) {
                                console.log('Error: ' + err);
                                res.json({ error: "Error occured. Try again" });
                            }
                            else {
                                console.log('New user register mail sent: ' + JSON.stringify(info, null, 10));
                                res.json({ success: "Activation link sent" });
                            }
                        })
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
                    user.community = req.body.community;
                    user.verified = true;
                    user.hash = hash;
                    user.save((err) => {
                        if (!err) {
                            req.session.verified = true;
                            res.json({ success: 'Registration finished' });
                        } else {
                            console.log(err);
                            res.json({ error: 'Error occured. Try again' });
                        }
                    })
                });
            } else {
                res.json({ error: 'Error occured. Try again' });
            }
        })
    } else {
        res.json({ error: 'Error occured. Try again' });
    }
});

router.post('/check', (req, res) => {
    if (req.body.account) {
        let error = steem.utils.validateAccountName(req.body.account);
        if (error) {
            res.json({ error: error });
        } else {
            steem.api.getAccounts([req.body.account], function (err, result) {
                if (err || result.length) {
                    res.json({ error: "Account with that name already exists" });
                } else {
                    res.json({ success: "Account name is free" });
                }
            });
        }
    } else {
        res.json({ error: "Account name cannot be ampty" });
    }
})

router.post('/reject', (req, res) => {
    if (req.session.email && req.session.moderator && req.body.id) {
        if (req.body.reason) {
            Posts.findOne({ _id: req.body.id }, function (err, post) {
                if (!err && post && post.status == 'added') {
                    post.status = 'rejected';
                    post.save((err) => {
                        if (!err) {
                            mailing.sendRejectedInformation(post.email, req.body.reason, function (err) {
                                if (!err) {
                                    console.log("Rejected email sent to author");
                                    res.json({ success: "Post rejected successfully" });
                                } else {
                                    res.json({ error: "Email not sent but post rejected" });
                                }
                            })
                        } else {
                            res.json({ error: "Error while saving database. Try again" });
                        }
                    })
                } else {
                    res.json({ error: "Post doesn\'t exists or already rejected" });
                }
            });
        } else {
            res.json({ error: "Please provide rejecting reason" });
        }
    } else {
        res.json({ error: "Not authorized" });
    }
})

router.post('/hide', (req, res) => {
    if (req.session.email && req.session.moderator && req.body.id) {
        Posts.findOne({ _id: req.body.id }, function (err, post) {
            if (!err && post && post.status == 'published') {
                post.status = 'hidden';
                post.save((err) => {
                    if (!err) {
                        res.json({ success: "Post hidden successfully" });
                    } else {
                        res.json({ error: "Error while saving database. Try again" });
                    }
                })
            } else {
                res.json({ error: "Post doesn\'t exists or already hidden" });
            }
        });
    } else {
        res.json({ error: "Not authorized" });
    }
})

router.post('/add', (req, res) => {
    if (req.session.email) {
        if (req.body.title && req.body.title != '' && req.body.body && req.body.body != '' && req.body.tags && req.body.tags != '') {
            Posts.findOne({ email: req.session.email }, function (err, post) {
                if (!err) {
                    if (!post) {
                        post = new Posts();
                    }

                    post.title = req.body.title;
                    post.body = req.body.body;
                    post.tags = req.body.tags;
                    post.email = req.session.email;
                    post.status = 'added';

                    let image = req.body.image;

                    if (!image || (image == '')) {
                        var urls = getUrls(req.body.body);
                        urls.forEach((url) => {
                            if (!image || (image == '')) {
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

                    post.save((err) => {

                        Users.find({ moderator: true }, (err, users) => {
                            if (!err && users.length) {
                                users.forEach((user) => {
                                    mailing.moderatorInformAboutNewPost(user.email, (err) => {
                                        if (!err) {
                                            console.log('Mail sent to moderator');
                                        }
                                    });
                                })
                            } else {
                                console.log("No moderators found. We're not sending emails");
                            }
                        })

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

router.post('/publish', (req, res) => {
    if (req.session.email && req.session.moderator) {
        if (req.body.title && req.body.title != '' && req.body.body && req.body.body != '' && req.body.tags && req.body.tags != '' && req.body._id && req.body._id != '') {
            Posts.findById(req.body._id, function (err, post) {
                if (!err) {
                    if (post) {
                        post.title = req.body.title;
                        post.body = req.body.body;
                        post.tags = req.body.tags;
                        post.moderator = req.body.moderator;
                        post.status = 'published';
                        post.created = false;

                        let image = req.body.image;

                        if (!image || (image == '')) {
                            var urls = getUrls(req.body.body);
                            urls.forEach((url) => {
                                if (!image || (image == '')) {
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

                        post.permlink = getSlug(post.title) + '-' + new Date().toISOString().replace(/[^a-zA-Z0-9]+/g, '').toLowerCase();

                        utils.publishPostOnSteem(post, function (err, result) {
                            if (!err) {
                                post.save((err) => {
                                    mailing.sendInformationAfterPostPublished(post.email, 'https://steemit.com/@' + process.env.STEEM_USERNAME + '/' + post.permlink, (err, info) => {
                                        console.log(err, info)
                                        res.json({ success: 'Post has been published' });
                                    });
                                })
                            } else {
                                res.json({ error: 'Error while publishing on Steem. ' + err.message });
                            }
                        });
                    } else {
                        res.json({ error: 'Post not found in database. Cannot be published' });
                    }
                } else {
                    res.json({ error: 'Error while connecting database' });
                }
            })
        } else {
            res.json({ error: 'Post information incomplete. Provide all fields' });
        }
    } else {
        res.json({ error: 'Not authorized' });
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
                        if (user.moderator) {
                            req.session.moderator = true;
                        }
                        if (user.admin) {
                            req.session.admin = true;
                        }
                        res.json({ success: 'Logged in successfully' });
                    } else {
                        res.json({ error: 'Invalid username or password' });
                    }
                });
            } else {
                res.json({ error: 'Invalid username or password' });
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
    if (req.body.email && req.body.email != '') {
        Users.findOne({ email: req.body.email }, function (err, user) {
            if (!err && user) {
                mailing.sendActivationEmail(user.email, user.token, function (err, info) {
                    if (err) {
                        console.log('Error: ' + err);
                        res.json({ error: "Error occured. Try again" });
                    }
                    else {
                        console.log('Response: ' + JSON.stringify(info, null, 10));
                        res.json({ success: "Activation link resent. Delivery can take few minutes." });
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