var io;
var clients       = {};
var clientCounter = 0; // Increases per client connection

var configureSockets = function (socketio) {
    io = socketio;

    io.on('connection', function (socket) {
        var id = -1;
        var user = "";

        socket.join('clients');

        socket.on('init', function (data) {
            // Set up and add client object
            var client = {
                user     : data.user,
                id       : clientCounter,
                x        : Math.random() * 200 - 100,
                y        : Math.random() * 200 - 100,
                rotation : -Math.PI * 0.5
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
            delete clients[id];

            socket.broadcast.emit('removeOther', {id : id});
            socket.leave('clients');
        });

        socket.on('updateOther', function (data) {
            if (clients[id]) {
                var updateData = {
                    id       : id,
                    x        : data.x,
                    y        : data.y,
                    rotation : data.rotation
                };

                clients[id].x        = data.x;
                clients[id].y        = data.y;
                clients[id].rotation = data.rotation;

                socket.broadcast.emit('updateOther', updateData);
            }
        });

        // Make the new client load all previous client data (for those who are
        // still connected)
        socket.emit('loadPrevious', clients);
    });
};

module.exports.configureSockets = configureSockets;