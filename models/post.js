/**
 * Created by tianan on 2016-4-15.
 */

var Db = require('./db');
var markdown = require('markdown').markdown;
var poolModule = require('generic-pool');
var ObjectID = require('mongodb').ObjectID;
var mongoose = require('mongoose');
var paginate = require('mongoose-paginate');



var  PostSchema = new mongoose.Schema({
               name: String,
               head: String,
               title: String,
               time: Date,
               post: String,
               tags: Array,
               comments: [{
                              name: String,
                              head: String,
                              email: String,
                              website: String,
                              time: Date,
                              content: String
               }],
               reprint_info: {
                    reprint_from :{type:String},
                    reprint_to : {type:String}
               },
               pv: {
                    type:Number,
                    default:0
               }
});

PostSchema.plugin(paginate);
module.exports = mongoose.model('Post',PostSchema);


var pool = poolModule.Pool({
               name: 'mongoPool',
               create: function (callback) {
                              var mongodb = Db();
                              mongodb.open(function (err, db) {
                                             callback(err, db);
                              })
               },
               destroy: function (mongodb) {
                              mongodb.close();
               },
               max: 100,
               min: 5,
               idleTimeoutMillis: 30000,
               log: true

});

function Post(name, head, title, tags, post) {
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
                              reprint_info: {},
                              pv: 0

               };

               pool.acquire(function (err, db) {
                              if (err) {
                                             return callback(err);
                              }
                              db.collection('posts', function (err, collection) {
                                             if (err) {
                                                            pool.release(mongodb);
                                                            //pool.release();
                                                            return callback(err);
                                             }
                                             collection.insert(post, {safe: true}, function (err) {
                                                            pool.release(mongodb);
                                                            //pool.release();
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

               pool.acquire(function (err, db) {
                              if (err) {
                                             return callback(err);
                              }
                              db.collection('posts', function (err, collection) {
                                             if (err) {
                                                            pool.release();
                                                            return callback(err);
                                             }
                                             var query = {};
                                             if (name) {
                                                            query.name = name;
                                             }
                                             collection.count(query, function (err, total) {
                                                            collection.find(query, {skip: (page - 1) * 10, limit: 10}).sort({time: -1}).toArray(function (err, docs) {
                                                                           pool.release();
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


Post.getOne = function (_id, callback) {

               pool.acquire(function (err, db) {
                              if (err) {
                                             return callback(err);
                              }
                              db.collection('posts', function (err, collection) {
                                             if (err) {
                                                            pool.release();
                                                            return callback(err);
                                             }

                                             collection.findOne({
                                                            "_id": new ObjectID(_id)
                                             }, function (err, doc) {
                                                            if (err) {
                                                                           //pool.release();
                                                                           return callback(err);
                                                            }
                                                            console.log("doc" + JSON.stringify(doc));
                                                            if (doc) {
                                                                           collection.update({
                                                                                          "_id": new ObjectID(_id)
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

               pool.acquire(function (err, db) {
                              if (err) {
                                             return callback(err);
                              }
                              db.collection('posts', function (err, collection) {
                                             if (err) {
                                                            pool.release();
                                                            return callback(err);
                                             }

                                             collection.findOne({
                                                            "name": name,
                                                            "title": title,
                                                            "time.day": day
                                             }, function (err, doc) {
                                                            if (err) {
                                                                           //pool.release();
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

               pool.acquire(function (err, db) {
                              if (err) {
                                             return callback(err);
                              }
                              db.collection('posts', function (err, collection) {
                                             if (err) {
                                                            pool.release();
                                                            return callback(err);
                                             }

                                             collection.update({
                                                            "name": name,
                                                            "title": title,
                                                            "time.day": day
                                             }, {
                                                            $set: {post: post}
                                             }, function (err) {
                                                            pool.release();
                                                            if (err) {
                                                                           //pool.release();
                                                                           return callback(err);
                                                            }


                                                            callback(null);
                                             });
                              });
               });
};

Post.remove = function (name, title, day, callback) {

               pool.acquire(function (err, db) {
                              if (err) {
                                             return callback(err);
                              }
                              db.collection('posts', function (err, collection) {
                                             if (err) {
                                                            pool.release();
                                                            return callback(err);
                                             }
                                             collection.findOne({
                                                            "name": name,
                                                            "title": title,
                                                            "time.day": day}, function (err, doc) {
                                                            //如果有 reprint_from，即该文章是转载来的，先保存下来 reprint_from
                                                            var reprint_from = "";
                                                            if (doc.reprint_info.reprint_from) {
                                                                           reprint_from = doc.reprint_info.reprint_from;
                                                            }
                                                            if (reprint_from != "" && reprint_from != undefined) {
                                                                           //更新原文章所在文档的 reprint_to
                                                                           collection.update({
                                                                                          "name": reprint_from.name,
                                                                                          "title": reprint_from.title,
                                                                                          "time.day": reprint_from.day}, {
                                                                                          $pull: {
                                                                                                         "reprint_info.reprint_to": {
                                                                                                                        "name": name,
                                                                                                                        "title": title,
                                                                                                                        "day": day
                                                                                                         }
                                                                                          }
                                                                           }, function (err) {
                                                                                          if (err) {
                                                                                                         pool.release();
                                                                                                         return callback(err);
                                                                                          }
                                                                           });
                                                            }

                                                            collection.remove({
                                                                           "name": name,
                                                                           "title": title,
                                                                           "time.day": day
                                                            }, {
                                                                           w: 1
                                                            }, function (err) {
                                                                           pool.release();
                                                                           if (err) {
                                                                                          //pool.release();
                                                                                          return callback(err);
                                                                           }
                                                                           callback(null);
                                                            });
                                             });
                              });
               });
};

//返回所有文章存档信息
Post.getArchive = function (callback) {

               pool.acquire(function (err, db) {
                              if (err) {
                                             return callback(err);
                              }
                              db.collection('posts', function (err, collection) {
                                             if (err) {
                                                            pool.release();
                                                            return callback(err);
                                             }

                                             collection.find({}, {
                                                            "name": 1,
                                                            "title": 1,
                                                            "time": 1
                                             }).sort({
                                                            time: -1
                                             }).toArray(function (err, docs) {
                                                            pool.release();
                                                            if (err) {
                                                                           //pool.release();
                                                                           return callback(err);
                                                            }
                                                            console.log("docs is " + docs);
                                                            callback(null, docs);

                                             });
                              });
               });
};


Post.getTags = function (callback) {

               pool.acquire(function (err, db) {
                              if (err) {
                                             return callback(err);
                              }
                              db.collection('posts', function (err, collection) {
                                             if (err) {
                                                            pool.release();
                                                            return callback(err);
                                             }

                                             collection.distinct("tags", function (err, docs) {
                                                            pool.release();
                                                            if (err) {
                                                                           //pool.release();
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
               pool.acquire(function (err, db) {
                              if (err) {
                                             return callback(err);
                              }
                              db.collection('posts', function (err, collection) {
                                             if (err) {
                                                            pool.release();
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
                                                            pool.release();
                                                            if (err) {
                                                                           return callback(err);
                                                            }
                                                            callback(null, docs);
                                             });
                              });
               });
};


Post.search = function (keyword, callback) {
               pool.acquire(function (err, db) {
                              if (err) {
                                             return callback(err);
                              }
                              db.collection('posts', function (err, collection) {
                                             if (err) {
                                                            pool.release();
                                                            return callback(err);
                                             }
                                             var pattern = new RegExp(keyword, "gi");

                                             //查询所有 tags 数组内包含 tag 的文档
                                             //并返回只含有 name、time、title 组成的数组
                                             collection.find({
                                                            "title": pattern
                                             }, {
                                                            "name": 1,
                                                            "time": 1,
                                                            "title": 1
                                             }).sort({
                                                            time: -1
                                             }).toArray(function (err, docs) {
                                                            pool.release();
                                                            if (err) {
                                                                           return callback(err);
                                                            }
                                                            console.log("search docs is " + docs);
                                                            callback(null, docs);
                                             });
                              });
               });
};


Post.reprint = function (reprint_from, reprint_to, callback) {

               pool.acquire(function (err, db) {
                              if (err) {
                                             return callback(err);
                              }
                              db.collection('posts', function (err, collection) {
                                             if (err) {
                                                            pool.release();
                                                            return callback(err);
                                             }

                                             //找到被转载的文章的原文档/*
                                             collection.findOne({
                                                            "name": reprint_from.name,
                                                            "title": reprint_from.title,
                                                            "time.day": reprint_from.day
                                             }, function (err, doc) {
                                                            if (err) {
                                                                           pool.release();
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
                                                                           doc.reprint_info = {"reprint_from": reprint_from},
                                                                           doc.pv = 0;


                                                            if (doc) {
                                                                           //更新被转载的原文档的 reprint_info 内的 reprint_to
                                                                           collection.update({
                                                                                          "name": reprint_from.name,
                                                                                          "time.day": reprint_from.day,
                                                                                          "title": reprint_from.title
                                                                           }, {$push: {"reprint_info.reprint_to": {
                                                                                          "name": doc.name,
                                                                                          "day": time.day,
                                                                                          "title": doc.title
                                                                           }}}, function (err) {
                                                                                          if (err) {
                                                                                                         pool.release();
                                                                                                         return callback(err);

                                                                                          }

                                                                           });


                                                            }
                                                            //将转载生成的副本修改后存入数据库，并返回存储后的文档
                                                            collection.insert(doc, {
                                                                           safe: true
                                                            }, function (err, post) {
                                                                           if (err) {
                                                                                          return err;
                                                                           }
                                                                           callback(null, post[0]);
                                                            });

                                             });
                              });
               });
};



