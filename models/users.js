var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    steem_username: String,
    email: String,
    hash: String,
    verified: Boolean,
    token: String,
    account: String,
    created: Boolean,
    moderator: Boolean,
    admin: Boolean,
    steem_password: String,
    steem_keys: Object
});

module.exports = mongoose.model('users', userSchema);