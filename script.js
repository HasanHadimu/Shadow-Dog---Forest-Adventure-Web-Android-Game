// ============ RESPONSIVE CANVAS ============
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const BASE_WIDTH = 800;
const BASE_HEIGHT = 600;

let canvasWidth = BASE_WIDTH;
let canvasHeight = BASE_HEIGHT;
let scale = 1;

// ============ LOAD ASSET BACKGROUND PNG ============
// Menggunakan nama file: bg_sky.png, bg_mountains.png, bg_trees.png, bg_ground.png
const bgSky = new Image();
bgSky.src = 'bg_sky.png';           // Background langit

const bgMountains = new Image();
bgMountains.src = 'bg_mountains.png'; // Background gunung

const bgTrees = new Image();
bgTrees.src = 'bg_trees.png';         // Background pohon

const bgGround = new Image();
bgGround.src = 'bg_ground.png';       // Background tanah

// ============ LOAD CHARACTER ============
const playerImage = new Image();
playerImage.src = 'shadow_dog.png';

// ============ LOADING COUNTER ============
let loadedAssets = 0;
const totalAssets = 5; // 4 background + 1 character

function assetLoaded() {
    loadedAssets++;
    console.log(`Loading assets: ${loadedAssets}/${totalAssets}`);
    
    if (loadedAssets === totalAssets) {
        console.log('✅ Semua asset berhasil dimuat!');
        console.log('📁 bg_sky.png - Loaded');
        console.log('📁 bg_mountains.png - Loaded');
        console.log('📁 bg_trees.png - Loaded');
        console.log('📁 bg_ground.png - Loaded');
        console.log('📁 shadow_dog.png - Loaded');
        hideLoading();
    }
}

// Event listeners untuk background
bgSky.onload = () => { console.log('✅ bg_sky.png loaded'); assetLoaded(); };
bgSky.onerror = () => { console.warn('⚠️ bg_sky.png tidak ditemukan'); assetLoaded(); };

bgMountains.onload = () => { console.log('✅ bg_mountains.png loaded'); assetLoaded(); };
bgMountains.onerror = () => { console.warn('⚠️ bg_mountains.png tidak ditemukan'); assetLoaded(); };

bgTrees.onload = () => { console.log('✅ bg_trees.png loaded'); assetLoaded(); };
bgTrees.onerror = () => { console.warn('⚠️ bg_trees.png tidak ditemukan'); assetLoaded(); };

bgGround.onload = () => { console.log('✅ bg_ground.png loaded'); assetLoaded(); };
bgGround.onerror = () => { console.warn('⚠️ bg_ground.png tidak ditemukan'); assetLoaded(); };

playerImage.onload = () => { console.log('✅ shadow_dog.png loaded'); assetLoaded(); };
playerImage.onerror = () => { console.warn('⚠️ shadow_dog.png tidak ditemukan'); assetLoaded(); };

// ============ PARALLAX SETUP ============
let offsetSky = 0;
let offsetMountains = 0;
let offsetTrees = 0;
let offsetGround = 0;

// Kecepatan parallax (semakin depan semakin cepat)
const parallaxSpeed = {
    sky: 0,        // Langit tidak bergerak
    mountains: 0.3, // Gunung bergerak lambat
    trees: 0.7,     // Pohon bergerak sedang
    ground: 1.2     // Tanah bergerak cepat
};

// ============ KARAKTER SETUP ============
const spriteWidth = 575;
const spriteHeight = 523;

let frameX = 0;
let frameY = 0;
let gameFrame = 0;
let staggerFrames = 5;

const animations = [
    { name: 'idle', rows: 0, frames: 7 },
    { name: 'jump', rows: 1, frames: 7 },
    { name: 'fall', rows: 2, frames: 7 },
    { name: 'run', rows: 3, frames: 9 },
    { name: 'dizzy', rows: 4, frames: 11 },
    { name: 'sit', rows: 5, frames: 5 },
    { name: 'roll', rows: 6, frames: 7 },
    { name: 'bite', rows: 7, frames: 7 },
    { name: 'ko', rows: 8, frames: 12 },
    { name: 'gethit', rows: 9, frames: 4 }
];

