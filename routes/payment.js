var express = require('express');
var router = express.Router();

var ObjectId=require('mongodb').ObjectId;
var mong=require('./mongodbutils');
var dbCon=mong.getDb();
var fastcsv=require('fast-csv');
var fileSystem=require('fs');
const {check,validationResult}=require('express-validator');



var router = express.Router();

var path=require('path');
const app = require('../app');
var http=require('http').createServer(app);
const jwt_auth = require("../jwt_middleware/auth");
const set_header_token = (req, res, next) => {

  res.setHeader("Authorization", 'Bearer ' + req.session.token);
  
  console.log("success header");
  
  next();
  
  };

router.get('/',[set_header_token,jwt_auth] ,function(req, res, next) {
  if(req.session.auth ==true &&req.session.name=='admin'){
  dbCon.collection('payment').find({}).toArray(function(err,result){
    if(err) throw err;
    else{
      console.log(result)
      res.render('listpayment',{"p":result,"name":req.session.name});
    }
  })
}
else{
  res.redirect('/');
}

});


router.get('/add',[set_header_token,jwt_auth],(req,res)=>{
  console.log("inadd")
  if(req.session.auth ==true &&req.session.name=='admin'){
  res.render('addpayment',{"p":{},"name":req.session.name});}
  else{
    res.redirect('/');
  }
})
router.post('/save',[
  check('name','enter name').isLength({min:4}),
  check('date','select date').isDate(),
  check('paid','enter paid name').isLength({min:4}),
  check('trans','enter transaction id').isLength({min:10,max:30}),
  check('amount','enter amount').isNumeric(),
  check('remark','enter due or remark').notEmpty()
],(req,res)=>{


  const errors=validationResult(req);
  if(!errors.isEmpty()){
    const alert=errors.array()
  
    console.log({"messages":alert});
 
  res.render('addpayment',{"alert":alert,"name":req.session.name,"p":{}});
 
  }
  else{


    console.log({"key":req.body.pkey});
    var p={
   "name":req.body.name,
   "date":req.body.date,
   "paid":req.body.paid,
   "trans":req.body.trans,
   "amount":req.body.amount,
   "remark":req.body.remark
     
    }
  console.log({"romm":p})
  if(req.session.auth ==true &&req.session.name=='admin'){
  if(req.body.pkey){
    async function upDate(){
      try{


        var u=await dbCon.collection('payment').updateOne({"_id":ObjectId(req.body.pkey)},{$set:p});
    
    res.redirect('/pay')
      }
      catch(error){
        console.error(error);
      }
  
    }
    upDate();
  
  
    
  }
  else{
    async function inSert(){
      try{

        var i=await dbCon.collection('payment').insertOne(p);
        res.redirect('/pay');
      }
      catch(error){
        console.error(error);
      }
  
    }
    inSert();
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

  async function f(){
var fin=  await  dbCon.collection('payment').findOne({"_id":ObjectId(pkey)});
 
res.render('addpayment',{"p":fin,"name":req.session.name});
  }
  f();}
  else{
    res.redirect('/');
  }


})


  router.get('/delete/:id',[set_header_token,jwt_auth],(req,res)=>{
    var pkey=req.params.id
  //  var s={}
    console.log({"pkey":pkey,"key":ObjectId(pkey)})
    if(req.session.auth ==true &&req.session.name=='admin'){
    async function o(){
      try{

        var r=await dbCon.collection('payment').findOne({"_id":ObjectId(pkey)});
        var r1=await dbCon.collection('deletepayment').insertOne(r);
        var r2=await  dbCon.collection('payment').deleteOne({"_id":ObjectId(pkey)});
        res.redirect('/pay');
      }
      catch(error){
        console.error(error);
      }

    }
    o();}
    else{
      res.redirect('/');
    }
 
  });


router.get('/export',[set_header_token,jwt_auth],function(req,res){
  console.log("export");
  if(req.session.auth ==true &&req.session.name=='admin'){
  dbCon.collection('payment').find({}).toArray(function(err,result){
    if(err) throw err;
    else{


      
          console.log({"result":result})
          var ws=fileSystem.createWriteStream("./public/payment.csv");
          fastcsv.write(result,{headers:true})
          .on("finish",function(){
           
          })
          .pipe(ws)
          res.redirect('/pay');
    }
  })}
  else{
    re.redirect('/');
  }
})


module.exports = router;
