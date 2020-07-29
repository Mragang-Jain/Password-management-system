const mongoose=require('mongoose');
mongoose.connect('mongodb+srv://PMS:shankey@cluster0.lzum5.mongodb.net/test',{useNewUrlParser:true , useCreateIndex: true});
 var conn = mongoose.Collection;
 var passcatSchema = new mongoose.Schema({
     password_category: {type: String, required: true, index: {  unique: true  }},
     date: { type: Date, default: Date.now()}
 });
  
 var passCatModel=mongoose.model('password_categories', passcatSchema);
 module.exports=passCatModel;