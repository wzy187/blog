var express = require('express');
var router = express.Router();
var db = require("../../database/db");

router.get("/all",function (req,res,next) {
    var sql = "select * from articles order by id";
    db.query(sql,function(error,results){
        if (!error && results.length>0){
            var data = {
                type:"success",
                type_code:200,
                message:'获取文章数据成功',
                data:results
            }
            res.json(data);
        }else{
            var data = {
                type:"warning",
                type_code:600,
                message:'获取文章失败',
                data:{}
            }
            res.json(data);
        }
    })
})
module.exports = router;
