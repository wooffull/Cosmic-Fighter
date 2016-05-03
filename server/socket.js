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
                roomId       : undefined
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
            if (clients[id]) {
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

                socket.broadcast.emit('updateOther', updateData);
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

            rooms[room.id] = room;
            roomCounter++;

            io.sockets.emit('updateRooms', rooms);

            if (data.enter) {
                onEnterRoom(room.id);
            }
        });

        var onEnterRoom = function (roomId) {
            var room = rooms[roomId];

            // Only add the player if the room isn't filled
            if (room.players.length < 7) {
                // Remove player from any room they're currently in
                if (clients[id].roomId !== undefined && clients[id].roomId !== room.id) {
                    onLeaveRoom(clients[id].roomId);
                }

                // Only add the player if they're not already in the room
                if (clients[id].roomId === undefined) {
                    socket.join("room" + room.id);

                    room.players.push(id);
                    clients[id].roomId = room.id;

                    socket.emit('enterRoomSuccess', room);
                }
            } else {
                socket.emit('enterRoomFail', { msg: "The room is filled. You cannot enter" });
            }
        };

        var onLeaveRoom = function (roomId) {
            var room = rooms[roomId];

            socket.leave("room" + room.id);

            // Remove player's socket from the array
            var playerIndex = room.players.indexOf(id);
            room.players.splice(playerIndex, 1);

            clients[id].roomId = undefined;

            // Destroy the room if there are no players remaining in it
            if (room.players.length === 0) {
                delete rooms[room.id];
                io.sockets.emit('updateRooms', rooms);
            }
        };

        socket.on('enterRoom', onEnterRoom);
        socket.on('leaveRoom', onLeaveRoom);

        // Make the new client load all previous client data (for those who are
        // still connected)
        socket.emit('loadPrevious', clients);
    });
};

module.exports.configureSockets = configureSockets;