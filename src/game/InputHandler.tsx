import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { AudioManager } from '../managers/AudioManager';

export default function InputHandler() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const state = useGameStore.getState();
      if (!state.gameStarted || state.isPaused || state.isHit) {
        // Allow escape to unpause
        if (e.key === 'Escape' && state.isPaused) {
          state.togglePause();
        }
        return;
      }

      switch (e.key) {
        case ' ':
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          if (!state.isJumping) {
            state.setJumping(true);
            AudioManager.playJump();
          }
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          if (!state.isSliding) {
            state.setSliding(true);
            AudioManager.playSlide();
          }
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          state.setLane(state.lane - 1);
          AudioManager.playClick();
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          state.setLane(state.lane + 1);
          AudioManager.playClick();
          break;
        case 'Escape':
        case 'p':
        case 'P':
          state.togglePause();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return null;
}
