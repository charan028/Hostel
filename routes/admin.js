var app,
  express = require("express");
var router = express.Router();
const { check, validationResult } = require("express-validator");
var jwt = require("jsonwebtoken");
require("dotenv").config();

var url = "mongodb://localhost:27017/hostel";
var easyinvoice = require("easyinvoice");
const fs = require("fs");

var http = require("http");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const nodemailer = require("nodemailer");

var server = http.createServer(app);

var mongo = require("./mongodbutils");
var dbCon = mongo.getDb();
// const multer =require('multer');
// const multerS3 = require('multer-s3');
// const aws= require('aws-sdk');

// const s3 = new aws.S3({ apiVersion: '2006-03-01' });

// var updatestu={};

const AWS = require("aws-sdk");
require("dotenv").config();

const ses = new AWS.SES({
  accessKeyId: process.env.ACCESSID,
  secretAccessKey: process.env.ACCESSKEY,
  region: process.env.ACCESSREGION,
});

var val = {};

var token = "";

process.env.TOKEN_SECRET;

function generateAccessToken(username) {
  return jwt.sign(username, process.env.TOKEN_SECRET, { expiresIn: "30min" });
}

const jwt_auth = require("../jwt_middleware/auth");
// const { token } = require('morgan');

const { ConnectionPoolClearedEvent, ObjectId } = require("mongodb");

const set_header_token = (req, res, next) => {
  console.log(token);

  res.setHeader("Authorization", "Bearer " + token);

  console.log("success header");

  next();
};

/* GET home page. */
router.get("/", function (req, res, next) {
  req.session.auth = false;
  console.log(req.session);
  res.render("admin");
});

router.post(
  "/",
  [
    check("username", "enter username").notEmpty(),
    check("password", "enter password").notEmpty(),
  ],
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const alert = errors.array();
      req.session.auth = false;
      console.log({ messages: alert });

      res.render("admin", { alert: alert });
    } else {
      var user = {
        user: req.body.username,
        pass: req.body.password,
      };

      dbCon
        .collection("admin")
        .findOne(
          { $and: [{ user: req.body.username }] },
          function (err, result) {
            if (err) throw err;
            else {
              if (result == null) {
                req.session.auth = false;
                res.redirect("/admin");
              } else {
                console.log("s1");
                console.log(result);

                bcrypt.compare(
                  req.body.password,
                  result.pass,
                  function (err, result1) {
                    console.log(result1)
                    if (result1) {
                      req.session.auth = true;

                      console.log(req.session);
                      req.session.name = req.body.username;
                      token = generateAccessToken({
                        username: req.body.username,
                      });
                      req.session.token = token;
                      console.log(token);
                      res.setHeader("Authorization", "Bearer" + token);
                      console.log(req.session);

                      console.group({ result: result });
                      res.redirect("/student");
                    } else {
                      req.session.auth = false;
                      res.redirect("/");
                    }
                  }
                );
              }
            }
          }
        );
    }
  }
);
router.get("/logout", (req, res) => {
  req.session.destroy(function () {
    res.redirect("/");
  });
  res.clearCookie("jwt");
});

router.get("/stu", (req, res) => {
  res.render("stulogin");
});
router.get("/emp", (req, res) => {
  res.render("emplogin");
});
router.get("/stu/register", (req, res) => {
  res.render("sturegister");
});
router.get("/stu/password", (req, res) => {
  res.render("stupassword");
});
router.get("/emp/password", (req, res) => {
  res.render("employeepassword");
});

