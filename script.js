document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('game-board');
    const scoreElement = document.getElementById('score');
    const highScoreElement = document.getElementById('high-score');
    const levelElement = document.getElementById('level');
    const startButton = document.getElementById('start-button');
    const pauseButton = document.getElementById('pause-button');
    const resetButton = document.getElementById('reset-button');
    const deleteHighScoreButton = document.getElementById('delete-high-score-button');
    const soundIndicator = document.getElementById('sound-indicator');
    const gameOverScreen = document.getElementById('game-over-screen');
    const restartButtonControls = document.getElementById('restart-button-controls');
    const restartButtonGameOver = document.getElementById('restart-button-gameover');

    // Sons
    const music = new Audio('musica.mp3');
    music.loop = true;
    music.volume = 0.8;

    const eatSound = new Audio('eat.mp3');
    const loseSound = new Audio('lose.mp3');
    const gameOverSound = new Audio('lose.mp3');

    let isMuted = false;

    function updateSoundIndicator() {
        soundIndicator.textContent = isMuted ? 'Mutado' : '🔊';
        soundIndicator.title = isMuted ? 'Som Mutado' : 'Som Ativo';
    }

    soundIndicator.addEventListener('click', () => {
        isMuted = !isMuted;
        music.muted = isMuted;
        eatSound.muted = isMuted;
        loseSound.muted = isMuted;
        gameOverSound.muted = isMuted;
        updateSoundIndicator();
    });

    updateSoundIndicator();
    music.play();

    const boardSize = 400; // Tamanho do tabuleiro restaurado para 400x400
    const squareSize = 20;

    let snake = [{ x: 200, y: 200 }]; // Centralizado para 400x400
    let direction = { x: 0, y: 0 };
    let food = { x: 0, y: 0 };
    let gameInterval = null;
    let score = 0;
    let highScore = localStorage.getItem('highScore') || 0;
    let speed = 250;
    let level = 1;
    let isPaused = false;

    highScoreElement.textContent = highScore;

    const snakeColors = [
        "#36da19", "#1e90ff", "#ff9800", "#e91e63", "#9c27b0",
        "#ffd600", "#00bcd4", "#ff5722", "#4caf50", "#f44336"
    ];

    function getSnakeColor() {
        return snakeColors[(level - 1) % snakeColors.length];
    }

    function darkenColor(hex, factor = 0.6) {
        let r = parseInt(hex.substr(1, 2), 16);
        let g = parseInt(hex.substr(3, 2), 16);
        let b = parseInt(hex.substr(5, 2), 16);

        r = Math.floor(r * factor);
        g = Math.floor(g * factor);
        b = Math.floor(b * factor);

        return `rgb(${r}, ${g}, ${b})`;
    }

    function createBoard() {
        board.innerHTML = '';
        snake.forEach((segment, index) => {
            const snakeElement = document.createElement('div');
            snakeElement.style.left = `${segment.x}px`;
            snakeElement.style.top = `${segment.y}px`;
            snakeElement.classList.add('snake');
            const bodyColor = getSnakeColor();
            if (index === 0) {
                snakeElement.classList.add('snake-head');
                snakeElement.style.background = darkenColor(bodyColor, 0.6);
            } else {
                snakeElement.style.background = bodyColor;
            }
            board.appendChild(snakeElement);
        });

        const foodElement = document.createElement('div');
        foodElement.style.left = `${food.x}px`;
        foodElement.style.top = `${food.y}px`;
        foodElement.classList.add('food');
        board.appendChild(foodElement);
    }

    function moveSnake() {
        const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
        snake.unshift(head);

        if (head.x === food.x && head.y === food.y) {
            score++;
            scoreElement.textContent = score;
            eatSound.currentTime = 0;
            eatSound.play();
            placeFood();
            updateLevel();
        } else {
            snake.pop();
        }

        if (isGameOver(head)) {
            endGame();
        }
    }

    function isGameOver(head) {
        const outOfBounds = head.x < 0 || head.x >= boardSize || head.y < 0 || head.y >= boardSize;
        const collided = snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y);
        return outOfBounds || collided;
    }

    function endGame() {
        clearInterval(gameInterval);
        gameInterval = null;

        if (score > highScore) {
            highScore = score;
            localStorage.setItem('highScore', highScore);
            highScoreElement.textContent = highScore;
        }

        loseSound.currentTime = 0;
        loseSound.play();
        setTimeout(() => {
            gameOverSound.currentTime = 0;
            gameOverSound.play();
        }, 400);

        gameOverScreen.style.display = 'flex';
        document.getElementById('controls').classList.add('hidden'); // Esconder controles ao terminar o jogo
    }

    function placeFood() {
        do {
            food.x = Math.floor(Math.random() * (boardSize / squareSize)) * squareSize;
            food.y = Math.floor(Math.random() * (boardSize / squareSize)) * squareSize;
        } while (snake.some(segment => segment.x === food.x && segment.y === food.y));
    }

    function changeDirection(event) {
        switch (event.key) {
            case 'ArrowUp':
                if (direction.y === 0) direction = { x: 0, y: -squareSize };
                break;
            case 'ArrowDown':
                if (direction.y === 0) direction = { x: 0, y: squareSize };
                break;
            case 'ArrowLeft':
                if (direction.x === 0) direction = { x: -squareSize, y: 0 };
                break;
            case 'ArrowRight':
                if (direction.x === 0) direction = { x: squareSize, y: 0 };
                break;
        }
    }

    function updateLevel() {
        if (score > 0 && score % 20 === 0) {
            level++;
            levelElement.textContent = level;
            speed = Math.max(60, speed - 10);
            clearInterval(gameInterval);
            gameInterval = setInterval(gameLoop, speed);
        }
    }

    function resetGame() {
        clearInterval(gameInterval);
        gameInterval = null;
        isPaused = false;
        pauseButton.textContent = 'Pausar';

        snake = [{ x: 200, y: 200 }]; // Centralizado para 400x400
        direction = { x: 0, y: 0 };
        score = 0;
        level = 1;
        speed = 250; // Valor inicial igual ao do início

        scoreElement.textContent = score;
        levelElement.textContent = level;
        gameOverScreen.style.display = 'none';

        placeFood();
        createBoard();
     }

    function startGame() {
        if (!direction.x && !direction.y) {
            direction = { x: squareSize, y: 0 };
        }

        if (!gameInterval) {
            gameInterval = setInterval(gameLoop, speed);
            music.play();
        }
    }

    function pauseGame() {
        if (isPaused) {
            gameInterval = setInterval(gameLoop, speed);
            pauseButton.textContent = 'Pausar';
        } else {
            clearInterval(gameInterval);
            pauseButton.textContent = 'Voltar';
        }
        isPaused = !isPaused;
        document.getElementById('controls').classList.toggle('hidden'); // Alternar visibilidade dos controles ao pausar o jogo
    }

    function deleteHighScore() {
        localStorage.removeItem('highScore');
        highScore = 0;
        highScoreElement.textContent = highScore;
    }

    function gameLoop() {
        moveSnake();
        createBoard();
    }

    restartButtonControls.addEventListener('click', resetGame);
    restartButtonGameOver.addEventListener('click', () => {
        gameOverScreen.style.display = 'none';
        resetGame();
    });

    startButton.addEventListener('click', startGame);
    pauseButton.addEventListener('click', pauseGame);
    resetButton.addEventListener('click', resetGame);
    deleteHighScoreButton.addEventListener('click', deleteHighScore);

    document.addEventListener('keydown', (event) => {
        changeDirection(event);
        if (event.key === ' ' || event.key === 'Spacebar') pauseButton.click();
        if (event.key === 'c' || event.key === 'C') startButton.click();
        if (event.key === 'r' || event.key === 'R') resetButton.click();
        if (event.key === 'd' || event.key === 'D') deleteHighScoreButton.click();
        if (event.key === 'm' || event.key === 'M') soundIndicator.click();
    });

    document.addEventListener('keydown', function(event) {
        // Impede o scroll da página com as setas e barra de espaço
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(event.key)) {
            event.preventDefault();
        }
    });

    placeFood();
    createBoard();
});
