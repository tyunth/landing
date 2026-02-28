// JavaScript для системы загрузки файлов

// Инициализация системы загрузки
document.addEventListener('DOMContentLoaded', function() {
    initFileUpload();
});

// Инициализация загрузки файлов
function initFileUpload() {
    const fileInput = document.getElementById('file-upload');
    const uploadStatus = document.getElementById('upload-status');
    
    if (fileInput) {
        fileInput.addEventListener('change', handleFileSelect);
    }
    
    // Добавляем drag and drop поддержку
    const uploadSection = document.querySelector('.upload-section');
    if (uploadSection) {
        uploadSection.addEventListener('dragover', handleDragOver);
        uploadSection.addEventListener('dragleave', handleDragLeave);
        uploadSection.addEventListener('drop', handleDrop);
    }
}

// Обработка выбора файла
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        validateAndProcessFile(file);
    }
}

// Обработка drag and drop
function handleDragOver(event) {
    event.preventDefault();
    const uploadSection = document.querySelector('.upload-section');
    uploadSection.style.backgroundColor = '#e2f0ff';
    uploadSection.style.borderColor = '#3b82f6';
}

function handleDragLeave(event) {
    event.preventDefault();
    const uploadSection = document.querySelector('.upload-section');
    uploadSection.style.backgroundColor = '';
    uploadSection.style.borderColor = '';
}

function handleDrop(event) {
    event.preventDefault();
    const uploadSection = document.querySelector('.upload-section');
    uploadSection.style.backgroundColor = '';
    uploadSection.style.borderColor = '';
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        validateAndProcessFile(files[0]);
    }
}

// Валидация и обработка файла
function validateAndProcessFile(file) {
    const uploadStatus = document.getElementById('upload-status');
    
    // Проверка формата файла
    if (!file.type || file.type !== 'application/pdf') {
        showUploadStatus('error', 'Пожалуйста, выберите PDF файл');
        return;
    }
    
    // Проверка размера файла (максимум 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
        showUploadStatus('error', 'Файл слишком большой. Максимальный размер: 50MB');
        return;
    }
    
    // Показываем процесс загрузки
    showUploadStatus('loading', 'Загрузка файла...');
    
    // Читаем файл
    const reader = new FileReader();
    reader.onload = function(e) {
        const fileData = e.target.result;
        
        // Генерируем уникальное имя файла
        const fileName = generateFileName(file.name);
        
        // Сохраняем файл в localStorage (в реальной системе это будет сервер)
        saveFileToStorage(fileName, fileData);
        
        // Добавляем учебник в список
        addBookFromFile(file, fileName);
        
        showUploadStatus('success', 'Файл успешно загружен!');
        
        // Очищаем input
        document.getElementById('file-upload').value = '';
    };
    
    reader.onerror = function() {
        showUploadStatus('error', 'Ошибка чтения файла');
    };
    
    reader.readAsDataURL(file);
}

// Генерация уникального имени файла
function generateFileName(originalName) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    const extension = '.pdf';
    
    // Очищаем оригинальное имя от недопустимых символов
    const cleanName = originalName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    
    return `book_${timestamp}_${random}_${cleanName}${extension}`;
}

// Сохранение файла в localStorage
function saveFileToStorage(fileName, fileData) {
    try {
        localStorage.setItem(`pdf_${fileName}`, fileData);
        console.log('Файл сохранен:', fileName);
    } catch (error) {
        console.error('Ошибка сохранения файла:', error);
        throw new Error('Не удалось сохранить файл');
    }
}

// Добавление учебника из загруженного файла
function addBookFromFile(file, fileName) {
    // Извлекаем имя автора из названия файла (упрощенная логика)
    const author = extractAuthorFromFile(file.name) || 'Неизвестный автор';
    const title = extractTitleFromFile(file.name) || file.name.replace('.pdf', '');
    
    // Создаем диалог для заполнения информации о учебнике
    const bookInfo = promptBookInfo(title, author);
    
    if (bookInfo) {
        const newBook = {
            id: Date.now(),
            title: bookInfo.title,
            author: bookInfo.author,
            class: parseInt(bookInfo.class),
            subject: bookInfo.subject,
            category: bookInfo.category,
            file: fileName,
            description: bookInfo.description || 'Описание отсутствует',
            size: formatFileSize(file.size),
            uploadDate: new Date().toLocaleDateString('ru-RU')
        };
        
        // Добавляем в глобальный массив books (доступен из main.js)
        if (typeof books !== 'undefined') {
            books.push(newBook);
            saveBooks(); // Функция из main.js
            renderBooks(); // Функция из main.js
        } else {
            // Если books не доступен, сохраняем в localStorage напрямую
            let currentBooks = JSON.parse(localStorage.getItem('mathBooks') || '[]');
            currentBooks.push(newBook);
            localStorage.setItem('mathBooks', JSON.stringify(currentBooks));
        }
        
        showNotification('Учебник добавлен в библиотеку!', 'success');
    }
}

// Извлечение автора из названия файла (упрощенная логика)
function extractAuthorFromFile(fileName) {
    // Простая логика - ищем возможные фамилии
    const possibleAuthors = ['Абылкасымова', 'Шыныбеков', 'Смирнов', 'Атанасян', 'Погорелов'];
    
    for (let author of possibleAuthors) {
        if (fileName.toLowerCase().includes(author.toLowerCase())) {
            return author;
        }
    }
    
    return null;
}

