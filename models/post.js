/**
 * Created by tianan on 2016-4-15.
 */
var mongodb = require('./db'),
               markdown = require('markdown').markdown;


function Post(name, title, post) {
               this.name = name;
               this.title = title;
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
                              comments: []
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
Post.getTen = function (name, page,callback) {

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
                                             collection.count(query,function(err,total){
                                                            collection.find(query,{skip:(page-1)*10,limit:10}).sort({time: -1}).toArray(function (err, docs) {
                                                                           mongodb.close();
                                                                           if (err) {
                                                                                          return callback(err);
                                                                           }
                                                                           //解析 markdown 为 html
                                                                           docs.forEach(function (doc) {
                                                                                          doc.post = markdown.toHTML(doc.post);
                                                                           });
                                                                           callback(null, docs,total);
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
                                                            if(doc){
                                                               doc.post = markdown.toHTML(doc.post);
                                                               console.log("doc post is "+doc.post);
                                                               console.log("doc comments is "+doc.comments);
                                                               doc.comments.forEach(function(comment){
                                                               comment.content = markdown.toHTML(comment.content);

                                                               });
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

Post.remove = function (name, title, day,  callback) {

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

