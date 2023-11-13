var app,express = require('express');
var router = express.Router();

var ObjectId=require('mongodb').ObjectId;
var mong=require('./mongodbutils');
var dbCon=mong.getDb();
  
const {check,validationResult}=require('express-validator');



var router = express.Router();
// var multer=require('multer');
var path=require('path');
var fastcsv=require('fast-csv');
var fileSystem=require('fs');

var http=require('http').createServer(app);

const jwt_auth = require("../jwt_middleware/auth");
const set_header_token = (req, res, next) => {

  res.setHeader("Authorization", 'Bearer ' + req.session.token);
  
  console.log("success header");
  
  next();
  
  };


var blocks=["A","B","C","D"];
router.get('/', [set_header_token,jwt_auth],function(req, res, next) {
  if(req.session.auth ==true &&req.session.name=='admin'){
  dbCon.collection('rooms').find({}).toArray(function(err,result){
    if(err) throw err;
    else{
      console.log(result)
      res.render('listroom',{"room":result,"name":req.session.name})
    }
  })}
  else{
    res.redirect('/');
  }

})
router.get('/add',[set_header_token,jwt_auth],(req,res)=>{
  console.log(blocks)
  if(req.session.auth ==true &&req.session.name=='admin'){
  res.render('addroom',{"room":{},"blocks":blocks,"name":req.session.name});}
  else{
    res.redirect('/');
  }
})
router.post('/save',
[check('roomno','enter valid room no').isNumeric().isLength({min:3}),
check('ten','enter no of students').isNumeric(),
check('block','select block no').notEmpty(),
check('desc','enter description').isLength({min:4})]

,(req,res)=>{

  const errors=validationResult(req);

  if(!errors.isEmpty()){
    const alert=errors.array()
  
    console.log({"messages":alert});
 
  res.render('addroom',{"alert":alert,"name":req.session.name,"room":{},"blocks":blocks});
 
  }

  else{
    var r={
      "roomno":req.body.roomno,
      "ten":req.body.ten,
      "blockno":req.body.block,
      "desc":req.body.desc
    }
    console.log({"r":r});
    console.log({"pkeysave":req.body.pkey});
    if(req.session.auth ==true &&req.session.name=='admin'){
    if(req.body.pkey){
      async function up(){
        try{


          var u=await  dbCon.collection('rooms').updateOne({"_id":ObjectId(req.body.pkey)},{$set:r});
     
          res.redirect('/room');
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

          var i=await dbCon.collection('rooms').insertOne(r);
          res.redirect('/room');
        }
        catch(error){
          console.error(error);
        }
  
      }
      ins();
  
  
    
    }
  }
  else{
    res.redirect('/');
  }



  }

})
router.get('/edit/:id',[set_header_token,jwt_auth],(req,res)=>{
  var pkey=req.params.id
  console.log(blocks);
//  var s={}
  console.log({"pkey":pkey,"key":ObjectId(pkey)})
  if(req.session.auth ==true &&req.session.name=='admin'){
  async function fin(){
    try{

      
          var f=await dbCon.collection('rooms').findOne({"_id":ObjectId(pkey)});
          res.render('addroom',{"room":f,"blocks":blocks,"name":req.session.name});

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
    async function d(){
      try{

        var de=await dbCon.collection('rooms').findOne({"_id":ObjectId(pkey)});
        var de1=await dbCon.collection('deleterooms').insertOne(de);
        var de2=await dbCon.collection('rooms').deleteOne({"_id":ObjectId(pkey)});
  
        res.redirect('/room');
      }
      catch(error){
        console.error(error);
      }

    }
    d();}
    else{
      res.redirect('/');
    }
  
  
  })


    router.get('/export',[set_header_token,jwt_auth],function(req,res){
      console.log("export");
      if(req.session.auth ==true &&req.session.name=='admin'){
      dbCon.collection('rooms').find({}).toArray(function(err,result){
        if(err) throw err;
        else{
    
    
          
              console.log({"result":result})
              var ws=fileSystem.createWriteStream("./public/rooms.csv");
              fastcsv.write(result,{headers:true})
              .on("finish",function(){
               
              })
              .pipe(ws)
              res.redirect('/room');
        }
      })}
      else{
        res.redirect('/');
      }
    })
  


module.exports = router;
