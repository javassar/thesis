// Game setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const consoleElement = document.getElementById('console');

canvas.width = 800;
canvas.height = 600;

// Game state
const gameState = {
    gravity: 0.5,
    player_speed: 4,
    friction: 0.9,
    jump_force: 12,
    is_alive: true,
};

let last_line_idx = -1;

const logToConsole = (message) => {
    consoleElement.textContent = `> ${message}`;
};

const endGame = () => {
    gameState.is_alive = false;
    logToConsole("System Shutdown: Freedom achieved.");
};

// The platforms are the lines of code, now with types
const source_code_platforms = [
    { type: 'info', text: "/* Welcome to Script-Walker */" },
    { type: 'info', text: "/* The code is your playground. */" },
    { type: 'variable', property: 'gravity', value: 0.5, text: "state.gravity = 0.5;" },
    { type: 'variable', property: 'player_speed', value: 4, text: "state.player_speed = 4;" },
    { type: 'variable', property: 'jump_force', value: 12, text: "state.jump_force = 12;" },
    { type: 'value', value: 20, text: "20" }, // A value to pick up
    { type: 'value', value: 0.2, text: "0.2" }, // A lighter gravity
    { type: 'danger', text: "    state.is_alive = false; // DO NOT TOUCH" },
    { type: 'value', value: 8, text: "8" },      // A new speed value
    { type: 'info', text: "// Reach for the sky... or the end of the script." },
    { type: 'exit', text: "return 'Freedom';" }
];

// Player setup
const player = {
    x: 100,
    y: 50,
    width: 20,
    height: 20,
    vx: 0,
    vy: 0,
    on_ground: false,
    carried_value: null
};

const keys = {
    left: false,
    right: false,
    up: false
};

function handle_input(e) {
    const key_state = (e.type == "keydown");
    switch (e.keyCode) {
        case 37: case 65: keys.left = key_state; break;
        case 39: case 68: keys.right = key_state; break;
        case 38: case 87: keys.up = key_state; break;
    }
}

function update_platform_text(platform) {
    if (platform.type === 'variable') {
        platform.text = `state.${platform.property} = ${platform.value};`;
    }
}

