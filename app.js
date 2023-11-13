var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var app = express();
var db=require('./routes/mongodbutils');
var url = "mongodb://localhost:27017/hostel";
const MongoStore = require('connect-mongo');

var session = require('express-session');
var {v4: uuidv4 } = require('uuid');


app.use(session({
  genid: function(req) {
    return uuidv4(); // use UUIDs for session IDs
  },
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  // store:MongoStore.create({mongoUrl:url}),
  
  cookie: {maxAge : 30000000}
}))



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'images')));



db.connectToServer(function(err){
  var form=require('./routes/form');

var room=require('./routes/room');
var admin=require('./routes/admin');
var attend=require('./routes/attend');
var emp=require('./routes/employee');
var sal=require('./routes/salary');
var pay=require('./routes/payment');
var meal=require('./routes/meal');
var ui=require('./routes/ui');
var analytics=require('./routes/analytics');
var guest=require('./routes/guest');







app.use('/', ui);

app.use('/admin',admin)

app.use('/student',form);
app.use('/meal',meal);
app.use('/room',room);
app.use('/emp',emp);
app.use('/sal',sal);
app.use('/pay',pay);

app.use('/attend',attend);  
app.use('/guest',guest);
app.use('/analytics',analytics);






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



})










module.exports = app;
