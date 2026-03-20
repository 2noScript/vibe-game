# vibe game 🕹️

**vibe game** is a retro-futuristic gaming hub featuring a collection of stunning synthwave and pixel-art games. Race through the cosmos, explore the void, and relive the classic arcade experience with a modern twist.

## 🚀 Features

- **Gaming Hub:** A central hub to access multiple high-quality retro games with a seamless navigation experience.
- **Search & Filter:** Easily find your favorite games using the built-in search bar and category filters.
- **Favorites System:** Save your most-played games to your personal favorites list (persisted via LocalStorage).
- **Synthwave Aesthetic:** Immersive visuals featuring:
  - CRT-style scanline overlays.
  - Neon glow effects and pixel-perfect borders.
  - Smooth Framer Motion transitions and animations.
- **3D Experiences:** High-performance gameplay powered by Three.js and React Three Fiber.
- **Responsive Design:** Fully optimized for desktop, tablet, and mobile devices with a mobile-first approach.

## 🎮 Included Games

| Game | Description |
| :--- | :--- |
| **Cyber Strike** | High-octane action in a cyberpunk world. |
| **Void Explorer** | Journey into the unknown depths of space. |
| **Pixel Quest** | A classic pixel-art adventure. |
| **Synth Racer** | Fast-paced racing with a retro vibe. |
| **Data Miner** | Dive into the digital grid. |
| **Gold Miner** | Classic mining fun with a modern look. |
| **City Brawler** | Retro brawler action. |
| **Commando Strike** | Classic run-and-gun gameplay. |

## 🛠️ Tech Stack

