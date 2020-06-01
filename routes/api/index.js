var express = require('express');
var router = express.Router();
var db = require('../../database/db');


router.get("/",function (request,response,next) {
    var sql = "select * from category order by id asc";
    db.query(sql,function (error,results) {

        if(!error && results.length>0){
            var data = {
                type:"success",
                type_code:200,
                message:'获取分类数据成功',
                data:results
            };
            response.json(data);
        }else{
            var data = {
                type:"warning",
                type_code:600,
                message:'获取数据失败',
                data:{}
            };

            response.json(data);
        }
    });
});

module.exports = router;
