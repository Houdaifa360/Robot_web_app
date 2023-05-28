var express = require('express');
require('roslib');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Dashboard' });
});

/* GET desc page. */
router.get('/desc', function(req, res, next) {
  res.render('desc', { title: 'Robot Specs' });
});

router.post('/shutdown', function(req, res, next) {
  // Shut Down the driver with the Relay Action
  res.sendStatus(200)
});

router.post('/poweron', function(req, res, next) {
  // Power ON the driver with the Relay Action
  res.sendStatus(200)
});

module.exports = router;
