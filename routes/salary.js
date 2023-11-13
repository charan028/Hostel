var express = require('express');
var router = express.Router();

var ObjectId=require('mongodb').ObjectId;
var mong=require('./mongodbutils');
var dbCon=mong.getDb();
const {check,validationResult}=require('express-validator');


var router = express.Router();

var path=require('path');
var path=require('path');
var fastcsv=require('fast-csv');
var fileSystem=require('fs');
const app = require('../app');
var http=require('http').createServer(app);
var AWS=require('aws-sdk');
AWS.config.region='us-west-2';
var sns= new AWS.SNS();
AWS.config.update({
  acessKeyId:"AKIASJWA3S246FCO5WXQ",
  secretAcessKey:"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",
  region:'us-west-2',
  signatureVersion:'v4'

})
const jwt_auth = require("../jwt_middleware/auth");
const set_header_token = (req, res, next) => {

  res.setHeader("Authorization", 'Bearer ' + req.session.token);
  
  console.log("success header");
  
  next();
  
  };



router.get('/', [set_header_token,jwt_auth],function(req, res, next) {
  if(req.session.auth ==true &&req.session.name=='admin'){
  dbCon.collection('salary').find({}).toArray(function(err,result){
    if(err) throw err;
    else{
      console.log(result)
      res.render('listsalary',{"s":result,"name":req.session.name})
    }
  })}
  else{res.redirect('/');}

});


router.get('/add',[set_header_token,jwt_auth],(req,res)=>{
  console.log("inadd")
  res.render('addsalary',{"s":{},"name":req.session.name});
})
router.post('/save',
[
  check('eid','enter employee id').notEmpty(),
  check('ename','enter name').isLength({min:4}),
  check('amount','enter amount').isNumeric(),
  check('pd','select date').isDate(),
  
],(req,res)=>{
  const errors=validationResult(req);
  if(!errors.isEmpty()){
    const alert=errors.array()
    
    console.log({"messages":alert});
 
  res.render('addsalary',{"alert":alert,"name":req.session.name,"s":{}});
 
  }
  else{

    console.log({"key":req.body.pkey});
    var s={
  "eid":req.body.eid,
  "name":req.body.ename,
  "amount":req.body.amount,
  "date":req.body.pd,

     
    }
  console.log({"romm":s})
  if(req.session.auth ==true &&req.session.name=='admin'){
  if(req.body.pkey){
    async function up(){
      try{

        var u=await dbCon.collection('salary').updateOne({"_id":ObjectId(req.body.pkey)},{$set:s});
        // var params = {
        //   Protocol: 'application', /* required */
        //   TopicArn: 'arn:aws:sns:us-west-2:158244509369:email', /* required */
        //   Endpoint: 'charan.m@darwinbox.io'
        // };
        
        // Create promise and SNS service object
        // var subscribePromise = new AWS.SNS({apiVersion: 'latest'}).subscribe(params).promise();
        
        // Handle promise's fulfilled/rejected states
        // subscribePromise.then(
        //   function(data) {
        //     console.log("Subscription ARN is " + data.SubscriptionArn);
        //   }).catch(
        //     function(err) {
        //     console.error(err, err.stack);
        //   });
        res.redirect('/sal')
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

        var i=await dbCon.collection('salary').insertOne(s);
        res.redirect('/sal');
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

      var f=await  dbCon.collection('salary').findOne({"_id":ObjectId(pkey)});
         
      res.render('addsalary',{"s":f,"name":req.session.name});
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

        var d=await   dbCon.collection('salary').findOne({"_id":ObjectId(pkey)});
        var d1=await     dbCon.collection('deletesalary').insertOne(d);
        var d2=await  dbCon.collection('salary').deleteOne({"_id":ObjectId(pkey)});
        res.redirect('/sal');
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
      dbCon.collection('salary').find({}).toArray(function(err,result){
        if(err) throw err;
        else{
    
    
          
              console.log({"result":result})
              var ws=fileSystem.createWriteStream("./public/salary.csv");
              fastcsv.write(result,{headers:true})
              .on("finish",function(){
               
              })
              .pipe(ws)
              res.redirect('/sal');
        }
      })}
      else{
        res.redirect('/');
      }
    })




module.exports = router;
