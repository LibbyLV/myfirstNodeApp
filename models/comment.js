/**
 * Created by tianan on 2016-4-21.
 */
var mongodb = require('./db'),
               markdown = require('markdown').markdown;


function Comment(name, title, comment) {
               this.name = name;
               this.title = title;
               this.comment = comment;

}
module.exports = Comment;