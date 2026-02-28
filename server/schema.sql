-- Math Landing Database Schema
-- Создание таблиц для учебников и задач

-- Таблица учебников
CREATE TABLE IF NOT EXISTS books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    class INTEGER NOT NULL CHECK (class >= 5 AND class <= 11),
    subject VARCHAR(50) NOT NULL CHECK (subject IN ('math', 'algebra', 'geometry')),
    category VARCHAR(50) NOT NULL CHECK (category IN ('basic', 'additional', 'recommended')),
    file_path VARCHAR(500) NOT NULL,
    description TEXT,
    file_size INTEGER,
    upload_date TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Таблица задач на готовых чертежах
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    class INTEGER NOT NULL CHECK (class >= 5 AND class <= 11),
    theme VARCHAR(50) NOT NULL CHECK (theme IN ('geometry', 'algebra', 'trigonometry', 'stereometry')),
    description TEXT NOT NULL,
    answer TEXT NOT NULL,
    image_path VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Таблица пользователей (для будущего развития)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'teacher' CHECK (role IN ('admin', 'teacher', 'student')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Индексы для улучшения производительности
CREATE INDEX IF NOT EXISTS idx_books_class ON books(class);
CREATE INDEX IF NOT EXISTS idx_books_subject ON books(subject);
CREATE INDEX IF NOT EXISTS idx_books_category ON books(category);
CREATE INDEX IF NOT EXISTS idx_books_upload_date ON books(upload_date);

CREATE INDEX IF NOT EXISTS idx_tasks_class ON tasks(class);
CREATE INDEX IF NOT EXISTS idx_tasks_theme ON tasks(theme);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);

-- Триггер для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Применение триггера к таблицам
DROP TRIGGER IF EXISTS update_books_updated_at ON books;
CREATE TRIGGER update_books_updated_at
    BEFORE UPDATE ON books
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Вставка демо-данных для учебников
INSERT INTO books (title, author, class, subject, category, file_path, description, file_size) VALUES
('Математика 5 класс', 'Абылкасымова', 5, 'math', 'basic', '/uploads/pdf/math-5-class.pdf', 'Учебник по математике для 5 класса', 15000000),
('Алгебра 7 класс', 'Шыныбеков', 7, 'algebra', 'basic', '/uploads/pdf/algebra-7-class.pdf', 'Учебник по алгебре для 7 класса', 18000000),
('Геометрия 8 класс', 'Смирнов', 8, 'geometry', 'basic', '/uploads/pdf/geometry-8-class.pdf', 'Учебник по геометрии для 8 класса', 22000000),
('Математика 6 класс', 'Абылкасымова', 6, 'math', 'basic', '/uploads/pdf/math-6-class.pdf', 'Учебник по математике для 6 класса', 16000000),
('Алгебра 9 класс', 'Шыныбеков', 9, 'algebra', 'recommended', '/uploads/pdf/algebra-9-class.pdf', 'Рекомендованный учебник по алгебре для 9 класса', 19000000),
('Геометрия 10-11 класс', 'Атанасян', 10, 'geometry', 'additional', '/uploads/pdf/geometry-10-11-class.pdf', 'Дополнительный учебник по геометрии', 25000000)
ON CONFLICT DO NOTHING;

-- Вставка демо-данных для задач
INSERT INTO tasks (class, theme, description, answer, image_path) VALUES
(7, 'geometry', 'Найдите угол ABC на чертеже, если известно, что треугольник ABC - равнобедренный, а угол A = 50°', 'Угол ABC = 65°, так как в равнобедренном треугольнике углы при основании равны, а сумма углов треугольника = 180°', '/uploads/images/task-1.png'),
(8, 'algebra', 'Решите уравнение по графику функции y = x² - 4x + 3', 'Корни уравнения: x₁ = 1, x₂ = 3 (точки пересечения параболы с осью X)', '/uploads/images/task-2.png'),
(9, 'trigonometry', 'Найдите sin(α) по прямоугольному треугольнику, если противолежащий катет = 3, гипотенуза = 5', 'sin(α) = 3/5 = 0.6', '/uploads/images/task-3.png')
ON CONFLICT DO NOTHING;