import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store/gameStore';
import { LANE_WIDTH } from './Road';

export default function CameraController() {
  const { camera } = useThree();
  const shakeRef = useRef(0);
  const shakeIntensity = useRef(0);

  useFrame((_, delta) => {
    const state = useGameStore.getState();
    const lane = state.lane;
    const isHit = state.isHit;
    const speed = state.speed;

    // Target position
    const targetX = lane * LANE_WIDTH * 0.3;
    const targetY = 4 + (speed - 15) * 0.02;
    const targetZ = 7;

    // Smooth follow
    camera.position.x += (targetX - camera.position.x) * 3 * delta;
    camera.position.y += (targetY - camera.position.y) * 3 * delta;
    camera.position.z += (targetZ - camera.position.z) * 3 * delta;

    // Look at target (slightly ahead of player)
    const lookTarget = new THREE.Vector3(
      lane * LANE_WIDTH * 0.15,
      1.5,
      -8
    );

    // Smooth look direction
    const currentLook = new THREE.Vector3();
    camera.getWorldDirection(currentLook);
    const targetDirection = lookTarget.clone().sub(camera.position).normalize();
    currentLook.lerp(targetDirection, 5 * delta);

    camera.lookAt(
      camera.position.x + currentLook.x * 10,
      camera.position.y + currentLook.y * 10,
      camera.position.z + currentLook.z * 10
    );

    // Camera shake on hit
    if (isHit) {
      shakeIntensity.current = 0.3;
      shakeRef.current += delta * 40;
      camera.position.x += Math.sin(shakeRef.current * 7) * shakeIntensity.current;
      camera.position.y += Math.cos(shakeRef.current * 5) * shakeIntensity.current * 0.5;
    } else {
      shakeIntensity.current *= 0.95;
      shakeRef.current = 0;
    }

    // Dynamic FOV based on speed
    const targetFov = 65 + (speed - 15) * 0.5;
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov += (targetFov - camera.fov) * 2 * delta;
      camera.updateProjectionMatrix();
    }
  });

  return null;
}
