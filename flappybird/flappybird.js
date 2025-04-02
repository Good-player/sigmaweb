const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const rankingList = document.getElementById('rankingList');
const detailsModal = document.getElementById('detailsModal');
const modalBody = document.getElementById('modalBody');
const replayModal = document.getElementById('replayModal');
const replayCanvas = document.getElementById('replayCanvas');
const replayCtx = replayCanvas.getContext('2d');
const gameOverDisplay = document.getElementById('gameOver');
const victoryMessage = document.getElementById('victoryMessage');
const popOutModal = document.getElementById('popOutModal');
const popOutMessage = document.getElementById('popOutMessage');

let block = {
    x: 50,
    y: 150,
    width: 20,
    height: 20,
    gravity: 0.5,
    lift: -8,
    velocity: 0
};

let pipes = [];
let frame = 0;
let score = 0;
let gameOver = false;
let gameHistory = [];
let additionalObstacles = [];
let coins = [];
let gameSpeed = 1;

function saveState() {
    gameHistory.push({
        blockY: block.y,
        pipes: JSON.parse(JSON.stringify(pipes)),
        obstacles: JSON.parse(JSON.stringify(additionalObstacles)),
        coins: JSON.parse(JSON.stringify(coins)),
        score: score,
        popOutModalVisible: popOutModal.style.display === 'block'
    });
}

function drawBlock(ctx, block) {
    ctx.fillStyle = '#000';
    ctx.fillRect(block.x, block.y, block.width, block.height);
}

function drawPipes(ctx, pipes) {
    ctx.fillStyle = '#000';
    pipes.forEach(pipe => {
        ctx.fillRect(pipe.x, 0, pipe.width, pipe.top);
        ctx.fillRect(pipe.x, ctx.canvas.height - pipe.bottom, pipe.width, pipe.bottom);
    });
}

function drawObstacles(ctx, obstacles) {
    ctx.fillStyle = '#f00';
    obstacles.forEach(obstacle => {
        ctx.beginPath();
        ctx.arc(obstacle.x, obstacle.y, obstacle.radius, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawCoins(ctx, coins) {
    ctx.fillStyle = '#ff0';
    coins.forEach(coin => {
        ctx.beginPath();
        ctx.arc(coin.x, coin.y, coin.radius, 0, Math.PI * 2);
        ctx.fill();
    });
}

function updateBlock() {
    block.velocity += block.gravity;
    block.y += block.velocity;

    if (block.y + block.height > canvas.height) {
        block.y = canvas.height - block.height;
        block.velocity = 0;
        if (score > 0) {
            saveScore();
        }
        gameOver = true;
        resetGame();
    }

    if (block.y < 0) {
        block.y = 0;
        block.velocity = 0;
    }
}

function resetGame() {
    block.y = 150;
    block.velocity = 0;
    pipes = [];
    frame = 0;
    gameOver = false;
    score = 0;
    gameHistory = [];
    additionalObstacles = [];
    coins = [];
    gameSpeed = 1;
    scoreDisplay.innerText = 'Score: ' + score;
    victoryMessage.style.display = "none";
    popOutModal.style.display = "none";
}

function detectCollision() {
    pipes.forEach(pipe => {
        if (block.x < pipe.x + pipe.width &&
            block.x + block.width > pipe.x &&
            (block.y < pipe.top || block.y + block.height > canvas.height - pipe.bottom)) {
            gameOver = true;
            if (score > 0) {
                saveScore();
            }
            resetGame();
        }

        if (!pipe.passed && pipe.x + pipe.width < block.x) {
            score++;
            pipe.passed = true;
            scoreDisplay.innerText = 'Score: ' + score;
            if (score >= 500) {
                victoryMessage.style.display = "block";
                resetGame();
            } else if (score % 10 === 0) {
                showPopOutMessage(`Event at score ${score}`);
            }
        }
    });

    additionalObstacles.forEach(obstacle => {
        const dx = block.x + block.width / 2 - obstacle.x;
        const dy = block.y + block.height / 2 - obstacle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < block.width / 2 + obstacle.radius) {
            gameOver = true;
            if (score > 0) {
                saveScore();
            }
            resetGame();
        }
    });

    coins.forEach(coin => {
        const dx = block.x + block.width / 2 - coin.x;
        const dy = block.y + block.height / 2 - coin.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < block.width / 2 + coin.radius) {
            score += 5; // Bonus points for collecting coins
            coin.collected = true;
        }
    });

    coins = coins.filter(coin => !coin.collected);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBlock(ctx, block);
    drawPipes(ctx, pipes);
    drawObstacles(ctx, additionalObstacles);
    drawCoins(ctx, coins);
}

function update() {
    frame++;
    updateBlock();
    updatePipes();
    updateObstacles();
    updateCoins();
    generateObstacles();
    generateCoins();
    detectCollision();
    saveState();
}

function loop() {
    if (!gameOver) {
        update();
        draw();
        requestAnimationFrame(loop);
    }
}

window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        block.velocity = block.lift;
    }
});

