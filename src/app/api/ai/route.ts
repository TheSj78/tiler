import { NextResponse } from 'next/server';
import { Board, makeMove, getScore, isGameOver } from '@/utils/gameLogic';

function evaluate(board: Board): number {
  const { human, ai } = getScore(board);
  return ai - human; 
}

function minimax(board: Board, depth: number, isMaximizing: boolean, includeDiagonals: boolean): number {
  if (depth === 0 || isGameOver(board)) {
    return evaluate(board);
  }

  const size = board.length;

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (board[r][c] === null) {
          const newBoard = makeMove(board, r, c, 'ai', includeDiagonals);
          const evalScore = minimax(newBoard, depth - 1, false, includeDiagonals);
          maxEval = Math.max(maxEval, evalScore);
        }
      }
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (board[r][c] === null) {
          const newBoard = makeMove(board, r, c, 'human', includeDiagonals);
          const evalScore = minimax(newBoard, depth - 1, true, includeDiagonals);
          minEval = Math.min(minEval, evalScore);
        }
      }
    }
    return minEval;
  }
}

export async function POST(req: Request) {
  const { board, difficulty, includeDiagonals } = await req.json();
  const size = board.length;
  
  let depth = 1;
  if (difficulty === 'medium') depth = 3;
  if (difficulty === 'hard') depth = 4;

  // Safety cap for larger boards to prevent timeouts
  if (size >= 6 && depth > 3) depth = 3; 
  if (size >= 7 && depth > 2) depth = 2; 

  let bestMove = null;
  let bestScore = -Infinity;

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] === null) {
        const newBoard = makeMove(board, r, c, 'ai', includeDiagonals);
        const score = minimax(newBoard, depth, false, includeDiagonals);
        
        if (score > bestScore) {
          bestScore = score;
          bestMove = { r, c };
        }
      }
    }
  }

  return NextResponse.json({ move: bestMove });
}