var express = require('express');
var router = express.Router();
var db = require('../database/db');
/* GET home page. */
router.get('/', function(req, res, next) {
  var data = {};
  if(req.session.user){
    data.user = req.session.user;
  }
  var sql = "select * from articles where id limit 3";
  db.query(sql,function (error,cate) {
    if (!error){
      data.articles=cate;

    }
    var sql = "select * from category order by id asc";
    db.query(sql,function (error,category) {
        if (!error){
          data.category=category;
          res.render('index',{data:data});
        }
    })
  })

});



module.exports = router;
