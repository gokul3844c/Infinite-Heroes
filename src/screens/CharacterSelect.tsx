import { useState, useRef, useEffect, useMemo } from 'react';
import { useGameStore, CHARACTERS, Character } from '../store/gameStore';
import { AudioManager } from '../managers/AudioManager';

// Character card component with 3D-like visual and animations
function CharacterCard({ 
  character, 
  isSelected, 
  onClick 
}: { 
  character: Character; 
  isSelected: boolean; 
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [rotation, setRotation] = useState(0);
  const animRef = useRef<number>(0);
  const cardRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let frame = 0;
    const animate = () => {
      frame++;
      // Continuous rotation animation
      setRotation(prev => prev + (isSelected ? 1.5 : hovered ? 0.8 : 0.2));
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [isSelected, hovered]);

  // Idle bobbing animation
  const bobY = Math.sin(rotation * 0.04) * (isSelected ? 6 : hovered ? 4 : 2);
  const scale = isSelected ? 1.08 : hovered ? 1.04 : 1;

  return (
    <button
      ref={cardRef}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative flex flex-col items-center p-4 md:p-5 rounded-2xl transition-all duration-300 group overflow-hidden"
      style={{
        background: isSelected
          ? `linear-gradient(145deg, ${character.color}40 0%, ${character.accentColor}30 50%, ${character.color}20 100%)`
          : hovered 
            ? 'rgba(255,255,255,0.08)'
            : 'rgba(255,255,255,0.03)',
        border: isSelected
          ? `3px solid ${character.color}`
          : hovered
            ? '3px solid rgba(255,255,255,0.2)'
            : '3px solid rgba(255,255,255,0.05)',
        boxShadow: isSelected
          ? `0 0 40px ${character.color}50, 0 0 80px ${character.color}25, inset 0 0 40px ${character.color}15`
          : hovered 
            ? '0 0 25px rgba(255,255,255,0.08)' 
            : 'none',
        transform: `scale(${scale})`,
        minWidth: '140px',
      }}
    >
      {/* Glowing border animation */}
      {isSelected && (
        <div 
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background: `conic-gradient(from ${rotation}deg, ${character.color}, ${character.accentColor}, ${character.color})`,
            opacity: 0.3,
            filter: 'blur(8px)',
          }}
        />
      )}

      {/* Selection checkmark */}
      {isSelected && (
        <div 
          className="absolute -top-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold z-20 shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${character.color} 0%, ${character.accentColor} 100%)`,
            boxShadow: `0 0 15px ${character.color}`,
          }}
        >
          ✓
        </div>
      )}

      {/* Character Visual */}
      <div 
        className="relative w-20 h-24 md:w-24 md:h-28 flex items-center justify-center mb-3 z-10"
        style={{ transform: `translateY(${bobY}px)` }}
      >
        {/* Platform glow */}
        <div 
          className="absolute bottom-0 w-16 h-4 rounded-full"
          style={{
            background: `radial-gradient(ellipse, ${character.color}80 0%, transparent 70%)`,
            filter: 'blur(4px)',
          }}
        />

        {/* Character 3D representation */}
        <div 
          className="relative flex flex-col items-center"
          style={{
            transform: `rotateY(${rotation * 0.5}deg) perspective(500px)`,
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Head */}
          <div 
            className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-2xl md:text-3xl shadow-lg relative overflow-hidden"
            style={{
              background: `linear-gradient(145deg, ${character.color} 0%, ${character.accentColor} 100%)`,
              boxShadow: `0 0 20px ${character.color}60, inset 0 -4px 8px rgba(0,0,0,0.3)`,
            }}
          >
            <span className="relative z-10">{character.emoji}</span>
            {/* Shine effect */}
            <div 
              className="absolute top-0 left-0 w-full h-1/2 rounded-t-full"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 100%)',
              }}
            />
          </div>

          {/* Body */}
          <div 
            className="w-10 h-12 md:w-12 md:h-14 rounded-lg -mt-2 relative overflow-hidden"
            style={{
              background: `linear-gradient(180deg, ${character.color} 0%, ${character.accentColor} 100%)`,
              boxShadow: 'inset 0 -4px 8px rgba(0,0,0,0.3)',
            }}
          >
            {/* Chest symbol */}
            <div 
              className="absolute top-2 left-1/2 -translate-x-1/2 text-lg"
              style={{ filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.5))' }}
            >
              {character.icon}
            </div>
          </div>

          {/* Legs with running animation */}
          <div className="flex gap-1 -mt-1">
            <div 
              className="w-3 h-5 md:w-4 md:h-6 rounded-b-lg"
              style={{
                background: character.accentColor,
                transform: `rotateX(${Math.sin(rotation * 0.08) * 20}deg)`,
                boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.3)',
              }}
            />
            <div 
              className="w-3 h-5 md:w-4 md:h-6 rounded-b-lg"
              style={{
                background: character.accentColor,
                transform: `rotateX(${Math.sin(rotation * 0.08 + Math.PI) * 20}deg)`,
                boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.3)',
              }}
            />
          </div>
        </div>

        {/* Particle effects for selected */}
        {isSelected && (
          <>
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 rounded-full animate-ping"
                style={{
                  background: i % 2 === 0 ? character.color : character.accentColor,
                  left: `${20 + Math.sin(i * 1.2) * 30}%`,
                  top: `${30 + Math.cos(i * 1.5) * 25}%`,
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1.5s',
                }}
              />
            ))}
          </>
        )}
      </div>

      {/* Character Name */}
      <span 
        className="text-sm md:text-base font-bold tracking-wide text-center relative z-10 transition-colors duration-300"
        style={{
          color: isSelected ? character.color : hovered ? '#ffffff' : 'rgba(255,255,255,0.8)',
          textShadow: isSelected ? `0 0 10px ${character.color}` : 'none',
        }}
      >
        {character.name}
      </span>

      {/* Type badge */}
      <span 
        className="text-[10px] uppercase tracking-[0.15em] mt-1 px-2 py-0.5 rounded-full relative z-10"
        style={{
          background: character.type === 'hero' 
            ? 'rgba(52, 152, 219, 0.2)' 
            : 'rgba(231, 76, 60, 0.2)',
          color: character.type === 'hero' 
            ? 'rgba(100, 200, 255, 0.8)' 
            : 'rgba(255, 100, 100, 0.8)',
          border: `1px solid ${character.type === 'hero' ? 'rgba(52, 152, 219, 0.3)' : 'rgba(231, 76, 60, 0.3)'}`,
        }}
      >
        {character.type}
      </span>
    </button>
  );
}

