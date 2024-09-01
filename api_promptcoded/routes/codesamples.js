var express = require('express');
var sqlite = require('sqlite3').verbose();
var bodyParser = require('body-parser');
var url = require('url');

var router = express.Router();
let sql;

const db = new sqlite.Database('./database/promptcoded.db', sqlite.OPEN_READWRITE, (err) => {
  if(err) return console.error(err);
});

/* GET one code sample that the user hasn't completed.*/
router.get('/:username/:skip', function(req, res, next) {
  try{
    var username = req.params.username;
    var skip = req.params.skip;

    //prep sql query
    sql = "SELECT * from Codesamples WHERE code_sample_id NOT IN (SELECT code_sample_id FROM Attempts WHERE username = '" + username;
    if(skip == 'true') {
      sql += "')";
    } else {
      sql += "' AND test_result = 3)";
    }
    sql += " ORDER BY RANDOM()"; // Select a random sample

    db.all(sql,[], (err,rows) => {
     if(err) return res.json({status:300, success:false, sql:sql, error:err});

     if(rows.length < 1) return res.json({status:300, success:false, error:"No Match"});

     return res.json({status:200, code_sample:rows[0], success:true});
    });
  } 
  catch (error) {
    return res.json({
      status:400,
      success:false
    });
  }
});


/* GET count of total questions that the user can attempt.*/
router.get('/count', async (req, res) => {
  try {
    sql = `
              SELECT COUNT(*) 
              FROM Codesamples 
          `;
    db.get(sql, [], (err, rows) => {
      if (err) return res.json({ status: 300, success: false, error: err });
      if (rows.length < 1) return res.json({ status: 300, success: false, error: "No Match" });
      res.json({ status: 200, data: rows, success: true });
    });
  }
  catch (error) {
    return res.json({
      status: 400,
      success: false
    });
  }
});

/*
router.get('/:username', function(req, res, next) {
  var username = req.params.username;
  res.json({codesampleID: 0, codesampleCode:"Retrieved a code sample from API", user: username});
});
*/
module.exports = router;
