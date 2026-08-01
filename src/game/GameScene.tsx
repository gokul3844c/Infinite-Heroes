import { Canvas } from '@react-three/fiber';
import { useGameStore } from '../store/gameStore';
import Road from './Road';
import Player from './Player';
import Obstacles from './Obstacles';
import CameraController from './CameraController';
import HUD from './HUD';
import InputHandler from './InputHandler';
import Environment from './Environment';
import SpeedLines from './SpeedLines';
import ScoreManager from './ScoreManager';

export default function GameScene() {
  const settings = useGameStore((s) => s.settings);

  const shadowQuality = {
    low: 512,
    medium: 1024,
    high: 2048,
    ultra: 4096,
  }[settings.graphicsQuality];

  return (
    <div className="fixed inset-0">
      <Canvas
        shadows={settings.graphicsQuality !== 'low'}
        camera={{ position: [0, 4, 7], fov: 65, near: 0.1, far: 500 }}
        gl={{
          antialias: settings.graphicsQuality !== 'low',
          powerPreference: 'high-performance',
        }}
        style={{ background: '#0a0a1a' }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.3} color="#4466aa" />
        <directionalLight
          position={[5, 15, 5]}
          intensity={1.2}
          color="#ffffff"
          castShadow={settings.graphicsQuality !== 'low'}
          shadow-mapSize-width={shadowQuality}
          shadow-mapSize-height={shadowQuality}
          shadow-camera-far={100}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20}
        />
        <directionalLight position={[-3, 8, -5]} intensity={0.4} color="#6644cc" />

        {/* Fog */}
        <fog attach="fog" args={['#0a0a1a', 30, 100]} />

        {/* Scene */}
        <Environment />
        <Road />
        <Player />
        <Obstacles />
        <SpeedLines />
        <CameraController />
      </Canvas>

      {/* HUD Overlay */}
      <HUD />
      <InputHandler />
      <ScoreManager />
    </div>
  );
}
