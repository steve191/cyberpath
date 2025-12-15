import React, { useState, useEffect, useRef } from "react";
import {
  dijkstra,
  getNodesInShortestPathOrder,
  getInitialGrid,
  Node,
  DEFAULT_START_ROW,
  DEFAULT_START_COL,
  DEFAULT_FINISH_ROW,
  DEFAULT_FINISH_COL,
} from "@/lib/pathfinding";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw, Trash2, Cpu, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const ROWS = 25;
const COLS = 50;

export default function Pathfinder() {
  const [grid, setGrid] = useState<Node[][]>([]);
  const [isMousePressed, setIsMousePressed] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [stats, setStats] = useState({ visited: 0, pathLength: 0 });

  useEffect(() => {
    // Initialize responsive grid
    const updateGrid = () => {
      // Logic to adjust rows/cols could go here, for now static
      setGrid(getInitialGrid(ROWS, COLS));
    };
    updateGrid();
  }, []);

  const handleMouseDown = (row: number, col: number) => {
    if (isRunning) return;
    const newGrid = getNewGridWithWallToggled(grid, row, col);
    setGrid(newGrid);
    setIsMousePressed(true);
  };

  const handleMouseEnter = (row: number, col: number) => {
    if (!isMousePressed || isRunning) return;
    const newGrid = getNewGridWithWallToggled(grid, row, col);
    setGrid(newGrid);
  };

  const handleMouseUp = () => {
    setIsMousePressed(false);
  };

  const visualizeDijkstra = () => {
    if (isRunning) return;
    setIsRunning(true);
    
    // Reset previous visitation stats but keep walls
    const cleanGrid = grid.map(row => row.map(node => ({
      ...node,
      isVisited: false,
      distance: Infinity,
      previousNode: null
    })));
    
    // We need to mutate the cleanGrid for the algorithm to work, 
    // but we won't set state until animation is done or we animate directly via DOM
    // For React performance in this specific dense-grid case, direct DOM manipulation 
    // for the animation steps is often smoother than 1000 setState calls.
    // However, to keep it "React-y" and simple code-wise, we can use a hybrid approach:
    // Run algo, get result lists, then animate CSS classes.

    const startNode = cleanGrid[DEFAULT_START_ROW][DEFAULT_START_COL];
    const finishNode = cleanGrid[DEFAULT_FINISH_ROW][DEFAULT_FINISH_COL];
    
    const visitedNodesInOrder = dijkstra(cleanGrid, startNode, finishNode);
    const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);

    animateDijkstra(visitedNodesInOrder, nodesInShortestPathOrder);
  };

  const animateDijkstra = (visitedNodesInOrder: Node[], nodesInShortestPathOrder: Node[]) => {
    for (let i = 0; i <= visitedNodesInOrder.length; i++) {
      if (i === visitedNodesInOrder.length) {
        setTimeout(() => {
          animateShortestPath(nodesInShortestPathOrder);
        }, 10 * i);
        return;
      }
      setTimeout(() => {
        const node = visitedNodesInOrder[i];
        // Direct DOM manipulation for performance on high-frequency updates
        const element = document.getElementById(`node-${node.row}-${node.col}`);
        if (element && !node.isStart && !node.isFinish) {
          element.className = `w-full h-full border-[0.5px] border-white/5 animate-visited`;
        }
        setStats(prev => ({ ...prev, visited: i + 1 }));
      }, 10 * i);
    }
  };

  const animateShortestPath = (nodesInShortestPathOrder: Node[]) => {
    for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
      setTimeout(() => {
        const node = nodesInShortestPathOrder[i];
        const element = document.getElementById(`node-${node.row}-${node.col}`);
        if (element && !node.isStart && !node.isFinish) {
          element.className = `w-full h-full border-[0.5px] border-white/5 animate-path`;
        }
        setStats(prev => ({ ...prev, pathLength: i + 1 }));
        if (i === nodesInShortestPathOrder.length - 1) {
          setIsRunning(false);
        }
      }, 50 * i);
    }
  };

  const clearBoard = () => {
    if (isRunning) return;
    setGrid(getInitialGrid(ROWS, COLS));
    setStats({ visited: 0, pathLength: 0 });
    // Reset DOM classes
    const nodes = document.getElementsByClassName('animate-visited');
    while(nodes.length > 0){
        nodes[0].classList.remove('animate-visited');
    }
    const pathNodes = document.getElementsByClassName('animate-path');
    while(pathNodes.length > 0){
        pathNodes[0].classList.remove('animate-path');
    }
    // Hard reset for safety
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const el = document.getElementById(`node-${r}-${c}`);
            if (el) {
                // preserve walls if we only wanted to clear path? No, clearBoard means all.
                // Re-apply basic classes
                const isStart = r === DEFAULT_START_ROW && c === DEFAULT_START_COL;
                const isFinish = r === DEFAULT_FINISH_ROW && c === DEFAULT_FINISH_COL;
                
                el.className = cn(
                    "w-full h-full border-[0.5px] border-white/5 transition-all duration-200",
                    isStart ? "bg-neon-green shadow-[0_0_15px_var(--color-neon-green)] scale-110 z-10 rounded-sm" : "",
                    isFinish ? "bg-neon-pink shadow-[0_0_15px_var(--color-neon-pink)] scale-110 z-10 rounded-sm animate-pulse" : ""
                );
            }
        }
    }
  };

  return (
    <div className="min-h-screen bg-neon-bg flex flex-col font-sans text-white overflow-hidden selection:bg-neon-cyan/30">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-md z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Cpu className="w-6 h-6 text-neon-cyan animate-pulse" />
            <h1 className="font-display text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-pink text-shadow-neon">
              CYBER_PATH
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="hidden md:flex gap-6 text-xs font-mono text-muted-foreground mr-4">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-neon-green rounded-sm shadow-[0_0_5px_var(--color-neon-green)]"></span> START
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-neon-pink rounded-sm shadow-[0_0_5px_var(--color-neon-pink)]"></span> TARGET
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-white/20 border border-white/40"></span> WALL
                </div>
             </div>

            <Button 
                variant="outline" 
                size="sm" 
                onClick={clearBoard}
                disabled={isRunning}
                className="font-mono text-xs border-white/20 hover:bg-white/10 hover:text-white"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              RESET
            </Button>
            
            <Button 
                size="sm" 
                onClick={visualizeDijkstra}
                disabled={isRunning}
                className="font-mono text-xs bg-neon-cyan text-neon-bg hover:bg-neon-cyan/80 font-bold shadow-[0_0_15px_rgba(0,255,255,0.4)]"
            >
              <Play className="w-4 h-4 mr-2 fill-current" />
              RUN_ALGO
            </Button>
          </div>
        </div>
      </header>

      {/* Main Grid Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 relative">
        <div className="relative bg-black/40 p-1 rounded-lg border border-white/10 shadow-2xl backdrop-blur-sm">
             {/* Stats Overlay */}
             <div className="absolute -top-12 left-0 flex gap-4 font-mono text-xs text-neon-cyan/80">
                <div className="bg-black/40 px-3 py-1 rounded border border-white/10 flex items-center gap-2">
                    <Zap className="w-3 h-3" />
                    NODES: {stats.visited}
                </div>
                <div className="bg-black/40 px-3 py-1 rounded border border-white/10 flex items-center gap-2">
                    <RotateCcw className="w-3 h-3" />
                    PATH: {stats.pathLength}
                </div>
             </div>

            <div 
                className="grid gap-[1px] bg-white/5 border border-white/10"
                style={{
                    gridTemplateColumns: `repeat(${COLS}, 24px)`,
                    gridTemplateRows: `repeat(${ROWS}, 24px)`,
                }}
            >
                {grid.map((row, rowIdx) => {
                    return row.map((node, nodeIdx) => {
                        const { isStart, isFinish, isWall } = node;
                        return (
                            <div
                                key={`${rowIdx}-${nodeIdx}`}
                                id={`node-${rowIdx}-${nodeIdx}`}
                                onMouseDown={() => handleMouseDown(rowIdx, nodeIdx)}
                                onMouseEnter={() => handleMouseEnter(rowIdx, nodeIdx)}
                                onMouseUp={handleMouseUp}
                                className={cn(
                                    "w-full h-full border-[0.5px] border-white/5 transition-all duration-200 select-none",
                                    isStart ? "bg-neon-green shadow-[0_0_15px_var(--color-neon-green)] scale-110 z-10 rounded-sm" : "",
                                    isFinish ? "bg-neon-pink shadow-[0_0_15px_var(--color-neon-pink)] scale-110 z-10 rounded-sm animate-pulse" : "",
                                    isWall ? "bg-white/20 border-white/40 animate-wall shadow-inner" : "hover:bg-white/10 cursor-pointer"
                                )}
                            />
                        );
                    });
                })}
            </div>
        </div>
        
        <div className="mt-8 text-center text-white/30 text-xs font-mono">
            CLICK AND DRAG TO DRAW WALLS • ALGORITHM: DIJKSTRA
        </div>
      </main>
    </div>
  );
}

const getNewGridWithWallToggled = (grid: Node[][], row: number, col: number) => {
  const newGrid = grid.slice();
  const node = newGrid[row][col];
  // Don't overwrite start/finish
  if (node.isStart || node.isFinish) return newGrid;
  
  const newNode = {
    ...node,
    isWall: !node.isWall,
  };
  newGrid[row][col] = newNode;
  return newGrid;
};