router.post(
  "/stu/password",
  [
    check("name", "enter name").notEmpty(),
    check("ques", "answer the question").notEmpty(),
    check("email", "enter mail").isEmail().normalizeEmail(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    var s = {
      name: req.body.name,
      ques: req.body.ques,
    };
    console.log({ s: s });
    if (!errors.isEmpty()) {
      const alert = errors.array();
      req.session.auth = false;
      console.log({ messages: alert });

      res.render("stupassword", { alert: alert });
    } else {
      console.log({ pass: process.env.PASS });

      dbCon
        .collection("stu")
        .findOne(
          { $and: [{ username: req.body.name }, { ques: req.body.ques }] },
          function (err, result) {
            if (err) throw err;
            else {
              console.log(result);
              if (result) {
                var value = String(Math.floor(1000 + Math.random() * 9000));
                val.value = value;
                val.mail = req.body.name;
                console.log({ password: result.password });

                let transporter = nodemailer.createTransport({
                  service: "gmail",
                  auth: {
                    user: "merugusaicharan1@gmail.com", // generated ethereal user
                    pass: process.env.PASS, // generated ethereal password
                  },
                });

                let mailOptions = {
                  from: "merugusaicharan1@gmail.com",
                  to: req.body.email,
                  subject: "reset-code",
                  text: value,
                };
                transporter.sendMail(mailOptions, function (err, success) {
                  if (err) {
                    console.log(err);
                  } else {
                    console.log("sent success");
                    res.render("stucode");
                  }
                });
              } else {
                res.redirect("/admin/stu");
              }
            }
          }
        );
    }
  }
);

router.post("/stu/ccc", (req, res) => {
  var mes = new String(req.body.com);
  var l = mes.split(" ").length;
  console.log(l);
  if (l < 200) {
    console.log("sooooooo");
    // console.log(l);
    // console.log(req.body);
    res.send({ message: "min no of words not reached" });

    // res.redirect('/admin/stu/complaint');
  } else {
    console.log("yes");
    // res.send({message:"success"});

    res.redirect("/admin/stu/csend");
  }

  // console.log();
  // res.send(req.body);
});
router.get("/stu/complaint", [set_header_token, jwt_auth], (req, res) => {
  // res.send(req.body);
  console.log({ test: req.session });
  res.render("complaint", { name: req.session.name });
});
router.post("/stu/csend", [set_header_token, jwt_auth], (req, res) => {
  // var sub=req.body.sub;
  var mes = req.body.com;

  console.log({ lol: mes });

  var mes = req.body.com;
  var l = mes.split(" ").length - 1;
  console.log(l);
  if (l < 200) {
    console.log("sooooooo");
    // console.log(l);
    // console.log(req.body);
    res.send({ message: "min no of words not reached" });

    // res.redirect('/admin/stu/complaint');
  } else {
    console.log("yes");
    // res.send({message:"success"});

    // res.send({message:"successful"});

    // console.log({"mes":mes,"dub":sub});
    let params = {
      // send to list
      Destination: {
        ToAddresses: ["charan.m@darwinbox.io"],
      },
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: mes,
          },
          Text: {
            Charset: "UTF-8",
            Data: "complaint",
          },
        },

        Subject: {
          Charset: "UTF-8",
          Data: "complaint raised",
        },
      },
      Source: "charan.m@darwinbox.io", // must relate to verified SES account
      ReplyToAddresses: ["charan.m@darwinbox.io"],
    };
    // this sends the emailc
    ses.sendEmail(params, (err, data) => {
      if (err) console.log(err);
      else {
        console.log(data);
        res.redirect("/admin/stu/complaint");
      }
    });
  }
});
// router.get('/stu/upload',[set_header_token,jwt_auth],(req,res)=>{
//   res.render('updateprofile',{"name":req.session.username,"u":updatestu});
// });
// //multer content

// const upload = multer({
//   storage: multerS3({
//       s3,
//       bucket: 'nodeimage',
//       metadata: (req, file, cb) => {
//           cb(null, { fieldName: file.fieldname });
//       },
//       key: (req, file, cb) => {
//           //const ext = path.extname(file.originalname);
//           cb(null, `image-${Date.now()}-${file.originalname}`);
//       }
//   })
// });
// router.post('/stu/update',upload.single('file'),async function(req,res,next){
//   var data={

//     "pass":req.body.password,
//     "pass2":req.body.password1,
//     // "url":req.file.location

//   }
//   if(req){
//     // data.url=req.file.location;
//     console.log({"u":data});
//     async function upDate(){
//       try{

//         var r=await dbCon.collection('stu').updateOne({"_id":ObjectId(req.body.ukey)},{$set:data});
//         res.redirect('/admin/stu/student');
//       }
//       catch(error){
//         console.error(error);
//       }

//     }
//     upDate();
//   }

//   else{
//     res.redirect('/admin/stu/student');
//   }

