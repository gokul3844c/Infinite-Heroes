import { create } from 'zustand';

export type GameScreen = 'menu' | 'characterSelect' | 'characterPreview' | 'playing' | 'gameOver' | 'settings';
export type GraphicsQuality = 'low' | 'medium' | 'high' | 'ultra';

export interface Character {
  id: string;
  name: string;
  type: 'hero' | 'villain';
  color: string;
  accentColor: string;
  emoji: string;
  icon: string;
}

export const CHARACTERS: Character[] = [
  // Heroes (26)
  { id: 'spiderman', name: 'Spider-Man', type: 'hero', color: '#e23636', accentColor: '#1a3a8a', emoji: '🕷️', icon: '🕸️' },
  { id: 'ironman', name: 'Iron Man', type: 'hero', color: '#c0392b', accentColor: '#f1c40f', emoji: '🤖', icon: '⚙️' },
  { id: 'captainamerica', name: 'Captain America', type: 'hero', color: '#2c3e8e', accentColor: '#e74c3c', emoji: '🛡️', icon: '⭐' },
  { id: 'thor', name: 'Thor', type: 'hero', color: '#2980b9', accentColor: '#f1c40f', emoji: '⚡', icon: '🔨' },
  { id: 'hulk', name: 'Hulk', type: 'hero', color: '#27ae60', accentColor: '#6b2fa0', emoji: '💪', icon: '👊' },
  { id: 'blackpanther', name: 'Black Panther', type: 'hero', color: '#2c2c54', accentColor: '#a55eea', emoji: '🐾', icon: '👑' },
  { id: 'doctorstrange', name: 'Doctor Strange', type: 'hero', color: '#8e44ad', accentColor: '#e67e22', emoji: '🔮', icon: '✨' },
  { id: 'scarletwitch', name: 'Scarlet Witch', type: 'hero', color: '#c0392b', accentColor: '#e91e63', emoji: '✨', icon: '🔴' },
  { id: 'antman', name: 'Ant-Man', type: 'hero', color: '#e74c3c', accentColor: '#2c3e50', emoji: '🐜', icon: '🔬' },
  { id: 'wasp', name: 'Wasp', type: 'hero', color: '#f1c40f', accentColor: '#2c3e50', emoji: '🐝', icon: '💛' },
  { id: 'falcon', name: 'Falcon', type: 'hero', color: '#c0392b', accentColor: '#ecf0f1', emoji: '🦅', icon: '🪶' },
  { id: 'wintersoldier', name: 'Winter Soldier', type: 'hero', color: '#34495e', accentColor: '#95a5a6', emoji: '🦾', icon: '⭐' },
  { id: 'moonknight', name: 'Moon Knight', type: 'hero', color: '#ecf0f1', accentColor: '#2c3e50', emoji: '🌙', icon: '☪️' },
  { id: 'daredevil', name: 'Daredevil', type: 'hero', color: '#c0392b', accentColor: '#2c3e50', emoji: '😈', icon: '⚖️' },
  { id: 'hawkeye', name: 'Hawkeye', type: 'hero', color: '#8e44ad', accentColor: '#2c3e50', emoji: '🏹', icon: '🎯' },
  { id: 'blackwidow', name: 'Black Widow', type: 'hero', color: '#2c3e50', accentColor: '#c0392b', emoji: '🕷️', icon: '⚫' },
  { id: 'vision', name: 'Vision', type: 'hero', color: '#9b59b6', accentColor: '#f1c40f', emoji: '💎', icon: '🔶' },
  { id: 'shangchi', name: 'Shang-Chi', type: 'hero', color: '#e74c3c', accentColor: '#f39c12', emoji: '🥋', icon: '🐉' },
  { id: 'starlord', name: 'Star-Lord', type: 'hero', color: '#e74c3c', accentColor: '#3498db', emoji: '🎧', icon: '🌟' },
  { id: 'rocket', name: 'Rocket', type: 'hero', color: '#7f8c8d', accentColor: '#e67e22', emoji: '🦝', icon: '🚀' },
  { id: 'groot', name: 'Groot', type: 'hero', color: '#6d4c41', accentColor: '#27ae60', emoji: '🌳', icon: '🌿' },
  { id: 'gamora', name: 'Gamora', type: 'hero', color: '#27ae60', accentColor: '#8e44ad', emoji: '⚔️', icon: '💚' },
  { id: 'captainmarvel', name: 'Captain Marvel', type: 'hero', color: '#e74c3c', accentColor: '#f1c40f', emoji: '⭐', icon: '💫' },
  { id: 'msmarvel', name: 'Ms. Marvel', type: 'hero', color: '#3498db', accentColor: '#e74c3c', emoji: '✊', icon: '💜' },
  { id: 'deadpool', name: 'Deadpool', type: 'hero', color: '#c0392b', accentColor: '#2c3e50', emoji: '💀', icon: '🔫' },
  { id: 'wolverine', name: 'Wolverine', type: 'hero', color: '#f1c40f', accentColor: '#2c3e50', emoji: '🐺', icon: '🔪' },
  
  // Villains (20)
  { id: 'thanos', name: 'Thanos', type: 'villain', color: '#6c3483', accentColor: '#f39c12', emoji: '🟣', icon: '💎' },
  { id: 'loki', name: 'Loki', type: 'villain', color: '#1e8449', accentColor: '#f1c40f', emoji: '🎭', icon: '🐍' },
  { id: 'ultron', name: 'Ultron', type: 'villain', color: '#7f8c8d', accentColor: '#e74c3c', emoji: '🤖', icon: '💀' },
  { id: 'greengoblin', name: 'Green Goblin', type: 'villain', color: '#229954', accentColor: '#e67e22', emoji: '👺', icon: '🎃' },
  { id: 'venom', name: 'Venom', type: 'villain', color: '#1a1a2e', accentColor: '#ecf0f1', emoji: '🖤', icon: '👅' },
  { id: 'redskull', name: 'Red Skull', type: 'villain', color: '#922b21', accentColor: '#1c1c1c', emoji: '💀', icon: '☠️' },
  { id: 'doctordoom', name: 'Doctor Doom', type: 'villain', color: '#2e4053', accentColor: '#27ae60', emoji: '👑', icon: '🎭' },
  { id: 'magneto', name: 'Magneto', type: 'villain', color: '#7d3c98', accentColor: '#e74c3c', emoji: '🧲', icon: '🔴' },
  { id: 'carnage', name: 'Carnage', type: 'villain', color: '#c0392b', accentColor: '#1a1a2e', emoji: '🔴', icon: '🩸' },
  { id: 'mysterio', name: 'Mysterio', type: 'villain', color: '#27ae60', accentColor: '#9b59b6', emoji: '🔮', icon: '🎭' },
  { id: 'sandman', name: 'Sandman', type: 'villain', color: '#d4ac0d', accentColor: '#6d4c41', emoji: '🏜️', icon: '⏳' },
  { id: 'rhino', name: 'Rhino', type: 'villain', color: '#7f8c8d', accentColor: '#2c3e50', emoji: '🦏', icon: '🛡️' },
  { id: 'kingpin', name: 'Kingpin', type: 'villain', color: '#ecf0f1', accentColor: '#2c3e50', emoji: '👔', icon: '💰' },
  { id: 'hela', name: 'Hela', type: 'villain', color: '#1a1a2e', accentColor: '#27ae60', emoji: '💀', icon: '🖤' },
  { id: 'ebonymaw', name: 'Ebony Maw', type: 'villain', color: '#5d6d7e', accentColor: '#1a1a2e', emoji: '🧙', icon: '🌑' },
  { id: 'ronan', name: 'Ronan', type: 'villain', color: '#2e4053', accentColor: '#9b59b6', emoji: '⚒️', icon: '💎' },
  { id: 'kang', name: 'Kang', type: 'villain', color: '#3498db', accentColor: '#9b59b6', emoji: '⏰', icon: '🔮' },
  { id: 'apocalypse', name: 'Apocalypse', type: 'villain', color: '#5d6d7e', accentColor: '#3498db', emoji: '👁️', icon: '💀' },
  { id: 'juggernaut', name: 'Juggernaut', type: 'villain', color: '#c0392b', accentColor: '#6d4c41', emoji: '🔴', icon: '💪' },
  { id: 'dormammu', name: 'Dormammu', type: 'villain', color: '#e67e22', accentColor: '#c0392b', emoji: '🔥', icon: '👁️' },
];

