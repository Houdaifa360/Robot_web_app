var express = require('express');
var roslib = require('roslib')
var router = express.Router();

const ros = new roslib.Ros({ url: 'ws://localhost:9090' });


router.get('/gas', function(req, res, next) {
  let obj = {
    co: Math.floor(Math.random() * 2),
    lpg: Math.floor(Math.random() * 2),
    ch4: Math.floor(Math.random() * 2)+5,
  }
  res.json(obj);
});

//router.get('/temp', function(req, res, next) {
  //let obj = {
    //temp: Math.floor(Math.random() * 5) + 20,
  //}
  //res.json(obj);
//});

router.get('/flame', function(req, res, next) {
  let obj = {
    flame: Math.floor(Math.random() * 10),
  }
  res.json(obj);
});

router.get('/temp', (req, res) => {
  

  
});


module.exports = router;
