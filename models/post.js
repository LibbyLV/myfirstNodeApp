/**
 * Created by tianan on 2016-4-15.
 */
var mongodb = require('./db'),
    markdown = require('markdown').markdown;


function Post(name, title, tags, post) {
    this.name = name;
    this.title = title;
    this.tags = tags;
    this.post = post;

}
module.exports = Post;
//存储一篇文章及其相关信息
Post.prototype.save = function (callback) {
    var date = new Date();
    var time = {
        date: date,
        year: date.getFullYear(),
        month: date.getFullYear() + "-" + date.getMonth(),
        day: date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate(),
        minute: date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate() + " " + date.getHours() + ":" +
            (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes())

    };
    var post = {
        name: this.name,
        title: this.title,
        time: time,
        post: this.post,
        tags: this.tags,
        comments: [],
        pv: 0
    };

    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            collection.insert(post, {safe: true}, function (err) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null);
            });
        });
    });
};
//读取文章及其相关信息
Post.getTen = function (name, page, callback) {

    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            var query = {};
            if (name) {
                query.name = name;
            }
            collection.count(query, function (err, total) {
                collection.find(query, {skip: (page - 1) * 10, limit: 10}).sort({time: -1}).toArray(function (err, docs) {
                    mongodb.close();
                    if (err) {
                        return callback(err);
                    }
                    //解析 markdown 为 html
                    docs.forEach(function (doc) {
                        doc.post = markdown.toHTML(doc.post);
                    });
                    callback(null, docs, total);
                });
            })
        });
    });
};


Post.getOne = function (name, title, day, callback) {

    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }

            collection.findOne({
                "name": name,
                "title": title,
                "time.day": day
            }, function (err, doc) {
                if (err) {
                    //mongodb.close();
                    return callback(err);
                }
                console.log("doc" + JSON.stringify(doc));
                if (doc) {
                    collection.update({
                        "name": name,
                        "time.day": day,
                        "title": title
                    }, {$inc: {"pv": 1}}, function (err) {
                        if (err) {

                            req.flash('error', err);
                            return res.redirect('/');
                        }

                    });
                    doc.post = markdown.toHTML(doc.post);
                    console.log("doc post is " + doc.post);
                    console.log("doc comments is " + doc.comments);
                    doc.comments.forEach(function (comment) {
                        comment.content = markdown.toHTML(comment.content);
                    })

                }
                callback(null, doc);
            });
        });
    });
};


Post.edit = function (name, title, day, callback) {

    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }

            collection.findOne({
                "name": name,
                "title": title,
                "time.day": day
            }, function (err, doc) {
                if (err) {
                    //mongodb.close();
                    return callback(err);
                }
                console.log("doc" + doc);
                ///doc.post = markdown.toHTML(doc.post);


                callback(null, doc);
            });
        });
    });
};


Post.update = function (name, title, day, post, callback) {

    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }

            collection.update({
                "name": name,
                "title": title,
                "time.day": day
            }, {
                $set: {post: post}
            }, function (err) {
                mongodb.close();
                if (err) {
                    //mongodb.close();
                    return callback(err);
                }


                callback(null);
            });
        });
    });
};

Post.remove = function (name, title, day, callback) {

    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }

            collection.remove({
                "name": name,
                "title": title,
                "time.day": day
            }, {
                w: 1
            }, function (err) {
                mongodb.close();
                if (err) {
                    //mongodb.close();
                    return callback(err);
                }
                callback(null);
            });
        });
    });
};

//返回所有文章存档信息
Post.getArchive = function (callback) {

    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }

            collection.find({}, {
                "name": 1,
                "title": 1,
                "time": 1
            }).sort({
                time: -1
            }).toArray(function (err, docs) {
                mongodb.close();
                if (err) {
                    //mongodb.close();
                    return callback(err);
                }
                console.log("docs is " + docs);
                callback(null, docs);

            });
        });
    });
};


Post.getTags = function (callback) {

    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }

            collection.distinct("tags", function (err, docs) {
                mongodb.close();
                if (err) {
                    //mongodb.close();
                    return callback(err);
                }
                console.log("docs is " + docs);
                callback(null, docs);

            });
        });
    });
};
//返回含有特定标签的所有文章
Post.getTag = function (tag, callback) {
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //查询所有 tags 数组内包含 tag 的文档
            //并返回只含有 name、time、title 组成的数组
            collection.find({
                "tags": tag
            }, {
                "name": 1,
                "time": 1,
                "title": 1
            }).sort({
                time: -1
            }).toArray(function (err, docs) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null, docs);
            });
        });
    });
};


