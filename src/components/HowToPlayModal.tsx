'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MousePointer2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  includeDiagonals: boolean;
}

// --- VISUAL COMPONENTS ---
const Tile = ({ color, animate }: { color: 'cyan' | 'rose' | 'gray', animate?: boolean }) => {
  const bgColors = {
    cyan: 'bg-cyan-500 shadow-cyan-500/50',
    rose: 'bg-rose-500 shadow-rose-500/50',
    gray: 'bg-gray-800',
  };

  return (
    <motion.div 
      layout
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`w-10 h-10 md:w-12 md:h-12 rounded-lg shadow-lg ${bgColors[color]} flex items-center justify-center relative`}
    >
       {color !== 'gray' && (
         <motion.div 
            initial={animate ? { scale: 0 } : { scale: 1 }}
            animate={{ scale: 1 }}
            className="w-3 h-3 bg-white/40 rounded-full" 
         />
       )}
    </motion.div>
  );
};

// --- LIVE DEMO ANIMATION ---
const LiveDemo = () => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Animation Loop: 0 (Reset) -> 1 (Move Cursor) -> 2 (Place) -> 3 (Flip) -> 4 (Pause) -> 0
    const timer = setInterval(() => {
      setStep((s) => (s + 1) % 5);
    }, 1000); 
    return () => clearInterval(timer);
  }, []);

  // State Logic
  const cursorVisible = step >= 1 && step <= 2;
  const isPlaced = step >= 2;
  const isFlipped = step >= 3;

  return (
    <div className="bg-black/30 p-6 rounded-xl flex flex-col items-center border border-white/5">
      <div className="relative grid grid-cols-3 gap-2">
        
        {/* Row 1 */}
        <div className="w-10 h-10 md:w-12 md:h-12" />
        <Tile color={isFlipped ? 'cyan' : 'rose'} /> 
        <div className="w-10 h-10 md:w-12 md:h-12" />

        {/* Row 2 */}
        <Tile color={isFlipped ? 'cyan' : 'rose'} />
        {/* CENTER TILE (The one we play) */}
        {isPlaced ? <Tile color="cyan" animate={true} /> : <Tile color="gray" />}
        <Tile color={isFlipped ? 'cyan' : 'rose'} />

        {/* Row 3 */}
        <div className="w-10 h-10 md:w-12 md:h-12" />
        <Tile color={isFlipped ? 'cyan' : 'rose'} />
        <div className="w-10 h-10 md:w-12 md:h-12" />

        {/* Animated Cursor */}
        <AnimatePresence>
          {cursorVisible && (
            <motion.div
              initial={{ opacity: 0, x: 50, y: 50 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5 }}
              className="absolute top-1/2 left-1/2 z-20 pointer-events-none"
            >
              <MousePointer2 className="w-8 h-8 text-white drop-shadow-lg fill-black" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-4 text-xs font-mono text-cyan-400 h-4">
        {step === 0 && "Wait for turn..."}
        {step === 1 && "Selecting move..."}
        {step === 2 && "Placing Tile!"}
        {step === 3 && "CAPTURING NEIGHBORS!"}
        {step === 4 && "Score +5"}
      </div>
    </div>
  );
};

export default function HowToPlayModal({ isOpen, onClose, includeDiagonals }: HowToPlayModalProps) {
  
  // --- ESCAPE KEY LISTENER ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-gray-900 border border-white/10 p-6 rounded-2xl max-w-md w-full shadow-2xl pointer-events-auto relative max-h-[90vh] overflow-y-auto"
            >
              <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition">
                <X className="w-6 h-6" />
              </button>

              <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-rose-500 text-transparent bg-clip-text">
                How to Play
              </h2>

              <div className="space-y-6 text-gray-300">
                <p>
                  You are <span className="text-cyan-400 font-bold">Cyan</span>. 
                  Own the most tiles to win.
                </p>

                {/* ANIMATED LIVE DEMO */}
                <div>
                  <h3 className="text-white font-bold mb-3">Gameplay Example</h3>
                  <LiveDemo />
                  <p className="text-sm mt-3 text-center text-gray-400">
                    Placing a tile next to enemies <br/> <span className="text-white font-bold">flips them to your color.</span>
                  </p>
                </div>

                {includeDiagonals && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }} 
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-xl"
                    >
                        <h3 className="text-purple-300 font-bold mb-2 text-sm">
                            ✨ Diagonal Mode Active
                        </h3>
                        <p className="text-xs text-purple-100/80">
                           Corners count! You can now capture enemies diagonally as well.
                        </p>
                    </motion.div>
                )}
                
                <button 
                  onClick={onClose}
                  className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition"
                >
                  Got it, Let's Play!
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}