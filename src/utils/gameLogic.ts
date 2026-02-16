export type Player = 'human' | 'ai' | null;
export type Board = Player[][];

// Dynamic Board Generator
export function getInitialBoard(size: number): Board {
  return Array(size).fill(null).map(() => Array(size).fill(null));
}

export function isValidMove(board: Board, row: number, col: number): boolean {
  return board[row][col] === null;
}

export function makeMove(board: Board, row: number, col: number, player: Player, includeDiagonals: boolean): Board {
  const newBoard = board.map(r => [...r]);
  newBoard[row][col] = player;
  const size = board.length;

  let directions = [
    [-1, 0], [1, 0], [0, -1], [0, 1] 
  ];

  if (includeDiagonals) {
    directions = [
      ...directions,
      [-1, -1], [-1, 1], [1, -1], [1, 1]
    ];
  }

  directions.forEach(([dr, dc]) => {
    const nr = row + dr;
    const nc = col + dc;

    if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
      if (newBoard[nr][nc] !== null && newBoard[nr][nc] !== player) {
        newBoard[nr][nc] = player; // Flip!
      }
    }
  });

  return newBoard;
}

export function getScore(board: Board) {
  let human = 0;
  let ai = 0;
  board.forEach(row => row.forEach(cell => {
    if (cell === 'human') human++;
    if (cell === 'ai') ai++;
  }));
  return { human, ai };
}

export function isGameOver(board: Board): boolean {
  return board.every(row => row.every(cell => cell !== null));
}