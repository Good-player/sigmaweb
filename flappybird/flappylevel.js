function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function updatePipes() {
    if (frame % 120 === 0) {
        let pipeHeight = Math.floor(Math.random() * (canvas.height / 2)) + 20;
        let gap = 150;
        pipes.push({
            x: canvas.width,
            width: 20,
            top: pipeHeight,
            bottom: canvas.height - pipeHeight - gap,
            passed: false,
            verticalDirection: Math.random() < 0.5 ? 1 : -1,
            color: getRandomColor()
        });
    }

    pipes.forEach(pipe => {
        pipe.x -= 2 * gameSpeed;
        if (score >= 10) {
            pipe.top += pipe.verticalDirection * pipeVerticalSpeed;
            pipe.bottom -= pipe.verticalDirection * pipeVerticalSpeed;
            if (pipe.top <= 20 || (canvas.height - pipe.bottom) <= 20) {
                pipe.verticalDirection *= -1;
            }
        }

        if (score >= 20) {
            gameSpeed = 1.25;
        }

        if (score >= 30) {
            pipe.width = Math.random() * 10 + 15; // Random width between 15 and 25
        }

        if (score >= 40) {
            pipe.color = getRandomColor();
        }

        if (score >= 50) {
            generateCoins();
        }

        if (score >= 60) {
            pipe.disappear = true;
        }

        if (score >= 70) {
            generateObstacles();
        }

        if (score >= 80) {
            pipe.changeDirection = true;
        }

        if (score >= 90) {
            generatePlatforms();
        }

        if (score >= 100) {
            pipe.shootProjectiles = true;
        }

        if (score >= 110) {
            pipe.gravityReversal = true;
        }

        if (score >= 120) {
            pipe.invisible = true;
        }

        if (score >= 130) {
            generateWind();
        }

        if (score >= 140) {
            pipe.moveDiagonally = true;
        }

        if (score >= 150) {
            generateTeleportationPortals();
        }

        if (score >= 160) {
            pipe.changeSizeRandomly = true;
        }

        if (score >= 170) {
            generateEnemyBlocks();
        }

        if (score >= 180) {
            pipe.splitIntoMultiple = true;
        }

        if (score >= 190) {
            generateTimeSlowingZones();
        }

        if (score >= 200) {
            gameSpeed = 1.5;
        }

        if (score >= 210) {
            generateMovingSpikes();
        }

        if (score >= 220) {
            pipe.rotate = true;
        }

        if (score >= 230) {
            generateLaserBeams();
        }

        if (score >= 240) {
            doublePipes();
        }

        if (score >= 250) {
            generateMagneticFields();
        }

        if (score >= 260) {
            pipe.zigzag = true;
        }

        if (score >= 270) {
            generateIceZones();
        }

        if (score >= 280) {
            pipe.wavePattern = true;
        }

        if (score >= 290) {
            generateFireballs();
        }

        if (score >= 300) {
            pipe.circularPattern = true;
        }

        if (score >= 310) {
            generateElectricFields();
        }

        if (score >= 320) {
            pipe.teleport = true;
        }

        if (score >= 330) {
            generateFallingRocks();
        }

        if (score >= 340) {
            pipe.spiralPattern = true;
        }

        if (score >= 350) {
            generateWaterZones();
        }

        if (score >= 360) {
            pipe.bounce = true;
        }

        if (score >= 370) {
            generateBlackHoles();
        }

        if (score >= 380) {
            pipe.randomPattern = true;
        }

        if (score >= 390) {
            generateTimeWarpZones();
        }

        if (score >= 400) {
            pipe.zigzagWavePattern = true;
        }

        if (score >= 410) {
            generateEnemyProjectiles();
        }

        if (score >= 420) {
            pipe.mimicBlock = true;
        }

        if (score >= 430) {
            generateTeleportingEnemies();
        }

        if (score >= 440) {
            pipe.randomCircularPattern = true;
        }

        if (score >= 450) {
            generateSplittingEnemies();
        }

        if (score >= 460) {
            pipe.changeSizeAndColor = true;
        }

        if (score >= 470) {
            generateTeleportingEnemies();
        }

        if (score >= 480) {
            pipe.spiralWavePattern = true;
        }

        if (score >= 490) {
            generateStunningEnemies();
        }

        if (score >= 500) {
            victoryMessage.style.display = "block";
            resetGame();
        }
    });

    pipes = pipes.filter(pipe => pipe.x + pipe.width > 0);
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
