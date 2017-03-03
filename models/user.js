var mongoose=require('mongoose');
var bcrypt=require('bcrypt-nodejs');
var factor =5;
var userSchema=mongoose.Schema({
    username : {type : String, required: true},
    password : {type : String, required: true},
    gucid : {type : String, required: true},
    email : {type : String, required: true},
    displayname : String,
    bio : String,
    phonenumber : String,
    profilepic : {data : Buffer, contentType : String},
    projects : [{title : String , url : String, image:{data: Buffer , contentType : String},description : String,}]
});

userSchema.methods.checkPassword=function(guess,done){
    bcrypt.compare(guess,this.password,function(err,correct){
        done(err,correct);
    });
};

var noop =function(){};

userSchema.pre('save',function(done){
    var user=this;
    if(!user.isModified('password')){
        return done();    
    }
    bcrypt.genSalt(factor,function(err,salt){
        if(err){
            return done(err);
        }
        bcrypt.hash(user.password,salt,noop,function(err,hashedPassword){
            if(err){
                return done(err);
            }
            user.password=hashedPassword;
            done();
        });
    });

});

var User =mongoose.model('User',userSchema);
module.exports=User;