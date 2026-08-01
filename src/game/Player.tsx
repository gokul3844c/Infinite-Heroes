import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store/gameStore';
import { LANE_WIDTH } from './Road';

const JUMP_HEIGHT = 2.5;
const JUMP_DURATION = 0.6;
const SLIDE_DURATION = 0.6;

export default function Player() {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const character = useGameStore((s) => s.selectedCharacter);
  const lane = useGameStore((s) => s.lane);
  const isJumping = useGameStore((s) => s.isJumping);
  const isSliding = useGameStore((s) => s.isSliding);
  const isHit = useGameStore((s) => s.isHit);
  const gameStarted = useGameStore((s) => s.gameStarted);

  const targetX = useRef(0);
  const currentX = useRef(0);
  const jumpProgress = useRef(0);
  const slideProgress = useRef(0);
  const runCycle = useRef(0);
  const hitShake = useRef(0);

  useEffect(() => {
    targetX.current = lane * LANE_WIDTH;
  }, [lane]);

  useFrame((_, delta) => {
    if (!groupRef.current || !bodyRef.current) return;

    // Smooth lane movement
    currentX.current += (targetX.current - currentX.current) * 10 * delta;
    groupRef.current.position.x = currentX.current;

    // Jump animation
    if (isJumping) {
      jumpProgress.current += delta / JUMP_DURATION;
      if (jumpProgress.current >= 1) {
        jumpProgress.current = 0;
        useGameStore.getState().setJumping(false);
      }
      const t = jumpProgress.current;
      const jumpY = JUMP_HEIGHT * Math.sin(t * Math.PI);
      groupRef.current.position.y = jumpY;
    } else {
      jumpProgress.current = 0;
      groupRef.current.position.y *= 0.85; // Smooth landing
    }

    // Slide animation
    if (isSliding) {
      slideProgress.current += delta / SLIDE_DURATION;
      if (slideProgress.current >= 1) {
        slideProgress.current = 0;
        useGameStore.getState().setSliding(false);
      }
      bodyRef.current.scale.y = 0.4;
      bodyRef.current.position.y = -0.4;
    } else {
      slideProgress.current = 0;
      bodyRef.current.scale.y += (1 - bodyRef.current.scale.y) * 10 * delta;
      bodyRef.current.position.y += (0 - bodyRef.current.position.y) * 10 * delta;
    }

    // Run animation cycle
    if (gameStarted && !isHit) {
      runCycle.current += delta * useGameStore.getState().speed * 0.5;
    }

    // Hit shake
    if (isHit) {
      hitShake.current += delta * 30;
      groupRef.current.position.x += Math.sin(hitShake.current * 10) * 0.1;
      groupRef.current.rotation.z = Math.sin(hitShake.current * 8) * 0.1;
    } else {
      hitShake.current = 0;
      groupRef.current.rotation.z *= 0.9;
    }

    // Slight body tilt when changing lanes
    const tiltTarget = (targetX.current - currentX.current) * -0.15;
    bodyRef.current.rotation.z += (tiltTarget - bodyRef.current.rotation.z) * 5 * delta;
  });

  if (!character) return null;

  const color = character.color;
  const accent = character.accentColor;
  const legSwing = Math.sin(runCycle.current) * 0.4;

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <group ref={bodyRef}>
        {/* Shadow on ground */}
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.5, 16]} />
          <meshBasicMaterial color="#000" transparent opacity={0.3} />
        </mesh>

        {/* Character Body */}
        <group position={[0, 0.9, 0]}>
          {/* Torso */}
          <mesh position={[0, 0.3, 0]} castShadow>
            <boxGeometry args={[0.6, 0.8, 0.35]} />
            <meshStandardMaterial color={color} roughness={0.4} metalness={0.3} />
          </mesh>

          {/* Head */}
          <mesh position={[0, 0.9, 0]} castShadow>
            <sphereGeometry args={[0.25, 16, 16]} />
            <meshStandardMaterial color={accent} roughness={0.3} metalness={0.2} />
          </mesh>

          {/* Eyes */}
          <mesh position={[-0.08, 0.93, 0.22]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[0.08, 0.93, 0.22]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
          </mesh>

          {/* Character symbol */}
          <mesh position={[0, 0.35, 0.19]}>
            <circleGeometry args={[0.12, 16]} />
            <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.5} />
          </mesh>

          {/* Arms */}
          <group position={[-0.4, 0.2, 0]} rotation={[legSwing * 0.8, 0, 0]}>
            <mesh position={[0, -0.2, 0]} castShadow>
              <boxGeometry args={[0.15, 0.5, 0.15]} />
              <meshStandardMaterial color={color} roughness={0.4} metalness={0.3} />
            </mesh>
          </group>
          <group position={[0.4, 0.2, 0]} rotation={[-legSwing * 0.8, 0, 0]}>
            <mesh position={[0, -0.2, 0]} castShadow>
              <boxGeometry args={[0.15, 0.5, 0.15]} />
              <meshStandardMaterial color={color} roughness={0.4} metalness={0.3} />
            </mesh>
          </group>

          {/* Legs */}
          <group position={[-0.15, -0.35, 0]} rotation={[-legSwing, 0, 0]}>
            <mesh position={[0, -0.25, 0]} castShadow>
              <boxGeometry args={[0.18, 0.55, 0.18]} />
              <meshStandardMaterial color={accent} roughness={0.5} />
            </mesh>
            {/* Foot */}
            <mesh position={[0, -0.55, 0.05]}>
              <boxGeometry args={[0.18, 0.08, 0.28]} />
              <meshStandardMaterial color="#222" roughness={0.8} />
            </mesh>
          </group>
          <group position={[0.15, -0.35, 0]} rotation={[legSwing, 0, 0]}>
            <mesh position={[0, -0.25, 0]} castShadow>
              <boxGeometry args={[0.18, 0.55, 0.18]} />
              <meshStandardMaterial color={accent} roughness={0.5} />
            </mesh>
            {/* Foot */}
            <mesh position={[0, -0.55, 0.05]}>
              <boxGeometry args={[0.18, 0.08, 0.28]} />
              <meshStandardMaterial color="#222" roughness={0.8} />
            </mesh>
          </group>

          {/* Character-specific details */}
          {character.id === 'thor' && (
            <mesh position={[0.5, 0.1, 0]} rotation={[0, 0, -0.3]}>
              <cylinderGeometry args={[0.03, 0.05, 0.6]} />
              <meshStandardMaterial color="#888" metalness={0.9} roughness={0.1} />
            </mesh>
          )}
          {character.id === 'captainamerica' && (
            <mesh position={[-0.5, 0.2, 0.1]}>
              <cylinderGeometry args={[0.2, 0.2, 0.05, 16]} />
              <meshStandardMaterial color="#2c3e8e" metalness={0.5} roughness={0.3} />
            </mesh>
          )}
          {(character.id === 'ironman' || character.id === 'ultron') && (
            <pointLight position={[0, 0.35, 0.3]} color={accent} intensity={1} distance={3} />
          )}
          {character.id === 'doctorstrange' && (
            <mesh position={[0, 0.3, -0.25]}>
              <planeGeometry args={[0.8, 1]} />
              <meshStandardMaterial color="#c0392b" side={THREE.DoubleSide} transparent opacity={0.6} />
            </mesh>
          )}

          {/* Glow effect */}
          <pointLight position={[0, 0.5, 0.5]} color={color} intensity={0.5} distance={3} />
        </group>
      </group>
    </group>
  );
}

export { JUMP_HEIGHT, JUMP_DURATION, SLIDE_DURATION };
