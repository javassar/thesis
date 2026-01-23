#!/usr/bin/env python3
"""
Test movement to debug why keys aren't working
"""

import pygame
import sys

pygame.init()

SCREEN_WIDTH = 800
SCREEN_HEIGHT = 600
PLAYER_COLOR = (50, 150, 255)
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
GRASS_COLOR = (80, 120, 80)

screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
pygame.display.set_caption("Movement Test")
clock = pygame.time.Clock()

# Player
player_x = SCREEN_WIDTH // 2
player_y = SCREEN_HEIGHT // 2
player_speed = 4

font = pygame.font.Font(None, 36)
small_font = pygame.font.Font(None, 24)

running = True
last_keys = ""

while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        if event.type == pygame.KEYDOWN:
            if event.key == pygame.K_ESCAPE:
                running = False

    # Get keys
    keys = pygame.key.get_pressed()

    # Calculate movement
    dx = 0
    dy = 0

    if keys[pygame.K_LEFT] or keys[pygame.K_a]:
        dx -= 1
    if keys[pygame.K_RIGHT] or keys[pygame.K_d]:
        dx += 1
    if keys[pygame.K_UP] or keys[pygame.K_w]:
        dy -= 1
    if keys[pygame.K_DOWN] or keys[pygame.K_s]:
        dy += 1

    # Apply movement
    player_x += dx * player_speed
    player_y += dy * player_speed

    # Keep in bounds
    player_x = max(0, min(SCREEN_WIDTH - 40, player_x))
    player_y = max(0, min(SCREEN_HEIGHT - 40, player_y))

    # Track which keys are pressed
    pressed = []
    if keys[pygame.K_w] or keys[pygame.K_UP]:
        pressed.append("UP")
    if keys[pygame.K_s] or keys[pygame.K_DOWN]:
        pressed.append("DOWN")
    if keys[pygame.K_a] or keys[pygame.K_LEFT]:
        pressed.append("LEFT")
    if keys[pygame.K_d] or keys[pygame.K_RIGHT]:
        pressed.append("RIGHT")

    last_keys = ", ".join(pressed) if pressed else "None"

    # Draw
    screen.fill(GRASS_COLOR)

    # Draw player
    pygame.draw.rect(screen, BLACK, (player_x - 2, player_y - 2, 44, 44), 2)
    pygame.draw.rect(screen, PLAYER_COLOR, (player_x, player_y, 40, 40))

    # Draw YOU label
    label = font.render("YOU", True, WHITE)
    screen.blit(label, (player_x, player_y - 40))

    # Draw instructions
    inst = small_font.render("Press WASD or Arrow Keys to move", True, WHITE)
    screen.blit(inst, (20, 20))

    # Show pressed keys
    keys_text = small_font.render(f"Keys: {last_keys}", True, WHITE)
    screen.blit(keys_text, (20, 50))

    # Show position
    pos_text = small_font.render(f"Position: ({int(player_x)}, {int(player_y)})", True, WHITE)
    screen.blit(pos_text, (20, 80))

    # Show movement
    move_text = small_font.render(f"Movement: dx={dx}, dy={dy}", True, WHITE)
    screen.blit(move_text, (20, 110))

    pygame.display.flip()
    clock.tick(60)

pygame.quit()
sys.exit()
