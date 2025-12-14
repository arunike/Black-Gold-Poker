import React, { useState, useCallback } from 'react';
import Experience from './components/Experience';
import UIOverlay from './components/UIOverlay';
import HandTracker from './components/HandTracker';
import { GameState, GestureType } from './types';
import type { HandPosition, CardReading } from './types';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.INITIALIZING);
  const [started, setStarted] = useState(false);
  const [handPosition, setHandPosition] = useState<HandPosition>({
    x: 0,
    y: 0,
    gesture: GestureType.UNKNOWN,
    isShaking: false,
    detected: false
  });
  const [currentReading, setCurrentReading] = useState<CardReading | null>(null);

  // Callback for when hand moves
  const handleHandUpdate = useCallback((pos: HandPosition) => {
    setHandPosition(pos);
    
    // Auto-transition from Init to Stacked once detection starts
    setGameState(prev => {
        if (prev === GameState.INITIALIZING) return GameState.STACKED;
        return prev;
    });
  }, []);

  const handleStart = () => {
    setStarted(true);
  };

  const handleReset = () => {
    setGameState(GameState.STACKED);
    setCurrentReading(null);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-void select-none">
      
      {/* 3D Scene Layer */}
      <Experience 
        handPosition={handPosition} 
        gameState={gameState} 
        setGameState={setGameState}
        setReading={setCurrentReading}
      />

      {/* 2D UI Layer */}
      <UIOverlay 
        gameState={gameState} 
        reading={currentReading}
        onReset={handleReset}
        onStart={handleStart}
        started={started}
      />

      {/* Logic / Sensor Layer */}
      {started && (
        <HandTracker 
          onUpdate={handleHandUpdate} 
          gameState={gameState}
          setGameState={setGameState}
        />
      )}

    </div>
  );
};

export default App;