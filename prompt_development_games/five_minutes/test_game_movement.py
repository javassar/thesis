#!/usr/bin/env python3
"""
Test to verify movement works in the actual game
"""

import os
os.environ['SDL_VIDEODRIVER'] = 'dummy'  # Run without display

import pygame
import sys
import time

# Import the game
from main import Game, GameState

def test_movement():
    """Test that movement actually works"""
    print("Testing game movement system...")

    try:
        game = Game()
        print("✓ Game initialized")

        # Store initial position
        initial_x = game.player.x
        initial_y = game.player.y
        print(f"  Initial position: ({initial_x}, {initial_y})")

        # Simulate pressing W key (move up)
        class FakeKeys:
            def __getitem__(self, key):
                if key == pygame.K_w:
                    return True
                return False

        # Save original get_pressed
        original_get_pressed = pygame.key.get_pressed

        # Replace with fake keys
        pygame.key.get_pressed = lambda: FakeKeys()

        # Call handle_input
        game.handle_input()

        # Restore original
        pygame.key.get_pressed = original_get_pressed

        # Check if player moved
        if game.player.y < initial_y:
            print(f"✓ Movement works! New position: ({game.player.x}, {game.player.y})")
            print(f"  Player moved {initial_y - game.player.y} pixels up")
            return True
        else:
            print(f"✗ Movement failed! Position unchanged: ({game.player.x}, {game.player.y})")
            print(f"  Game state: {game.state}")
            print(f"  Dialogue active: {game.dialogue.active}")
            print(f"  Journal visible: {game.journal.visible}")
            print(f"  Message board active: {game.message_board.active}")
            return False

    except Exception as e:
        print(f"✗ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        pygame.quit()

if __name__ == "__main__":
    success = test_movement()

    if success:
        print("\n✅ Movement test PASSED")
        sys.exit(0)
    else:
        print("\n❌ Movement test FAILED - investigating...")
        print("\nDEBUG: The movement code expects:")
        print("1. Game state to be INTRO or PLAYING")
        print("2. Keys to be pressed (WASD or arrows)")
        print("3. Player.move() to actually update position")
        sys.exit(1)
