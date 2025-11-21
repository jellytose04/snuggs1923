const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gameOverScreen = document.getElementById('game-over-screen');
const restartButton = document.getElementById('restart-button');
const finalSecondsDisplay = document.getElementById('final-seconds');
const secondsDisplay = document.getElementById('seconds');
const colorPicker = document.getElementById('player-color');
const pauseButton = document.getElementById('pause-button');

let gameRunning = true;
let isPaused = false;
let seconds = 0;
let timer;

// Load the Grumble image
const grumbleImage = new Image();
grumbleImage.src = 'grumble.png';

// Player properties
const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: 50,
    speed: 10,
    color: colorPicker.value
};

// Grumble properties
const grumble = {
    x: 0,
    y: 0,
    size: player.size * 2,
    speed: 2,
    color: 'red'
};

// Movement keys
const keys = {
    ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false,
    w: false, s: false, a: false, d: false,
};

// Event listeners for key presses
document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (keys.hasOwnProperty(key)) {
        keys[key] = true;
    }
});
document.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    if (keys.hasOwnProperty(key)) {
        keys[key] = false;
    }
});

// Listener for color picker
colorPicker.addEventListener('input', (e) => {
    player.color = e.target.value;
});

// Listener for pause button
pauseButton.addEventListener('click', togglePause);

function togglePause() {
    isPaused = !isPaused;
    if (isPaused) {
        pauseButton.textContent = 'Resume';
        clearInterval(timer);
    } else {
        pauseButton.textContent = 'Pause';
        timer = setInterval(() => {
            seconds++;
            secondsDisplay.textContent = seconds;
        }, 1000);
        gameLoop();
    }
}

// Function to start the game
function startGame() {
    gameRunning = true;
    isPaused = false;
    seconds = 0;
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
    grumble.x = Math.random() < 0.5 ? 0 : canvas.width;
    grumble.y = Math.random() < 0.5 ? 0 : canvas.height;
    grumble.speed = 2;
    gameOverScreen.classList.add('hidden');
    pauseButton.textContent = 'Pause';
    
    if (timer) clearInterval(timer);
    timer = setInterval(() => {
        seconds++;
        secondsDisplay.textContent = seconds;
    }, 1000);

    gameLoop();
}

// Draw the player
function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.size, player.size);
}

// Draw Grumble
function drawGrumble() {
    if (grumbleImage.complete) {
        ctx.drawImage(grumbleImage, grumble.x, grumble.y, grumble.size, grumble.size);
    } else {
        ctx.fillStyle = grumble.color;
        ctx.fillRect(grumble.x, grumble.y, grumble.size, grumble.size);
    }
}

// Update game state
function update() {
    // Player movement with WASD and arrow keys
    if ((keys.ArrowUp || keys.w) && player.y > 0) {
        player.y -= player.speed;
    }
    if ((keys.ArrowDown || keys.s) && player.y < canvas.height - player.size) {
        player.y += player.speed;
    }
    if ((keys.ArrowLeft || keys.a) && player.x > 0) {
        player.x -= player.speed;
    }
    if ((keys.ArrowRight || keys.d) && player.x < canvas.width - player.size) {
        player.x += player.speed;
    }

    // Grumble's AI (moves towards the player)
    const dx = player.x - grumble.x;
    const dy = player.y - grumble.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
        grumble.x += (dx / distance) * grumble.speed;
        grumble.y += (dy / distance) * grumble.speed;
    }
    
    // Grumble gets faster over time
    if (seconds > 0 && seconds % 10 === 0) {
        grumble.speed += 0.005;
    }

    // Collision detection
    if (player.x < grumble.x + grumble.size &&
        player.x + player.size > grumble.x &&
        player.y < grumble.y + grumble.size &&
        player.y + player.size > grumble.y) {
        gameOver();
    }
}

// Handle game over
function gameOver() {
    gameRunning = false;
    clearInterval(timer);
    finalSecondsDisplay.textContent = seconds;
    gameOverScreen.classList.remove('hidden');

    // Prompt user to go back to the previous page
    const goBack = confirm("Game Over! Would you like to return to the website you came from?");
    if (goBack) {
        window.history.back();
    }
}

// Main game loop
function gameLoop() {
    if (!gameRunning) return;
    if (isPaused) {
        drawPlayer();
        drawGrumble();
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    update();
    drawPlayer();
    drawGrumble();

    requestAnimationFrame(gameLoop);
}

// Restart button event listener
restartButton.addEventListener('click', startGame);

// Start the game for the first time
startGame();
