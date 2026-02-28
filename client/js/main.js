// Главный JavaScript-файл для управления навигацией и основными функциями

// Глобальные переменные
let currentPdfDoc = null;
let currentPageNum = 1;
let pdfViewer = null;

// Конфигурация API
const API_BASE_URL = 'http://localhost:1000/api';

// Учебники
let books = [];

// Задачи
let tasks = [];

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initContactForm();
    initNotifications();
    initTasks();
    
    // Загружаем данные с сервера
    loadBooksFromServer();
    loadTasksFromServer();
});

// Инициализация навигации
function initNavigation() {
    // Обработчики для фильтров и поиска учебников
    document.getElementById('search-input').addEventListener('input', filterBooks);
    document.getElementById('class-filter').addEventListener('change', filterBooks);
    document.getElementById('subject-filter').addEventListener('change', filterBooks);
    document.getElementById('category-filter').addEventListener('change', filterBooks);
    
    // Обработчики для фильтров и поиска задач
    const taskSearchInput = document.getElementById('task-search-input');
    const taskClassFilter = document.getElementById('task-class-filter');
    const taskThemeFilter = document.getElementById('task-theme-filter');
    
    if (taskSearchInput) taskSearchInput.addEventListener('input', filterTasks);
    if (taskClassFilter) taskClassFilter.addEventListener('change', filterTasks);
    if (taskThemeFilter) taskThemeFilter.addEventListener('change', filterTasks);
}

// Навигация между страницами
function navigateTo(pageId) {
    // Скрываем все страницы
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    
    // Показываем нужную страницу
    const targetPage = document.getElementById(pageId + '-page');
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // Скрываем модальное окно PDF при переходе
    closePdfViewer();
}

// Инициализация формы контактов
function initContactForm() {
    const form = document.getElementById('contact-form');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;
        
        if (name && email && message) {
            // Отправка сообщения на сервер
            sendContactMessage({ name, email, message });
            form.reset();
        } else {
            showNotification('Пожалуйста, заполните все поля', 'error');
        }
    });
}

// Отправка сообщения через API
async function sendContactMessage(data) {
    try {
        const response = await fetch(`${API_BASE_URL}/contact`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            showNotification('Сообщение отправлено!', 'success');
        } else {
            showNotification('Ошибка отправки сообщения', 'error');
        }
    } catch (error) {
        console.error('Error sending message:', error);
        showNotification('Ошибка сети', 'error');
    }
}

// Уведомления
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Загрузка учебников с сервера
async function loadBooksFromServer() {
    try {
        const response = await fetch(`${API_BASE_URL}/books`);
        if (response.ok) {
            books = await response.json();
            renderBooks();
        } else {
            throw new Error('Ошибка загрузки учебников');
        }
    } catch (error) {
        console.error('Error loading books:', error);
        showNotification('Ошибка загрузки учебников', 'error');
    }
}

// Загрузка задач с сервера
async function loadTasksFromServer() {
    try {
        const response = await fetch(`${API_BASE_URL}/tasks`);
        if (response.ok) {
            tasks = await response.json();
            renderTasks();
        } else {
            throw new Error('Ошибка загрузки задач');
        }
    } catch (error) {
        console.error('Error loading tasks:', error);
        showNotification('Ошибка загрузки задач', 'error');
    }
}

// Фильтрация учебников
function filterBooks() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const classFilter = document.getElementById('class-filter').value;
    const subjectFilter = document.getElementById('subject-filter').value;
    const categoryFilter = document.getElementById('category-filter').value;
    
    let filteredBooks = books.filter(book => {
        // Поиск по названию
        const matchesSearch = book.title.toLowerCase().includes(searchTerm) || 
                             book.author.toLowerCase().includes(searchTerm) ||
                             (book.description && book.description.toLowerCase().includes(searchTerm));
        
        // Фильтр по классу
        const matchesClass = classFilter === 'all' || book.class.toString() === classFilter;
        
        // Фильтр по предмету
        const matchesSubject = subjectFilter === 'all' || book.subject === subjectFilter;
        
        // Фильтр по категории
        const matchesCategory = categoryFilter === 'all' || book.category === categoryFilter;
        
        return matchesSearch && matchesClass && matchesSubject && matchesCategory;
    });
    
    renderBooks(filteredBooks);
}

