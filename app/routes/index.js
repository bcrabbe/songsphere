var express = require('express'),
    mongoose = require('mongoose'),
    qs = require('querystring'),
    router = express.Router(),
    AccountController = require('../controllers/account.js'),
    UserController = require('../controllers/user.js'),
    PostController = require('../controllers/posts.js'),
    UserRegistration = require('../models/user-registration.js'),
    UserLogon = require('../models/user-logon.js'),
    User = require('../models/user.js'),
    Post = require('../models/posts.js'),
    NewPost = require('../models/new-post.js'),
    ApiResponse = require('../models/api-response.js'),
    UserPasswordReset = require('../models/user-pwd-reset.js'),
    UserPasswordResetFinal = require('../models/user-pwd-reset-final.js'),
    session = [],
    viewDataSignedIn = [{signInOrOut: "sign in", signRoute: "./sign-in"},
                        {signInOrOut: "sign out", signRoute: "./sign-out"}],
    errorMessages = ["username not found", "invalid password","database error",
                     "not found", "username already exists", "could not create user",
                     "passwords do not match", "could not create post"];

/* GET home page. */
router.get('/', function(req, res, next) {
    console.log("router.get('/'");
    console.log("req.query: " + req.query);
    var accountController = new AccountController(User, req.session);
    var signedIn = accountController.session.userProfileModel !== undefined ? 1 : 0;
    if(req.query.author !== undefined) {
        var author = req.query.author;
        Post.find().where('author').equals(author).sort({ created: -1 }).exec(function(err, authorsPosts) {
            if (err) return res.send(err);
            res.render('pages/index', {
                viewDataSignStatus: viewDataSignedIn[signedIn],
                previews: authorsPosts
            });
        });
    }
    
    if(req.query.filter !== undefined && req.query.filter.constructor === Array) {
        console.log("here3");
        var tagList = req.query.filter
        console.log("tagList = " + tagList);
        console.log("tagList[0] = " + tagList[0]);
        //Post.find().where('tags').in(tagList).sort({ created: -1 }).exec(function(err, taggedPosts) {
        Post.find( { tags : { $elemMatch: { $in : tagList } } } ).exec(function(err, taggedPosts) {
            console.log("taggedPosts.length = " + taggedPosts.length);
            console.log("taggedPosts = " + taggedPosts);
            if (err) return res.send(err);
            if(taggedPosts.length==0) {
                res.render('pages/index', {
                viewDataSignStatus: viewDataSignedIn[signedIn],
                previews: taggedPosts,
                error: "Sorry there are no posts with that tag."
            });
            } else {
                res.render('pages/index', {
                    viewDataSignStatus: viewDataSignedIn[signedIn],
                    previews: taggedPosts
                });
            }
        });
    }
    
    if(req.query.filter !== undefined && req.query.filter.constructor !== Array) {
    console.log("here5");
    var tagList = req.query.filter.split(",");
    console.log("tagList = " + tagList);
    console.log("tagList[0] = " + tagList[0]);
    //Post.find().where('tags').in(tagList).sort({ created: -1 }).exec(function(err, taggedPosts) {
    Post.find( { tags : { $elemMatch: { $in : tagList } } } ).exec(function(err, taggedPosts) {
        console.log("taggedPosts.length = " + taggedPosts.length);
        console.log("taggedPosts = " + taggedPosts);
        if (err) return res.send(err);
        if(taggedPosts.length==0) {
            res.render('pages/index', {
            viewDataSignStatus: viewDataSignedIn[signedIn],
            previews: taggedPosts,
            error: "Sorry there are no posts with that tag."
        });
        } else {
            res.render('pages/index', {
                viewDataSignStatus: viewDataSignedIn[signedIn],
                previews: taggedPosts
            });
        }
    });
}

    Post.find().sort({ created: 1 }).limit(50).exec(function(err, latestPosts) {
        if (err) return res.send(err);
        res.render('pages/index', {
            viewDataSignStatus: viewDataSignedIn[signedIn],
            previews: latestPosts
        });
    });
});

router.post('/', function(req, res, next) {
    console.log("router.post('/'..... req.body: " + req.body);
    console.log("req.body.tags: "+req.body.tags);
    var tags = req.body.tags.split(",").map(Function.prototype.call, String.prototype.trim);
    if(tags.length==0) {
        res.redirect("/");
    }
    console.log("tags: " + tags);
    var qString = qs.stringify({filter: tags});
    console.log("qstring: " + qString);
    var url = "/?" + qString;
    console.log("url: " + url);
    res.redirect(url);
    res.send();
});

