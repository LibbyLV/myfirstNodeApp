var crypto = require('crypto'),
               User = require('../models/user.js');
var express = require('express');
var app = express.Router();
var flash = require('connect-flash');

/* GET home page. */

app.get('/', function (req, res) {


     res.render('index', { title: '主页',
     user: req.session.user,
     success: req.flash('success').toString(),
     error: req.flash('error').toString()});


});

app.get('/login', function (req, res) {
               res.render('index', { title: '登录',
               user: req.session.user,
               success: req.flash('success').toString(),
               error: req.flash('error').toString()});
});

app.get('/reg', function (req, res) {
               res.render('reg', { title: '注册',
                              user: req.session.user,
                              success: req.flash('success').toString(),
                              error: req.flash('error').toString() });
});
app.post('/login', function (req, res) {
//生成密码的 md5 值
      var md5 = crypto.createHash('md5'),
      password = md5.update(req.body.password).digest('hex');
      //check user existed?
      User.get(req.body.name,function(err,user){
           if(err)
           {
             req.flash('error',err);
             return res.redirect('/');
           }
           if(!user){
             req.flash('err','user is not existed');
             return res.redirect('/login');
           }
           if(password!=user.password){
             req.flash('err','passwd is wrong');
             return res.redirect('/login');
           }
           req.session.user = user;
           req.flash('success','login OK');
           return res.redirect('/');

      });

});



app.post('/reg', function (req, res) {
               console.log("1");
               var name = req.body.name,
                              password = req.body.password,
                              re_password = req.body['repeat-password'];
               if (re_password != password) {
                              req.flash('error', 'not the same the password u input');
                              // app.use(flash('error','err'));
                              console.log("come heare");
                              return res.redirect('/reg');
               }
               var md5 = crypto.createHash('md5'),
                              password = md5.update(req.body.password).digest('hex');
               var newUser = new User({
                              name: name,
                              password: password,
                              email: req.body.email
               });
               User.get(newUser.name, function (err, user) {
                              console.log(" err");
                              if (err) {
                                             req.flash('error', 'err');
                                            // app.use(flash());
                                             console.log(err + " err");
                                             return res.redirect('/');//return reg page
                              }
                              if (user) {
                                             req.flash('error', 'user is already existed');
                                             //app.use(flash());
                                             console.log(err + JSON.stringify(user) + " err");
                                             return res.redirect('/reg');
                              }
                              console.log("come e");
                              newUser.save(function (err, user) {
                                             console.log("come");
                                             if (err) {

                                                            req.flash('error', 'err');
                                                            //  app.use(flash());
                                                            console.log("c3");
                                                            console.log(err);
                                                            return res.redirect('/reg');//return reg page
                                             }
                                             console.log("come123123");
                                             console.log(req.session);
                                             req.session.user = newUser;
                                             console.log("come heare");
                                             //req.flash('success','register success!');
                                             app.use(flash('success', 'OK'));
                                             res.redirect('/');
                              })
               })
});

app.get('/post', function (req, res) {
               res.render('post', {title: '发表'});
});

app.post('/post', function (req, res) {

});

app.get('/logout', function (req, res) {
 req.session.user = null;
 req.flash('success','logout OK');
 return res.redirect('/');
});

function checkNotlogin(req,res){
   if(req.body.user){
     req.flash('error','already login');
     return res.redirect('back');
   }
}
function checklogin(req,res){
   if(!req.body.user){
      req.flash('error','Not login');
      return res.redirect('/login');
   }
}
module.exports = app;
