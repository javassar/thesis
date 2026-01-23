import pygame
import sys
import os
import time
import random

# Constants
SCREEN_WIDTH = 800
SCREEN_HEIGHT = 600
ROOM_WIDTH = 400
BOX_WIDTH = SCREEN_WIDTH - ROOM_WIDTH

GRID_SIZE = 6
CELL_SIZE = (BOX_WIDTH - 40) // GRID_SIZE # A bit of padding

BG_COLOR = (20, 20, 20)
GRID_COLOR = (50, 50, 50)
ROOM_COLOR = (30, 30, 30)
BOX_COLOR = (40, 40, 40)
TEXT_COLOR = (200, 200, 200)
BUTTON_COLOR = (80, 80, 80)
BUTTON_TEXT_COLOR = (255, 255, 255)
ICON_COLOR = (255, 255, 255, 150)
GHOST_GREEN = (0, 255, 0, 100)
GHOST_RED = (255, 0, 0, 100)


# --- Item Definitions ---
# Added 'forgotten_text' for the new "Final Look" phase.
ITEMS = [
    {"id": "teddy_bear", "shape": [[0,1], [1,0], [1,1], [1,2], [2,1]], "sound": "sound_6.wav", "text": "You promised you'd never leave him behind. An important promise.", "forgotten_text": "It was soft. You think it was a gift.", "color": (210, 180, 140), "important": True},
    {"id": "photo", "shape": [[0,0], [1,0], [1,1], [2,1]], "sound": "sound_7.wav", "text": "A perfect day. You were so happy then. Important.", "forgotten_text": "A sunny day. Who were you with?", "color": (128, 0, 128), "important": True},
    {"id": "scarf", "shape": [[0,0], [1,0], [1,1], [2,1], [3,1]], "sound": "sound_12.wav", "text": "Grandma knitted this for you. It's important.", "forgotten_text": "It was warm. The color is fading from your mind.", "color": (255, 0, 0), "important": True},
    {"id": "music_box", "shape": [[0,1], [1,0], [1,1], [1,2]], "sound": "sound_10.wav", "text": "The melody is fading, but it's too important to forget.", "forgotten_text": "It played a song. You can't recall the tune.", "color": (255, 20, 147), "important": True},
    {"id": "letter", "shape": [[0,0], [1,0], [1,1], [2,0]], "sound": "sound_19.wav", "text": "An apology you never sent. So important.", "forgotten_text": "Words on a page. The ink is blurred.", "color": (245, 245, 220), "important": True},
    
    {"id": "kettle", "shape": [[0,0], [1,0]], "sound": "sound_0.wav", "text": "Mom always made tea when I cried.", "forgotten_text": "It was for tea, maybe?", "color": (255, 100, 100), "important": False},
    {"id": "plant", "shape": [[0,0], [0,1], [1,0], [1,1]], "sound": "sound_1.wav", "text": "The only thing I kept alive this year.", "forgotten_text": "It had green leaves.", "color": (100, 255, 100), "important": False},
    {"id": "book", "shape": [[0,0], [0,1], [0,2]], "sound": "sound_2.wav", "text": "A story about a world better than this one.", "forgotten_text": "Just a book.", "color": (100, 100, 255), "important": False},
    {"id": "lamp", "shape": [[0,0], [1,0], [2,0], [3,0]], "sound": "sound_3.wav", "text": "For reading late into the night.", "forgotten_text": "A light for a dark room.", "color": (255, 255, 100), "important": False},
    {"id": "phone", "shape": [[0,0]], "sound": "sound_4.wav", "text": "I should have called more.", "forgotten_text": "An old device.", "color": (200, 200, 200), "important": False},
    {"id": "mug", "shape": [[0,0], [1,0]], "sound": "sound_5.wav", "text": "The coffee was always cold.", "forgotten_text": "Something to drink from.", "color": (150, 75, 0), "important": False},
    {"id": "raincoat", "shape": [[0,0], [0,1], [1,0], [1,1], [2,0], [2,1]], "sound": "sound_8.wav", "text": "For walks in the rain.", "forgotten_text": "It kept you dry once.", "color": (0, 128, 128), "important": False},
    {"id": "journal", "shape": [[0,0], [0,1], [1,0], [1,1]], "sound": "sound_9.wav", "text": "Full of empty pages.", "forgotten_text": "Empty pages.", "color": (255, 192, 203), "important": False},
    {"id": "hat", "shape": [[0,0], [0,1], [0,2]], "sound": "sound_11.wav", "text": "To hide from the world.", "forgotten_text": "Something you wore.", "color": (0, 0, 128), "important": False},
    {"id": "globe", "shape": [[0,0], [0,1], [1,0], [1,1]], "sound": "sound_13.wav", "text": "All the places I'll never go.", "forgotten_text": "A map of the world.", "color": (0, 191, 255), "important": False},
    {"id": "chess_piece", "shape": [[0,0], [1,0]], "sound": "sound_14.wav", "text": "I was never good at the long game.", "forgotten_text": "A game piece.", "color": (50, 50, 50), "important": False},
    {"id": "mirror", "shape": [[0,0], [1,0], [2,0]], "sound": "sound_15.wav", "text": "I don't recognize myself anymore.", "forgotten_text": "A reflection.", "color": (192, 192, 192), "important": False},
    {"id": "keys", "shape": [[0,0]], "sound": "sound_16.wav", "text": "To a place I can't call home.", "forgotten_text": "They opened a door.", "color": (255, 215, 0), "important": False},
    {"id": "shoes", "shape": [[0,0], [1,0], [0,1], [1,1]], "sound": "sound_17.wav", "text": "Worn out from running away.", "forgotten_text": "They took you places.", "color": (139, 69, 19), "important": False},
    {"id": "vase", "shape": [[0,0], [1,0], [2,0]], "sound": "sound_18.wav", "text": "The flowers have long since wilted.", "forgotten_text": "It held something once.", "color": (75, 0, 130), "important": False},
]