interface Settings {
  musicVolume: number;
  sfxVolume: number;
  graphicsQuality: GraphicsQuality;
  fullscreen: boolean;
  vibration: boolean;
}

interface GameState {
  screen: GameScreen;
  selectedCharacter: Character | null;
  score: number;
  bestScore: number;
  distanceTravelled: number;
  timeSurvived: number;
  speed: number;
  baseSpeed: number;
  lane: number;
  isJumping: boolean;
  isSliding: boolean;
  isHit: boolean;
  countdown: number | null;
  gameStarted: boolean;
  isPaused: boolean;
  newHighScore: boolean;
  settings: Settings;

  // Actions
  setScreen: (screen: GameScreen) => void;
  selectCharacter: (character: Character) => void;
  startGame: () => void;
  setCountdown: (n: number | null) => void;
  setGameStarted: (v: boolean) => void;
  updateScore: (delta: number) => void;
  updateDistance: (delta: number) => void;
  updateTime: (delta: number) => void;
  incrementScore: () => void;
  setSpeed: (speed: number) => void;
  setLane: (lane: number) => void;
  setJumping: (v: boolean) => void;
  setSliding: (v: boolean) => void;
  setHit: () => void;
  gameOver: () => void;
  restart: () => void;
  togglePause: () => void;
  updateSettings: (s: Partial<Settings>) => void;
  loadSavedData: () => void;
}

