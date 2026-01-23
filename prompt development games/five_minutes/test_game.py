#!/usr/bin/env python3
"""
Quick test to verify the game initializes without errors
"""

import os
os.environ['SDL_VIDEODRIVER'] = 'dummy'  # Run without display

import pygame
import sys

# Import the game
from main import Game

def test_initialization():
    """Test that the game initializes without errors"""
    print("Testing game initialization...")

    try:
        game = Game()
        print("✓ Game object created successfully")

        # Check key components
        assert game.player is not None, "Player not initialized"
        print("✓ Player initialized")

        assert len(game.npcs) > 0, "No NPCs created"
        print(f"✓ {len(game.npcs)} NPCs created")

        assert len(game.objects) > 0, "No objects created"
        print(f"✓ {len(game.objects)} objects created")

        assert game.dialogue is not None, "Dialogue system not initialized"
        print("✓ Dialogue system initialized")

        assert game.journal is not None, "Journal not initialized"
        print("✓ Journal initialized")

        assert game.message_board is not None, "Message board not initialized"
        print("✓ Message board initialized")

        # Check timer
        time_remaining = game.get_time_remaining()
        assert time_remaining == 300, f"Timer not set correctly: {time_remaining}"
        print(f"✓ Timer initialized to {time_remaining} seconds")

        # Test NPC dialogues
        for npc in game.npcs:
            assert len(npc.dialogues) == 3, f"{npc.name} doesn't have 3 dialogues"
        print("✓ All NPCs have 3-tier dialogues")

        print("\n✅ All tests passed! Game is ready to run.")
        return True

    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

    finally:
        pygame.quit()

if __name__ == "__main__":
    success = test_initialization()
    sys.exit(0 if success else 1)
