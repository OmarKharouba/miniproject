var mongoose=require('mongoose');

var projectSchema=mongoose.Schema({
    title : {type : String, required: true},
    url : String,
    image : {data: Buffer , contentType : String},
    description : String,

});

var Project =mongoose.model('project',projectSchema);
module.exports=Project;