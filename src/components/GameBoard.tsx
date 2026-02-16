'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, RefreshCw, Trophy } from 'lucide-react';
import { getInitialBoard, makeMove, getScore, isGameOver, Board } from '@/utils/gameLogic';
import { GameSettings, THEMES } from './SettingsModal';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface GameBoardProps {
  settings: GameSettings;
}

export default function GameBoard({ settings }: GameBoardProps) {
  const [board, setBoard] = useState<Board>(getInitialBoard(settings.boardSize));
  const [isPlayerTurn, setIsPlayerTurn] = useState(settings.firstPlayer === 'human');
  const [loading, setLoading] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  
  const processingRef = useRef(false);
  const theme = THEMES[settings.theme];

  // Initialize Game Logic
  useEffect(() => {
    resetGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]); 

  const triggerAIMove = async (currentBoard: Board) => {
    if (processingRef.current) return;
    processingRef.current = true;
    setLoading(true);

    try {
        const [res] = await Promise.all([
          fetch('/api/ai', {
            method: 'POST',
            body: JSON.stringify({ 
                board: currentBoard, 
                difficulty: settings.difficulty,
                includeDiagonals: settings.includeDiagonals 
            }),
          }),
          sleep(600) // Reduced slightly for snappier mobile feel
        ]);

        const data = await res.json();
        
        if (data.move) {
            const aiBoard = makeMove(currentBoard, data.move.r, data.move.c, 'ai', settings.includeDiagonals);
            setBoard(aiBoard);
            setIsPlayerTurn(true);
            if (isGameOver(aiBoard)) endGame(aiBoard);
        }
    } catch (e) {
        console.error(e);
        setIsPlayerTurn(true);
    } finally {
        setLoading(false);
        processingRef.current = false;
    }
  };

  const handleMove = async (r: number, c: number) => {
    if (!isPlayerTurn || board[r][c] !== null || winner || loading) return;

    const newBoard = makeMove(board, r, c, 'human', settings.includeDiagonals);
    setBoard(newBoard);
    setIsPlayerTurn(false);

    if (isGameOver(newBoard)) {
      endGame(newBoard);
      return;
    }

    await triggerAIMove(newBoard);
  };

  const endGame = (finalBoard: Board) => {
    const { human, ai } = getScore(finalBoard);
    if (human > ai) setWinner('You Win!');
    else if (ai > human) setWinner('AI Wins');
    else setWinner('Draw');
  };

  const resetGame = () => {
    const freshBoard = getInitialBoard(settings.boardSize);
    setBoard(freshBoard);
    setWinner(null);
    processingRef.current = false;
    
    const aiGoesFirst = settings.firstPlayer === 'ai';
    setIsPlayerTurn(!aiGoesFirst);

    if (aiGoesFirst) {
        // We must manually trigger this because useEffect won't fire if settings haven't changed
        triggerAIMove(freshBoard);
    }
  };

  const scores = getScore(board);
  const isSmallBoard = settings.boardSize <= 4;
  const isLargeBoard = settings.boardSize >= 6;

  // --- RESPONSIVE TILE SIZING ---
  const getTileSize = () => {
    if (isLargeBoard) return 'w-8 h-8 md:w-10 md:h-10 text-xs'; 
    return 'w-10 h-10 md:w-14 md:h-14 text-sm';
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto p-6 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10 shadow-xl relative transition-all duration-300">
       
       {/* 1. TOP HEADER: Scores and Status */}
       <div className="flex items-center justify-between w-full">
          <div className="flex flex-col items-center">
             <span className="text-[10px] md:text-xs text-gray-400 mb-1 font-bold tracking-wider">YOU</span>
             <div className={`text-xl md:text-2xl font-bold px-3 py-1 md:px-4 md:py-2 rounded-xl border border-white/10 transition-colors duration-500
                 ${theme.humanBg} ${loading ? 'opacity-50' : 'text-white'}`}>
                {scores.human}
             </div>
          </div>

          <div className="flex flex-col items-center justify-center w-28 md:w-32 h-10">
             {loading ? (
                <div className="flex items-center gap-2 text-gray-400 text-xs md:text-sm animate-pulse whitespace-nowrap">
                   <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin" /> Thinking...
                </div>
             ) : !winner ? (
                // LOGIC FIX: Check isPlayerTurn to ensure we don't show "Your Turn" when waiting for AI trigger
                <div className={`font-bold text-xs md:text-sm tracking-widest uppercase ${isPlayerTurn ? 'text-white' : 'text-gray-500'}`}>
                    {isPlayerTurn ? "Your Turn" : "Waiting..."}
                </div>
             ) : (
                <div className="text-gray-500 text-xs md:text-sm font-bold uppercase">Game Over</div>
             )}
          </div>

          <div className="flex flex-col items-center">
             <span className="text-[10px] md:text-xs text-gray-400 mb-1 font-bold tracking-wider">AI</span>
             <div className={`text-xl md:text-2xl font-bold px-3 py-1 md:px-4 md:py-2 rounded-xl border border-white/10 transition-colors duration-500
                 ${theme.aiBg} ${loading ? 'text-white' : 'opacity-50'}`}>
                {scores.ai}
             </div>
          </div>
       </div>

      {/* 2. THE GRID */}
      <div 
        className="grid gap-1 md:gap-2 bg-gray-900/50 p-3 md:p-4 rounded-xl border border-white/5 relative"
        style={{ gridTemplateColumns: `repeat(${settings.boardSize}, minmax(0, 1fr))` }}
      >
        <AnimatePresence>
          {winner && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-xl bg-black/85 backdrop-blur-md text-center p-2"
            >
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="mb-4"
              >
                <Trophy className={`${isSmallBoard ? 'w-6 h-6' : 'w-10 h-10 md:w-12 md:h-12'} text-yellow-400 mx-auto mb-2`} />
                <h2 className={`${isSmallBoard ? 'text-xl' : 'text-2xl md:text-4xl'} font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]`}>
                  {winner}
                </h2>
              </motion.div>

              <motion.button 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                onClick={resetGame}
                className={`flex items-center gap-2 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition shadow-lg shadow-white/10
                    ${isSmallBoard ? 'px-3 py-1 text-xs' : 'px-4 py-2 md:px-6 md:py-3 text-sm md:text-base'}
                `}
              >
                <RefreshCw className="w-3 h-3 md:w-4 md:h-4" /> Play Again
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {board.map((row, r) =>
          row.map((cell, c) => (
            <motion.button
              key={`${r}-${c}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleMove(r, c)}
              disabled={!isPlayerTurn || cell !== null}
              className={`rounded-md md:rounded-lg flex items-center justify-center shadow-md md:shadow-lg transition-colors
                ${getTileSize()} 
                ${cell === null ? 'bg-gray-800 hover:bg-gray-700' : ''}
                ${cell === 'human' ? `${theme.humanColor} shadow-[0_0_10px_rgba(0,0,0,0.3)]` : ''}
                ${cell === 'ai' ? `${theme.aiColor} shadow-[0_0_10px_rgba(0,0,0,0.3)]` : ''}
              `}
            >
              {cell && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-2 h-2 md:w-3 md:h-3 bg-white/40 rounded-full"
                />
              )}
            </motion.button>
          ))
        )}
      </div>
    </div>
  );
}