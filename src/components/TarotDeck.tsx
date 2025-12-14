import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import Card from './Card';
import { GameState, GestureType } from '../types';
import type { HandPosition, CardReading, CardData } from '../types';
import { SUITS, RANKS, DECK_SIZE, SPREAD_RADIUS } from '../constants';

interface TarotDeckProps {
  handPosition: HandPosition;
  gameState: GameState;
  setGameState: (state: GameState) => void;
  setReading: (reading: CardReading) => void;
}

// Fix JSX Intrinsic Elements issue by casting
const Group = 'group' as any;

const TarotDeck: React.FC<TarotDeckProps> = ({ handPosition, gameState, setGameState, setReading }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [cards, setCards] = useState<CardData[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  
  // Physics / Layout State
  const randomOffsets = useMemo(() => {
    return Array.from({ length: DECK_SIZE }).map(() => ({
      x: (Math.random() - 0.5) * SPREAD_RADIUS * 2,
      y: (Math.random() - 0.5) * SPREAD_RADIUS * 1.5,
      z: (Math.random() - 0.5) * 8, // Deeper cloud
      rotX: (Math.random() - 0.5) * Math.PI * 2,
      rotY: (Math.random() - 0.5) * Math.PI * 2,
      rotZ: (Math.random() - 0.5) * Math.PI * 2,
    }));
  }, []);

  // Generate Procedural Deck
  useMemo(() => {
    const fullDeck: CardData[] = [];
    let id = 0;
    SUITS.forEach(suit => {
        RANKS.forEach(rank => {
            fullDeck.push({
                id: id++,
                name: `${rank} of ${suit.name}`,
                suit: suit.symbol,
                suitName: suit.name,
                rank: rank,
                color: '#C9A55C' // Gold
            });
        });
    });
    const deck = fullDeck.sort(() => 0.5 - Math.random()).slice(0, DECK_SIZE);
    setCards(deck);
  }, []);

  // State Machine Logic driven by Gestures
  useEffect(() => {
    if (!handPosition.detected) return;

    // Don't allow gesture changes during FOCUSED or REVEALED states unless specific gestures
    const isInDrawState = gameState === GameState.FOCUSED || gameState === GameState.REVEALED;

    switch (handPosition.gesture) {
      case GestureType.FIST:
        // Reset or Stack - allowed anytime
        if (gameState !== GameState.STACKED) {
          setGameState(GameState.STACKED);
          setFocusedIndex(-1);
          setReading({ cardName: '', interpretation: '' }); 
        }
        break;
        
      case GestureType.OPEN_PALM:
        // Shuffle / Reset from Reveal - allowed anytime
        if (gameState !== GameState.SHUFFLING) {
          setGameState(GameState.SHUFFLING);
          setFocusedIndex(-1);
        }
        break;

      case GestureType.VICTORY:
        // Fan - don't interrupt draw state
        if (!isInDrawState && gameState !== GameState.FAN) {
          setGameState(GameState.FAN);
          setFocusedIndex(-1);
        }
        break;

      case GestureType.THREE:
        // Spiral - don't interrupt draw state
        if (!isInDrawState && gameState !== GameState.SPIRAL) {
          setGameState(GameState.SPIRAL);
          setFocusedIndex(-1);
        }
        break;

      case GestureType.POINTING:
        // Draw Action
        // Allow drawing from any "spread" state (Shuffling, Fan, Spiral)
        if ([GameState.SHUFFLING, GameState.FAN, GameState.SPIRAL].includes(gameState)) {
          const randomIdx = Math.floor(Math.random() * DECK_SIZE);
          setFocusedIndex(randomIdx);
          setGameState(GameState.FOCUSED);
        } else if (gameState === GameState.FOCUSED && handPosition.isShaking) {
            // Shake to Reveal
            setGameState(GameState.REVEALED);
            const card = cards[focusedIndex];
            if (card) {
                // Instant reveal without AI interpretation
                setReading({ cardName: card.name, interpretation: '' });
            }
        }
        break;
      
      case GestureType.UNKNOWN:
        // Do nothing on UNKNOWN - prevents accidental state changes
        break;
    }
  }, [handPosition.gesture, handPosition.isShaking, gameState, setGameState, cards, focusedIndex, setReading]);


  return (
    <Group ref={groupRef}>
      {cards.map((card, i) => (
        <CardWrapper 
            key={card.id}
            card={card}
            index={i}
            isFocused={i === focusedIndex}
            gameState={gameState}
            randomOffset={randomOffsets[i]}
            handPosition={handPosition}
            totalCards={DECK_SIZE}
        />
      ))}
    </Group>
  );
};

// Sub-component to handle individual card physics
const CardWrapper = ({ card, index, isFocused, gameState, randomOffset, handPosition, totalCards }: any) => {
    const meshRef = useRef<THREE.Group>(null);
    const currentPos = useRef(new THREE.Vector3(0, 0, 0));
    
    useFrame((state, delta) => {
        if (!meshRef.current) return;

        let targetPos = new THREE.Vector3();
        let targetRot = new THREE.Euler();
        let targetScale = 1;
        
        const time = state.clock.getElapsedTime();

        if (gameState === GameState.INITIALIZING) {
             // Hide cards off screen during initialization
             targetPos.set(0, 0, -50); 
             targetRot.set(0, Math.PI, 0); 
             targetScale = 0;
        }
        else if (gameState === GameState.STACKED) {
             targetPos.set(0, 0, -index * 0.01); 
             targetRot.set(0, Math.PI, 0); 
             targetScale = 1;
        } 
        else if (gameState === GameState.SHUFFLING) {
            // Cloud
            const flowX = handPosition.x * 6; 
            const flowY = handPosition.y * 4;
            const floatX = Math.sin(time * 0.5 + index * 0.1) * 2;
            const floatY = Math.cos(time * 0.3 + index * 0.1) * 2;

            targetPos.set(
                randomOffset.x + flowX + floatX,
                randomOffset.y + flowY + floatY,
                randomOffset.z - 10 
            );
            targetRot.set(
                randomOffset.rotX + time * 0.2,
                randomOffset.rotY + time * 0.2, 
                randomOffset.rotZ + time * 0.1
            );
        }
        else if (gameState === GameState.FAN) {
            // Classic Arc Fan
            const angle = (index / totalCards) * Math.PI - (Math.PI / 2); // Semicircle
            const radius = 10;
            
            // Follow hand x
            const offsetX = handPosition.x * 5;
            
            targetPos.set(
                Math.sin(angle) * radius + offsetX,
                Math.cos(angle) * radius - 5 + (handPosition.y * 2), // Shift down
                -5 + (index * 0.01) // slight z sort
            );
            
            // Rotate to face center of fan
            targetRot.set(0, Math.PI, -angle);
        }
        else if (gameState === GameState.SPIRAL) {
            // Deep Vortex
            const angle = index * 0.5 + time * 0.5;
            const radius = 2 + (index * 0.2); // Expands outward
            const z = -index * 0.5; // Goes deep into screen
            
            targetPos.set(
                Math.cos(angle) * radius + (handPosition.x * 5),
                Math.sin(angle) * radius + (handPosition.y * 5),
                z
            );
            
            // Spin with vortex
            targetRot.set(0, Math.PI, angle + (Math.PI/2));
        }
        else if (gameState === GameState.FOCUSED) {
            if (isFocused) {
                // Bring card close to camera
                targetPos.set(handPosition.x * 2, handPosition.y * 2, 6); 
                targetRot.set(0, Math.PI, handPosition.x * 0.2); 
                targetScale = 1.2;
            } else {
                // Push other cards far back
                targetPos.set(randomOffset.x * 4, randomOffset.y * 4, -50);
                targetRot.set(randomOffset.rotX, randomOffset.rotY, randomOffset.rotZ);
                targetScale = 0.5;
            }
        }
        else if (gameState === GameState.REVEALED) {
            if (isFocused) {
                // Center and bring close for reveal
                targetPos.set(0, 0, 7); 
                targetRot.set(0, 0, 0); 
                targetScale = 1.4;
            } else {
                // Hide other cards completely
                targetPos.set(randomOffset.x * 5, randomOffset.y * 5, -60);
                targetScale = 0.1;
            }
        }

        const speed = (gameState === GameState.FOCUSED || gameState === GameState.REVEALED) ? 5 : 3;
        
        currentPos.current.lerp(targetPos, delta * speed);
        meshRef.current.position.copy(currentPos.current);

        meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, targetRot.x, delta * speed);
        meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetRot.y, delta * speed);
        meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, targetRot.z, delta * speed);

        meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, delta * speed));
    });

    return (
        <Group ref={meshRef}>
            <Card 
                data={card} 
                isFocused={isFocused && (gameState === GameState.FOCUSED || gameState === GameState.REVEALED)}
                isRevealed={isFocused && gameState === GameState.REVEALED}
            />
        </Group>
    )
}

export default TarotDeck;