'use client';

import { useState, useEffect } from 'react';
import GameBoard from "@/components/GameBoard";
import HowToPlayModal from '@/components/HowToPlayModal';
import SettingsModal, { GameSettings } from '@/components/SettingsModal';
import { HelpCircle, Settings } from 'lucide-react';

export default function Home() {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [restartKey, setRestartKey] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const [gameSettings, setGameSettings] = useState<GameSettings>({
    boardSize: 5,
    difficulty: 'medium',
    firstPlayer: 'human',
    includeDiagonals: false,
    theme: 'neon',
  });

  useEffect(() => {
    // 1. Load Settings
    const saved = localStorage.getItem('neon-conquest-settings');
    if (saved) {
      try {
        setGameSettings(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }

    // 2. Check First Time Visit (Tutorial Trigger)
    const hasVisited = localStorage.getItem('tiler-has-visited');
    if (!hasVisited) {
      setIsHelpOpen(true); // Open Tutorial
      localStorage.setItem('tiler-has-visited', 'true'); // Mark as visited
    }

    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('neon-conquest-settings', JSON.stringify(gameSettings));
    }
  }, [gameSettings, isLoaded]);

  const handleRestart = () => {
    setRestartKey(prev => prev + 1);
  };

  if (!isLoaded) return <div className="min-h-screen bg-neutral-950" />;

  return (
    <main className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden transition-colors duration-700">
      
      {/* Top Right Icons */}
      <div className="absolute top-4 right-4 md:top-6 md:right-6 z-30 flex gap-2 md:gap-3">
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="text-gray-400 hover:text-white transition-colors p-2 bg-black/20 rounded-full backdrop-blur-md border border-white/5"
        >
          <Settings className="w-5 h-5 md:w-8 md:h-8" />
        </button>
        <button
          onClick={() => setIsHelpOpen(true)}
          className="text-gray-400 hover:text-white transition-colors p-2 bg-black/20 rounded-full backdrop-blur-md border border-white/5"
        >
          <HelpCircle className="w-5 h-5 md:w-8 md:h-8" />
        </button>
      </div>

      {/* Dynamic Background Glow */}
      <div className={`absolute top-0 left-0 w-64 h-64 md:w-96 md:h-96 rounded-full blur-[80px] md:blur-[128px] -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-20 transition-colors duration-1000
          ${gameSettings.theme === 'neon' ? 'bg-cyan-500' : ''}
          ${gameSettings.theme === 'toxic' ? 'bg-lime-500' : ''}
          ${gameSettings.theme === 'sunset' ? 'bg-amber-500' : ''}
      `} />
      <div className={`absolute bottom-0 right-0 w-64 h-64 md:w-96 md:h-96 rounded-full blur-[80px] md:blur-[128px] translate-x-1/2 translate-y-1/2 pointer-events-none opacity-20 transition-colors duration-1000
          ${gameSettings.theme === 'neon' ? 'bg-rose-500' : ''}
          ${gameSettings.theme === 'toxic' ? 'bg-purple-500' : ''}
          ${gameSettings.theme === 'sunset' ? 'bg-indigo-500' : ''}
      `} />

      <div className="z-10 text-center space-y-2 mb-6 md:mb-8 mt-8 md:mt-0">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
          Tiler
        </h1>
        <p className="text-gray-400 text-xs md:text-base max-w-[250px] md:max-w-md mx-auto">
          Capture territory by placing tiles adjacent to enemies. 
        </p>
      </div>

      <div className="z-10 w-full flex justify-center">
        <GameBoard 
            key={`${JSON.stringify(gameSettings)}-${restartKey}`} 
            settings={gameSettings} 
        />
      </div>

      <div className="mt-8 text-[10px] md:text-xs text-gray-600 font-mono z-10">
        Built by Shubham • Algorithm uses <a href="https://www.youtube.com/watch?v=l-hh51ncgDI"><u>Minimax AI</u></a>
      </div>

      <HowToPlayModal 
        isOpen={isHelpOpen} 
        onClose={() => setIsHelpOpen(false)} 
        includeDiagonals={gameSettings.includeDiagonals}
      />
      
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        currentSettings={gameSettings}
        onSave={setGameSettings} 
        onRestart={handleRestart}
      />
    </main>
  );
}