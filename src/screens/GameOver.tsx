import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { AudioManager } from '../managers/AudioManager';

export default function GameOver() {
  const { 
    score, 
    bestScore, 
    distanceTravelled, 
    timeSurvived, 
    newHighScore, 
    selectedCharacter,
    restart, 
    setScreen 
  } = useGameStore();
  
  const [show, setShow] = useState(false);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    AudioManager.stopMusic();
    AudioManager.playGameOver();
    setTimeout(() => setShow(true), 100);
    setTimeout(() => setShowStats(true), 600);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleRestart = () => {
    AudioManager.playClick();
    AudioManager.startMusic();
    restart();
  };

  const handleCharSelect = () => {
    AudioManager.playClick();
    setScreen('characterSelect');
  };

  const handleMainMenu = () => {
    AudioManager.playClick();
    setScreen('menu');
  };

  const characterColor = selectedCharacter?.color || '#00d4ff';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: 'rgba(0,0,0,0.9)',
        backdropFilter: 'blur(15px)',
      }}
    >
      <div className={`flex flex-col items-center max-w-md w-full px-6 transition-all duration-700 ${show ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
        {/* Game Over Title */}
        <h1 
          className="text-5xl md:text-7xl font-black tracking-wider mb-3"
          style={{
            background: 'linear-gradient(135deg, #ff0044 0%, #ff6600 50%, #ffcc00 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 30px rgba(255,0,68,0.5))',
          }}
        >
          GAME OVER
        </h1>

        {/* Character that died */}
        {selectedCharacter && (
          <div className="mb-4 flex items-center gap-2 opacity-60">
            <span className="text-2xl">{selectedCharacter.emoji}</span>
            <span className="text-gray-400">{selectedCharacter.name}</span>
          </div>
        )}

        {/* New High Score */}
        {newHighScore && (
          <div 
            className="mb-6 py-3 px-8 rounded-full text-base font-bold tracking-widest uppercase animate-pulse"
            style={{
              background: 'linear-gradient(135deg, #ffd700 0%, #ff6600 100%)',
              color: '#000',
              boxShadow: '0 0 40px rgba(255,200,0,0.6)',
            }}
          >
            🏆 NEW HIGH SCORE! 🏆
          </div>
        )}

        {/* Stats */}
        <div className={`grid grid-cols-2 gap-4 mb-8 w-full transition-all duration-500 ${showStats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div 
            className="p-5 rounded-2xl text-center"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: `2px solid ${characterColor}30`,
              boxShadow: `0 0 20px ${characterColor}10`,
            }}
          >
            <div className="text-xs uppercase tracking-[0.15em] text-gray-400 mb-2 flex items-center justify-center gap-1">
              <span>🏃</span> Running Score
            </div>
            <div 
              className="text-3xl md:text-4xl font-black"
              style={{ color: characterColor }}
            >
              {Math.floor(score).toLocaleString()}
            </div>
          </div>
          <div 
            className="p-5 rounded-2xl text-center"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '2px solid rgba(255,200,0,0.3)',
              boxShadow: '0 0 20px rgba(255,200,0,0.1)',
            }}
          >
            <div className="text-xs uppercase tracking-[0.15em] text-gray-400 mb-2 flex items-center justify-center gap-1">
              <span>🏆</span> Best Score
            </div>
            <div className="text-3xl md:text-4xl font-black text-yellow-400">
              {Math.floor(bestScore).toLocaleString()}
            </div>
          </div>
          <div 
            className="p-4 rounded-2xl text-center"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div className="text-xs uppercase tracking-[0.15em] text-gray-500 mb-1">
              📏 Distance
            </div>
            <div className="text-xl font-bold text-white">
              {Math.floor(distanceTravelled).toLocaleString()}m
            </div>
          </div>
          <div 
            className="p-4 rounded-2xl text-center"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div className="text-xs uppercase tracking-[0.15em] text-gray-500 mb-1">
              ⏱️ Time
            </div>
            <div className="text-xl font-bold text-white">
              {formatTime(timeSurvived)}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={handleRestart}
            className="py-4 px-8 rounded-xl font-bold tracking-widest uppercase transition-all duration-300 hover:scale-105 active:scale-95 text-lg"
            style={{
              background: `linear-gradient(135deg, ${characterColor} 0%, ${characterColor}aa 100%)`,
              boxShadow: `0 0 30px ${characterColor}40`,
              color: 'white',
            }}
          >
            🔄 Play Again
          </button>
          <button
            onClick={handleCharSelect}
            className="py-3 px-8 rounded-xl font-bold tracking-widest uppercase transition-all duration-300 hover:scale-105 active:scale-95"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '2px solid rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.8)',
            }}
          >
            🦸 Change Character
          </button>
          <button
            onClick={handleMainMenu}
            className="py-3 px-8 rounded-xl font-bold tracking-widest uppercase transition-all duration-300 hover:scale-105 active:scale-95"
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.5)',
            }}
          >
            🏠 Main Menu
          </button>
        </div>
      </div>
    </div>
  );
}
