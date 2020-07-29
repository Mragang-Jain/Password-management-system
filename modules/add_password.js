const mongoose=require('mongoose');
mongoose.connect('mongodb+srv://PMS:shankey@cluster0.lzum5.mongodb.net/test',{useNewUrlParser:true , useCreateIndex: true});
 var conn = mongoose.Collection;
 var passSchema = new mongoose.Schema({
     password_category: {type: String, required: true },
     project_name: {type: String, required: true},
     password_detail: {type: String, required: true},
     date: { type: Date, default: Date.now()}
 });
  
 var passModel=mongoose.model('password_details', passSchema );
 module.exports=passModel;