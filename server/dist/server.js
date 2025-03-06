"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const score_js_1 = require("./routes/score.js");
const express = require('express');
const PORT = process.env.PORT || 3000;
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
const root = process.env.ROOT_DIR;
app.use(express.static(root));
app.use(express.json());
app.use('/routes/score', score_js_1.scoreRoute);
let playersState = {};
io.on('connection', (socket) => {
    const roomId = 'room-1';
    if (!playersState[roomId]) {
        playersState[roomId] = {
            player1: null,
            player2: null
        };
    }
    if (!playersState[roomId].player1) {
        playersState[roomId].player1 = { playerId: socket.id, state: false, board: null, score: null };
    }
    else if (!playersState[roomId].player2) {
        playersState[roomId].player2 = { playerId: socket.id, state: false, board: null, score: null };
    }
    else {
        console.log("room Full");
        socket.emit("roomfull", "Sorry the room is already Full");
        return;
    }
    // console.log(playersState);
    console.log('a user connected with socket Id: ' + socket.id);
    socket.join("room-1");
    const clients = io.sockets.adapter.rooms.get('room-1');
    let msg = "";
    if (clients.size == 1) {
        msg = "Welcome! waiting for other player";
    }
    else if (clients.size == 2) {
        msg = "We've been waiting for you!";
    }
    const obj = {
        clients: clients.size,
        message: msg
    };
    io.sockets.in("room-1").emit("connectToRoom", obj);
    socket.on('genBoards', (board) => {
        if (!playersState[roomId].player1.board) {
            playersState[roomId].player1.board = board;
            console.log("Player - 1: ");
        }
        else {
            playersState[roomId].player2.board = board;
            console.log("Player - 2: ");
        }
    });
    socket.on('generateSudoku', () => {
        const playerBoards = {
            p1: playersState[roomId].player1.board,
            p2: playersState[roomId].player2.board
        };
        socket.emit('generateYourSudoku', playerBoards);
        socket.broadcast.to('room-1').emit('generateOpponentSudoku', playerBoards);
    });
    socket.on('updateButton', (data) => {
        io.emit("updateButtonState", data);
    });
    socket.on("readyPlayer", (socketId) => {
        if (playersState[roomId].player1.playerId == socketId && !playersState[roomId].player1.state) {
            playersState[roomId].player1.state = true;
        }
        else if (playersState[roomId].player2.playerId == socketId && !playersState[roomId].player2.state) {
            playersState[roomId].player2.state = true;
        }
        if (playersState[roomId].player1.state && playersState[roomId].player2.state) {
            io.to(roomId).emit('startGame', "Both Players Ready");
        }
    });
    socket.on('submitBoards', async (obj) => {
        // Note: Track the diffiulty level to calculate the scaling factor for penalties
        // console.log("Submitted at: " + obj.submitTime);
        // console.log("Sudoku Board: " + obj.sudokuBoard);
        // console.log(player1Board);
        try {
            const requestBody = {
                submitTime: obj.submitTime,
                submitBoard: obj.sudokuBoard,
                originalBoard: (playersState[roomId].player1.playerId == socket.id) ? playersState[roomId].player1.board : playersState[roomId].player2.board,
                isPlayer1: (playersState[roomId].player1.playerId == socket.id) ? true : false
            };
            // console.log("Request Body: ");
            // console.log("Submit Board: " + requestBody.submitBoard);
            // console.log("Original Board: " + requestBody.originalBoard);
            // console.log("Submit Time: " + requestBody.submitTime);
            const response = await axios.post('http://localhost:3000/routes/score', requestBody);
            if (!response) {
                console.log("No response received from the route");
            }
            // console.log(response.data.obj.score);
            // console.log(response.data.obj.invalidCells);
            socket.emit('receiveScore', response.data);
        }
        catch (err) {
            console.log(err);
            console.log("Unable to Access Score route");
        }
    });
});
server.listen(PORT, () => {
    console.log('listening on *:3000');
});
