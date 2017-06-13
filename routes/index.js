var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'TOBAGI' });
});
router.get('/login', function(req, res, next) {
  res.render('login', { title: 'TOBAGI' });
});
router.get('/joinus', function(req, res, next) {
  res.render('users/joinus', { title: 'TOBAGI' });
});
module.exports = router;