window.addEventListener('mousedown', () => {
    block.velocity = block.lift;
});

function saveScore() {
    const ranking = JSON.parse(localStorage.getItem('ranking')) || [];
    const newRecord = {
        id: Date.now(),
        score: score,
        time: new Date().toLocaleString(),
        name: `Retry ${ranking.length + 1}`,
        gameHistory: gameHistory
    };
    ranking.push(newRecord);
    localStorage.setItem('ranking', JSON.stringify(ranking));
    displayRanking();
}

function displayRanking() {
    const ranking = JSON.parse(localStorage.getItem('ranking')) || [];
    rankingList.innerHTML = '';
    ranking.forEach(record => {
        const item = document.createElement('div');
        item.className = 'rank-item';
        item.innerHTML = `
            <div>Name: <span contenteditable="true" onblur="renameRecord(${record.id}, this)">${record.name}</span></div>
            <div>Score: ${record.score}</div>
            <div>Time: ${record.time}</div>
            <div>
                <button onclick="showDetail(${record.id})">Detail</button>
                <button onclick="deleteRecord(${record.id})">Delete</button>
            </div>
        `;
        rankingList.appendChild(item);
    });
}

window.renameRecord = function(id, element) {
    const ranking = JSON.parse(localStorage.getItem('ranking')) || [];
    const record = ranking.find(rec => rec.id === id);
    if (record) {
        record.name = element.innerText;
        localStorage.setItem('ranking', JSON.stringify(ranking));
    }
};

window.deleteRecord = function(id) {
    if (confirm('Are you sure you want to delete this record?')) {
        let ranking = JSON.parse(localStorage.getItem('ranking')) || [];
        ranking = ranking.filter(rec => rec.id !== id);
        localStorage.setItem('ranking', JSON.stringify(ranking));
        displayRanking();
    }
};

window.showDetail = function(id) {
    const ranking = JSON.parse(localStorage.getItem('ranking')) || [];
    const record = ranking.find(rec => rec.id === id);
    if (record) {
        modalBody.innerHTML = `
            <div>Name: <span contenteditable="true" onblur="renameRecord(${record.id}, this)">${record.name}</span></div>
            <div>Score: ${record.score}</div>
            <div>Time: ${record.time}</div>
            <div>Detailed Time: ${new Date(record.id).toLocaleString()}</div>
            <div>Storage Used: ${formatBytes(new Blob([JSON.stringify(record)]).size)}</div>
            <button onclick="replayGame(${record.id})">Replay</button>
        `;
        detailsModal.style.display = "block";
    }
};

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

window.replayGame = function(id) {
    const ranking = JSON.parse(localStorage.getItem('ranking')) || [];
    const record = ranking.find(rec => rec.id === id);
    if (record) {
        detailsModal.style.display = "none";
        replayModal.style.display = "block";
        let replayIndex = 0;
        function replayLoop() {
            if (replayIndex < record.gameHistory.length) {
                const state = record.gameHistory[replayIndex];
                replayCtx.clearRect(0, 0, replayCanvas.width, replayCanvas.height);
                drawBlock(replayCtx, {x: 50, y: state.blockY, width: 20, height: 20});
                drawPipes(replayCtx, state.pipes);
                drawObstacles(replayCtx, state.obstacles || []); // Ensure obstacles are drawn in replay
                drawCoins(replayCtx, state.coins || []); // Ensure coins are drawn in replay
                replayCtx.fillStyle = 'black';
                replayCtx.font = '20px Arial';
                replayCtx.fillText(`Score: ${state.score}`, 10, 30);
                if (state.popOutModalVisible) {
                    showPopOutMessage(`Event at score ${state.score}`);
                }
                if (replayIndex === record.gameHistory.length - 1) {
                    gameOverDisplay.style.display = 'block';
                }
                replayIndex++;
                requestAnimationFrame(replayLoop);
            }
        }
        replayLoop();
    }
};

window.clearAllRecords = function() {
    if (confirm('Are you sure you want to delete all records?')) {
        localStorage.removeItem('ranking');
        displayRanking();
    }
};

function closeModal() {
    detailsModal.style.display = "none";
}

function closeReplayModal() {
    replayModal.style.display = "none";
    gameOverDisplay.style.display = "none";
}

function showPopOutMessage(message) {
    popOutMessage.innerText = message;
    popOutModal.style.display = "block";
    gameOver = true;
}

function resumeGame() {
    popOutModal.style.display = "none";
    gameOver = false;
    loop();
}

// Close the modal if the user clicks outside of it
window.onclick = function(event) {
    if (event.target == detailsModal) {
        detailsModal.style.display = "none";
    } else if (event.target == replayModal) {
        replayModal.style.display = "none";
        gameOverDisplay.style.display = "none";
    } else if (event.target == popOutModal) {
        popOutModal.style.display = "none";
        gameOver = false;
        loop();
    }
}

displayRanking();
loop();
