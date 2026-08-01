import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store/gameStore';

const LINE_COUNT = 40;

export default function SpeedLines() {
  const pointsRef = useRef<THREE.Points>(null);
  const gameStarted = useGameStore((s) => s.gameStarted);

  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(LINE_COUNT * 3);
    for (let i = 0; i < LINE_COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 1] = Math.random() * 4;
      positions[i * 3 + 2] = -Math.random() * 60;
    }
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geom;
  }, []);

  useFrame((_, delta) => {
    if (!pointsRef.current || !gameStarted) return;
    const state = useGameStore.getState();
    if (state.isPaused || state.isHit) return;

    const positions = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const speed = state.speed;

    for (let i = 0; i < LINE_COUNT; i++) {
      let z = positions.getZ(i);
      z += speed * delta;
      if (z > 5) {
        z = -50 - Math.random() * 20;
        positions.setX(i, (Math.random() - 0.5) * 12);
        positions.setY(i, Math.random() * 4);
      }
      positions.setZ(i, z);
    }
    positions.needsUpdate = true;

    // Scale based on speed
    const scale = Math.max(0, (speed - 15) / 20);
    (pointsRef.current.material as THREE.PointsMaterial).opacity = Math.min(0.5, scale * 0.5);
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        color="#88ccff"
        size={0.08}
        transparent
        opacity={0}
        sizeAttenuation
      />
    </points>
  );
}
