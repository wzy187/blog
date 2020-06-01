var express = require('express');
var router = express.Router();
var db = require("../database/db");
var fs = require("fs");
var path = require("path");
var multer = require("multer");
var moment = require("moment");
moment.locale('zh-CN');
require('moment/locale/zh-cn');
//设定图片存放位置
var upload = multer({dest: './public/uploads'});
//分类展示
router.get('/category/:id', function (req, res, next) {
    var data = {};
    if(req.session.user){
        data.user = req.session.user;
    }

    //将获取到的参数id转换为整数类型
    var cid = parseInt(req.params.id);

    //每页显示数量
    var pageSize = 3;

    //当前的页码
    var page = !req.query.page||parseInt(req.query.page)<1? 1:parseInt(req.query.page);

    data.page=page;
    data.category_id=cid;

    var fenye = " limit "+(page-1)*pageSize+","+pageSize;
    var sql = "select count(*) as total from articles where category_id="+cid;
    db.query(sql,function(error,result){
        data.pageCount = Math.ceil(result[0].total/pageSize);
    })
    var sql = "select * from category where id";
    db.query(sql, function (error, category) {
        if (!error) {
            data.category = category;
        }
        var sql = "select * from articles where category_id=" + cid +fenye;
        db.query(sql, function (error, articles) {
            if (!error) {

                data.articles = articles;

            }
            res.render('articles/list', {data: data});
        })
    })
})
//搜索
router.get('/search', function (req, res, next) {
    var data = {};
    if(req.session.user){
        data.user = req.session.user;
    }
    var ssz = req.query.keywords;
    var sql = "select * from articles where title like '%" + ssz + "%' or content like '%" + ssz + "%'";
    db.query(sql, function (error, articles) {
        if (!error) {
            data.articles = articles;
            res.render('articles/search', {data: data});
        }
    })
});
//发布文章
router.get('/add', function (req, res, next) {
    var data = {};

    if(req.session.user){
        data.user = req.session.user;
    }else{
        res.redirect("/users/login");
    }
    sql = "select * from category where id";
    db.query(sql, function (error, category) {
        if (!error) {
            data.category = category;
            res.render('articles/add', {data: data});
        }
        data = {};
    })
})
router.post('/store', upload.single('pic'), function (req, res, next) {
    var title = req.body.title;
    var content = req.body.content;
    var category_id = req.body.category_id;
    var user_id = req.body.id;
    var create_time = moment().format('YYYY/MM/DD hh:mm');
    var update_at = moment().format('YYYY/MM/DD hh:mm');

    if (req.file) {
        var extname = path.extname(req.file.originalname);

        //获取的文件名
        var newname = req.file.filename + extname;
        if (!newname) {
            newname = 'dmw.jpg';
        }
        // 原来路径和名称oldpath
        var oldpath = './public/uploads/' + req.file.filename;

        var newpath = oldpath + extname;
        fs.rename(oldpath, newpath, (err) => {

        })
    } else {
        newname = 'dmw.jpg';
    }


    var sql = "insert into articles (title,content,category_id,user_id,create_time,update_at,pic) values (?,?,?,?,?,?,?)";
    var params = [title, content, category_id, user_id,create_time,update_at, newname];
    db.query(sql, params, function (error, result) {
        if (result.insertId > 0) {
            res.redirect("/article/category/" + category_id);
        } else {
            res.redirect("back");
        }
    })
})
//文章详情
router.get('/show/:id', function (req, res, next) {

    var data = {};
    if(req.session.user){
        data.user = req.session.user;
    }

    var sql = "select * from category order by id";
    db.query(sql, function (error, category) {
        if (!error) {
            data.category = category;
        }

        //获取url中的:id所代表的值。  /5   相当于：req.pramas.id=5
        var sid = req.params.id;
        var sql = "select * from articles where id=" + sid;

        db.query(sql, function (error, articles) {
            if (!error) {
                //更新浏览次数
                db.query("update articles set views=views+1 where id=" + sid, function (error, result) {

                });

                data.article = articles[0];

                var userid = articles[0].user_id;
                var sql = "select * from users where id=" + userid;

                db.query(sql, function (error, users) {
                    if (!error) {
                        data.article.user = users[0];
                        res.render("articles/show", {data: data});
                    }
                });
            }
        })

    });

});
//修改
router.get("/edit/:id", function (req, res, next) {

    var data = {};
    if(req.session.user){
        data.user = req.session.user;
    }else{
        res.redirect("/users/login");
    }
    var id = req.params.id;

    var sql = "select * from category order by id";

    db.query(sql, function (error, category) {
        if (!error) {
            data.category = category;
        }
        var sql = "select * from articles where id="+id;
        console.log(sql)
        db.query(sql, function (err, articles) {
            if (!err) {
                data.article = articles[0];
                res.render("articles/edit",{data: data});
            }
        })
    })
})
router.post("/update",upload.single('pic'),function(req,res,next){

    let id = req.body.id;
    let title = req.body.title;
    let content = req.body.content;
    let category_id = req.body.category_id;
    var update_at = moment().format("YYYY/MM/DD hh:mm");

    if (req.file){
        var extname = path.extname(req.file.originalname);
        var newname = req.file.filename+extname;
        // if(!newname){
        //     console.log("默认图");
        //     newname='default.jpg';
        // }
        // 原来路径和名称oldpath  './public/uploads/39e20fdfa2400d433d04aad63f95e786'
        var oldpath = './public/uploads/'+req.file.filename;

        //改名后路径和名称
        var newpath = oldpath+extname;
        fs.rename(oldpath,newpath,(err)=>{

            if(!err) console.log("修改成功");
        })
    }else{
        var newname='dmw.jpg';
    }
    var sql = "update articles set title=?,category_id=?,content=?,pic=?,update_at=? where id=?";
    var params = [title,category_id,content,newname,update_at,id];
    console.log(params);
    db.query(sql,params,function(error,results){
        if (!error && results.affectedRows>0){
            console.log(123);
            res.redirect("/article/category/"+category_id);
        }else{
            res.redirect("back");
        }
    })
})
//删除
router.get("/drop/:id",function(req,res,next){
    var data={};
    if(req.session.user){
        data.user = req.session.user;
    }else{
        res.redirect("/users/login");
    }
    var id = req.params.id;
    var sql = "delete from articles where id="+id;
    console.log(sql);
    db.query(sql,function(error,articles){
        if (!error&&articles.affectedRows>0){
            res.redirect("back");
        }else{
            res.redirect("back");
            console.log("删除错误");
        }
    })
})
//markdown
router.post("/upload",upload.single('editormd-image-file'),function(req,res,next){
    var extname = path.extname(req.file.originalname);

    //存到数据库
    var newname = req.file.filename+extname;

    // 原来路径和名称oldpath  './public/uploads/39e20fdfa2400d433d04aad63f95e786'
    var oldpath = './public/uploads/'+req.file.filename;

    //改名后路径和名称
    var newpath = oldpath+extname;

    fs.rename(oldpath,newpath,(err)=>{

        if (err) {
            res.json({
                success: 0,
                message: '上传失败',
                url: ''
            })
        } else {
            res.json({
                success: 1,
                message: '上传成功',
                url: '/uploads/' + newname
            })
        }
    })
})
module.exports = router;
