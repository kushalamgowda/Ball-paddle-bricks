const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const restartButton = document.getElementById('restartButton');

// Game variables
let ball = { x: 400, y: 500, dx: 4, dy: -4, radius: 10 };
let paddle = { x: 350, y: 550, width: 100, height: 10 };
let bricks = [];
const brickRowCount = 5;
const brickColumnCount = 10;
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;

// Power-ups
let powerUps = [];

// Level and score
let currentLevel = 1;
let score = 0;

// Initialize bricks
function initializeBricks() {
    bricks = [];
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1 };
        }
    }
}

initializeBricks();

// Draw ball
function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#f00';
    ctx.fill();
    ctx.closePath();
}

// Draw paddle
function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.fillStyle = '#0f0';
    ctx.fill();
    ctx.closePath();
}

// Draw bricks
function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) {
                const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = '#00f';
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

// Draw power-ups
function drawPowerUps() {
    powerUps.forEach(powerUp => {
        ctx.beginPath();
        ctx.rect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
        ctx.fillStyle = '#ff0';
        ctx.fill();
        ctx.closePath();
    });
}

// Collision detection
function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if (b.status === 1) {
                if (ball.x > b.x && ball.x < b.x + brickWidth &&
                    ball.y > b.y && ball.y < b.y + brickHeight) {
                    ball.dy = -ball.dy;
                    b.status = 0;
                    score += 10; // Increase score
                    scoreDisplay.textContent = score;

                    // Spawn power-up when a brick is destroyed
                    if (Math.random() < 0.2) { // 20% chance to spawn a power-up
                        spawnPowerUp(b.x + brickWidth / 2, b.y + brickHeight / 2);
                    }
                }
            }
        }
    }
}

// Update ball position
function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Wall collision
    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
        ball.dx = -ball.dx;
    }
    if (ball.y - ball.radius < 0) {
        ball.dy = -ball.dy;
    }

    // Paddle collision
    if (ball.y + ball.radius > paddle.y &&
        ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
        ball.dy = -ball.dy;
    }

    // Game over
    if (ball.y + ball.radius > canvas.height) {
        alert(`Game Over! Your score: ${score}`);
        resetGame();
    }
}

// Spawn power-up
function spawnPowerUp(x, y) {
    powerUps.push({ x, y, width: 20, height: 20, type: 'bigPaddle' });
}

// Check power-up collision
function checkPowerUpCollision() {
    powerUps.forEach((powerUp, index) => {
        if (ball.x > powerUp.x && ball.x < powerUp.x + powerUp.width &&
            ball.y > powerUp.y && ball.y < powerUp.y + powerUp.height) {
            applyPowerUp(powerUp.type);
            powerUps.splice(index, 1);
        }
    });
}

// Apply power-up
function applyPowerUp(type) {
    if (type === 'bigPaddle') {
        paddle.width *= 1.5;
        setTimeout(() => { paddle.width /= 1.5; }, 5000);
    }
}

// Check level completion
function checkLevelCompletion() {
    const remainingBricks = bricks.flat().filter(brick => brick.status === 1).length;
    if (remainingBricks === 0) {
        currentLevel++;
        initializeBricks();
        resetBallAndPaddle();
    }
}

// Reset ball and paddle
function resetBallAndPaddle() {
    ball.x = 400;
    ball.y = 500;
    ball.dx = 4;
    ball.dy = -4;
    paddle.x = 350;
    paddle.y = 550;
}

// Reset game
function resetGame() {
    score = 0;
    scoreDisplay.textContent = score;
    currentLevel = 1;
    initializeBricks();
    resetBallAndPaddle();
}

// Paddle movement
document.addEventListener('mousemove', (e) => {
    const relativeX = e.clientX - canvas.offsetLeft;
    if (relativeX > 0 && relativeX < canvas.width) {
        paddle.x = relativeX - paddle.width / 2;
    }
});

// Restart button
restartButton.addEventListener('click', resetGame);

// Game loop
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBall();
    drawPaddle();
    drawBricks();
    drawPowerUps();
    collisionDetection();
    checkPowerUpCollision();
    checkLevelCompletion();
    updateBall();
    requestAnimationFrame(draw);
}

draw();