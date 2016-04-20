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

               }
               var post = {
                              name: this.name,
                              title: this.title,
                              time: time,
                              post: this.post
               }

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
}
//读取文章及其相关信息
Post.getAll = function (name, callback) {

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
                                             collection.find(query).sort({time: -1}).toArray(function (err, docs) {
                                                            mongodb.close();
                                                            if (err) {
                                                                           return callback(err);
                                                            }
                                                            //解析 markdown 为 html
                                                            docs.forEach(function (doc) {
                                                                           doc.post = markdown.toHTML(doc.post);
                                                            });
                                                            callback(null, docs);
                                             });
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
                                                            console.log("doc" + doc);
                                                            doc.post = markdown.toHTML(doc.post);


                                                            callback(null, doc);
                                             });
                              });
               });
};

