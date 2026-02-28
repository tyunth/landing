// Мини-игры для Math Landing

// Глобальные переменные для игр
let currentGame = null;
let gameTimer = null;
let gameTime = 60;
let score = 0;
let gameActive = false;

// Инициализация игр
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация элементов управления игрой
    const gameArea = document.getElementById('game-area');
    if (gameArea) {
        gameArea.addEventListener('keydown', handleGameKeydown);
    }
});

// Математический тренажер
function startMathGame() {
    currentGame = 'math';
    score = 0;
    gameTime = 60;
    gameActive = true;
    
    showGameArea('Математический тренажер', 'Решайте примеры на время');
    startTimer();
    generateMathProblem();
}

// Геометрические головоломки
function startGeometryGame() {
    currentGame = 'geometry';
    score = 0;
    gameTime = 60;
    gameActive = true;
    
    showGameArea('Геометрические головоломки', 'Определите фигуру по описанию');
    startTimer();
    generateGeometryProblem();
}

// Счет на скорость
function startSpeedGame() {
    currentGame = 'speed';
    score = 0;
    gameTime = 30;
    gameActive = true;
    
    showGameArea('Счет на скорость', 'Считайте в уме как можно быстрее');
    startTimer();
    generateSpeedProblem();
}

// Показ игровой зоны
function showGameArea(title, description) {
    const gameArea = document.getElementById('game-area');
    const gameTitle = document.getElementById('game-title');
    const gameContent = document.getElementById('game-content');
    
    gameArea.style.display = 'block';
    gameTitle.textContent = title;
    
    gameContent.innerHTML = `
        <div class="game-description">
            <p>${description}</p>
            <p class="game-instruction">Начните играть!</p>
        </div>
        <div id="game-problem" class="game-problem"></div>
        <div class="game-input">
            <input type="text" id="game-answer" placeholder="Введите ответ" autofocus>
            <button class="btn btn-primary" onclick="checkAnswer()">Проверить</button>
        </div>
        <div id="game-feedback" class="game-feedback"></div>
    `;
    
    // Фокус на поле ввода
    setTimeout(() => {
        const input = document.getElementById('game-answer');
        if (input) input.focus();
    }, 100);
}

// Скрытие игровой зоны
function hideGameArea() {
    const gameArea = document.getElementById('game-area');
    gameArea.style.display = 'none';
    endTimer();
}

// Завершение игры
function endGame() {
    gameActive = false;
    endTimer();
    
    const gameContent = document.getElementById('game-content');
    gameContent.innerHTML = `
        <div class="game-result">
            <h3>Игра окончена!</h3>
            <p>Ваш счет: <strong>${score}</strong></p>
            <p>Время: <strong>${gameTime}</strong> секунд</p>
            <div class="game-actions">
                <button class="btn btn-primary" onclick="restartGame()">Играть снова</button>
                <button class="btn btn-secondary" onclick="hideGameArea()">Выйти</button>
            </div>
        </div>
    `;
}

// Перезапуск игры
function restartGame() {
    switch(currentGame) {
        case 'math':
            startMathGame();
            break;
        case 'geometry':
            startGeometryGame();
            break;
        case 'speed':
            startSpeedGame();
            break;
    }
}

// Таймер
function startTimer() {
    endTimer(); // Останавливаем предыдущий таймер
    
    gameTimer = setInterval(function() {
        gameTime--;
        updateGameStats();
        
        if (gameTime <= 0) {
            endGame();
        }
    }, 1000);
}

function endTimer() {
    if (gameTimer) {
        clearInterval(gameTimer);
        gameTimer = null;
    }
}

function updateGameStats() {
    const scoreElement = document.getElementById('score');
    const timeElement = document.getElementById('time');
    
    if (scoreElement) scoreElement.textContent = `Счет: ${score}`;
    if (timeElement) timeElement.textContent = `Время: ${gameTime}`;
}

// Проверка ответа
function checkAnswer() {
    if (!gameActive) return;
    
    const input = document.getElementById('game-answer');
    const answer = input.value.trim();
    const feedback = document.getElementById('game-feedback');
    
    if (!answer) {
        showFeedback('Введите ответ', 'error');
        return;
    }
    
    let isCorrect = false;
    
    switch(currentGame) {
        case 'math':
            isCorrect = checkMathAnswer(answer);
            break;
        case 'geometry':
            isCorrect = checkGeometryAnswer(answer);
            break;
        case 'speed':
            isCorrect = checkSpeedAnswer(answer);
            break;
    }
    
    if (isCorrect) {
        score += 10;
        updateGameStats();
        showFeedback('Правильно! +10 очков', 'success');
        
        // Генерируем новую задачу
        setTimeout(() => {
            switch(currentGame) {
                case 'math':
                    generateMathProblem();
                    break;
                case 'geometry':
                    generateGeometryProblem();
                    break;
                case 'speed':
                    generateSpeedProblem();
                    break;
            }
            input.value = '';
            input.focus();
        }, 1000);
    } else {
        showFeedback('Неправильно! Попробуйте еще раз', 'error');
    }
}

