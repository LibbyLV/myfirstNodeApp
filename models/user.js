var mongodb = require('./db');
var crypto = require('crypto');
var async = require('async');
var mongoose = require('mongoose');

var Userchema = new mongoose.Schema({
    name:String,
    password:String,
    email:String,
    head:String
},{
   collection:'users'
});
module.exports = mongoose.model('User',Userchema);

/*
function User(user) {
               this.name = user.name;
               this.password = user.password;
               this.email = user.email;
};
module.exports = User;

//Save User info

User.prototype.save = function (callback) {
               var md5 = crypto.createHash('md5'),
                   email_MD5 = md5.update(this.email.toLowerCase()).digest('hex');
                   console.log('email_MD5 '+email_MD5);
               var head = "http://www.gravatar.com/avatar/" + email_MD5 + "?s=48";
                   console.log('head: '+head);
               var user = {
                              name: this.name,
                              password: this.password,
                              email: this.email,
                              head: head
               };

               async.waterfall(
                  [function(cb){
                      mongodb.open(function(err,db){
                              cb(err,db);
                      });
                  },
                   function(db,cb){
                      db.collection('users',function(err,collection){
                              cb(err,collection);
                      });
                   },
                   function(collection,cb){
                      collection.insert(user, {safe: true}, function (err, user) {
                                  mongodb.close();
                                  cb(err,user);
                                  if (err) {
                                                 return callback(err);
                                  }
                                  callback(err, user[0]);
                       });
                   }
                  ]
               )
              */
/* mongodb.open(function (err, db) {
                              if (err) {
                                             return callback(err);
                              }
                              db.collection('users', function (err, collection) {
                                             if (err) {
                                                            mongodb.close();
                                                            return callback(err);
                                             }
                                             collection.insert(user, {safe: true}, function (err, user) {
                                                            mongodb.close();
                                                            if (err) {
                                                                           return callback(err);
                                                            }
                                                            callback(null, user[0]);
                                             });
                              });
               });*//*

};

//Read User info
User.get = function (name, callback) {

               async.waterfall(
                    [
                       function(cb){
                          mongodb.open(function (err, db) {
                                          cb(err,db)
                                      }
                          );
                       },
                       function(db,cb){
                          db.collection('users', function (err, collection){
                             cb(err,collection);
                          });
                       },
                       function(collection,cb){
                          collection.findOne({name: name}, function (err, user){
                             mongodb.close();
                             cb(err,user);
                          });
                       }
                    ]
               );
              */
/* mongodb.open(function (err, db) {
                              if (err) {
                                             return callback(err);
                              }
                              db.collection('users', function (err, collection) {
                                             if (err) {
                                                            mongodb.close();
                                                            return callback(err);
                                             }
                                             collection.findOne({name: name}, function (err, user) {
                                                            mongodb.close();
                                                            if (err) {
                                                                           return callback(err);
                                                            }
                                                            callback(null, user);
                                             });
                              });
               });*//*

};*/
