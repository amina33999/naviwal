// add-photo-column.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('company.db');

db.run(`ALTER TABLE employees ADD COLUMN photo TEXT;`, (err) => {
    if (err) {
        if (err.message.includes("duplicate column")) {
            console.log("✅ Колонка photo уже существует");
        } else {
            console.error("❌ Ошибка:", err.message);
        }
    } else {
        console.log("✅ Колонка photo успешно добавлена");
    }
    db.close();
});