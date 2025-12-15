# CyberPath - Pathfinding Visualizer

A visual shortest path algorithm explorer with a retro neon arcade aesthetic. Watch Dijkstra's algorithm find the optimal path through your custom mazes in real-time.

![CyberPath Screenshot](https://img.shields.io/badge/Algorithm-Dijkstra-00ffff?style=for-the-badge)

## Features

- **Interactive Grid**: Click and drag to draw walls/obstacles
- **Real-time Visualization**: Watch the algorithm explore the grid step by step
- **Dijkstra's Algorithm**: Guarantees the shortest path every time
- **Neon Aesthetic**: Cyberpunk-inspired visuals with animated effects
- **Stats Tracking**: See how many nodes were visited and the final path length

## How to Run Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/steve191/cyberpath.git
   cd cyberpath
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev:client
   ```

4. Open your browser and go to:
   ```
   http://localhost:5000
   ```

## How to Use

1. **Draw Walls**: Click and drag on the grid to create obstacles
2. **Run Algorithm**: Click the "RUN_ALGO" button to visualize the pathfinding
3. **Reset**: Click "RESET" to clear the grid and try again

- **Green Node**: Starting point
- **Pink Node**: Target destination
- **White Blocks**: Walls/obstacles

## Tech Stack

- React 19
- Vite
- TypeScript
- Tailwind CSS

## License

MIT
