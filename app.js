var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var methodOverride = require('method-override');
var flash = require('connect-flash');
var mongoose = require('mongoose');
var http = require('http');
var io = require('socket.io');
var cors = require('cors');
var passport = require('passport');
//var router = express.Router();
var configAuth = require('./config/auth');
var smsSend = require('./config/sms');

var Monitor = require('./models/Monitor');
var User = require('./models/User');
var SMSLog = require('./models/SMSLog');

var index = require('./routes/index');
var users = require('./routes/users');
var monitor = require('./routes/monitor');
var posts = require('./routes/posts');
var babybooks = require('./routes/babybooks');
var routeAuth = require('./routes/auth');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
if (app.get('env') === 'development') {
  app.locals.pretty = true;
}

var portNum = 8030;
http.createServer(function(req, res) {
  var receiveData = '';
  req.on('data', function(chunk) {
    //client로 부터 오는 data를 화면에 출력
    receiveData = '';
    receiveData += chunk;
    //client로 부터 오는 data를 db에 저장
    console.log('rcv: ' + chunk);
    var data = JSON.parse(receiveData);
    var newMonitor = new Monitor({
      tobagiNo    : data.tobagiNo,
      decibel    : data.decibel,
      tempA       : data.tempA,
      humiA       : data.humiA,
      tempB       : data.tempB,
      humiB       : data.humiB,
      accelX      : data.accelX,
      accelY      : data.accelY,
      accelZ      : data.accelZ,
      angulX      : data.angulX,
      angulY      : data.angulY,
      angulZ      : data.angulZ,
      distdB     : data.distdB,
      distReverse     : data.distReverse,
      distTempA     : data.distTempA,
      distHumiA     : data.distHumiA,
      distTempB     : data.distTempB,
      distHumiB     : data.distHumiB,
      distActivity    : data.distActivity,
      measureDate : new Date(data.measureDate)
    });
    User.find({tobagiNo : data.tobagiNo}).exec(function(err, user){
      if (err) {
        console.log("err" + err);
      }
      user.forEach(function(u){
        var sendSMSdB = false;
        var sendSMSrv = false;
        var sendSMSTH = false;
        var msg = "";

        if((u.rcvSMSdB)&&(data.distdB===1)){
          msg += "울음소리(혹은 소음)가 감지되었습니다.\n";
          sendSMSdB = true;
        }
        if((u.rcvSMSrv)&&(data.distReverse===1)){
          msg += "아기가 뒤집어진 상태입니다.\n";
          sendSMSrv = true;
        }
        if(u.rcvSMSTH){
          if(data.tempA < u.minTempA){
            msg += "주변 온도가 낮습니다.\n";
            sendSMSTH = true;
          }else if(data.tempA > u.maxTempA){
            msg += "주변 온도가 높습니다.\n";
            sendSMSTH = true;
          }
          if(data.humiA < u.minHumiA){
            msg += "주변 습도가 낮습니다.\n";
            sendSMSTH = true;
          }else if(data.humiA > u.maxHumiA){
            msg += "주변 습도가 높습니다.\n";
            sendSMSTH = true;
          }
        }
        if(msg){
          console.log(msg);
          SMSLog.find({tobagiNo : u.tobagiNo, email : u.email, phoneNumber : u.phoneNumber}).sort({"sendDate":-1}).findOne().exec(function(err, smslog){
            if (err) {
              console.log("err" + err);
            }
            if(u.phoneNumber){
              if((Date.now()-smslog.sendDate)>600000||((smslog.sendSMSdB!==sendSMSdB)&&sendSMSdB)||((smslog.sendSMSrv!==sendSMSrv)&&sendSMSrv)||((smslog.sendSMSTH!==sendSMSTH)&&sendSMSTH)){
                smsSend(u.phoneNumber, "01095043604", msg);
                var newSMSLog = new SMSLog({
                  tobagiNo         : u.tobagiNo,
                  email            : u.email,
                  phoneNumber      : u.phoneNumber,
                  sendSMSdB        : sendSMSdB,
                  sendSMSrv        : sendSMSrv,
                  sendSMSTH        : sendSMSTH
                });
                newSMSLog.save(function(err) {
                  if (err) {
                    console.log('err ' + err);
                  }
                });
              }
            }
          });
       }
     });
    });
    newMonitor.save(function(err) {
      if (err) {
        console.log('err ' + err);
      } else {
        console.log(newMonitor.tobagiNo, "tobagiNo");
        console.log(newMonitor.decibel, "decibel");
        console.log(newMonitor.tempA, "tempA");
        console.log(newMonitor.humiA, "humiA");
        console.log(newMonitor.tempB, "tempB");
        console.log(newMonitor.humiB, "humiB");
        console.log(newMonitor.accelX, "accelX");
        console.log(newMonitor.accelY, "accelY");
        console.log(newMonitor.accelZ, "accelZ");
        console.log(newMonitor.angulX, "angulX");
        console.log(newMonitor.angulY, "angulY");
        console.log(newMonitor.angulZ, "angulZ");
        console.log(newMonitor.distdB, "distdB");
        console.log(newMonitor.distReverse, "distReverse");
        console.log(newMonitor.distTempA, "distTempA");
        console.log(newMonitor.distHumiA, "distHumiA");
        console.log(newMonitor.distTempB, "distTempB");
        console.log(newMonitor.distHumiB, "distHumiB");
        console.log(newMonitor.distActivity, "distActivity");
        console.log(newMonitor.measureDate, "measureDate");
        console.log(" ");
      }
    });
  });
  req.on('end', function() {
    var reqObj = JSON.parse(receiveData);
    console.log(receiveData);
  });
}).listen(portNum, function() {
  console.log('Rcv data server listening on port ' + portNum);
});

app.locals.moment = require('moment');
// mongodb connectd
mongoose.connect('mongodb://127.0.0.1:27017');
// mongoose.connection.on('error', console.log);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback(){
  console.log("mongoDB connection is completed");
});


app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(methodOverride('_method', {methods: ['POST', 'GET']}));

app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bower_components',  express.static(path.join(__dirname, '/bower_components')));

app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: 'long-long-long-secret-string-1313513tefgwdsvbjkvasd'
}));


app.use(passport.initialize());
app.use(passport.session());

app.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.flashMessages = req.flash();
  next();
});

configAuth(passport);
app.use('/', index);
app.use('/users', users);
app.use('/monitor', monitor);
app.use('/posts', posts);
app.use('/babybooks', babybooks);
routeAuth(app, passport);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler

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

app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

// exports.getpassport = function(req, res) {
//   res.locals.currentUser = req.user;
//   res.locals.flashMessages = req.flash();
// };

module.exports = app;