// })
router.post(
  "/emp/password",
  [
    check("name", "enter name").notEmpty(),
    check("ques", "answer the question").notEmpty(),
    check("email", "enter mail").isEmail().normalizeEmail(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    console.log(process.env.PASS);

    if (!errors.isEmpty()) {
      const alert = errors.array();
      req.session.auth = false;
      console.log({ messages: alert });

      res.render("employeepassword", { alert: alert });
    } else {
      var s = {
        name: req.body.name,
        ques: req.body.ques,
      };
      console.log({ s: s });

      dbCon
        .collection("emp")
        .findOne(
          { $and: [{ name: req.body.name }, { ques: req.body.ques }] },
          function (err, result) {
            if (err) throw err;
            else {
              console.log(result);
              if (result) {
                var value = String(Math.floor(1000 + Math.random() * 9000));
                val.value = value;
                val.mail = req.body.name;

                let transporter = nodemailer.createTransport({
                  service: "gmail",
                  auth: {
                    user: "merugusaicharan1@gmail.com", // generated ethereal user
                    pass: process.env.PASS, // generated ethereal password
                  },
                });

                let mailOptions = {
                  from: "merugusaicharan1@gmail.com",
                  to: req.body.email,
                  subject: "reset-code",
                  text: value,
                };
                transporter.sendMail(mailOptions, function (err, success) {
                  if (err) {
                    console.log(err);
                  } else {
                    console.log("sent success");
                    res.render("empcode");
                  }
                });
              } else {
                res.redirect("/admin/emp");
              }
            }
          }
        );
    }
  }
);

router.post(
  "/emp/code",
  [check("code", "enter the recieved code").isNumeric().isLength({ min: 4 })],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const alert = errors.array();
      req.session.auth = false;
      console.log({ messages: alert });

      res.render("empcode", { alert: alert });
    } else {
      val.code = req.body.code;
      if (val.code == val.value) {
        res.render("emp2");
      } else {
        res.redirect("/");
      }
    }
  }
);

router.post(
  "/stu/code",
  [check("code", "enter the recieved code").isNumeric().isLength({ min: 4 })],
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const alert = errors.array();
      req.session.auth = false;
      console.log({ messages: alert });

      res.render("stucode", { alert: alert });
    } else {
      val.code = req.body.code;
      if (val.code == val.value) {
        res.render("stu2");
      } else {
        res.redirect("/");
      }
    }
  }
);

router.post(
  "/emp/confirm",
  [
    check("pass1").notEmpty(),
    check("pass2")
      .notEmpty()
      .custom((value, { req }) => {
        if (value !== req.body.pass1) {
          throw new Error("password dont match");
        }
        return true;
      }),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const alert = errors.array();
      req.session.auth = false;
      console.log({ messages: alert });

      res.render("emp2", { alert: alert });
    } else {
      (p1 = req.body.pass1), (p2 = req.body.pass2);
      console.log(p1, p2);
      console.log(val);
      if (p1 == p2) {
        bcrypt.genSalt(saltRounds, function (err, salt) {
          bcrypt.hash(p1, salt, function (err, hash) {
            dbCon
              .collection("emp")
              .updateOne(
                { name: val.mail },
                { $set: { pass: hash } },
                function (err, result) {
                  if (err) throw err;
                  else {
                    if (result) {
                      console.log(result.name);
                      res.redirect("/admin/emp");
                    }
                  }
                }
              );
          });
        });
      } else {
        res.redirect("/admin/emp/code");
      }
    }
  }
);
router.post(
  "/stu/confirm",
  [
    check("pass1").notEmpty(),
    check("pass2")
      .notEmpty()
      .custom((value, { req }) => {
        if (value !== req.body.pass1) {
          throw new Error("password dont match");
        }
        return true;
      }),
  ],
  (req, res) => {
    (p1 = req.body.pass1), (p2 = req.body.pass2);
    console.log(p1, p2);
    console.log(val);
    if (p1 == p2) {
      bcrypt.genSalt(saltRounds, function (err, salt) {
        bcrypt.hash(p1, salt, function (err, hash) {
          dbCon
            .collection("stu")
            .updateOne(
              { username: val.mail },
              { $set: { password: hash } },
              function (err, result) {
                if (err) throw err;
                else {
                  if (result) {
                    console.log(result.username);
                    res.redirect("/admin/stu");
                  }
                }
              }
            );
        });
      });
    } else {
      res.redirect("/admin/stu/code");
    }
  }
);

