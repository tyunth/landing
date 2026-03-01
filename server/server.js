const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 1000;

// Database connection
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true'
});

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || ['http://localhost:1000', 'https://igro-kon.ru'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, '../client')));

// File upload configuration
const uploadDir = path.join(__dirname, 'uploads');
const pdfDir = path.join(uploadDir, 'pdf');
const imagesDir = path.join(uploadDir, 'images');

// Create upload directories if they don't exist
[uploadDir, pdfDir, imagesDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// PDF upload configuration
const pdfStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, pdfDir);
    },
        filename: function (req, file, cb) {
            const ext = path.extname(file.originalname);
            const nameWithoutExt = path.basename(file.originalname, ext);
            const uniqueName = `book_${Date.now()}_${Math.random().toString(36).substr(2, 5)}${ext}`;
            cb(null, uniqueName);
        }
});

const uploadPdf = multer({
    storage: pdfStorage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 50000000 // 50MB
    },
    fileFilter: function (req, file, cb) {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Недопустимый формат файла. Разрешены только PDF файлы.'), false);
        }
    }
});

// Image upload configuration
const imageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, imagesDir);
    },
    filename: function (req, file, cb) {
        const uniqueName = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const uploadImage = multer({
    storage: imageStorage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10000000 // 10MB
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Недопустимый формат файла. Разрешены только изображения (JPEG, PNG, GIF).'), false);
        }
    }
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Database connection error:', err);
    } else {
        console.log('Database connected successfully');
    }
});

// API Routes

