const app = require('express');
const httpServer = require('http').createServer(app);
const io = require('socket.io')(httpServer, {
    cors: true,
    origins: ["*"]
});

let savedBoard = "[[1,[\"Rook\",\"Black\"]],[2,[\"Knight\",\"Black\"]],[3,[\"Bishop\",\"Black\"]],[4,[\"Queen\",\"Black\"]],[5,[\"King\",\"Black\"]],[6,[\"Bishop\",\"Black\"]],[7,[\"Knight\",\"Black\"]],[8,[\"Rook\",\"Black\"]],[9,[\"Pawn\",\"Black\"]],[10,[\"Pawn\",\"Black\"]],[11,[\"Pawn\",\"Black\"]],[12,[\"Pawn\",\"Black\"]],[13,[\"Pawn\",\"Black\"]],[14,[\"Pawn\",\"Black\"]],[15,[\"Pawn\",\"Black\"]],[16,[\"Pawn\",\"Black\"]],[49,[\"Pawn\",\"White\"]],[50,[\"Pawn\",\"White\"]],[51,[\"Pawn\",\"White\"]],[52,[\"Pawn\",\"White\"]],[53,[\"Pawn\",\"White\"]],[54,[\"Pawn\",\"White\"]],[55,[\"Pawn\",\"White\"]],[56,[\"Pawn\",\"White\"]],[57,[\"Rook\",\"White\"]],[58,[\"Knight\",\"White\"]],[59,[\"Bishop\",\"White\"]],[60,[\"Queen\",\"White\"]],[61,[\"King\",\"White\"]],[62,[\"Bishop\",\"White\"]],[63,[\"Knight\",\"White\"]],[64,[\"Rook\",\"White\"]]]";
let savedGameState = { "board": {}, "active": "White", "history": [{ "count": 0, "from": 0, "to": 0, "action": null, "state": {} }], "availableMoves": [{}, {}], "selectedSquare": {} };
let backendTime
let whiteTimer = 5000;
let blackTimer = 5000;
let whiteTimerInterval;
let blackTimerInterval;
let whiteLost = false;
let blackLost = false;

io.on("connection", (socket) => {
    socket.on('joinGame', ({ gameId }) => {
        socket.join(gameId);
        console.log("A player joined the room " + gameId);
        socket.to(gameId).emit('joinGame', "A player joined the game!");
        io.to(gameId).emit('gameStateVomSocket', { savedGameState, savedBoard });
        io.to(gameId).emit('updateTimers', { whiteTimer, blackTimer });
        socket.on('updateGameStateBackend', ({ gameState, gameStateBoard }) => {
            backendTime = performance.now();

            savedGameState = gameState;
            savedBoard = gameStateBoard;

            startNextPlayerTimer(gameId);
            io.to(gameId).emit('gameStateVomSocket', { savedGameState, savedBoard });
            io.to(gameId).emit('updateTimers', { whiteTimer, blackTimer });

            backendTime = performance.now() - backendTime;
            console.log('Backend Zeit: ' + backendTime + ' Millisekunden.')
        })
    });
    socket.on('newGame', ({ gameId }) => {
        console.log('Jemand hat New Game gedrückt')
        savedBoard = "[[1,[\"Rook\",\"Black\"]],[2,[\"Knight\",\"Black\"]],[3,[\"Bishop\",\"Black\"]],[4,[\"Queen\",\"Black\"]],[5,[\"King\",\"Black\"]],[6,[\"Bishop\",\"Black\"]],[7,[\"Knight\",\"Black\"]],[8,[\"Rook\",\"Black\"]],[9,[\"Pawn\",\"Black\"]],[10,[\"Pawn\",\"Black\"]],[11,[\"Pawn\",\"Black\"]],[12,[\"Pawn\",\"Black\"]],[13,[\"Pawn\",\"Black\"]],[14,[\"Pawn\",\"Black\"]],[15,[\"Pawn\",\"Black\"]],[16,[\"Pawn\",\"Black\"]],[49,[\"Pawn\",\"White\"]],[50,[\"Pawn\",\"White\"]],[51,[\"Pawn\",\"White\"]],[52,[\"Pawn\",\"White\"]],[53,[\"Pawn\",\"White\"]],[54,[\"Pawn\",\"White\"]],[55,[\"Pawn\",\"White\"]],[56,[\"Pawn\",\"White\"]],[57,[\"Rook\",\"White\"]],[58,[\"Knight\",\"White\"]],[59,[\"Bishop\",\"White\"]],[60,[\"Queen\",\"White\"]],[61,[\"King\",\"White\"]],[62,[\"Bishop\",\"White\"]],[63,[\"Knight\",\"White\"]],[64,[\"Rook\",\"White\"]]]";
        savedGameState = { "board": {}, "active": "White", "history": [{ "count": 0, "from": 0, "to": 0, "action": null, "state": {} }], "availableMoves": [{}, {}], "selectedSquare": {} };
        whiteTimer = 5000;
        blackTimer = 5000;
        whiteLost = false;
        blackLost = false;
        io.to(gameId).emit('gameStateVomSocket', { savedGameState, savedBoard });
        io.to(gameId).emit('updateTimers', { whiteTimer, blackTimer });
    })
});

function startNextPlayerTimer(gameId) {
    clearInterval(whiteTimerInterval);
    clearInterval(blackTimerInterval);
    if (savedGameState.history.length >= 2) {
        if (savedGameState.active === 'Black') {
            blackTimerInterval = setInterval(() => {
                blackTimer -= 10;
                if (blackTimer <= 0 && blackLost == false) {
                    clearInterval(blackTimerInterval);
                    blackTimer = 0;
                    io.to(gameId).emit('updateTimers', { whiteTimer, blackTimer });
                    blackLost = true;
                }
            }, 10);
        } else if (savedGameState.active === 'White') {
            whiteTimerInterval = setInterval(() => {
                whiteTimer -= 10;
                if (whiteTimer <= 0 && whiteLost == false) {
                    clearInterval(whiteTimerInterval);
                    whiteTimer = 0;
                    io.to(gameId).emit('updateTimers', { whiteTimer, blackTimer });
                    whiteLost = true;
                }
            }, 10);
        }
    }
}

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => console.log('Server is running on port ' + PORT));