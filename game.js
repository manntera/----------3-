const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

let playerImg = new Image();
let enemyImg = new Image();
playerImg.src = 'player.webp'; // 自機画像のパス
enemyImg.src = 'enemy.webp'; // 敵機画像のパス

let player;
let enemies;
let gameOver;
let lastTimeEnemyAdded;
const enemyInterval = 1500;
let lives;
let score;
let bulletSize;
let bulletSpeedIncrement;
let bombs;
let bombReady;

function resetGame() {
    player = {
        x: canvas.width / 2,
        y: canvas.height - 50,
        width: 50,
        height: 20,
        speed: 5,
        dx: 0,
        bullets: []
    };
    enemies = [];
    gameOver = false;
    lastTimeEnemyAdded = Date.now();
    lives = 3;
    score = 0;
    bulletSize = 6;
    bulletSpeedIncrement = 0;
    bombs = 1;
    bombReady = true;
}

resetGame();

document.addEventListener('keydown', (e) => {
    if (!gameOver) {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            player.dx = e.key === 'ArrowLeft' ? -player.speed : player.speed;
        } else if (e.key === ' ' && player.bullets.length < (3 + bulletSpeedIncrement)) {
            player.bullets.push({
                x: player.x + player.width / 2 - bulletSize / 2,
                y: player.y,
                width: bulletSize,
                height: 10,
                speed: 7
            });
        } else if (e.key === 'Enter' && bombs > 0 && bombReady) {
            enemies = []; // Destroy all visible enemies
            bombs--;
            bombReady = false; // Prevent continuous bomb use
            setTimeout(() => { bombReady = true; }, 2000); // Cooldown of 2 seconds for bomb use
        }
    } else if (gameOver && e.key === ' ') {
        resetGame();
        requestAnimationFrame(updateGame);
    }
    e.preventDefault();
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        player.dx = 0;
    }
});

function createEnemy() {
    const type = Math.random() < 0.5 ? 1 : 2;
    const enemy = {
        x: Math.random() * (canvas.width - 30),
        y: 0,
        width: 30,
        height: 30,
        speed: Math.random() * 2 + 2,
        type: type
    };
    if (type === 2) {
        enemy.dx = Math.random() < 0.5 ? 1 : -1;
    }
    return enemy;
}

function addEnemy() {
    if (Date.now() - lastTimeEnemyAdded > enemyInterval && !gameOver) {
        enemies.push(createEnemy());
        lastTimeEnemyAdded = Date.now();
    }
}

function updateEnemies() {
    enemies.forEach(enemy => {
        enemy.y += enemy.speed;
        if (enemy.type === 2) {
            enemy.x += enemy.dx;
            if (enemy.x <= 0 || enemy.x >= canvas.width - enemy.width) {
                enemy.dx *= -1;
            }
        }
    });
}

function checkCollisions() {
    player.bullets.forEach((bullet, bulletIndex) => {
        enemies.forEach((enemy, enemyIndex) => {
            if (bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y) {
                player.bullets.splice(bulletIndex, 1);
                enemies.splice(enemyIndex, 1);
                score += 10;
                bulletSize = Math.min(bulletSize + 1, 12); // Increment bullet size, cap at 12
                if (score % 100 === 0) { // Every 100 points, gain a bomb and increase bullet firing capability
                    bombs++;
                    bulletSpeedIncrement++;
                }
            }
        });
    });
}

function checkGameOver() {
    enemies.forEach(enemy => {
        if (enemy.x < player.x + player.width &&
            enemy.x + enemy.width > player.x &&
            enemy.y < player.y + player.height &&
            enemy.y + enemy.height > player.y) {
            lives--;
            enemies.splice(enemies.indexOf(enemy), 1);
            if (lives <= 0) {
                gameOver = true;
            }
        }
    });
}

function updateGame() {
    if (!gameOver) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        player.x += player.dx;
        player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
        ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);

        player.bullets.forEach((bullet, index) => {
            bullet.y -= bullet.speed;
            ctx.fillStyle = 'yellow';
            ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

            if (bullet.y < -10) {
                player.bullets.splice(index, 1);
            }
        });

        updateEnemies();

        enemies.forEach((enemy, index) => {
            ctx.drawImage(enemyImg, enemy.x, enemy.y, enemy.width, enemy.height);

            if (enemy.y > canvas.height) {
                enemies.splice(index, 1);
            }
        });

        checkCollisions();
        checkGameOver();
        addEnemy();
        requestAnimationFrame(updateGame);
    } else {
        ctx.font = '48px serif';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2);
        ctx.font = '24px serif';
        ctx.fillText('Press Space to Restart', canvas.width / 2, canvas.height / 2 + 40);
    }

    ctx.font = '18px serif';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'left';
    ctx.fillText(`Lives: ${lives}`, 10, 20);
    ctx.fillText(`Score: ${score}`, 10, 40); // Display the score
    ctx.fillText(`Bombs: ${bombs}`, 10, 60); // Display the number of bombs
}

requestAnimationFrame(updateGame);
