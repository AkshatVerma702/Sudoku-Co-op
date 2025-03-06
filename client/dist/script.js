import Sudoku from './sudokuSetup.js';
import GameClock from './GameClock.js';
const socket = io('http://localhost:3000');
document.getElementById("generate-sudoku-btn")?.addEventListener('click', generateSudoku);
document.getElementById("darkMode-img")?.addEventListener('click', darkMode);
document.getElementById("hide-btn")?.addEventListener('click', hideScoreScreen);
socket.on('connect', () => {
    disableBoard2();
});
socket.on("connectToRoom", (obj) => {
    const btn = document.getElementById("generate-sudoku-btn");
    if (btn) {
        if (obj.clients < 2) {
            btn.disabled = true;
        }
        else if (obj.clients == 2) {
            btn.disabled = false;
        }
    }
});
let gameClock = new GameClock(600);
socket.on("startGame", (msg) => {
    // console.log(msg);
    // Generate Boards
    genBoards();
    toggleCells(false);
    socket.emit("generateSudoku");
    // Start Clock
    gameClock.resetClock();
    gameClock.startClock();
});
socket.on('generateYourSudoku', (playerBoards) => {
    generateLocalSudoku(playerBoards, true);
});
socket.on("generateOpponentSudoku", (playerBoards) => {
    generateLocalSudoku(playerBoards, false);
});
socket.on('receiveScore', (result) => {
    const score = result.obj.score;
    const invalidCells = result.obj.invalidCells;
    const message = result.obj.message;
    const isPlayer1 = result.obj.isPlayer1;
    console.log("Received Score: " + score);
    console.log("Invalid Array Received: " + invalidCells);
    highlightInvalidCells(invalidCells);
    displayScore(score, message, isPlayer1);
});
function disableBoard2() {
    // console.log("Disabling Board 2");
    const board2 = document.getElementById("sudoku-board-2");
    if (board2) {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const cell = board2.children[i].getElementsByTagName("input")[j];
                cell.readOnly = true;
            }
        }
    }
}
function toggleCells(readOnly) {
    // console.log("Toggling Board - 1");
    const board1 = document.getElementById("sudoku-board-1");
    if (board1) {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const cell = board1.children[i].getElementsByTagName("input")[j];
                cell.readOnly = readOnly;
            }
        }
    }
}
toggleCells(true);
function genBoards() {
    // console.log("Generating Boards");
    const dropdown = document.getElementById("levelSelector");
    const level = dropdown?.value;
    if (level) {
        let player = new Sudoku(parseInt(level)).setupBoard();
        if (player) {
            // console.log("Sending to server: ", boards);
            socket.emit('genBoards', player);
        }
    }
}
function generateLocalSudoku(boards, isPlayer1) {
    // console.log("generating Local");
    const board1 = document.getElementById("sudoku-board-1");
    const board2 = document.getElementById("sudoku-board-2");
    // console.log(board1);
    // console.log(board2);
    if (!board1 || !board2) {
        return;
    }
    fillBoards(board1, isPlayer1 ? boards.p1 : boards.p2);
    fillBoards(board2, isPlayer1 ? boards.p2 : boards.p1);
    toggleCells(false);
}
function fillBoards(board, data) {
    // console.log("Filling the Board");
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            let inputElement = board.children[i].children[j].getElementsByTagName("input");
            if (inputElement) {
                if (data[i][j] == 0) {
                    inputElement[0].value = '';
                    inputElement[0].readOnly = false;
                }
                else {
                    inputElement[0].value = data[i][j].toString();
                    inputElement[0].readOnly = true;
                }
            }
        }
    }
}
function generateSudoku() {
    const genBtn = document.getElementById("generate-sudoku-btn");
    if (genBtn) {
        if (genBtn.innerText == "Submit") {
            // console.log("Submit Sudoku");
            genBtn.innerText = "Ready!";
            gameClock.stopClock();
            let currentTime = gameClock.getCurrentTime();
            submitBoards(currentTime);
        }
        else {
            socket.emit("readyPlayer", socket.id);
            genBtn.innerText = "Submit";
        }
    }
}
function submitBoards(currentTime) {
    let board = readBoard();
    console.log("Before Object: ");
    console.log(board);
    let obj = {
        submitTime: currentTime,
        sudokuBoard: board
    };
    console.log("From Object: ");
    console.log(obj.sudokuBoard);
    socket.emit("submitBoards", obj);
}
function readBoard() {
    let board = new Array(9).fill(0).map(() => new Array(9).fill(0));
    const boardEle = document.getElementById("sudoku-board-1");
    console.log("Board Element: " + boardEle);
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (boardEle) {
                if (boardEle.children[i].children[j].getElementsByTagName("input")[0].value == "") {
                    board[i][j] = 0;
                }
                else {
                    board[i][j] = parseInt(boardEle.children[i].children[j].getElementsByTagName("input")[0].value);
                }
            }
        }
    }
    return board;
}
function highlightInvalidCells(invalidCells) {
    //[j, i]
    invalidCells.forEach(([i, j]) => {
        const col = i + 1;
        const row = j + 1;
        document.getElementById(`cell-${col}-${row}`)?.children[0]?.classList.add("invalidCell");
    });
}
function displayScore(score, message, isPlayer1) {
    const scoreScreen = document.getElementById("score-container");
    const scoreSpan = document.getElementById("score");
    const messageDiv = document.querySelector(".score-header");
    const playerName = document.getElementById("player-name");
    if (scoreSpan && messageDiv && playerName) {
        scoreSpan.innerHTML = `${score}`;
        messageDiv.innerHTML = `${message}`;
        if (isPlayer1) {
            playerName.innerHTML = 'Player - 1';
        }
        else {
            playerName.innerHTML = 'Player - 2';
        }
    }
    else {
        window.alert("Error");
    }
    if (!scoreScreen) {
        return;
    }
    scoreScreen.classList.add('show-modal');
}
function hideScoreScreen() {
    const scoreScreen = document.getElementById("score-container");
    if (!scoreScreen) {
        return;
    }
    scoreScreen.classList.remove('show-modal');
}
// Dark Mode Function
let dark = false;
function darkMode() {
    // Change the Mode Icon
    const image = document.getElementById("darkMode-img");
    if (image) {
        if (!dark) {
            image.src = './icons/darkMode.png';
        }
        else {
            image.src = './icons/lightMode.png';
        }
        dark = !dark;
    }
    // Add the dark mode class
    document.documentElement.classList.toggle('darkMode');
}
