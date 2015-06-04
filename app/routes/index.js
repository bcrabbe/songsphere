var express = require('express'),
    mongoose = require('mongoose'),
    qs = require('querystring'),
    router = express.Router(),
    AccountController = require('../controllers/account.js'),
    PostController = require('../controllers/posts.js'),
    UserLogon = require('../models/user-logon.js'),
    User = require('../models/user.js'),
    Post = require('../models/posts.js'),
    NewPost = require('../models/new-post.js'),
    ApiResponse = require('../models/api-response.js'),
    session = [],
    viewDataSignedIn = [{signInOrOut: "sign in", signRoute: "./sign-in"},
                        {signInOrOut: "sign out", signRoute: "./sign-out"}],
    errorMessages = ["username not found", "invalid password","database error",
                     "not found", "username already exists", "could not create user",
                     "passwords do not match", "could not create post","could not delete post"];

/* GET home page. */
router.get('/', function(req, res) {
    var accountController = new AccountController(User, req.session);
    console.log("here1");
    var signedIn = accountController.session.userProfileModel !== undefined ? 1 : 0;
    console.log("here2");

    //Author search
    if(req.query.author !== undefined) {
        var author = req.query.author;
        Post.find().where('author').equals(author).sort({ created: -1 }).limit(10).exec(function(err, authorsPosts) {
            if (err) return res.send("error");
            console.log("\n\nAuthorsPosts:" +authorsPosts);
            console.log("\n\authorsPosts.length: " +authorsPosts.length);
            console.log("authors post.constructor = " +authorsPosts.constructor);
            if(authorsPosts.length==0) {
                console.log("length=0");
                res.render('pages/index', {
                    viewDataSignStatus: viewDataSignedIn[signedIn],
                    previews: authorsPosts,
                    error: "Sorry there are no posts with that tag."
                });
            } else {
                res.render('pages/index', {
                    viewDataSignStatus: viewDataSignedIn[signedIn],
                    previews: authorsPosts
                });
            }
        });
    }
    //Tag search
    if(req.query.filter !== undefined) {
        var tagList = req.query.filter.constructor == Array ? req.query.filter : req.query.filter.split(",");
        Post.find( { tags : { $elemMatch: { $in : tagList } } } ).limit(10).exec(function(err, taggedPosts) {
            if (err) return res.send("error");
            console.log("\n\taggedPosts.length: " +taggedPosts.length);
            if(taggedPosts.length==0) {
                console.log("length=0");
                
                res.render('pages/index', {
                    viewDataSignStatus: viewDataSignedIn[signedIn],
                    previews: taggedPosts,
                    error: "Sorry there are no posts with that tag."
                });
            } else {
                console.log("\n\ntaggedPosts:\n\n" +taggedPosts);
                res.render('pages/index', {
                    viewDataSignStatus: viewDataSignedIn[signedIn],
                    previews: taggedPosts
                });
            }
        });
    }
    //or just latest
    Post.find().sort({ created: 1 }).limit(10).exec(function(err, latestPosts) {
        if (err) return res.send(err);
        res.render('pages/index', {
            viewDataSignStatus: viewDataSignedIn[signedIn],
            previews: latestPosts
        });
    });
});

router.post('/', function(req, res) {
    var tags = req.body.tags.split(",").map(Function.prototype.call, String.prototype.trim);
    if(tags.length==0) {
        res.redirect("/");
    }
    var qString = qs.stringify({filter: tags});
    var url = "/?" + qString;
  //  res.redirect(url);
    res.statusCode = 302;
    res.setHeader("Location", url);
    res.end();
//    res.send();
});

router.get('/article', function(req, res, next) {
    var accountController = new AccountController(User, req.session);
    if(req.query.ID === undefined) res.send("error");
    var articleID = mongoose.Types.ObjectId(req.query.ID);
    Post.findOne({'_id':articleID}).exec(function(err, article) {
        if (err) return res.send(err);
        if(article==null) return res.send("not found");
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
            };
            //console.log(accountController.session.userProfileModel);
            if(signedIn && article.author==accountController.session.userProfileModel.username) {
                articleViewData.deleteLink = "<a href=\"\/delete?ID=" +article._id + "\">Delete</a>"
            }
            res.render('pages/article', articleViewData);
        });
    });
});

//router.get('/purgePosts', function(req,res, next) {
//    var accountController = new AccountController(User, req.session);
//    if(req.query.ID === undefined) res.send("error");
//    var articleID = mongoose.Types.ObjectId(req.query.ID);
//    Post.remove(function(err,removed) {
//        if(err) {
//            console.log(err);
//            res.send(err);
//        }
//        console.log(removed);
//        res.redirect("/");
//    });
//});

router.get('/delete', function(req,res, next) {
    var accountController = new AccountController(User, req.session);
    if(req.query.ID === undefined) res.send("error");
    var articleID = mongoose.Types.ObjectId(req.query.ID);
    Post.findOne({ _id : articleID}, function (err, post) {
        if(err) {
            console.log(err);
            res.send(err);
        }
        post.remove(function (err) {
            console.log("deleted");
            if(err) {
                console.log(err);
                res.send(err);
            }
            else res.redirect("/");
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
    var newComment = {
        author: accountController.session.userProfileModel.username,
        body: req.body.comment,
        date:  new Date()
    };
    Post.findOneAndUpdate({_id: articleID}, {$push: {comments: newComment}}, {safe: true, upsert: true},
    function(err, updatedPostModel) {
        if(err) res.send(err);
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
        if (apiResponse.success==true) {
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
    var accountController = new AccountController(User, req.session);
    var apiResponseStep1 = accountController.getUserFromUserRegistration(req.body);
    if (apiResponseStep1.success) {
        accountController.register(apiResponseStep1.extras.user, function (err, apiResponseStep2) {
            if (apiResponseStep2.success===true) {
                //success->logged in -> index
                accountController.logon(req.body.username, req.body.password, function (err, response) {
                    if(response.success==false) {
                        res.render('pages/signin', {
                            viewDataSignStatus: viewDataSignedIn[0],
                            error: errorMessages[response.extras.msg]
                        });
                    }
                    res.redirect('/');
                });
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
