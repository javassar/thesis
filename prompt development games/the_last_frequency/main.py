
import pygame
import sys
import math
import random

# --- Constants ---
SCREEN_WIDTH = 1280
SCREEN_HEIGHT = 720
ASPECT_RATIO = 16 / 9

WHITE = (255, 255, 255)
GREEN = (0, 255, 0)
DARK_GREEN = (0, 100, 0)
BLACK = (0, 0, 0)
RED = (255, 0, 0)

TYPEWRITER_FONT_SIZE = 48
TYPEWRITER_FONT = None # Will be initialized in setup
TYPEWRITER_DELAY = 50 # milliseconds

# --- Game Setup ---
pygame.init()
pygame.mixer.init()
screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
pygame.display.set_caption("The Last Frequency")
clock = pygame.time.Clock()
TYPEWRITER_FONT = pygame.font.Font(None, TYPEWRITER_FONT_SIZE)

# --- Audio ---
try:
    wind_sound = pygame.mixer.Sound("assets/audio/Wind_Loop.mp3")
    static_sound = pygame.mixer.Sound("assets/audio/Radio_Static.mp3")
    voice_log_sound = pygame.mixer.Sound("assets/audio/Voice_Log.mp3")
    heartbeat_sound = pygame.mixer.Sound("assets/audio/Heartbeat.mp3")
    thump_sound = pygame.mixer.Sound("assets/audio/Thump.mp3") # Placeholder for thump
    # wind_sound.play(-1)
    # static_sound.play(-1)
    print("Audio files loaded (placeholders).")
except pygame.error:
    print("Could not load placeholder audio files. Continuing without audio.")
    wind_sound, static_sound, voice_log_sound, heartbeat_sound, thump_sound = None, None, None, None, None


# --- Assets ---
try:
    silhouette_image = pygame.image.load("assets/images/Silhouette.png").convert_alpha()
    # station_desk_image = pygame.image.load("assets/images/Station_Desk.png").convert()
    # radio_dial_image = pygame.image.load("assets/images/Radio_Dial_Overlay.png").convert_alpha()
except pygame.error:
    print("Could not load placeholder images. Continuing without images.")
    silhouette_image = None

# --- Game State ---
game_state = "SETUP"
start_time = pygame.time.get_ticks()
last_char_time = 0
display_text = ""
full_text = ""

# Player's frequency
current_frequency = 50.0
target_frequency = 40.0 # Initial target

# Wave matching
match_timer = 0
match_duration_needed = 2000 # 2 seconds in milliseconds

# Escalation state
sub_frequencies = [25.0, 60.0, 80.0]
locked_frequencies = 0
slippery_dial = False

# Camera Shake
shake_intensity = 0
shake_duration = 0

# --- Helper Functions ---
def render_text_typewriter(surface, text, x, y, color):
    global display_text, full_text, last_char_time
    if text != full_text:
        full_text = text
        display_text = ""
        last_char_time = pygame.time.get_ticks()

    if len(display_text) < len(full_text):
        current_time = pygame.time.get_ticks()
        if current_time - last_char_time > TYPEWRITER_DELAY:
            display_text += full_text[len(display_text)]
            last_char_time = current_time

    rendered_text = TYPEWRITER_FONT.render(display_text, True, color)
    surface.blit(rendered_text, (x, y))

def play_sound(sound):
    if sound:
        sound.play()
    else:
        print(f"Attempted to play a sound that is not loaded.")

def trigger_shake(intensity, duration):
    global shake_intensity, shake_duration
    shake_intensity = intensity
    shake_duration = duration


