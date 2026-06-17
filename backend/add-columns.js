// add-columns.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('company.db');

console.log("🔄 Добавляем недостающие поля в таблицу...");

db.serialize(() => {

    db.run(`ALTER TABLE employees ADD COLUMN phone TEXT;`, (err) => {
        if (err) {
            if (err.message.includes("duplicate column")) {
                console.log("✅ phone — уже существует");
            } else {
                console.error("❌ phone:", err.message);
            }
        } else {
            console.log("✅ phone успешно добавлен");
        }
    });

    db.run(`ALTER TABLE employees ADD COLUMN hire_date TEXT;`, (err) => {
        if (err) {
            if (err.message.includes("duplicate column")) {
                console.log("✅ hire_date — уже существует");
            } else {
                console.error("❌ hire_date:", err.message);
            }
        } else {
            console.log("✅ hire_date успешно добавлен");
        }
    });

    db.run(`ALTER TABLE employees ADD COLUMN bio TEXT;`, (err) => {
        if (err) {
            if (err.message.includes("duplicate column")) {
                console.log("✅ bio — уже существует");
            } else {
                console.error("❌ bio:", err.message);
            }
        } else {
            console.log("✅ bio успешно добавлен");
        }
    });
});

db.close(() => {
    console.log("\n Готово! Теперь можно обновлять backend.");
});