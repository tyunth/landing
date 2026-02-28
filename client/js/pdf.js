// PDF.js интеграция для просмотра PDF файлов

// Конфигурация PDF.js
const PDFJSLib = window['pdfjs-dist/build/pdf'];
PDFJSLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js';

// Глобальные переменные для PDF
let pdfDoc = null;
let pageNum = 1;
let pageRendering = false;
let pageNumPending = null;
let scale = 1.0;
let canvas = null;
let ctx = null;

// Загрузка PDF документа
async function loadPdf(url) {
    try {
        const loadingTask = PDFJSLib.getDocument(url);
        pdfDoc = await loadingTask.promise;
        
        // Устанавливаем максимальное количество страниц
        document.getElementById('page-count').textContent = pdfDoc.numPages;
        
        // Отображаем первую страницу
        renderPage(1);
        
        return pdfDoc;
    } catch (error) {
        console.error('Error loading PDF:', error);
        showNotification('Ошибка загрузки PDF документа', 'error');
        return null;
    }
}

// Отображение страницы
function renderPage(num) {
    pageRendering = true;
    
    // Используем существующий canvas или создаем новый
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'pdf-canvas';
        const container = document.getElementById('pdf-container');
        container.innerHTML = '';
        container.appendChild(canvas);
        ctx = canvas.getContext('2d');
    }
    
    // Получаем страницу
    pdfDoc.getPage(num).then(function(page) {
        const viewport = page.getViewport({ scale: scale });
        
        // Устанавливаем размеры canvas
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        // Рендерим страницу
        const renderContext = {
            canvasContext: ctx,
            viewport: viewport
        };
        
        const renderTask = page.render(renderContext);
        
        // Ожидаем завершения рендеринга
        renderTask.promise.then(function() {
            pageRendering = false;
            
            if (pageNumPending !== null) {
                // Новая страница была запрошена во время рендеринга
                renderPage(pageNumPending);
                pageNumPending = null;
            }
        });
        
        // Обновляем информацию о странице
        document.getElementById('page-info').textContent = 'Страница ' + num + ' из ' + pdfDoc.numPages;
        document.getElementById('page-num').value = num;
    });
}

// Получение следующей страницы
function queueRenderPage(num) {
    if (pageRendering) {
        pageNumPending = num;
    } else {
        renderPage(num);
    }
}

// Следующая страница
function onNextPage() {
    if (pageNum >= pdfDoc.numPages) {
        return;
    }
    pageNum++;
    queueRenderPage(pageNum);
}

// Предыдущая страница
function onPrevPage() {
    if (pageNum <= 1) {
        return;
    }
    pageNum--;
    queueRenderPage(pageNum);
}

// Перейти к странице
function goToPage() {
    const input = document.getElementById('page-num');
    const num = parseInt(input.value, 10);
    
    if (num >= 1 && num <= pdfDoc.numPages) {
        pageNum = num;
        queueRenderPage(num);
    }
}

// Увеличение масштаба
function zoomIn() {
    if (scale < 3.0) {
        scale += 0.25;
        renderPage(pageNum);
    }
}

// Уменьшение масштаба
function zoomOut() {
    if (scale > 0.25) {
        scale -= 0.25;
        renderPage(pageNum);
    }
}

// Подогнать под контейнер
function fitToContainer() {
    if (!pdfDoc) return;
    
    pdfDoc.getPage(pageNum).then(function(page) {
        const container = document.getElementById('pdf-container');
        const containerWidth = container.clientWidth;
        const viewport = page.getViewport({ scale: 1 });
        
        // Вычисляем масштаб для подгонки под контейнер
        const scale = containerWidth / viewport.width;
        
        // Ограничиваем максимальный масштаб
        if (scale <= 3.0) {
            scale = Math.max(0.25, scale);
            renderPage(pageNum);
        }
    });
}

// Полноэкранный режим
function toggleFullscreen() {
    const modal = document.getElementById('pdf-modal');
    const viewer = document.getElementById('pdf-viewer');
    
    if (!document.fullscreenElement) {
        if (modal.requestFullscreen) {
            modal.requestFullscreen();
        } else if (modal.webkitRequestFullscreen) { /* Safari */
            modal.webkitRequestFullscreen();
        } else if (modal.msRequestFullscreen) { /* IE11 */
            modal.msRequestFullscreen();
        }
        
        viewer.classList.add('fullscreen');
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) { /* Safari */
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { /* IE11 */
            document.msExitFullscreen();
        }
        
        viewer.classList.remove('fullscreen');
    }
}

// Клавиатурные сокращения
document.addEventListener('keydown', function(e) {
    if (!pdfDoc) return;
    
    switch(e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
            e.preventDefault();
            onNextPage();
            break;
        case 'ArrowLeft':
        case 'ArrowUp':
            e.preventDefault();
            onPrevPage();
            break;
        case 'Home':
            e.preventDefault();
            pageNum = 1;
            queueRenderPage(pageNum);
            break;
        case 'End':
            e.preventDefault();
            pageNum = pdfDoc.numPages;
            queueRenderPage(pageNum);
            break;
        case '+':
        case '=':
            e.preventDefault();
            zoomIn();
            break;
        case '-':
            e.preventDefault();
            zoomOut();
            break;
        case 'Escape':
            if (document.fullscreenElement) {
                document.exitFullscreen();
            }
            break;
    }
});

// Инициализация PDF просмотра
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация элементов управления
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');
    const pageNumInput = document.getElementById('page-num');
    const pageCount = document.getElementById('page-count');
    const zoomInBtn = document.getElementById('zoom-in');
    const zoomOutBtn = document.getElementById('zoom-out');
    const fitBtn = document.getElementById('fit-to-container');
    const fullscreenBtn = document.getElementById('fullscreen');
    
    if (prevButton) prevButton.addEventListener('click', onPrevPage);
    if (nextButton) nextButton.addEventListener('click', onNextPage);
    if (pageNumInput) pageNumInput.addEventListener('change', goToPage);
    if (zoomInBtn) zoomInBtn.addEventListener('click', zoomIn);
    if (zoomOutBtn) zoomOutBtn.addEventListener('click', zoomOut);
    if (fitBtn) fitBtn.addEventListener('click', fitToContainer);
    if (fullscreenBtn) fullscreenBtn.addEventListener('click', toggleFullscreen);
    
    // Автоматическая подгонка под контейнер при изменении размера окна
    window.addEventListener('resize', function() {
        if (pdfDoc) {
            fitToContainer();
        }
    });
});

// Экспорт функций для использования в других модулях
window.loadPdf = loadPdf;
window.renderPage = renderPage;
window.onNextPage = onNextPage;
window.onPrevPage = onPrevPage;
window.zoomIn = zoomIn;
window.zoomOut = zoomOut;
window.fitToContainer = fitToContainer;
window.toggleFullscreen = toggleFullscreen;