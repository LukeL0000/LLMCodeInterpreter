var express = require('express');
var router = express.Router();

/* GET home page. */
// no testing required, just confirms API is up.
router.get('/', function(req, res, next) {
  res.json({
    status: 200,
    success: true
});
});

module.exports = router;
