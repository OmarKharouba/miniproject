var express=require('express');
var mongoose=require('mongoose');
var passport=require('passport');
var flash=require('connect-flash');
var User=require('./models/user');
var Project=require('./models/project');
var multer=require('multer');
var fs=require('fs');
var path=require('path');

var router=express.Router();

router.use(function(req,res,nxt){
    res.locals.currentUser=req.user;
    res.locals.errors=req.flash('error');
    res.locals.infos=req.flash('info');
    nxt();
});

var storage=multer.diskStorage({
    destination : function(req,file,cb){
        cb(null,'public/image/');
    },
    filename : function(req,res,cb){
        cb(null,"_"+Date.now());
    }
});

router.get('/',function(req,res){
    User.find().exec(function(err,users){
        if(err){
            nxt(err);
        }else{
            res.render('index', {users : users ,num : 1});
        }
    });
});

router.get('/:num(\\d+)/',function(req,res,nxt){
    var num=req.params.num;
    User.find().exec(function(err,users){
        if(err){
            nxt(err);
        }else{
            res.render('index', {users : users ,num : num});
        }
    });
});

router.get('/login',function(req,res){
    res.render('login');
});

router.post('/login',passport.authenticate('login',{
    failureRedirect : '/login',
    failureFlash : true
}),function(req,res){
    req.flash('info', 'You have logged in successfully');
    res.redirect('/');
});

router.get('/logout',function(req,res){
    req.logout();
    res.redirect('/');
});

router.get('/signup',function(req,res){
    res.render('signup');
});

var upload=multer({
    storage : storage
});

router.post('/signup',upload.any(),function(req,res,nxt){
    var username=req.body.username;
    var password=req.body.password;
    var gucid=req.body.gucid;
    var email=req.body.email;
    var bio=req.body.bio;
    var phonenumber=req.body.phonenumber;
    if(req.files[0]){
        var img_path=req.files[0].path;
    }else{
        var img_path='public/image/default';
    }

    User.findOne({username : username},function(err,user){
        if(err){
            return nxt(err);
        }
        if(user){
            req.flash('error', 'This username already exists');
            return res.redirect('/signup');
        }else{
            if(img_path!='public/image/default'){
                var newUser=new User({
                    username : username,
                    password : password,
                    gucid : gucid,
                    email : email,
                    phonenumber : phonenumber,
                    bio:bio,
                    profilepic : {data : fs.readFileSync(img_path), contentType : 'image/'+path.extname(req.files[0].originalname)}
                });
                fs.unlinkSync(img_path);
            }else{
                var newUser=new User({
                    username : username,
                    password : password,
                    gucid : gucid,
                    email : email,
                    bio:bio,
                    phonenumber : phonenumber,
                    profilepic : {data : fs.readFileSync(img_path), contentType : 'image/default'}
                });
            }
            req.flash('info', 'You have registered successfully');
            newUser.save(nxt);
        }
    });
    
},passport.authenticate('login', {
        successRedirect: '/',
        failureRedirect: '/signup',
        successFlash : true,
        failureFlash: true
}));

router.get('/users/:username', function(req, res, next) {
    var username=req.params.username;
    User.findOne({ username: username }, function(err, user) {
        if (err) { return next(err); }
        if (!user) { return next(404); }
        if(user.projects.length || (req.user && req.user.username==username)){
            res.render('portfolio', { user: user });
        }else{
            req.flash('error', 'this Portfolio does not exist');
            res.redirect('/');
        }
    });
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        req.flash('info', 'You must log in first.');
        res.redirect('/login');
    }
}

//any function that is not allowed without authintication goes here
router.get('/editportfolio/:username',ensureAuthenticated,function(req,res){
    var username=req.params.username;
    User.findOne({ username: username }, function(err, user) {
        if (err) { return next(err); }
        if (!user) { return next(404); }
        if(user.projects.length || (req.user && req.user.username==username)){
            res.render('editportfolio', { user: user });
        }else{
            req.flash('error', 'this Portfolio does not exist');
            res.redirect('/');
        }
    });
});

router.post('/edit',ensureAuthenticated,upload.any(),function(req,res){
            console.log(req.body);
            req.user.bio=req.body.bio;
            req.user.displayname=req.body.displayname;
            req.user.phonenumber=req.body.phonenumber;
            req.user.save(function(err){
                if(err){
                    nxt(err);
                    return;
                }
                req.flash('info', 'Your portfolio is updated');
                res.redirect('/users/'+req.user.username);
            });
});

router.get('/addwork',ensureAuthenticated,function(req,res){
    res.render('addwork');
});

router.post('/addwork',ensureAuthenticated,upload.any(),function(req,res,nxt){
    var title=req.body.title;
    var url=req.body.url;
    var username=req.user.username;
    var description=req.body.description;

    if(req.files[0]){
    var img_path=req.files[0].path;
        var newProject=new Project({
            title : title,
            image : {data : fs.readFileSync(img_path), contentType : 'image/'+path.extname(req.files[0].originalname)},
            description: description
        });
        fs.unlinkSync(img_path);
    }else{
        var newProject=new Project({
            title : title,
            url : url,
            description: description
         });
    }
    User.findOne({username : username},function(err,user){
        if(err){
            return nxt(err);
        }else{
            user.projects.push(newProject);
            user.save(nxt);
            req.flash('info','Your new work is added');
            res.redirect('/users/'+username);
        }
    });
});


module.exports=router;