import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars, Cloud } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette, ChromaticAberration } from '@react-three/postprocessing';
import * as THREE from 'three';
import TarotDeck from './TarotDeck';
import { GameState } from '../types';
import type { HandPosition, CardReading } from '../types';
import { COLORS } from '../constants';

interface ExperienceProps {
  handPosition: HandPosition;
  gameState: GameState;
  setGameState: (state: GameState) => void;
  setReading: (reading: CardReading) => void;
}

const Experience: React.FC<ExperienceProps> = ({ handPosition, gameState, setGameState, setReading }) => {
  return (
    <div className="w-full h-screen bg-void">
      <Canvas
        camera={{ position: [0, 0, 15], fov: 35 }}
        gl={{ antialias: false, toneMapping: THREE.ReinhardToneMapping, toneMappingExposure: 1.5 }}
        dpr={[1, 2]} 
      >
        <Suspense fallback={null}>
          {/* @ts-ignore */}
          <color attach="background" args={[COLORS.VOID]} />
          {/* @ts-ignore */}
          <fog attach="fog" args={[COLORS.MYSTIC_PURPLE, 5, 25]} />
          
          {/* Lighting - Moody and Dramatic */}
          {/* @ts-ignore */}
          <ambientLight intensity={0.2} color={COLORS.MYSTIC_PURPLE} />
          {/* @ts-ignore */}
          <spotLight position={[10, 10, 10]} angle={0.5} penumbra={1} intensity={2} color={COLORS.GOLD} castShadow />
          {/* @ts-ignore */}
          <pointLight position={[-10, -5, -5]} intensity={1} color="#4a3b69" />

          {/* Environment */}
          <Stars radius={50} depth={50} count={5000} factor={4} saturation={0} fade speed={0.5} />
          
          {/* Subtle Clouds for depth */}
          <Cloud opacity={0.1} speed={0.2} width={20} depth={5} segments={10} color={COLORS.MYSTIC_PURPLE} position={[0, 0, -10]} />

          {/* Main Content */}
          <TarotDeck 
            handPosition={handPosition} 
            gameState={gameState} 
            setGameState={setGameState}
            setReading={setReading}
          />

          {/* Post Processing for Cinematic/Organic Feel */}
          <EffectComposer disableNormalPass>
            <Bloom 
              luminanceThreshold={0.4} 
              luminanceSmoothing={0.8} 
              height={300} 
              intensity={1.2} 
            />
            <Noise opacity={0.1} />
            <Vignette eskil={false} offset={0.3} darkness={0.6} />
            {/* @ts-ignore */}
            <ChromaticAberration offset={[0.002, 0.002]} />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Experience;