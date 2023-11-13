var express = require("express");
var router = express.Router();

var mong = require("./mongodbutils");
var dbCon = mong.getDb();
var ObjectId = require("mongodb").ObjectId;

const { check, validationResult } = require("express-validator");

var router = express.Router();

var path = require("path");
var fastcsv = require("fast-csv");
var fileSystem = require("fs");
const app = require("../app");
var http = require("http").createServer(app);

var op = ["Yes", "No"];

const jwt_auth = require("../jwt_middleware/auth");
const set_header_token = (req, res, next) => {
  res.setHeader("Authorization", "Bearer " + req.session.token);

  console.log("success header");

  next();
};

router.get("/", [set_header_token, jwt_auth], function (req, res, next) {
  console.log({ req: req.session.auth });
  if (req.session.auth == true && req.session.name == "admin") {
    dbCon
      .collection("attendence")
      .find({})
      .toArray(function (err, result) {
        if (err) throw err;
        else {
          console.log(result);
          res.render("listattendence", { a: result, name: req.session.name });
        }
      });
  } else {
    console.log({ why: req.session.auth });
    res.redirect("/");
  }
  // res.render('listroom');
  // res.render('listattendence')
});

router.get("/add", [set_header_token, jwt_auth], (req, res) => {
  console.log("inadd");
  if (req.session.auth == true && req.session.name == "admin") {
    res.render("addattendence", { a: {}, op: op, name: req.session.name });
  } else {
    res.redirect("/");
  }
});
router.post(
  "/save",
  [
    check("name", "name").isLength({ min: 4 }),
    // check("date", "enter valid date").isDate(),
    check("present", "enter correct details").notEmpty(),
    check("present", "enter the correct details").notEmpty(),
    check("leave", "enter the correct details").notEmpty(),
    check("remark", "enter details").notEmpty(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const alert = errors.array();

      console.log({ messages: alert });
      console.log({ date: req.body.date });

      res.render("addattendence", {
        alert: alert,
        name: req.session.name,
        a: {},
        op: op,
      });
    } else {
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

      console.log({ key: req.body.pkey });
      console.log({ month: new Date(req.body.date).getMonth() });
      var o = new Date(req.body.date).getMonth();
      console.log({ month1: month[o] });
      var a = {
        name: req.body.name,
        date: req.body.date,
        month: month[o],
        present: req.body.present,

        leave: req.body.leave,
        remark: req.body.remark,
      };
      console.log({ romm: a });

      if (req.session.name == "admin") {
        if (req.body.pkey) {
          async function upDate() {
            try {
              var r = await dbCon
                .collection("attendence")
                .updateOne({ _id: ObjectId(req.body.pkey) }, { $set: a });
              res.redirect("/attend");
            } catch (error) {
              console.error(error);
            }
          }
          upDate();
        } else {
          async function inSert() {
            try {
              var i = await dbCon.collection("attendence").insertOne(a);

              res.redirect("/attend");
            } catch (error) {
              console.error(error);
            }
          }
          inSert();
        }
      } else {
        console.log({ why: req.session.auth });
        res.redirect("/");
      }
    }
  }
);
router.get("/edit/:id", [set_header_token, jwt_auth], (req, res) => {
  var pkey = req.params.id;
  //  var s={}
  console.log({ pkey: pkey, key: ObjectId(pkey) });
  if (req.session.auth && req.session.name == "admin") {
    async function edit() {
      try {
        var e = await dbCon
          .collection("attendence")
          .findOne({ _id: ObjectId(pkey) });

        res.render("addattendence", { a: e, op: op, name: req.session.name });
      } catch (error) {
        console.error(error);
      }
    }
    edit();
  } else {
    res.redirect("/");
  }
});

router.get("/delete/:id", [set_header_token, jwt_auth], (req, res) => {
  var pkey = req.params.id;
  //  var s={}
  console.log({ pkey: pkey, key: ObjectId(pkey) });
  if (req.session.auth && req.session.name == "admin") {
    async function del() {
      try {
        var d = await dbCon
          .collection("attendence")
          .findOne({ _id: ObjectId(pkey) });
        var d1 = await dbCon.collection("deleteattendence").insertOne(d);
        var d2 = await dbCon
          .collection("attendence")
          .deleteOne({ _id: ObjectId(pkey) });

        res.redirect("/attend");
      } catch (error) {
        console.error(error);
      }
    }
    del();
  } else {
    res.redirect("/");
  }
});
router.get("/export", [set_header_token, jwt_auth], function (req, res) {
  console.log("export");
  if (req.session.auth && req.session.name == "admin") {
    dbCon
      .collection("attendence")
      .find({})
      .toArray(function (err, result) {
        if (err) throw err;
        else {
          console.log({ result: result });
          var ws = fileSystem.createWriteStream("./public/attendence.csv");
          fastcsv
            .write(result, { headers: true })
            .on("finish", function () {})
            .pipe(ws);
          res.redirect("/attend");
        }
      });
  } else {
    res.redirect("/");
  }
});

module.exports = router;
