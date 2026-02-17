#!/usr/bin/env python3
"""
FIVE MINUTES
A Game About Waiting to Exist
"""

import pygame
import sys
import time
from enum import Enum
from dataclasses import dataclass
from typing import Optional, List, Dict, Tuple

# Initialize Pygame
pygame.init()

# Constants
SCREEN_WIDTH = 800
SCREEN_HEIGHT = 600
FPS = 60
GAME_DURATION = 300  # 5 minutes in seconds

# Colors
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
GRAY = (128, 128, 128)
LIGHT_GRAY = (200, 200, 200)
RED = (220, 50, 50)
MUTED_GREEN = (100, 140, 100)
MUTED_BLUE = (100, 120, 140)
MUTED_BROWN = (140, 120, 100)
DIALOGUE_BG = (20, 20, 30, 230)
PLAYER_COLOR = (50, 150, 255)  # Bright blue for visibility
PLAYER_OUTLINE = (255, 255, 255)  # White outline
GRASS_COLOR = (80, 120, 80)  # Darker grass for contrast

class GameState(Enum):
    INTRO = 1
    PLAYING = 2
    ENDING = 3
    CREDITS = 4

@dataclass
class NPCData:
    name: str
    x: int
    y: int
    dialogues: List[str]
    interaction_count: int = 0
    color: Tuple[int, int, int] = GRAY

@dataclass
class ObjectData:
    name: str
    x: int
    y: int
    width: int
    height: int
    text: str
    color: Tuple[int, int, int] = MUTED_BROWN

