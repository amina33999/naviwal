const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const multer = require('multer'); // Добавили multer для загрузки фото
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Настраиваем раздачу загруженных фото как статических файлов (чтобы фронтенд их видел)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Создаем папку uploads, если её еще нет
if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
}

// Конфигурация хранения файлов multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // Делаем уникальное имя: timestamp + расширение исходного файла
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

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

    // 3. ОБНОВЛЕННАЯ таблица сотрудников (employees) со всеми полями из ТЗ
    db.run(`
        CREATE TABLE IF NOT EXISTS employees (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            position TEXT NOT NULL,
            department_id INTEGER,
            salary REAL,
            email TEXT,
            phone TEXT,          -- Новое поле: Внутренний телефон
            hire_date TEXT,      -- Новое поле: Дата приёма на работу
            bio TEXT,            -- Новое поле: Краткая биография
            photo_url TEXT,      -- Новое поле: Путь к фотографии
            FOREIGN KEY (department_id) REFERENCES departments(id)
        )
    `);

    // Автоматическая миграция: добавляем новые колонки в уже существующую базу, если они отсутствуют
    const alterColumns = [
        { name: 'phone', type: 'TEXT' },
        { name: 'hire_date', type: 'TEXT' },
        { name: 'bio', type: 'TEXT' },
        { name: 'photo_url', type: 'TEXT' }
    ];
    alterColumns.forEach(col => {
        db.run(`ALTER TABLE employees ADD COLUMN ${col.name} ${col.type}`, (err) => {
            // Игнорируем ошибку, если колонка уже существует
        });
    });

    // Заполним тестовыми данными отделы, если они пустые
    db.get("SELECT COUNT(*) as count FROM departments", (err, row) => {
        if (row && row.count === 0) {
            db.run("INSERT INTO departments (name) VALUES ('IT'), ('HR'), ('Маркетинг'), ('Бухгалтерия')");
        }
    });

    // Создаем дефолтного админа
    db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
        if (row && row.count === 0) {
            const adminUsername = 'admin';
            const adminPlainPassword = 'admin123';
            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = bcrypt.hashSync(adminPlainPassword, salt);

            db.run("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", [adminUsername, hashedPassword, 'administrator']);
        }
    });
});

// ==========================================
// API-МАРШРУТЫ
// ==========================================

// 1. ПОЛУЧЕНИЕ СПИСКА + СЕРВЕРНЫЙ ПОИСК И ФИЛЬТРАЦИЯ
app.get('/api/employees', (req, res) => {
    const { search, department } = req.query;
    
    let query = `
        SELECT employees.*, departments.name as department_name 
        FROM employees 
        LEFT JOIN departments ON employees.department_id = departments.id 
        WHERE 1=1
    `;
    let params = [];

    if (search) {
        query += ' AND (employees.name LIKE ? OR employees.position LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
    }

    if (department) {
        query += ' AND employees.department_id = ?';
        params.push(department);
    }

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Новый маршрут для изолированной загрузки картинки (возвращает путь к фото)
app.post('/api/employees/upload-photo', upload.single('photo'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'Файл не загружен' });
    }
    const photoUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    res.json({ success: true, photo_url: photoUrl });
});

// 2. ДОБАВЛЕНИЕ ЗАПИСИ (с учетом новых полей)
app.post('/api/employees', (req, res) => {
    const { name, position, department_id, salary, email, phone, hire_date, bio, photo_url } = req.body;
    const query = 'INSERT INTO employees (name, position, department_id, salary, email, phone, hire_date, bio, photo_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    
    db.run(query, [name, position, department_id, salary, email, phone, hire_date, bio, photo_url], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: this.lastID, name, position, department_id, salary, email, phone, hire_date, bio, photo_url });
    });
});

// 3. РЕДАКТИРОВАНИЕ ЗАПИСИ (с учетом новых полей)
app.put('/api/employees/:id', (req, res) => {
    const { id } = req.params;
    const { name, position, department_id, salary, email, phone, hire_date, bio, photo_url } = req.body;
    const query = 'UPDATE employees SET name = ?, position = ?, department_id = ?, salary = ?, email = ?, phone = ?, hire_date = ?, bio = ?, photo_url = ? WHERE id = ?';

    db.run(query, [name, position, department_id, salary, email, phone, hire_date, bio, photo_url, id], function(err) {
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

// 5. ЭКСПОРТ В CSV (Добавили новые поля в выгрузку)
app.get('/api/employees/export', (req, res) => {
    const query = `
        SELECT employees.id, employees.name, employees.position, departments.name as dept, employees.salary, employees.email, employees.phone, employees.hire_date 
        FROM employees 
        LEFT JOIN departments ON employees.department_id = departments.id
    `;
    
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });

        let csvContent = '\uFEFFID;Имя;Должность;Отдел;Зарплата;Email;Телефон;ДатаПриёма\n';
        rows.forEach(emp => {
            csvContent += `${emp.id};"${emp.name}";"${emp.position}";"${emp.dept || ''}";${emp.salary || 0};"${emp.email || ''}";"${emp.phone || ''}";"${emp.hire_date || ''}"\n`;
        });

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename=employees_report.csv');
        res.status(200).send(csvContent);
    });
});

app.get('/api/departments', (req, res) => {
    db.all('SELECT * FROM departments', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 6. БЕЗОПАСНАЯ АУТЕНТИФИКАЦИЯ
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Заполните все поля.' });
    }

    const query = 'SELECT * FROM users WHERE username = ?';
    db.get(query, [username], (err, user) => {
        if (err) return res.status(500).json({ success: false, message: 'Ошибка сервера.' });
        if (!user) return res.status(401).json({ success: false, message: 'Неверный логин или пароль.' });

        const isPasswordValid = bcrypt.compareSync(password, user.password);
        if (!isPasswordValid) return res.status(401).json({ success: false, message: 'Неверный логин или пароль.' });

        return res.json({ 
            success: true, 
            token: 'fake-jwt-token-for-demo-purposes', 
            user: { username: user.username, role: user.role }
        });
    });
});

// РЕГИСТРАЦИЯ
app.post('/api/auth/register', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ success: false, message: 'Заполните все поля.' });

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    const query = 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)';
    
    db.run(query, [username, hashedPassword, 'user'], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(400).json({ success: false, message: 'Логин занят.' });
            }
            return res.status(500).json({ success: false, message: 'Ошибка сохранения.' });
        }
        res.status(201).json({ success: true });
    });
});

app.listen(PORT, () => {
    console.log(`Сервер бэкенда запущен на http://localhost:${PORT}`);
});