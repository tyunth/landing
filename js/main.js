// Главный JavaScript-файл для управления навигацией и основными функциями

// Глобальные переменные
let currentPdfDoc = null;
let currentPageNum = 1;
let pdfViewer = null;

// Учебники (будут загружаться из localStorage или использовать дефолтные)
let books = [];

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initContactForm();
    initNotifications();
    initTasks();
    
    // Загружаем учебники из localStorage
    loadBooks();
    
    // Если нет учебников, добавляем демо-данные
    if (books.length === 0) {
        addDemoBooks();
        saveBooks();
    }
    
    renderBooks();
    
    // Загружаем задачи из localStorage
    loadTasks();
    
    // Если нет задач, добавляем демо-данные
    if (tasks.length === 0) {
        addDemoTasks();
        saveTasks();
    }
    
    renderTasks();
});

// Инициализация навигации
function initNavigation() {
    // Обработчики для фильтров и поиска
    document.getElementById('search-input').addEventListener('input', filterBooks);
    document.getElementById('class-filter').addEventListener('change', filterBooks);
    document.getElementById('subject-filter').addEventListener('change', filterBooks);
    document.getElementById('category-filter').addEventListener('change', filterBooks);
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
            // Здесь можно добавить отправку на сервер
            showNotification('Сообщение отправлено!', 'success');
            form.reset();
        } else {
            showNotification('Пожалуйста, заполните все поля', 'error');
        }
    });
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

// Работа с localStorage для учебников
function saveBooks() {
    localStorage.setItem('mathBooks', JSON.stringify(books));
}

function loadBooks() {
    const saved = localStorage.getItem('mathBooks');
    if (saved) {
        books = JSON.parse(saved);
    }
}