// Обработка клавиш в игре
function handleGameKeydown(e) {
    if (!gameActive) return;
    
    if (e.key === 'Enter') {
        checkAnswer();
    }
}

// Отображение обратной связи
function showFeedback(message, type) {
    const feedback = document.getElementById('game-feedback');
    if (!feedback) return;
    
    feedback.innerHTML = `<div class="feedback-${type}">${message}</div>`;
    
    setTimeout(() => {
        feedback.innerHTML = '';
    }, 2000);
}

// Математические задачи
function generateMathProblem() {
    const operations = ['+', '-', '*', '/'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let num1, num2, problem, correctAnswer;
    
    switch(operation) {
        case '+':
            num1 = Math.floor(Math.random() * 100) + 1;
            num2 = Math.floor(Math.random() * 100) + 1;
            problem = `${num1} + ${num2} = ?`;
            correctAnswer = num1 + num2;
            break;
            
        case '-':
            num1 = Math.floor(Math.random() * 100) + 1;
            num2 = Math.floor(Math.random() * num1) + 1;
            problem = `${num1} - ${num2} = ?`;
            correctAnswer = num1 - num2;
            break;
            
        case '*':
            num1 = Math.floor(Math.random() * 12) + 1;
            num2 = Math.floor(Math.random() * 12) + 1;
            problem = `${num1} × ${num2} = ?`;
            correctAnswer = num1 * num2;
            break;
            
        case '/':
            num2 = Math.floor(Math.random() * 12) + 1;
            correctAnswer = Math.floor(Math.random() * 12) + 1;
            num1 = num2 * correctAnswer;
            problem = `${num1} ÷ ${num2} = ?`;
            break;
    }
    
    currentProblem = {
        problem: problem,
        answer: correctAnswer.toString()
    };
    
    const gameProblem = document.getElementById('game-problem');
    gameProblem.innerHTML = `<h4>${problem}</h4>`;
}

function checkMathAnswer(userAnswer) {
    return parseInt(userAnswer) === parseInt(currentProblem.answer);
}

// Геометрические задачи
function generateGeometryProblem() {
    const shapes = [
        {
            name: 'квадрат',
            description: 'Четырехугольник с равными сторонами и прямыми углами',
            clues: ['4 стороны', 'все стороны равны', '4 прямых угла']
        },
        {
            name: 'прямоугольник',
            description: 'Четырехугольник с прямыми углами и попарно равными сторонами',
            clues: ['4 стороны', 'противоположные стороны равны', '4 прямых угла']
        },
        {
            name: 'треугольник',
            description: 'Фигура с тремя сторонами и тремя углами',
            clues: ['3 стороны', '3 угла', 'может быть разного вида']
        },
        {
            name: 'круг',
            description: 'Фигура, все точки которой находятся на одинаковом расстоянии от центра',
            clues: ['нет углов', 'гладкая линия', 'центральная симметрия']
        },
        {
            name: 'ромб',
            description: 'Четырехугольник с равными сторонами, но не обязательно с прямыми углами',
            clues: ['4 стороны', 'все стороны равны', 'противоположные углы равны']
        }
    ];
    
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    
    currentProblem = {
        problem: shape.description,
        answer: shape.name.toLowerCase()
    };
    
    const gameProblem = document.getElementById('game-problem');
    gameProblem.innerHTML = `
        <h4>Описание фигуры:</h4>
        <p>${shape.description}</p>
        <div class="shape-clues">
            <h5>Подсказки:</h5>
            <ul>
                ${shape.clues.map(clue => `<li>${clue}</li>`).join('')}
            </ul>
        </div>
    `;
}

function checkGeometryAnswer(userAnswer) {
    return userAnswer.toLowerCase() === currentProblem.answer;
}

// Задачи на скорость счета
function generateSpeedProblem() {
    const operations = ['+', '-'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let num1, num2, problem, correctAnswer;
    
    if (operation === '+') {
        num1 = Math.floor(Math.random() * 50) + 1;
        num2 = Math.floor(Math.random() * 50) + 1;
        problem = `${num1} + ${num2}`;
        correctAnswer = num1 + num2;
    } else {
        num1 = Math.floor(Math.random() * 100) + 1;
        num2 = Math.floor(Math.random() * 50) + 1;
        problem = `${num1} - ${num2}`;
        correctAnswer = num1 - num2;
    }
    
    currentProblem = {
        problem: problem,
        answer: correctAnswer.toString()
    };
    
    const gameProblem = document.getElementById('game-problem');
    gameProblem.innerHTML = `
        <h4>Сосчитайте быстро:</h4>
        <div class="speed-problem">${problem}</div>
        <div class="speed-hint">Введите ответ как можно быстрее!</div>
    `;
}

function checkSpeedAnswer(userAnswer) {
    return parseInt(userAnswer) === parseInt(currentProblem.answer);
}

// Экспорт функций для использования в других модулях
window.startMathGame = startMathGame;
window.startGeometryGame = startGeometryGame;
window.startSpeedGame = startSpeedGame;
window.endGame = endGame;
window.checkAnswer = checkAnswer;