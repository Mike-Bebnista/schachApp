const app = require('express');
const httpServer = require('http').createServer(app);
const io = require('socket.io')(httpServer, {
    cors: true,
    origins: ["*"]
});


let savedGameStatesBoard; //= "[[1,[\"Rook\",\"Black\"]],[2,[\"Knight\",\"Black\"]],[3,[\"Bishop\",\"Black\"]],[4,[\"Queen\",\"Black\"]],[5,[\"King\",\"Black\"]],[6,[\"Bishop\",\"Black\"]],[7,[\"Knight\",\"Black\"]],[8,[\"Rook\",\"Black\"]],[9,[\"Pawn\",\"Black\"]],[10,[\"Pawn\",\"Black\"]],[11,[\"Pawn\",\"Black\"]],[12,[\"Pawn\",\"Black\"]],[13,[\"Pawn\",\"Black\"]],[14,[\"Pawn\",\"Black\"]],[15,[\"Pawn\",\"Black\"]],[16,[\"Pawn\",\"Black\"]],[49,[\"Pawn\",\"White\"]],[50,[\"Pawn\",\"White\"]],[51,[\"Pawn\",\"White\"]],[52,[\"Pawn\",\"White\"]],[53,[\"Pawn\",\"White\"]],[54,[\"Pawn\",\"White\"]],[55,[\"Pawn\",\"White\"]],[56,[\"Pawn\",\"White\"]],[57,[\"Rook\",\"White\"]],[58,[\"Knight\",\"White\"]],[59,[\"Bishop\",\"White\"]],[60,[\"Queen\",\"White\"]],[61,[\"King\",\"White\"]],[62,[\"Bishop\",\"White\"]],[63,[\"Knight\",\"White\"]],[64,[\"Rook\",\"White\"]]]";
let savedGameStates;

io.on("connection", (socket) => {
    socket.on('joinGame', ({gameId}) => {
        socket.join(gameId);
        console.log("A player joined the room " + gameId);
        socket.to(gameId).emit('joinGame', "A player joined the game!");
        //io.emit('gameStateVomSocket', { savedGameStates, savedGameStatesBoard });
        socket.on('updateGameStateBackend', ({gameState, gameStateBoard}) => {
            savedGameStatesBoard = gameStateBoard;
            savedGameStates = gameState;
            //console.log('gameState im Socket:' + JSON.stringify(gameStates));
            //console.log('gameStateBoard im Socket:' + JSON.stringify(gameStatesBoard));
            io.emit('gameStateVomSocket', { gameState, gameStateBoard }); //savedGameStates und savedGameStatesBoard will nicht wegen JSON
        })
    });
});

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => console.log('Server is running on port ' + PORT));