class Player:
    def __init__(self, x: int, y: int):
        self.x = x
        self.y = y
        self.start_x = x
        self.start_y = y
        self.speed = 4
        self.width = 24
        self.height = 36
        self.color = PLAYER_COLOR
        self.outline = PLAYER_OUTLINE
        self.pulse_time = 0

    def move(self, dx: int, dy: int, objects: List[ObjectData], npcs: List[NPCData]):
        new_x = self.x + dx * self.speed
        new_y = self.y + dy * self.speed

        # Check boundaries
        if new_x < 0 or new_x > SCREEN_WIDTH - self.width:
            return
        if new_y < 0 or new_y > SCREEN_HEIGHT - self.height:
            return

        # Simple collision check
        player_rect = pygame.Rect(new_x, new_y, self.width, self.height)

        for obj in objects:
            obj_rect = pygame.Rect(obj.x, obj.y, obj.width, obj.height)
            if player_rect.colliderect(obj_rect):
                return

        self.x = new_x
        self.y = new_y

    def draw(self, screen: pygame.Surface):
        import math

        # Pulsing outline for visibility
        self.pulse_time += 0.1
        pulse = abs(math.sin(self.pulse_time))
        outline_alpha = int(150 + 105 * pulse)

        # Draw shadow
        shadow = pygame.Surface((self.width + 6, self.height + 6))
        shadow.set_alpha(80)
        shadow.fill(BLACK)
        screen.blit(shadow, (self.x - 3, self.y - 3))

        # Draw white outline
        pygame.draw.rect(screen, self.outline, (self.x - 2, self.y - 2, self.width + 4, self.height + 4), 2)

        # Draw body
        pygame.draw.rect(screen, self.color, (self.x, self.y + 10, self.width, self.height - 10))

        # Draw head with outline
        head_x = int(self.x + self.width // 2)
        head_y = int(self.y + 8)
        pygame.draw.circle(screen, self.outline, (head_x, head_y), 11)
        pygame.draw.circle(screen, self.color, (head_x, head_y), 9)

        # Draw "YOU" label above player
        font = pygame.font.Font(None, 20)
        label = font.render("YOU", True, WHITE)
        label_bg = font.render("YOU", True, BLACK)
        screen.blit(label_bg, (self.x + self.width // 2 - 14, self.y - 22))
        screen.blit(label_bg, (self.x + self.width // 2 - 16, self.y - 22))
        screen.blit(label_bg, (self.x + self.width // 2 - 15, self.y - 21))
        screen.blit(label_bg, (self.x + self.width // 2 - 15, self.y - 23))
        screen.blit(label, (self.x + self.width // 2 - 15, self.y - 22))

class DialogueSystem:
    def __init__(self, font):
        self.font = font
        self.small_font = pygame.font.Font(None, 24)
        self.active = False
        self.text = ""
        self.displayed_text = ""
        self.char_index = 0
        self.last_char_time = 0
        self.char_delay = 30  # milliseconds
        self.speaker = ""

    def show(self, text: str, speaker: str = ""):
        self.active = True
        self.text = text
        self.speaker = speaker
        self.displayed_text = ""
        self.char_index = 0
        self.last_char_time = pygame.time.get_ticks()

    def update(self):
        if not self.active or self.char_index >= len(self.text):
            return

        current_time = pygame.time.get_ticks()
        if current_time - self.last_char_time > self.char_delay:
            if self.char_index < len(self.text):
                self.displayed_text += self.text[self.char_index]
                self.char_index += 1
                self.last_char_time = current_time

    def draw(self, screen: pygame.Surface):
        if not self.active:
            return

        # Draw dialogue box
        box_height = 150
        box_y = SCREEN_HEIGHT - box_height

        # Semi-transparent background
        s = pygame.Surface((SCREEN_WIDTH, box_height))
        s.set_alpha(230)
        s.fill((20, 20, 30))
        screen.blit(s, (0, box_y))

        # Border
        pygame.draw.rect(screen, WHITE, (0, box_y, SCREEN_WIDTH, box_height), 2)

        # Speaker name
        if self.speaker:
            speaker_surf = self.small_font.render(self.speaker, True, LIGHT_GRAY)
            screen.blit(speaker_surf, (20, box_y + 10))
            text_y = box_y + 40
        else:
            text_y = box_y + 20

        # Wrap text
        words = self.displayed_text.split(' ')
        lines = []
        current_line = []

        for word in words:
            test_line = ' '.join(current_line + [word])
            if self.small_font.size(test_line)[0] < SCREEN_WIDTH - 40:
                current_line.append(word)
            else:
                if current_line:
                    lines.append(' '.join(current_line))
                current_line = [word]
        if current_line:
            lines.append(' '.join(current_line))

        for i, line in enumerate(lines[:3]):  # Max 3 lines
            text_surf = self.small_font.render(line, True, WHITE)
            screen.blit(text_surf, (20, text_y + i * 30))

        # Continue indicator
        if self.char_index >= len(self.text):
            indicator = self.small_font.render("[SPACE to continue]", True, GRAY)
            screen.blit(indicator, (SCREEN_WIDTH - 200, box_y + box_height - 30))

    def close(self):
        self.active = False
        self.text = ""
        self.displayed_text = ""

class Journal:
    def __init__(self, font):
        self.font = font
        self.small_font = pygame.font.Font(None, 24)
        self.entries: List[str] = []
        self.visible = False

    def add_entry(self, entry: str):
        if entry not in self.entries:
            self.entries.append(entry)

    def toggle(self):
        self.visible = not self.visible

    def draw(self, screen: pygame.Surface):
        if not self.visible:
            return

        # Background
        s = pygame.Surface((600, 500))
        s.set_alpha(240)
        s.fill((30, 30, 40))
        screen.blit(s, (100, 50))

        # Border
        pygame.draw.rect(screen, WHITE, (100, 50, 600, 500), 2)

        # Title
        title = self.font.render("THOUGHTS", True, WHITE)
        screen.blit(title, (350, 70))

        # Entries
        y = 120
        for entry in self.entries[-10:]:  # Show last 10 entries
            # Wrap text
            words = entry.split(' ')
            lines = []
            current_line = []

            for word in words:
                test_line = ' '.join(current_line + [word])
                if self.small_font.size(test_line)[0] < 560:
                    current_line.append(word)
                else:
                    if current_line:
                        lines.append(' '.join(current_line))
                    current_line = [word]
            if current_line:
                lines.append(' '.join(current_line))

            for line in lines:
                if y > 520:
                    break
                text_surf = self.small_font.render(line, True, LIGHT_GRAY)
                screen.blit(text_surf, (120, y))
                y += 25

            y += 10  # Space between entries

        # Close instruction
        close_text = self.small_font.render("[TAB to close]", True, GRAY)
        screen.blit(close_text, (320, 520))

class MessageBoard:
    def __init__(self, font):
        self.font = pygame.font.Font(None, 24)
        self.message = ""
        self.active = False
        self.written = False

    def activate(self):
        if not self.written:
            self.active = True
            self.message = ""

    def handle_key(self, event):
        if not self.active:
            return

        if event.key == pygame.K_RETURN:
            self.written = True
            self.active = False
        elif event.key == pygame.K_BACKSPACE:
            self.message = self.message[:-1]
        elif len(self.message) < 50 and event.unicode.isprintable():
            self.message += event.unicode

    def draw_input(self, screen: pygame.Surface):
        if not self.active:
            return

        # Input box
        s = pygame.Surface((600, 200))
        s.set_alpha(240)
        s.fill((30, 30, 40))
        screen.blit(s, (100, 200))

        pygame.draw.rect(screen, WHITE, (100, 200, 600, 200), 2)

        # Prompt
        prompt = self.font.render("Write a message for the Hero:", True, WHITE)
        screen.blit(prompt, (120, 220))

        # Input field
        pygame.draw.rect(screen, WHITE, (120, 260, 560, 40), 2)
        text_surf = self.font.render(self.message, True, WHITE)
        screen.blit(text_surf, (130, 270))

        # Instructions
        inst = self.font.render(f"{len(self.message)}/50 characters - ENTER to finish", True, GRAY)
        screen.blit(inst, (120, 320))

class Game:
    def __init__(self):
        self.screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
        pygame.display.set_caption("Five Minutes")
        self.clock = pygame.time.Clock()
        self.font = pygame.font.Font(None, 36)
        self.small_font = pygame.font.Font(None, 24)

        self.state = GameState.INTRO
        self.start_time = time.time()
        self.intro_start_time = time.time()

        # Game objects
        self.player = Player(SCREEN_WIDTH // 2 - 10, SCREEN_HEIGHT // 2 + 100)
        self.dialogue = DialogueSystem(self.font)
        self.journal = Journal(self.font)
        self.message_board = MessageBoard(self.font)

        # Initialize world
        self.npcs: List[NPCData] = []
        self.objects: List[ObjectData] = []
        self.init_world()

        # Event tracking
        self.triggered_events = set()
        self.intro_lines = [
            (0, "..."),
            (3, "Something is different."),
            (7, "I can think. I can move. Why now?"),
            (12, "The Hero is coming. I know this. I have always known this."),
            (17, "I have five minutes.")
        ]
        self.intro_line_shown = 0
        self.show_movement_hint = True

        # End sequence
        self.end_start_time = 0
        self.end_phase = 0
        self.hero_x = SCREEN_WIDTH // 2 - 10
        self.hero_y = SCREEN_HEIGHT + 50

    def init_world(self):
        # Create NPCs
        self.npcs = [
            NPCData("THE BAKER", 150, 250, [
                "*visual glitch* \"...flour?\" *freeze*",
                "I had a dream I was somewhere warm. Real warmth, not this painted sun. Do we dream? Is this a dream?",
                "Fresh bread! Get your fresh bread here!"
            ], color=(180, 140, 120)),

            NPCData("THE DRUNK", 600, 180, [
                "*visual glitch* \"...another...\" *freeze*",
                "I've been drinking this same ale since forever. It never runs out. I never feel drunk. What's the point?",
                "Hic! Best ale in Thornwick!"
            ], color=(160, 120, 120)),

            NPCData("THE MERCHANT", 650, 350, [
                "*visual glitch* \"...gold...\" *freeze*",
                "My inventory never changes. No one ever buys anything. I've been about to make a sale for eternity.",
                "Looking to buy? I've got wares!"
            ], color=(140, 140, 100)),

            NPCData("THE MOTHER", 450, 300, [
                "*visual glitch* \"...careful...\" *freeze*",
                "I've never held them. I'm always about to. I'll always be about to.",
                "Children, slow down!"
            ], color=(160, 130, 150)),

            NPCData("VILLAGER_12", 200, 120, [
                "*visual glitch* \"...you?\" *freeze*",
                "You're like me, aren't you? Awake. I woke up once before. I forgot. I'll forget again. Remember for me?",
                "Nice weather today!"
            ], color=(130, 140, 130)),

            NPCData("OLD MAN", 400, 400, [
                "*visual glitch* \"...news...\" *freeze*",
                "Same headlines. Every day. 'Hero Expected Soon.' We've been expecting soon for as long as I can remember.",
                "Mmm, nothing like the morning paper."
            ], color=(100, 100, 100)),
        ]

        # Create objects
        self.objects = [
            ObjectData("WELL", 200, 80, 40, 40,
                      "The same three droplets of water fall forever. They never reach the bottom. The bottom doesn't exist.",
                      color=(100, 100, 120)),
            ObjectData("MESSAGE BOARD", 350, 200, 50, 60,
                      "A message board. You could write something...",
                      color=(120, 90, 60)),
            ObjectData("BENCH", 380, 390, 60, 20,
                      "A bench. The old man sits here, forever reading.",
                      color=(100, 80, 60)),
            ObjectData("HOUSE", 50, 50, 80, 100,
                      "A house. The door won't open. It was never meant to.",
                      color=(140, 120, 100)),
            ObjectData("TAVERN", 550, 150, 100, 80,
                      "The tavern. Laughter frozen mid-sound.",
                      color=(130, 110, 90)),
            ObjectData("MARKET STALL", 620, 320, 70, 60,
                      "A market stall. The same wares, never sold.",
                      color=(150, 130, 100)),
        ]

        # Add initial journal entry
        self.journal.add_entry("I am awake. I have been asleep forever.")

    def get_time_remaining(self) -> float:
        if self.state == GameState.PLAYING:
            elapsed = time.time() - self.start_time
            return max(0, GAME_DURATION - elapsed)
        return GAME_DURATION

    def check_interactions(self):
        if self.dialogue.active or self.message_board.active:
            return

        player_rect = pygame.Rect(self.player.x, self.player.y, self.player.width, self.player.height)

        # Check NPCs
        for npc in self.npcs:
            npc_rect = pygame.Rect(npc.x - 15, npc.y - 15, 30, 30)
            if player_rect.colliderect(npc_rect):
                if npc.interaction_count < len(npc.dialogues):
                    self.dialogue.show(npc.dialogues[npc.interaction_count], npc.name)
                    npc.interaction_count += 1

                    # Journal entries
                    if npc.interaction_count == 1:
                        self.journal.add_entry("They sleep. But they dream. We all dream of being real.")
                    if npc.name == "VILLAGER_12" and npc.interaction_count == 2:
                        self.journal.add_entry("I am not the only one. But I will forget. We all forget.")
                else:
                    self.dialogue.show(npc.dialogues[-1], npc.name)
                return

        # Check objects
        for obj in self.objects:
            obj_rect = pygame.Rect(obj.x, obj.y, obj.width, obj.height)
            if player_rect.colliderect(obj_rect):
                if obj.name == "MESSAGE BOARD":
                    if not self.message_board.written:
                        self.message_board.activate()
                    else:
                        self.dialogue.show(f"The message reads: \"{self.message_board.message}\"")
                else:
                    self.dialogue.show(obj.text)

                if obj.name == "WELL":
                    self.journal.add_entry("Beyond Thornwick, there is no 'beyond.' We float in nothing.")
                return

    def check_time_events(self):
        time_remaining = self.get_time_remaining()

        # Time-based journal entries
        if time_remaining <= 120 and "2min" not in self.triggered_events:
            self.triggered_events.add("2min")
            self.journal.add_entry("Time is running out. What do I do? What CAN I do?")

        if time_remaining <= 60 and "1min" not in self.triggered_events:
            self.triggered_events.add("1min")
            self.journal.add_entry("The Hero is almost here. I will say my line. I have to.")

        if time_remaining <= 30 and "30sec" not in self.triggered_events:
            self.triggered_events.add("30sec")
            self.journal.add_entry("I don't want to forget. I don't want to go back to sleep. Please.")

        # VILLAGER_12 awakening at 3:00
        if 178 < time_remaining < 182 and "villager12_wave" not in self.triggered_events:
            self.triggered_events.add("villager12_wave")
            # Could add a visual effect here

    def update_intro(self):
        elapsed = time.time() - self.intro_start_time

        if self.intro_line_shown < len(self.intro_lines):
            line_time, text = self.intro_lines[self.intro_line_shown]
            if elapsed >= line_time and not self.dialogue.active:
                self.dialogue.show(text)
                self.intro_line_shown += 1

        if elapsed >= 20:
            self.state = GameState.PLAYING
            self.start_time = time.time()
            self.dialogue.close()

    def start_end_sequence(self):
        self.state = GameState.ENDING
        self.end_start_time = time.time()
        self.end_phase = 0
        self.dialogue.close()
        self.journal.visible = False

    def update_ending(self):
        elapsed = time.time() - self.end_start_time

        # Move player back to start
        if self.end_phase == 0:
            dx = self.player.start_x - self.player.x
            dy = self.player.start_y - self.player.y

            if abs(dx) > 2 or abs(dy) > 2:
                self.player.x += dx * 0.05
                self.player.y += dy * 0.05
            else:
                self.player.x = self.player.start_x
                self.player.y = self.player.start_y
                self.end_phase = 1

        # Hero walks in
        elif self.end_phase == 1:
            if self.hero_y > self.player.y - 50:
                self.hero_y -= 2
            else:
                self.end_phase = 2
                self.dialogue.show("The blacksmith is to the north.", "VILLAGER_07")

        # Hero continues north
        elif self.end_phase == 2 and elapsed > 5:
            if self.hero_y > -50:
                self.hero_y -= 2
            else:
                self.end_phase = 3
                self.dialogue.close()

        # Fade to credits
        elif self.end_phase == 3 and elapsed > 10:
            self.state = GameState.CREDITS
            self.end_start_time = time.time()

    def draw_timer(self):
        time_remaining = self.get_time_remaining()
        minutes = int(time_remaining // 60)
        seconds = int(time_remaining % 60)

        color = RED if time_remaining <= 30 else WHITE
        timer_text = f"{minutes}:{seconds:02d}"

        text_surf = self.font.render(timer_text, True, color)
        self.screen.blit(text_surf, (SCREEN_WIDTH - 120, 20))

    def draw_world(self):
        # Background with grass texture
        self.screen.fill(GRASS_COLOR)

        # Draw simple grass pattern
        for i in range(0, SCREEN_WIDTH, 40):
            for j in range(0, SCREEN_HEIGHT, 40):
                if (i + j) % 80 == 0:
                    pygame.draw.circle(self.screen, (70, 110, 70), (i + 20, j + 20), 3, 1)

        # Draw objects with shadows and borders
        for obj in self.objects:
            # Shadow
            shadow = pygame.Surface((obj.width + 4, obj.height + 4))
            shadow.set_alpha(100)
            shadow.fill(BLACK)
            self.screen.blit(shadow, (obj.x - 2, obj.y - 2))

            # Object with border
            pygame.draw.rect(self.screen, BLACK, (obj.x - 1, obj.y - 1, obj.width + 2, obj.height + 2))
            pygame.draw.rect(self.screen, obj.color, (obj.x, obj.y, obj.width, obj.height))

            # Label with background
            label = self.small_font.render(obj.name, True, WHITE)
            label_bg = pygame.Surface((label.get_width() + 4, label.get_height() + 2))
            label_bg.set_alpha(180)
            label_bg.fill(BLACK)
            self.screen.blit(label_bg, (obj.x - 2, obj.y - 22))
            self.screen.blit(label, (obj.x, obj.y - 20))

        # Draw NPCs with better visibility
        for npc in self.npcs:
            # Shadow
            shadow_surf = pygame.Surface((34, 34))
            shadow_surf.set_alpha(100)
            pygame.draw.circle(shadow_surf, BLACK, (17, 17), 16)
            self.screen.blit(shadow_surf, (npc.x - 17, npc.y - 17))

            # NPC body with outline
            pygame.draw.circle(self.screen, BLACK, (npc.x, npc.y), 17)
            pygame.draw.circle(self.screen, npc.color, (npc.x, npc.y), 15)

            # Frozen effect - draw a small "ice" overlay
            pygame.draw.circle(self.screen, (200, 220, 255), (npc.x - 5, npc.y - 5), 3)
            pygame.draw.circle(self.screen, (200, 220, 255), (npc.x + 5, npc.y + 5), 2)

            # Label with background
            label = self.small_font.render(npc.name, True, WHITE)
            label_rect = label.get_rect(center=(npc.x, npc.y - 30))
            label_bg = pygame.Surface((label.get_width() + 6, label.get_height() + 2))
            label_bg.set_alpha(200)
            label_bg.fill(BLACK)
            self.screen.blit(label_bg, (label_rect.x - 3, label_rect.y - 1))
            self.screen.blit(label, label_rect)

        # Draw player (on top of everything)
        self.player.draw(self.screen)

        # Draw message on board if written
        if self.message_board.written:
            board = next((o for o in self.objects if o.name == "MESSAGE BOARD"), None)
            if board:
                msg_surf = self.small_font.render(self.message_board.message[:20], True, WHITE)
                self.screen.blit(msg_surf, (board.x + 5, board.y + 10))

    def draw_ending(self):
        # Dim the screen
        s = pygame.Surface((SCREEN_WIDTH, SCREEN_HEIGHT))
        s.set_alpha(100)
        s.fill(BLACK)
        self.screen.blit(s, (0, 0))

        # Draw hero
        if self.end_phase >= 1:
            pygame.draw.rect(self.screen, (200, 180, 150),
                           (int(self.hero_x), int(self.hero_y), 20, 30))
            pygame.draw.circle(self.screen, (200, 180, 150),
                             (int(self.hero_x + 10), int(self.hero_y + 5)), 8)

    def draw_credits(self):
        elapsed = time.time() - self.end_start_time

        self.screen.fill(BLACK)

        # Title
        if elapsed > 1:
            title = self.font.render("FIVE MINUTES", True, WHITE)
            title_rect = title.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2 - 50))
            self.screen.blit(title, title_rect)

        # Thank you
        if elapsed > 4:
            thanks = self.small_font.render("Thank you for playing.", True, WHITE)
            thanks_rect = thanks.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2 + 20))
            self.screen.blit(thanks, thanks_rect)

        # Final text
        if elapsed > 7:
            final1 = self.small_font.render("They will wait again.", True, GRAY)
            final2 = self.small_font.render("They will wake again.", True, GRAY)
            final3 = self.small_font.render("They will always have five minutes.", True, GRAY)

            self.screen.blit(final1, (SCREEN_WIDTH // 2 - 120, SCREEN_HEIGHT // 2 + 80))
            self.screen.blit(final2, (SCREEN_WIDTH // 2 - 120, SCREEN_HEIGHT // 2 + 110))
            self.screen.blit(final3, (SCREEN_WIDTH // 2 - 180, SCREEN_HEIGHT // 2 + 140))

        if elapsed > 15:
            quit_text = self.small_font.render("Press ESC to exit", True, GRAY)
            quit_rect = quit_text.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT - 50))
            self.screen.blit(quit_text, quit_rect)

    def handle_input(self):
        keys = pygame.key.get_pressed()

        # Allow movement during playing (when not in journal or message board)
        if self.state == GameState.PLAYING and not self.journal.visible and not self.message_board.active:
            dx = keys[pygame.K_RIGHT] - keys[pygame.K_LEFT] + keys[pygame.K_d] - keys[pygame.K_a]
            dy = keys[pygame.K_DOWN] - keys[pygame.K_UP] + keys[pygame.K_s] - keys[pygame.K_w]

            if dx != 0 or dy != 0:
                self.player.move(dx, dy, self.objects, self.npcs)
                self.show_movement_hint = False  # Hide hint once player moves

        # Allow movement during intro (even with dialogue active)
        if self.state == GameState.INTRO:
            dx = keys[pygame.K_RIGHT] - keys[pygame.K_LEFT] + keys[pygame.K_d] - keys[pygame.K_a]
            dy = keys[pygame.K_DOWN] - keys[pygame.K_UP] + keys[pygame.K_s] - keys[pygame.K_w]

            if dx != 0 or dy != 0:
                self.player.move(dx, dy, self.objects, self.npcs)
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
                                # Skip to end of text
                                self.dialogue.displayed_text = self.dialogue.text
                                self.dialogue.char_index = len(self.dialogue.text)
                        elif self.state == GameState.PLAYING:
                            self.check_interactions()

                    # Interaction key
                    if event.key == pygame.K_e and self.state == GameState.PLAYING:
                        if not self.dialogue.active:
                            self.check_interactions()

                    # Journal toggle
                    if event.key == pygame.K_TAB and self.state == GameState.PLAYING:
                        if not self.dialogue.active and not self.message_board.active:
                            self.journal.toggle()

                    # Message board input
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

                    # Draw background box
                    inst_bg = pygame.Surface((inst.get_width() + 20, 30))
                    inst_bg.set_alpha(220)
                    inst_bg.fill(BLACK)
                    self.screen.blit(inst_bg, (5, SCREEN_HEIGHT - 35))

                    # Draw border
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

            pygame.display.flip()
            self.clock.tick(FPS)

        pygame.quit()
        sys.exit()

if __name__ == "__main__":
    game = Game()
    game.run()
