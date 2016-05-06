/*var settings = require('../settings'),
Db = require('mongodb').Db,
Connection = require('mongodb').Connection,
Server = require('mongodb').Server;
var mongoose = require('mongoose');
module.exports=function(){
return new Db(settings.db,new Server(settings.host,settings.port),{safe:true,poolSize:1});
}*/

var mongoose = require('mongoose');
var db = function (){
     mongoose.connect('mongodb://localhost/blog');
};


module.exports = db();


/**
 * Created by Administrator on 2016/3/26.
 */
