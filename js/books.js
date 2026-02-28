// JavaScript для работы с учебниками и PDF-просмотрщиком

// Глобальные переменные для PDF
let pdfDoc = null;
let pageNum = 1;
let pageRendering = false;
let pageNumPending = null;
let scale = 1.5;
let canvas = null;
let ctx = null;

// Инициализация PDF-просмотрщика
function initPdfViewer() {
    // Создаем canvas для рендеринга PDF
    const container = document.getElementById('pdf-container');
    container.innerHTML = '<canvas id="pdf-canvas"></canvas>';
    
    canvas = document.getElementById('pdf-canvas');
    ctx = canvas.getContext('2d');
}

// Загрузка PDF документа
function loadPdf(url) {
    showNotification('Загрузка PDF...', 'success');
    
    return pdfjsLib.getDocument(url).promise.then(function(pdfDoc_) {
        pdfDoc = pdfDoc_;
        document.getElementById('page-info').textContent = 'Страница 1 из ' + pdfDoc.numPages;
        
        // Показываем первую страницу
        renderPage(1);
    }).catch(function(error) {
        console.error('Ошибка загрузки PDF:', error);
        showNotification('Ошибка загрузки PDF', 'error');
        
        // Показываем сообщение об ошибке
        const container = document.getElementById('pdf-container');
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #ef4444;">
                <div style="font-size: 4rem; margin-bottom: 20px;">❌</div>
                <h3>Ошибка загрузки PDF</h3>
                <p>Не удалось загрузить файл. Проверьте доступность файла.</p>
                <button class="btn btn-primary" onclick="closePdfViewer()" style="margin-top: 20px;">
                    <i class="fas fa-times"></i> Закрыть
                </button>
            </div>
        `;
    });
}

// Рендеринг страницы PDF
function renderPage(num) {
    pageRendering = true;
    
    // Используем Promise для отслеживания завершения рендеринга
    pdfDoc.getPage(num).then(function(page) {
        const viewport = page.getViewport({ scale: scale });
        
        // Устанавливаем размеры canvas
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        // Рендерим страницу в canvas
        const renderContext = {
            canvasContext: ctx,
            viewport: viewport
        };
        
        const renderTask = page.render(renderContext);
        
        // Дожидаемся завершения рендеринга
        renderTask.promise.then(function() {
            pageRendering = false;
            
            if (pageNumPending !== null) {
                // Новая страница была запрошена
                renderPage(pageNumPending);
                pageNumPending = null;
            }
        });
    });
    
    document.getElementById('page-info').textContent = 'Страница ' + num + ' из ' + pdfDoc.numPages;
    pageNum = num;
    
    // Обновляем состояние кнопок
    updatePageButtons();
}

// Обновление состояния кнопок навигации
function updatePageButtons() {
    document.getElementById('prev-page').disabled = (pageNum <= 1);
    document.getElementById('next-page').disabled = (pageNum >= pdfDoc.numPages);
}

// Обработчики кнопок навигации
function onPrevPage() {
    if (pageNum <= 1) {
        return;
    }
    pageNum--;
    queueRenderPage(pageNum);
}

function onNextPage() {
    if (pageNum >= pdfDoc.numPages) {
        return;
    }
    pageNum++;
    queueRenderPage(pageNum);
}

// Очередь рендеринга страницы
function queueRenderPage(num) {
    if (pageRendering) {
        pageNumPending = num;
    } else {
        renderPage(num);
    }
}

// Умное масштабирование PDF под размер контейнера
function fitToContainer() {
    if (!pdfDoc || !canvas) return;
    
    const container = document.getElementById('pdf-container');
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    pdfDoc.getPage(pageNum).then(function(page) {
        const viewport = page.getViewport({ scale: 1 });
        const pageWidth = viewport.width;
        const pageHeight = viewport.height;
        
        // Вычисляем оптимальный масштаб
        const scaleX = containerWidth / pageWidth;
        const scaleY = containerHeight / pageHeight;
        const newScale = Math.min(scaleX, scaleY) * 0.95; // 95% для отступов
        
        scale = newScale;
        renderPage(pageNum);
    });
}

// Поиск по PDF (если поддерживается)
async function searchInPdf(query) {
    if (!pdfDoc) return;
    
    showNotification('Поиск в PDF...', 'success');
    
    try {
        // Создаем текстовый слой для поиска
        const page = await pdfDoc.getPage(1);
        const textContent = await page.getTextContent();
        const textItems = textContent.items;
        const fullText = textItems.map(item => item.str).join(' ');
        
        const searchResults = [];
        const lowerQuery = query.toLowerCase();
        const lowerText = fullText.toLowerCase();
        
        let index = 0;
        while ((index = lowerText.indexOf(lowerQuery, index)) !== -1) {
            searchResults.push(index);
            index += lowerQuery.length;
        }
        
        if (searchResults.length > 0) {
            showNotification(`Найдено ${searchResults.length} совпадений`, 'success');
            highlightSearchResults(searchResults, query);
        } else {
            showNotification('Совпадений не найдено', 'error');
        }
        
    } catch (error) {
        console.error('Ошибка поиска:', error);
        showNotification('Поиск не поддерживается', 'error');
    }
}

// Подсветка результатов поиска (упрощенная реализация)
function highlightSearchResults(results, query) {
    // В реальной реализации нужно будет работать с DOM-структурой PDF
    // Пока просто показываем уведомление
    console.log('Результаты поиска:', results);
}

// Экспорт функций для использования в main.js
window.openPdfViewer = function(fileUrl, title) {
    document.getElementById('pdf-modal').classList.add('active');
    document.getElementById('pdf-title').textContent = title;
    
    initPdfViewer();
    
    // Загружаем PDF
    loadPdf(fileUrl).then(function() {
        // PDF успешно загружен
        fitToContainer();
    });
    
    // Сбрасываем номер страницы
    pageNum = 1;
    document.getElementById('page-info').textContent = 'Страница 1 из 1';
};

window.closePdfViewer = function() {
    document.getElementById('pdf-modal').classList.remove('active');
    document.getElementById('pdf-container').innerHTML = '';
    pdfDoc = null;
    pageNum = 1;
    canvas = null;
    ctx = null;
};

window.nextPage = function() {
    if (pdfDoc) {
        onNextPage();
    } else {
        showNotification('Сначала загрузите PDF', 'error');
    }
};

window.prevPage = function() {
    if (pdfDoc) {
        onPrevPage();
    } else {
        showNotification('Сначала загрузите PDF', 'error');
    }
};

// Обработка изменения размера окна
window.addEventListener('resize', function() {
    if (pdfDoc && canvas) {
        fitToContainer();
    }
});

// Добавление учебника
function addBook(title, author, classNum, subject, category, fileUrl, description) {
    const newBook = {
        id: Date.now(),
        title: title,
        author: author,
        class: parseInt(classNum),
        subject: subject,
        category: category,
        file: fileUrl,
        description: description || 'Описание отсутствует'
    };
    
    books.push(newBook);
    saveBooks();
    renderBooks();
    showNotification('Учебник добавлен!', 'success');
}

// Удаление учебника
function deleteBook(bookId) {
    if (confirm('Вы уверены, что хотите удалить этот учебник?')) {
        books = books.filter(book => book.id !== bookId);
        saveBooks();
        renderBooks();
        showNotification('Учебник удален', 'success');
    }
}

// Редактирование учебника
function editBook(bookId, updates) {
    const bookIndex = books.findIndex(book => book.id === bookId);
    if (bookIndex !== -1) {
        books[bookIndex] = { ...books[bookIndex], ...updates };
        saveBooks();
        renderBooks();
        showNotification('Учебник обновлен', 'success');
    }
}

// Экспорт функций для использования в других модулях
window.addBook = addBook;
window.deleteBook = deleteBook;
window.editBook = editBook;

// Дополнительные функции для учебников
function getBooksByClass(classNum) {
    return books.filter(book => book.class === parseInt(classNum));
}

function getBooksBySubject(subject) {
    return books.filter(book => book.subject === subject);
}

function getBooksByCategory(category) {
    return books.filter(book => book.category === category);
}

function searchBooks(query) {
    const lowerQuery = query.toLowerCase();
    return books.filter(book => 
        book.title.toLowerCase().includes(lowerQuery) ||
        book.author.toLowerCase().includes(lowerQuery) ||
        book.description.toLowerCase().includes(lowerQuery)
    );
}

// Статистика по учебникам
function getBooksStats() {
    const stats = {
        total: books.length,
        byClass: {},
        bySubject: {},
        byCategory: {}
    };
    
    books.forEach(book => {
        // По классам
        stats.byClass[book.class] = (stats.byClass[book.class] || 0) + 1;
        
        // По предметам
        stats.bySubject[book.subject] = (stats.bySubject[book.subject] || 0) + 1;
        
        // По категориям
        stats.byCategory[book.category] = (stats.byCategory[book.category] || 0) + 1;
    });
    
    return stats;
}

// Экспорт статистики
window.getBooksStats = getBooksStats;
window.getBooksByClass = getBooksByClass;
window.getBooksBySubject = getBooksBySubject;
window.getBooksByCategory = getBooksByCategory;
window.searchBooks = searchBooks;