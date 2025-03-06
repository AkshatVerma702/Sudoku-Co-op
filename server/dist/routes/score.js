"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scoreRoute = void 0;
const express_1 = require("express");
exports.scoreRoute = (0, express_1.Router)();
const scoreStorage = {
    player1Score: null,
    player2Score: null
};
exports.scoreRoute.post('/', (req, res) => {
    if (!req.body) {
        res.status(400).json({ message: "Unable to send request to the server" });
    }
    const sudokuBoard = req.body.submitBoard;
    const submitTime = req.body.submitTime;
    const originalBoard = req.body.originalBoard;
    const isPlayer1 = req.body.isPlayer1;
    try {
        if (!sudokuBoard || !submitTime || !originalBoard) {
            console.log("Missing Data");
        }
        const { score, invalidCellsArray } = calculateScore(sudokuBoard, submitTime, originalBoard);
        const obj = {
            score: score,
            invalidCells: invalidCellsArray,
            message: "",
            isPlayer1: req.body.isPlayer1
        };
        if (isPlayer1) {
            scoreStorage.player1Score = score;
        }
        else {
            scoreStorage.player2Score = score;
        }
        if (obj) {
            if (scoreStorage.player1Score !== null && scoreStorage.player2Score !== null) {
                if (scoreStorage.player1Score > scoreStorage.player2Score) {
                    obj.message = "Player - 1 Wins!";
                }
                else if (scoreStorage.player1Score < scoreStorage.player2Score) {
                    obj.message = "Player - 2 Wins!";
                }
                else {
                    obj.message = "Its a TIE!";
                }
            }
            res.status(200).json({ message: " Score Calculated ", obj });
            return;
        }
        res.status(401).json({ message: "Unable to Calculate Score" });
    }
    catch (err) {
        console.log(err);
        res.status(401).json({ message: "Server Error" });
    }
});
function calculateScore(sudokuBoard, submitTime, originalBoard) {
    let score = 0;
    let emptyCells = 0;
    let emptyCellList = new Set();
    let preFilled = new Set();
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (originalBoard[i][j] == 0) {
                let str = i + "," + j;
                emptyCellList.add(str);
            }
        }
    }
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (originalBoard[i][j] !== 0) {
                let str = i + "," + j;
                preFilled.add(str);
            }
        }
    }
    let allCellsEMpty = true;
    for (const cell of emptyCellList) {
        const [row, col] = cell.split(",").map(Number);
        if (sudokuBoard[row][col] !== 0) {
            allCellsEMpty = false;
            break;
        }
    }
    emptyCells = emptyCellList.size;
    const { basePenalty, difficultyMultiplier, totalTime } = findDifficultyParameters(emptyCells);
    let invalidCells = new Set();
    invalidCells = findInvalidCells(emptyCellList, sudokuBoard, preFilled);
    let correctCells = emptyCellList.size - invalidCells.size;
    let incorrectCells = invalidCells.size;
    //calculatePenalty(incorrectCells, basePenalty, difficultyMultiplier);
    let penalty = basePenalty * difficultyMultiplier * (incorrectCells / emptyCells);
    let awardedPoints = correctCells * (80 / emptyCells);
    console.log("Empty Cells: " + emptyCells);
    console.log("Incorrect Cells: " + incorrectCells);
    let timeMultiplier = Math.max(0, (totalTime - submitTime) / totalTime);
    let timeBonus = timeMultiplier * 20;
    console.log("Awarded Points: " + awardedPoints);
    console.log("Penalty: " + penalty);
    console.log("TimeBonus: " + timeBonus);
    score = awardedPoints - penalty + timeBonus;
    score = Math.round(score);
    score = Math.max(0, score);
    let invalidCellsArray = [...invalidCells].map(cell => {
        const [row, col] = cell.split(",").map(Number);
        return [row, col];
    });
    console.log("All Cells Empty?: " + allCellsEMpty);
    console.log("Score: " + score);
    if (allCellsEMpty) {
        return {
            score: 0,
            invalidCellsArray
        };
    }
    if (!invalidCellsArray) {
        console.log("Unable to Create Invalid Cells Array");
    }
    return {
        score,
        invalidCellsArray
    };
}
function findDifficultyParameters(emptyCells) {
    let level = 0;
    let totalTime = 900;
    let basePenalty = 10;
    let difficultyMultiplier = 0.8;
    if (emptyCells >= 32 && emptyCells <= 40) {
        level = 1;
    }
    else if (emptyCells >= 41 && emptyCells <= 49) {
        level = 2;
        totalTime = 1200;
        basePenalty = 15;
        difficultyMultiplier = 1.0;
    }
    else if (emptyCells >= 50 && emptyCells <= 54) {
        level = 3;
        totalTime = 1800;
        basePenalty = 20;
        difficultyMultiplier = 1.2;
    }
    else {
        level = 4;
        totalTime = 2400;
        basePenalty = 25;
        difficultyMultiplier = 1.5;
    }
    return { level, basePenalty, difficultyMultiplier, totalTime };
}
function findInvalidCells(emptyCellList, sudokuBoard, preFilled) {
    if (!sudokuBoard) {
        console.log("No sudoku board Found");
        console.log(sudokuBoard);
    }
    let invalidCells = new Set();
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (preFilled.has(`${i},${j}`)) {
                continue;
            }
            if (emptyCellList.has(`${i},${j}`)) {
                const value = sudokuBoard[i][j];
                if (value == 0 || (sudokuBoard[i][j] < 1 || sudokuBoard[i][j] > 9)) {
                    invalidCells.add(`${i},${j}`);
                }
                else if (!validCell(sudokuBoard, i, j)) {
                    invalidCells.add(`${i},${j}`);
                }
            }
        }
    }
    // console.log("Invalid Cells Calculated: ");
    // for(let cells of invalidCells){
    //     console.log(cells);
    // }
    return invalidCells;
}
function validCell(sudokuBoard, x, y) {
    if (sudokuBoard[x][y] == 0) {
        return true;
    }
    let rowStore = new Set();
    let colStore = new Set();
    let boxStore = new Set();
    for (let i = 0; i < 9; i++) {
        if (i == x) {
            continue;
        }
        let rowKey = sudokuBoard[i][y];
        if (rowKey !== 0 && rowStore.has(rowKey)) {
            return false;
        }
        rowStore.add(rowKey);
    }
    for (let i = 0; i < 9; i++) {
        if (i == y) {
            continue;
        }
        let colKey = sudokuBoard[x][i];
        if (colKey !== 0 && colStore.has(colKey)) {
            return false;
        }
        colStore.add(colKey);
    }
    let startRow = Math.floor(x / 3) * 3;
    let startCol = Math.floor(y / 3) * 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (startRow + i == x && startCol + j == y) {
                continue;
            }
            let boxKey = sudokuBoard[startRow + i][startCol + j];
            if (boxStore.has(boxKey)) {
                return false;
            }
            boxStore.add(boxKey);
        }
    }
    return true;
}
function calculatePenalty(incorrectCells, basePenalty, difficultyMultiplier) {
    let penalty = 0;
    if (incorrectCells == 0) {
        return 0;
    }
    penalty = (basePenalty * difficultyMultiplier) / incorrectCells;
    return penalty;
}
