// JavaScript для системы загрузки файлов на сервер

// Конфигурация API
const API_BASE_URL = 'http://localhost:1000/api';

// Инициализация системы загрузки
document.addEventListener('DOMContentLoaded', function() {
    initFileUpload();
    initImageUpload();
});

// Инициализация загрузки PDF файлов
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

// Инициализация загрузки изображений
function initImageUpload() {
    const imageInput = document.getElementById('task-image-upload');
    const uploadStatus = document.getElementById('task-upload-status');
    
    if (imageInput) {
        imageInput.addEventListener('change', handleImageSelect);
    }
}

// Обработка выбора PDF файла
async function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        await validateAndUploadPdf(file);
    }
}

// Обработка выбора изображения
async function handleImageSelect(event) {
    const file = event.target.files[0];
    if (file) {
        await validateAndUploadImage(file);
    }
}

// Обработка drag and drop для PDF
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
        handleFileSelect({ target: { files: [files[0]] } });
    }
}

// Валидация и загрузка PDF файла
async function validateAndUploadPdf(file) {
    const uploadStatus = document.getElementById('upload-status');
    
    // Проверка формата файла
    if (!file.type || file.type !== 'application/pdf') {
        showUploadStatus('error', 'Пожалуйста, выберите PDF файл', 'upload-status');
        return;
    }
    
    // Проверка размера файла (максимум 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
        showUploadStatus('error', 'Файл слишком большой. Максимальный размер: 50MB', 'upload-status');
        return;
    }
    
    // Показываем процесс загрузки
    showUploadStatus('loading', 'Загрузка PDF файла...', 'upload-status');
    
    try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch(`${API_BASE_URL}/upload/pdf`, {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            const result = await response.json();
            showUploadStatus('success', 'PDF файл успешно загружен!', 'upload-status');
            
            // Создаем учебник с загруженным файлом
            createBookWithFile(result);
            
            // Очищаем input
            document.getElementById('file-upload').value = '';
        } else {
            throw new Error('Ошибка загрузки PDF');
        }
    } catch (error) {
        console.error('Error uploading PDF:', error);
        showUploadStatus('error', 'Ошибка загрузки PDF файла', 'upload-status');
    }
}

// Валидация и загрузка изображения
async function validateAndUploadImage(file) {
    const uploadStatus = document.getElementById('task-upload-status');
    
    // Проверка формата файла
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
        showUploadStatus('error', 'Пожалуйста, выберите изображение (JPEG, PNG, GIF)', 'task-upload-status');
        return;
    }
    
    // Проверка размера файла (максимум 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
        showUploadStatus('error', 'Файл слишком большой. Максимальный размер: 10MB', 'task-upload-status');
        return;
    }
    
    // Показываем процесс загрузки
    showUploadStatus('loading', 'Загрузка изображения...', 'task-upload-status');
    
    try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch(`${API_BASE_URL}/upload/image`, {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            const result = await response.json();
            showUploadStatus('success', 'Изображение успешно загружено!', 'task-upload-status');
            
            // Добавляем изображение к последней задаче
            addImageToLastTask(result);
            
            // Очищаем input
            document.getElementById('task-image-upload').value = '';
        } else {
            throw new Error('Ошибка загрузки изображения');
        }
    } catch (error) {
        console.error('Error uploading image:', error);
        showUploadStatus('error', 'Ошибка загрузки изображения', 'task-upload-status');
    }
}

// Создание учебника с загруженным файлом
async function createBookWithFile(uploadResult) {
    // Создаем диалог для заполнения информации о учебнике
    const bookInfo = await promptBookInfo();
    
    if (bookInfo) {
        try {
            const response = await fetch(`${API_BASE_URL}/books`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: bookInfo.title,
                    author: bookInfo.author,
                    class: parseInt(bookInfo.class),
                    subject: bookInfo.subject,
                    category: bookInfo.category,
                    description: bookInfo.description || 'Описание отсутствует'
                })
            });
            
            if (response.ok) {
                const newBook = await response.json();
                
                // Обновляем файловый путь в учебнике
                await updateBookFile(newBook.id, uploadResult.filePath, uploadResult.fileSize);
                
                // Обновляем список учебников
                loadBooksFromServer();
                
                showNotification('Учебник добавлен в библиотеку!', 'success');
            } else {
                throw new Error('Ошибка создания учебника');
            }
        } catch (error) {
            console.error('Error creating book:', error);
            showNotification('Ошибка при создании учебника', 'error');
        }
    }
}

// Обновление файлового пути учебника
async function updateBookFile(bookId, filePath, fileSize) {
    try {
        await fetch(`${API_BASE_URL}/books/${bookId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                file_path: filePath,
                file_size: fileSize
            })
        });
    } catch (error) {
        console.error('Error updating book file:', error);
    }
}

// Добавление изображения к последней задаче
async function addImageToLastTask(uploadResult) {
    if (tasks.length > 0) {
        const lastTask = tasks[tasks.length - 1];
        
        try {
            await fetch(`${API_BASE_URL}/tasks/${lastTask.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    image_path: uploadResult.imagePath
                })
            });
            
            // Обновляем список задач
            loadTasksFromServer();
            
        } catch (error) {
            console.error('Error updating task image:', error);
        }
    }
}

// Диалог для заполнения информации о учебнике
function promptBookInfo() {
    return new Promise((resolve) => {
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
                            <input type="text" id="book-title" required>
                        </div>
                        <div class="form-group">
                            <label>Автор:</label>
                            <input type="text" id="book-author" required>
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
        
        // Глобальные функции для модального окна
        window.closeBookInfoModal = function() {
            const modal = window.currentBookInfoModal;
            if (modal) {
                modal.remove();
                window.currentBookInfoModal = null;
            }
        };
        
        window.saveBookInfo = function() {
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
            resolve(bookInfo);
        };
    });
}

// Показ статуса загрузки
function showUploadStatus(type, message, statusElementId) {
    const uploadStatus = document.getElementById(statusElementId);
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

// Экспорт функций для использования в других модулях
window.loadBooksFromServer = async function() {
    try {
        const response = await fetch(`${API_BASE_URL}/books`);
        if (response.ok) {
            books = await response.json();
            renderBooks();
        }
    } catch (error) {
        console.error('Error loading books:', error);
    }
};

window.loadTasksFromServer = async function() {
    try {
        const response = await fetch(`${API_BASE_URL}/tasks`);
        if (response.ok) {
            tasks = await response.json();
            renderTasks();
        }
    } catch (error) {
        console.error('Error loading tasks:', error);
    }
};