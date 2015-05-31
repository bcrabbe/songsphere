var express = require('express'),
    router = express.Router(),
    AccountController = require('../controllers/account.js'),
    UserController = require('../controllers/user.js'),
    UserRegistration = require('../models/user-registration.js'),
    UserLogon = require('../models/user-logon.js'),
    User = require('../models/user.js'),
    ApiResponse = require('../models/api-response.js'),
    UserPasswordReset = require('../models/user-pwd-reset.js'),
    UserPasswordResetFinal = require('../models/user-pwd-reset-final.js'),
    session = [],
    viewDataSignStatus = [{signInOrOut: "sign in", signRoute: "./sign-in"},
                          {signInOrOut: "sign out", signRoute: "./sign-out"}],
    errorMessages = ["username not found", "invalid password","database error",
                     "not found", "username already exists", "could not create user",
                     "passwords do not match"];

    

/* GET home page. */
router.get('/', function(req, res, next) {
    var accountController = new AccountController(User, req.session);
    if(accountController.session.userProfileModel !== undefined) {
        //signed in
        res.render('pages/index', viewDataSignStatus[1]);
    } else {
        //not signed in
        res.render('pages/index', viewDataSignStatus[0]);
    }
});

router.get('/sign-in', function(req, res, next) {
    res.render('pages/signin', viewDataSignStatus[0]);
});

router.post('/sign-in', function(req, res, next) {
    var accountController = new AccountController(User, req.session);
    var userLogon = new UserLogon(req.body);
    accountController.logon(userLogon.username, userLogon.password, function (err, response) {
        if(response.success==false) {
            var errorData = {signInOrOut: "sign in",
                             signRoute: "./sign-in",
                             error: errorMessages[response.extras.msg]
            };
            res.render('pages/signin', errorData);
        } else {
            res.render('pages/index', viewDataSignStatus[1]);
        }
    });
});

router.get('/sign-out', function(req, res, next) {
    var accountController = new AccountController(User, req.session);
    accountController.logoff();
    res.render('pages/index', viewDataSignStatus[0]);
});
    

router.get('/post', function(req, res, next) {
    if(accountController.session.userProfileModel !== undefined) {
        //signed in
         res.render('pages/post', viewDataSignStatus[1]);
    } else {
        //not signed in
        res.render('pages/signin', viewDataSignStatus[0]);
    }
});

router.get('/register', function(req, res, next) {
    res.render('pages/register', viewDataSignStatus[0]);
});

router.post('/register', function(req, res, next) {
    //console.log(req.body);
    var accountController = new AccountController(User, req.session);
    var userRegistration = new UserRegistration(req.body);
    var apiResponseStep1 = accountController.getUserFromUserRegistration(userRegistration);
    if (apiResponseStep1.success) {
        accountController.register(apiResponseStep1.extras.user, function (err, apiResponseStep2) {
            if (apiResponseStep2.success===true) {
                res.render('pages/index', viewDataSignStatus[1]);
            } else {
                var errorData = {signInOrOut: "sign in",
                                 signRoute: "./sign-in",
                                 regError: errorMessages[apiResponseStep2.extras.msg]
                };
                res.render('pages/register', errorData);
            }
        });
    } else {
        var errorData = {signInOrOut: "sign in",
                         signRoute: "./sign-in",
                         regError: errorMessages[apiResponseStep1.extras.msg]
        };
        res.render('pages/register', errorData);
    }
});


module.exports = router;
