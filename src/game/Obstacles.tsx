import { useRef, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type React from 'react';
import { useGameStore } from '../store/gameStore';
import { LANE_WIDTH } from './Road';
import { AudioManager } from '../managers/AudioManager';

interface Obstacle {
  id: number;
  lane: number; // -1, 0, 1
  z: number;
  type: string;
  width: number;
  height: number;
  depth: number;
  color: string;
  canSlideUnder: boolean;
  passed: boolean;
}

const OBSTACLE_TYPES = [
  { type: 'car', width: 1.2, height: 1.0, depth: 2.0, color: '#e74c3c', canSlideUnder: false },
  { type: 'truck', width: 1.4, height: 1.8, depth: 3.0, color: '#3498db', canSlideUnder: false },
  { type: 'bus', width: 1.5, height: 2.0, depth: 4.0, color: '#f39c12', canSlideUnder: false },
  { type: 'barrier', width: 1.5, height: 0.8, depth: 0.5, color: '#e67e22', canSlideUnder: false },
  { type: 'cone', width: 0.4, height: 0.6, depth: 0.4, color: '#e74c3c', canSlideUnder: false },
  { type: 'block', width: 1.2, height: 1.2, depth: 1.2, color: '#7f8c8d', canSlideUnder: false },
  { type: 'beam', width: 2.8, height: 0.3, depth: 0.3, color: '#f1c40f', canSlideUnder: true }, // overhead
  { type: 'sign', width: 1.0, height: 1.5, depth: 0.2, color: '#2ecc71', canSlideUnder: false },
  { type: 'fire', width: 1.0, height: 1.0, depth: 1.0, color: '#ff4500', canSlideUnder: false },
];

const SPAWN_DISTANCE = 80;
const DESPAWN_DISTANCE = -10;
let nextId = 0;

export default function Obstacles() {
  const obstaclesRef = useRef<Obstacle[]>([]);
  const spawnTimer = useRef(0);
  const gameTime = useRef(0);

  const getSpawnInterval = useCallback(() => {
    // Decrease interval over time (harder)
    const base = 1.5;
    const minInterval = 0.4;
    const reduction = gameTime.current * 0.01;
    return Math.max(minInterval, base - reduction);
  }, []);

  useFrame((_, delta) => {
    const state = useGameStore.getState();
    if (!state.gameStarted || state.isPaused || state.isHit) return;

    const speed = state.speed;
    gameTime.current += delta;
    spawnTimer.current += delta;

    // Note: Speed increase is handled by ScoreManager

    // Spawn obstacles
    if (spawnTimer.current >= getSpawnInterval()) {
      spawnTimer.current = 0;

      // Pick random lanes (avoid impossible combos)
      const numObstacles = Math.random() > 0.7 ? 2 : 1;
      const availableLanes = [-1, 0, 1];
      const usedLanes: number[] = [];

      for (let i = 0; i < numObstacles && availableLanes.length > 0; i++) {
        const idx = Math.floor(Math.random() * availableLanes.length);
        const lane = availableLanes[idx];
        availableLanes.splice(idx, 1);
        usedLanes.push(lane);

        // Pick obstacle type based on difficulty
        const maxType = Math.min(OBSTACLE_TYPES.length, 3 + Math.floor(gameTime.current / 10));
        const typeIdx = Math.floor(Math.random() * maxType);
        const obsType = OBSTACLE_TYPES[typeIdx];

        obstaclesRef.current.push({
          id: nextId++,
          lane,
          z: SPAWN_DISTANCE,
          type: obsType.type,
          width: obsType.width,
          height: obsType.height,
          depth: obsType.depth,
          color: obsType.color,
          canSlideUnder: obsType.canSlideUnder,
          passed: false,
        });
      }
    }

    // Move obstacles
    obstaclesRef.current.forEach((obs) => {
      obs.z -= speed * delta;
    });

    // Check collisions
    const playerLane = state.lane;
    const playerY = state.isJumping ? 2 : 0;
    // player height context for collision: sliding=0.5, standing=1.6

    for (const obs of obstaclesRef.current) {
      if (obs.passed) continue;

      // Check if obstacle is in collision range
      if (obs.z < 1.5 && obs.z > -1.0) {
        // Lane check
        if (obs.lane === playerLane) {
          // Height check for jumping
          if (obs.canSlideUnder) {
            // Overhead obstacle - need to slide
            if (!state.isSliding && playerY < 1.5) {
              // Hit!
              AudioManager.playCollision();
              state.setHit();
              setTimeout(() => {
                state.gameOver();
              }, 800);
              return;
            }
          } else {
            // Ground obstacle
            if (state.isSliding) {
              // Sliding - can pass under obstacles shorter than 0.9
              if (obs.height > 0.9) {
                AudioManager.playCollision();
                state.setHit();
                setTimeout(() => {
                  state.gameOver();
                }, 800);
                return;
              }
            } else if (playerY < obs.height * 0.8) {
              // Not sliding, not jumping high enough
              AudioManager.playCollision();
              state.setHit();
              setTimeout(() => {
                state.gameOver();
              }, 800);
              return;
            }
          }
        }
      }

      if (obs.z < -1.0) {
        obs.passed = true;
      }
    }

    // Remove passed obstacles
    obstaclesRef.current = obstaclesRef.current.filter((obs) => obs.z > DESPAWN_DISTANCE);

    // Note: Score updates are handled by ScoreManager component
  });

  // Render obstacles
  return (
    <group>
      <ObstacleRenderer obstaclesRef={obstaclesRef} />
    </group>
  );
}

function ObstacleRenderer({ obstaclesRef }: { obstaclesRef: React.MutableRefObject<Obstacle[]> }) {
  const groupRef = useRef<THREE.Group>(null);
  const meshPoolRef = useRef<Map<number, THREE.Group>>(new Map());

  useFrame(() => {
    if (!groupRef.current) return;
    const obstacles = obstaclesRef.current;
    const pool = meshPoolRef.current;
    const activeIds = new Set(obstacles.map(o => o.id));

    // Remove meshes for obstacles that no longer exist
    for (const [id, mesh] of pool.entries()) {
      if (!activeIds.has(id)) {
        groupRef.current.remove(mesh);
        mesh.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            if (child.material instanceof THREE.Material) child.material.dispose();
          }
        });
        pool.delete(id);
      }
    }

    // Update or create meshes
    obstacles.forEach((obs) => {
      let group = pool.get(obs.id);
      if (!group) {
        group = createObstacleMesh(obs);
        pool.set(obs.id, group);
        groupRef.current!.add(group);
      }

      group.position.x = obs.lane * LANE_WIDTH;
      group.position.y = obs.canSlideUnder ? 1.8 : 0;
      group.position.z = -obs.z;
    });
  });

  return <group ref={groupRef} />;
}

