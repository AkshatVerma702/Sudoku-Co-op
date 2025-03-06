// Easy: 32–40 missing cells [1]
// Medium: 41–49 missing cells [2]
// Hard: 50–54 missing cells [3]
// Expert: 55+ missing cells [4]
export default class Sudoku {
    level;
    constructor(level) {
        this.level = level;
    }
    setupBoard() {
        let board = new Array(9).fill(0).map(() => new Array(9).fill(0));
        this.fillGrid(board);
        this.removeCells(board, this.level);
        return board;
    }
    fillGrid(board) {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (board[i][j] == 0) {
                    let values = this.shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
                    for (let k of values) {
                        if (this.valid(i, j, board, k)) {
                            board[i][j] = k;
                            if (this.fillGrid(board)) {
                                return true;
                            }
                            board[i][j] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }
    shuffleArray(array) {
        for (let i = 8; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    valid(x, y, board, num) {
        // Check row
        for (let i = 0; i < 9; i++) {
            const curr = board[i][y];
            if (i != x && curr == num) {
                return false;
            }
        }
        // Check col
        for (let j = 0; j < 9; j++) {
            const curr = board[x][j];
            if (j != y && curr == num) {
                return false;
            }
        }
        // Check 3x3 grid
        let startRow = Math.floor(x / 3) * 3;
        let startCol = Math.floor(y / 3) * 3;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const curr = board[startRow + i][startCol + j];
                if (curr == num) {
                    return false;
                }
            }
        }
        return true;
    }
    removeCells(board, level) {
        let toRemove;
        let min;
        let max;
        if (level === 1) {
            max = 40;
            min = 32;
            toRemove = Math.floor(Math.random() * (max - min + 1)) + min;
        }
        else if (level === 2) {
            max = 49;
            min = 41;
            toRemove = Math.floor(Math.random() * (max - min + 1)) + min;
        }
        else if (level === 3) {
            max = 54;
            min = 50;
            toRemove = Math.floor(Math.random() * (max - min + 1)) + min;
        }
        else {
            min = 55;
            max = 57;
            toRemove = Math.floor(Math.random() * (max - min + 1)) + min;
        }
        let x;
        let y;
        while (toRemove) {
            x = Math.floor(Math.random() * 9);
            y = Math.floor(Math.random() * 9);
            board[x][y] = 0;
            toRemove = toRemove - 1;
        }
        return board;
    }
}
