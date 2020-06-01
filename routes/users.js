var express = require('express');
var router = express.Router();
var db = require('../database/db');
var fs = require("fs");
var path = require("path");
var multer = require("multer");
var jiami = require("../plugin/jiami");
var moment = require("moment");
moment.locale('zh-CN');
require('moment/locale/zh-cn');
/* GET users listing. */
var upload = multer({dest: './public/uploads'});
//登录
router.get('/login', function (req, res, next) {
    res.render("users/login");
})
router.post('/login', function (req, res, next) {
    var username = req.body.username;
    var userpwd = jiami.md5(req.body.userpwd);

    var sql = "select * from users where username='" + username + "'and userpwd='" + userpwd + "'";
    db.query(sql, function (error, users) {
        if (!error) {
            req.session.user = users[0];
            res.redirect("/");
        }
    })

})
//退出
router.get('/logout', function (req, res, next) {
    req.session.destroy(function (err) {
        if (!err) {
            res.redirect("/");
        }
    })
})

//注册
router.get('/registor', function (req, res, next) {
    var data = {};
    res.render('users/registor', {data: data});
})
router.post('/registor',upload.single('user_avatar'), function (req, res, next) {

    var username = req.body.username;
    var userpwd = req.body.userpwd;
    var reuserpwd = req.body.reuserpwd;
    var email = req.body.email;
    var last_ip = req.ip;
    var User_creation_time = moment().format('YYYY/MM/DD hh:mm');
    if(req.file) {
        var extname = path.extname(req.file.originalname);

        //获取的文件名
        var newname = req.file.filename + extname;
        // 原来路径和名称oldpath
        var oldpath = './public/uploads/' + req.file.filename;

        var newpath = oldpath + extname;
        fs.rename(oldpath, newpath, (err) => {

        })
    } else {
        newname = 'dmw.jpg';
    }
    if (userpwd != reuserpwd) {
        req.session.error = {
            message: "两次输入的密码不相同"
        }
        res.redirect('back');
    }

    var sql = "insert into users(username,userpwd,email,User_creation_time,last_ip,user_avatar)values(?,?,?,?,?,?)";
    var params = [username,jiami.md5(userpwd),email,User_creation_time,last_ip,newname];
    db.query(sql, params, function (error, users) {

        if (!error && users.insertId > 0) {
            req.session.user = {
                id: users.insertId,
                username: username,
                email: email,
                User_creation_time:User_creation_time,
                user_avatar:newname
            }
            res.redirect("/");
        } else {
            res.redirect("back");
        }
    })
})
//用户个人中心
router.get('/info', function (req, res, next) {
    var data = {};
    if(req.session.user){
         data.user = req.session.user;
        res.render('users/info',{data:data});
    } else{
        res.redirect("/users/login");
    }
})
router.post('/info',upload.single('user_avatar'),function(req,res,next){
    var data = {};
    if(req.session.user){
        data.user = req.session.user;
        if(req.file){
            var extname = path.extname(req.file.originalname);

            //存到数据库
            var newname = req.file.filename+extname;
            // 原来路径和名称oldpath  './public/uploads/39e20fdfa2400d433d04aad63f95e786'
            var oldpath = './public/uploads/'+req.file.filename;

            //改名后路径和名称
            var newpath = oldpath+extname;

            fs.rename(oldpath,newpath,(err)=>{
            })
        }else{
            var newname=req.session.user.user_avatar;
        }
    }else{
        res.redirect("/users/login");
    }

    var user_avatar = newname;
    var email = req.body.email;
    var userpwd = req.body.userpwd;
    var username = req.body.username;
    console.log(email,userpwd,username)
    var sql = "select *  from users where email='"+email+"'";
    db.query(sql,function(error,cate){
        if(!error&&cate.length>0&&cate[0].id != req.session.user.id){
            req.session.message={type:"warning",msg:"该邮箱已被使用，请重新输入"}
            res.redirect("back");
            return;
        }else{
            var sql = "update users set user_avatar=?,username=?,userpwd=?,email=? where id="+req.session.user.id;
            var params = [newname,username,jiami.md5(userpwd),email];
            db.query(sql,params,function(error,users){
                if (!error&&users.affectedRows>0){
                    res.render('',{data:data});
                    req.session.user.email = email;
                    req.session.user.user_avatar = user_avatar;
                    req.session.user.userpwd = userpwd;
                    req.session.user.username = username;
                    res.redirect('/')

                }else{
                    res.redirect("back");
                }

            })
        }
    })


})

module.exports = router;