router.get("/emp/register", (req, res) => {
  res.render("employeeregister");
});
router.get("/employee/password", (req, res) => {
  res.render("employeepassword");
});
router.post(
  "/stu/register",
  [
    check("username", "enter user name").notEmpty(),
    check("ques", "answer the question").notEmpty(),
    check("password").notEmpty(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const alert = errors.array();
      req.session.auth = false;
      console.log({ messages: alert });

      res.render("sturegister", { alert: alert });
    } else {
      var s1 = {
        username: req.body.username,
        ques: req.body.ques,
        password: req.body.password,
      };
      console.log(s1);

      dbCon.collection("stu").findOne(
        {
          $or: [
            { username: s1.username },
            { $and: [{ username: s1.username }, { ques: s1.ques }] },
          ],
        },
        function (err, result2) {
          if (err) throw err;
          else {
            if (!result2) {
              bcrypt.genSalt(saltRounds, function (err, salt) {
                bcrypt.hash(req.body.password, salt, function (err, hash) {
                  var s = {
                    username: req.body.username,
                    password: hash,
                    ques: req.body.ques,
                  };

                  console.log({ stu: s });
                  dbCon.collection("stu").insertOne(s, function (err, result) {
                    if (err) throw err;
                    else {
                      res.redirect("/admin/stu/student");
                    }
                  });
                });
              });
            } else {
              res.redirect("/admin/stu/student");
            }
          }
        }
      );
    }
  }
);

router.post(
  "/emp/register",
  [
    check("name", "enter user name").notEmpty(),
    check("ques", "answer the question").notEmpty(),
    check("pass").notEmpty(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const alert = errors.array();
      req.session.auth = false;
      console.log({ messages: alert });

      res.render("employeeregister", { alert: alert });
    } else {
      var s1 = {
        name: req.body.name,
        ques: req.body.ques,
      };

      dbCon.collection("emp").findOne(
        {
          $or: [
            { $and: [{ name: s1.name }, { ques: s1.ques }] },
            { name: s1.name },
          ],
        },
        function (err, result2) {
          if (err) throw err;
          else {
            if (!result2) {
              bcrypt.genSalt(saltRounds, function (err, salt) {
                bcrypt.hash(req.body.pass, salt, function (err, hash) {
                  var s = {
                    name: req.body.name,
                    pass: hash,
                    ques: req.body.ques,
                  };
                  console.log({ stu: s });
                  dbCon.collection("emp").insertOne(s, function (err, result) {
                    if (err) throw err;
                    else {
                      res.redirect("/admin/emp");
                    }
                  });
                });
              });
            } else {
              req.session.auth = false;
              res.redirect("/admin/emp");
            }
          }
        }
      );
    }
  }
);

