const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// ==========================================
// НАСТРОЙКА SQLite И МОДЕЛЕЙ ДАННЫХ
// ==========================================
const db = new sqlite3.Database('./company.db', (err) => {
    if (err) console.error('Ошибка подключения к БД:', err.message);
    else console.log('База данных SQLite (company.db) успешно создана и подключена.');
});

db.serialize(() => {
    // 1. Таблица отделов (departments)
    db.run(`
        CREATE TABLE IF NOT EXISTS departments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL
        )
    `);

    // 2. Таблица пользователей для авторизации (users)
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'user'
        )
    `);

    // 3. Таблица сотрудников (employees) с привязкой к отделам
    db.run(`
        CREATE TABLE IF NOT EXISTS employees (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            position TEXT NOT NULL,
            department_id INTEGER,
            salary REAL,
            email TEXT,
            FOREIGN KEY (department_id) REFERENCES departments(id)
        )
    `);

    // Заполним тестовыми данными отделы, если они пустые
    db.get("SELECT COUNT(*) as count FROM departments", (err, row) => {
        if (row && row.count === 0) {
            db.run("INSERT INTO departments (name) VALUES ('IT'), ('HR'), ('Маркетинг'), ('Бухгалтерия')");
        }
    });
});

// ==========================================
// API-МАРШРУТЫ (Неделя 3)
// ==========================================

// 1. ПОЛУЧЕНИЕ СПИСКА + ПОИСК И ФИЛЬТРАЦИЯ
// Связываем сотрудников с их отделами через SQL JOIN
app.get('/api/employees', (req, res) => {
    const { search, department } = req.query;
    
    let query = `
        SELECT employees.*, departments.name as department_name 
        FROM employees 
        LEFT JOIN departments ON employees.department_id = departments.id 
        WHERE 1=1
    `;
    let params = [];

    // Поиск по имени или должности
    if (search) {
        query += ' AND (employees.name LIKE ? OR employees.position LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
    }

    // Фильтрация по ID отдела
    if (department) {
        query += ' AND employees.department_id = ?';
        params.push(department);
    }

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 2. ДОБАВЛЕНИЕ ЗАПИСИ (Панель администратора)
app.post('/api/employees', (req, res) => {
    const { name, position, department_id, salary, email } = req.body;
    const query = 'INSERT INTO employees (name, position, department_id, salary, email) VALUES (?, ?, ?, ?, ?)';
    
    db.run(query, [name, position, department_id, salary, email], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: this.lastID, name, position, department_id, salary, email });
    });
});

// 3. РЕДАКТИРОВАНИЕ ЗАПИСИ
app.put('/api/employees/:id', (req, res) => {
    const { id } = req.params;
    const { name, position, department_id, salary, email } = req.body;
    const query = 'UPDATE employees SET name = ?, position = ?, department_id = ?, salary = ?, email = ? WHERE id = ?';

    db.run(query, [name, position, department_id, salary, email, id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Данные сотрудника обновлены успешно' });
    });
});

// 4. УДАЛЕНИЕ ЗАПИСИ
app.delete('/api/employees/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM employees WHERE id = ?', [id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Сотрудник успешно удален из базы данных' });
    });
});

// 5. ЭКСПОРТ В CSV
app.get('/api/employees/export', (req, res) => {
    const query = `
        SELECT employees.id, employees.name, employees.position, departments.name as dept, employees.salary, employees.email 
        FROM employees 
        LEFT JOIN departments ON employees.department_id = departments.id
    `;
    
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });

        // \uFEFF нужен Excel, чтобы не ломались русские буквы
        let csvContent = '\uFEFFID;Имя;Должность;Отдел;Зарплата;Email\n';
        rows.forEach(emp => {
            csvContent += `${emp.id};"${emp.name}";"${emp.position}";"${emp.dept || ''}";${emp.salary || 0};"${emp.email || ''}"\n`;
        });

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename=employees_report.csv');
        res.status(200).send(csvContent);
    });
});

// Вспомогательный маршрут: получить список всех отделов (пригодится фронтендерам для выпадающего списка)
app.get('/api/departments', (req, res) => {
    db.all('SELECT * FROM departments', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 6. РЕАЛИЗАЦИЯ ПРОСТОЙ СИСТЕМЫ АУТЕНТИФИКАЦИИ
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;

    // Простая проверка для демонстрации (учетные данные админа)
    if (username === 'admin' && password === 'admin123') {
        return res.json({ 
            success: true, 
            token: 'fake-jwt-token-for-demo-purposes', 
            user: { username: 'admin', role: 'administrator' },
            message: 'Авторизация прошла успешно!' 
        });
    } else {
        return res.status(401).json({ 
            success: false, 
            message: 'Неверное имя пользователя или пароль.' 
        });
    }
});

// ЗАПУСК СЕРВЕРА
app.listen(PORT, () => {
    console.log(`Сервер бэкенда запущен и ожидает запросы на http://localhost:${PORT}`);
});