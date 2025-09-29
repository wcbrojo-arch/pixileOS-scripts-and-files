let currentLanguage = 'en';
let activeWindows = new Set();
let startMenuVisible = false;
let dragData = { isDragging: false, app: null, offsetX: 0, offsetY: 0 };
let minecraftUnlocked = false;

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    updateClock();
    setInterval(updateClock, 60000);
    
    // Add event listeners for window dragging
    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', stopDrag);
    
    // Add event listener for keyboard
    document.addEventListener('keydown', handleKeyDown);
});

// Update clock
function updateClock() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    document.getElementById('clock').textContent = `${hours}:${minutes}`;
}

// Language selection
function selectLanguage(lang) {
    currentLanguage = lang;
    document.getElementById('language-screen').classList.add('hidden');
    document.getElementById('loading-screen').classList.remove('hidden');
    
    // Start loading animation
    startLoading();
}

function startLoading() {
    const loadingBar = document.querySelector('.loading-bar');
    let width = 0;
    
    const loadingInterval = setInterval(() => {
        if (width >= 100) {
            clearInterval(loadingInterval);
            // Show desktop after loading
            setTimeout(() => {
                document.getElementById('loading-screen').classList.add('hidden');
                document.getElementById('desktop').classList.remove('hidden');
                document.getElementById('taskbar').classList.remove('hidden');
                updateTextsByLanguage();
            }, 500);
        } else {
            width += Math.random() * 15;
            if (width > 100) width = 100;
            loadingBar.style.width = width + '%';
        }
    }, 300);
}

function updateTextsByLanguage() {
    const texts = {
        'en': {
            start: 'Start',
            pong: 'Pong',
            trash: 'Trash',
            browser: 'Browser',
            minecraft: 'Minecraft Free'
        },
        'de': {
            start: 'Start',
            pong: 'Pong',
            trash: 'Papierkorb',
            browser: 'Browser',
            minecraft: 'Minecraft Free'
        },
        'ru': {
            start: 'Пуск',
            pong: 'Понг',
            trash: 'Корзина',
            browser: 'Браузер',
            minecraft: 'Майнкрафт Бесплатно'
        },
        'sr': {
            start: 'Покрени',
            pong: 'Понг',
            trash: 'Канта за смеће',
            browser: 'Прегледач',
            minecraft: 'Мајнкрафт бесплатно'
        }
    };
    
    const langTexts = texts[currentLanguage];
    document.querySelector('.start-button span').textContent = langTexts.start;
    
    // Update icon texts
    const icons = document.querySelectorAll('.icon span');
    icons[0].textContent = langTexts.pong;
    icons[1].textContent = langTexts.trash;
    icons[2].textContent = langTexts.browser;
    icons[3].textContent = langTexts.minecraft;
    
    // Update menu items
    const menuItems = document.querySelectorAll('.menu-item span');
    menuItems[0].textContent = langTexts.pong;
    menuItems[1].textContent = langTexts.trash;
    menuItems[2].textContent = langTexts.browser;
    menuItems[3].textContent = langTexts.minecraft;
}

// Start menu
function toggleStartMenu() {
    const startMenu = document.getElementById('start-menu');
    startMenuVisible = !startMenuVisible;
    startMenu.classList.toggle('hidden', !startMenuVisible);
}

// Window management
function openApp(appName) {
    const window = document.getElementById(`${appName}-window`);
    window.classList.remove('hidden');
    window.style.zIndex = getHighestZIndex() + 1;
    activeWindows.add(appName);
    addToTaskbar(appName);
    
    // Close start menu if open
    startMenuVisible = false;
    document.getElementById('start-menu').classList.add('hidden');
    
    // Initialize games
    if (appName === 'pong') {
        setTimeout(initPong, 100);
    }
}

function closeWindow(appName) {
    if (appName === 'minecraft' && !minecraftUnlocked) {
        return; // Prevent closing Minecraft without password
    }
    
    const window = document.getElementById(`${appName}-window`);
    window.classList.add('hidden');
    activeWindows.delete(appName);
    removeFromTaskbar(appName);
    
    // Reset window position and size
    window.classList.remove('maximized', 'fullscreen');
    window.style.width = '600px';
    window.style.height = '500px';
    window.style.top = '50%';
    window.style.left = '50%';
    window.style.transform = 'translate(-50%, -50%)';
}

function minimizeWindow(appName) {
    if (appName === 'minecraft' && !minecraftUnlocked) {
        return; // Prevent minimizing Minecraft without password
    }
    
    const window = document.getElementById(`${appName}-window`);
    window.classList.add('hidden');
    const taskbarItem = document.querySelector(`.taskbar-item[data-app="${appName}"]`);
    if (taskbarItem) {
        taskbarItem.classList.remove('active');
    }
}

function toggleMaximize(appName) {
    if (appName === 'minecraft' && !minecraftUnlocked) {
        return; // Prevent maximizing Minecraft without password
    }
    
    const window = document.getElementById(`${appName}-window`);
    window.classList.toggle('maximized');
}