function addDemoBooks() {
    books = [
        {
            id: 1,
            title: 'Математика 5 класс',
            author: 'Абылкасымова',
            class: 5,
            subject: 'math',
            category: 'basic',
            file: 'math-5-class.pdf',
            description: 'Учебник по математике для 5 класса'
        },
        {
            id: 2,
            title: 'Алгебра 7 класс',
            author: 'Шыныбеков',
            class: 7,
            subject: 'algebra',
            category: 'basic',
            file: 'algebra-7-class.pdf',
            description: 'Учебник по алгебре для 7 класса'
        },
        {
            id: 3,
            title: 'Геометрия 8 класс',
            author: 'Смирнов',
            class: 8,
            subject: 'geometry',
            category: 'basic',
            file: 'geometry-8-class.pdf',
            description: 'Учебник по геометрии для 8 класса'
        },
        {
            id: 4,
            title: 'Математика 6 класс',
            author: 'Абылкасымова',
            class: 6,
            subject: 'math',
            category: 'basic',
            file: 'math-6-class.pdf',
            description: 'Учебник по математике для 6 класса'
        },
        {
            id: 5,
            title: 'Алгебра 9 класс',
            author: 'Шыныбеков',
            class: 9,
            subject: 'algebra',
            category: 'recommended',
            file: 'algebra-9-class.pdf',
            description: 'Рекомендованный учебник по алгебре для 9 класса'
        },
        {
            id: 6,
            title: 'Геометрия 10-11 класс',
            author: 'Атанасян',
            class: 10,
            subject: 'geometry',
            category: 'additional',
            file: 'geometry-10-11-class.pdf',
            description: 'Дополнительный учебник по геометрии'
        }
    ];
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
                             book.author.toLowerCase().includes(searchTerm);
        
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
                <p>${book.description}</p>
            </div>
            <div class="book-actions">
                <button class="btn btn-primary" onclick="openPdfViewer('${book.file}', '${book.title}')">
                    <i class="fas fa-eye"></i> Просмотреть
                </button>
                <button class="btn btn-secondary" onclick="downloadBook('${book.file}', '${book.title}')">
                    <i class="fas fa-download"></i> Скачать
                </button>
            </div>
        `;
        container.appendChild(bookCard);
    });
}

// Вспомогательные функции для отображения
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
async function openPdfViewer(fileUrl, title) {
    document.getElementById('pdf-modal').classList.add('active');
    document.getElementById('pdf-title').textContent = title;
    
    const container = document.getElementById('pdf-container');
    
    try {
        // Показываем индикатор загрузки
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666;">
                <div style="font-size: 4rem; margin-bottom: 20px;">⏳</div>
                <h3>Загрузка PDF...</h3>
                <p>Файл: ${title}</p>
            </div>
        `;
        
        // Загружаем PDF с сервера
        const response = await fetch(`/pdf/${fileUrl}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const blob = await response.blob();
        
        // Загружаем PDF через PDF.js
        if (typeof pdfjsLib !== 'undefined') {
            // Инициализируем PDF.js
            const loadingTask = pdfjsLib.getDocument(URL.createObjectURL(blob));
            
            loadingTask.promise.then(function(pdf) {
                // Успешно загрузили PDF
                currentPdfDoc = pdf;
                currentPageNum = 1;
                document.getElementById('page-info').textContent = 'Страница 1 из ' + pdf.numPages;
                
                // Рендерим первую страницу
                renderPage(1);
                
                // Обновляем состояние кнопок
                updatePageButtons();
            }).catch(function(error) {
                console.error('Ошибка PDF.js:', error);
                showPdfError('Ошибка при открытии PDF: ' + error.message);
            });
        } else {
            showPdfError('PDF.js не загружен. Пожалуйста, обновите страницу.');
        }
        
    } catch (error) {
        console.error('Ошибка загрузки PDF:', error);
        showPdfError('Не удалось загрузить PDF файл: ' + error.message);
    }
}

// Показ ошибки PDF
function showPdfError(message) {
    const container = document.getElementById('pdf-container');
    container.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #ef4444;">
            <div style="font-size: 4rem; margin-bottom: 20px;">❌</div>
            <h3>Ошибка загрузки PDF</h3>
            <p>${message}</p>
            <button class="btn btn-primary" onclick="closePdfViewer()" style="margin-top: 20px;">
                <i class="fas fa-times"></i> Закрыть
            </button>
        </div>
    `;
}

// Рендеринг страницы PDF
function renderPage(num) {
    if (!currentPdfDoc) return;
    
    const container = document.getElementById('pdf-container');
    
    // Очищаем контейнер
    container.innerHTML = '';
    
    // Создаем canvas для рендеринга
    const canvas = document.createElement('canvas');
    canvas.id = 'pdf-canvas';
    container.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    
    currentPdfDoc.getPage(num).then(function(page) {
        // Вычисляем масштаб под размер контейнера
        const viewport = page.getViewport({ scale: 1 });
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        const scaleX = containerWidth / viewport.width;
        const scaleY = containerHeight / viewport.height;
        const scale = Math.min(scaleX, scaleY) * 0.95; // 95% для отступов
        
        const scaledViewport = page.getViewport({ scale: scale });
        
        // Устанавливаем размеры canvas
        canvas.height = scaledViewport.height;
        canvas.width = scaledViewport.width;
        
        // Рендерим страницу
        const renderContext = {
            canvasContext: ctx,
            viewport: scaledViewport
        };
        
        page.render(renderContext).promise.then(function() {
            // Страница успешно отрендерена
            document.getElementById('page-info').textContent = 'Страница ' + num + ' из ' + currentPdfDoc.numPages;
            currentPageNum = num;
            updatePageButtons();
        });
    });
}

// Обновление состояния кнопок
function updatePageButtons() {
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    
    if (prevBtn) {
        prevBtn.disabled = !currentPdfDoc || currentPageNum <= 1;
    }
    if (nextBtn) {
        nextBtn.disabled = !currentPdfDoc || currentPageNum >= currentPdfDoc.numPages;
    }
}

function closePdfViewer() {
    document.getElementById('pdf-modal').classList.remove('active');
    document.getElementById('pdf-container').innerHTML = '';
    currentPdfDoc = null;
    currentPageNum = 1;
}

function nextPage() {
    if (currentPdfDoc && currentPageNum < currentPdfDoc.numPages) {
        currentPageNum++;
        renderPage(currentPageNum);
    }
}

function prevPage() {
    if (currentPdfDoc && currentPageNum > 1) {
        currentPageNum--;
        renderPage(currentPageNum);
    }
}

function downloadBook(fileUrl, title) {
    // Логика скачивания файла
    showNotification('Функция скачивания в разработке', 'error');
}

// Инициализация задач
function initTasks() {
    // Обработчики для фильтров и поиска задач
    const taskSearchInput = document.getElementById('task-search-input');
    const taskClassFilter = document.getElementById('task-class-filter');
    const taskThemeFilter = document.getElementById('task-theme-filter');
    
    if (taskSearchInput) taskSearchInput.addEventListener('input', filterTasks);
    if (taskClassFilter) taskClassFilter.addEventListener('change', filterTasks);
    if (taskThemeFilter) taskThemeFilter.addEventListener('change', filterTasks);
    
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

// Работа с localStorage для задач
let tasks = [];

function saveTasks() {
    localStorage.setItem('mathTasks', JSON.stringify(tasks));
}

function loadTasks() {
    const saved = localStorage.getItem('mathTasks');
    if (saved) {
        tasks = JSON.parse(saved);
    }
}

function addDemoTasks() {
    tasks = [
        {
            id: 1,
            class: 7,
            theme: 'geometry',
            description: 'Найдите угол ABC на чертеже, если известно, что треугольник ABC - равнобедренный, а угол A = 50°',
            answer: 'Угол ABC = 65°, так как в равнобедренном треугольнике углы при основании равны, а сумма углов треугольника = 180°',
            image: 'task-1.png',
            createdAt: new Date().toLocaleDateString('ru-RU')
        },
        {
            id: 2,
            class: 8,
            theme: 'algebra',
            description: 'Решите уравнение по графику функции y = x² - 4x + 3',
            answer: 'Корни уравнения: x₁ = 1, x₂ = 3 (точки пересечения параболы с осью X)',
            image: 'task-2.png',
            createdAt: new Date().toLocaleDateString('ru-RU')
        },
        {
            id: 3,
            class: 9,
            theme: 'trigonometry',
            description: 'Найдите sin(α) по прямоугольному треугольнику, если противолежащий катет = 3, гипотенуза = 5',
            answer: 'sin(α) = 3/5 = 0.6',
            image: 'task-3.png',
            createdAt: new Date().toLocaleDateString('ru-RU')
        }
    ];
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
function handleTaskFormSubmit(e) {
    e.preventDefault();
    
    const classNum = document.getElementById('new-task-class').value;
    const theme = document.getElementById('new-task-theme').value;
    const description = document.getElementById('new-task-description').value;
    const answer = document.getElementById('new-task-answer').value;
    
    if (!classNum || !theme || !description || !answer) {
        showNotification('Пожалуйста, заполните все поля', 'error');
        return;
    }
    
    const newTask = {
        id: Date.now(),
        class: parseInt(classNum),
        theme: theme,
        description: description,
        answer: answer,
        image: 'default-task.png', // Пока заглушка
        createdAt: new Date().toLocaleDateString('ru-RU')
    };
    
    tasks.push(newTask);
    saveTasks();
    renderTasks();
    cancelTaskForm();
    showNotification('Задача добавлена!', 'success');
}

// Удаление задачи
function deleteTask(taskId) {
    if (confirm('Вы уверены, что хотите удалить эту задачу?')) {
        tasks = tasks.filter(task => task.id !== taskId);
        saveTasks();
        renderTasks();
        showNotification('Задача удалена', 'success');
    }
}

// Инициализация уведомлений
function initNotifications() {
    // Можно добавить инициализацию push-уведомлений или других систем уведомлений
}
