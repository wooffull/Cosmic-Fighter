"use strict";

var Network = {
    socket      : undefined,
    localClient : {},
    clients     : {},
    connected   : false,
    event       : {
        CONNECT       : "connect",
        REMOVE_CLIENT : "removeClient",
        ADD_CLIENT    : "addClient"
    },

    init : function () {
        this.socket = io.connect();

        this.socket.on('confirm', this.onConfirmClient.bind(this));
        this.socket.on('addOther', this.onAddOtherClient.bind(this));
        this.socket.on('removeOther', this.onRemoveOtherClient.bind(this));
        this.socket.on('loadPrevious', this.onLoadPreviousClients.bind(this));
        this.socket.on('updateOther', this.onUpdateClient.bind(this));

        this.socket.emit('init', {
            user : "user"
        });
    },

    onConfirmClient : function (data) {
        var id = data.id;
        this.localClient = new LocalClient(id);
        this.clients[id] = this.localClient;

        this.onUpdateClient(data);

        this.connected = true;

        $(this).trigger(
            this.event.CONNECT
        );
    },

    onAddOtherClient : function (data) {
        var id = data.id;
        var newClient = new Client(id);

        this.clients[data.id] = newClient;
        
        this.onUpdateClient(data);

        $(this).trigger(
            this.event.ADD_CLIENT,
            this.clients[data.id]
        );
    },

    onRemoveOtherClient : function (data) {
        $(this).trigger(
            this.event.REMOVE_CLIENT,
            this.clients[data.id]
        );

        this.clients[data.id] = undefined;
        delete this.clients[data.id];
    },

    onLoadPreviousClients : function (data) {
        var keys = Object.keys(data);

        for (var i = 0; i < keys.length; i++) {
            var id = parseInt(keys[i]);
            var userData = data[id];

            this.onAddOtherClient(userData);
        }
    },

    onUpdateClient : function (data) {
        var id = data.id;
        var client = this.clients[id];

        client.gameObject.position.x = data.position.x;
        client.gameObject.position.y = data.position.y;
        client.gameObject.velocity.x = data.velocity.x;
        client.gameObject.velocity.y = data.velocity.y;
        client.gameObject.acceleration.x = data.acceleration.x;
        client.gameObject.acceleration.y = data.acceleration.y;
        client.gameObject.setRotation(data.rotation);
    }
};

module.exports = Network;

var Client = require('./Client.js');
var LocalClient = require('./LocalClient.js');