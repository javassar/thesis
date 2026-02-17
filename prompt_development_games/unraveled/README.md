# Script-Walker (Revised)

This is a revised version of Script-Walker, designed to be a more creative and interactive experience.

## How to Play

The goal is still to reach the end of the script, but now you must rewrite the code to do so.

1.  **Open the `index.html` file in a web browser.**
2.  **Controls:**
    *   `A` and `D` or `Arrow Keys` to move left and right.
    *   `W` or `Up Arrow Key` to jump.

### New Mechanics: Code Rewriting

*   **Value Platforms (Green):** These platforms are numbers (e.g., `20`, `0.2`). Jump on them to **pick up** a value. You will see the value you are carrying above your character.
*   **Variable Platforms (White):** These are lines of code that define a game variable (e.g., `state.jump_force = 12;`). If you jump on one of these platforms while **carrying a value**, you will **rewrite** that line of code with your value.
*   **Using Values:** The value is "used up" once you rewrite a line of code. You must pick up another value to perform another rewrite.
*   **Puzzle Solving:** You will need to find the right values and use them to change the game's physics to overcome obstacles. Can't jump high enough? Find a bigger `jump_force` value!

### Platform Types

-   **White:** Writable game variables.
-   **Green:** Values you can pick up.
-   **Blue (Highlighted):** The line of code you are currently standing on.
-   **Red:** Dangerous code! Avoid it.
-   **Gold:** The exit. Reach it to win.

Good luck, Script-Walker. The code is in your hands now.