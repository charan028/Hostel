var express = require('express');
const {check,validationResult}=require('express-validator');
var app=express()
// var url = "mongodb://localhost:27017/hostel";
// const MongoStore = require('connect-mongo');
// var MongoClient=require('mongodb').MongoClient;
var ObjectId=require('mongodb').ObjectId;
var mong=require('./mongodbutils');
var dbCon=mong.getDb();



var router = express.Router();
// var multer=require('multer');
var path=require('path');
var fastcsv=require('fast-csv');
var fileSystem=require('fs');


var http=require('http').createServer(app);



var dbCon;


const jwt_auth = require("../jwt_middleware/auth");
const set_header_token = (req, res, next) => {

  res.setHeader("Authorization", 'Bearer ' + req.session.token);
  
  console.log("success header");
  
  next();
  
  };
router.get('/',[set_header_token,jwt_auth],(req,res)=>{

  if(req.session.auth ==true &&req.session.name=='admin'){
  dbCon.collection('meal').find({}).toArray(function(err,result){
    if(err) throw err;
    else{
      res.render('meals',{"m":result,"name":req.session.name});

    }

  })}
  else{
    res.redirect('/');
  }
// res.render('meals',{"m":{}});
  
})

router.get('/add', [set_header_token,jwt_auth],function(req, res, next) {
  if(req.session.auth ==true &&req.session.name=='admin'){
  dbCon.collection('meals').find({}).toArray(function(err,result){
    if(err) throw err;
    else
    res.render('addmeal',{"m":{},"name":req.session.name});
  })}
  else{
    res.redirect('/');
  }
 
})
router.post('/save',
[check('day','select day').isLength({min:3}),
check('tiffin','enter tiffin').isLength({min:3}),
check('lunch','enter lunch').isLength({min:3}),
check('dinner','enter dinner').isLength({min:3})],
(req,res)=>{  
//    console.group({'result':result})
// res.redirect('form');

  
  const errors=validationResult(req); 
  if(!errors.isEmpty()){
    const alert=errors.array()
    
    console.log({"messages":alert});
 
  res.render('addmeal',{"alert":alert,"name":req.session.name,"m":{}});
 
  }
  else{
    var m={
      "day":req.body.day,
      "tiffin":req.body.tiffin,
      "lunch":req.body.lunch,
      "dinner":req.body.dinner
  
   

  }



if(req.session.auth ==true &&req.session.name=='admin'){

  if(req.body.pkey){

    async function up(){
      try{


        let u=await  dbCon.collection('meal').updateOne({"_id":ObjectId(req.body.pkey)},{$set:m});
  
   res.redirect('/meal');
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

          let i1=await dbCon.collection('meal').insertOne(m);
          res.redirect('/meal');
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
  if(req.session.auth ==true &&req.session.name=='admin'){
  async function w(){
    try{

      let w1=await  dbCon.collection('meal').findOne({"_id":ObjectId(pkey)});
  
      res.render('addmeal',{"m":w1,"name":req.session.name});
    }
    catch(error){
      console.error(error);
    }

  }
  w();}
  else{
    res.redirect('/');
  }

 
})
router.get('/delete/:id',[set_header_token,jwt_auth],(req,res)=>{
  var pkey=req.params.id
//  var s={}
  console.log({"pkey":pkey,"key":ObjectId(pkey)})
  if(req.session.auth ==true &&req.session.name=='admin'){
  async function d(){
    try{


      var d0=await dbCon.collection('meal').findOne({"_id":ObjectId(pkey)});
      var d1=await dbCon.collection('deletemeal').insertOne(d0);
      var d2=await  dbCon.collection('meal').deleteOne({"_id":ObjectId(pkey)});
      res.redirect('/meal');
    }
    catch(error){
      console.error(error);
    }


  }
  d();
}
else{
  res.render('/');
}


})
  router.get('/export',[set_header_token,jwt_auth],function(req,res){
    console.log("export");
    if(req.session.auth ==true &&req.session.name=='admin'){
   
    dbCon.collection('meal').find({}).toArray(function(err,result){
      if(err) throw err;
      else{
  
  
        
            console.log({"result":result})
            var ws=fileSystem.createWriteStream("./public/meals.csv");
            fastcsv.write(result,{headers:true})
            .on("finish",function(){
             
            })
            .pipe(ws)
            res.redirect('/meal');
      }
    })
  }
  else{
    res.redirect('/');
  }
  })
  

module.exports = router;
