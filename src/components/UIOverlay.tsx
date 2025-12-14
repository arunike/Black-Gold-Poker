import React, { useEffect, useState } from 'react';
import { GameState } from '../types';
import type { CardReading } from '../types';

interface UIOverlayProps {
  gameState: GameState;
  reading: CardReading | null;
  onReset: () => void;
  onStart: () => void;
  started: boolean;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ gameState, reading, onReset, onStart, started }) => {
  const [instruction, setInstruction] = useState('');

  useEffect(() => {
    switch (gameState) {
      case GameState.INITIALIZING:
        setInstruction('Initializing Neural Link...');
        break;
      case GameState.STACKED:
        setInstruction('Open Hand to Shuffle');
        break;
      case GameState.SHUFFLING:
        setInstruction('Point 1 Finger to Draw');
        break;
      case GameState.FAN:
        setInstruction('Fan Formation Active - Point to Draw');
        break;
      case GameState.SPIRAL:
        setInstruction('Void Vortex Active - Point to Draw');
        break;
      case GameState.FOCUSED:
        setInstruction('Shake Finger to Flip');
        break;
      case GameState.REVEALED:
        setInstruction('Open Hand to Reshuffle');
        break;
      default:
        setInstruction('');
    }
  }, [gameState]);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-10 z-10">
      
      {/* Top Header */}
      <div className="text-center opacity-80 mt-4">
        <h1 className="font-serif text-3xl tracking-[0.6em] text-gold/80 uppercase drop-shadow-[0_0_15px_rgba(201,165,92,0.3)]">
          Black Gold Poker
        </h1>
      </div>

      {/* Center Dynamic Content */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl text-center">
        
        {/* Click to Start */}
        {gameState === GameState.INITIALIZING && !started && (
          <button 
            onClick={onStart}
            className="pointer-events-auto font-serif text-xl text-black bg-gold hover:bg-gold-light px-6 py-4 rounded-lg tracking-[0.3em] uppercase transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(201,165,92,0.8)] active:scale-95"
          >
            Click to Start
          </button>
        )}

        {gameState === GameState.REVEALED && reading && (
            <div className="mt-8">
                <div className="bg-black/95 backdrop-blur-3xl border-4 border-gold/60 px-10 py-8 shadow-[0_0_120px_rgba(201,165,92,0.8),_inset_0_0_40px_rgba(201,165,92,0.2)] animate-[slideUp_1s_ease-out] rounded-xl">
                    <h3 className="font-serif text-2xl text-gold uppercase tracking-[0.3em] [text-shadow:_0_0_30px_rgb(201_165_92_/_100%),_0_0_15px_rgb(201_165_92_/_80%)] animate-pulse">
                    {reading.cardName}
                    </h3>
                </div>
            </div>
        )}
      </div>

      {/* Bottom Instructions */}
      <div className="text-center pb-8">
         <p className="font-serif text-gold-dim text-xs tracking-[0.4em] uppercase animate-pulse">
            {instruction}
         </p>
         
         {/* Gesture Icons Helper */}
         <div className="flex justify-center gap-8 mt-6 opacity-60 text-gold text-2xl">
            <div className={`flex flex-col items-center transition-all ${gameState === GameState.STACKED ? 'scale-125 text-white opacity-100' : 'opacity-40'}`}>
                <span>✊</span>
                <span className="text-[8px] tracking-widest mt-2 uppercase">Stack</span>
            </div>
            <div className={`flex flex-col items-center transition-all ${gameState === GameState.FOCUSED || gameState === GameState.REVEALED ? 'scale-125 text-white opacity-100' : 'opacity-40'}`}>
                <span>☝️</span>
                <span className="text-[8px] tracking-widest mt-2 uppercase">Draw</span>
            </div>
            <div className={`flex flex-col items-center transition-all ${gameState === GameState.FAN ? 'scale-125 text-white opacity-100' : 'opacity-40'}`}>
                <span>✌️</span>
                <span className="text-[8px] tracking-widest mt-2 uppercase">Fan</span>
            </div>
            <div className={`flex flex-col items-center transition-all ${gameState === GameState.SPIRAL ? 'scale-125 text-white opacity-100' : 'opacity-40'}`}>
                <span>🤟</span>
                <span className="text-[8px] tracking-widest mt-2 uppercase">Vortex</span>
            </div>
            <div className={`flex flex-col items-center transition-all ${gameState === GameState.SHUFFLING ? 'scale-125 text-white opacity-100' : 'opacity-40'}`}>
                <span>✋</span>
                <span className="text-[8px] tracking-widest mt-2 uppercase">Shuffle</span>
            </div>
         </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default UIOverlay;