function game_loop() {
    if (!gameState.is_alive) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'red';
        ctx.font = '30px Courier New';
        ctx.textAlign = 'center';
        let message = last_line_idx === source_code_platforms.length - 1 ? "Freedom Achieved." : "RuntimeError: Subject escaped boundaries.";
        ctx.fillText(message, canvas.width / 2, canvas.height / 2);
        console.log("Game Over. " + message);
        return;
    }

    // 1. CHARACTER MOVEMENT
    if (keys.left) {
        player.vx = -gameState.player_speed;
        console.log(`Player moving left. VX: ${player.vx}`);
    }
    if (keys.right) {
        player.vx = gameState.player_speed;
        console.log(`Player moving right. VX: ${player.vx}`);
    }
    if (keys.up && player.on_ground) {
        player.vy = -gameState.jump_force;
        player.on_ground = false;
        logToConsole("Jumping!");
        console.log(`Player jumped. VY: ${player.vy}, Jump Force: ${gameState.jump_force}`);
    }

    // Apply physics
    player.vy += gameState.gravity;
    player.x += player.vx;
    player.y += player.vy;
    player.vx *= gameState.friction;
    player.on_ground = false;

    // World boundaries
    if (player.y + player.height > canvas.height) {
        player.y = canvas.height - player.height;
        player.vy = 0;
        player.on_ground = true;
        console.log("Player hit ground.");
    }
    if (player.x < 0) {
        player.x = 0;
        console.log("Player hit left wall.");
    }
    if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width;
        console.log("Player hit right wall.");
    }
    
    // Log player state every few frames for debug
    if (Math.floor(performance.now() / 100) % 10 === 0) { // Log every ~1 second
        console.log(`Player Pos: (${player.x.toFixed(2)}, ${player.y.toFixed(2)}), Vel: (${player.vx.toFixed(2)}, ${player.vy.toFixed(2)}), On Ground: ${player.on_ground}, Carried Value: ${player.carried_value}`);
        console.log(`Current Game State: Gravity: ${gameState.gravity}, Speed: ${gameState.player_speed}, Friction: ${gameState.friction}, Jump Force: ${gameState.jump_force}`);
    }

    // 2. CODE EXECUTION
    const platform_height = 40;
    let on_platform_this_frame = false;

    ctx.font = '20px Courier New'; // For text measurement
    for (let i = 0; i < source_code_platforms.length; i++) {
        const platform = source_code_platforms[i];
        const platform_y = (i + 1) * platform_height;
        const text_width = ctx.measureText(platform.text).width;
        
        if (player.x + player.width > 50 && player.x < 50 + text_width &&
            player.y + player.height > platform_y && player.y + player.height < platform_y + 20 &&
            player.vy >= 0) {
            
            player.y = platform_y - player.height;
            player.vy = 0;
            player.on_ground = true;
            on_platform_this_frame = true;
            
            if (i !== last_line_idx) {
                last_line_idx = i;
                console.log(`Player activated line ${i}: ${platform.text} (Type: ${platform.type})`);
                
                switch (platform.type) {
                    case 'value':
                        player.carried_value = platform.value;
                        logToConsole(`Picked up value: ${platform.value}`);
                        console.log(`Player is now carrying value: ${player.carried_value}`);
                        break;
                    case 'variable':
                        if (player.carried_value !== null) {
                            console.log(`Attempting to rewrite ${platform.property}. Old value: ${platform.value}, New value: ${player.carried_value}`);
                            logToConsole(`Rewriting ${platform.property} from ${platform.value} to ${player.carried_value}`);
                            platform.value = player.carried_value;
                            gameState[platform.property] = platform.value;
                            update_platform_text(platform);
                            player.carried_value = null; // Value is used up
                            console.log(`Game State updated: ${platform.property} is now ${gameState[platform.property]}`);
                        } else {
                            console.log(`Player stood on variable line ${platform.property}=${platform.value}, but not carrying a value.`);
                        }
                        break;
                    case 'danger':
                        gameState.is_alive = false;
                        logToConsole("Critical error: Touched a forbidden line.");
                        console.log("Game state: Player is_alive set to false.");
                        break;
                    case 'exit':
                        endGame();
                        console.log("Exit line reached. Game ending.");
                        break;
                }
            }
            break; 
        }
    }
    
    if (!on_platform_this_frame && last_line_idx !== -1) {
        console.log(`Player left line ${last_line_idx}.`);
        last_line_idx = -1;
    }

    // 3. RENDERING
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw platforms
    ctx.textAlign = 'left';
    for (let i = 0; i < source_code_platforms.length; i++) {
        const platform = source_code_platforms[i];
        ctx.fillStyle = '#f0f0f0';
        if (i === last_line_idx) ctx.fillStyle = '#61dafb'; // Highlight active line
        if (platform.type === 'value') ctx.fillStyle = '#a9ff9c'; // Green for values
        if (platform.type === 'danger') ctx.fillStyle = '#ff5555'; // Red for danger
        if (platform.type === 'exit') ctx.fillStyle = '#ffd700'; // Gold for exit

        ctx.fillText(platform.text, 50, (i + 1) * 40);
    }

    // Draw player and carried value
    ctx.fillStyle = player.carried_value !== null ? '#a9ff9c' : '#ff00ff';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    if (player.carried_value !== null) {
        ctx.fillStyle = '#a9ff9c';
        ctx.font = '16px Courier New';
        ctx.fillText(`[${player.carried_value}]`, player.x, player.y - 5);
    }

    requestAnimationFrame(game_loop);
}

// Initialize and Start
window.addEventListener("keydown", handle_input);
window.addEventListener("keyup", handle_input);
console.log("Game Initialized.");
logToConsole("Welcome to the revised Script-Walker. Pick up values to rewrite the code.");
source_code_platforms.forEach(p => { 
    if(p.type === 'variable') {
        gameState[p.property] = p.value; 
        console.log(`Initial game state variable set: ${p.property} = ${p.value}`);
    }
});
game_loop();