function createObstacleMesh(obs: Obstacle): THREE.Group {
  const group = new THREE.Group();
  const color = new THREE.Color(obs.color);

  switch (obs.type) {
    case 'car': {
      // Car body
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(obs.width, obs.height * 0.5, obs.depth),
        new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.6 })
      );
      body.position.y = obs.height * 0.25;
      body.castShadow = true;
      group.add(body);
      // Car top
      const top = new THREE.Mesh(
        new THREE.BoxGeometry(obs.width * 0.8, obs.height * 0.4, obs.depth * 0.6),
        new THREE.MeshStandardMaterial({ color: color.clone().multiplyScalar(0.8), roughness: 0.2, metalness: 0.7 })
      );
      top.position.y = obs.height * 0.7;
      top.position.z = -obs.depth * 0.05;
      top.castShadow = true;
      group.add(top);
      // Headlights
      const lightGeom = new THREE.SphereGeometry(0.08, 8, 8);
      const lightMat = new THREE.MeshStandardMaterial({ color: '#ffee88', emissive: '#ffee88', emissiveIntensity: 2 });
      const l1 = new THREE.Mesh(lightGeom, lightMat);
      l1.position.set(-obs.width * 0.35, obs.height * 0.25, obs.depth * 0.51);
      const l2 = new THREE.Mesh(lightGeom, lightMat);
      l2.position.set(obs.width * 0.35, obs.height * 0.25, obs.depth * 0.51);
      group.add(l1, l2);
      // Taillights
      const tailMat = new THREE.MeshStandardMaterial({ color: '#ff0000', emissive: '#ff0000', emissiveIntensity: 1 });
      const t1 = new THREE.Mesh(lightGeom, tailMat);
      t1.position.set(-obs.width * 0.35, obs.height * 0.25, -obs.depth * 0.51);
      const t2 = new THREE.Mesh(lightGeom, tailMat);
      t2.position.set(obs.width * 0.35, obs.height * 0.25, -obs.depth * 0.51);
      group.add(t1, t2);
      // Wheels
      const wheelGeom = new THREE.CylinderGeometry(0.15, 0.15, 0.1, 8);
      const wheelMat = new THREE.MeshStandardMaterial({ color: '#111', roughness: 0.9 });
      [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([sx, sz]) => {
        const w = new THREE.Mesh(wheelGeom, wheelMat);
        w.rotation.z = Math.PI / 2;
        w.position.set(sx * obs.width * 0.5, 0.15, sz * obs.depth * 0.35);
        group.add(w);
      });
      break;
    }
    case 'truck': {
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(obs.width, obs.height, obs.depth),
        new THREE.MeshStandardMaterial({ color, roughness: 0.4, metalness: 0.4 })
      );
      body.position.y = obs.height / 2;
      body.castShadow = true;
      group.add(body);
      // Cab
      const cab = new THREE.Mesh(
        new THREE.BoxGeometry(obs.width, obs.height * 0.7, obs.depth * 0.3),
        new THREE.MeshStandardMaterial({ color: color.clone().multiplyScalar(1.2), roughness: 0.3, metalness: 0.5 })
      );
      cab.position.set(0, obs.height * 0.35, obs.depth * 0.55);
      cab.castShadow = true;
      group.add(cab);
      break;
    }
    case 'bus': {
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(obs.width, obs.height, obs.depth),
        new THREE.MeshStandardMaterial({ color, roughness: 0.4, metalness: 0.3 })
      );
      body.position.y = obs.height / 2;
      body.castShadow = true;
      group.add(body);
      // Windows
      for (let i = 0; i < 4; i++) {
        const win = new THREE.Mesh(
          new THREE.PlaneGeometry(0.3, 0.4),
          new THREE.MeshStandardMaterial({ color: '#88ccff', emissive: '#88ccff', emissiveIntensity: 0.3 })
        );
        win.position.set(obs.width * 0.51, obs.height * 0.65, -obs.depth * 0.3 + i * obs.depth * 0.2);
        win.rotation.y = Math.PI / 2;
        group.add(win);
      }
      break;
    }
    case 'barrier': {
      const barrier = new THREE.Mesh(
        new THREE.BoxGeometry(obs.width, obs.height, obs.depth),
        new THREE.MeshStandardMaterial({ color, roughness: 0.7 })
      );
      barrier.position.y = obs.height / 2;
      barrier.castShadow = true;
      group.add(barrier);
      // Stripes
      const stripe = new THREE.Mesh(
        new THREE.BoxGeometry(obs.width * 1.01, obs.height * 0.3, obs.depth * 1.01),
        new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#ffcc00', emissiveIntensity: 0.3 })
      );
      stripe.position.y = obs.height * 0.65;
      group.add(stripe);
      break;
    }
    case 'cone': {
      const cone = new THREE.Mesh(
        new THREE.ConeGeometry(obs.width * 0.4, obs.height, 8),
        new THREE.MeshStandardMaterial({ color, roughness: 0.6 })
      );
      cone.position.y = obs.height / 2;
      cone.castShadow = true;
      group.add(cone);
      // White stripe
      const stripeC = new THREE.Mesh(
        new THREE.CylinderGeometry(obs.width * 0.25, obs.width * 0.3, obs.height * 0.15, 8),
        new THREE.MeshStandardMaterial({ color: '#ffffff' })
      );
      stripeC.position.y = obs.height * 0.45;
      group.add(stripeC);
      break;
    }
    case 'block': {
      const block = new THREE.Mesh(
        new THREE.BoxGeometry(obs.width, obs.height, obs.depth),
        new THREE.MeshStandardMaterial({ color, roughness: 0.9, metalness: 0.1 })
      );
      block.position.y = obs.height / 2;
      block.castShadow = true;
      group.add(block);
      break;
    }
    case 'beam': {
      // Two poles
      const poleMat = new THREE.MeshStandardMaterial({ color: '#666', metalness: 0.8 });
      const pole1 = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2), poleMat);
      pole1.position.set(-obs.width * 0.45, 0.8, 0);
      group.add(pole1);
      const pole2 = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2), poleMat);
      pole2.position.set(obs.width * 0.45, 0.8, 0);
      group.add(pole2);
      // Beam
      const beam = new THREE.Mesh(
        new THREE.BoxGeometry(obs.width, obs.height, obs.depth),
        new THREE.MeshStandardMaterial({ color, emissive: new THREE.Color(obs.color), emissiveIntensity: 0.5 })
      );
      beam.castShadow = true;
      group.add(beam);
      break;
    }
    case 'sign': {
      // Pole
      const signPole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, obs.height),
        new THREE.MeshStandardMaterial({ color: '#888', metalness: 0.8 })
      );
      signPole.position.y = obs.height / 2;
      group.add(signPole);
      // Sign face
      const signFace = new THREE.Mesh(
        new THREE.BoxGeometry(obs.width, obs.height * 0.5, obs.depth),
        new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.3 })
      );
      signFace.position.y = obs.height * 0.8;
      signFace.castShadow = true;
      group.add(signFace);
      break;
    }
    case 'fire': {
      const fireBase = new THREE.Mesh(
        new THREE.CylinderGeometry(obs.width * 0.3, obs.width * 0.4, obs.height * 0.3, 8),
        new THREE.MeshStandardMaterial({ color: '#333', roughness: 0.9 })
      );
      fireBase.position.y = obs.height * 0.15;
      group.add(fireBase);
      // Fire glow
      const fireGlow = new THREE.Mesh(
        new THREE.ConeGeometry(obs.width * 0.35, obs.height * 0.8, 8),
        new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 2, transparent: true, opacity: 0.7 })
      );
      fireGlow.position.y = obs.height * 0.6;
      group.add(fireGlow);
      // Point light
      const light = new THREE.PointLight(obs.color, 3, 5);
      light.position.y = obs.height * 0.5;
      group.add(light);
      break;
    }
    default: {
      const defaultMesh = new THREE.Mesh(
        new THREE.BoxGeometry(obs.width, obs.height, obs.depth),
        new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.3 })
      );
      defaultMesh.position.y = obs.height / 2;
      defaultMesh.castShadow = true;
      group.add(defaultMesh);
    }
  }

  return group;
}
