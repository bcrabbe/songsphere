
var PostController = function (postModel, session) {
    this.ApiResponse = require('../models/api-response.js');
    this.ApiMessages = require('../models/api-messages.js');
    this.postModel = postModel;
    this.session = session;
    this.User = require('../models/user.js');
    this.Post = require('../models/posts.js');
};


//adds a new post to the database
PostController.prototype.addPost = function(newPost, callback) {
    var me = this;
    newPost.save(function (err, post, numberAffected) {
        if (err) {
            return callback(err, new me.ApiResponse({ success: false, extras: { msg: me.ApiMessages.DB_ERROR } }));
        }
        if (numberAffected === 1) {
            return callback(err, new me.ApiResponse({success: true, extras: {createdPost: post}}));
        } else {
            return callback(err, new me.ApiResponse({ success: false, extras: { msg: me.ApiMessages.COULD_NOT_CREATE_POST } }));
        }
    });
};

PostController.prototype.getPostFromNewPost = function(newPost) {
    var me = this;
    var post = new this.Post({
        author: newPost.author,
        tags: newPost.tags,
        title: newPost.title,
        media: newPost.media,
        body: newPost.postBody,
        created: new Date()
    });
    return post;
}

module.exports = PostController;