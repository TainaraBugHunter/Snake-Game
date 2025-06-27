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
    const restartButton = document.getElementById('restart-button');

    // Sons
    const music = new Audio('musica.mp3');
    music.loop = true;
    music.volume = 0.5;

    const eatSound = new Audio('eat.mp3');
    const loseSound = new Audio('lose.mp3');
    const gameOverSound = new Audio('gameover.mp3');

    let isMuted = false;

    function updateSoundIndicator() {
        soundIndicator.textContent = isMuted ? '🔇' : '🔊';
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

    const boardSize = 400;
    const squareSize = 20;

    let snake = [{ x: 200, y: 200 }];
    let direction = { x: 0, y: 0 };
    let food = { x: 0, y: 0 };
    let gameInterval = null;
    let score = 0;
    let highScore = localStorage.getItem('highScore') || 0;
    let speed = 250;
    let level = 1;
    let isPaused = false;

    highScoreElement.textContent = highScore;

    function createBoard() {
        board.innerHTML = '';
        snake.forEach((segment, index) => {
            const snakeElement = document.createElement('div');
            snakeElement.style.left = `${segment.x}px`;
            snakeElement.style.top = `${segment.y}px`;
            snakeElement.classList.add('snake');
            if (index === 0) snakeElement.classList.add('snake-head');
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
        if (score > 0 && score % 20 === 0) { // Agora sobe de nível a cada 20 pontos
            level++;
            levelElement.textContent = level;
            speed = Math.max(60, speed - 10); // Diminui menos a velocidade a cada fase
            clearInterval(gameInterval);
            gameInterval = setInterval(gameLoop, speed);
        }
    }

    function resetGame() {
        clearInterval(gameInterval);
        gameInterval = null;
        isPaused = false;
        pauseButton.textContent = 'Pausar';

        snake = [{ x: 200, y: 200 }];
        direction = { x: 0, y: 0 };
        score = 0;
        level = 1;
        speed = 200;

        scoreElement.textContent = score;
        levelElement.textContent = level;
        gameOverScreen.style.display = 'none';

        placeFood();
        createBoard();
    }

    function startGame() {
        if (!direction.x && !direction.y) {
            direction = { x: squareSize, y: 0 }; // começa para a direita
        }

        if (!gameInterval) {
            gameInterval = setInterval(gameLoop, speed);
            music.play(); // Inicia a música só quando o jogo começa
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

    restartButton.addEventListener('click', () => {
        gameOverScreen.style.display = 'none';
        resetGame();
    });

    startButton.addEventListener('click', startGame);
    pauseButton.addEventListener('click', pauseGame);
    resetButton.addEventListener('click', resetGame);
    deleteHighScoreButton.addEventListener('click', deleteHighScore);

    document.addEventListener('keydown', (event) => {
        changeDirection(event); // <-- Adicione esta linha!

        if (event.key === ' ' || event.key === 'Spacebar') { // Espaço: Pausar/Continuar
            pauseButton.click();
        }
        if (event.key === 'c' || event.key === 'C') { // C: Começar
            startButton.click();
        }
        if (event.key === 'r' || event.key === 'R') { // R: Reiniciar
            resetButton.click();
        }
        if (event.key === 'd' || event.key === 'D') { // D: Deletar Recorde
            deleteHighScoreButton.click();
        }
        if (event.key === 'm' || event.key === 'M') { // M: Mutar som
            soundIndicator.click();
        }
    });

    placeFood();
    createBoard();
});
