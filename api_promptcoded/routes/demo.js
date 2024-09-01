var express = require('express');
var router = express.Router();

/* GET home page. */
// this is only a demo. no testing required.
router.get('/', function(req, res, next) {
  res.json({codesampleID:1, codesample:"Connected to Express API."});
});

module.exports = router;
