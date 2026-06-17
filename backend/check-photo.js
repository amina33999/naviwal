const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('company.db');

db.all("SELECT id, name, photo FROM employees WHERE photo IS NOT NULL LIMIT 5", (err, rows) => {
    if (err) console.error(err);
    else {
        console.log("Сотрудники с фото:");
        console.table(rows);
    }
    db.close();
});