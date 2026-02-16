'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RefreshCw, Check } from 'lucide-react';
import { useState, useEffect } from 'react'; // Added useEffect

export const THEMES = {
  neon: { name: 'Neon', human: 'Cyan', ai: 'Rose', humanColor: 'bg-cyan-500', aiColor: 'bg-rose-500', humanBg: 'bg-cyan-500/20', aiBg: 'bg-rose-500/20' },
  toxic: { name: 'Toxic', human: 'Lime', ai: 'Purple', humanColor: 'bg-lime-400', aiColor: 'bg-purple-600', humanBg: 'bg-lime-400/20', aiBg: 'bg-purple-600/20' },
  sunset: { name: 'Sunset', human: 'Amber', ai: 'Indigo', humanColor: 'bg-amber-400', aiColor: 'bg-indigo-500', humanBg: 'bg-amber-400/20', aiBg: 'bg-indigo-500/20' },
};

export type ThemeKey = keyof typeof THEMES;
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface GameSettings {
  boardSize: number;
  difficulty: Difficulty;
  firstPlayer: 'human' | 'ai';
  includeDiagonals: boolean;
  theme: ThemeKey;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: GameSettings;
  onSave: (settings: GameSettings) => void;
  onRestart: () => void;
}

export default function SettingsModal({ isOpen, onClose, currentSettings, onSave, onRestart }: SettingsModalProps) {
  const [settings, setSettings] = useState<GameSettings>(currentSettings);

  // --- ESCAPE KEY LISTENER ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSave = () => {
    onSave(settings);
    onClose();
  };

  const handleRestart = () => {
    onRestart();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gray-900 border border-white/10 p-6 rounded-2xl max-w-sm w-full shadow-2xl pointer-events-auto relative max-h-[90vh] overflow-y-auto"
            >
              <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
              
              <h2 className="text-2xl font-bold mb-6 text-white">Game Settings</h2>

              <div className="space-y-6">

                {/* 1. Color Theme */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Color Theme</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.keys(THEMES) as ThemeKey[]).map((key) => (
                      <button
                        key={key}
                        onClick={() => setSettings({ ...settings, theme: key })}
                        className={`p-2 rounded-lg border transition-all flex gap-1 justify-center ${
                          settings.theme === key ? 'border-white bg-white/10' : 'border-transparent bg-gray-800'
                        }`}
                      >
                        <div className={`w-3 h-3 rounded-full ${THEMES[key].humanColor}`} />
                        <div className={`w-3 h-3 rounded-full ${THEMES[key].aiColor}`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Board Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Board Size: <span className="text-white font-bold">{settings.boardSize}x{settings.boardSize}</span>
                  </label>
                  <input 
                    type="range" min="3" max="7" step="1"
                    value={settings.boardSize}
                    onChange={(e) => setSettings({...settings, boardSize: parseInt(e.target.value)})}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-white"
                  />
                </div>

                {/* 3. Difficulty */}
                <div>
                   <label className="block text-sm font-medium text-gray-400 mb-2">Difficulty</label>
                   <div className="grid grid-cols-3 gap-2 text-xs">
                      {(['easy', 'medium', 'hard'] as Difficulty[]).map((level) => (
                        <button 
                            key={level}
                            onClick={() => setSettings({...settings, difficulty: level})}
                            className={`p-2 rounded-lg capitalize transition-colors border ${
                                settings.difficulty === level 
                                ? 'bg-white text-black font-bold border-white' 
                                : 'bg-gray-800 text-gray-400 border-transparent hover:bg-gray-700'
                            }`}
                        >
                            {level}
                        </button>
                      ))}
                   </div>
                </div>

                {/* 4. Rules */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-400">Include Diagonals</label>
                  <button
                    onClick={() => setSettings({...settings, includeDiagonals: !settings.includeDiagonals})}
                    className={`w-12 h-6 rounded-full transition-colors relative ${settings.includeDiagonals ? 'bg-green-500' : 'bg-gray-700'}`}
                  >
                    <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.includeDiagonals ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div>
                   <label className="block text-sm font-medium text-gray-400 mb-2">First Move</label>
                   <div className="grid grid-cols-2 gap-2 text-sm">
                      <button onClick={() => setSettings({...settings, firstPlayer: 'human'})}
                         className={`p-2 rounded-lg ${settings.firstPlayer === 'human' ? 'bg-white text-black font-bold' : 'bg-gray-800 text-gray-400'}`}>
                         Human
                      </button>
                      <button onClick={() => setSettings({...settings, firstPlayer: 'ai'})}
                         className={`p-2 rounded-lg ${settings.firstPlayer === 'ai' ? 'bg-white text-black font-bold' : 'bg-gray-800 text-gray-400'}`}>
                         AI
                      </button>
                   </div>
                </div>

                <hr className="border-gray-800" />

                {/* Actions */}
                <div className="flex gap-3">
                    <button onClick={handleRestart} className="flex-1 py-3 bg-gray-800 text-white font-bold rounded-xl hover:bg-gray-700 transition flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4" /> Restart
                    </button>
                    <button onClick={handleSave} className="flex-[2] py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition flex items-center justify-center gap-2">
                        <Check className="w-4 h-4" /> Apply
                    </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}