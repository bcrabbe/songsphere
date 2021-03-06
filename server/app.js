var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var https = require('https');
var fs = require('fs');
var ejs = require('ejs');
var expressSession = require('express-session');
var mongooseSession = require('mongoose-session');
var mongoose = require('mongoose');

var dbName = 'songsphere';
var connectionString = 'mongodb://localhost:27017/' + dbName;
mongoose.connect(connectionString);


var routes = require('./routes/index');

var options = {
    key: fs.readFileSync('songsphere-key.pem'),
    cert: fs.readFileSync('songsphere-cert.pem')
};
var app = express();

https.createServer(options, app).listen(4111);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('ejs', require('ejs').renderFile);


app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(expressSession({
        key: 'session',
        secret: '128013A7-5B9F-4CC0-BD9E-4480B2D3EFE9',
        store: new mongooseSession(mongoose),
        resave: true,
        saveUninitialized: true
    })
);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  console.log("conected");
});

app.use('/', routes);

//custom ejs filter, sets to default value if data not supplied
ejs.filters.get = function(obj, prop, def) {
  return obj[prop] === undefined ? def : obj[prop];
};


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send(err);
    
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
    res.send(err);
});


module.exports = app;