class Item:
    def __init__(self, data, pos):
        self.id = data["id"]
        self.shape = data["shape"]
        self.sound_path = os.path.join("assets", "audio", data["sound"])
        self.text = data["text"]
        self.forgotten_text = data["forgotten_text"]
        self.color = data["color"]
        self.original_color = data["color"]
        self.important = data["important"]
        self.sound = pygame.mixer.Sound(self.sound_path)
        self.rect = pygame.Rect(0,0,0,0)
        self.update_rect_size()
        self.rect.topleft = pos
        self.in_box = False

    def draw(self, surface):
        for part in self.shape:
            pygame.draw.rect(surface, self.color, 
                             (self.rect.x + part[1] * CELL_SIZE, 
                              self.rect.y + part[0] * CELL_SIZE, 
                              CELL_SIZE - 1, CELL_SIZE - 1))
        self.draw_icon(surface)

    def draw_icon(self, surface):
        center_x, center_y = self.rect.center
        if self.id == "teddy_bear":
            pygame.draw.circle(surface, ICON_COLOR, (center_x - 5, center_y - 5), 5, 1)
            pygame.draw.circle(surface, ICON_COLOR, (center_x + 5, center_y - 5), 5, 1)
        elif self.id == "kettle":
            pygame.draw.line(surface, ICON_COLOR, (center_x, center_y), (center_x + 10, center_y - 10), 2)
        elif self.id == "plant":
            pygame.draw.circle(surface, (0,200,0), (center_x, center_y - 5), 5)
        elif self.id == "photo":
            pygame.draw.rect(surface, ICON_COLOR, (self.rect.x+2, self.rect.y+2, self.rect.width-4, self.rect.height-4), 1)
            pygame.draw.line(surface, ICON_COLOR, (center_x, center_y - 5), (center_x, center_y + 5), 1)
            pygame.draw.line(surface, ICON_COLOR, (center_x - 5, center_y), (center_x + 5, center_y), 1)

    def update_rect_size(self):
        if not self.shape: return
        max_x = max(p[1] for p in self.shape) + 1
        max_y = max(p[0] for p in self.shape) + 1
        self.width = max_x * CELL_SIZE
        self.height = max_y * CELL_SIZE
        self.rect.size = (self.width, self.height)
        
    def rotate(self):
        self.shape = [(-p[1], p[0]) for p in self.shape]
        min_x = min(p[1] for p in self.shape)
        min_y = min(p[0] for p in self.shape)
        self.shape = [(p[0] - min_y, p[1] - min_x) for p in self.shape]
        topleft = self.rect.topleft
        self.update_rect_size()
        self.rect.topleft = topleft

    def desaturate(self, factor):
        r, g, b = self.original_color
        gray = int(0.299 * r + 0.587 * g + 0.114 * b)
        self.color = (
            int(r + (gray - r) * factor),
            int(g + (gray - g) * factor),
            int(b + (gray - b) * factor)
        )