router.post(
  "/stu",
  [
    check("username", "enter username").notEmpty(),
    check("password").notEmpty(),
  ],
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const alert = errors.array();
      req.session.auth = false;
      console.log({ messages: alert });

      res.render("stulogin", { alert: alert });
    } else {
      var s = {
        name: req.body.username,

        pass: req.body.password,
        type: "student",
      };
      console.log({ s: s });

      dbCon
        .collection("stu")
        .findOne({ username: s.name }, function (err, result) {
          if (err) console.log(err);
          else {
            console.log(result);
            if (result) {
              console.log(result);
              bcrypt.compare(
                req.body.password,
                result.password,
                function (err, result1) {
                  if (result1) {
                    console.log({ resu: result1 });
                    req.session.auth = true;
                    req.session.name = s.name;
                    updatestu = result;
                    token = generateAccessToken({
                      username: req.body.username,
                    });

                    console.log(token);
                    res.setHeader("Authorization", "Bearer" + token);
                    res.redirect("/admin/stu/student");
                    // res.render('stutable',{'u':result,'name':req.session.name});
                  } else {
                    req.session.auth = false;
                    res.redirect("/");
                  }
                }
              );
            } else {
              req.session.auth = false;
              res.redirect("/");
            }
          }
        });
    }
  }
);
router.get("/stu/guest", [set_header_token, jwt_auth], (req, res) => {
  dbCon
    .collection("guest")
    .find({})
    .toArray(function (err, result) {
      if (err) throw err;
      else {
        console.log(result);

        res.render("listguest", { g: result, name: req.session.name });
      }
    });
});
router.get("/stu/addguest", [set_header_token, jwt_auth], (req, res) => {
  res.render("addguest", { name: req.session.name });
});
router.post(
  "/stu/addguest/save",
  [
    check("name", "enter name").notEmpty(),
    check("sname", "enter student name").notEmpty(),
    check("date", "enter date").isDate(),
    check("number", "enter phone number")
      .isNumeric()
      .isLength({ min: 10, max: 12 }),
  ],
  (req, res) => {
    var month = {
      1: "jan",
      2: "feb",
      3: "mar",
      4: "apr",
      5: "may",
      6: "jun",
      7: "jul",
      8: "aug",
      9: "sep",
      10: "oct",
      11: "nov",
      12: "dec",
    };
    var o = new Date(req.body.date).getMonth();
    console.log(o);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const alert = errors.array();
      req.session.auth = false;
      console.log({ messages: alert });

      res.render("addguest", { alert: alert, name: req.session.name });
    } else {
      var g = {
        name: req.body.name,
        studentname: req.body.sname,
        date: req.body.date,
        phoneno: req.body.number,
        status: "pending",
        month: month[o],
      };
      dbCon.collection("guest").insertOne(g, function (err, result) {
        if (err) {
          throw err;
        } else {
          if (result) {
            res.redirect("/admin/stu/guest");
          }
        }
      });
    }
  }
);
router.post(
  "/emp",
  [
    check("username", "enter the username").notEmpty(),
    check("password", "enter the password").notEmpty(),
  ],
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const alert = errors.array();
      req.session.auth = false;
      console.log({ messages: alert });

      res.render("emplogin", { alert: alert });
    } else {
      var s = {
        name: req.body.username,
        pass: req.body.password,
      };

      dbCon.collection("emp").findOne({ name: s.name }, function (err, result) {
        if (err) console.log(err);
        else {
          if (result) {
            console.log({ res: result });
            bcrypt.compare(
              req.body.password,
              result.pass,
              function (err, result1) {
                if (result1) {
                  req.session.auth = true;
                  req.session.name = s.name;

                  token = generateAccessToken({ username: req.body.username });
                  req.session.token = token;
                  console.log(token);
                  res.setHeader("Authorization", "Bearer" + token);

                  res.redirect("/admin/emp/employee");
                } else {
                  req.session.auth = false;

                  res.redirect("/");
                }
              }
            );
          } else {
            res.redirect("/");
          }
        }
      });
    }
  }
);
router.get("/emp/employee", [set_header_token, jwt_auth], (req, res) => {
  if (req.session.auth) {
    dbCon
      .collection("employee")
      .find({})
      .toArray(function (err1, result1) {
        if (err1) throw err1;
        else {
          res.render("emptable", { e: result1, name: req.session.name });
        }
      });
  } else {
    res.redirect("/");
  }
});
router.get("/emp/salary", [set_header_token, jwt_auth], (req, res) => {
  if (req.session.auth) {
    dbCon
      .collection("salary")
      .find({})
      .toArray(function (err1, result1) {
        if (err1) throw err1;
        else {
          res.render("empsal", { s: result1, name: req.session.name });
        }
      });
  } else {
    res.redirect("/");
  }
});
router.get("/emp/meal", [set_header_token, jwt_auth], (req, res) => {
  if (req.session.auth) {
    dbCon
      .collection("meal")
      .find({})
      .toArray(function (err1, result1) {
        if (err1) throw err1;
        else {
          res.render("empmeals", { m: result1, name: req.session.name });
        }
      });
  } else {
    res.redirect("/");
  }
});

router.get("/stu/student", [set_header_token, jwt_auth], (req, res) => {
  if (req.session.auth) {
    dbCon
      .collection("students")
      .find({})
      .toArray(function (err1, result1) {
        if (err1) throw err1;
        else {
          res.render("stutable", {
            stu: result1,
            name: req.session.name,
            u: updatestu,
          });
        }
      });
  } else {
    res.redirect("/");
  }
});

