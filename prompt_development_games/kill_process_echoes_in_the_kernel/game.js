document.addEventListener('DOMContentLoaded', () => {
    const output = document.getElementById('output');
    const input = document.getElementById('input');
    const prompt = document.getElementById('prompt');
    const terminal = document.getElementById('terminal');

    let history = [];
    let historyIndex = -1;

    const fileSystem = {
        "ROOT": {
            "1995_CHILDHOOD": ["birthday_cake.mem", "swing_set.mem", "fear_of_dark.log"],
            "2010_ROMANCE": ["first_kiss.mem", "breakup_letter.txt", "the_rain_stop.mem"],
            "2023_PRESENT": ["office_keycard.bin", "exhaustion.log", "doctors_appointment.txt"]
        }
    };
    
    const memories = {
        "1995_CHILDHOOD": "You remember the waxy taste of a birthday cake, the dizzying height of a swing set, the irrational fear of the dark. It fades.",
        "2010_ROMANCE": "A nervous first kiss under the rain. The crisp fold of a breakup letter. The memory is corrupted... then gone.",
        "2023_PRESENT": "The smooth plastic of an office keycard. A profound, bone-deep exhaustion. The sterile smell of a doctor's office. You let it go."
    };

    let currentPath = ["ROOT"];
    let systemStrain = 0.2;
    let gameActive = true;

    const welcomeMessage = `
System Initializing...
Memory Integrity Scan Complete.
Warning: System Strain levels critical.
Foreign processes detected. Memory leaks imminent.
Objective: Purge corrupted data to restore stability.
Type 'ls' to view directories.
Type 'cd [directory]' to navigate.
Type 'rm -rf [directory]' to purge.
`;

    function corruptText(text, strain) {
        if (strain < 0.7) return text;
        const corruptionRate = (strain - 0.7) / 3;
        let corrupted = '';
        for (const char of text) {
            if (Math.random() < corruptionRate && char !== ' ' && char !== '\n') {
                corrupted += '#!@$%^&*()'[Math.floor(Math.random() * 12)];
            } else {
                corrupted += char;
            }
        }
        return corrupted;
    }

    function print(message) {
        const p = document.createElement('p');
        p.textContent = corruptText(message, systemStrain);
        output.appendChild(p);
        terminal.scrollTop = terminal.scrollHeight;
    }

    function getCurrentDirectory() {
        let current = fileSystem;
        for (const dir of currentPath) {
            if (current && current[dir]) {
                current = current[dir];
            } else {
                return null;
            }
        }
        return current;
    }
    
    function handleCommand(command) {
        history.push(command);
        historyIndex = history.length;
        print(`${prompt.textContent} ${command}`);
        const parts = command.trim().split(' ');
        const cmd = parts[0];
        const arg = parts.slice(1).join(' ');

        switch (cmd) {
            case 'ls':
                const currentDirLs = getCurrentDirectory();
                if (currentDirLs) {
                    if (typeof currentDirLs === 'object') {
                        print(Object.keys(currentDirLs).join('\n'));
                    } else {
                        print(currentDirLs.join('\n'));
                    }
                }
                break;
            case 'cd':
                if (arg) {
                    if (arg === '..') {
                        if (currentPath.length > 1) {
                            currentPath.pop();
                        }
                    } else {
                        const currentDirCd = getCurrentDirectory();
                        if (typeof currentDirCd === 'object' && currentDirCd.hasOwnProperty(arg)) {
                            currentPath.push(arg);
                        } else {
                            print(`cd: no such directory: ${arg}`);
                        }
                    }
                }
                prompt.textContent = `${currentPath.join('/')}>`;
                break;
            case 'rm':
                const rm_parts = arg.split(' ');
                if (rm_parts.length === 2 && rm_parts[0] === '-rf') {
                    const target = rm_parts[1];
                    const currentDirRm = getCurrentDirectory();
                    if (currentPath.length > 1) { // Prevent deleting from within a memory folder
                        print("Error: Cannot purge from within a memory sector. Return to ROOT.");
                        break;
                    }
                    if (typeof currentDirRm === 'object' && currentDirRm.hasOwnProperty(target)) {
                        if (memories[target]) {
                            print(`Purging ${target}...`);
                            print(memories[target]);
                            delete memories[target];
                        }
                        delete currentDirRm[target];
                        systemStrain -= 0.4;
                        if (systemStrain < 0) systemStrain = 0;
                        print(`\nSector Purged. Pressure Dropping...`);
                    } else {
                        print(`rm: cannot remove '${target}': No such directory`);
                    }
                } else {
                    print(`Usage: rm -rf [directory]`);
                }
                break;
            default:
                print(`Unknown command: ${cmd}`);
        }
    }

    function countFiles(directory) {
        let count = 0;
        for (const key in directory) {
            if (Array.isArray(directory[key])) {
                count += directory[key].length;
            } else if (typeof directory[key] === 'object') {
                count += countFiles(directory[key]);
            }
        }
        return count;
    }

    function gameLoop() {
        if (!gameActive) return;

        const leakRate = countFiles(fileSystem) * 0.00015; // Reduced leak rate
        systemStrain += leakRate;

        if (systemStrain >= 1.0) {
            endGame("SYSTEM_HALTED: I d entity   l o s t.");
            return;
        }
        
        const root = fileSystem["ROOT"];
        if (Object.keys(root).length === 0) {
            endGame(null); // Success ending
            return;
        }

        if (systemStrain > 0.6) {
            terminal.style.color = '#0C0';
            terminal.classList.add('flicker');
        } else if (systemStrain > 0.3) {
            terminal.style.color = '#0E0';
        }
        else {
            terminal.style.color = '#0F0';
            terminal.classList.remove('flicker');
        }
        
        setTimeout(gameLoop, 150); // Slowed down game loop
    }

    function endGame(message) {
        gameActive = false;
        input.disabled = true;
        output.innerHTML = ''; // Clear the screen

        if (message) { // Loss condition
            const p = document.createElement('p');
            p.textContent = corruptText(message, 1.0);
            p.style.fontSize = '2em';
            p.style.textAlign = 'center';
            p.style.marginTop = '40vh';
            output.appendChild(p);
        } else { // Win condition
            prompt.textContent = '>';
            input.disabled = false;
            input.focus();
             // The only thing left is a blinking cursor.
        }
    }

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && gameActive) {
            const command = input.value;
            handleCommand(command);
            input.value = '';
        } else if (e.key === 'ArrowUp' && gameActive) {
            if (historyIndex > 0) {
                historyIndex--;
                input.value = history[historyIndex];
            }
        } else if (e.key === 'ArrowDown' && gameActive) {
            if (historyIndex < history.length - 1) {
                historyIndex++;
                input.value = history[historyIndex];
            } else {
                historyIndex = history.length;
                input.value = '';
            }
        }
    });

    print(welcomeMessage);
    gameLoop();
});

