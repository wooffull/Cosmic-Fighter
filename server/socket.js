var io;
var clients       = {};
var rooms         = {};
var clientCounter = 0; // Increases per client connection
var roomCounter   = 0; // Increases per room addition

var configureSockets = function (socketio) {
    io = socketio;

    io.on('connection', function (socket) {
        var id = -1;
        var user = "";

        socket.join('clients');

        socket.on('init', function (data) {
            // Set up and add client object
            var client = {
                user         : data.user,
                id           : clientCounter,
                position     : { x : Math.random() * 200 - 100, y : Math.random() * 200 - 100 },
                velocity     : { x : 0, y : 0 },
                acceleration : { x : 0, y : 0 },
                rotation     : -Math.PI * 0.5,
                roomId       : undefined,
                team         : undefined
            };
            clients[clientCounter] = client;

            // Increase client counter
            clientCounter++;

            // Send a confirmation to the client connecting so they know their
            // ID
            socket.emit('confirm', client);

            // Notify all other clients that this new client has successfully
            // connected
            socket.broadcast.emit('addOther', client);

            // Set up socket
            id   = client.id;
            user = client.user;
        });

        socket.on('disconnect', function (data) {
            if (clients[id] && clients[id].roomId !== undefined) {
                onLeaveRoom(clients[id].roomId);
            }

            delete clients[id];

            socket.broadcast.emit('removeOther', {id : id});
            socket.leave('clients');
        });

        socket.on('updateOther', function (data) {
            if (clients[id] && clients[id].roomId !== undefined) {
                var updateData = {
                    id           : id,
                    position     : data.position,
                    velocity     : data.velocity,
                    acceleration : data.acceleration,
                    rotation     : data.rotation
                };

                clients[id].position     = data.position;
                clients[id].velocity     = data.velocity;
                clients[id].acceleration = data.acceleration;
                clients[id].rotation     = data.rotation;
                
                socket.broadcast.to("room" + clients[id].roomId).emit('updateOther', updateData);
            }
        });

        socket.on('updateRooms', function () {
            socket.emit('updateRooms', rooms);
        });

        socket.on('createRoom', function (data) {
            var room = {};
            room.name = data.name;
            room.id = roomCounter;
            room.players = [];
            room.teamA = [];
            room.teamB = [];

            rooms[room.id] = room;
            roomCounter++;

            io.sockets.emit('updateRooms', rooms);

            if (data.enter) {
                onEnterRoom(room.id);
            }
        });

        socket.on('switchTeam', function (roomId) {
            var room = rooms[roomId];

            // Remove player from their corresponding team's array and add to
            // the other (if there's space on the other team)
            if (clients[id].team === 0) {
                if (room.teamB.length < 4) {
                    var playerIndex = room.teamA.indexOf(id);
                    room.teamA.splice(playerIndex, 1);
                    room.teamB.push(id);
                    clients[id].team = 1;
                    io.sockets.in("room" + roomId).emit('updateRooms', rooms);
                }
            } else {
                if (room.teamA.length < 4) {
                    var playerIndex = room.teamB.indexOf(id);
                    room.teamB.splice(playerIndex, 1);
                    room.teamA.push(id);
                    clients[id].team = 0;
                    io.sockets.in("room" + roomId).emit('updateRooms', rooms);
                }
            }
        });

        var onEnterRoom = function (roomId) {
            var room = rooms[roomId];

            // Only add the player if the room isn't filled
            if (room.players.length < 7) {
                // Remove player from any room they're currently in
                if (clients[id].roomId !== undefined && clients[id].roomId !== roomId) {
                    onLeaveRoom(clients[id].roomId);
                }

                // Only add the player if they're not already in the room
                if (clients[id].roomId === undefined) {
                    socket.join("room" + roomId);

                    room.players.push(id);
                    clients[id].roomId = roomId;

                    // Add to team A if it's not filled
                    if (room.teamA.length < 4) {
                        clients[id].team = 0;
                        room.teamA.push(id);

                    // Add to team B if it's not filled
                    } else {
                        clients[id].team = 1;
                        room.teamB.push(id);
                    }

                    socket.emit('enterRoomSuccess', room);

                    // Update the players in this room to let them know a new
                    // player has joined it
                    io.sockets.in("room" + roomId).emit('updateRooms', rooms);
                }
            } else {
                socket.emit('enterRoomFail', { msg: "The room is filled. You cannot enter" });
            }
        };

        var onLeaveRoom = function (roomId) {
            var room = rooms[roomId];

            // Remove player's socket from the array
            var playerIndex = room.players.indexOf(id);
            room.players.splice(playerIndex, 1);

            // Remove player from their corresponding team's array
            if (clients[id].team === 0) {
                var playerIndex = room.teamA.indexOf(id);
                room.teamA.splice(playerIndex, 1);
            } else {
                var playerIndex = room.teamB.indexOf(id);
                room.teamB.splice(playerIndex, 1);
            }

            clients[id].roomId = undefined;
            clients[id].team   = undefined;

            // Destroy the room if there are no players remaining in it
            if (room.players.length === 0) {
                delete rooms[roomId];
                io.sockets.emit('updateRooms', rooms);

            // Otherwise, only update the players in the room that someone
            // has left
            } else {
                io.sockets.in("room" + roomId).emit('updateRooms', rooms);
            }

            socket.leave("room" + roomId);
        };

        socket.on('enterRoom', onEnterRoom);
        socket.on('leaveRoom', onLeaveRoom);

        // Make the new client load all previous client data (for those who are
        // still connected)
        socket.emit('loadPrevious', clients);
    });
};

module.exports.configureSockets = configureSockets;