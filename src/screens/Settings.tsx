import { useGameStore, GraphicsQuality } from '../store/gameStore';
import { AudioManager } from '../managers/AudioManager';

export default function Settings() {
  const { settings, updateSettings, setScreen } = useGameStore();

  const handleBack = () => {
    AudioManager.playClick();
    setScreen('menu');
  };

  const qualityOptions: GraphicsQuality[] = ['low', 'medium', 'high', 'ultra'];

  return (
    <div 
      className="fixed inset-0 overflow-auto"
      style={{
        background: 'linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #0a0a1a 100%)',
      }}
    >
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute w-96 h-96 rounded-full"
          style={{
            top: '20%',
            right: '10%',
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-full py-8 px-4">
        <h2 
          className="text-4xl md:text-5xl font-black tracking-wider mb-10"
          style={{
            background: 'linear-gradient(135deg, #00d4ff 0%, #7b2fbe 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 20px rgba(0,212,255,0.3))',
          }}
        >
          ⚙️ SETTINGS
        </h2>

        <div className="w-full max-w-md space-y-5">
          {/* Music Volume */}
          <div 
            className="p-5 rounded-2xl"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <label className="flex items-center gap-2 text-sm font-bold tracking-widest uppercase text-gray-300 mb-3">
              <span>🎵</span> Music Volume
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="100"
                value={settings.musicVolume * 100}
                onChange={(e) => {
                  const v = Number(e.target.value) / 100;
                  updateSettings({ musicVolume: v });
                  AudioManager.setMusicVolume(v);
                }}
                className="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(90deg, #00d4ff ${settings.musicVolume * 100}%, rgba(255,255,255,0.1) ${settings.musicVolume * 100}%)`,
                }}
              />
              <span className="text-sm font-bold text-gray-400 w-12 text-right">
                {Math.round(settings.musicVolume * 100)}%
              </span>
            </div>
          </div>

          {/* SFX Volume */}
          <div 
            className="p-5 rounded-2xl"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <label className="flex items-center gap-2 text-sm font-bold tracking-widest uppercase text-gray-300 mb-3">
              <span>🔊</span> Sound Effects
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="100"
                value={settings.sfxVolume * 100}
                onChange={(e) => {
                  const v = Number(e.target.value) / 100;
                  updateSettings({ sfxVolume: v });
                  AudioManager.setSfxVolume(v);
                }}
                className="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(90deg, #ff6600 ${settings.sfxVolume * 100}%, rgba(255,255,255,0.1) ${settings.sfxVolume * 100}%)`,
                }}
              />
              <span className="text-sm font-bold text-gray-400 w-12 text-right">
                {Math.round(settings.sfxVolume * 100)}%
              </span>
            </div>
          </div>

          {/* Graphics Quality */}
          <div 
            className="p-5 rounded-2xl"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <label className="flex items-center gap-2 text-sm font-bold tracking-widest uppercase text-gray-300 mb-4">
              <span>🎨</span> Graphics Quality
            </label>
            <div className="grid grid-cols-4 gap-2">
              {qualityOptions.map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    updateSettings({ graphicsQuality: q });
                    AudioManager.playClick();
                  }}
                  className="py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300"
                  style={{
                    background: settings.graphicsQuality === q
                      ? 'linear-gradient(135deg, #7b2fbe 0%, #00d4ff 100%)'
                      : 'rgba(255,255,255,0.05)',
                    color: settings.graphicsQuality === q ? 'white' : 'rgba(255,255,255,0.4)',
                    border: settings.graphicsQuality === q
                      ? 'none'
                      : '1px solid rgba(255,255,255,0.1)',
                    boxShadow: settings.graphicsQuality === q
                      ? '0 0 15px rgba(123,47,190,0.4)'
                      : 'none',
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Fullscreen */}
          <div 
            className="p-5 rounded-2xl flex items-center justify-between"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <span className="flex items-center gap-2 text-sm font-bold tracking-widest uppercase text-gray-300">
              <span>🖥️</span> Fullscreen
            </span>
            <button
              onClick={() => {
                const newVal = !settings.fullscreen;
                updateSettings({ fullscreen: newVal });
                AudioManager.playClick();
                if (newVal) {
                  document.documentElement.requestFullscreen?.();
                } else {
                  document.exitFullscreen?.();
                }
              }}
              className="w-14 h-7 rounded-full transition-all duration-300 relative"
              style={{
                background: settings.fullscreen
                  ? 'linear-gradient(90deg, #00d4ff, #7b2fbe)'
                  : 'rgba(255,255,255,0.1)',
              }}
            >
              <div
                className="absolute top-1 w-5 h-5 rounded-full bg-white transition-all duration-300 shadow-lg"
                style={{
                  left: settings.fullscreen ? '30px' : '4px',
                }}
              />
            </button>
          </div>

          {/* Vibration */}
          <div 
            className="p-5 rounded-2xl flex items-center justify-between"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <span className="flex items-center gap-2 text-sm font-bold tracking-widest uppercase text-gray-300">
              <span>📳</span> Vibration
            </span>
            <button
              onClick={() => {
                updateSettings({ vibration: !settings.vibration });
                AudioManager.playClick();
              }}
              className="w-14 h-7 rounded-full transition-all duration-300 relative"
              style={{
                background: settings.vibration
                  ? 'linear-gradient(90deg, #00d4ff, #7b2fbe)'
                  : 'rgba(255,255,255,0.1)',
              }}
            >
              <div
                className="absolute top-1 w-5 h-5 rounded-full bg-white transition-all duration-300 shadow-lg"
                style={{
                  left: settings.vibration ? '30px' : '4px',
                }}
              />
            </button>
          </div>
        </div>

        {/* Back button */}
        <button
          onClick={handleBack}
          className="mt-10 py-3 px-12 rounded-xl font-bold tracking-widest uppercase transition-all duration-300 hover:scale-105 active:scale-95"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
            border: '2px solid rgba(255,255,255,0.2)',
            color: 'rgba(255,255,255,0.8)',
          }}
        >
          ← Back
        </button>
      </div>
    </div>
  );
}
