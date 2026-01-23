# The Last Light

A narrative adventure game about endings, memories, and the last night of a lighthouse keeper before automation takes over.

## About

On your final night as a lighthouse keeper after 34 years of service, you climb the tower one last time. As you ascend through the lighthouse, you encounter objects and memories at each landing. Your choices shape Marlowe's emotional journey and determine the final message left in the lighthouse logbook.

**Duration:** 2-5 minutes
**Genre:** Atmospheric Narrative Adventure
**Controls:** Keyboard only

## How to Run

### Prerequisites
- Node.js (version 18+ recommended, though the game runs on 20.15.0 with warnings)

### Installation & Running

1. Navigate to the project directory:
```bash
cd the-last-light
```

2. Install dependencies (if not already installed):
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to the URL shown in the terminal (typically `http://localhost:5173/`)

### Building for Production

To create a production build:
```bash
npm run build
```

The built files will be in the `dist` folder and can be deployed to any static hosting service.

## Controls

- **↑ / W** - Move selection up
- **↓ / S** - Move selection down
- **Enter** - Confirm selection / Continue
- **Space** - Advance text / Light the lamp (in final scene)

## Gameplay

The game consists of 6 scenes:

1. **Intro** - Set the stage for your final night
2. **The Base** - Ground floor with a choice about the newspaper
3. **First Landing** - A photograph and memories of Elena
4. **Second Landing** - The logbooks and your final entry
5. **Lamp Room** - Light the lamp one last time
6. **Epilogue** - See the ending based on your choices

Your choices throughout the game will determine one of three endings:
- **Acceptance** - Finding peace with change
- **Defiance** - Standing firm in your convictions
- **Poetry** - Embracing the mystery and memory

## Technical Details

- **Framework:** React 18 with Vite
- **Styling:** Custom CSS with Tailwind CSS
- **Features:**
  - Typewriter text effect
  - Smooth scene transitions
  - Atmospheric backgrounds with CSS gradients
  - Light ignition animation
  - Fully keyboard-navigable
  - Responsive design
  - Respects `prefers-reduced-motion` for accessibility

## Credits

Game designed and implemented based on "The Last Light" game design document.

---

*A game about endings.*
