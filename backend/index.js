const app = require('express');
const httpServer = require('http').createServer(app);
const io = require('socket.io')(httpServer, {
    cors: true,
    origins: ["*"]
});

const gameStates = new Map(); 
//Auch versucht als Objekt, crasht aber trotzdem
//const gameStates = {};

io.on("connection", (socket) => {
    socket.on('joinGame', ({gameId}) => {
        socket.join(gameId);
        console.log("A player joined the room " + gameId);
        socket.to(gameId).emit('joinGame', "A player joined the game!");
        socket.on('updateGameStateBackend', ({gameState}) => {
            gameStates.set(gameState); 
            //Hier dann auch als Objekt gesetzt
            //gameStates[gameId] = gameState;
            console.log('gameState im Socket:' + JSON.stringify(gameState));
            io.emit('gameStateVomSocket', { gameState });
        })
    });
});

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => console.log('Server is running on port ' + PORT));