function closeMinecraftWindow() {
    // This function does nothing - Minecraft window can only be closed with password
    return false;
}

function addToTaskbar(appName) {
    const taskbarItems = document.querySelector('.taskbar-items');
    
    // Check if already exists
    if (document.querySelector(`.taskbar-item[data-app="${appName}"]`)) {
        const existingItem = document.querySelector(`.taskbar-item[data-app="${appName}"]`);
        existingItem.classList.add('active');
        return;
    }
    
    const appButton = document.createElement('div');
    appButton.className = 'taskbar-item active';
    appButton.setAttribute('data-app', appName);
    
    const iconDiv = document.createElement('img');
    iconDiv.className = 'taskbar-item-icon';
    
    // Set appropriate icon
    const icons = {
        'pong': 'icons/pong.png',
        'trash': 'icons/trash.png',
        'browser': 'icons/browser.png',
        'minecraft': 'icons/minecraft.png'
    };
    
    iconDiv.src = icons[appName];
    iconDiv.alt = appName;
    
    const textSpan = document.createElement('span');
    textSpan.textContent = getAppName(appName);
    
    appButton.appendChild(iconDiv);
    appButton.appendChild(textSpan);
    
    appButton.onclick = () => {
        if (appName === 'minecraft' && !minecraftUnlocked) {
            // Bring to front but don't allow minimizing/closing
            const window = document.getElementById(`${appName}-window`);
            window.style.zIndex = getHighestZIndex() + 1;
            return;
        }
        
        const window = document.getElementById(`${appName}-window`);
        const isHidden = window.classList.contains('hidden');
        
        if (isHidden) {
            window.classList.remove('hidden');
            window.style.zIndex = getHighestZIndex() + 1;
            appButton.classList.add('active');
        } else {
            window.classList.add('hidden');
            appButton.classList.remove('active');
        }
    };
    
    taskbarItems.appendChild(appButton);
}

function removeFromTaskbar(appName) {
    const taskbarItem = document.querySelector(`.taskbar-item[data-app="${appName}"]`);
    if (taskbarItem) {
        taskbarItem.remove();
    }
}

function getAppName(appName) {
    const names = {
        'pong': 'Pong',
        'trash': 'Trash',
        'browser': 'Browser',
        'minecraft': 'Minecraft Free'
    };
    return names[appName] || appName;
}

function getHighestZIndex() {
    return Array.from(document.querySelectorAll('body *'))
        .map(el => parseFloat(window.getComputedStyle(el).zIndex))
        .filter(zIndex => !isNaN(zIndex))
        .reduce((max, zIndex) => Math.max(max, zIndex), 100);
}

// Window dragging
function startDrag(e, appName) {
    if (e.target.closest('.window-controls')) return;
    if (appName === 'minecraft' && !minecraftUnlocked) return; // Prevent dragging locked window
    
    const window = document.getElementById(`${appName}-window`);
    if (window.classList.contains('fullscreen') || window.classList.contains('maximized')) return;
    
    window.style.zIndex = getHighestZIndex() + 1;
    
    dragData = {
        isDragging: true,
        app: appName,
        offsetX: e.clientX - window.getBoundingClientRect().left,
        offsetY: e.clientY - window.getBoundingClientRect().top
    };
}

function handleDrag(e) {
    if (!dragData.isDragging) return;
    
    const window = document.getElementById(`${dragData.app}-window`);
    if (window.classList.contains('maximized') || window.classList.contains('fullscreen')) return;
    
    const x = e.clientX - dragData.offsetX;
    const y = e.clientY - dragData.offsetY;
    
    window.style.left = `${x}px`;
    window.style.top = `${y}px`;
    window.style.transform = 'none';
}

function stopDrag() {
    dragData.isDragging = false;
}

// Minecraft ransomware
function checkRansomCode() {
    const code = document.getElementById('ransom-code').value;
    const message = document.getElementById('ransom-message');
    
    if (code === '123') {
        minecraftUnlocked = true;
        message.textContent = 'System unlocked! Closing window...';
        message.style.color = '#2ecc71';
        
        // Enable window controls
        const controls = document.querySelectorAll('#minecraft-window .window-controls button');
        controls.forEach(btn => {
            btn.disabled = false;
            btn.classList.remove('disabled-btn');
        });
        
        setTimeout(() => {
            closeWindow('minecraft');
            message.textContent = '';
            document.getElementById('ransom-code').value = '';
            minecraftUnlocked = false; // Reset for next time
        }, 2000);
    } else {
        message.textContent = 'Incorrect code! Try again.';
        message.style.color = '#e74c3c';
    }
}

