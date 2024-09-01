const express = require('express');
const axios = require('axios')
const sqlite = require('sqlite3').verbose();
const router = express.Router();

let sql;

const db = new sqlite.Database('./database/promptcoded.db', sqlite.OPEN_READWRITE, (err) => {
    if (err) return console.error(err);
});

// Helper function to parse LLM code
function parseLlmCode(llm_code) {

    let returnVal = llm_code;
    let strIndex = 0;

    //first remove everything before the function comment block
    strIndex = returnVal.search("```");
    returnVal = returnVal.substring(strIndex, returnVal.length);

    // next remove everything before the function
    strIndex = returnVal.search("function");
    returnVal = returnVal.substring(strIndex, returnVal.length);

    // next remove everything after the function comment block
    strIndex = returnVal.search("```");
    returnVal = returnVal.substring(0, strIndex);

    return returnVal;
}

/* GET all attempts listed. */
router.get('/', async (req, res) => {
    try {
        sql = "SELECT * from Attempts";
        db.all(sql, [], (err, rows) => {
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

/* GET all attempts of a user.*/
router.get('/:username', async (req, res) => {
    try {
        var username = req.params.username;
        sql = `SELECT * from Attempts WHERE username = ?`;
        db.all(sql, [username], (err, rows) => {
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

/* GET count of attempts of a question by a user.*/
router.get('/:username/:codeSample/count', async (req, res) => {
    try {
        var username = req.params.username;
        var code_sample_id = req.params.codeSample;
        sql = `
                SELECT COUNT(*) 
                FROM Attempts 
                WHERE username = ? AND code_sample_id = ?
            `;
        db.all(sql, [username, code_sample_id], (err, rows) => {
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

/* helper for posting a new attempt. */
async function postAttempt(username, codeSampleId, user_description, test_result, llm_code, ticket_comment, flagged) {
    return new Promise((resolve, reject) => {
        try {
            
            // Validate foreign key constraints if applicable
            const userCheckSql = 'SELECT * FROM Users WHERE username = $username';
            const codeSampleCheckSql = 'SELECT * FROM CodeSamples WHERE code_sample_id = $codeSampleId';

            db.get(userCheckSql, { $username: username }, (userErr, userRow) => {
                if (userErr || !userRow) {
                    console.error('User not found or error:', userErr);
                    return res.json({ status: 300, success: false, error: 'User not found' });
                }

                db.get(codeSampleCheckSql, { $codeSampleId: codeSampleId }, (codeSampleErr, codeSampleRow) => {
                    if (codeSampleErr || !codeSampleRow) {
                        console.error('Code sample not found or error:', codeSampleErr);
                        return res.json({ status: 300, success: false, error: 'Code sample not found' });
                    }

                    const sql = `
                        INSERT INTO Attempts (
                            username,
                            code_sample_id,
                            test_result,
                            llm_code,
                            user_description,
                            ticket_comment,
                            flagged
                        ) VALUES ($username, $codeSampleId, $test_result, $llm_code, $user_description, $ticket_comment, $flagged)
                    `;

                    const params = {
                        $username: username,
                        $codeSampleId: codeSampleId,
                        $test_result: test_result || 0, // default to 0 if not provided
                        $llm_code: llm_code || '', // default to empty string if not provided
                        $user_description: user_description,
                        $ticket_comment: ticket_comment || '', // default to empty string if not provided
                        $flagged: flagged || 0 // default to 0 if not provided
                    };

                    db.run(sql, params, function (err) {
                        if (err) {
                            console.error('SQL error:', err);
                            return reject(err);
                        }
                        resolve({ status: 200, success: true, data: { attempt_id: this.lastID, test_result: test_result, llm_code: llm_code} });
                    });
                });
            });
        } catch (error) {
            console.error('Catch error:', error);
            reject(err);
        }
    });
};

/* POST a new attempt with LLM code response and test result. */
router.post('/:username/:codeSample/post', async (req, res) => {
    try {
        const username = req.params.username;
        const codeSampleId = req.params.codeSample;
        const { user_description} = req.body;

        // Check for required fields
        if (!username || !codeSampleId || !user_description) {
            return res.json({ status: 300, success: false, error: 'Required fields missing' });
        }

        // Validate foreign key constraints if applicable
        
        let llm_code = '';
        let test_result = 0;
        let ticket_comment = '';
        try{
            /*
            The host to use in the URL below depends on where the webapp is being run:
            - VIA Terminal: localhost:
            - VIA Docker: host.docker.interal:
            */
            await axios.post(' http://host.docker.internal:11434/api/generate', {
                model: 'tinyllama',
                // original prompt: Generate normal function, called myfunction in javascript for the following description: + [USER DESCRIPTION] + .
                prompt: "Make a simple javascript function called 'myfunction' without including any additional comments or text. This function should have the following specifications: " + user_description,
                options: {
                    temperature: 0
                },
                stream: false
              })
              .then(function (response) {
                llm_code = response.data.response
              })
              .catch(function (error) {
                //console.log(error);
              });
        } catch (error){
            return res.json({
                status: 400,
                success: false
            })
        }
        // Parsing the response
        original_llm_code = llm_code
        llm_code =  parseLlmCode(llm_code)
        let reversedStr = llm_code.split('').reverse().join(''); 
        let indexOfBrace = reversedStr.indexOf('}');
        let truncatedReversedStr = reversedStr.slice(indexOfBrace); 
        let truncatedStr = truncatedReversedStr.split('').reverse().join(''); 
        llm_code = truncatedStr
        let funcKeywordIndex = llm_code.indexOf("function");
        let parenthesisIndex = llm_code.indexOf("(", funcKeywordIndex);
        let functionName = llm_code.substring(funcKeywordIndex + "function".length, parenthesisIndex).trim();
        //console.log(llm_code)
        //console.log(functionName);  
  
        
        let unit_tests_json = {};
        // Execute query using get() method
        const fetchUnitTests = async () => {
            try {
                return new Promise((resolve, reject) => {
                    db.get('SELECT unit_tests FROM CodeSamples WHERE code_sample_id = ?', [codeSampleId], (err, row) => {
                        if (err) {
                            console.error('Error fetching unit tests:', err);
                            reject(err);
                        } else if (!row) {
                            //console.log(`No unit test found for code_sample_id ${codeSampleId}`);
                            reject(new Error(`No unit test found for code_sample_id ${codeSampleId}`));
                        } else {
                            resolve(JSON.parse(row.unit_tests));
                        }
                    });
                });
            } catch (err) {
                console.error('Error fetching unit tests:', err);
                throw err;
            }
        };
        unit_tests_json = await fetchUnitTests();
        const fs = require('fs');
        const filePath = './script.js';
        let script = "";
        let unit_test = [];
        let code_could_run = -1;
        let llm_outputs = []

        for(let i = 0; i < 3; i++){
           
            if (codeSampleId == 1){
                script = llm_code + "\n" + "console.log(" + functionName + "(" + unit_tests_json.inputs[i].foo + "," + unit_tests_json.inputs[i].bar + ") == " + unit_tests_json.outputs[i].returnVal + ")";  
            } else if ( codeSampleId == 2){
                script = llm_code + "\n" + "console.log(" + functionName + "(\"" + unit_tests_json.inputs[i].foo + "\"," + unit_tests_json.inputs[i].bar + ") == \"" + unit_tests_json.outputs[i].returnVal + "\")";  
            } else if ( codeSampleId == 4){
                script = llm_code + "\n" + "console.log(" + functionName + "([" + unit_tests_json.inputs[i].foo + "]," + unit_tests_json.inputs[i].bar + ") == " + unit_tests_json.outputs[i].returnVal + ")";  
            } else if ( codeSampleId == 5){
                script = llm_code + "\n" + "console.log(" + functionName + "(\"" + unit_tests_json.inputs[i].foo + "\") == \"" + unit_tests_json.outputs[i].returnVal + "\")";
            } else if ( codeSampleId == 6){
                let function_str ="function arraysEqual(arr1, arr2) {if (arr1.length !== arr2.length) {return false;} for (let i = 0; i < arr1.length; i++) {if (arr1[i] !== arr2[i]) {return false;}}return true;}"
                script = function_str + "\n" + llm_code + "\n" + "console.log(arraysEqual(" + functionName + "([" + unit_tests_json.inputs[i].foo + "], [" + unit_tests_json.inputs[i].bar + "]), [" + unit_tests_json.outputs[i].returnVal + "]))";
            } else if ( codeSampleId == 7){
                script = llm_code + "\n" + "console.log(" + functionName + "(" + JSON.stringify(unit_tests_json.inputs[i].foo) + ") == \"" + unit_tests_json.outputs[i].returnVal + "\")";
            } else if ( codeSampleId == 8){
                let function_str ="function arraysEqual(arr1, arr2) {if (arr1.length !== arr2.length) {return false;} for (let i = 0; i < arr1.length; i++) {if (arr1[i] !== arr2[i]) {return false;}}return true;}"
                script = function_str + llm_code + "\n" + "console.log(arraysEqual(" + functionName + "(" + unit_tests_json.inputs[i].foo + "), [" + unit_tests_json.outputs[i].returnVal + "]))";
            } else if ( codeSampleId == 9){
                script = llm_code + "\n" + "console.log(" + functionName + "([" + unit_tests_json.inputs[i].foo + "], " + unit_tests_json.inputs[i].bar + ") == [" + unit_tests_json.outputs[i].returnVal + "])";
            } else if ( codeSampleId == 10){
                script = llm_code + "\n" + "console.log(" + functionName + "([" + unit_tests_json.inputs[i].foo + "]) == [" + unit_tests_json.outputs[i].returnVal + "])";
            }
                        
            fs.writeFileSync(filePath, script, (err) => {
                if (err) {
                    console.error('Error writing file:', err);
                } else {
                    //console.log('llm_code file created successfully!');
                }
            });    


            
            let { spawnSync } = require('child_process');
            let result = spawnSync('node', [filePath]);

            if (result.error) {
                console.error(`Error spawning process: ${result.error.message}`);
            } else if (result.status !== 0) {
                console.error(`Script exited with code: ${result.status}`);
                if (result.stderr && result.stderr.length > 0) {
                    console.error(`Script errors:\n${result.stderr.toString()}`);
                }
            } else {
                //console.log(`Script output:\n${result.stdout}`);
                if(result.stdout.toString().trim() == "true"){
                    unit_test.push(1)
                    test_result += 1;
                    
                } else {
                    test_result += 0
                    unit_test.push(0)
                    
                }
                
            }
            if (codeSampleId == 1){
                script = llm_code + "\n" + "console.log(" + functionName + "(" + unit_tests_json.inputs[i].foo + "," + unit_tests_json.inputs[i].bar + ") )";  
            } else if ( codeSampleId == 2){
                script = llm_code + "\n" + "console.log(" + functionName + "(\"" + unit_tests_json.inputs[i].foo + "\"," + unit_tests_json.inputs[i].bar + "))";  
            } else if ( codeSampleId == 4){
                script = llm_code + "\n" + "console.log(" + functionName + "([" + unit_tests_json.inputs[i].foo + "]," + unit_tests_json.inputs[i].bar + "))";  
            } else if ( codeSampleId == 5){
                script = llm_code + "\n" + "console.log(" + functionName + "(\"" + unit_tests_json.inputs[i].foo + "\"))";
            } else if ( codeSampleId == 6){
                let function_str ="function arraysEqual(arr1, arr2) {if (arr1.length !== arr2.length) {return false;} for (let i = 0; i < arr1.length; i++) {if (arr1[i] !== arr2[i]) {return false;}}return true;}"
                script = function_str + "\n" + llm_code + "\n" + "console.log(" + functionName + "([" + unit_tests_json.inputs[i].foo + "], [" + unit_tests_json.inputs[i].bar + "]))";
            } else if ( codeSampleId == 7){
                script = llm_code + "\n" + "console.log(" + functionName + "(" + JSON.stringify(unit_tests_json.inputs[i].foo) + "))";
            } else if ( codeSampleId == 8){
                let function_str ="function arraysEqual(arr1, arr2) {if (arr1.length !== arr2.length) {return false;} for (let i = 0; i < arr1.length; i++) {if (arr1[i] !== arr2[i]) {return false;}}return true;}"
                script = function_str + llm_code + "\n" + "console.log(" + functionName + "(" + unit_tests_json.inputs[i].foo + "))";
            } else if ( codeSampleId == 9){
                script = llm_code + "\n" + "console.log(" + functionName + "([" + unit_tests_json.inputs[i].foo + "], " + unit_tests_json.inputs[i].bar + "))";
            } else if ( codeSampleId == 10){
                script = llm_code + "\n" + "console.log(" + functionName + "([" + unit_tests_json.inputs[i].foo + "]))";
            }
            fs.writeFileSync(filePath, script, (err) => {
                if (err) {
                    console.error('Error writing file:', err);
                } else {
                    //console.log('llm_code file created successfully!');
                }
            });  
            result = spawnSync('node', [filePath]);

            if (result.error) {
                console.error(`Error spawning process: ${result.error.message}`);                
                llm_outputs.push(false);
            } else if (result.status !== 0) {
                console.error(`Script exited with code: ${result.status}`);
                if (result.stderr && result.stderr.length > 0) {
                    console.error(`Script errors:\n${result.stderr.toString()}`);
                }
                llm_outputs.push(false);
            } else {
                //console.log(`Script output:\n${result.stdout.toString()}`);
                llm_outputs.push(result.stdout.toString());    
                //console.log(llm_outputs);
                code_could_run += 1;
            }
        }
        //console.log(`Final test result: ${test_result}`);

        if (test_result == 3){
            let attemptResult = await postAttempt(username, codeSampleId, user_description, test_result, llm_code, ticket_comment, 0);
            attemptResult.data.unit_test_result = unit_test
            attemptResult.data.unit_tests_json = unit_tests_json
            attemptResult.data.code_could_run = code_could_run
            attemptResult.data.llm_outputs = llm_outputs
            res.json(attemptResult);
        } else {
            let attemptResult = await postAttempt(username, codeSampleId, user_description, test_result, llm_code, ticket_comment, 0);
            attemptResult.data.unit_test_result = unit_test
            attemptResult.data.unit_tests_json = unit_tests_json
            attemptResult.data.code_could_run = code_could_run
            attemptResult.data.llm_outputs = llm_outputs
            res.json(attemptResult);
        }

    } catch (error) {

        if (error.message === "Required fields missing") {
            res.status(300).json({ success: false, error: error.message });
        }
        console.error('Catch error:', error);
        return res.json({
            status: 400,
            success: false,
            error: error.message
        });
    }
});

router.post('/:username/:codeSample/ticket', async (req, res) => {
    try {
        const { attempt_id, ticketDescription } = req.body;
        
        // Check for required fields
        if (!attempt_id || !ticketDescription) {
            return res.json({ status: 300, success: false, error: 'Required fields missing' });
        }

        const updateSql = `
            UPDATE Attempts
            SET flagged = 1, ticket_comment = ?
            WHERE attempt_id = ?
        `;

        db.run(updateSql, [ticketDescription, attempt_id], function (err) {
            if (err) {
                return res.json({ status: 300, success: false, error: err });
            }

            if (this.changes === 0) {
                return res.json({ status: 300, success: false, error: 'No matching attempt found' });
            }

            res.json({ status: 200, success: true, message: 'Attempt updated successfully' });
        });

    } catch (error) {
        console.error('Catch error:', error);
        return res.json({
            status: 400,
            success: false,
            error: error.message
        });
    }
});

router.post('/:username/:codeSample/retry', async (req, res) => {
    try {
        const { attempt_id, retryComment } = req.body;
        
        // Check for required fields
        if (!attempt_id || !retryComment) {
            return res.json({ status: 300, success: false, error: 'Required fields missing' });
        }

        const updateSql = `
            UPDATE Attempts
            SET flagged = 1, retry_comment = ?
            WHERE attempt_id = ?
        `;

        db.run(updateSql, [retryComment, attempt_id], function (err) {
            if (err) {
                return res.json({ status: 300, success: false, error: err });
            }

            if (this.changes === 0) {
                return res.json({ status: 300, success: false, error: 'No matching attempt found' });
            }

            res.json({ status: 200, success: true, message: 'Attempt updated successfully' });
        });

    } catch (error) {
        console.error('Catch error:', error);
        return res.json({
            status: 400,
            success: false,
            error: error.message
        });
    }
});




module.exports = router;