router.get("/stu/attend", [set_header_token, jwt_auth], (req, res) => {
  if (req.session.auth) {
    dbCon
      .collection("attendence")
      .find({})
      .toArray(function (err, result) {
        if (err) throw err;
        else {
          res.render("stuattend", { a: result, name: req.session.name });
        }
      });
  } else {
    res.redirect("/");
  }
});
router.get("/stu/meals", [set_header_token, jwt_auth], (req, res) => {
  if (req.session.auth) {
    dbCon
      .collection("meal")
      .find({})
      .toArray(function (err, result) {
        if (err) throw err;
        else {
          res.render("stumeals", { m: result, name: req.session.name });
        }
      });
  } else {
    res.redirect("/");
  }
});
router.get("/stu/rooms", [set_header_token, jwt_auth], (req, res) => {
  if (req.session.auth) {
    dbCon
      .collection("rooms")
      .find({})
      .toArray(function (err, result) {
        if (err) throw err;
        else {
          res.render("sturooms", { room: result, name: req.session.name });
        }
      });
  } else {
    res.redirect("/");
  }
});
router.post("/employee", (req, res) => {
  var e = {
    name: req.body.username,
    pass: req.body.password,
  };
});
router.get("/register", (req, res) => {
  res.render("register");
});
router.post("/register", (req, res) => {
  bcrypt.genSalt(saltRounds, function (err, salt) {
    bcrypt.hash(req.body.password, salt, function (err, hash) {
      var admin = {
        user: req.body.username,
        pass: hash,
      };

      dbCon.collection("admin").insertOne(admin, function (err, result) {
        if (err) throw err;
        else res.redirect("/admin");
      });
    });
  });
});
router.get("/password", (req, res) => {
  res.render("password");
});
router.get("/book", (req, res) => {
  res.render("book");
});
var t = ["luxury", "normal", "deluxe"];
router.get("/book1", (req, res) => {
  res.render("book1", { t: t });
});
router.post(
  "/book1",
  [
    check("name", "enter name").isLength({ min: 4 }),
    check("email", "enter valid emial").isEmail().normalizeEmail(),
    check("hostel").notEmpty(),

    check("amount", "enter amount").notEmpty(),
    check("date", "select date").isDate(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const alert = errors.array();

      console.log({ messages: alert });

      res.render("book1", { alert: alert, t: t });
    } else {
      var u = {
        name: req.body.name,
        email: req.body.email,
        hostel: req.body.hostel,
        amount: req.body.amount,
        date: req.body.date,
      };

      // var easyinvoice = require('easyinvoice');
      var d = new Date(u.date);

      d.setDate(d.getDate() + 15);
      console.log(d);
      var d1 = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();

      var data = {
        images: {
          // The logo on top of your invoice
          logo: "https://public.easyinvoice.cloud/img/logo_en_original.png",
          // The invoice background
          // "background": "https://public.easyinvoice.cloud/img/watermark-draft.jpg"
        },
        // Your own data
        sender: {
          company: "Hostel",
          address: "Sample Street 123",
          zip: "1234 AB",
          city: "Vizag",
          country: "Andra Pradesh",
        },
        // Your recipient
        client: {
          name: u.name,
          email: u.email,
          "hostel-type": u.hostel,
          date: u.date,
          zip: "4567 CD",
          city: "Hyderabad",
          country: "India",
        },
        information: {
          // Invoice number
          number: "2021.0001",
          // Invoice data
          date: u.date,
          // Invoice due date
          "due-date": d1,
        },

        products: [
          {
            quantity: 1,
            description: u.hostel,
            "tax-rate": 6,
            price: u.amount,
          },
        ],
        // The message you would like to display on the bottom of your invoice
        "bottom-notice": "Kindly pay your invoice within 15 days.",
        // Settings to customize your invoice
        settings: {
          currency: "IND",
        },
      };

      //Create your invoice! Easy!
      easyinvoice.createInvoice(data, async function (result) {
        //The response will contain a base64 encoded PDF file

        await fs.writeFileSync("invoice.pdf", result.pdf, "base64");
        // console.log('PDF base64 string: ', result.pdf);
      });

      res.redirect("/");
    }
  }
);

module.exports = router;
