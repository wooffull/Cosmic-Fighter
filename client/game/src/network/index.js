"use strict";

var Network = {
    socket      : undefined,
    localClient : {},
    clients     : {},
    rooms       : {},
    connected   : false,
    Event       : {
        CONNECT            : "connect",
        REMOVE_CLIENT      : "removeClient",
        ADD_CLIENT         : "addClient",
        UPDATE_ROOMS       : "updateRooms",
        ENTER_ROOM_SUCCESS : "enterRoomSuccess",
        ENTER_ROOM_FAIL    : "enterRoomFail"
    },

    init : function () {
        this.socket = io.connect();

        this.socket.on('confirm', this._onConfirmClient.bind(this));
        this.socket.on('addOther', this._onAddOtherClient.bind(this));
        this.socket.on('removeOther', this._onRemoveOtherClient.bind(this));
        this.socket.on('loadPrevious', this._onLoadPreviousClients.bind(this));
        this.socket.on('updateOther', this._onUpdateClient.bind(this));
        this.socket.on('updateRooms', this._onUpdateRooms.bind(this));
        this.socket.on('enterRoomSuccess', this._onEnterRoomSuccess.bind(this));
        this.socket.on('enterRoomFail', this._onEnterRoomFail.bind(this));

        this.socket.emit('init', {
            user : $("#userName").html()
        });
    },

    getRooms : function () {
        this.socket.emit('updateRooms');
    },

    createRoom : function (name) {
        var roomData = {
            name  : name,
            enter : true
        };

        this.socket.emit('createRoom', roomData);
    },

    enterRoom : function (room) {
        this.socket.emit('enterRoom', room.id);
    },

    leaveRoom : function (room) {
        this.socket.emit('leaveRoom', room.id);
    },

    _onConfirmClient : function (data) {
        var id = data.id;
        this.localClient = new LocalClient(id, data);
        this.clients[id] = this.localClient;

        this._onUpdateClient(data);

        this.connected = true;

        $(this).trigger(
            this.Event.CONNECT
        );
    },

    _onAddOtherClient : function (data) {
        var id = data.id;
        var newClient = new Client(id, data);

        this.clients[data.id] = newClient;

        this._onUpdateClient(data);

        $(this).trigger(
            this.Event.ADD_CLIENT,
            this.clients[data.id]
        );
    },

    _onRemoveOtherClient : function (data) {
        $(this).trigger(
            this.Event.REMOVE_CLIENT,
            this.clients[data.id]
        );

        this.clients[data.id] = undefined;
        delete this.clients[data.id];
    },

    _onLoadPreviousClients : function (data) {
        var keys = Object.keys(data);

        for (var i = 0; i < keys.length; i++) {
            var id = parseInt(keys[i]);
            var userData = data[id];

            this._onAddOtherClient(userData);
        }
    },

    _onUpdateClient : function (data) {
        var id = data.id;
        var client = this.clients[id];

        client.data = data;
        client.gameObject.position.x = data.position.x;
        client.gameObject.position.y = data.position.y;
        client.gameObject.velocity.x = data.velocity.x;
        client.gameObject.velocity.y = data.velocity.y;
        client.gameObject.acceleration.x = data.acceleration.x;
        client.gameObject.acceleration.y = data.acceleration.y;
        client.gameObject.setRotation(data.rotation);
    },

    _onUpdateRooms : function (data) {
        this.rooms = data;

        $(this).trigger(
            this.Event.UPDATE_ROOMS,
            data
        );
    },

    _onEnterRoomSuccess : function (data) {
        $(this).trigger(
            this.Event.ENTER_ROOM_SUCCESS,
            data
        );
    },

    _onEnterRoomFail : function (data) {
        $(this).trigger(
            this.Event.ENTER_ROOM_FAIL,
            data
        );
    }
};

module.exports = Network;

var Client = require('./Client.js');
var LocalClient = require('./LocalClient.js');