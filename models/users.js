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
    moderator: Boolean
});

module.exports = mongoose.model('users', userSchema);