let currentAnimation = 3;
let currentFrame = 0;
let maxFrames = animations[currentAnimation].frames;

// ============ KONTROL ============
const keys = {
    ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false,
    w: false, s: false, a: false, d: false,
    space: false, x: false, z: false, c: false
};

let playerX = BASE_WIDTH / 2 - 100;
let playerY = BASE_HEIGHT - 250;
let playerSpeed = 6;

// ============ PARTICLE SYSTEM ============
let particles = [];

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 4 + 2;
        this.speedX = (Math.random() - 0.5) * 4;
        this.speedY = (Math.random() - 0.5) * 4 - 2;
        this.color = `hsl(${Math.random() * 60 + 20}, 80%, 60%)`;
        this.life = 1;
    }
    
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life -= 0.02;
    }
    
    draw() {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.restore();
    }
}

// ============ RESIZE CANVAS ============
function resizeCanvas() {
    const wrapper = document.querySelector('.game-wrapper');
    if (!wrapper) return;
    
    const maxWidth = window.innerWidth - 20;
    const maxHeight = window.innerHeight - 20;
    
    let width = BASE_WIDTH;
    let height = BASE_HEIGHT;
    
    const scaleX = maxWidth / BASE_WIDTH;
    const scaleY = maxHeight / BASE_HEIGHT;
    scale = Math.min(scaleX, scaleY);
    
    width = BASE_WIDTH * scale;
    height = BASE_HEIGHT * scale;
    
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    
    canvas.width = BASE_WIDTH;
    canvas.height = BASE_HEIGHT;
    
    playerX = Math.min(Math.max(playerX, 50), BASE_WIDTH - 150);
    playerY = Math.min(Math.max(playerY, 100), BASE_HEIGHT - 200);
}

// ============ DRAW BACKGROUND DENGAN PNG ============
function drawBackground() {
    // Layer 1: Langit (bg_sky.png) - Tidak bergerak
    if (bgSky.complete && bgSky.naturalWidth > 0) {
        ctx.drawImage(bgSky, 0, 0, BASE_WIDTH, BASE_HEIGHT);
    } else {
        drawFallbackSky();
    }
    
    // Layer 2: Gunung (bg_mountains.png) - Parallax lambat
    if (bgMountains.complete && bgMountains.naturalWidth > 0) {
        ctx.drawImage(bgMountains, offsetMountains, 0, BASE_WIDTH, BASE_HEIGHT);
        ctx.drawImage(bgMountains, offsetMountains - BASE_WIDTH, 0, BASE_WIDTH, BASE_HEIGHT);
    } else {
        drawFallbackMountains();
    }
    
    // Layer 3: Pohon (bg_trees.png) - Parallax sedang
    if (bgTrees.complete && bgTrees.naturalWidth > 0) {
        ctx.drawImage(bgTrees, offsetTrees, 0, BASE_WIDTH, BASE_HEIGHT);
        ctx.drawImage(bgTrees, offsetTrees - BASE_WIDTH, 0, BASE_WIDTH, BASE_HEIGHT);
    } else {
        drawFallbackTrees();
    }
    
    // Layer 4: Tanah (bg_ground.png) - Parallax cepat
    if (bgGround.complete && bgGround.naturalWidth > 0) {
        ctx.drawImage(bgGround, offsetGround, 0, BASE_WIDTH, BASE_HEIGHT);
        ctx.drawImage(bgGround, offsetGround - BASE_WIDTH, 0, BASE_WIDTH, BASE_HEIGHT);
    } else {
        drawFallbackGround();
    }
}

// Fallback jika PNG tidak tersedia
function drawFallbackSky() {
    const gradient = ctx.createLinearGradient(0, 0, 0, BASE_HEIGHT);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.6, '#98D8C8');
    gradient.addColorStop(1, '#B8E4D0');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT);
    
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(680, 70, 45, 0, Math.PI * 2);
    ctx.fill();
}

