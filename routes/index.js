var express = require('express');
var router = express.Router();
var userModule=require('../modules/user');
var passCatModel=require('../modules/password_category');
var passModel=require('../modules/add_password');
var bcrypt=require('bcryptjs');
var jwt = require('jsonwebtoken');
const { check , validationResult } = require('express-validator');
var getPassCat=passCatModel.find({});
var getAllPass=passModel.find({});



if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}

//Middleware function 

function checkLoginUser(req,res,next){
  var userToken = localStorage.getItem('userToken');
  try {
    var decoded = jwt.verify(userToken, 'loginUser');
     } 
     catch(err) {
      res.redirect('/');
    }
    next();
}

function checkEmail(req,res,next){
  var email=req.body.email;
  var checkexitemail=userModule.findOne({email:email});
  checkexitemail.exec((err,data)=>{
    if(err) throw err;
    if(data){
      return res.render('signup', {title: 'Password Management System', msg:'Email already registered'});
    }
    next();
  });
}

function checkUsername(req,res,next){
  var uname=req.body.uname;
  var checkexitemail=userModule.findOne({username:uname});
  checkexitemail.exec((err, data)=>{
    if(err) throw err;
    if(data){

      return res.render('signup', {title: 'Password Management System', msg:'Username Already Exits'});
    }
    next();
  });
}

/* GET home page. */
router.get('/', function(req, res, next) {
  var userToken = localStorage.getItem('userToken');
  if(userToken){
    res.redirect('/dashboard/');
  }else{
  res.render('index', { title: 'Password Management System' , msg:""});
  }
});


router.post('/', function(req, res, next) {
   var username=req.body.uname;
   var password=req.body.password;
   var checkUser=userModule.findOne({username:username});
   checkUser.exec((err,data)=>{
     if(err) throw err ;
     var getUserId=data._id;
     var pass = data.password;
     if(bcrypt.compareSync(password, pass)){
      var token = jwt.sign({ userID:  getUserId }, 'loginToken');
      localStorage.setItem('userToken', token );
      localStorage.setItem('loginUser', username );
      res.redirect('/dashboard');
      res.render('index', { title: 'Password Management System', msg:"User Logged in successfully" });
     }else{
      res.render('index', { title: 'Password Management System', msg:"Invalid PassWord" });
     }
   });
});


router.get('/dashboard/', function(req, res, next) {
    var Username = localStorage.getItem('loginUser');
  res.render('dashboard', { title: 'Password Management System',loginUser:Username, msg:'' });
});


router.get('/signup',  function(req, res, next) {
  var userToken = localStorage.getItem('userToken');
  if(userToken){
    res.redirect('/dashboard/');
  }else{
  res.render('signup', { title: 'Password Management System', msg:'' });
  }  
});

router.post('/signup', checkUsername, checkEmail, function(req, res, next){
  var username=req.body.uname;
  var email=req.body.email;
  var Password=req.body.password;
  var cPassword=req.body.confpassword; 
  if(Password!=cPassword){
    res.render('signup', { title: 'Password Management System', msg:"Password Not Matched!" });  
  }
  else{
    Password =bcrypt.hashSync(req.body.password,10);
       var userDetails=new userModule({
         username:username,
         email:email,
         password: Password
         });
     userDetails.save((err,doc)=>{
     if(err) throw err;
     console.log(userDetails);
     res.render('signup', { title: 'Password Management System', msg:"User Registered Successfully" });
    });
  }
});


router.get('/password_category', function(req, res, next) {
  var Username = localStorage.getItem('loginUser');
  getPassCat.exec(function(err,data){
    if(err) throw err;
    res.render('password_category', { title: 'Password Management System' ,loginUser:Username , records:data});
  });
});

router.get('/password_category/delete/:id', function(req, res, next) {
  var Username = localStorage.getItem('loginUser');
  var passCat_id=req.params.id;
  var passDelete=passCatModel.findByIdAndDelete(passCat_id);
  passDelete.exec(function(err,data){
    if(err) throw err;
    res.redirect('/password_category/');
  });
});


router.get('/password_category/edit/:id', function(req, res, next) {
  var Username = localStorage.getItem('loginUser');
  var passCat_id=req.params.id;
  var getpassCat=passCatModel.findById(passCat_id);
  getpassCat.exec(function(err,data){
    if(err) throw err;
    res.render('edit_pass_category', { title: 'Password Management System' ,loginUser:Username , errors:'',success:'', records:data, id:passCat_id});
  });
});


router.post('/password_category/edit/', function(req, res, next) {
  var Username = localStorage.getItem('loginUser');
  var passCat_id=req.body.id;
  var passwordCategory=req.body.passwordCategory;
  var update_passCat=passCatModel.findByIdAndUpdate(passCat_id,{password_category: passwordCategory});
  update_passCat.exec(function(err,doc){
    if(err) throw err;
    res.redirect('/password_category/');
  });
});



router.get('/AddNewCategory/', function(req, res, next) {
  var Username = localStorage.getItem('loginUser');
  res.render('AddNewCategory', { title: 'Password Management System' ,loginUser:Username , errors:'' , success:'' });
});