const DEFAULT_SETTINGS: Settings = {
  musicVolume: 0.7,
  sfxVolume: 0.8,
  graphicsQuality: 'high',
  fullscreen: false,
  vibration: true,
};

const loadFromStorage = () => {
  try {
    const saved = localStorage.getItem('endlessHeroRun');
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return null;
};

const saveToStorage = (data: { bestScore: number; selectedCharacterId?: string; settings: Settings }) => {
  try {
    localStorage.setItem('endlessHeroRun', JSON.stringify(data));
  } catch { /* ignore */ }
};

export const useGameStore = create<GameState>((set, get) => ({
  screen: 'menu',
  selectedCharacter: null,
  score: 0,
  bestScore: 0,
  distanceTravelled: 0,
  timeSurvived: 0,
  speed: 15,
  baseSpeed: 15,
  lane: 0,
  isJumping: false,
  isSliding: false,
  isHit: false,
  countdown: null,
  gameStarted: false,
  isPaused: false,
  newHighScore: false,
  settings: DEFAULT_SETTINGS,

  setScreen: (screen) => set({ screen }),

  selectCharacter: (character) => {
    set({ selectedCharacter: character });
    const state = get();
    saveToStorage({ bestScore: state.bestScore, selectedCharacterId: character.id, settings: state.settings });
  },

  startGame: () => set({
    screen: 'playing',
    score: 0,
    distanceTravelled: 0,
    timeSurvived: 0,
    speed: 15,
    baseSpeed: 15,
    lane: 0,
    isJumping: false,
    isSliding: false,
    isHit: false,
    countdown: 3,
    gameStarted: false,
    isPaused: false,
    newHighScore: false,
  }),

  setCountdown: (n) => set({ countdown: n }),
  setGameStarted: (v) => set({ gameStarted: v }),

  updateScore: (delta) => {
    const state = get();
    if (!state.gameStarted || state.isPaused || state.isHit) return;
    const newScore = state.score + delta;
    const isNew = newScore > state.bestScore;
    set({
      score: newScore,
      bestScore: isNew ? newScore : state.bestScore,
      newHighScore: isNew || state.newHighScore,
    });
  },

  incrementScore: () => {
    const state = get();
    if (!state.gameStarted || state.isPaused || state.isHit) return;
    const speed = state.speed;
    const increment = speed * 0.1;
    const newScore = state.score + increment;
    const isNew = newScore > state.bestScore;
    set({
      score: newScore,
      bestScore: isNew ? newScore : state.bestScore,
      newHighScore: isNew || state.newHighScore,
    });
  },

  updateDistance: (delta) => set((s) => ({ distanceTravelled: s.distanceTravelled + delta })),
  updateTime: (delta) => set((s) => ({ timeSurvived: s.timeSurvived + delta })),

  setSpeed: (speed) => set({ speed }),

  setLane: (lane) => set({ lane: Math.max(-1, Math.min(1, lane)) }),

  setJumping: (v) => set({ isJumping: v }),
  setSliding: (v) => set({ isSliding: v }),

  setHit: () => set({ isHit: true }),

  gameOver: () => {
    const state = get();
    const finalScore = Math.floor(state.score);
    const newBest = Math.max(finalScore, state.bestScore);
    set({
      screen: 'gameOver',
      bestScore: newBest,
      score: finalScore,
      gameStarted: false,
    });
    saveToStorage({ bestScore: newBest, selectedCharacterId: state.selectedCharacter?.id, settings: state.settings });
  },

  restart: () => {
    set({
      screen: 'playing',
      score: 0,
      distanceTravelled: 0,
      timeSurvived: 0,
      speed: 15,
      baseSpeed: 15,
      lane: 0,
      isJumping: false,
      isSliding: false,
      isHit: false,
      countdown: 3,
      gameStarted: false,
      isPaused: false,
      newHighScore: false,
    });
  },

  togglePause: () => set((s) => ({ isPaused: !s.isPaused })),

  updateSettings: (s) => {
    const state = get();
    const newSettings = { ...state.settings, ...s };
    set({ settings: newSettings });
    saveToStorage({ bestScore: state.bestScore, selectedCharacterId: state.selectedCharacter?.id, settings: newSettings });
  },

  loadSavedData: () => {
    const saved = loadFromStorage();
    if (saved) {
      const char = CHARACTERS.find((c) => c.id === saved.selectedCharacterId) || null;
      set({
        bestScore: saved.bestScore || 0,
        selectedCharacter: char,
        settings: { ...DEFAULT_SETTINGS, ...saved.settings },
      });
    }
  },
}));
