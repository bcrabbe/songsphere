var express = require('express'),
    router = express.Router(),
    AccountController = require('../controllers/account.js'),
    UserRegistration = require('../models/user-registration.js'),
    UserLogon = require('../models/user-logon.js'),
    User = require('../models/user.js'),
    ApiResponse = require('../models/api-response.js'),
    UserPasswordReset = require('../models/user-pwd-reset.js'),
    UserPasswordResetFinal = require('../models/user-pwd-reset-final.js'),
    session = [],
    MailerMock = require('../test/mailer-mock.js'),
    mailer = new MailerMock();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('pages/index');
});

router.get('/sign-in', function(req, res, next) {
    res.render('pages/signin');
});

router.get('/post', function(req, res, next) {
    res.render('pages/post');
});

router.get('/register', function(req, res, next) {
    res.render('pages/register');
});

router.post('/register', function(req, res, next) {
    console.log(req.body);
    var accountController = new AccountController(User, req.session, mailer);
    var userRegistration = new UserRegistration(req.body);
    var apiResponseStep1 = accountController.getUserFromUserRegistration(userRegistration);
    if (apiResponseStep1.success) {
        accountController.register(apiResponseStep1.extras.user, function (err, apiResponseStep2) {
            return res.send(apiResponseStep2);
        });
    } else {
        res.send(apiResponseStep1);
    }
});


module.exports = router;
