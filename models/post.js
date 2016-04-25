/**
 * Created by tianan on 2016-4-15.
 */
var mongodb = require('./db'),
    markdown = require('markdown').markdown;


function Post(name,head, title, tags, post) {
    this.name = name;
    this.head = head;
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
        head: this.head,
        title: this.title,
        time: time,
        post: this.post,
        tags: this.tags,
        comments: [],
        reprint_info:{},
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




Post.search = function (keyword, callback) {
               mongodb.open(function (err, db) {
                              if (err) {
                                             return callback(err);
                              }
                              db.collection('posts', function (err, collection) {
                                             if (err) {
                                                            mongodb.close();
                                                            return callback(err);
                                             }
                                             var pattern = new RegExp(keyword,"gi");

                                             //查询所有 tags 数组内包含 tag 的文档
                                             //并返回只含有 name、time、title 组成的数组
                                             collection.find({
                                                            "title":pattern
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
                                                            console.log("search docs is "+docs);
                                                            callback(null, docs);
                                             });
                              });
               });
};



Post.reprint = function (reprint_from, reprint_to,  callback) {

               mongodb.open(function (err, db) {
                              if (err) {
                                             return callback(err);
                              }
                              db.collection('posts', function (err, collection) {
                                             if (err) {
                                                            mongodb.close();
                                                            return callback(err);
                                             }

                              // /* name: this.name,
                                            /* head: this.head,
                                                            title: this.title,
                                                            time: time,
                                                            post: this.post,
                                                            tags: this.tags,
                                                            comments: [],
                                                            reprint_info:{},
                                             pv: 0*/
                              // */


                                             //找到被转载的文章的原文档/*
                                             collection.findOne({
                                                            "name": reprint_from.name,
                                                            "title": reprint_from.title,
                                                            "time.day": reprint_from.day
                                             }, function (err, doc) {
                                                            if (err) {
                                                                           mongodb.close();
                                                                           return callback(err);
                                                            }
                                                            console.log("doc" + JSON.stringify(doc));
                                                            delete doc._id;//注意要删掉原来的 _id

                                                            var date = new Date(),
                                                            time = {
                                                                           date: date,
                                                                           year: date.getFullYear(),
                                                                           month: date.getFullYear() + "-" + date.getMonth(),
                                                                           day: date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate(),
                                                                           minute: date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate() + " " + date.getHours() + ":" +
                                                                                          (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes())

                                                            };
                                                            doc.name = reprint_from.name,
                                                            doc.head = reprint_from.head,
                                                            doc.time = time,
                                                            doc.title = (doc.title.search(/[转载]/) > -1) ? doc.title : "[转载]" + doc.title,
                                                            doc.comments = [],
                                                            doc.reprint_info = {"reprint_from":reprint_from},
                                                            doc.pv = 0;


                                                            if (doc) {
                                                                           //更新被转载的原文档的 reprint_info 内的 reprint_to
                                                                           collection.update({
                                                                                          "name": reprint_from.name,
                                                                                          "time.day": reprint_from.day,
                                                                                          "title": reprint_from.title
                                                                           }, {$push:{"reprint_info.reprint_to":{
                                                                                          "name": doc.name,
                                                                                          "day": time.day,
                                                                                          "title": doc.title
                                                                           }}}, function (err) {
                                                                                          if (err) {

                                                                                                         req.flash('error', err);
                                                                                                         return res.redirect('/');
                                                                                          }

                                                                           });


                                                            }
                                                            //将转载生成的副本修改后存入数据库，并返回存储后的文档
                                                            collection.insert('doc',{
                                                                           safe:true
                                                            },function(err,post){
                                                                           if(err){
                                                                               return err;
                                                                           }
                                                                           callback(null, post[0]);
                                                            });

                                             });
                              });
               });
};



