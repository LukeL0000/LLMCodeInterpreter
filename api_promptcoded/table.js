const sqlite = require('sqlite3').verbose();
const db = new sqlite.Database('./database/promptcoded.db', sqlite.OPEN_READWRITE, (err) => {
    if(err) return console.error(err);
});
