var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require("dotenv").config();
const mongoose= require('mongoose');
const passport = require("passport");
const session = require("express-session");
require("./config/passport")(passport);
require("./config/google-passport")(passport);
const authenticated = require("./middleware/authenticated");
const authorize = require("./middleware/authorize");

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const songsRouter = require('./routes/songs')

const app = express();

app.use(session({ secret: "secret" }));
app.use(passport.initialize());
app.use(passport.session());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'uploads')));
app.use((req, res, next) => {
  res.locals.user = req.user
  next()
})

app.use('/', indexRouter);
app.use('/user',authenticated, usersRouter);
app.use('/songs', songsRouter);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

const server = '127.0.0.1:27017';
const database = 'MUSIC';
class Database {
  constructor() {
    this._connect()
  }
_connect() {
     mongoose.connect(`mongodb://${server}/${database}`,{useNewUrlParser: true,useUnifiedTopology:true })
       .then(() => {
         console.log('Database connection successful');
         app.listen(3000)
       })
       .catch(err => {
         console.error('Database connection error')
       })
  }
}
new Database();

module.exports = app;