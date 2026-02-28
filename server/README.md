# Math Landing Server

Серверная часть приложения Math Landing - система управления учебниками и задачами по математике.

## Технологии

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **PostgreSQL** - Relational database
- **Multer** - File upload middleware
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variables

## Установка

1. Установите зависимости:
```bash
npm install
```

2. Создайте файл `.env` на основе `.env.example`:
```bash
cp .env.example .env
```

3. Настройте переменные окружения в `.env`:
```env
# Server Configuration
PORT=1000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=math_landing
DB_USER=your_username
DB_PASSWORD=your_password
DB_SSL=false

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=50000000  # 50MB

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h

# CORS Configuration
CORS_ORIGIN=http://localhost:1000
```

## Запуск

1. Запустите PostgreSQL сервер
2. Создайте базу данных `math_landing`
3. Выполните миграции из `schema.sql`
4. Запустите сервер:
```bash
node server.js
```

Сервер будет доступен на `http://localhost:1000`

## API Endpoints

### Учебники

- `GET /api/books` - Получить список учебников с фильтрацией
- `POST /api/books` - Создать новый учебник
- `DELETE /api/books/:id` - Удалить учебник
- `POST /api/upload/pdf` - Загрузить PDF файл

### Задачи

- `GET /api/tasks` - Получить список задач с фильтрацией
- `POST /api/tasks` - Создать новую задачу
- `DELETE /api/tasks/:id` - Удалить задачу
- `POST /api/upload/image` - Загрузить изображение

### Фильтрация

Для учебников доступна фильтрация по:
- Классу (5-11)
- Предмету (math, algebra, geometry)
- Категории (basic, additional, recommended)
- Поиску по названию, автору, описанию

Для задач доступна фильтрация по:
- Классу (5-11)
- Теме (geometry, algebra, trigonometry, stereometry)
- Поиску по описанию

## Структура базы данных

### Таблица `books`
- `id` - Уникальный идентификатор
- `title` - Название учебника
- `author` - Автор
- `class` - Класс (5-11)
- `subject` - Предмет
- `category` - Категория
- `file_path` - Путь к PDF файлу
- `description` - Описание
- `file_size` - Размер файла
- `upload_date` - Дата загрузки

### Таблица `tasks`
- `id` - Уникальный идентификатор
- `class` - Класс (5-11)
- `theme` - Тема задачи
- `description` - Описание задачи
- `answer` - Ответ
- `image_path` - Путь к изображению

### Таблица `users`
- `id` - Уникальный идентификатор
- `username` - Имя пользователя
- `email` - Email
- `password_hash` - Хеш пароля
- `role` - Роль (admin, teacher, student)

## Безопасность

- Валидация всех входящих данных
- Ограничение размера загружаемых файлов
- Проверка типов файлов
- CORS настройки
- SQL инъекции предотвращены через параметризованные запросы

## Файловая система

```
server/
├── uploads/
│   ├── pdf/          # PDF файлы учебников
│   └── images/       # Изображения для задач
├── schema.sql        # SQL схема базы данных
├── server.js         # Главный серверный файл
└── package.json      # Зависимости
```

## Разработка

Для разработки используйте:
- `nodemon` для автоматической перезагрузки сервера
- `pgAdmin` или `psql` для работы с базой данных
- `Postman` для тестирования API

## Production

Для production развертывания:
1. Используйте надежный хостинг для PostgreSQL
2. Настройте SSL сертификаты
3. Настройте балансировку нагрузки
4. Используйте CDN для статических файлов
5. Настройте мониторинг и логирование