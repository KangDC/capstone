var express = require('express'),
    bcrypt = require('bcryptjs'),
    User = require('../models/User'),
    Monitor = require('../models/Monitor');
var router = express.Router();

function needAuth(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    req.flash('danger', '로그인이 필요합니다.');
    res.redirect('/login');
  }
}

/* GET users listing. */
router.get('/', needAuth, function(req, res, next) {
  Monitor.find({tobagiNo: res.locals.currentUser.tobagiNo})
    .sort({"measureDate":-1}).limit(100).exec(function(err, monitors) {
    if (err) {
      return next(err);
    }
    res.render('users/monitor', {user: res.locals.currentUser,
      userjson: JSON.stringify(res.locals.currentUser),
      monitors: JSON.stringify(monitors)});
  });
  //res.render('users/monitor', {user: res.locals.currentUser});
});

router.get('/initmonitor', needAuth, function(req, res) {
  Monitor.find({tobagiNo : res.locals.currentUser.tobagiNo}).sort({"measureDate":-1}).findOne().exec(function(err, data){
   if (err) {
     console.log("err" + err);
   }
   var tdt = new Date(data.measureDate);
   var fdt = new Date(tdt.setHours(tdt.getHours()-3));
   Monitor.find({tobagiNo : res.locals.currentUser.tobagiNo, measureDate : {"$gte" : fdt}}).sort({"measureDate":-1})
   .sort({"measureDate":1}).exec(function(err, monitors) {
     if (err) {
       console.log("err" + err);
     }
     res.send(monitors);
   });
  });
});
router.post('/redrawGraph', needAuth, function(req, res, next) {
  Monitor.find({tobagiNo : res.locals.currentUser.tobagiNo}).sort({"measureDate":-1}).findOne().exec(function(err, data){
   if (err) {
     console.log("err" + err);
   }
   var tdt = new Date(new Date((new Date(req.body.todate)).toISOString()).setHours((new Date(req.body.todate)).getHours()+9));
   var fdt = new Date(new Date((new Date(req.body.fromdate)).toISOString()).setHours((new Date(req.body.fromdate)).getHours()+9));
   Monitor.find({tobagiNo : res.locals.currentUser.tobagiNo, measureDate : {"$gte" : fdt, "$lte" : tdt}}).sort({"measureDate":-1})
   .sort({"measureDate":1}).exec(function(err, monitors) {
     if (err) {
       console.log("err" + err);
     }
     console.log(monitors);
     console.log(tdt);
     console.log(fdt);
     res.send(monitors);
   });
  });
});
router.post('/postGraph', needAuth, function(req, res, next) {
  Monitor.find({tobagiNo : res.locals.currentUser.tobagiNo}).sort({"measureDate":-1}).findOne().exec(function(err, data){
   if (err) {
     console.log("err" + err);
   }
   var tdt = new Date(new Date((new Date(req.body.todate)).toISOString()).setHours((new Date(req.body.todate)).getHours()+9));
   var fdt = new Date(new Date((new Date(req.body.fromdate)).toISOString()).setHours((new Date(req.body.fromdate)).getHours()+9));
   Monitor.find({tobagiNo : res.locals.currentUser.tobagiNo, measureDate : {"$gte" : fdt, "$lte" : tdt}}).sort({"measureDate":-1})
   .sort({"measureDate":1}).exec(function(err, monitors) {
     if (err) {
       console.log("err" + err);
     }
     console.log(monitors);
     console.log(tdt);
     console.log(fdt);
     res.send(monitors);
   });
  });
});

module.exports = router;