// Отображение учебников
function renderBooks(booksToRender = null) {
    const container = document.getElementById('books-grid');
    const booksToShow = booksToRender || books;
    
    container.innerHTML = '';
    
    if (booksToShow.length === 0) {
        container.innerHTML = `
            <div class="no-books">
                <div class="no-books-icon">📚</div>
                <h3>Учебники не найдены</h3>
                <p>Попробуйте изменить параметры поиска или загрузите новый учебник</p>
            </div>
        `;
        return;
    }
    
    booksToShow.forEach(book => {
        const bookCard = document.createElement('div');
        bookCard.className = 'book-card';
        bookCard.innerHTML = `
            <div class="book-header">
                <div class="book-icon">📖</div>
                <div class="book-info">
                    <h3>${book.title}</h3>
                    <p class="book-author">Автор: ${book.author}</p>
                </div>
            </div>
            <div class="book-meta">
                <span class="tag">📚 ${book.class} класс</span>
                <span class="tag">${getSubjectIcon(book.subject)} ${getSubjectName(book.subject)}</span>
                <span class="tag">${getCategoryIcon(book.category)} ${getCategoryName(book.category)}</span>
            </div>
            <div class="book-description">
                <p>${book.description || 'Описание отсутствует'}</p>
            </div>
            <div class="book-actions">
                ${book.file_path ? `
                    <button class="btn btn-primary" onclick="openPdfViewer('${book.file_path}', '${book.title}')">
                        <i class="fas fa-eye"></i> Просмотреть
                    </button>
                    <button class="btn btn-secondary" onclick="downloadBook('${book.file_path}', '${book.title}')">
                        <i class="fas fa-download"></i> Скачать
                    </button>
                ` : `
                    <button class="btn btn-tertiary" disabled>
                        <i class="fas fa-file-pdf"></i> Файл не загружен
                    </button>
                `}
            </div>
        `;
        container.appendChild(bookCard);
    });
}

// Вспомогательные функции для отображения учебников
function getSubjectIcon(subject) {
    switch(subject) {
        case 'math': return '➗';
        case 'algebra': return '🔢';
        case 'geometry': return '📐';
        default: return '📚';
    }
}

function getSubjectName(subject) {
    switch(subject) {
        case 'math': return 'Математика';
        case 'algebra': return 'Алгебра';
        case 'geometry': return 'Геометрия';
        default: return 'Предмет';
    }
}

function getCategoryIcon(category) {
    switch(category) {
        case 'basic': return '📘';
        case 'additional': return '📗';
        case 'recommended': return '📕';
        default: return '📚';
    }
}

function getCategoryName(category) {
    switch(category) {
        case 'basic': return 'Основные';
        case 'additional': return 'Дополнительные';
        case 'recommended': return 'Рекомендованные';
        default: return 'Категория';
    }
}

// Функции для работы с PDF
function openPdfViewer(fileUrl, title) {
    document.getElementById('pdf-modal').classList.add('active');
    document.getElementById('pdf-title').textContent = title;
    
    // Загружаем PDF через PDF.js
    loadPdf(fileUrl).then(function() {
        // PDF успешно загружен
        fitToContainer();
    });
    
    // Сбрасываем номер страницы
    pageNum = 1;
    document.getElementById('page-info').textContent = 'Страница 1 из 1';
}

function closePdfViewer() {
    document.getElementById('pdf-modal').classList.remove('active');
    document.getElementById('pdf-container').innerHTML = '';
    pdfDoc = null;
    pageNum = 1;
    canvas = null;
    ctx = null;
}

function nextPage() {
    if (pdfDoc) {
        onNextPage();
    } else {
        showNotification('Сначала загрузите PDF', 'error');
    }
}

function prevPage() {
    if (pdfDoc) {
        onPrevPage();
    } else {
        showNotification('Сначала загрузите PDF', 'error');
    }
}

function downloadBook(fileUrl, title) {
    if (fileUrl) {
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = title + '.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showNotification('Загрузка началась', 'success');
    } else {
        showNotification('Файл не доступен для скачивания', 'error');
    }
}

// Инициализация задач
function initTasks() {
    // Обработчик кнопки добавления задачи
    const addTaskBtn = document.querySelector('.upload-btn[onclick*="Добавить задачу"]');
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', showTaskForm);
    }
    
    // Обработчик формы добавления задачи
    const taskForm = document.getElementById('task-form');
    if (taskForm) {
        taskForm.addEventListener('submit', handleTaskFormSubmit);
    }
}

// Фильтрация задач
function filterTasks() {
    const searchTerm = document.getElementById('task-search-input').value.toLowerCase();
    const classFilter = document.getElementById('task-class-filter').value;
    const themeFilter = document.getElementById('task-theme-filter').value;
    
    let filteredTasks = tasks.filter(task => {
        // Поиск по описанию
        const matchesSearch = task.description.toLowerCase().includes(searchTerm);
        
        // Фильтр по классу
        const matchesClass = classFilter === 'all' || task.class.toString() === classFilter;
        
        // Фильтр по теме
        const matchesTheme = themeFilter === 'all' || task.theme === themeFilter;
        
        return matchesSearch && matchesClass && matchesTheme;
    });
    
    renderTasks(filteredTasks);
}