# --- Game Loop ---
running = True
while running:
    # --- Event Handling ---
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        if event.type == pygame.KEYDOWN:
            if event.key == pygame.K_LEFT:
                current_frequency -= 0.5
                if slippery_dial:
                    current_frequency -= random.uniform(0.1, 0.5)
            if event.key == pygame.K_RIGHT:
                current_frequency += 0.5
                if slippery_dial:
                    current_frequency += random.uniform(0.1, 0.5)
            if event.key == pygame.K_SPACE:
                print("Spacebar pressed")

    # --- Game Logic ---
    current_time = pygame.time.get_ticks()
    elapsed_time = current_time - start_time

    # Clamp frequency within 0-100
    current_frequency = max(0.0, min(100.0, current_frequency))

    if game_state == "SETUP":
        if elapsed_time > 1000: # Wait 1 second before showing text
             game_state = "START"
             start_time = current_time # Reset timer for the next phase

    elif game_state == "START":
        # [0:00 - 1:00] THE SETUP
        if math.fabs(current_frequency - target_frequency) < 0.5:
            match_timer += clock.get_time()
            if match_timer >= match_duration_needed:
                game_state = "NARRATIVE_HOOK"
                play_sound(voice_log_sound)
                start_time = current_time
                match_timer = 0
        else:
            match_timer = 0

    elif game_state == "NARRATIVE_HOOK":
        # [1:00 - 2:30] THE NARRATIVE HOOK
        if elapsed_time > 5000: # 5 seconds for the text to display
            game_state = "ESCALATION"
            start_time = current_time
            target_frequency = sub_frequencies[0]
            slippery_dial = True


    elif game_state == "ESCALATION":
        # [2:30 - 4:00] THE ESCALATION
        if math.fabs(current_frequency - target_frequency) < 0.5:
            match_timer += clock.get_time()
            if match_timer >= match_duration_needed:
                locked_frequencies += 1
                play_sound(thump_sound)
                trigger_shake(10, 20) # Shake the screen
                match_timer = 0
                if locked_frequencies >= len(sub_frequencies):
                    game_state = "REVEAL"
                    start_time = current_time
                    play_sound(heartbeat_sound)
                else:
                    target_frequency = sub_frequencies[locked_frequencies]
        else:
            match_timer = 0
    
    elif game_state == "REVEAL":
        # [4:00 - 4:45] THE REVEAL
        if elapsed_time > 5000:
            game_state = "ENDING"
            start_time = current_time

    elif game_state == "ENDING":
        # [4:45 - 5:00] THE ENDING
        if elapsed_time > 2000: # Time for silhouette to be visible
            game_state = "GAMEOVER"
            start_time = current_time

    elif game_state == "GAMEOVER":
        if elapsed_time > 3000:
            running = False


    # --- Drawing ---
    if shake_duration > 0:
        shake_offset = (random.randint(-shake_intensity, shake_intensity), random.randint(-shake_intensity, shake_intensity))
        shake_duration -= 1
    else:
        shake_offset = (0, 0)
    
    screen.fill(BLACK)
    
    # --- Background ---
    # screen.blit(station_desk_image, (0,0))


    if game_state == "START":
        render_text_typewriter(screen, "Signal lost. Recalibrate.", (SCREEN_WIDTH // 2 - 300), SCREEN_HEIGHT - 100, GREEN)
    elif game_state == "NARRATIVE_HOOK":
        render_text_typewriter(screen, "That's the SOS... but those coordinates are here. This room.", 150, SCREEN_HEIGHT - 100, GREEN)
        # Red tint overlay
        s = pygame.Surface((SCREEN_WIDTH, SCREEN_HEIGHT), pygame.SRCALPHA)
        s.fill((255, 0, 0, 30))
        screen.blit(s, (0,0))
    elif game_state == "REVEAL":
        render_text_typewriter(screen, "The signal is coming from 0.0 meters away.", 200, SCREEN_HEIGHT - 100, GREEN)
    elif game_state == "ENDING":
        if silhouette_image:
            screen.blit(silhouette_image, (SCREEN_WIDTH//2 - silhouette_image.get_width()//2, SCREEN_HEIGHT//2 - silhouette_image.get_height()//2))
    elif game_state == "GAMEOVER":
        render_text_typewriter(screen, "Frequency Closed.", (SCREEN_WIDTH // 2 - 250), SCREEN_HEIGHT // 2, GREEN)


    # --- Wave Rendering (only in certain states) ---
    if game_state in ["START", "NARRATIVE_HOOK", "ESCALATION"]:
        wave_area_height = SCREEN_HEIGHT // 2
        wave_area_top = (SCREEN_HEIGHT - wave_area_height) // 2

        # Ghost Wave (Target)
        ghost_freq = target_frequency / 20.0
        ghost_amp = 100
        if game_state == "NARRATIVE_HOOK":
            ghost_amp += random.randint(-10, 10) # Glitch effect
        ghost_wave_points = []
        for x in range(SCREEN_WIDTH):
            y = wave_area_top + wave_area_height / 2 + math.sin(x * ghost_freq * 0.01) * ghost_amp
            ghost_wave_points.append((x, y))

        pygame.draw.lines(screen, DARK_GREEN, False, ghost_wave_points, 1)

        # Player Wave
        player_freq = current_frequency / 20.0 # Map frequency to a visible range
        player_amp = 100
        player_wave_points = []
        for x in range(SCREEN_WIDTH):
            y = wave_area_top + wave_area_height / 2 + math.sin(x * player_freq * 0.01) * player_amp
            player_wave_points.append((x, y))

        pygame.draw.lines(screen, GREEN, False, player_wave_points, 2)


    # --- UI Elements ---
    # screen.blit(radio_dial_image, (0,0))

    # Display frequency for debugging
    if game_state in ["START", "ESCALATION"]:
        font = pygame.font.Font(None, 36)
        text = font.render(f"Frequency: {current_frequency:.1f} / Target: {target_frequency:.1f}", True, GREEN)
        screen.blit(text, (10, 10))
        match_text = font.render(f"Match time: {match_timer/1000:.1f}s", True, GREEN)
        screen.blit(match_text, (10, 50))
        if game_state == "ESCALATION":
            locked_text = font.render(f"Sub-frequencies locked: {locked_frequencies}/{len(sub_frequencies)}", True, GREEN)
            screen.blit(locked_text, (10, 90))

    # Apply Shake
    screen.blit(screen, shake_offset)

    pygame.display.flip()
