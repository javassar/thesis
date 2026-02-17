# MIST

A game about clearing the way for a traveler.

## How to Play

1.  Open the `index.html` file in a web browser. It is recommended to use a simple web server to avoid potential issues with browser security policies regarding local files. For example, you can use Python's built-in server: `python -m http.server`.
2.  Hold down the left mouse button and move the mouse to wipe away the mist.
3.  Clear a path for the small, white traveler.
4.  The traveler will move forward into cleared areas and wait if the path is obscured by mist.
5.  Wiping the mist depletes your stamina. If you run out, you must wait for it to regenerate.
6.  The goal is to help the traveler reach the right edge of the screen.

## Implementation Notes

- This game was created using Phaser 3.
- The assets (background, traveler) are procedurally generated as placeholder graphics within the code, as the original asset files were not available.
- The core mechanic is implemented using a `RenderTexture` for the mist and the `snapshotPixel` method to check the mist's transparency, which determines the traveler's movement.