router.post('/AddNewCategory/',[check('passwordCategory' , ' Please Enter Password Category Name').isLength({ min: 1 })] , function(req, res, next) {
  var Username = localStorage.getItem('loginUser');
  const errors= validationResult(req);
  if(!errors.isEmpty()){
    res.render('AddNewCategory', { title: 'Password Management System' ,loginUser:Username , errors: errors.mapped(), success:''});
  }else{
    var passCatname=req.body.passwordCategory;
    var passCatDetails=new passCatModel({
      password_category:passCatname,
    });
    passCatDetails.save(function(err,data){
      if(err) throw err;
      res.render('AddNewCategory', { title: 'Password Management System' ,loginUser:Username , errors:'' ,success:'Password category inserted successfully'});
    });
  }
});


router.get('/AddNewPassword/', function(req, res, next) {
  var Username = localStorage.getItem('loginUser');
  getPassCat.exec(function(err,data){
    if(err) throw err;
    res.render('AddNewPassword', { title: 'Password Management System' , loginUser:Username , records:data , success:""});
  });
});


router.post('/AddNewPassword/', function(req, res, next) {
  var Username = localStorage.getItem('loginUser');
  var passcat=req.body.pass_cat;
  var proj_name=req.body.project_name;
  var passDetails=req.body.pass_details;
  var password_Details= new passModel({
    password_category:passcat,
    project_name:proj_name,
    password_detail:passDetails
  })
    
    password_Details.save(function(err,data){
      getPassCat.exec(function(err,data){
      if(err) throw err;
      res.render('AddNewPassword', { title: 'Password Management System' , loginUser:Username , records:data, success:"Password Details Inserted Successfully " });
    });
  });
});


router.get('/viewallpassword/', function(req, res, next) {

  var Username = localStorage.getItem('loginUser');

  var perPage= 8;
  var page= 1;

  getAllPass.skip((perPage*page)-perPage).limit(perPage).exec(function(err,data){
    if(err) throw err;
    passModel.countDocuments({}).exec(function(err,count){
    res.render('viewallpassword', { title: 'Password Management System' ,
    loginUser:Username ,
     records:data,
    current: page,
  pages: Math.ceil(count / perPage )});
  });

  });
});


router.get('/view-all-password/:page', function(req, res, next) {

  var Username = localStorage.getItem('loginUser');

  var perPage= 8;

  var page=req.params.page|| 1;

  getAllPass.skip((perPage*page)-perPage).limit(perPage).exec(function(err,data){
    if(err) throw err;
    passModel.countDocuments({}).exec(function(err,count){
    res.render('viewallpassword', { title: 'Password Management System' ,
    loginUser:Username ,
     records:data,
    current: page,
  pages: Math.ceil(count / perPage )});
  });

  });
});  


/*
router.get('/viewallpassword/', function(req, res, next) {

    var Username = localStorage.getItem('loginUser');
  
    
    var options = {
      offset:   1, 
      limit:    3
  };
  
   passModel.paginate().then(function(result){
      
      res.render('viewallpassword', { title: 'Password Management System' ,
      loginUser:Username ,
       records:result.docs,
      current: result.offset,
    pages:result.total});
    });
  
    
  });
  
  
  router.get('/view-all-password/:page', function(req, res, next) {
  
    var Username = localStorage.getItem('loginUser');
  
    var perPage= 3;
  
    var page=req.params.page|| 1;
  
    getAllPass.skip((perPage*page)-perPage).limit(perPage).exec(function(err,data){
      if(err) throw err;
      passModel.countDocuments({}).exec(function(err,count){
      res.render('viewallpassword', { title: 'Password Management System' ,
      loginUser:Username ,
       records:data,
      current: page,
    pages: Math.ceil(count / perPage )});
    });
  
    });
  }); */




router.post('/password-detail/edit/:id', function(req, res, next) {
  var Username = localStorage.getItem('loginUser');
   var id=req.params.id;
   var pass_cat=req.body.pass_cat;
   var project_name=req.body.project_name;
   var pass_details=req.body.pass_details;
   var updatePass=passModel.findByIdAndUpdate(id, {password_category: pass_cat, project_name: project_name, password_detail:pass_details})
   updatePass.exec(function(err){ 
   if(err) throw err;
    var getPassdetails=passModel.findById({ _id:id});
    getPassdetails.exec(function(err,data){
    if(err) throw err;
    getPassCat.exec(function(err,doc){
    res.render('edit_password_details', { title: 'Password Management System' ,loginUser:Username , record:data , records:doc, success:'Password Updated Successfully'});
  });
});
}); 
});   


// router.get('/password-detail/edit/:id', function(req, res, next) {
//   res.redirect('/dashboard');
// });




router.get('/password-detail/edit/:id', function(req, res, next) {
  var Username = localStorage.getItem('loginUser');
  var id=req.params.id;
  var getPassdetails=passModel.findById({ _id:id});
  getPassdetails.exec(function(err,data){
    if(err) throw err;
    getPassCat.exec(function(err,doc){
    res.render('edit_password_details', { title: 'Password Management System' ,loginUser:Username , record:data , records:doc, success:''});
  });
});
});


router.get('/password-detail/delete/:id', function(req, res, next) {
  var Username = localStorage.getItem('loginUser');
  var passCat_id=req.params.id;
  var passDelete=passModel.findByIdAndDelete(passCat_id);
  passDelete.exec(function(err,data){
    if(err) throw err;
    res.redirect('/viewallpassword/');
  });
});


router.get('/logout/', function(req, res, next) {
  localStorage.removeItem('userToken');
  localStorage.removeItem('loginUser');
  res.redirect('/');
});



module.exports = router;