function drawFallbackMountains() {
    ctx.fillStyle = '#4a7c3f';
    ctx.fillRect(0, BASE_HEIGHT/2, BASE_WIDTH, BASE_HEIGHT/2);
    ctx.fillStyle = '#3a6a2f';
    ctx.beginPath();
    ctx.moveTo(0, BASE_HEIGHT/2 + 50);
    ctx.lineTo(200, BASE_HEIGHT/2 - 30);
    ctx.lineTo(400, BASE_HEIGHT/2 + 40);
    ctx.lineTo(600, BASE_HEIGHT/2 - 20);
    ctx.lineTo(BASE_WIDTH, BASE_HEIGHT/2 + 60);
    ctx.fill();
}

function drawFallbackTrees() {
    for(let i = 0; i < 10; i++) {
        ctx.fillStyle = '#2d5a27';
        ctx.fillRect(i * 90 + 20, BASE_HEIGHT - 200, 25, 200);
        ctx.fillStyle = '#3a7a30';
        ctx.beginPath();
        ctx.ellipse(i * 90 + 32, BASE_HEIGHT - 220, 30, 50, 0, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawFallbackGround() {
    ctx.fillStyle = '#5a3a2a';
    ctx.fillRect(0, BASE_HEIGHT - 80, BASE_WIDTH, 80);
    ctx.fillStyle = '#6a8a3a';
    for(let i = 0; i < 25; i++) {
        ctx.fillRect(i * 35, BASE_HEIGHT - 85, 4, 15);
    }
}

// ============ UPDATE PARALLAX ============
function updateParallax() {
    const movingLeft = keys.ArrowLeft || keys.a;
    const movingRight = keys.ArrowRight || keys.d;
    const isMoving = movingLeft || movingRight;
    
    if (isMoving) {
        if (movingLeft) {
            offsetMountains += parallaxSpeed.mountains;
            offsetTrees += parallaxSpeed.trees;
            offsetGround += parallaxSpeed.ground;
        } else if (movingRight) {
            offsetMountains -= parallaxSpeed.mountains;
            offsetTrees -= parallaxSpeed.trees;
            offsetGround -= parallaxSpeed.ground;
        }
    }
    
    // Reset offset untuk infinite loop
    if (offsetMountains > BASE_WIDTH) offsetMountains = 0;
    if (offsetMountains < -BASE_WIDTH) offsetMountains = 0;
    if (offsetTrees > BASE_WIDTH) offsetTrees = 0;
    if (offsetTrees < -BASE_WIDTH) offsetTrees = 0;
    if (offsetGround > BASE_WIDTH) offsetGround = 0;
    if (offsetGround < -BASE_WIDTH) offsetGround = 0;
}

// ============ KONTROL KARAKTER ============
function movePlayer() {
    let moved = false;
    let newX = playerX;
    let newY = playerY;
    
    if (keys.ArrowUp || keys.w) {
        newY -= playerSpeed;
        moved = true;
    }
    if (keys.ArrowDown || keys.s) {
        newY += playerSpeed;
        moved = true;
    }
    if (keys.ArrowLeft || keys.a) {
        newX -= playerSpeed;
        moved = true;
    }
    if (keys.ArrowRight || keys.d) {
        newX += playerSpeed;
        moved = true;
    }
    
    playerX = Math.max(80, Math.min(BASE_WIDTH - 150, newX));
    playerY = Math.max(150, Math.min(BASE_HEIGHT - 200, newY));
    
    if (moved && animations[currentAnimation].name !== 'run') {
        setAnimation('run');
    } else if (!moved && animations[currentAnimation].name === 'run') {
        setAnimation('idle');
    }
}

function setAnimation(animationName) {
    const index = animations.findIndex(anim => anim.name === animationName);
    if (index !== -1 && currentAnimation !== index) {
        currentAnimation = index;
        frameY = animations[currentAnimation].rows;
        maxFrames = animations[currentAnimation].frames;
        currentFrame = 0;
        frameX = 0;
        
        // Update UI
        const animNameElem = document.getElementById('animName');
        if (animNameElem) animNameElem.textContent = animationName;
    }
}

// ============ EVENT LISTENER ============
function setupEventListeners() {
    // Keyboard controls
    window.addEventListener('keydown', (e) => {
        const key = e.key;
        
        switch(key) {
            case 'ArrowUp': case 'w':
                keys.ArrowUp = true; keys.w = true;
                setAnimation('jump');
                e.preventDefault();
                break;
            case 'ArrowDown': case 's':
                keys.ArrowDown = true; keys.s = true;
                setAnimation('fall');
                e.preventDefault();
                break;
            case 'ArrowLeft': case 'a':
                keys.ArrowLeft = true; keys.a = true;
                setAnimation('run');
                e.preventDefault();
                break;
            case 'ArrowRight': case 'd':
                keys.ArrowRight = true; keys.d = true;
                setAnimation('run');
                e.preventDefault();
                break;
            case ' ': case 'Space':
                keys.space = true;
                setAnimation('roll');
                e.preventDefault();
                break;
            case 'x': case 'X':
                keys.x = true;
                setAnimation('bite');
                e.preventDefault();
                break;
            case 'z': case 'Z':
                keys.z = true;
                setAnimation('dizzy');
                e.preventDefault();
                break;
            case 'c': case 'C':
                keys.c = true;
                setAnimation('sit');
                e.preventDefault();
                break;
        }
    });
    
    window.addEventListener('keyup', (e) => {
        const key = e.key;
        
        switch(key) {
            case 'ArrowUp': case 'w':
                keys.ArrowUp = false; keys.w = false;
                break;
            case 'ArrowDown': case 's':
                keys.ArrowDown = false; keys.s = false;
                break;
            case 'ArrowLeft': case 'a':
                keys.ArrowLeft = false; keys.a = false;
                break;
            case 'ArrowRight': case 'd':
                keys.ArrowRight = false; keys.d = false;
                break;
            case ' ': case 'Space':
                keys.space = false;
                break;
            case 'x': case 'X':
                keys.x = false;
                break;
            case 'z': case 'Z':
                keys.z = false;
                break;
            case 'c': case 'C':
                keys.c = false;
                break;
        }
        
        const anyMovement = keys.ArrowUp || keys.ArrowDown || keys.ArrowLeft || keys.ArrowRight ||
                           keys.w || keys.s || keys.a || keys.d;
        if (!anyMovement && animations[currentAnimation].name === 'run') {
            setAnimation('idle');
        }
    });
    
    // Touch controls untuk mobile
    setupTouchControls();
}

function setupTouchControls() {
    const buttons = {
        'up': () => { keys.ArrowUp = true; keys.w = true; setAnimation('jump'); },
        'up-end': () => { keys.ArrowUp = false; keys.w = false; },
        'down': () => { keys.ArrowDown = true; keys.s = true; setAnimation('fall'); },
        'down-end': () => { keys.ArrowDown = false; keys.s = false; },
        'left': () => { keys.ArrowLeft = true; keys.a = true; setAnimation('run'); },
        'left-end': () => { keys.ArrowLeft = false; keys.a = false; },
        'right': () => { keys.ArrowRight = true; keys.d = true; setAnimation('run'); },
        'right-end': () => { keys.ArrowRight = false; keys.d = false; },
        'roll': () => { setAnimation('roll'); setTimeout(() => setAnimation('idle'), 300); },
        'bite': () => { setAnimation('bite'); setTimeout(() => setAnimation('idle'), 300); },
        'dizzy': () => { setAnimation('dizzy'); setTimeout(() => setAnimation('idle'), 500); }
    };
    
    const touchElements = document.querySelectorAll('[data-action]');
    touchElements.forEach(elem => {
        const action = elem.dataset.action;
        
        elem.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (buttons[action]) buttons[action]();
        });
        
        elem.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (buttons[`${action}-end`]) buttons[`${action}-end`]();
            
            const anyMovement = keys.ArrowUp || keys.ArrowDown || keys.ArrowLeft || keys.ArrowRight;
            if (!anyMovement && animations[currentAnimation].name === 'run') {
                setAnimation('idle');
            }
        });
        
        elem.addEventListener('mousedown', (e) => {
            e.preventDefault();
            if (buttons[action]) buttons[action]();
        });
        
        elem.addEventListener('mouseup', (e) => {
            e.preventDefault();
            if (buttons[`${action}-end`]) buttons[`${action}-end`]();
        });
    });
}

