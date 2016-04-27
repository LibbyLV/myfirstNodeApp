var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var settings = require('./settings');
var users = require('./routes/users');

var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var flash = require('connect-flash');
var fs = require('fs');
var accesslog = fs.createWriteStream('access.log', {flags: 'a'});
var errorlog = fs.createWriteStream('error.log', {flags: 'a'});
var app = express();


var multer = require('multer');
app.use(multer({
               dest: './public/images',
               rename: function(fieldname,filename){
                              return filename;
               }
}));



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(logger({stream: accesslog}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(err,req,res,next){
   var meta = '[' + new Date() + ']' +'\n';
               errorlog.write(meta + err.stack + '\n');
               next();
});
//app.use(express.session({}));



app.use(session({
    secret:settings.cookieSecret,
    key:settings.db,//cookie name
    cookie:{maxAge:1000*60*60*24*30},//30days
    store:new MongoStore({
            db: settings.db,
            host: settings.host,
            port: settings.port
        }
    )
}));
app.use('/', routes);
app.use('/users', users);
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
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
