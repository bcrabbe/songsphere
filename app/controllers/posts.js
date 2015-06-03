
var PostController = function (postModel, session) {
    this.ApiResponse = require('../models/api-response.js');
    this.ApiMessages = require('../models/api-messages.js');
    this.postModel = postModel;
    this.session = session;
    this.User = require('../models/user.js');
    this.Post = require('../models/posts.js');
};

PostController.getCommentModelFromNewComment = function(commentJson,callback) {

}

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

//deletes a post from the database
PostController.prototype.deletePost = function(deleteID, callback) {
    console.log("deletePost");
    console.log(deleteID);
    
    
    var me = this;
    
    Post.findOne({ _id : deleteID}, function (err, model) {
        if(err)console.log(err);
        model.remove(function (err) {
            if(err)console.log(err);
            callback(err);

        });
    });
    
 
};


//deletes all posts from the database
PostController.prototype.deleteAllPosts = function(callback) {
    var me = this;
    Post.remove({}, function(err,removed) {
        if(err) console.log(err);
        console.log(removed);
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