// ============ ADD PARTICLES ============
function addParticles() {
    if (gameFrame % 6 === 0 && animations[currentAnimation].name === 'run') {
        for(let i = 0; i < 2; i++) {
            particles.push(new Particle(playerX + 40, playerY + 85));
        }
    }
    
    particles = particles.filter(p => p.life > 0);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
}

// ============ UPDATE UI ============
function updateUI() {
    const frameInfoElem = document.getElementById('frameInfo');
    if (frameInfoElem) {
        frameInfoElem.textContent = `Frame: ${currentFrame + 1}/${maxFrames}`;
    }
}

// ============ DRAW PLAYER ============
function drawPlayer() {
    ctx.save();
    ctx.shadowBlur = 8;
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    
    const isFlipped = keys.ArrowLeft || keys.a;
    const drawX = isFlipped ? -playerX - spriteWidth/2.5 : playerX;
    
    if (isFlipped) {
        ctx.scale(-1, 1);
    }
    
    if (playerImage.complete && playerImage.naturalWidth > 0) {
        ctx.drawImage(playerImage, 
            frameX, frameY, spriteWidth, spriteHeight,
            drawX, playerY, spriteWidth/1.5, spriteHeight/1.5);
    } else {
        // Fallback karakter
        ctx.fillStyle = '#ff6b6b';
        ctx.fillRect(isFlipped ? -playerX - 50 : playerX, playerY, 80, 80);
        ctx.fillStyle = 'white';
        ctx.font = '40px Arial';
        ctx.fillText('🐕', isFlipped ? -playerX - 30 : playerX + 15, playerY + 55);
    }
    
    ctx.restore();
}

