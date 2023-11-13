var express = require('express');
var router = express.Router();

var mong=require('./mongodbutils');
var dbCon=mong.getDb();
var ObjectId=require('mongodb').ObjectId;

const {check,validationResult}=require('express-validator');


var router = express.Router();

var path=require('path');
var fastcsv=require('fast-csv');
var fileSystem=require('fs');
const app = require('../app');
var http=require('http').createServer(app);

const jwt_auth = require("../jwt_middleware/auth");
const set_header_token = (req, res, next) => {

  res.setHeader("Authorization", 'Bearer ' + req.session.token);
  
  console.log("success header");
  
  next();
  
  };


var blocks=["A","B","C","D"];
var type=['Temporary','Permanent'];
var gen=['Male','female'];




router.get('/', [set_header_token,jwt_auth],function(req, res, next) {
  if(req.session.auth ==true &&req.session.name=='admin'){


    dbCon.collection('employee').find({}).toArray(function(err,result){
      if(err) throw err;
      else{
        console.log(result)
        res.render('listemployee',{"e":result,"name":req.session.name})
      }
    })
  }
  else{
    res.redirect('/');
  }

});


router.get('/add',[set_header_token,jwt_auth],(req,res)=>{
  if(req.session.auth ==true &&req.session.name=='admin'){
  
  console.log("inadd")
  res.render('addemployee',{"e":{},"blocks":blocks,"type":type,"gen":gen,"name":req.session.name});}
  else{
    res.redirect('/');
  }
})
router.post('/save',[check('fullname','enter full name').isLength({min:4}),check('empid','check id').isLength({min:2}),
check('mobileno','invalid number').isMobilePhone(),
check('emptype','check employeetype').notEmpty(),
check('empdes','enter designation').notEmpty(),
check('block','select block').notEmpty(),
check('gender','enter gener').notEmpty(),
check('dob','select dob').notEmpty(),
check('Bgroup','enter blood group').notEmpty()],(req,res)=>{
  const errors=validationResult(req);
    
  if(!errors.isEmpty()){
    const alert=errors.array()
    
    console.log({"messages":alert});
 
  res.render('addemployee',{"alert":alert,"name":req.session.name,"type":type,"blocks":blocks,"gen":gen,"e":{}});
 
  }
  else{
    console.log({"key":req.body.pkey});
    var e={
    "name":req.body.fullname,
    "empid":req.body.empid,
  "mobile":req.body.mobileno,
  "type":req.body.emptype,
  "des":req.body.empdes,
  "block":req.body.block,
  "gender":req.body.gender,
  "dob":req.body.dob,
  "blood":req.body.Bgroup
     
    }
  console.log({"romm":e})
  if(req.session.auth ==true &&req.session.name=='admin'){
  if(req.body.pkey){
    async function up(){
      try{


        var u=await dbCon.collection('employee').updateOne({"_id":ObjectId(req.body.pkey)},{$set:e});
        res.redirect('/emp');
      }
      catch(error){
        console.error(error);
      }
  
  
  
    }
    up();
  
  
  
    
    
  }
  else{
    async function ins(){
      try{


        var i=await dbCon.collection('employee').insertOne(e);
        res.redirect('/emp');
      }
      catch(error){
        console.error(error);
      }
  
    }
    ins();
  
  
  
 
  
  }}
  else{
    res.redirect('/');
  }




  }

 

})
router.get('/edit/:id',[set_header_token,jwt_auth],(req,res)=>{
  var pkey=req.params.id
//  var s={}
  console.log({"pkey":pkey,"key":ObjectId(pkey)})
  if(req.session.auth ==true &&req.session.name=='admin'){
  async function fin(){
    try{


      var f=await  dbCon.collection('employee').findOne({"_id":ObjectId(pkey)});
      res.render('addemployee',{"e":f,"blocks":blocks,"type":type,"gen":gen,"name":req.session.name});
    }
    catch(error){
      console.error(error);
    }

  }
  fin();}
  else{
    res.redirect('/');
  }
 

})


  router.get('/delete/:id',[set_header_token,jwt_auth],(req,res)=>{
    var pkey=req.params.id
  //  var s={}
    console.log({"pkey":pkey,"key":ObjectId(pkey)})
    if(req.session.auth ==true &&req.session.name=='admin'){
    async function del(){
      try{

        var d =await  dbCon.collection('employee').findOne({"_id":ObjectId(pkey)});
        var d1=await dbCon.collection('deleteemployee').insertOne(d);
        var d2=await  dbCon.collection('employee').deleteOne({"_id":ObjectId(pkey)});
        res.redirect('/emp');
      }
      catch(error){
        console.error(error);
      }

    }
    del();}
    else{
      res.redirect('/');
    }
 
  
  })
    router.get('/export',[set_header_token,jwt_auth],function(req,res){
      console.log("export");
      if(req.session.auth ==true &&req.session.name=='admin'){
      dbCon.collection('employee').find({}).toArray(function(err,result){
        if(err) throw err;
        else{
    
    
          
              console.log({"result":result})
              var ws=fileSystem.createWriteStream("./public/employee.csv");
              fastcsv.write(result,{headers:true})
              .on("finish",function(){
               
              })
              .pipe(ws)
              res.redirect('/emp');
        }
      })}
      else{
        res.redirect('/');
      }
    })




module.exports = router;
