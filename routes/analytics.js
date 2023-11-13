var express = require('express');
var router = express.Router();
var mong=require('./mongodbutils');
var dbCon=mong.getDb();
// var pipe=require('./aggregation');

const jwt_auth = require("../jwt_middleware/auth");
const set_header_token = (req, res, next) => {

  res.setHeader("Authorization", 'Bearer ' + req.session.token);
  
  console.log("success header");
  
  next();
  
  };
 


/* GET home page. */
var op=['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec']
router.get('/', [set_header_token,jwt_auth],function(req, res, next) {
  if(req.session.auth==true && req.session.name=='admin'){

    async function g(){
      try{
        
        var p=await dbCon.collection('attendence').countDocuments({"present":"Yes"});
        var a=await dbCon.collection('attendence').countDocuments({"present":"No"});
        var m=req.body.month;
    
        var m1= await dbCon.collection('month').find().toArray(); 
        console.log({"m1":m1,"m":m})
    res.render('analytics',{"data":[p,a],"op":op,'name':req.session.name,"m1":m1,"m":m});
  
      }
      catch(error){
        console.error(error);
        
      }
      
  
    }
    g();

  }
  else{
    res.redirect('/admin/logout');

  }

  

});
router.post('/',[set_header_token,jwt_auth],(req,res)=>{
  if(req.session.auth==true && req.session.name=='admin'){

    async function m(){
      var m=req.body.month;
    
      var m1= await dbCon.collection('month').find().toArray(); 
    
      var p = await dbCon.collection('attendence').aggregate([{$match:{"month":req.body.month,"present":"Yes"}}]).toArray();
      
          var a = await dbCon.collection('attendence').aggregate([{$match:{"month":req.body.month,"leave":"Yes"}}]).toArray();
  
          // console.log(m);
  
      
          console.log({"m1":m1,"m":m})
  
  
      res.render('analytics',{"data":[p.length,a.length],"op":op,'name':req.session.name,"m1":m1,"m":m}); 
  
  
    }
    m();

  }
  else{
    res.redirect('/admin/logout');
  }



  // res.redirect('analytics');
})







router.get('/a1', [set_header_token,jwt_auth],function(req, res, next) {
  if(req.session.auth==true && req.session.name=='admin'){

    async function g(){
      try{
        var m=req.body.month;
        var m1= await dbCon.collection('month').find().toArray(); 
        var p=await dbCon.collection('guest').countDocuments({"status":"approved"});
        var a=await dbCon.collection('guest').countDocuments({"status":"notapproved"});
      
    
     
        console.log({"m1":m1,"m":m,"d":p.length,"l":a.length});
    res.render('analytics1',{"data":[p.length,a.length],"op":op,'name':req.session.name,"m1":m1,"m":m});
  
      }
      catch(error){
        console.error(error);
        
      }
      
  
    }
    g();

  }
  else{
    res.redirect('/admin/logout');

  }

  

});







router.post('/a1',[set_header_token,jwt_auth],(req,res)=>{
  if(req.session.auth==true && req.session.name=='admin'){

    async function m(){
      var m=req.body.month;
    
      var m1= await dbCon.collection('month').find().toArray(); 
    
      var p = await dbCon.collection('guest').aggregate([{$match:{"month":req.body.month,"status":"approved"}}]).toArray();
      
          var a = await dbCon.collection('guest').aggregate([{$match:{"month":req.body.month,"status":"notapproved"}}]).toArray();
  
          // console.log(m);
  
      
          console.log({"m1":m1,"m":m})
  
  
      res.render('analytics1',{"data":[p.length,a.length],"op":op,'name':req.session.name,"m1":m1,"m":m}); 
  
  
    }
    m();

  }
  else{
    res.redirect('/admin/logout');
  }



  // res.redirect('analytics');
})

module.exports = router;
