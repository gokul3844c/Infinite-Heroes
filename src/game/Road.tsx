import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store/gameStore';

const ROAD_LENGTH = 200;
const ROAD_WIDTH = 9;
const LANE_WIDTH = 3;

// Seeded random for stable building generation
function seededRandom(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

interface BuildingData {
  height: number;
  width: number;
  xPos: number;
  zPos: number;
  hue: number;
  saturation: number;
  lightness: number;
}

interface SegmentData {
  id: number;
  offset: number;
  buildings: BuildingData[];
}

export default function Road() {
  const roadRef = useRef<THREE.Group>(null);
  const speed = useGameStore((s) => s.speed);
  const gameStarted = useGameStore((s) => s.gameStarted);
  const isPaused = useGameStore((s) => s.isPaused);

  const segments = useMemo(() => {
    const segs: SegmentData[] = [];
    for (let i = 0; i < 4; i++) {
      const buildings: BuildingData[] = [];
      for (let j = 0; j < 10; j++) {
        const seed = i * 100 + j;
        const side = j % 2 === 0 ? -1 : 1;
        const h = 8 + seededRandom(seed) * 25;
        const w = 3 + seededRandom(seed + 1) * 5;
        const xPos = side * (ROAD_WIDTH / 2 + 3 + w / 2 + seededRandom(seed + 2) * 3);
        const zPos = -j * (ROAD_LENGTH / 10) + ROAD_LENGTH / 2 - ROAD_LENGTH / 20;
        buildings.push({
          height: h,
          width: w,
          xPos,
          zPos,
          hue: 220 + seededRandom(seed + 3) * 30,
          saturation: 10 + seededRandom(seed + 4) * 20,
          lightness: 8 + seededRandom(seed + 5) * 10,
        });
      }
      segs.push({ id: i, offset: i * ROAD_LENGTH, buildings });
    }
    return segs;
  }, []);

  const offsetRef = useRef(0);

  useFrame((_, delta) => {
    if (!gameStarted || isPaused) return;
    offsetRef.current += speed * delta;

    if (roadRef.current) {
      roadRef.current.children.forEach((child, i) => {
        if (i >= segments.length) return;
        const seg = child as THREE.Group;
        const basePos = segments[i].offset - offsetRef.current;
        let pos = basePos % (ROAD_LENGTH * 4);
        if (pos < -ROAD_LENGTH) pos += ROAD_LENGTH * 4;
        seg.position.z = -pos;
      });
    }
  });

  return (
    <group ref={roadRef}>
      {segments.map((seg) => (
        <group key={seg.id} position={[0, 0, -seg.offset]}>
          {/* Main road surface */}
          <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[ROAD_WIDTH, ROAD_LENGTH]} />
            <meshStandardMaterial color="#1a1a2e" roughness={0.8} />
          </mesh>

          {/* Lane dividers */}
          {[-LANE_WIDTH / 2, LANE_WIDTH / 2].map((x, i) => (
            <group key={`divider-${i}`}>
              {Array.from({ length: Math.floor(ROAD_LENGTH / 4) }).map((_, j) => (
                <mesh key={j} position={[x, 0.01, -j * 4 + ROAD_LENGTH / 2]} rotation={[-Math.PI / 2, 0, 0]}>
                  <planeGeometry args={[0.1, 2]} />
                  <meshStandardMaterial color="#ffcc00" emissive="#ffcc00" emissiveIntensity={0.3} />
                </mesh>
              ))}
            </group>
          ))}

          {/* Road edges */}
          {[-ROAD_WIDTH / 2, ROAD_WIDTH / 2].map((x, i) => (
            <mesh key={`edge-${i}`} position={[x, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.15, ROAD_LENGTH]} />
              <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.2} />
            </mesh>
          ))}

          {/* Sidewalks */}
          {[-ROAD_WIDTH / 2 - 1.5, ROAD_WIDTH / 2 + 1.5].map((x, i) => (
            <mesh key={`sidewalk-${i}`} position={[x, 0.1, 0]} receiveShadow>
              <boxGeometry args={[3, 0.2, ROAD_LENGTH]} />
              <meshStandardMaterial color="#2d3436" roughness={0.9} />
            </mesh>
          ))}

          {/* Buildings */}
          {seg.buildings.map((b, j) => (
            <group key={`building-${j}`}>
              <mesh position={[b.xPos, b.height / 2, b.zPos]} castShadow receiveShadow>
                <boxGeometry args={[b.width, b.height, ROAD_LENGTH / 12]} />
                <meshStandardMaterial
                  color={`hsl(${b.hue}, ${b.saturation}%, ${b.lightness}%)`}
                  roughness={0.9}
                />
              </mesh>
              {/* Simplified window glow strip */}
              <mesh position={[
                b.xPos,
                b.height * 0.5,
                b.zPos + (b.xPos > 0 ? -ROAD_LENGTH / 24 - 0.02 : ROAD_LENGTH / 24 + 0.02),
              ]}>
                <planeGeometry args={[b.width * 0.85, b.height * 0.8]} />
                <meshStandardMaterial
                  color="#221a00"
                  emissive="#ffd700"
                  emissiveIntensity={0.15}
                  transparent
                  opacity={0.6}
                />
              </mesh>
            </group>
          ))}

          {/* Street lights */}
          {Array.from({ length: 6 }).map((_, j) => {
            const side = j % 2 === 0 ? -1 : 1;
            const zPos = -j * (ROAD_LENGTH / 6) + ROAD_LENGTH / 2;
            return (
              <group key={`light-${j}`}>
                <mesh position={[side * (ROAD_WIDTH / 2 + 0.5), 3, zPos]}>
                  <cylinderGeometry args={[0.05, 0.05, 6]} />
                  <meshStandardMaterial color="#555" metalness={0.8} />
                </mesh>
                <mesh position={[side * (ROAD_WIDTH / 2), 5.8, zPos]}>
                  <sphereGeometry args={[0.15]} />
                  <meshStandardMaterial color="#ffdd88" emissive="#ffdd88" emissiveIntensity={2} />
                </mesh>
                <pointLight
                  position={[side * (ROAD_WIDTH / 2), 5.5, zPos]}
                  color="#ffdd88"
                  intensity={3}
                  distance={15}
                />
              </group>
            );
          })}
        </group>
      ))}

      {/* Ground plane */}
      <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[200, 800]} />
        <meshStandardMaterial color="#0a0a15" />
      </mesh>
    </group>
  );
}

export { LANE_WIDTH, ROAD_LENGTH };
