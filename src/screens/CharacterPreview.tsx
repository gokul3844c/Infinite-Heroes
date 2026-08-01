import { useEffect, useState, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { AudioManager } from '../managers/AudioManager';

export default function CharacterPreview() {
  const { selectedCharacter, startGame, setScreen } = useGameStore();
  const [rotation, setRotation] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const animRef = useRef<number>(0);

  useEffect(() => {
    // Entry animation
    setTimeout(() => setIsLoaded(true), 100);

    // Rotation animation
    const animate = () => {
      setRotation(prev => prev + 0.5);
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animRef.current);
  }, []);

  const handleStart = () => {
    AudioManager.playClick();
    AudioManager.startMusic();
    startGame();
  };

  const handleBack = () => {
    AudioManager.playClick();
    setScreen('characterSelect');
  };

  if (!selectedCharacter) {
    setScreen('characterSelect');
    return null;
  }

  const bobY = Math.sin(rotation * 0.02) * 8;
  const legSwing = Math.sin(rotation * 0.06) * 25;

  return (
    <div 
      className="fixed inset-0 overflow-hidden"
      style={{
        background: `radial-gradient(ellipse at 50% 100%, ${selectedCharacter.color}30 0%, #0a0a1a 50%, #0a0a1a 100%)`,
      }}
    >
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Spotlight effect */}
        <div 
          className="absolute w-[600px] h-[600px] rounded-full"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -40%)',
            background: `radial-gradient(circle, ${selectedCharacter.color}20 0%, transparent 60%)`,
            filter: 'blur(40px)',
          }}
        />
        
        {/* Floating particles */}
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${2 + Math.random() * 4}px`,
              height: `${2 + Math.random() * 4}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: i % 2 === 0 ? selectedCharacter.color : selectedCharacter.accentColor,
              opacity: 0.3 + Math.random() * 0.4,
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}

        {/* Light rays */}
        <div 
          className="absolute w-full h-full"
          style={{
            background: `conic-gradient(from ${rotation * 0.2}deg at 50% 60%, transparent 0deg, ${selectedCharacter.color}08 10deg, transparent 20deg, transparent 30deg, ${selectedCharacter.accentColor}08 40deg, transparent 50deg)`,
          }}
        />
      </div>

      <div className={`relative z-10 flex flex-col items-center justify-center h-full transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Character type badge */}
        <div 
          className="mb-4 px-6 py-2 rounded-full text-sm font-bold tracking-[0.2em] uppercase"
          style={{
            background: selectedCharacter.type === 'hero' 
              ? 'rgba(52, 152, 219, 0.2)' 
              : 'rgba(231, 76, 60, 0.2)',
            color: selectedCharacter.type === 'hero' 
              ? 'rgba(100, 200, 255, 1)' 
              : 'rgba(255, 100, 100, 1)',
            border: `2px solid ${selectedCharacter.type === 'hero' ? 'rgba(52, 152, 219, 0.4)' : 'rgba(231, 76, 60, 0.4)'}`,
          }}
        >
          {selectedCharacter.type === 'hero' ? '🦸 Hero' : '👿 Villain'}
        </div>

        {/* Character display */}
        <div 
          className="relative mb-6"
          style={{ transform: `translateY(${bobY}px)` }}
        >
          {/* Platform */}
          <div 
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-40 h-8"
            style={{
              background: `radial-gradient(ellipse, ${selectedCharacter.color}60 0%, transparent 70%)`,
              filter: 'blur(8px)',
            }}
          />
          <div 
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-32 h-4 rounded-full"
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${selectedCharacter.color}40 50%, transparent 100%)`,
            }}
          />

          {/* 3D Character */}
          <div 
            className="flex flex-col items-center"
            style={{
              transform: `rotateY(${rotation * 0.3}deg) perspective(800px)`,
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Head */}
            <div 
              className="w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center text-5xl md:text-6xl shadow-2xl relative overflow-hidden"
              style={{
                background: `linear-gradient(145deg, ${selectedCharacter.color} 0%, ${selectedCharacter.accentColor} 100%)`,
                boxShadow: `0 0 50px ${selectedCharacter.color}80, inset 0 -8px 20px rgba(0,0,0,0.4)`,
              }}
            >
              <span className="relative z-10 drop-shadow-lg">{selectedCharacter.emoji}</span>
              {/* Shine */}
              <div 
                className="absolute top-0 left-0 w-full h-1/2 rounded-t-full"
                style={{
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.35) 0%, transparent 100%)',
                }}
              />
            </div>

            {/* Neck */}
            <div 
              className="w-6 h-3 -mt-1"
              style={{ background: selectedCharacter.color }}
            />

            {/* Body */}
            <div 
              className="w-20 h-24 md:w-24 md:h-28 rounded-xl -mt-2 relative overflow-hidden shadow-2xl"
              style={{
                background: `linear-gradient(180deg, ${selectedCharacter.color} 0%, ${selectedCharacter.accentColor} 100%)`,
                boxShadow: `0 0 30px ${selectedCharacter.color}50, inset 0 -8px 20px rgba(0,0,0,0.4)`,
              }}
            >
              {/* Chest symbol */}
              <div 
                className="absolute top-4 left-1/2 -translate-x-1/2 text-3xl"
                style={{ filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.5))' }}
              >
                {selectedCharacter.icon}
              </div>
              
              {/* Belt */}
              <div 
                className="absolute bottom-4 left-0 right-0 h-3"
                style={{ background: selectedCharacter.accentColor }}
              />
            </div>

            {/* Arms */}
            <div className="absolute top-[140px] md:top-[180px] flex justify-between w-32 md:w-40">
              <div 
                className="w-5 h-16 md:w-6 md:h-20 rounded-full"
                style={{
                  background: selectedCharacter.color,
                  transform: `rotateX(${legSwing * 0.5}deg)`,
                  boxShadow: 'inset 0 -4px 8px rgba(0,0,0,0.3)',
                }}
              />
              <div 
                className="w-5 h-16 md:w-6 md:h-20 rounded-full"
                style={{
                  background: selectedCharacter.color,
                  transform: `rotateX(${-legSwing * 0.5}deg)`,
                  boxShadow: 'inset 0 -4px 8px rgba(0,0,0,0.3)',
                }}
              />
            </div>

            {/* Legs */}
            <div className="flex gap-2 -mt-2">
              <div 
                className="w-7 h-12 md:w-8 md:h-14 rounded-b-xl relative"
                style={{
                  background: selectedCharacter.accentColor,
                  transform: `rotateX(${legSwing}deg)`,
                  transformOrigin: 'top',
                  boxShadow: 'inset 0 -4px 8px rgba(0,0,0,0.3)',
                }}
              >
                {/* Foot */}
                <div 
                  className="absolute -bottom-1 left-0 w-full h-3 rounded-b"
                  style={{ background: '#222' }}
                />
              </div>
              <div 
                className="w-7 h-12 md:w-8 md:h-14 rounded-b-xl relative"
                style={{
                  background: selectedCharacter.accentColor,
                  transform: `rotateX(${-legSwing}deg)`,
                  transformOrigin: 'top',
                  boxShadow: 'inset 0 -4px 8px rgba(0,0,0,0.3)',
                }}
              >
                {/* Foot */}
                <div 
                  className="absolute -bottom-1 left-0 w-full h-3 rounded-b"
                  style={{ background: '#222' }}
                />
              </div>
            </div>
          </div>

          {/* Power aura */}
          <div 
            className="absolute inset-0 -z-10"
            style={{
              background: `radial-gradient(ellipse at 50% 30%, ${selectedCharacter.color}30 0%, transparent 50%)`,
              filter: 'blur(20px)',
              transform: `scale(${1 + Math.sin(rotation * 0.03) * 0.1})`,
            }}
          />
        </div>

        {/* Character name */}
        <h1 
          className="text-4xl md:text-6xl font-black tracking-wider mb-2"
          style={{
            background: `linear-gradient(135deg, ${selectedCharacter.color} 0%, ${selectedCharacter.accentColor} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: `drop-shadow(0 0 20px ${selectedCharacter.color}60)`,
          }}
        >
          {selectedCharacter.name.toUpperCase()}
        </h1>

        <p className="text-gray-400 mb-8 tracking-widest uppercase text-sm">
          Ready for battle
        </p>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleBack}
            className="py-3 px-8 rounded-xl font-bold tracking-wider uppercase transition-all duration-300 hover:scale-105 active:scale-95"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '2px solid rgba(255,255,255,0.2)',
              color: 'rgba(255,255,255,0.7)',
            }}
          >
            ← Back
          </button>
          <button
            onClick={handleStart}
            className="py-4 px-12 rounded-xl font-bold text-lg tracking-wider uppercase transition-all duration-300 hover:scale-105 active:scale-95 relative overflow-hidden group"
            style={{
              background: `linear-gradient(135deg, ${selectedCharacter.color} 0%, ${selectedCharacter.accentColor} 100%)`,
              boxShadow: `0 0 40px ${selectedCharacter.color}50`,
              color: 'white',
            }}
          >
            <span className="relative z-10">🎮 START GAME</span>
            <div 
              className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"
            />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
      `}</style>
    </div>
  );
}
