import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store/gameStore';

export default function Environment() {
  const starsRef = useRef<THREE.Points>(null);
  const settings = useGameStore((s) => s.settings);

  const starCount = settings.graphicsQuality === 'low' ? 200 : settings.graphicsQuality === 'medium' ? 500 : 1000;

  const starGeometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 1] = 10 + Math.random() * 50;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 200;
    }
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geom;
  }, [starCount]);

  useFrame((_, delta) => {
    if (starsRef.current) {
      starsRef.current.rotation.y += delta * 0.005;
    }
  });

  return (
    <>
      {/* Sky gradient - dark sky sphere */}
      <mesh>
        <sphereGeometry args={[150, 16, 16]} />
        <meshBasicMaterial
          color="#060618"
          side={THREE.BackSide}
        />
      </mesh>

      {/* Stars */}
      <points ref={starsRef} geometry={starGeometry}>
        <pointsMaterial
          color="#ffffff"
          size={0.3}
          transparent
          opacity={0.8}
          sizeAttenuation
        />
      </points>

      {/* Moon */}
      <mesh position={[-30, 40, -80]}>
        <sphereGeometry args={[5, 16, 16]} />
        <meshBasicMaterial color="#ddeeff" />
      </mesh>
      <pointLight position={[-30, 40, -80]} color="#aabbdd" intensity={0.5} distance={200} />

      {/* Volumetric light beams (simple) */}
      {settings.graphicsQuality !== 'low' && (
        <>
          <mesh position={[0, 20, -50]} rotation={[0, 0, 0.2]}>
            <cylinderGeometry args={[0, 5, 40, 8, 1, true]} />
            <meshBasicMaterial color="#2244aa" transparent opacity={0.02} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[15, 20, -30]} rotation={[0, 0, -0.15]}>
            <cylinderGeometry args={[0, 3, 35, 8, 1, true]} />
            <meshBasicMaterial color="#4422aa" transparent opacity={0.02} side={THREE.DoubleSide} />
          </mesh>
        </>
      )}
    </>
  );
}
