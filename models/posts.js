var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var postsSchema = new Schema({
    lang: String,
    status: String, // added, approved, rejected
    status_comment: String,
    email: String,
    date: Date,
    title: String,
    body: String,
    image: String,
    tags: String,
    permlink: String
});

module.exports = mongoose.model('posts', postsSchema);