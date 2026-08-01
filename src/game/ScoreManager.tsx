import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';

/**
 * ScoreManager - Handles continuous score updates during gameplay
 * The score increases based on distance travelled and speed
 */
export default function ScoreManager() {
  const gameStarted = useGameStore((s) => s.gameStarted);
  const isPaused = useGameStore((s) => s.isPaused);
  const isHit = useGameStore((s) => s.isHit);
  const lastTimeRef = useRef<number>(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (!gameStarted || isPaused || isHit) {
      lastTimeRef.current = 0;
      return;
    }

    const updateScore = (currentTime: number) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = currentTime;
      }

      const delta = (currentTime - lastTimeRef.current) / 1000; // Convert to seconds
      lastTimeRef.current = currentTime;

      const state = useGameStore.getState();
      
      // Only update if game is still running
      if (state.gameStarted && !state.isPaused && !state.isHit) {
        const speed = state.speed;
        // Score increases based on speed - faster = more points
        const scoreIncrement = speed * delta * 0.8;
        const distanceIncrement = speed * delta;
        
        // Update score and distance
        state.updateScore(scoreIncrement);
        state.updateDistance(distanceIncrement);
        state.updateTime(delta);
        
        // Gradually increase speed over time
        const newSpeed = state.baseSpeed + (state.timeSurvived * 0.12);
        state.setSpeed(Math.min(newSpeed, 50)); // Cap at 50
      }

      frameRef.current = requestAnimationFrame(updateScore);
    };

    frameRef.current = requestAnimationFrame(updateScore);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [gameStarted, isPaused, isHit]);

  return null;
}
