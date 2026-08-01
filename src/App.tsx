import { useEffect } from 'react';
import { useGameStore } from './store/gameStore';
import MainMenu from './screens/MainMenu';
import CharacterSelect from './screens/CharacterSelect';
import CharacterPreview from './screens/CharacterPreview';
import Settings from './screens/Settings';
import GameScene from './game/GameScene';
import GameOver from './screens/GameOver';

export default function App() {
  const screen = useGameStore((s) => s.screen);
  const loadSavedData = useGameStore((s) => s.loadSavedData);

  useEffect(() => {
    loadSavedData();
  }, [loadSavedData]);

  return (
    <div 
      className="w-screen h-screen overflow-hidden bg-black text-white select-none" 
      style={{ fontFamily: "'Orbitron', 'Segoe UI', system-ui, -apple-system, sans-serif" }}
    >
      {screen === 'menu' && <MainMenu />}
      {screen === 'characterSelect' && <CharacterSelect />}
      {screen === 'characterPreview' && <CharacterPreview />}
      {screen === 'settings' && <Settings />}
      {screen === 'playing' && <GameScene />}
      {screen === 'gameOver' && (
        <>
          <GameScene />
          <GameOver />
        </>
      )}
    </div>
  );
}