- **Frontend:** [React 19](https://react.dev/)
- **3D Rendering:** [Three.js](https://threejs.org/) with [@react-three/fiber](https://github.com/pmndrs/react-three-fiber) and [@react-three/drei](https://github.com/pmndrs/drei)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **Routing:** [React Router](https://reactrouter.com/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Icons:** [Lucide React](https://lucide.dev/)

## 📦 Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## 📜 License

This project is licensed under the [MIT License](LICENSE).

---

## 🏗️ Game Development Standards

To ensure high-performance, maintainable, and scalable 2D games, all games in this hub follow our **Professional Game Architecture Standard (v1.0)**.

### Architectural Principles
- **Separation of Concerns (SoC):** Decoupling UI (React), Logic (Engine), and Data (Store).
- **Deterministic Logic:** Using a fixed time step (0.016s) for consistent physics across devices.
- **Entity-Component-System (ECS) Lite:** Objects encapsulate their own state and behavior.
- **Event-Driven Communication:** Decoupled Engine-to-UI communication via Zustand.

### Standard Directory Structure
```text
src/games/[game-name]/
├── components/         # React UI (HUD, Menus, Overlays)
├── core/               # Core Engine & Input Management
├── entities/           # Game Objects (Miner, Items)
├── systems/            # Global Logic Modules (Particles)
├── audio.ts            # Sound management
├── constants.ts        # Game constants
├── store.ts            # Zustand state management
├── types.ts            # TypeScript interfaces and types
└── [game-name].tsx     # Main game component
```

---

## 📖 Standard Game Architecture Documentation

This document outlines the standard architectural design for all games in this hub, using **Gold Miner** as the reference implementation. It follows modern software engineering principles and an Object-Oriented Programming (OOP) approach.

### 1. High-Level Overview
The game is built using **React** for the UI layer, **Zustand** for global state management, and **HTML5 Canvas** for the core gameplay rendering. The logic is separated into a dedicated **Game Engine** that handles physics, collisions, and entity updates.

### 2. Core Architectural Components

#### A. State Management (Zustand)
Located in `store.ts`, the store acts as the bridge between the React UI and the Game Engine.
- **Responsibilities**:
    - Managing high-level game states (Score, Level, Goal, Time, Status).
    - Handling transitions between game screens (Start, Playing, Game Over, Level Clear).
    - Providing a hook for the UI to trigger game actions (e.g., `shootClaw`).

#### B. Game Engine (`core/engine.ts`)
The `GoldMinerEngine` class (extending `BaseEngine`) is the "brain" of the game.
- **Responsibilities**:
    - **Level Generation**: Spawning items based on the current level difficulty.
    - **Update Loop**: Calculating physics, checking for collisions between the claw and items.
    - **Entity Management**: Maintaining lists of active items, particles, and floating texts.
    - **Rendering Orchestration**: Calling the `draw()` methods of all entities in the correct order.
    - **Input Handling**: Polling the centralized `InputManager` (`core/input.ts`) for player actions.

#### C. Entity System (OOP)
The game uses a class-based system to encapsulate the behavior and appearance of game objects, all extending `BaseEntity`.
1.  **Miner (`entities/miner.ts`)**: Manages the swinging angle of the claw, claw states (`swinging`, `shooting`, `retracting`), and drawing logic.
2.  **Items (`entities/item.ts`)**: Uses a `BaseItem` abstract class for common properties (x, y, value, weight) and subclasses for specific drawing logic.
3.  **Visual Effects (`systems/particles.ts`)**: Handles debris particles and floating text indicators via a dedicated `ParticleSystem`.

### 3. The Game Loop
Operates on a standard `requestAnimationFrame` loop located in `GameView.tsx`.
- **Update Phase**: `engine.update(dt)` handles physics, collisions, and entity updates.
- **Draw Phase**: `engine.draw(ctx)` renders the background, items, miner, and effects in layers.

### 4. Audio System (`audio.ts`)
A centralized audio controller using the **Web Audio API** with lazy initialization and dynamic pitch/speed adjustment based on item weight.

### 5. Key Design Patterns
- **Singleton-like Engine**: Instantiated once per level and held in the store.
- **Strategy Pattern**: Different item types implement their own drawing strategies.
- **Observer Pattern**: The store notifies the UI of state changes.
- **Fixed Time Step**: Ensures consistent gameplay speed.

---

## 🚀 Professional Game Architecture Standard (v1.0)

This document defines the standard architecture for high-performance, maintainable, and scalable 2D games built with **React**, **TypeScript**, and **HTML5 Canvas**.

### 1. Architectural Principles
1.  **Separation of Concerns (SoC)**: Presentation (React), Logic (Engine), Data (Store).
2.  **Deterministic Logic**: Independent of frame rate (fixed time step).
3.  **Entity-Component-System (ECS) Lite**: Objects encapsulate their own state and behavior.
4.  **Event-Driven Communication**: Decoupled Engine-to-UI communication.

### 2. Core Lifecycle
Every game object must follow: `init()`, `load()`, `update(dt)`, `draw(ctx)`, `destroy()`.

### 3. Implementation Standards
- **Engine**: Pure TypeScript class, not a React component.
- **Entity Management**: Use **Object Pooling** for high-frequency objects.
- **Input Management**: Centralized `InputManager` for easy remapping.
- **Asset Loading**: Use an `AssetLoader` to ensure resources are ready before the game starts.

### 4. Performance Checklist
- [ ] **Offscreen Canvas**: Render static backgrounds once.
- [ ] **Layered Rendering**: Separate passes for background, midground, foreground.
- [ ] **Culling**: Don't update/draw entities outside the viewport.
- [ ] **Fixed Time Step**: Use `update(0.016)` for logic.

### 5. Why this is "Pro"
- **Scalability**: Easily add entities.
- **Testability**: Logic separated from React.
- **Portability**: Core logic is framework-agnostic.
- **Collaboration**: Clear separation of concerns for team workflows.

---

<div align="center">
  <p>
    <a href="#">DISCORD</a> &bull; 
    <a href="#">TIKTOK</a> &bull; 
    <a href="#">YOUTUBE</a> &bull; 
    <a href="#">GITHUB</a>
  </p>
  <p>Built with ❤️ by <b>2noScript</b></p>
</div>