// ============ DRAW UI ============
function drawUI() {
    // Energy bar
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(15, BASE_HEIGHT - 35, 150, 12);
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(15, BASE_HEIGHT - 35, 150 * ((gameFrame % 600) / 600), 12);
    
    ctx.font = 'bold 12px monospace';
    ctx.fillStyle = 'white';
    ctx.shadowBlur = 2;
    ctx.fillText('ENERGY', 15, BASE_HEIGHT - 40);
    ctx.shadowBlur = 0;
}

// ============ HIDE LOADING ============
function hideLoading() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        setTimeout(() => {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }, 500);
    }
}

// ============ ANIMATION LOOP ============
function animate() {
    ctx.clearRect(0, 0, BASE_WIDTH, BASE_HEIGHT);
    
    updateParallax();
    drawBackground();
    movePlayer();
    
    if (gameFrame % staggerFrames === 0) {
        currentFrame = (currentFrame + 1) % maxFrames;
        frameX = currentFrame * spriteWidth;
        frameY = animations[currentAnimation].rows * spriteHeight;
        updateUI();
    }
    
    drawPlayer();
    addParticles();
    drawUI();
    
    gameFrame++;
    requestAnimationFrame(animate);
}

// ============ INITIALIZATION ============
function init() {
    resizeCanvas();
    setupEventListeners();
    animate();
    
    window.addEventListener('resize', () => resizeCanvas());
    window.addEventListener('orientationchange', () => setTimeout(resizeCanvas, 100));
}

// Start game
init();

console.log('🎮 Game Started dengan Asset:');
console.log('📁 bg_sky.png');
console.log('📁 bg_mountains.png');
console.log('📁 bg_trees.png');
console.log('📁 bg_ground.png');
console.log('📁 shadow_dog.png');