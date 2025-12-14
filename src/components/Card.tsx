import React, { useMemo } from 'react';
import * as THREE from 'three';
import type { CardData } from '../types';
import { COLORS, CARD_WIDTH, CARD_HEIGHT } from '../constants';
import { Sparkles, Text } from '@react-three/drei';

interface CardProps {
  data: CardData;
  isFocused: boolean;
  isRevealed: boolean;
}

// Fix JSX Intrinsic Elements issue by casting
const Mesh = 'mesh' as any;
const Group = 'group' as any;

const Card: React.FC<CardProps> = ({ data, isFocused, isRevealed }) => {
  
  // Materials
  const materials = useMemo(() => {
    const goldEdge = new THREE.MeshStandardMaterial({ 
        color: COLORS.GOLD, 
        roughness: 0.1, 
        metalness: 1.0,
        emissive: COLORS.GOLD,
        emissiveIntensity: isFocused ? (isRevealed ? 0.8 : 0.4) : 0.2,
    });

    const frontMat = new THREE.MeshStandardMaterial({ 
        color: '#0a0a0a', // Matte Black Front - consistent across all states
        roughness: 0.8,
        metalness: 0.1,
    });

    const backMat = new THREE.MeshStandardMaterial({ 
        color: '#050505', 
        roughness: 0.5,
        metalness: 0.5,
        emissive: COLORS.GOLD,
        emissiveIntensity: 0.05, // Faint gold pulse on back
    });

    return [goldEdge, goldEdge, goldEdge, goldEdge, frontMat, backMat];
  }, [isFocused, isRevealed]);

  return (
    <>
        <Mesh
            castShadow
            receiveShadow
            geometry={new THREE.BoxGeometry(CARD_WIDTH, CARD_HEIGHT, 0.04)}
            material={materials}
        />

        {/* Front Side Graphic (Rank and Suit) */}
        <Group position={[0, 0, 0.021]}> {/* Slightly in front of face */}
            {/* Top Left */}
            <Text
                position={[-CARD_WIDTH / 2 + 0.4, CARD_HEIGHT / 2 - 0.4, 0]}
                fontSize={0.4}
                color={COLORS.GOLD}
                anchorX="center"
                anchorY="middle"
            >
                {data.rank}
            </Text>
            <Text
                position={[-CARD_WIDTH / 2 + 0.4, CARD_HEIGHT / 2 - 0.8, 0]}
                fontSize={0.3}
                color={COLORS.GOLD}
                anchorX="center"
                anchorY="middle"
            >
                {data.suit}
            </Text>

            {/* Bottom Right (Rotated) */}
            <Group position={[CARD_WIDTH / 2 - 0.4, -CARD_HEIGHT / 2 + 0.4, 0]} rotation={[0, 0, Math.PI]}>
                <Text
                    position={[0, 0, 0]}
                    fontSize={0.4}
                    color={COLORS.GOLD}
                    anchorX="center"
                    anchorY="middle"
                >
                    {data.rank}
                </Text>
                <Text
                    position={[0, -0.4, 0]}
                    fontSize={0.3}
                    color={COLORS.GOLD}
                    anchorX="center"
                    anchorY="middle"
                >
                    {data.suit}
                </Text>
            </Group>

            {/* Center Big Symbol */}
            <Text
                position={[0, 0, 0]}
                fontSize={1.2}
                color={COLORS.GOLD}
                fillOpacity={0.8}
                anchorX="center"
                anchorY="middle"
            >
                {data.suit}
            </Text>
             {/* Center Rank Outline Effect */}
             <Text
                position={[0, 0, -0.001]} // Slight shadow effect
                fontSize={1.25}
                color={'#000'}
                fillOpacity={0.5}
                anchorX="center"
                anchorY="middle"
                strokeWidth={0.02}
                strokeColor={COLORS.GOLD_EMISSIVE}
            >
                {data.suit}
            </Text>
        </Group>

        {/* Back Side Pattern */}
        <Group position={[0, 0, -0.021]} rotation={[0, Math.PI, 0]}>
             <Text
                position={[0, 0, 0]}
                fontSize={0.8}
                color={COLORS.GOLD_EMISSIVE}
                fillOpacity={0.1}
                anchorX="center"
                anchorY="middle"
            >
                ⚜
            </Text>
        </Group>


        {/* Dancing Particles for Focused Card */}
        {isFocused && (
            <Group>
                <Sparkles 
                    count={isRevealed ? 150 : 50} 
                    scale={[CARD_WIDTH * 1.5, CARD_HEIGHT * 1.5, 3]} 
                    size={isRevealed ? 6 : 3} 
                    speed={isRevealed ? 1.2 : 0.8} 
                    opacity={isRevealed ? 1 : 0.6} 
                    color={COLORS.GOLD} 
                />
            </Group>
        )}
    </>
  );
};

export default Card;