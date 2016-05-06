/**
 * Created by tianan on 2016-4-21.
 */
var mongoose = require('mongoose');
var paginate = require('mongoose-paginate');


var CommentSchema = new mongoose.Schema({
               name: String,
               head:String,
               title: String,
               time: Date,
               email:String,
               comment: {
                              name: String,
                              head: String,
                              email: String,
                              website: String,
                              time: Date,
                              content: String
               }


});

CommentSchema.plugin(paginate);
module.exports = mongoose.model('Comment', CommentSchema);


/*
function Comment(name, title, day, comment) {
               this.name = name;
               this.title = title;
               this.day = day;
               this.comment = comment;

}
module.exports = Comment;
Comment.prototype.save = function (callback) {
               var name = this.name,
                              title = this.title,
                              day = this.day,
                              comment = this.comment;

               mongodb.open(function (err, db) {
                              if (err) {
                                             return callback(err);
                              }
                              db.collection('posts', function (err, collection) {
                                             if (err) {
                                                            mongodb.close();
                                                            return callback(err);
                                             }
                                             //通过用户名、时间及标题查找文档，并把一条留言对象添加到该文档的 comments 数组里
                                             collection.update({
                                                            "name": name,
                                                            "title": title,
                                                            "time.day": day
                                             }, {
                                                            $push: {"comments": comment}
                                             }, function (err) {
                                                            mongodb.close();
                                                            if (err) {
                                                                           return callback(err);
                                                            }
                                                            //console.log("comments: "+comments);
                                                            callback(null);
                                             });
                              });
               });
};*/
