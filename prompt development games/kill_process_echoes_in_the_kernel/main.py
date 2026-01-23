
import json
import os
import random
import sys
import time
import threading

class Game:
    def __init__(self):
        self.current_dir = "/tmp/"
        self.integrity = 100
        self.file_tree = self.load_file_tree()
        self.stalker_location = ""
        self.game_over = False

    def load_file_tree(self):
        with open("file_tree.json", "r") as f:
            return json.load(f)

    def run(self):
        self.init_game()
        threading.Thread(target=self.integrity_drain, daemon=True).start()
        threading.Thread(target=self.blinker, daemon=True).start()
        threading.Thread(target=self.stalker, daemon=True).start()

        while not self.game_over:
            self.display_prompt()
            command = input()
            self.handle_command(command)

    def init_game(self):
        self.slow_print("Initializing System Janitor Unit 04...", delay=0.05)
        self.slow_print("Kernel corruption event detected. Class-5.", delay=0.05)
        self.slow_print("Your mission: purge all corrupted data.", delay=0.05)
        self.slow_print("Type 'help' for a list of commands.", delay=0.05)
        print("\n")

    def integrity_drain(self):
        while not self.game_over:
            time.sleep(2)
            if self.current_dir_has_aggressive_files():
                self.integrity -= 1
                if self.integrity <= 0:
                    self.lose_game()

    def current_dir_has_aggressive_files(self):
        current_files = self.get_current_dir_files()
        for f in current_files.values():
            if isinstance(f, dict) and f.get("aggressive"):
                return True
        return False

    def blinker(self):
        while not self.game_over:
            time.sleep(10)
            # This is a simplified blinker, just clearing the screen for now
            os.system('cls' if os.name == 'nt' else 'clear')
            # In a real implementation, we would also rename files here

    def stalker(self):
        time.sleep(150) # Stalker appears after 2.5 minutes
        while not self.game_over:
            self.stalker_location = random.choice(list(self.get_all_dirs()))
            if self.stalker_location == self.current_dir:
                self.slow_print("\nStalker.proc is now in this directory!", delay=0.05, color="red")
            time.sleep(10)


    def get_current_dir_files(self):
        path_parts = [p for p in self.current_dir.split("/") if p]
        current_level = self.file_tree
        for part in path_parts:
            current_level = current_level[part]["content"]
        return current_level

    def get_all_dirs(self):
        dirs = set()
        def traverse(current_level, path):
            dirs.add(path)
            for name, item in current_level.items():
                if isinstance(item, dict) and "content" in item and isinstance(item["content"], dict):
                    traverse(item["content"], path + name + "/")
        traverse(self.file_tree["/"]["content"], "/")
        return dirs


    def display_prompt(self):
        print(f"\nIntegrity: {self.integrity}%")
        print(f"{self.current_dir}> ", end="")

    def handle_command(self, command):
        parts = command.split()
        cmd = parts[0]
        arg = parts[1] if len(parts) > 1 else None

        if cmd == "ls":
            self.ls()
        elif cmd == "cd":
            self.cd(arg)
        elif cmd == "cat":
            self.cat(arg)
        elif cmd == "rm":
            self.rm(arg)
        elif cmd == "help":
            self.help()
        else:
            self.slow_print(f"Unknown command: {cmd}", color="red")

    def ls(self):
        current_files = self.get_current_dir_files()
        for name, details in current_files.items():
             if isinstance(details, dict) and "content" in details and isinstance(details["content"], dict): # it's a directory
                self.slow_print(f"DIR\t{name}", color="blue")
             else: # it's a file
                self.slow_print(f"FILE\t{name}")


    def cd(self, path):
        if not path:
            self.slow_print("Usage: cd <directory>", color="red")
            return
        if path == "..":
            if self.current_dir != "/":
                self.current_dir = "/".join(self.current_dir.split("/")[:-2]) + "/"
            return

        current_files = self.get_current_dir_files()
        if path in current_files and isinstance(current_files[path]["content"], dict):
            self.current_dir += path + "/"
        else:
            self.slow_print(f"Directory not found: {path}", color="red")

    def cat(self, filename):
        if not filename:
            self.slow_print("Usage: cat <file>", color="red")
            return

        current_files = self.get_current_dir_files()
        if filename in current_files and not isinstance(current_files[filename]["content"], dict):
            file_info = current_files[filename]
            self.slow_print(file_info["content"])
            if file_info.get("aggressive"):
                self.slow_print("\nWARNING: This file is aggressive.", color="red")
        else:
            self.slow_print(f"File not found: {filename}", color="red")

    def rm(self, filename):
        if not filename:
            self.slow_print("Usage: rm <file>", color="red")
            return

        current_files = self.get_current_dir_files()
        if filename in current_files:
            if filename == "System_Janitor_04.identity" and self.current_dir == "/root/":
                self.win_game()

            if current_files[filename].get("scream"):
                self.slow_print("...screee...", color="yellow", delay=0.1)

            del current_files[filename]
            self.slow_print(f"Deleted {filename}", color="green")
        else:
            self.slow_print(f"File not found: {filename}", color="red")


    def help(self):
        self.slow_print("Available commands:", color="yellow")
        self.slow_print("  ls - list files and directories")
        self.slow_print("  cd <dir> - change directory")
        self.slow_print("  cat <file> - view file contents")
        self.slow_print("  rm <file> - delete a file")
        self.slow_print("  help - display this help message")


    def win_game(self):
        self.slow_print("\nPURGE COMPLETE. Memory freed...", color="green", delay=0.1)
        self.game_over = True
        sys.exit()

    def lose_game(self):
        self.slow_print("\nSYSTEM FAILURE.", color="red", delay=0.1)
        self.game_over = True
        sys.exit()

    def slow_print(self, text, delay=0.01, color=None):
        color_map = {
            "red": "\033[91m",
            "green": "\033[92m",
            "yellow": "\033[93m",
            "blue": "\033[94m",
            "end": "\033[0m"
        }
        if color and color in color_map:
            text = color_map[color] + text + color_map["end"]

        for char in text:
            sys.stdout.write(char)
            sys.stdout.flush()
            time.sleep(delay)
        print()


if __name__ == "__main__":
    game = Game()
    game.run()
