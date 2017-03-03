var express=require('express');
var mongoose=require('mongoose');
var router=require('./routes');
var flash=require('connect-flash');
var bodyParser=require('body-parser');
var cookieParser=require('cookie-parser');
var session=require('express-session');
var passport = require('passport');
var path=require('path');
var logger=require('morgan');
var setupPassport=require('./setupPassport');

var app=express();

app.use(logger('dev'));

mongoose.connect('mongodb://localhost:27017/miniproject2');

setupPassport();

app.use(express.static(path.resolve(__dirname,'./public')));

app.set('views', path.resolve(__dirname,'views'));
app.set('view engine' , 'ejs');

app.use(bodyParser.urlencoded({extended : false}));
app.use(cookieParser());

app.use(session({
    secret : "TKR]s$s,<<MXv0#&!F!%IWw/4KiVJs=HYqrvagQV",
    resave : true,
    saveUninitialized : true
}));

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

app.use(router);

app.listen(3000,function(){
    console.log('The server started on port 3000...');
});