var io;
var clients       = {};
var rooms         = {};
var clientCounter = 0; // Increases per client connection
var roomCounter   = 0; // Increases per room addition

var GAME_DURATION = 10 * 1000 * 1;
var COUNTDOWN = 1000 * 5;
var RESPAWN_DURATION = 1000 * 3;
var PLAYER_HEALTH = 3;

var configureSockets = function (socketio) {
    io = socketio;

    io.on('connection', function (socket) {
        var id = -1;

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
                team         : undefined,
                health       : PLAYER_HEALTH,
                kills        : 0,
                deaths       : 0,
                ready        : false,
                ping         : -1
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
            id = client.id;
        });

        socket.on('disconnect', function (data) {
            if (clients[id] && clients[id].roomId !== undefined) {
                onLeaveRoom(clients[id].roomId);
            }

            delete clients[id];

            socket.broadcast.emit('removeOther', {id : id});
            socket.leave('clients');
        });

        var onUpdateOther = function (data) {
            if (clients[id] && clients[id].roomId !== undefined) {
                var updateData = {
                    id           : id,
                    user         : clients[id].user,
                    position     : data.position,
                    velocity     : data.velocity,
                    acceleration : data.acceleration,
                    rotation     : data.rotation,
                    health       : clients[id].health,
                    kills        : clients[id].kills,
                    deaths       : clients[id].deaths,
                    team         : clients[id].team,
                    ready        : clients[id].ready
                };

                clients[id].position     = updateData.position;
                clients[id].velocity     = updateData.velocity;
                clients[id].acceleration = updateData.acceleration;
                clients[id].rotation     = updateData.rotation;

                socket.broadcast.to("room" + clients[id].roomId).emit('updateOther', updateData);
            }
        };

        var onUpdateReady = function (data) {
            if (clients[id] && clients[id].roomId !== undefined) {
                var updateData = {
                    id           : id,
                    user         : clients[id].user,
                    position     : clients[id].position,
                    velocity     : clients[id].velocity,
                    acceleration : clients[id].acceleration,
                    rotation     : clients[id].rotation,
                    health       : clients[id].health,
                    kills        : clients[id].kills,
                    deaths       : clients[id].deaths,
                    team         : clients[id].team,
                    ready        : data.ready
                };

                clients[id].ready = data.ready;

                io.sockets.in("room" + clients[id].roomId).emit('updateOther', updateData);
                io.sockets.in("room" + clients[id].roomId).emit('updateRooms', rooms);

                updatePlayState(clients[id].roomId);
            }
        };

        var updatePlayState = function (roomId) {
            var room = rooms[roomId];

            if (!room.playing) {
                // There needs to be at least one player on each team
                if (room.teamA.length > 0 && room.teamB.length > 0) {
                    // Go through all players in the room. If one of them isn't
                    // ready, the room isn't ready to player
                    for (var i = 0; i < room.players.length; i++) {
                        var player = clients[room.players[i]];
                        if (!player.ready) {
                            return;
                        }
                    }

                    // Send a "ping" too all clients in the room
                    var pingObj = { pingTime : Date.now() };
                    io.sockets.in("room" + roomId).emit('ping', pingObj);
                }
            }
        };

        var startGame = function (roomId) {
            var room = rooms[roomId];
            room.playing = true;

            io.sockets.in("room" + roomId).emit('startGame', room);
        };

        socket.on('returnPing', function (pingObj) {
            var player = clients[id];
            var room = rooms[player.roomId];

            if (!room.playing) {
                var ping = Date.now() - pingObj.pingTime;
                player.ping = ping;

                // Find the player with the lowest ping if all players have responded
                var minPing = Infinity;
                var minPingPlayerId;
                for (var i = 0; i < room.players.length; i++) {
                    var curPlayerId = room.players[i];
                    var curPlayer = clients[curPlayerId];

                    // If even one player hasn't responded yet, the room isn't
                    // ready to play
                    if (curPlayer.ping < 0) {
                        return;
                    } else {
                        if (curPlayer.ping < minPing) {
                            minPing = curPlayer.ping;
                            minPingPlayerId = curPlayerId;
                        }
                    }
                }

                room.hostId = minPingPlayerId;

                var hostObj = { id : minPingPlayerId };
                io.sockets.in("room" + player.roomId).emit('setHost', hostObj);

                startGame(room.id);
            }
        });

        socket.on('updateOther', onUpdateOther);
        socket.on('updateReady', onUpdateReady);

        socket.on('updateRooms', function () {
            socket.emit('updateRooms', rooms);
        });

        socket.on('gameOverData', function (roomId) {
            var room = rooms[roomId];
            var teamA = [];
            var teamB = [];

            for (var i = 0; i < room.teamA.length; i++) {
                var curPlayer = clients[room.teamA[i]];
                teamA.push(curPlayer);
            }
            for (var i = 0; i < room.teamB.length; i++) {
                var curPlayer = clients[room.teamB[i]];
                teamB.push(curPlayer);
            }

            var gameOverMessage = {
                teamA : teamA,
                teamB : teamB
            };

            io.sockets.in("room" + room.id).emit('gameOverData', gameOverMessage);

            // Reset players' info for that game
            for (var i = 0; i < room.players.length; i++) {
                clients[room.players[i]].health = PLAYER_HEALTH;
                clients[room.players[i]].kills = 0;
                clients[room.players[i]].deaths = 0;
            }
        });

        var endGame = function (data) {
            var player = clients[id];
            var room = rooms[player.roomId];

            if (room.playing) {
                room.playing = false;
                room.timeRemaining = GAME_DURATION;
                room.countdown = COUNTDOWN;
                room.hostId = -1;

                // Reset players' info for that game
                for (var i = 0; i < room.players.length; i++) {
                    clients[room.players[i]].ready = false;
                }

                io.sockets.in("room" + room.id).emit('updateRooms', rooms);
                io.sockets.in("room" + room.id).emit('endGame', room);
            }
        };

        socket.on('endGame', endGame);

        socket.on('clockTick', function (data) {
            var player = clients[id];
            var room = rooms[player.roomId];

            if (room.playing) {
                room.timeRemaining = data.timeRemaining;

                if (room.timeRemaining > 0) {
                    var clockTimeMessage = { timeRemaining : room.timeRemaining };
                    socket.broadcast.to("room" + player.roomId).emit('clockTick', clockTimeMessage);
                } else {
                    endGame(data);
                }
            }
        });

        socket.on('countdown', function (data) {
            var player = clients[id];
            var room = rooms[player.roomId];

            if (room.playing && room.countdown > 0) {
                data.countdown = Math.max(data.countdown, 0);
                room.countdown = data.countdown;

                var countdownMessage = { countdown : room.countdown };
                socket.broadcast.to("room" + player.roomId).emit('countdown', countdownMessage);
            }
        });

        var onPlayerRespawn = function (data) {
            var deadPlayer = clients[data.dead];
            var room = rooms[deadPlayer.roomId];

            if (room.playing) {
                var respawnMessage = {
                    respawn : deadPlayer.id
                };
                io.sockets.in("room" + room.id).emit('playerRespawn', respawnMessage);
            }
        };

        socket.on('playerDeath', function (data) {
            var deadPlayer = clients[data.dead];
            var killerPlayer = clients[data.killer];
            var room = rooms[deadPlayer.roomId];

            deadPlayer.deaths++;
            killerPlayer.kills++;

            var playerDeathMessage = {
                dead : data.dead,
                killer : data.killer
            };

            io.sockets.in("room" + room.id).emit('playerDeath', playerDeathMessage);

            // If there is enough time remaining in the game, set a timeout
            // for the player's respawn
            if (room.timeRemaining >= RESPAWN_DURATION) {
                setTimeout(onPlayerRespawn.bind(this, data), RESPAWN_DURATION);
            }
        });

        socket.on('bullet', function (data) {
            var player = clients[id];
            var room = rooms[player.roomId];

            if (room.playing) {
                var bulletData = {
                    position     : player.position,
                    velocity     : player.velocity,
                    acceleration : player.acceleration,
                    rotation     : player.rotation,
                    team         : player.team,
                    playerId     : player.id
                };

                io.sockets.in("room" + room.id).emit('bullet', bulletData);
            }
        });

        socket.on('createRoom', function (data) {
            var room = {};
            room.name = data.name;
            room.id = roomCounter;
            room.players = [];
            room.playing = false;
            room.teamA = [];
            room.teamB = [];
            room.hostId = -1;
            room.timeRemaining = GAME_DURATION;
            room.countdown = COUNTDOWN;
            room.respawnTime = RESPAWN_DURATION;

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
            var playerIndex;
            if (clients[id].team === 0) {
                if (room.teamB.length < 4) {
                    playerIndex = room.teamA.indexOf(id);
                    room.teamA.splice(playerIndex, 1);
                    room.teamB.push(id);
                    clients[id].team = 1;
                    io.sockets.in("room" + roomId).emit('updateRooms', rooms);
                }
            } else {
                if (room.teamA.length < 4) {
                    playerIndex = room.teamB.indexOf(id);
                    room.teamB.splice(playerIndex, 1);
                    room.teamA.push(id);
                    clients[id].team = 0;
                    io.sockets.in("room" + roomId).emit('updateRooms', rooms);
                }
            }
        });

        var onEnterRoom = function (roomId) {
            if (typeof roomId === "number") {
                var room = rooms[roomId];

                // Only add the player if the room isn't filled and isn't playing
                // the game
                if (room.players.length < 8 && !room.playing) {
                    // Remove player from any room they're currently in
                    if (clients[id].roomId !== undefined && clients[id].roomId !== roomId) {
                        onLeaveRoom(clients[id].roomId);
                    }

                    // Only add the player if they're not already in the room
                    if (clients[id].roomId === undefined) {
                        socket.join("room" + roomId);
                        clients[id].roomId = roomId;

                        // Update this player with data for all other players in the room
                        for (var i = 0; i < room.players.length; i++) {
                            var player = clients[room.players[i]];
                            socket.emit('updateOther', player);
                        }

                        // Add this player to the room
                        room.players.push(id);

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
                } else if (room.players.length === 8) {
                    socket.emit('enterRoomFail', { msg: "The room is filled. You cannot enter." });
                } else if (room.playing) {
                    socket.emit('enterRoomFail', { msg: "The room is busy playing. You cannot enter until the game is over." });
                }
            }
        };

        var onLeaveRoom = function (roomId) {
            if (typeof roomId === "number") {
                var room = rooms[roomId];

                // Client is forced to not be ready -- update all players in the room
                clients[id].ready  = false;
                onUpdateReady(clients[id]);

                // Remove player's socket from the array
                var playerIndex = room.players.indexOf(id);
                room.players.splice(playerIndex, 1);

                // Remove player from their corresponding team's array
                var teamArrayIndex;
                if (clients[id].team === 0) {
                    teamArrayIndex = room.teamA.indexOf(id);
                    room.teamA.splice(teamArrayIndex, 1);
                } else {
                    teamArrayIndex = room.teamB.indexOf(id);
                    room.teamB.splice(teamArrayIndex, 1);
                }

                clients[id].roomId = undefined;
                clients[id].team   = undefined;
                clients[id].ping   = -1;

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