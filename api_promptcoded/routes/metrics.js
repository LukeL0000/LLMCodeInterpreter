const express = require('express');
const router = express.Router();
const axios = require('axios');
const sqlite = require('sqlite3').verbose();

const db = new sqlite.Database('./database/promptcoded.db', sqlite.OPEN_READWRITE, (err) => {
    if (err) return console.error(err);
});

// grade for passing all tests 
const passGrade = 3; 

// returns all the attempts by a user
async function getStudentAttempts(username) {
    try {
        const response = await axios.get(`http://localhost:9000/attempts/${username}`);
        return response.data;
    } catch (error) {
        throw new Error(`Failed to fetch student attempts: ${error.message}`);
    }
}

// returns the total no of questions that the student can attempt in the database 
async function getTotalQuestions() {
    try {
        const response = await axios.get(`http://localhost:9000/codesamples/count`);
        return response.data;
    } catch (error) {
        throw new Error(`Failed to fetch total questions: ${error.message}`);
    }
}

// returns a table which contains all the questions available and the max score achieved by the user in a single attempt ; if not attempted it returns NULL for the score 
async function getMaxScores(username) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT
                        cs.code_sample_id,
                        COALESCE(MAX(a.test_result), NULL) AS max_score,
                        (SELECT MAX(a2.timestamp)
                        FROM Attempts a2
                        WHERE a2.code_sample_id = cs.code_sample_id
                        AND a2.username = ?
                        ) AS latest_attempt_date
                    FROM
                        CodeSamples cs
                    LEFT JOIN
                        Attempts a ON cs.code_sample_id = a.code_sample_id
                        AND a.username = ?
                    GROUP BY
                        cs.code_sample_id;
                    `;
        db.all(sql, [username, username], (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
}

// returns the no of questions that the user has attempted 
async function getTotalAttempts(username) {
    return new Promise((resolve, reject) => {
        const sql = ` SELECT COUNT(DISTINCT code_sample_id) 
                      FROM Attempts 
                      WHERE username = ?
                    `;
        db.get(sql, [username], (err, row) => {
            if (err) return reject(err);
            resolve(row);
        });
    });
}

// returns the no of questions that a given user has a passed (testscore == 1)
async function getPassedAttempts(username) {
    return new Promise((resolve, reject) => {
        const sql = ` 
                    SELECT COUNT(DISTINCT CASE WHEN test_result = ?
                    THEN code_sample_id END) AS passed_questions
                    FROM Attempts 
                    WHERE username = ?
                    `;
        db.get(sql, [passGrade, username], (err, row) => {
            if (err) return reject(err);
            resolve(row);
        });
    });
}

// helper function to calculate all the metrics required for the student dashboard
async function calculateMetrics(username) {
    try {
        const [totalQuestions, attempts, maxScores, totalAttempts, passedQuestions] = await Promise.all([
            getTotalQuestions(),
            getStudentAttempts(username),
            getMaxScores(username),
            getTotalAttempts(username),
            getPassedAttempts(username)
        ]);

        return {
            totalAttempts,
            passedQuestions,
            totalQuestions,
            attempts,
            maxScores,
            passGrade
        };
    } catch (error) {
        throw new Error(`Failed to calculate metrics: ${error.message}`);
    }
}

/* GET metrics for the given username listed. */
router.get('/:username', async (req, res) => {
    const username = req.params.username;
    try {
        const metrics = await calculateMetrics(username);
        res.json(metrics);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;