// Извлечение названия из имени файла
function extractTitleFromFile(fileName) {
    // Удаляем расширение и очищаем имя
    return fileName.replace('.pdf', '').replace(/_/g, ' ').replace(/-/g, ' ');
}

// Диалог для заполнения информации о учебнике
function promptBookInfo(defaultTitle, defaultAuthor) {
    const modal = document.createElement('div');
    modal.className = 'modal book-info-modal';
    modal.innerHTML = `
        <div class="modal-content" style="width: 90%; max-width: 500px;">
            <div class="modal-header">
                <h3>Информация о учебнике</h3>
                <button class="close-btn" onclick="closeBookInfoModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <form id="book-info-form">
                    <div class="form-group">
                        <label>Название учебника:</label>
                        <input type="text" id="book-title" value="${defaultTitle}" required>
                    </div>
                    <div class="form-group">
                        <label>Автор:</label>
                        <input type="text" id="book-author" value="${defaultAuthor}" required>
                    </div>
                    <div class="form-group">
                        <label>Класс:</label>
                        <select id="book-class" required>
                            <option value="">Выберите класс</option>
                            <option value="5">5 класс</option>
                            <option value="6">6 класс</option>
                            <option value="7">7 класс</option>
                            <option value="8">8 класс</option>
                            <option value="9">9 класс</option>
                            <option value="10">10 класс</option>
                            <option value="11">11 класс</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Предмет:</label>
                        <select id="book-subject" required>
                            <option value="">Выберите предмет</option>
                            <option value="math">Математика</option>
                            <option value="algebra">Алгебра</option>
                            <option value="geometry">Геометрия</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Категория:</label>
                        <select id="book-category" required>
                            <option value="">Выберите категорию</option>
                            <option value="basic">Основные</option>
                            <option value="additional">Дополнительные</option>
                            <option value="recommended">Рекомендованные</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Описание:</label>
                        <textarea id="book-description" rows="4" placeholder="Краткое описание учебника"></textarea>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeBookInfoModal()">Отмена</button>
                <button class="btn btn-primary" onclick="saveBookInfo()">Сохранить</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.classList.add('active');
    
    // Сохраняем ссылку на модальное окно в глобальной переменной
    window.currentBookInfoModal = modal;
    
    return null; // Пока не заполним форму
}

// Сохранение информации о учебнике
function saveBookInfo() {
    const modal = window.currentBookInfoModal;
    if (!modal) return;
    
    const title = document.getElementById('book-title').value;
    const author = document.getElementById('book-author').value;
    const classNum = document.getElementById('book-class').value;
    const subject = document.getElementById('book-subject').value;
    const category = document.getElementById('book-category').value;
    const description = document.getElementById('book-description').value;
    
    if (!title || !author || !classNum || !subject || !category) {
        showNotification('Пожалуйста, заполните все обязательные поля', 'error');
        return;
    }
    
    const bookInfo = {
        title: title,
        author: author,
        class: classNum,
        subject: subject,
        category: category,
        description: description
    };
    
    closeBookInfoModal();
    
    // Возвращаем информацию о книге
    if (typeof window.handleBookInfo !== 'undefined') {
        window.handleBookInfo(bookInfo);
    }
}

// Закрытие модального окна информации о учебнике
function closeBookInfoModal() {
    const modal = window.currentBookInfoModal;
    if (modal) {
        modal.remove();
        window.currentBookInfoModal = null;
    }
}

// Показ статуса загрузки
function showUploadStatus(type, message) {
    const uploadStatus = document.getElementById('upload-status');
    if (!uploadStatus) return;
    
    let icon = '';
    let color = '';
    
    switch(type) {
        case 'loading':
            icon = '🔄';
            color = '#3b82f6';
            break;
        case 'success':
            icon = '✅';
            color = '#10b981';
            break;
        case 'error':
            icon = '❌';
            color = '#ef4444';
            break;
    }
    
    uploadStatus.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px; color: ${color};">
            <span>${icon}</span>
            <span>${message}</span>
        </div>
    `;
    
    // Автоматическое скрытие сообщения об успехе
    if (type === 'success') {
        setTimeout(() => {
            uploadStatus.innerHTML = '';
        }, 3000);
    }
}

// Форматирование размера файла
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Экспорт функций для использования в других модулях
window.handleBookInfo = function(bookInfo) {
    // Эта функция будет вызвана из upload.js после заполнения формы
    console.log('Информация о книге:', bookInfo);
};

// Дополнительные функции для управления файлами
function deleteFile(fileName) {
    try {
        localStorage.removeItem(`pdf_${fileName}`);
        console.log('Файл удален:', fileName);
        return true;
    } catch (error) {
        console.error('Ошибка удаления файла:', error);
        return false;
    }
}

function getFileUrl(fileName) {
    return localStorage.getItem(`pdf_${fileName}`);
}

function listUploadedFiles() {
    const files = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('pdf_')) {
            files.push(key.replace('pdf_', ''));
        }
    }
    return files;
}

// Экспорт функций
window.deleteFile = deleteFile;
window.getFileUrl = getFileUrl;
window.listUploadedFiles = listUploadedFiles;

// Обработка ошибок загрузки
window.addEventListener('error', function(event) {
    if (event.filename && event.filename.includes('upload.js')) {
        console.error('Ошибка в системе загрузки:', event.error);
        showNotification('Произошла ошибка при загрузке файла', 'error');
    }
});