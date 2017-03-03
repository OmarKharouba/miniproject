var passport = require('passport');
var User = require('./models/user');
var LocalStrategy = require('passport-local').Strategy;

passport.use('login',new LocalStrategy(
    function(username,password,done){
        User.findOne({username : username},function(err,user){
            if(err){
                return done(err);
            }
            if(!user){
                return done(null,false,{message : 'This username does not exist'});
            }
            user.checkPassword(password,function(err,correct){
                if(err){
                    return done(err);
                }
                if(correct){
                    return done(null,user,{message : 'You have successfully loged in'});
                }else{
                    return done(null,false,{message : 'The Password is not correct'});
                }
            });
        });
    }
));

module.exports=function(){
    passport.serializeUser(function(user,done){
        done(null,user._id);
    });

    passport.deserializeUser(function(id,done){
        User.findById(id,function(err,user){
            done(err,user);
        });
    });
};