// Pong Game
function initPong() {
    const canvas = document.getElementById('pong-canvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.querySelector('.pong-score');
    
    // Set canvas size based on window size
    const updateCanvasSize = () => {
        const container = canvas.parentElement;
        canvas.width = container.clientWidth - 40;
        canvas.height = container.clientHeight - 100;
    };
    
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    
    // Game variables
    const paddleHeight = 15;
    const paddleWidth = Math.min(100, canvas.width / 6);
    let paddleX = (canvas.width - paddleWidth) / 2;
    let ballX = canvas.width / 2;
    let ballY = canvas.height / 2;
    let ballSpeedX = 4;
    let ballSpeedY = 4;
    let ballRadius = Math.min(12, canvas.width / 50);
    let playerScore = 0;
    let computerScore = 0;
    let gameActive = true;
    
    // Draw functions
    function drawBall() {
        ctx.beginPath();
        ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#FFF';
        ctx.fill();
        ctx.closePath();
    }
    
    function drawPaddle(x, y, width, height) {
        ctx.beginPath();
        ctx.rect(x, y, width, height);
        ctx.fillStyle = '#0095DD';
        ctx.fill();
        ctx.closePath();
    }
    
    function draw() {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw ball
        drawBall();
        
        // Draw player paddle (bottom)
        drawPaddle(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
        
        // Draw computer paddle (top) - simple AI that follows ball
        const computerPaddleX = ballX - paddleWidth / 2;
        drawPaddle(
            Math.max(0, Math.min(canvas.width - paddleWidth, computerPaddleX)),
            0,
            paddleWidth,
            paddleHeight
        );
        
        // Draw net (middle line)
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.closePath();
        
        // Draw scores
        ctx.fillStyle = 'white';
        ctx.font = '24px Arial';
        ctx.fillText(playerScore.toString(), canvas.width / 2 - 30, canvas.height / 2 - 20);
        ctx.fillText(computerScore.toString(), canvas.width / 2 - 30, canvas.height / 2 + 40);
    }
    
    // Update game state
    function update() {
        if (!gameActive) return;
        
        // Move ball
        ballX += ballSpeedX;
        ballY += ballSpeedY;
        
        // Wall collision (left/right)
        if (ballX + ballSpeedX > canvas.width - ballRadius || ballX + ballSpeedX < ballRadius) {
            ballSpeedX = -ballSpeedX;
        }
        
        // Paddle collision
        // Top paddle (computer)
        if (ballY < paddleHeight + ballRadius && 
            ballX > Math.max(0, Math.min(canvas.width - paddleWidth, ballX - paddleWidth / 2)) && 
            ballX < Math.max(0, Math.min(canvas.width - paddleWidth, ballX - paddleWidth / 2)) + paddleWidth) {
            ballSpeedY = Math.abs(ballSpeedY); // Ensure it goes down
        }
        
        // Bottom paddle (player)
        if (ballY > canvas.height - paddleHeight - ballRadius && 
            ballX > paddleX && ballX < paddleX + paddleWidth) {
            ballSpeedY = -Math.abs(ballSpeedY); // Ensure it goes up
            
            // Add some angle based on where the ball hit the paddle
            const hitPos = (ballX - (paddleX + paddleWidth / 2)) / (paddleWidth / 2);
            ballSpeedX = hitPos * 6;
        }
        
        // Score points
        if (ballY + ballSpeedY < ballRadius) {
            // Player scores
            playerScore++;
            resetBall();
        } else if (ballY + ballSpeedY > canvas.height - ballRadius) {
            // Computer scores
            computerScore++;
            resetBall();
        }
        
        // Update score display
        scoreElement.textContent = `Player: ${playerScore} - Computer: ${computerScore}`;
        
        // Check for winner
        if (playerScore >= 5 || computerScore >= 5) {
            gameActive = false;
            setTimeout(() => {
                playerScore = 0;
                computerScore = 0;
                gameActive = true;
                resetBall();
            }, 3000);
        }
    }
    
    function resetBall() {
        ballX = canvas.width / 2;
        ballY = canvas.height / 2;
        ballSpeedX = 4 * (Math.random() > 0.5 ? 1 : -1);
        ballSpeedY = 4 * (Math.random() > 0.5 ? 1 : -1);
    }
    
    // Mouse movement handler
    canvas.addEventListener('mousemove', function(e) {
        const rect = canvas.getBoundingClientRect();
        const relativeX = e.clientX - rect.left;
        if (relativeX > 0 && relativeX < canvas.width) {
            paddleX = relativeX - paddleWidth / 2;
            
            // Keep paddle within bounds
            if (paddleX < 0) {
                paddleX = 0;
            } else if (paddleX > canvas.width - paddleWidth) {
                paddleX = canvas.width - paddleWidth;
            }
        }
    });
    
    // Game loop
    function gameLoop() {
        if (!document.getElementById('pong-window').classList.contains('hidden')) {
            draw();
            update();
            requestAnimationFrame(gameLoop);
        }
    }
    
    gameLoop();
}

// Close start menu when clicking outside
document.addEventListener('click', function(e) {
    if (startMenuVisible && !e.target.closest('#start-menu') && !e.target.closest('.start-button')) {
        startMenuVisible = false;
        document.getElementById('start-menu').classList.add('hidden');
    }
});

// Handle keyboard events
function handleKeyDown(e) {
    if (e.code === 'Escape') {
        // Close start menu if open
        if (startMenuVisible) {
            startMenuVisible = false;
            document.getElementById('start-menu').classList.add('hidden');
        }
    }
}
