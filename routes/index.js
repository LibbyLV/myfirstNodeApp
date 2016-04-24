var crypto = require('crypto'),
    User = require('../models/user.js');
var express = require('express');
var app = express.Router();
var flash = require('connect-flash');
var Post = require('../models/post.js');
var Comment = require('../models/comment.js');

/* GET home page. */

app.get('/', function (req, res) {
    var page = parseInt(req.query.p) || 1;
    Post.getTen(null, page, function (err, posts, total) {
        if (err) {
            posts = [];
        }
        res.render('index', { title: '主页',
            posts: posts,
            page: page,
            isFirstPage: (page - 1) == 0,
            isLastPage: ((page - 1) * 10 + posts.length) == total,
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()});
    });
});
app.get('/login', checkNotLogin);
app.get('/login', function (req, res, posts) {
    res.render('login', { title: '登录',
        user: req.session.user,
        posts: posts,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()});
});
app.get('/reg', checkNotLogin);
app.get('/reg', function (req, res) {
    res.render('reg', { title: '注册',
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString() });
});
app.post('/login', checkNotLogin);
app.post('/login', function (req, res) {
//生成密码的 md5 值
    var md5 = crypto.createHash('md5'),
        password = md5.update(req.body.password).digest('hex');
    //check user existed?
    User.get(req.body.name, function (err, user) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/');
        }
        if (!user) {
            req.flash('err', 'user is not existed');
            return res.redirect('/login');
        }
        if (password != user.password) {
            req.flash('err', 'passwd is wrong');
            return res.redirect('/login');
        }
        req.session.user = user;
        req.flash('success', 'login OK');
        return res.redirect('/');

    });

});


app.post('/reg', checkNotLogin);
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
app.get('/post', checkLogin);
app.get('/post', function (req, res) {
    res.render('post', {title: '发表',
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()})
});
app.post('/post', checkLogin);
app.post('/post', function (req, res) {
    var currentUser = req.session.user;
    var tags = [req.body.tag1,req.body.tag2,req.body.tag3];
    var post = new Post(currentUser.name, req.body.title,tags, req.body.post);
    post.save(function (err, post) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/');
        }
        req.flash('success', 'post OK');
        res.redirect('/');
    })
});
app.get('/logout', checkLogin);
app.get('/logout', function (req, res) {
    req.session.user = null;
    req.flash('success', 'logout OK');
    return res.redirect('/');
});


app.get('/upload', checkLogin);
app.get('/upload', function (req, res) {
    res.render('upload', {
        title: 'upload files',
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()});
});

app.post('/upload', checkLogin);
app.post('/upload', function (req, res) {
    //req.session.user = null;
    req.flash('success', 'upload OK');
    res.redirect('/upload');
});
app.get('/archive', function (req, res) {
    Post.getArchive(function (err, posts) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/')
            }
            res.render('archive', {
                    title: '存档',
                    posts: posts,
                    user: req.session.user,
                    success: req.flash('success').toString(),
                    error: req.flash('error').toString()
                }
            )
        }
    )

});



app.get('/tags', function (req, res) {
    Post.getTags(function (err, posts) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/')
            }
            res.render('tags', {
                    title: '存档',

                    posts: posts,
                    user: req.session.user,
                    success: req.flash('success').toString(),
                    error: req.flash('error').toString()
                }
            )
        }
    )

});

app.get('/tags/:tag',function(req,res){
    Post.getTag(req.params.tag,function (err, posts) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/')
            }
            console.log('posts is '+JSON.stringify(posts));
            res.render('tag', {
                    title: "TAG"+req.params.tag,
                    posts: posts,
                    user: req.session.user,
                    success: req.flash('success').toString(),
                    error: req.flash('error').toString()
                }
            )
        }
    )

});

app.get('/u/:name', function (req, res) {
    var page = parseInt(req.query.p) || 1;
    User.get(req.params.name, function (err, user) {
        if (!user) {
            req.flash('error', err);
            return res.redirect('/');
        }
        Post.getTen(user.name, page, function (err, posts, total) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            console.log("posts" + JSON.stringify(posts));
            res.render('user', {
                title: user.name,
                posts: posts,
                user: req.session.user,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * 10 + posts.length) == total,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });

        })
    });
});

app.get('/u/:name/:title/:day', function (req, res) {
    //console.log(req.param.name+"-"+ req.param.title+"-"+ req.param.day);
    Post.getOne(req.params.name, req.params.title, req.params.day, function (err, post) {
        console.log(req.params.title + " " + req.params.day);
        if (err) {
            req.flash('error', err);
            return res.redirect('/');
        }
        res.render('article', {
            title: req.params.title,
            post: post,
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });
});
app.get('/edit/:name/:title/:day', checkLogin);
app.get('/edit/:name/:title/:day', function (req, res) {
    var currrentUser = req.session.user;
    Post.edit(currrentUser.name, req.params.title, req.params.day, function (err, post) {
        //console.log(req.params.title+" "+req.params.day );
        if (err) {
            req.flash('error', err);
            return res.redirect('/');
        }
        res.render('edit', {
            title: 'EDIT',
            post: post,
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });
});

app.post('/edit/:name/:title/:day', checkLogin);
app.post('/edit/:name/:title/:day', function (req, res) {
    var currrentUser = req.session.user;
    Post.update(currrentUser.name, req.params.title, req.params.day, req.body.post, function (err) {
        var url = encodeURI('/u/' + req.params.name + '/' + req.params.title + '/' + req.params.day);
        if (err) {
            req.flash('error', err);
            return res.redirect(url);
        }
        req.flash('success', 'CHANGE SUCCESS');
        res.redirect(url);
    })
});

app.get('/remove/:name/:title/:day', checkLogin);
app.get('/remove/:name/:title/:day', function (req, res) {
    var currrentUser = req.session.user;
    Post.remove(currrentUser.name, req.params.title, req.params.day, function (err) {
        //console.log(req.params.title+" "+req.params.day );
        if (err) {
            req.flash('error', err);
            return res.redirect('back');
        }
        req.flash('success', 'REMOVE SUCCESS');
        res.redirect('/');

    });
});

app.post('/u/:name/:title/:day', function (req, res) {
    var date = new Date(),
        time = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " "
            + date.getHours() + (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes());
    var comment = {
        name: req.body.name,
        email: req.body.email,
        website: req.body.website,
        time: time,
        content: req.body.content
    };
    var newComment = new Comment(req.params.name,  req.params.title,req.params.day, comment);

    newComment.save(function (err) {
        if (err) {
            req.flash('error', 'err');
            return res.redirect('/');
        }
        console.log("comment is "+ JSON.stringify(comment));
        req.flash('success', 'REPLY OK');
        //req.flash('success', po);
        res.redirect('/');
    });
});


function checkNotLogin(req, res, next) {
    if (req.session.user) {
        req.flash('error', 'already login');
        return res.redirect('back');
    }
    next();
}
function checkLogin(req, res, next) {
    if (!req.session.user) {
        req.flash('error', 'Not login');
        return res.redirect('/login');
    }
    next();
}
module.exports = app;
