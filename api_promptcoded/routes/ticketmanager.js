const express = require('express');
const router = express.Router();
const sqlite = require('sqlite3').verbose();
const bodyParser = require('body-parser');

let sql;
var url = require('url');
const { default: axios } = require('axios');
const { CONSTRAINT } = require('sqlite3');

const db = new sqlite.Database('./database/promptcoded.db', sqlite.OPEN_READWRITE, (err) => {
    if (err) return console.error(err);
});


/* GET request that returns all active tickets.*/
router.get('/', async (req, res) => {
    try {
        var username = req.params.username;
        sql = `SELECT attempt_id, username, timestamp, test_result, reason_failed, sample_code,
                code_description, user_description, llm_code, ticket_comment
                from Attempts as A JOIN CodeSamples as C ON A.code_sample_id = C.code_sample_id WHERE flagged = 1`;
        db.all(sql, [username], (err, rows) => {
            if (err) return res.json({ status: 300, success: false, error: err, sqlcode: sql });

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

/* PUT request that does the following:
- Takes Approval ('true' or 'false'), Attempt_Id
- Updates the attempt with the Attempt_Id and sets flagged to false. If Approval is 'true', overwrites test_passed to 1. Otherwise keeps it as-is.
*/
router.put('/updateTicket', async (req, res) => {
    try {
        //debug
        //console.log(req.body.attemptID);
        //console.log(req.body.approval);
        //console.log(req.body.data);
        //console.log(req.body.func);

        var attemptId = parseInt(req.body.attemptID);
        var testPassed = 0;
        if (req.body.approval === 1) {
            testPassed = 3;
        }

        sql = "UPDATE Attempts SET flagged = 0, test_result = " + testPassed + " WHERE attempt_id = " + attemptId + " ;";
        
        db.run(sql, function (err) {
            if (err) {
                console.error('SQL error:', err);
                return res.json({ status: 300, success: false, error: err, sqlcode: sql });
            }
            res.json({ status: 200, success: true, sqlcode: sql });
        });
    }
    catch (error) {
        return res.json({
            status: 400,
            success: false
        });
    }
});



module.exports = router;