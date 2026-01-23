#!/usr/bin/env python3
"""
DEBUG VERSION - Shows movement debug info on screen
"""

# Import everything from main
from main import *

# Override the Game class to add debug info
class DebugGame(Game):
    def __init__(self):
        super().__init__()
        self.last_dx = 0
        self.last_dy = 0
        self.keys_info = "No keys pressed"

    def handle_input(self):
        keys = pygame.key.get_pressed()

        # Track which keys are pressed
        pressed_keys = []
        if keys[pygame.K_w] or keys[pygame.K_UP]:
            pressed_keys.append("UP")
        if keys[pygame.K_s] or keys[pygame.K_DOWN]:
            pressed_keys.append("DOWN")
        if keys[pygame.K_a] or keys[pygame.K_LEFT]:
            pressed_keys.append("LEFT")
        if keys[pygame.K_d] or keys[pygame.K_RIGHT]:
            pressed_keys.append("RIGHT")

        self.keys_info = ", ".join(pressed_keys) if pressed_keys else "No keys pressed"

        # Allow movement during playing (when not in journal or message board)
        if self.state == GameState.PLAYING and not self.journal.visible and not self.message_board.active:
            dx = keys[pygame.K_RIGHT] - keys[pygame.K_LEFT] + keys[pygame.K_d] - keys[pygame.K_a]
            dy = keys[pygame.K_DOWN] - keys[pygame.K_UP] + keys[pygame.K_s] - keys[pygame.K_w]

            self.last_dx = dx
            self.last_dy = dy

            if dx != 0 or dy != 0:
                old_x, old_y = self.player.x, self.player.y
                self.player.move(dx, dy, self.objects, self.npcs)
                if old_x != self.player.x or old_y != self.player.y:
                    print(f"Moved from ({old_x}, {old_y}) to ({self.player.x}, {self.player.y})")
                else:
                    print(f"Movement blocked at ({old_x}, {old_y})")
                self.show_movement_hint = False

        # Allow movement during intro (even with dialogue active)
        if self.state == GameState.INTRO:
            dx = keys[pygame.K_RIGHT] - keys[pygame.K_LEFT] + keys[pygame.K_d] - keys[pygame.K_a]
            dy = keys[pygame.K_DOWN] - keys[pygame.K_UP] + keys[pygame.K_s] - keys[pygame.K_w]

            self.last_dx = dx
            self.last_dy = dy

            if dx != 0 or dy != 0:
                old_x, old_y = self.player.x, self.player.y
                self.player.move(dx, dy, self.objects, self.npcs)
                if old_x != self.player.x or old_y != self.player.y:
                    print(f"Moved from ({old_x}, {old_y}) to ({self.player.x}, {self.player.y})")
                else:
                    print(f"Movement blocked at ({old_x}, {old_y})")
                self.show_movement_hint = False

    def run(self):
        running = True

        while running:
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    running = False

                if event.type == pygame.KEYDOWN:
                    if event.key == pygame.K_ESCAPE:
                        running = False

                    # Dialogue controls
                    if event.key == pygame.K_SPACE:
                        if self.dialogue.active:
                            if self.dialogue.char_index >= len(self.dialogue.text):
                                self.dialogue.close()
                            else:
                                self.dialogue.displayed_text = self.dialogue.text
                                self.dialogue.char_index = len(self.dialogue.text)
                        elif self.state == GameState.PLAYING:
                            self.check_interactions()

                    if event.key == pygame.K_e and self.state == GameState.PLAYING:
                        if not self.dialogue.active:
                            self.check_interactions()

                    if event.key == pygame.K_TAB and self.state == GameState.PLAYING:
                        if not self.dialogue.active and not self.message_board.active:
                            self.journal.toggle()

                    if self.message_board.active:
                        self.message_board.handle_key(event)

            # Update
            if self.state == GameState.INTRO:
                self.update_intro()
            elif self.state == GameState.PLAYING:
                self.check_time_events()
                if self.get_time_remaining() <= 0:
                    self.start_end_sequence()
            elif self.state == GameState.ENDING:
                self.update_ending()

            self.dialogue.update()
            self.handle_input()

            # Draw
            if self.state == GameState.CREDITS:
                self.draw_credits()
            else:
                self.draw_world()

                if self.state == GameState.ENDING:
                    self.draw_ending()

                if self.state == GameState.PLAYING or self.state == GameState.INTRO:
                    self.draw_timer()

                self.dialogue.draw(self.screen)
                self.journal.draw(self.screen)
                self.message_board.draw_input(self.screen)

                # Instructions with background
                if (self.state == GameState.PLAYING or self.state == GameState.INTRO) and not self.dialogue.active and not self.journal.visible:
                    inst_text = "WASD/Arrows: Move | SPACE/E: Interact | TAB: Thoughts"
                    inst = self.small_font.render(inst_text, True, WHITE)

                    inst_bg = pygame.Surface((inst.get_width() + 20, 30))
                    inst_bg.set_alpha(220)
                    inst_bg.fill(BLACK)
                    self.screen.blit(inst_bg, (5, SCREEN_HEIGHT - 35))

                    pygame.draw.rect(self.screen, WHITE, (5, SCREEN_HEIGHT - 35, inst.get_width() + 20, 30), 1)
                    self.screen.blit(inst, (15, SCREEN_HEIGHT - 30))

                # Show movement hint near player
                if self.show_movement_hint and (self.state == GameState.INTRO or self.state == GameState.PLAYING):
                    import math
                    bounce = abs(math.sin(time.time() * 3)) * 10
                    hint_font = pygame.font.Font(None, 28)
                    hint = hint_font.render("Try moving!", True, PLAYER_COLOR)
                    hint_bg = pygame.Surface((hint.get_width() + 10, hint.get_height() + 6))
                    hint_bg.set_alpha(200)
                    hint_bg.fill(BLACK)

                    hint_x = self.player.x + self.player.width // 2 - hint.get_width() // 2
                    hint_y = self.player.y - 60 - int(bounce)

                    self.screen.blit(hint_bg, (hint_x - 5, hint_y - 3))
                    pygame.draw.rect(self.screen, PLAYER_COLOR, (hint_x - 5, hint_y - 3, hint.get_width() + 10, hint.get_height() + 6), 2)
                    self.screen.blit(hint, (hint_x, hint_y))

                # DEBUG INFO
                debug_font = pygame.font.Font(None, 20)
                debug_info = [
                    f"State: {self.state.name}",
                    f"Keys: {self.keys_info}",
                    f"Movement: dx={self.last_dx}, dy={self.last_dy}",
                    f"Player Pos: ({int(self.player.x)}, {int(self.player.y)})",
                    f"Dialogue: {self.dialogue.active}",
                ]

                y_offset = 10
                for info in debug_info:
                    debug_surf = debug_font.render(info, True, (255, 255, 0))
                    debug_bg = pygame.Surface((debug_surf.get_width() + 4, debug_surf.get_height() + 2))
                    debug_bg.set_alpha(200)
                    debug_bg.fill(BLACK)
                    self.screen.blit(debug_bg, (SCREEN_WIDTH - debug_surf.get_width() - 12, y_offset - 1))
                    self.screen.blit(debug_surf, (SCREEN_WIDTH - debug_surf.get_width() - 10, y_offset))
                    y_offset += 22

            pygame.display.flip()
            self.clock.tick(FPS)

        pygame.quit()
        sys.exit()

if __name__ == "__main__":
    print("=== DEBUG MODE ===")
    print("Movement info will be shown in yellow on the right side")
    print("Console will print movement messages")
    print("==================")
    game = DebugGame()
    game.run()