// Отображение задач
function renderTasks(tasksToRender = null) {
    const container = document.getElementById('tasks-grid');
    const tasksToShow = tasksToRender || tasks;
    
    container.innerHTML = '';
    
    if (tasksToShow.length === 0) {
        container.innerHTML = `
            <div class="no-books">
                <div class="no-books-icon">📐</div>
                <h3>Задачи не найдены</h3>
                <p>Попробуйте изменить параметры поиска или добавьте новую задачу</p>
            </div>
        `;
        return;
    }
    
    tasksToShow.forEach(task => {
        const taskCard = document.createElement('div');
        taskCard.className = 'task-card';
        taskCard.innerHTML = `
            <div class="task-header">
                <div class="task-icon">📐</div>
                <div class="task-info">
                    <h3>Задача ${task.id}</h3>
                    <p class="task-meta">Класс: ${task.class} | Тема: ${getThemeName(task.theme)}</p>
                </div>
            </div>
            <div class="task-description">
                <p>${task.description}</p>
            </div>
            <div class="task-actions">
                <button class="btn btn-primary" onclick="toggleAnswer(${task.id})">
                    <i class="fas fa-eye"></i> <span id="answer-btn-${task.id}">Показать ответ</span>
                </button>
                <button class="btn btn-secondary" onclick="deleteTask(${task.id})">
                    <i class="fas fa-trash"></i> Удалить
                </button>
            </div>
            <div class="answer-container" id="answer-${task.id}">
                <h4>Ответ:</h4>
                <p>${task.answer}</p>
            </div>
        `;
        container.appendChild(taskCard);
    });
}

// Вспомогательные функции для задач
function getThemeIcon(theme) {
    switch(theme) {
        case 'geometry': return '📐';
        case 'algebra': return '🔢';
        case 'trigonometry': return '📊';
        case 'stereometry': return '🧊';
        default: return '📐';
    }
}

function getThemeName(theme) {
    switch(theme) {
        case 'geometry': return 'Геометрия';
        case 'algebra': return 'Алгебра';
        case 'trigonometry': return 'Тригонометрия';
        case 'stereometry': return 'Стереометрия';
        default: return 'Тема';
    }
}

// Показ/скрытие ответа
function toggleAnswer(taskId) {
    const answerContainer = document.getElementById(`answer-${taskId}`);
    const answerBtn = document.getElementById(`answer-btn-${taskId}`);
    
    if (answerContainer.classList.contains('show')) {
        answerContainer.classList.remove('show');
        answerBtn.innerHTML = '<i class="fas fa-eye"></i> Показать ответ';
    } else {
        answerContainer.classList.add('show');
        answerBtn.innerHTML = '<i class="fas fa-eye-slash"></i> Скрыть ответ';
    }
}

// Показ формы добавления задачи
function showTaskForm() {
    const formContainer = document.getElementById('task-form-container');
    formContainer.style.display = 'block';
    
    // Прокрутка к форме
    formContainer.scrollIntoView({ behavior: 'smooth' });
}

// Отмена формы добавления задачи
function cancelTaskForm() {
    const formContainer = document.getElementById('task-form-container');
    formContainer.style.display = 'none';
    document.getElementById('task-form').reset();
}

// Обработка формы добавления задачи
async function handleTaskFormSubmit(e) {
    e.preventDefault();
    
    const classNum = document.getElementById('new-task-class').value;
    const theme = document.getElementById('new-task-theme').value;
    const description = document.getElementById('new-task-description').value;
    const answer = document.getElementById('new-task-answer').value;
    
    if (!classNum || !theme || !description || !answer) {
        showNotification('Пожалуйста, заполните все поля', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                class: parseInt(classNum),
                theme: theme,
                description: description,
                answer: answer
            })
        });
        
        if (response.ok) {
            const newTask = await response.json();
            tasks.push(newTask);
            renderTasks();
            cancelTaskForm();
            showNotification('Задача добавлена!', 'success');
        } else {
            throw new Error('Ошибка добавления задачи');
        }
    } catch (error) {
        console.error('Error creating task:', error);
        showNotification('Ошибка при добавлении задачи', 'error');
    }
}

// Удаление задачи
async function deleteTask(taskId) {
    if (!confirm('Вы уверены, что хотите удалить эту задачу?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            tasks = tasks.filter(task => task.id !== taskId);
            renderTasks();
            showNotification('Задача удалена', 'success');
        } else {
            throw new Error('Ошибка удаления задачи');
        }
    } catch (error) {
        console.error('Error deleting task:', error);
        showNotification('Ошибка при удалении задачи', 'error');
    }
}

// Инициализация уведомлений
function initNotifications() {
    // Можно добавить инициализацию push-уведомлений или других систем уведомлений
}