export default function CharacterSelect() {
  const { selectedCharacter, selectCharacter, setScreen } = useGameStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'hero' | 'villain'>('all');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Filter characters based on search and tab
  const filteredCharacters = useMemo(() => {
    let chars = CHARACTERS;
    
    if (activeTab !== 'all') {
      chars = chars.filter(c => c.type === activeTab);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      chars = chars.filter(c => 
        c.name.toLowerCase().includes(query) ||
        c.type.toLowerCase().includes(query)
      );
    }
    
    return chars;
  }, [searchQuery, activeTab]);

  const heroes = filteredCharacters.filter(c => c.type === 'hero');
  const villains = filteredCharacters.filter(c => c.type === 'villain');

  const handleSelect = (char: Character) => {
    AudioManager.playClick();
    selectCharacter(char);
  };

  const handleContinue = () => {
    if (!selectedCharacter) return;
    AudioManager.playClick();
    setScreen('characterPreview');
  };

  const handleBack = () => {
    AudioManager.playClick();
    setScreen('menu');
  };

  return (
    <div 
      className="fixed inset-0 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 30%, #0d1b2a 60%, #0a0a1a 100%)',
      }}
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-pulse"
            style={{
              width: `${2 + Math.random() * 4}px`,
              height: `${2 + Math.random() * 4}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `rgba(${100 + Math.random() * 155}, ${100 + Math.random() * 155}, 255, ${0.2 + Math.random() * 0.3})`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
        
        {/* Gradient orbs */}
        <div 
          className="absolute w-96 h-96 rounded-full"
          style={{
            top: '10%',
            left: '10%',
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <div 
          className="absolute w-96 h-96 rounded-full"
          style={{
            bottom: '10%',
            right: '10%',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex-shrink-0 pt-6 pb-4 px-4 md:px-8">
          <h1 
            className="text-3xl md:text-5xl font-black tracking-wider text-center mb-4"
            style={{
              background: 'linear-gradient(135deg, #00d4ff 0%, #7b2fbe 50%, #ff0066 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 20px rgba(0, 212, 255, 0.3))',
            }}
          >
            SELECT YOUR HERO
          </h1>

          {/* Search and tabs */}
          <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-center justify-center max-w-3xl mx-auto">
            {/* Search bar */}
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Search characters..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 pl-10 rounded-xl text-sm font-medium outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '2px solid rgba(255,255,255,0.1)',
                  color: 'white',
                }}
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
              {(['all', 'hero', 'villain'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); AudioManager.playClick(); }}
                  className="px-5 py-2 rounded-xl font-bold text-sm tracking-wider uppercase transition-all duration-300"
                  style={{
                    background: activeTab === tab
                      ? tab === 'hero' 
                        ? 'linear-gradient(135deg, #00d4ff 0%, #0066ff 100%)'
                        : tab === 'villain'
                          ? 'linear-gradient(135deg, #ff0066 0%, #aa0044 100%)'
                          : 'linear-gradient(135deg, #7b2fbe 0%, #00d4ff 100%)'
                      : 'rgba(255,255,255,0.05)',
                    color: activeTab === tab ? 'white' : 'rgba(255,255,255,0.5)',
                    border: activeTab === tab ? 'none' : '1px solid rgba(255,255,255,0.1)',
                    boxShadow: activeTab === tab ? '0 0 20px rgba(0,100,255,0.3)' : 'none',
                  }}
                >
                  {tab === 'all' ? '✨ All' : tab === 'hero' ? '🦸 Heroes' : '👿 Villains'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Character Grid */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 md:px-8 pb-4"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.2) transparent' }}
        >
          {/* Heroes Section */}
          {heroes.length > 0 && (
            <div className="mb-8">
              <h2 
                className="text-lg md:text-xl font-bold tracking-wider mb-4 flex items-center gap-2"
                style={{ color: 'rgba(100, 200, 255, 0.8)' }}
              >
                <span>🦸</span>
                <span>HEROES</span>
                <span className="text-xs opacity-50">({heroes.length})</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                {heroes.map(char => (
                  <CharacterCard
                    key={char.id}
                    character={char}
                    isSelected={selectedCharacter?.id === char.id}
                    onClick={() => handleSelect(char)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Villains Section */}
          {villains.length > 0 && (
            <div className="mb-8">
              <h2 
                className="text-lg md:text-xl font-bold tracking-wider mb-4 flex items-center gap-2"
                style={{ color: 'rgba(255, 100, 100, 0.8)' }}
              >
                <span>👿</span>
                <span>VILLAINS</span>
                <span className="text-xs opacity-50">({villains.length})</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                {villains.map(char => (
                  <CharacterCard
                    key={char.id}
                    character={char}
                    isSelected={selectedCharacter?.id === char.id}
                    onClick={() => handleSelect(char)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* No results */}
          {filteredCharacters.length === 0 && (
            <div className="text-center py-12">
              <p className="text-xl text-gray-400">No characters found</p>
              <p className="text-sm text-gray-500 mt-2">Try a different search term</p>
            </div>
          )}
        </div>

        {/* Footer with selected character and buttons */}
        <div 
          className="flex-shrink-0 px-4 md:px-8 py-4 border-t"
          style={{
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(10px)',
            borderColor: 'rgba(255,255,255,0.1)',
          }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 max-w-4xl mx-auto">
            {/* Selected character info */}
            <div className="flex items-center gap-3">
              {selectedCharacter ? (
                <>
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                    style={{
                      background: `linear-gradient(135deg, ${selectedCharacter.color} 0%, ${selectedCharacter.accentColor} 100%)`,
                      boxShadow: `0 0 15px ${selectedCharacter.color}60`,
                    }}
                  >
                    {selectedCharacter.emoji}
                  </div>
                  <div>
                    <p className="font-bold" style={{ color: selectedCharacter.color }}>
                      {selectedCharacter.name}
                    </p>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">
                      Selected {selectedCharacter.type}
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-gray-400">Select a character to continue</p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleBack}
                className="py-3 px-6 rounded-xl font-bold tracking-wider uppercase transition-all duration-300 hover:scale-105 active:scale-95"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '2px solid rgba(255,255,255,0.2)',
                  color: 'rgba(255,255,255,0.7)',
                }}
              >
                ← Back
              </button>
              <button
                onClick={handleContinue}
                disabled={!selectedCharacter}
                className="py-3 px-8 rounded-xl font-bold tracking-wider uppercase transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100 disabled:cursor-not-allowed"
                style={{
                  background: selectedCharacter
                    ? `linear-gradient(135deg, ${selectedCharacter.color} 0%, ${selectedCharacter.accentColor} 100%)`
                    : 'rgba(255,255,255,0.1)',
                  boxShadow: selectedCharacter ? `0 0 30px ${selectedCharacter.color}50` : 'none',
                  color: 'white',
                }}
              >
                Continue →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
