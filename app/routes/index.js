var express = require('express');
//var controller = require('./controller.js');
var router = express.Router();


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
   // controller.registerUser(req, res);
});

module.exports = router;
