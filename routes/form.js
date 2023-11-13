var express = require('express');
const {check,validationResult}=require('express-validator');
var app=express()

var ObjectId=require('mongodb').ObjectId;
var mong=require('./mongodbutils');
var dbCon=mong.getDb();

  

const jwt_auth = require("../jwt_middleware/auth");

var router = express.Router();

var path=require('path');
var fastcsv=require('fast-csv');
var fileSystem=require('fs');

var http=require('http').createServer(app);



var dbCon;
var blocks=["A","B","C","D"];
var gen=["Male","Female"];


const set_header_token = (req, res, next) => {

  res.setHeader("Authorization", 'Bearer ' + req.session.token);
  
  console.log("success header");
  
  next();
  
  };
 
 
 

router.get('/',[set_header_token,jwt_auth],(req,res)=>{
if(req.session.name=='admin' && req.session.auth==true){

  dbCon.collection('students').find({}).toArray(function(err,result){
    if(err) throw err;
    else{
      console.log({"resq":req.session});
      res.render('dashboard',{"stu":result,"gen":gen,"blocks":blocks,"name":req.session.name});
  
    }
  
  })
}
else{
  res.redirect('/');
}
  
   


      


  
})

router.get('/add',[set_header_token,jwt_auth], function(req, res, next) {
  if(req.session.auth==true && req.session.name=='admin'){


    dbCon.collection('students').find({}).toArray(function(err,result){
      if(err) throw err;
      else
      res.render('form',{"stu":{},"blocks":blocks,"gen":gen,"name":req.session.name});
    })
  }
  else{
    res.redirect('/');
  }
 
})
router.post('/saveform',
[
  check('fullname','enter full name').isLength({min:4}),
  check('stid','enter id').isLength({min:2}),
  check('mobileno','enter valid no').isMobilePhone(),
  check('email','enter valid mail').isEmail().normalizeEmail(),
  check('institute','enter valid instittute').isLength({min:4}),
  check('block','check block').notEmpty(),
  check('gender','select gender').notEmpty(),
  check('dob','select date of birth').isDate(),
  check('Bgroup','select bloodgroup').notEmpty(),
  check('fathername','enter father name').isLength({min:4}),
  check('fnumber','enter valid number').isMobilePhone(),
  check('mothername','enter mother name').isLength({min:4}),
  check('mnumber','enter valid number').isMobilePhone()
],
(req,res)=>{  
 
  

  
  const errors=validationResult(req); 
  if(!errors.isEmpty()){
    const alert=errors.array()
  
    console.log({"messages":alert});
 
  res.render('form',{"alert":alert,"stu":{},"blocks":blocks,"gen":gen,"name":req.session.name});
 
  }
  else{

    var s1={
      "name":req.body.fullname,
      "stid":req.body.stid,
      "mobile":req.body.mobileno,
      "email":req.body.email,
   
      "institute":req.body.institute,
      "block":req.body.block,
      "gender":req.body.gender,
      "dob":req.body.dob,
      "Blood":req.body.Bgroup,
      "fathername":req.body.fathername,
      "fatherNo":req.body.fnumber,
      "mothername":req.body.mothername,
      "motherNo":req.body.mnumber,
     
  
    }
  
  
  if(req.session.auth && req.session.name=='admin'){
    if(req.body.pkey){
  
      async function up(){
        try{


          let u=await  dbCon.collection('students').updateOne({"_id":ObjectId(req.body.pkey)},{$set:s1});
    
     res.redirect('/student');
        }
        catch(error){
          console.error(error);
        }
      }
      up();

      }
      else{
        async function i(){
          try{

            let i1=await dbCon.collection('students').insertOne(s1);
            res.redirect('/student');
          }
          catch(error){
            console.error(error);
          }
  
  
  
        }
        i();
      
  
      }
  
  
  }
  else{
    res.redirect('/');
  }


  }

  




  

});
router.get('/edit/:id',[set_header_token,jwt_auth],(req,res)=>{
  var pkey=req.params.id
//  var s={}
  console.log({"pkey":pkey,"key":ObjectId(pkey)})
  if(req.session.auth ==true && req.session.name=='admin'){

    async function w(){
      try{

        let w1=await  dbCon.collection('students').findOne({"_id":ObjectId(pkey)});
    
        res.render('form',{"stu":w1,"blocks":blocks,"gen":gen,"name":req.session.name});
      }
      catch(error){
        console.error(error);
      }
  
    }
    w();
  }
  else{
    res.redirect('/');
  }
 
 
 
})
router.get('/delete/:id',[set_header_token,jwt_auth],(req,res)=>{
  var pkey=req.params.id
//  var s={}
  console.log({"pkey":pkey,"key":ObjectId(pkey)})
  if(req.session.auth==true && req.session.name=='admin'){

    async function d(){
      try{


        var d0=await dbCon.collection('students').findOne({"_id":ObjectId(pkey)});
        var d1=await dbCon.collection('deletestudents').insertOne(d0);
        var d2=await  dbCon.collection('students').deleteOne({"_id":ObjectId(pkey)});
        res.redirect('/student');
      }
      catch(error){
        console.error(error);
      }
  
  
    }
    d();
  }
  else{
    res.redirect('/');
  }


})
  router.get('/export',function(req,res){
    console.log("export");
   if(req.session.auth==true && req.session.name=='admin'){

     dbCon.collection('students').find({}).toArray(function(err,result){
       if(err) throw err;
       else{
   
   
         
             console.log({"result":result})
             var ws=fileSystem.createWriteStream("./public/students.csv");
             fastcsv.write(result,{headers:true})
             .on("finish",function(){
              
             })
             .pipe(ws)
             res.redirect('/student');
       }
     })
   }
   else{
     res.redirect('/');
   }
  })
  

module.exports = router;
