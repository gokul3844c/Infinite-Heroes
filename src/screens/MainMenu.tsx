import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { AudioManager } from '../managers/AudioManager';

export default function MainMenu() {
  const setScreen = useGameStore((s) => s.setScreen);
  const bestScore = useGameStore((s) => s.bestScore);
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    speed: number;
    size: number;
    opacity: number;
  }>>([]);
  const animRef = useRef<number>(0);
  const [titleGlow, setTitleGlow] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Entry animation
    setTimeout(() => setIsLoaded(true), 100);

    // Generate particles
    const p = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      speed: 0.15 + Math.random() * 0.4,
      size: 1 + Math.random() * 3,
      opacity: 0.2 + Math.random() * 0.5,
    }));
    setParticles(p);

    // Title glow animation
    let frame = 0;
    const animate = () => {
      frame++;
      setTitleGlow(Math.sin(frame * 0.025) * 0.5 + 0.5);
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animRef.current);
  }, []);

  useEffect(() => {
    // Move particles
    const interval = setInterval(() => {
      setParticles((prev) =>
        prev.map((p) => ({
          ...p,
          y: p.y - p.speed < 0 ? 100 : p.y - p.speed,
          x: p.x + Math.sin(p.y * 0.1) * 0.08,
        }))
      );
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const handlePlay = () => {
    AudioManager.init();
    AudioManager.playClick();
    setScreen('characterSelect');
  };

  const handleSettings = () => {
    AudioManager.init();
    AudioManager.playClick();
    setScreen('settings');
  };

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{
        background:
          'linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 30%, #0d1b2a 60%, #0a0a1a 100%)',
      }}
    >
      {/* Animated city background */}
      <div className="absolute inset-0">
        {/* Buildings silhouette */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[60%]"
          style={{
            background: `
              linear-gradient(0deg, rgba(10,10,26,1) 0%, transparent 100%),
              repeating-linear-gradient(90deg, 
                transparent 0px, transparent 20px, 
                rgba(30,40,80,0.5) 20px, rgba(30,40,80,0.5) 22px,
                transparent 22px, transparent 60px
              )
            `,
          }}
        >
          {/* Building shapes */}
          {[...Array(18)].map((_, i) => {
            const h = 15 + (i % 5) * 8 + Math.sin(i * 0.7) * 10;
            const w = 2.5 + (i % 3) * 1.5;
            const left = i * 5.5 + (i % 2) * 1.5;
            return (
              <div
                key={i}
                className="absolute bottom-0"
                style={{
                  left: `${left}%`,
                  width: `${w}%`,
                  height: `${h}%`,
                  background: `linear-gradient(180deg, rgba(20,30,60,0.95) 0%, rgba(10,15,30,1) 100%)`,
                  borderTop: '1px solid rgba(100,150,255,0.15)',
                }}
              >
                {/* Windows */}
                {[...Array(Math.floor(h / 5))].map((_, j) => (
                  <div
                    key={j}
                    className="flex justify-around px-0.5"
                    style={{ marginTop: '6px' }}
                  >
                    {[...Array(Math.floor(w * 1.5))].map((_, k) => (
                      <div
                        key={k}
                        className="rounded-sm"
                        style={{
                          width: '2px',
                          height: '3px',
                          background:
                            ((i + j + k) % 3 !== 0)
                              ? `rgba(255,230,${150 + ((i + k) % 3) * 35},${0.4 + ((j + k) % 4) * 0.15})`
                              : 'transparent',
                        }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {/* Moving lights (traffic) */}
        {[...Array(10)].map((_, i) => (
          <div
            key={`traffic-${i}`}
            className="absolute rounded-full"
            style={{
              width: '4px',
              height: '2px',
              background: i % 2 === 0 ? '#ff4444' : '#ffaa00',
              bottom: `${5 + (i % 4) * 4}%`,
              left: `${-10 + i * 12}%`,
              boxShadow: `0 0 10px ${i % 2 === 0 ? '#ff4444' : '#ffaa00'}`,
              animation: `moveTraffic ${4 + (i % 3) * 1.5}s linear infinite`,
              animationDelay: `${(i % 5) * 0.8}s`,
            }}
          />
        ))}

        {/* Atmospheric particles */}
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: `rgba(100, 180, 255, ${p.opacity})`,
              boxShadow: `0 0 ${p.size * 2}px rgba(100, 180, 255, ${p.opacity * 0.5})`,
            }}
          />
        ))}

        {/* Scan lines overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)',
          }}
        />
      </div>

      {/* Content */}
      <div className={`relative z-10 flex flex-col items-center justify-center h-full px-4 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Title */}
        <div className="mb-12 text-center">
          <h1
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-wider"
            style={{
              background: `linear-gradient(135deg, #00d4ff ${titleGlow * 30}%, #7b2fbe ${50 + titleGlow * 20}%, #ff0066 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: `drop-shadow(0 0 ${20 + titleGlow * 25}px rgba(0,212,255,0.5))`,
            }}
          >
            ENDLESS
          </h1>
          <h1
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-wider -mt-2"
            style={{
              background: `linear-gradient(135deg, #ff0066 0%, #ff6600 ${50 + titleGlow * 30}%, #ffcc00 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: `drop-shadow(0 0 ${20 + titleGlow * 25}px rgba(255,0,102,0.5))`,
            }}
          >
            HERO RUN
          </h1>
          <div
            className="mt-4 text-sm md:text-base tracking-[0.3em] uppercase"
            style={{ color: 'rgba(150,200,255,0.6)' }}
          >
            The Ultimate Endless Runner
          </div>
        </div>

        {/* Best Score Display */}
        {bestScore > 0 && (
          <div 
            className="mb-8 px-6 py-3 rounded-xl text-center"
            style={{
              background: 'rgba(255,200,0,0.1)',
              border: '1px solid rgba(255,200,0,0.3)',
            }}
          >
            <div className="text-xs uppercase tracking-[0.15em] text-yellow-400/60 mb-1">
              🏆 Your Best Score
            </div>
            <div className="text-2xl font-black text-yellow-400">
              {bestScore.toLocaleString()}
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <button
            onClick={handlePlay}
            className="relative group py-4 px-8 text-xl font-bold tracking-widest uppercase rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #00d4ff 0%, #0066ff 100%)',
              boxShadow:
                '0 0 40px rgba(0,100,255,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
            }}
          >
            <span className="relative z-10 text-white flex items-center justify-center gap-2">
              <span>▶</span> PLAY
            </span>
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
          </button>

          <button
            onClick={handleSettings}
            className="relative group py-3 px-8 text-lg font-bold tracking-widest uppercase rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95"
            style={{
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
              border: '2px solid rgba(255,255,255,0.2)',
              boxShadow: '0 0 15px rgba(255,255,255,0.05)',
            }}
          >
            <span className="relative z-10 text-gray-300 flex items-center justify-center gap-2">
              <span>⚙</span> SETTINGS
            </span>
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
          </button>
        </div>

        {/* Footer */}
        <div className="absolute bottom-6 text-center">
          <p className="text-xs" style={{ color: 'rgba(150,200,255,0.3)' }}>
            Use arrow keys or swipe to control • Space to jump
          </p>
        </div>
      </div>

      <style>{`
        @keyframes moveTraffic {
          0% { transform: translateX(-100vw); }
          100% { transform: translateX(200vw); }
        }
      `}</style>
    </div>
  );
}