// Books API
app.get('/api/books', async (req, res) => {
    try {
        const { class: classFilter, subject, category, search } = req.query;
        
        let query = 'SELECT * FROM books WHERE 1=1';
        const params = [];
        let paramCount = 0;

        if (classFilter && classFilter !== 'all') {
            paramCount++;
            query += ` AND class = $${paramCount}`;
            params.push(parseInt(classFilter));
        }

        if (subject && subject !== 'all') {
            paramCount++;
            query += ` AND subject = $${paramCount}`;
            params.push(subject);
        }

        if (category && category !== 'all') {
            paramCount++;
            query += ` AND category = $${paramCount}`;
            params.push(category);
        }

        if (search) {
            paramCount++;
            query += ` AND (title ILIKE $${paramCount} OR author ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
            params.push(`%${search}%`);
        }

        query += ' ORDER BY upload_date DESC';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({ error: 'Ошибка при получении учебников' });
    }
});

app.post('/api/books', async (req, res) => {
    try {
        const { title, author, class: classNum, subject, category, description } = req.body;
        
        // Validate required fields
        if (!title || !author || !classNum || !subject || !category) {
            return res.status(400).json({ error: 'Все обязательные поля должны быть заполнены' });
        }

        const result = await pool.query(
            'INSERT INTO books (title, author, class, subject, category, description) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [title, author, parseInt(classNum), subject, category, description || null]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating book:', error);
        res.status(500).json({ error: 'Ошибка при создании учебника' });
    }
});

app.delete('/api/books/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // First, get the file path to delete the file
        const bookResult = await pool.query('SELECT file_path FROM books WHERE id = $1', [id]);
        
        if (bookResult.rows.length === 0) {
            return res.status(404).json({ error: 'Учебник не найден' });
        }

        // Delete the file from filesystem
        const filePath = bookResult.rows[0].file_path;
        if (filePath && fs.existsSync(path.join(__dirname, filePath))) {
            fs.unlinkSync(path.join(__dirname, filePath));
        }

        // Delete from database
        await pool.query('DELETE FROM books WHERE id = $1', [id]);
        res.json({ message: 'Учебник удален' });
    } catch (error) {
        console.error('Error deleting book:', error);
        res.status(500).json({ error: 'Ошибка при удалении учебника' });
    }
});

// PDF Upload
app.post('/api/upload/pdf', uploadPdf.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Файл не загружен' });
        }

        const { bookId } = req.body;
        const filePath = `/uploads/pdf/${req.file.filename}`;
        const fileSize = req.file.size;

        // Update book record with file path
        if (bookId) {
            await pool.query(
                'UPDATE books SET file_path = $1, file_size = $2 WHERE id = $3',
                [filePath, fileSize, parseInt(bookId)]
            );
        }

        res.json({
            message: 'PDF файл успешно загружен',
            filePath: filePath,
            fileName: req.file.filename,
            fileSize: fileSize
        });
    } catch (error) {
        console.error('Error uploading PDF:', error);
        if (error.message.includes('Недопустимый формат')) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Ошибка при загрузке PDF файла' });
    }
});

// Simple upload endpoint for compatibility with upload.js
// Обновленный эндпоинт для загрузки
app.post('/api/upload-compat', uploadPdf.single('file'), async (req, res) => {
    try {
        console.log('Получен запрос на загрузку файла:', req.file ? req.file.originalname : 'нет файла');
        
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'Файл не загружен' });
        }

        // Путь к папке pdf в корне проекта (вне папки server)
        const rootPdfDir = path.join(__dirname, '../pdf');
        
        if (!fs.existsSync(rootPdfDir)) {
            fs.mkdirSync(rootPdfDir, { recursive: true });
        }

        const newFilePath = path.join(rootPdfDir, req.file.filename);
        const oldFilePath = req.file.path;

        // Перемещаем файл
        fs.renameSync(oldFilePath, newFilePath);

        res.json({
            success: true,
            filename: req.file.filename,
            message: 'Файл успешно загружен'
        });
    } catch (error) {
        console.error('Ошибка при перемещении файла:', error);
        res.status(500).json({ success: false, error: 'Ошибка сервера при сохранении файла' });
    }
});

// Tasks API
app.get('/api/tasks', async (req, res) => {
    try {
        const { class: classFilter, theme, search } = req.query;
        
        let query = 'SELECT * FROM tasks WHERE 1=1';
        const params = [];
        let paramCount = 0;

        if (classFilter && classFilter !== 'all') {
            paramCount++;
            query += ` AND class = $${paramCount}`;
            params.push(parseInt(classFilter));
        }

        if (theme && theme !== 'all') {
            paramCount++;
            query += ` AND theme = $${paramCount}`;
            params.push(theme);
        }

        if (search) {
            paramCount++;
            query += ` AND description ILIKE $${paramCount}`;
            params.push(`%${search}%`);
        }

        query += ' ORDER BY created_at DESC';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Ошибка при получении задач' });
    }
});

app.post('/api/tasks', async (req, res) => {
    try {
        const { class: classNum, theme, description, answer } = req.body;
        
        // Validate required fields
        if (!classNum || !theme || !description || !answer) {
            return res.status(400).json({ error: 'Все обязательные поля должны быть заполнены' });
        }

        const result = await pool.query(
            'INSERT INTO tasks (class, theme, description, answer) VALUES ($1, $2, $3, $4) RETURNING *',
            [parseInt(classNum), theme, description, answer]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ error: 'Ошибка при создании задачи' });
    }
});

app.delete('/api/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // First, get the image path to delete the file
        const taskResult = await pool.query('SELECT image_path FROM tasks WHERE id = $1', [id]);
        
        if (taskResult.rows.length === 0) {
            return res.status(404).json({ error: 'Задача не найдена' });
        }

        // Delete the image file from filesystem
        const imagePath = taskResult.rows[0].image_path;
        if (imagePath && fs.existsSync(path.join(__dirname, imagePath))) {
            fs.unlinkSync(path.join(__dirname, imagePath));
        }

        // Delete from database
        await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
        res.json({ message: 'Задача удалена' });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ error: 'Ошибка при удалении задачи' });
    }
});

// Image Upload
app.post('/api/upload/image', uploadImage.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Изображение не загружено' });
        }

        const { taskId } = req.body;
        const imagePath = `/uploads/images/${req.file.filename}`;

        // Update task record with image path
        if (taskId) {
            await pool.query(
                'UPDATE tasks SET image_path = $1 WHERE id = $2',
                [imagePath, parseInt(taskId)]
            );
        }

        res.json({
            message: 'Изображение успешно загружено',
            imagePath: imagePath,
            fileName: req.file.filename
        });
    } catch (error) {
        console.error('Error uploading image:', error);
        if (error.message.includes('Недопустимый формат')) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Ошибка при загрузке изображения' });
    }
});

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve PDF files from root /pdf directory
app.use('/pdf', express.static(path.join(__dirname, '../pdf')));

// Error handling middleware
app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Database: ${process.env.DB_NAME}`);
    console.log(`Upload directory: ${uploadDir}`);
});

module.exports = app;