import { useEffect, useState, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { AudioManager } from '../managers/AudioManager';

export default function HUD() {
  const score = useGameStore((s) => s.score);
  const bestScore = useGameStore((s) => s.bestScore);
  const countdown = useGameStore((s) => s.countdown);
  const gameStarted = useGameStore((s) => s.gameStarted);
  const isPaused = useGameStore((s) => s.isPaused);
  const newHighScore = useGameStore((s) => s.newHighScore);
  const togglePause = useGameStore((s) => s.togglePause);
  const isHit = useGameStore((s) => s.isHit);
  const speed = useGameStore((s) => s.speed);
  const selectedCharacter = useGameStore((s) => s.selectedCharacter);
  
  const [showNewHigh, setShowNewHigh] = useState(false);
  const [displayScore, setDisplayScore] = useState(0);
  const prevNewHigh = useRef(false);
  const scoreRef = useRef(0);

  // Smooth score animation
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayScore(prev => {
        const diff = scoreRef.current - prev;
        if (Math.abs(diff) < 1) return Math.floor(scoreRef.current);
        return prev + diff * 0.2;
      });
    }, 16);
    return () => clearInterval(interval);
  }, []);

  // Countdown logic
  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      AudioManager.playCountdown();
      const timer = setTimeout(() => {
        useGameStore.getState().setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      AudioManager.playGo();
      setTimeout(() => {
        useGameStore.getState().setCountdown(null);
        useGameStore.getState().setGameStarted(true);
      }, 500);
    }
  }, [countdown]);

  // New high score animation
  useEffect(() => {
    if (newHighScore && !prevNewHigh.current && gameStarted) {
      setShowNewHigh(true);
      setTimeout(() => setShowNewHigh(false), 3000);
    }
    prevNewHigh.current = newHighScore;
  }, [newHighScore, gameStarted]);

  const characterColor = selectedCharacter?.color || '#00d4ff';

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {/* Countdown */}
      {countdown !== null && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className="relative"
            key={countdown}
          >
            <div 
              className="text-8xl md:text-9xl font-black animate-bounce"
              style={{
                background: countdown > 0
                  ? 'linear-gradient(135deg, #00d4ff 0%, #7b2fbe 100%)'
                  : 'linear-gradient(135deg, #ffcc00 0%, #ff6600 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: `drop-shadow(0 0 40px ${countdown > 0 ? 'rgba(0,212,255,0.6)' : 'rgba(255,200,0,0.6)'})`,
              }}
            >
              {countdown > 0 ? countdown : 'GO!'}
            </div>
            {/* Pulse ring */}
            <div 
              className="absolute inset-0 rounded-full animate-ping"
              style={{
                background: countdown > 0 
                  ? 'rgba(0,212,255,0.2)' 
                  : 'rgba(255,200,0,0.2)',
                transform: 'scale(2)',
              }}
            />
          </div>
        </div>
      )}

      {/* Hit flash effect */}
      {isHit && (
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle, rgba(255,0,0,0.4) 0%, rgba(255,0,0,0.1) 50%, transparent 70%)',
            animation: 'pulse 0.2s ease-in-out infinite',
          }}
        />
      )}

      {/* HUD - only show when game started */}
      {gameStarted && !isHit && (
        <>
          {/* Best Score - Top Left */}
          <div className="absolute top-4 left-4">
            <div 
              className="px-4 py-3 rounded-xl backdrop-blur-md"
              style={{
                background: 'rgba(0,0,0,0.6)',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-yellow-400">🏆</span>
                <span className="text-[10px] uppercase tracking-[0.15em] text-yellow-400/70 font-semibold">
                  Best Score
                </span>
              </div>
              <div 
                className="text-2xl md:text-3xl font-black tabular-nums"
                style={{ color: '#ffd700' }}
              >
                {Math.floor(bestScore).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Current Score - Top Center */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2">
            <div 
              className="px-6 py-3 rounded-xl backdrop-blur-md text-center"
              style={{
                background: 'rgba(0,0,0,0.6)',
                border: `2px solid ${characterColor}40`,
                boxShadow: `0 4px 30px rgba(0,0,0,0.4), 0 0 20px ${characterColor}20`,
              }}
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                <span>🏃</span>
                <span 
                  className="text-[10px] uppercase tracking-[0.15em] font-semibold"
                  style={{ color: `${characterColor}90` }}
                >
                  Running Score
                </span>
              </div>
              <div 
                className="text-3xl md:text-4xl font-black tabular-nums transition-all duration-100"
                style={{ 
                  color: characterColor,
                  textShadow: `0 0 20px ${characterColor}60`,
                }}
              >
                {Math.floor(displayScore).toLocaleString()}
              </div>
              
              {/* Speed indicator */}
              <div className="flex items-center justify-center gap-1 mt-1">
                <span className="text-[9px] text-gray-400">⚡</span>
                <div 
                  className="h-1 rounded-full overflow-hidden w-20"
                  style={{ background: 'rgba(255,255,255,0.1)' }}
                >
                  <div 
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, ((speed - 15) / 30) * 100)}%`,
                      background: `linear-gradient(90deg, ${characterColor}, ${characterColor}aa)`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pause Button - Top Right */}
          <div className="absolute top-4 right-4 pointer-events-auto">
            <button
              onClick={() => { togglePause(); AudioManager.playClick(); }}
              className="w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all duration-200 hover:scale-110 active:scale-95"
              style={{
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'white',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              }}
            >
              {isPaused ? '▶️' : '⏸️'}
            </button>
          </div>

          {/* New High Score animation */}
          {showNewHigh && (
            <div className="absolute top-24 left-1/2 -translate-x-1/2">
              <div 
                className="px-6 py-3 rounded-full text-base font-bold tracking-widest uppercase animate-bounce"
                style={{
                  background: 'linear-gradient(135deg, #ffd700 0%, #ff6600 100%)',
                  color: '#000',
                  boxShadow: '0 0 40px rgba(255,200,0,0.6)',
                }}
              >
                🏆 NEW HIGH SCORE! 🏆
              </div>
            </div>
          )}

          {/* Mobile swipe hint - bottom center */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 md:hidden">
            <div 
              className="px-4 py-2 rounded-lg text-center"
              style={{
                background: 'rgba(0,0,0,0.5)',
                color: 'rgba(255,255,255,0.4)',
                fontSize: '10px',
              }}
            >
              Swipe ↑Jump ↓Slide ←→Move
            </div>
          </div>
        </>
      )}

      {/* Pause overlay */}
      {isPaused && (
        <div 
          className="absolute inset-0 flex items-center justify-center pointer-events-auto"
          style={{
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div className="text-center">
            <h2 
              className="text-5xl md:text-6xl font-black mb-8"
              style={{
                background: 'linear-gradient(135deg, #00d4ff 0%, #7b2fbe 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              PAUSED
            </h2>
            
            {/* Current stats */}
            <div className="flex gap-4 justify-center mb-8">
              <div 
                className="px-4 py-2 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                <div className="text-xs text-gray-400 uppercase">Score</div>
                <div className="text-xl font-bold" style={{ color: characterColor }}>
                  {Math.floor(score).toLocaleString()}
                </div>
              </div>
              <div 
                className="px-4 py-2 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                <div className="text-xs text-gray-400 uppercase">Best</div>
                <div className="text-xl font-bold text-yellow-400">
                  {Math.floor(bestScore).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 items-center">
              <button
                onClick={() => { togglePause(); AudioManager.playClick(); }}
                className="py-3 px-10 rounded-xl font-bold tracking-widest uppercase transition-all hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, ${characterColor} 0%, ${characterColor}aa 100%)`,
                  color: 'white',
                  boxShadow: `0 0 20px ${characterColor}50`,
                }}
              >
                ▶️ Resume
              </button>
              <button
                onClick={() => { useGameStore.getState().setScreen('menu'); AudioManager.playClick(); }}
                className="py-3 px-10 rounded-xl font-bold tracking-widest uppercase transition-all hover:scale-105"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'rgba(255,255,255,0.7)',
                }}
              >
                🏠 Main Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile touch controls */}
      <MobileControls />
    </div>
  );
}

function MobileControls() {
  const gameStarted = useGameStore((s) => s.gameStarted);
  const isPaused = useGameStore((s) => s.isPaused);
  const isHit = useGameStore((s) => s.isHit);

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (!gameStarted || isPaused || isHit) return;
      const touch = e.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!gameStarted || isPaused || isHit || !touchStartRef.current) return;
      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStartRef.current.x;
      const dy = touch.clientY - touchStartRef.current.y;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);
      const threshold = 30;

      const state = useGameStore.getState();

      if (absDx > absDy && absDx > threshold) {
        // Horizontal swipe
        if (dx > 0) {
          state.setLane(state.lane + 1);
        } else {
          state.setLane(state.lane - 1);
        }
        AudioManager.playClick();
      } else if (absDy > threshold) {
        // Vertical swipe
        if (dy < 0) {
          // Swipe up = jump
          if (!state.isJumping) {
            state.setJumping(true);
            AudioManager.playJump();
          }
        } else {
          // Swipe down = slide
          if (!state.isSliding) {
            state.setSliding(true);
            AudioManager.playSlide();
          }
        }
      }

      touchStartRef.current = null;
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [gameStarted, isPaused, isHit]);

  return null;
}
