var express = require('express');
var router = express.Router();
var mong=require('./mongodbutils');
var dbCon=mong.getDb();
var fastcsv=require('fast-csv');
var fileSystem=require('fs');
var ObjectId=require('mongodb').ObjectId;
// var pipe=require('./aggregation');

const jwt_auth = require("../jwt_middleware/auth");
const set_header_token = (req, res, next) => {

  res.setHeader("Authorization", 'Bearer ' + req.session.token);
  
  console.log("success header");
  
  next();
  
  };
 


/* GET home page. */
router.get('/', [set_header_token,jwt_auth],(req,res)=>{
    dbCon.collection('guest').find({}).toArray(function(err,result){
        if(err) throw err;
        else{
            res.render('listguest1',{"g":result,"name":req.session.name});
        }

    })
    
});
router.get('/approve/:id', [set_header_token,jwt_auth],(req,res)=>{
    var pkey=req.params.id;
    dbCon.collection('guest').updateOne({"_id":ObjectId(pkey)},{$set:{"status":"approved"}});
    res.redirect('/guest');
})
router.get('/delete/:id', [set_header_token,jwt_auth],(req,res)=>{
    var pkey=req.params.id;
    dbCon.collection('guest').deleteOne({"_id":ObjectId(pkey)});
    res.redirect('/guest');
})
router.get('/notallowed/:id', [set_header_token,jwt_auth],(req,res)=>{
    var pkey=req.params.id;
    dbCon.collection('guest').updateOne({"_id":ObjectId(pkey)},{$set:{"status":"not allowed"}});
    res.redirect('/guest');
})
router.get('/export',[set_header_token,jwt_auth],function(req,res){
    console.log("export");
    if(req.session.auth ==true &&req.session.name=='admin'){
    dbCon.collection('guest').find({}).toArray(function(err,result){
      if(err) throw err;
      else{
  
  
        
            console.log({"result":result})
            var ws=fileSystem.createWriteStream("./public/guest.csv");
            fastcsv.write(result,{headers:true})
            .on("finish",function(){
             
            })
            .pipe(ws)
            res.redirect('/guest');
      }
    })}
    else{
      res.redirect('/');
    }
  })



module.exports = router;