router.get('/article', function(req, res, next) {
    var accountController = new AccountController(User, req.session);
    if(req.query.ID === undefined) res.send("error");
    var articleID = mongoose.Types.ObjectId(req.query.ID);
    Post.findOne({'_id':articleID}).exec(function(err, article) {
        if (err) return res.send(err);
        if(article==null) return res.send("not found");
       // var numberOfRelatedPostsFittable = article.body.length;
        Post.find({ author: article.author }).where('_id').ne(articleID).sort({created:-1}).limit(3).exec(function(err, otherPosts) {
            if (err) return res.send(err);
            var signedIn = accountController.session.userProfileModel !== undefined ? 1 : 0;
            var articleViewData = {
                viewDataSignStatus: viewDataSignedIn[signedIn],
                PostTitle: article.title,
                PostMedia: article.media,
                PostBody: article.body,
                PostAuthor: article.author,
                comments: article.comments,
                ID: article._id,
                previews: otherPosts
            }
            res.render('pages/article', articleViewData);
        });
    });
});

router.post('/comment', function(req, res, next) {
    var accountController = new AccountController(User, req.session);
    if(accountController.session.userProfileModel == undefined) {
        res.redirect('/sign-in');
    }
    if(req.query.ID === undefined) res.send("error");
    var articleID = mongoose.Types.ObjectId(req.query.ID);
    console.log(req.body);
    console.log(articleID);
    var newComment = {
        author: accountController.session.userProfileModel.username,
        body: req.body.comment,
        date:  new Date()
    };
    console.log(newComment);
    Post.findOneAndUpdate({_id: articleID}, {$push: {comments: newComment}}, {safe: true, upsert: true},
    function(err, updatedPostModel) {
        if(err) res.send(err);
        console.log(updatedPostModel);
        var articleURL = "/article?ID=" +  articleID;
        res.redirect(articleURL);
    });
    
});


router.get('/post', function(req, res, next) {
    var accountController = new AccountController(User, req.session);
    if(accountController.session.userProfileModel !== undefined) {
        //signed in
        res.render('pages/post', {
            viewDataSignStatus: viewDataSignedIn[1]
        });
    } else {
        //not signed in
        res.render('pages/signin',  {
            viewDataSignStatus: viewDataSignedIn[0],
            error: "You must be signed in to post"
        });
    }
});

router.post('/post', function(req, res, next) {
    var accountController = new AccountController(User, req.session);
    if(accountController.session.userProfileModel == undefined) res.redirect('/sign-in');
    var newPost = new NewPost(accountController.session.userProfileModel.username, req.body);
    var postController = new PostController(Post, accountController.session);
    var newPostModel = postController.getPostFromNewPost(newPost);
    postController.addPost(newPostModel, function(err, apiResponse) {
        if (apiResponse.success===true) {
            var articleURL = "/article?ID=" +  apiResponse.extras.createdPost._id;
            res.redirect(articleURL);
        } else {
            console.log(apiResponse.extras.msg);
            console.log(errorMessages[apiResponse.extras.msg]);
            res.render('pages/post',  {
                viewDataSignStatus: viewDataSignedIn[1],
                error: errorMessages[apiResponse.extras.msg]
            });
        }
    });
});


router.get('/sign-in', function(req, res, next) {
    res.render('pages/signin', {
        viewDataSignStatus: viewDataSignedIn[1],
    });
});

router.post('/sign-in', function(req, res, next) {
    var accountController = new AccountController(User, req.session);
    var userLogon = new UserLogon(req.body);
    accountController.logon(userLogon.username, userLogon.password, function (err, response) {
        if(response.success==false) {
            res.render('pages/signin', {
                viewDataSignStatus: viewDataSignedIn[0],
                error: errorMessages[response.extras.msg]
            });
        } else {
            res.redirect('/');
        }
    });
});

router.get('/sign-out', function(req, res, next) {
    var accountController = new AccountController(User, req.session);
    accountController.logoff();
    res.redirect('/');
});

router.get('/register', function(req, res, next) {
    res.render('pages/register', {
        viewDataSignStatus: viewDataSignedIn[0]
    });
});

router.post('/register', function(req, res, next) {
    //console.log(req.body);
    var accountController = new AccountController(User, req.session);
    var userRegistration = new UserRegistration(req.body);
    var apiResponseStep1 = accountController.getUserFromUserRegistration(userRegistration);
    if (apiResponseStep1.success) {
        accountController.register(apiResponseStep1.extras.user, function (err, apiResponseStep2) {
            if (apiResponseStep2.success===true) {
                res.redirect('/');
            } else {
                res.render('pages/register', {
                    viewDataSignStatus: viewDataSignedIn[0],
                    regError: errorMessages[apiResponseStep2.extras.msg]
                });
            }
        });
    } else {
        res.render('pages/register', {
            viewDataSignStatus: viewDataSignedIn[0],
            regError: errorMessages[apiResponseStep1.extras.msg]
        });
    }
});

module.exports = router;
