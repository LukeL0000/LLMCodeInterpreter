
var axios = require('axios')
var express = require('express');
var router = express.Router();
var sqlite = require('sqlite3').verbose();
let sql;
var bodyParser = require('body-parser');
var url = require('url');

const db = new sqlite.Database('./database/promptcoded.db', sqlite.OPEN_READWRITE, (err) => {
  if (err) return console.error(err);
});


/* GET users listing. */
router.get('/', async (req, res) => {
  try {
    sql = "SELECT * from Users";
    db.all(sql, [], (err, rows) => {
      if (err) return res.json({ status: 300, success: false, error: err });

      if (rows.length < 1) return res.json({ status: 300, success: false, error: "No Match" });

      return res.json({ status: 200, data: rows, success: true });
    });
  }
  catch (error) {
    return res.json({
      status: 400,
      success: false
    });
  }
});

/* GET all students name and username */
router.get('/students', async (req, res) => {
  try {
    sql = "SELECT name, username from Users WHERE role = 'Student'";
    db.all(sql, [], (err, rows) => {
      if (err) return res.json({ status: 300, success: false, error: err });

      if (rows.length < 1) return res.json({ status: 300, success: false, error: "No Match" });

      return res.json({ status: 200, data: rows, success: true });
    });
  }
  catch (error) {
    return res.json({
      status: 400,
      success: false
    });
  }
});

/* POST request to authentication endpoint for user registration. */
router.post('/register', async (req, res) => {
  try {
    const name = req.body.name;
    const username = req.body.username;
    const password = req.body.password;

    // Check for required fields
    if (!name || !username || !password) {
      return res.json({ status: 400, success: false, error: 'Required fields missing' });
    }

    // check that username doesn't already exist - return status 400 if already exists
    const checkUserSql = "SELECT * FROM Users WHERE username LIKE $username";
    db.get(checkUserSql, { $username: username }, (err, usernameRow) => {
      if (err) {
        console.error('Error:', err);
        return res.json({ status: 300, success: false, error: err });
      }

      if (userExists(usernameRow)) {
        return res.json({
          status: 400,
          success: false,
          error: "Username already exists - choose a new username",
        });
      }

      // check that name doesn't already exist - return status 400 if already exists
      const checkNameSql = "SELECT * FROM Users WHERE name == $name";
      db.get(checkNameSql, { $name: name }, (err, nameRow) => {
        if (err) {
          console.error('Error:', err);
          return res.json({ status: 300, success: false, error: err });
        }

        if (nameRow != null) {
          return res.json({
            status: 400,
            success: false,
            error: "Account for this name already exists",
          });
        }

        // Add user to users table if previous conditions met
        const addUserSql = `
                          INSERT INTO Users(username, name, password, role)
                          VALUES ($username, $name, $password, 'Student')
                          `;

        db.run(addUserSql, { $username: username, $name: name, $password: password }, function (err) {
          if (err) {
            console.error('Error:', err);
            return res.json({ status: 300, success: false, error: err });
          }

          const token = generateToken();

          return res.json({
            status: 200,
            token: token,
            data: {
              user: {
                username: username,
                name: name,
                role: 'Student',
              }
            },
            success: true,
            message: 'New user successfully added'
          });
        });
      });
    });
  } catch (error) {
    console.error(error.message)
    return res.json({
      status: 300,
      success: false,
      error: error.message
    });
  }
});

/* POST request to authentication endpoint for user login. */
router.post('/login', async (req, res) => {
  try {
    const username = req.body.username;
    const password = req.body.password;

    // Get row from users table with matching username (not case-sensitive)
    const checkUserSql = "SELECT * FROM Users WHERE username LIKE $username";
    db.get(checkUserSql, { $username: username }, (err, userRow) => {
      if (err) {
        console.error('Error:', err);
        throw err;
      }

      const results = loginValidator(userRow, password);
      //console.log("Login Validated: ", results);

      const token = generateToken();

      if (results) {
        return res.json({
          status: 200,
          token: token,
          data: {
            user: {
              username: userRow.username,
              name: userRow.name,
              role: userRow.role,
            }
          },
          success: true,
        });
      }

      return res.json({
        status: 400,
        success: false,
        error: "Username or password is incorrect"
      });
    });
  } catch (error) {
    console.error(error.message)
    return res.json({
      status: 300,
      success: false,
      error: error.message
    });
  }
});

// HELPERS
function loginValidator(userRowData, passwordInput) {

  const user_exists = userExists(userRowData);
  if (!user_exists) return false;

  const password_correct = checkPassword(userRowData, passwordInput);
  return password_correct;
}

function userExists(userRow) {
  if (!userRow) return false;
  return true;
}

function checkPassword(userRow, passwordInput) {
  if (!userRow || !passwordInput) return false;

  return userRow.password === passwordInput;
}

// generate a random token for login session
function generateToken() {
  return Math.random().toString(36).substring(2);
}


module.exports = router;