class Button:
    def __init__(self, x, y, width, height, text, font):
        self.rect = pygame.Rect(x, y, width, height)
        self.text = text
        self.font = font

    def draw(self, surface):
        pygame.draw.rect(surface, BUTTON_COLOR, self.rect)
        text_surf = self.font.render(self.text, True, BUTTON_TEXT_COLOR)
        text_rect = text_surf.get_rect(center=self.rect.center)
        surface.blit(text_surf, text_rect)

    def is_clicked(self, pos):
        return self.rect.collidepoint(pos)

def draw_multiline_text(surface, text, pos, font, color, center=False):
    lines = text.splitlines()
    for i, line in enumerate(lines):
        line_surface = font.render(line, True, color)
        if center:
            line_rect = line_surface.get_rect(center=(SCREEN_WIDTH / 2, pos[1] + i * font.get_linesize()))
            surface.blit(line_surface, line_rect)
        else:
             surface.blit(line_surface, (pos[0], pos[1] + i * font.get_linesize()))

def main():
    pygame.init()
    pygame.mixer.init()

    screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
    pygame.display.set_caption("The Weight of a Box")
    clock = pygame.time.Clock()
    font = pygame.font.Font(None, 24)
    font_large = pygame.font.Font(None, 36)
    
    front_door_button = Button(SCREEN_WIDTH - 160, SCREEN_HEIGHT - 60, 150, 50, "Front Door", font)
    intro_text = "You are leaving tomorrow. You have one box.\n\nDrag items into the box. Right-Click or Spacebar to rotate.\n\nSome memories are more important. They may be harder to fit.\n\nWhen you're done, click the 'Front Door'."

    grid = [[None for _ in range(GRID_SIZE)] for _ in range(GRID_SIZE)]
    grid_origin_x = ROOM_WIDTH + 20
    grid_origin_y = 20

    all_items = []
    for item_data in ITEMS:
        x = random.randint(10, ROOM_WIDTH - 80)
        y = random.randint(50, SCREEN_HEIGHT - 150)
        item = Item(item_data, (x, y))
        all_items.append(item)

    for item in all_items:
        item.sound.set_volume(0.1)
        item.sound.play(loops=-1)

    game_state = "intro" 
    dragging_item = None
    ending_start_time = 0

    running = True
    while running:
        mouse_pos = pygame.mouse.get_pos()

        if dragging_item and dragging_item in all_items:
            all_items.remove(dragging_item)
            all_items.append(dragging_item)

        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            
            if game_state == "intro":
                if event.type == pygame.MOUSEBUTTONDOWN or event.type == pygame.KEYDOWN:
                    game_state = "playing"

            elif game_state == "playing":
                if event.type == pygame.MOUSEBUTTONDOWN:
                    if event.button == 1:
                        if front_door_button.is_clicked(mouse_pos) and sum(1 for item in all_items if item.in_box) >= 5:
                            game_state = "ending"
                            ending_start_time = time.time()
                        else:
                            for item in reversed(all_items):
                                if item.rect.collidepoint(mouse_pos):
                                    dragging_item = item
                                    if item.in_box:
                                        item.in_box = False
                                        item.sound.set_volume(0.1)
                                        for r in range(GRID_SIZE):
                                            for c in range(GRID_SIZE):
                                                if grid[r][c] == item.id:
                                                    grid[r][c] = None
                                    break
                    elif event.button == 3 and dragging_item:
                        dragging_item.rotate()
                
                elif event.type == pygame.MOUSEBUTTONUP:
                    if event.button == 1 and dragging_item:
                        if dragging_item.rect.right > ROOM_WIDTH and dragging_item.rect.left > ROOM_WIDTH - 50:
                            grid_x = int((dragging_item.rect.left - grid_origin_x + CELL_SIZE / 2) // CELL_SIZE)
                            grid_y = int((dragging_item.rect.top - grid_origin_y + CELL_SIZE / 2) // CELL_SIZE)
                            
                            can_place, _ = is_valid_placement(dragging_item, grid_x, grid_y, grid)
                            if can_place:
                                place_item_in_grid(dragging_item, grid_x, grid_y, grid, grid_origin_x, grid_origin_y)
                            else:
                                dragging_item.in_box = False 
                        else:
                             dragging_item.in_box = False
                        dragging_item = None

                elif event.type == pygame.KEYDOWN:
                    if event.key == pygame.K_SPACE and dragging_item:
                        dragging_item.rotate()
            
            elif game_state == "final_look":
                 if event.type == pygame.MOUSEBUTTONDOWN or event.type == pygame.KEYDOWN:
                    game_state = "final_summary"
                    ending_start_time = time.time() # Reset timer for final summary


        if dragging_item:
            dragging_item.rect.center = mouse_pos
        
        screen.fill(BG_COLOR)

        if game_state == "intro":
            draw_multiline_text(screen, intro_text, (0, 200), font_large, TEXT_COLOR, center=True)
            prompt = font.render("Click or press any key to begin.", True, TEXT_COLOR)
            screen.blit(prompt, prompt.get_rect(center=(SCREEN_WIDTH/2, SCREEN_HEIGHT - 100)))

        elif game_state in ["playing", "ending", "final_look"]:
            pygame.draw.rect(screen, ROOM_COLOR, (0, 0, ROOM_WIDTH, SCREEN_HEIGHT))
            pygame.draw.rect(screen, BOX_COLOR, (ROOM_WIDTH, 0, BOX_WIDTH, SCREEN_HEIGHT))
            for r in range(GRID_SIZE):
                for c in range(GRID_SIZE):
                    rect = pygame.Rect(grid_origin_x + c * CELL_SIZE, grid_origin_y + r * CELL_SIZE, CELL_SIZE, CELL_SIZE)
                    pygame.draw.rect(screen, GRID_COLOR, rect, 1)

            for item in all_items:
                if item != dragging_item:
                    item.draw(screen)
            
            # Draw ghost preview
            if dragging_item and dragging_item.rect.right > ROOM_WIDTH:
                grid_x = int((dragging_item.rect.left - grid_origin_x + CELL_SIZE / 2) // CELL_SIZE)
                grid_y = int((dragging_item.rect.top - grid_origin_y + CELL_SIZE / 2) // CELL_SIZE)
                can_place, shape_coords = is_valid_placement(dragging_item, grid_x, grid_y, grid)
                ghost_color = GHOST_GREEN if can_place else GHOST_RED
                for r_off, c_off in shape_coords:
                    s = pygame.Surface((CELL_SIZE-1, CELL_SIZE-1), pygame.SRCALPHA)
                    s.fill(ghost_color)
                    screen.blit(s, (grid_origin_x + c_off * CELL_SIZE, grid_origin_y + r_off * CELL_SIZE))

            if dragging_item:
                dragging_item.draw(screen)

            if game_state == "playing":
                front_door_button.draw(screen)
                draw_tooltip(screen, all_items, dragging_item, mouse_pos, font)

        if game_state == "ending":
            elapsed = time.time() - ending_start_time
            fade_duration = 3.0
            
            for item in all_items:
                if not item.in_box:
                    factor = min(1.0, elapsed / fade_duration)
                    item.sound.set_volume(0.1 * (1 - factor))
                    item.desaturate(factor)
            
            if elapsed > fade_duration + 0.5:
                game_state = "final_look"
                ending_start_time = time.time() # Reset timer

        elif game_state == "final_look":
            draw_multiline_text(screen, "One last look before you go... (Click to continue)", (20, 20), font, TEXT_COLOR)
            draw_forgotten_tooltip(screen, all_items, mouse_pos, font)
            if time.time() - ending_start_time > 10.0: # Auto-advance after a while
                game_state = "final_summary"
                ending_start_time = time.time()


        elif game_state == "final_summary":
            screen.fill(BG_COLOR)
            draw_multiline_text(screen, "You kept:", (0, 100), font_large, TEXT_COLOR, center=True)
            
            kept_items = [item.id.replace("_", " ") for item in all_items if item.in_box]
            for i, name in enumerate(kept_items):
                draw_multiline_text(screen, name, (0, 160 + i * 30), font, TEXT_COLOR, center=True)

            if not kept_items:
                draw_multiline_text(screen, "Nothing.", (0, 160), font, TEXT_COLOR, center=True)

            final_message = font.render("The rest is silence.", True, TEXT_COLOR)
            screen.blit(final_message, final_message.get_rect(center=(SCREEN_WIDTH/2, SCREEN_HEIGHT - 50)))

            if time.time() - ending_start_time > 8.0:
                running = False


        pygame.display.flip()
        clock.tick(60)

    pygame.quit()
    sys.exit()

def is_valid_placement(item, grid_x, grid_y, grid):
    shape_coords = []
    for part in item.shape:
        r, c = int(grid_y + part[0]), int(grid_x + part[1])
        shape_coords.append((r,c))
        if not (0 <= r < GRID_SIZE and 0 <= c < GRID_SIZE and grid[r][c] is None):
            return False, shape_coords
    return True, shape_coords

def place_item_in_grid(item, grid_x, grid_y, grid, grid_origin_x, grid_origin_y):
    can_place, shape_coords = is_valid_placement(item, grid_x, grid_y, grid)
    if can_place:
        for r,c in shape_coords:
            grid[r][c] = item.id
        item.rect.topleft = (grid_origin_x + grid_x * CELL_SIZE, grid_origin_y + grid_y * CELL_SIZE)
        item.in_box = True
        item.sound.set_volume(1.0)

def draw_tooltip(surface, all_items, dragging_item, mouse_pos, font):
    hovered_item = None
    if not dragging_item:
        for item in reversed(all_items):
            if item.rect.collidepoint(mouse_pos) and item.in_box is False:
                hovered_item = item
                break
    if hovered_item:
        text_to_show = f"{hovered_item.text}"
        if hovered_item.important:
            text_to_show = f"[IMPORTANT] {hovered_item.text}"
        draw_multiline_text(surface, text_to_show, (20, SCREEN_HEIGHT - 90), font, TEXT_COLOR)

def draw_forgotten_tooltip(surface, all_items, mouse_pos, font):
    hovered_item = None
    for item in reversed(all_items):
        if not item.in_box and item.rect.collidepoint(mouse_pos):
            hovered_item = item
            break
    if hovered_item:
        draw_multiline_text(surface, hovered_item.forgotten_text, (20, 50), font, TEXT_COLOR)


if __name__ == '__main__':
    main()
