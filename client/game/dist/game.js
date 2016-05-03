(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.cf = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var util = require('../util');
var Assets = util.Assets;
var Player = require('./Player');
var GameObject = wfl.core.entities.GameObject;
var LivingObject = wfl.core.entities.LivingObject;
var geom = wfl.geom;

var ClientPlayer = function () {
    LivingObject.call(this);

    // Create default state
    this.defaultGraphic = Assets.get(Assets.CLIENT);

    var w = this.defaultGraphic.width;
    var h = this.defaultGraphic.height;
    var verts = [
        new geom.Vec2(-w * 0.5, -h * 0.5),
        new geom.Vec2(w * 0.5, 0),
        new geom.Vec2(-w * 0.5, h * 0.5)
    ];
    var frameObj = this.createFrame(this.defaultGraphic, 1, false);
    frameObj.vertices = verts;

    this.defaultState = this.createState();
    this.defaultState.addFrame(frameObj);
    this.addState(GameObject.STATE.DEFAULT, this.defaultState);

    this.rotate(-Math.PI * 0.5);
};
Object.defineProperties(ClientPlayer, {
    ARRIVAL_SLOWING_RADIUS : {
        value : 200
    },

    MIN_ARRIVAL_RADIUS : {
        value : 8
    },

    MINIMAP_FILL_STYLE : {
        value : "#06c833"
    }
});
ClientPlayer.prototype = Object.freeze(Object.create(LivingObject.prototype, {
    drawOnMinimap : {
        value : function (ctx) {
            var w = this.getWidth();
            var h = this.getHeight();
            var offsetX = Math.round(-w * 0.5);
            var offsetY = Math.round(-h * 0.5);
            var displayWidth = Math.round(w);
            var displayHeight = Math.round(h);

            ctx.save();

            ctx.fillStyle = ClientPlayer.MINIMAP_FILL_STYLE;
            ctx.fillRect(offsetX, offsetY, displayWidth, displayHeight);

            ctx.restore();
        }
    }
}));
Object.freeze(ClientPlayer);

module.exports = ClientPlayer;
},{"../util":21,"./Player":3}],2:[function(require,module,exports){
"use strict";

var util = require('../util');
var Assets = util.Assets;
var GameObject = wfl.core.entities.GameObject;
var PhysicsObject = wfl.core.entities.PhysicsObject;

/**
 * A full-sized, quadrilateral block
 */
var FullBlock = function () {
    PhysicsObject.call(this);

    this.id = FullBlock.id;

    // Create default state
    this.defaultGraphic = Assets.get(Assets.BLOCK_FULL);
    this.defaultState = this.createState();
    this.defaultState.addFrame(
        this.createFrame(this.defaultGraphic)
    );
    this.addState(GameObject.STATE.DEFAULT, this.defaultState);

    this.solid = true;
    this.fixed = true;
    this.rotate(-Math.PI * 0.5);
};
Object.defineProperties(FullBlock, {
    name : {
        value : "FullBlock"
    },

    id : {
        value : 0
    }
});
FullBlock.prototype = Object.freeze(Object.create(PhysicsObject.prototype, {
    drawOnMinimap : {
        value : function (ctx) {
            var w = this.getWidth();
            var h = this.getHeight();
            var offsetX = Math.round(-w * 0.5);
            var offsetY = Math.round(-h * 0.5);
            var displayWidth = Math.round(w);
            var displayHeight = Math.round(h);

            ctx.save();

            ctx.rotate(this.getRotation());

            /*ctx.fillStyle =
                app.gameobject.PhysicsObject.MINIMAP_FILL_STYLE;
            ctx.strokeStyle =
                app.gameobject.PhysicsObject.MINIMAP_STROKE_STYLE;*/

            ctx.beginPath();
            ctx.rect(offsetX, offsetY, displayWidth, displayHeight);
            ctx.fill();
            ctx.stroke();

            ctx.restore();
        }
    }
}));
Object.freeze(FullBlock);

module.exports = FullBlock;
},{"../util":21}],3:[function(require,module,exports){
"use strict";

var util = require('../util');
var Assets = util.Assets;
var Network = require('../network');
var GameObject = wfl.core.entities.GameObject;
var LivingObject = wfl.core.entities.LivingObject;
var geom = wfl.geom;

var Player = function () {
    LivingObject.call(this);

    this.solid = true;

    // Create default state
    this.defaultGraphic = Assets.get(Assets.PLAYER);

    var w = this.defaultGraphic.width;
    var h = this.defaultGraphic.height;
    var verts = [
        new geom.Vec2(-w * 0.5, -h * 0.5),
        new geom.Vec2(w * 0.5, 0),
        new geom.Vec2(-w * 0.5, h * 0.5)
    ];
    var frameObj = this.createFrame(this.defaultGraphic, 1, false);
    frameObj.vertices = verts;

    this.defaultState = this.createState();
    this.defaultState.addFrame(frameObj);
    this.addState(GameObject.STATE.DEFAULT, this.defaultState);

    this.lastSentPosition = new geom.Vec2(-Infinity, -Infinity);

    this.rotate(-Math.PI * 0.5);
};
Object.defineProperties(Player, {
    TURN_SPEED : {
        value : 0.05
    },

    BRAKE_RATE : {
        value : 0.95
    },

    BOOST_ACCELERATION : {
        value : 0.0002
    },

    POSITION_UPDATE_DISTANCE : {
        value : 0.5
    },

    MINIMAP_FILL_STYLE : {
        value : "#86c8d3"
    }
});
Player.prototype = Object.freeze(Object.create(LivingObject.prototype, {
    update : {
        value : function (dt) {
            LivingObject.prototype.update.call(this, dt);
            
            // If the player is connected to the network, send out updates to
            // other players when necessary
            if (Network.connected) {
                Network.socket.emit('updateOther', {
                    position     : this.position,
                    velocity     : this.velocity,
                    acceleration : this.acceleration,
                    rotation     : this.getRotation()
                });
            }
        }
    },

    drawOnMinimap : {
        value : function (ctx) {
            var w = this.getWidth();
            var h = this.getHeight();
            var offsetX = Math.round(-w * 0.5);
            var offsetY = Math.round(-h * 0.5);
            var displayWidth = Math.round(w);
            var displayHeight = Math.round(h);

            ctx.save();

            ctx.fillStyle = Player.MINIMAP_FILL_STYLE;
            ctx.fillRect(offsetX, offsetY, displayWidth, displayHeight);

            ctx.restore();
        }
    }
}));
Object.freeze(Player);

module.exports = Player;
},{"../network":8,"../util":21}],4:[function(require,module,exports){
"use strict";

var FullBlock = require('./FullBlock.js');
var Player = require('./Player.js');
var ClientPlayer = require('./ClientPlayer.js');

module.exports = {
    FullBlock : FullBlock,
    Player: Player,
    ClientPlayer : ClientPlayer
};
},{"./ClientPlayer.js":1,"./FullBlock.js":2,"./Player.js":3}],5:[function(require,module,exports){
"use strict";

var Network = require('./network');
var util = require('./util');
var Assets = util.Assets;
var scenes = require('./scenes');
var overlays = require('./overlays');

// Create game
var canvas = document.querySelector("#game-canvas");
var game   = wfl.create(canvas);

var loadingScene = new scenes.LoadingScene(canvas);
game.setScene(loadingScene);

var onLoad = function () {
    $(Network).on(
        Network.Event.CONNECT,
        onNetworkConnect
    );

    Network.init();
};

var onNetworkConnect = function () {
    var lobbyScene = new scenes.LobbyScene(canvas);
    game.setScene(lobbyScene);
    
    $(lobbyScene).on("play-game", onPlayGame);
};

var onPlayGame = function (e, roomId) {
    $(game.getScene()).off();
    
    var gameScene = new scenes.GameScene(canvas, roomId);
    game.setScene(gameScene);
};

var Preloader = new util.Preloader(onLoad.bind(this));
},{"./network":8,"./overlays":13,"./scenes":18,"./util":21}],6:[function(require,module,exports){
"use strict";

var entities = require('../entities');

var Client = function (id, data) {
    this.id = id;
    this.data = data;
    this.gameObject = new entities.ClientPlayer();
};
Object.freeze(Client);

module.exports = Client;
},{"../entities":4}],7:[function(require,module,exports){
"use strict";

var entities = require('../entities');

var LocalClient = function (id, data) {
    this.id = id;
    this.data = data;
    this.gameObject = new entities.Player();
};
Object.freeze(LocalClient);

module.exports = LocalClient;
},{"../entities":4}],8:[function(require,module,exports){
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
},{"./Client.js":6,"./LocalClient.js":7}],9:[function(require,module,exports){
"use strict";

var Overlay = require('./Overlay');

var CreateRoomOverlay = function () {
    Overlay.call(this);
    
    this.inputField = $("<input>");
    this.inputField.attr({ "placeholder" : "Room Name" });
    this.inputField.addClass("create-room-overlay-input");
    
    this.buttonContainer = $("<div>");
    this.buttonContainer.addClass("create-room-overlay-button-container");
    
    this.cancelBtn = $("<button>");
    this.cancelBtn.text("Cancel");
    this.buttonContainer.append(this.cancelBtn);
    
    this.createBtn = $("<button>");
    this.createBtn.text("Create");
    this.buttonContainer.append(this.createBtn);

    this.domObject.append(this.inputField);
    this.domObject.append(this.buttonContainer);
    this.domObject.addClass("create-room-overlay");
};

CreateRoomOverlay.prototype = Object.freeze(Object.create(Overlay.prototype, {

}));

module.exports = CreateRoomOverlay;
},{"./Overlay":12}],10:[function(require,module,exports){
"use strict";

var Overlay = require('./Overlay');

var LoadingOverlay = function () {
    Overlay.call(this);
    
    this.domObject.addClass("loading-overlay");
};

LoadingOverlay.prototype = Object.freeze(Object.create(Overlay.prototype, {

}));

module.exports = LoadingOverlay;
},{"./Overlay":12}],11:[function(require,module,exports){
"use strict";

var Overlay = require('./Overlay');
var Network = require('../network');

var LobbyOverlay = function () {
    Overlay.call(this);

    // Set up left side
    this.leftContainer = $("<span>");
    this.leftContainer.addClass("lobby-overlay-left");

    this.roomButtonContainer = $("<div>");
    this.roomButtonContainer.addClass("lobby-overlay-button-container");
    this.leftContainer.append(this.roomButtonContainer);

    this.selectRoomLabel = $("<div>");
    this.selectRoomLabel.html("Select or create a room");
    this.roomButtonContainer.append(this.selectRoomLabel);
    this.roomButtonContainer.append($("<br>"));

    this.createRoomBtn = $("<button>");
    this.createRoomBtn.text("Create Room");
    this.roomButtonContainer.append(this.createRoomBtn);

    this.roomListContainer = $("<div>");
    this.roomListContainer.addClass("lobby-overlay-room-list");
    this.roomListContainer.html("Loading rooms...");
    this.leftContainer.append(this.roomListContainer);

    // Set up right side
    this.rightContainer = $("<span>");
    this.rightContainer.addClass("lobby-overlay-right");

    this.selectedRoomLabel = $("<div>");
    this.renderRoomLabel();
    this.rightContainer.append(this.selectedRoomLabel);

    this.playerList = $("<div>");
    this.renderPlayers();
    this.rightContainer.append(this.playerList);

    this.playBtn = $("<button>");
    this.playBtn.text("Play");
    this.playBtn.addClass("lobby-overlay-play-btn");
    this.rightContainer.append(this.playBtn);

    this.domObject.append(this.leftContainer);
    this.domObject.append(this.rightContainer);
    this.domObject.addClass("lobby-overlay");
    this.domObject.addClass("fade-in");
};

Object.defineProperties(LobbyOverlay, {
    Event : {
        value : {
            ENTER_ROOM : "enterRoom"
        }
    }
});

LobbyOverlay.prototype = Object.freeze(Object.create(Overlay.prototype, {
    showRooms : {
        value : function (roomData) {
            this.roomListContainer.html("");

            $(".lobby-overlay-room").off("click");

            var keys = Object.keys(roomData);

            if (keys.length === 0) {
                this.roomListContainer.html("No rooms available");
            } else {
                for (var i = 0; i < keys.length; i++) {
                    var curRoom = roomData[keys[i]];
                    var curRoomContainer = $("<div>");
                    curRoomContainer.addClass("lobby-overlay-room");
                    curRoomContainer.html(curRoom.name);

                    $(curRoomContainer).on(
                        "click",
                        curRoom,
                        this._onClickRoom.bind(this)
                    );

                    this.roomListContainer.append(curRoomContainer);
                }
            }
        }
    },

    renderRoom : {
        value : function (data) {
            if (data === undefined) {
                this.renderRoomLabel();
                this.renderPlayers();
            } else {
                this.renderRoomLabel(data.name);
                this.renderPlayers(data.players);
            }
        }
    },

    renderRoomLabel : {
        value : function (label) {
            if (typeof label !== "string" || label === "") {
                label = "No room selected";
            }

            label = "Current room: " + label;

            this.selectedRoomLabel.html(label);
        }
    },

    renderPlayers : {
        value : function (playerIds) {
            this.playerList.html("");

            if (playerIds !== undefined) {
                for (var i = 0; i < playerIds.length; i++) {
                    var curId = playerIds[i];
                    var curPlayer = Network.clients[curId];
                    console.log(curPlayer);
                    var playerContainer = $("<div>");
                    playerContainer.html(curPlayer.data.user);
                    this.playerList.append(playerContainer);
                }
            }
        }
    },

    _onClickRoom : {
        value : function (e) {
            var data = e.data;
            var room = {
                name : data.name,
                id   : data.id
            };

            $(this).trigger(LobbyOverlay.Event.ENTER_ROOM, room);
        }
    }
}));

Object.freeze(LobbyOverlay);

module.exports = LobbyOverlay;
},{"../network":8,"./Overlay":12}],12:[function(require,module,exports){
"use strict";

var Overlay = function () {
    this.domObject = $("<div>");
    this.domObject.addClass("canvas-overlay");
};

Overlay.prototype = Object.freeze(Object.create(Overlay.prototype, {

}));

module.exports = Overlay;
},{}],13:[function(require,module,exports){
"use strict";

var Overlay = require('./Overlay.js');
var LoadingOverlay = require('./LoadingOverlay.js');
var CreateRoomOverlay = require('./CreateRoomOverlay.js');
var LobbyOverlay = require('./LobbyOverlay.js');

module.exports = {
    Overlay : Overlay,
    LoadingOverlay : LoadingOverlay,
    CreateRoomOverlay : CreateRoomOverlay,
    LobbyOverlay : LobbyOverlay
};
},{"./CreateRoomOverlay.js":9,"./LoadingOverlay.js":10,"./LobbyOverlay.js":11,"./Overlay.js":12}],14:[function(require,module,exports){
"use strict";

var util = require('../util');
var Assets = util.Assets;
var Network = require('../network');
var entities = require('../entities');
var FullBock = entities.FullBlock;
var Player = entities.Player;
var NetworkScene = require('./NetworkScene');
var backgrounds = wfl.display.backgrounds;
var geom = wfl.geom;

var GameScene = function (canvas, roomId) {
    NetworkScene.call(this, canvas, roomId);

    var wallSize = 10;
    var blockSize = 128;
    var offset = -(wallSize * 0.5 - 1) * blockSize;

    // Line the top
    for (var i = 0; i < 9; i++) {
        var newBlock = new FullBock();
        newBlock.position.x = blockSize * i + offset;
        newBlock.position.y = offset;

        this.addGameObject(newBlock);
    }

    // Line the bottom
    for (var i = 0; i < 9; i++) {
        var newBlock = new FullBock();
        newBlock.position.x = blockSize * i + offset;
        newBlock.position.y = -offset;

        this.addGameObject(newBlock);
    }

    // Line the left
    for (var i = 1; i < 8; i++) {
        var newBlock = new FullBock();
        newBlock.position.x = offset;
        newBlock.position.y = blockSize * i + offset;

        this.addGameObject(newBlock);
    }

    // Line the right
    for (var i = 1; i < 8; i++) {
        var newBlock = new FullBock();
        newBlock.position.x = -offset;
        newBlock.position.y = blockSize * i + offset;

        this.addGameObject(newBlock);
    }
    
    this.bg = new backgrounds.ParallaxBackground(
        Assets.get(Assets.BG_TILE)
    );
    
    this.player = Network.localClient.gameObject;
    this.addGameObject(this.player, 2);
};
Object.defineProperties(GameScene, {
    FRICTION : {
        value : 0.925
    },

    MINIMAP : {
        value : Object.freeze({
            WIDTH      : 150,
            HEIGHT     : 100,
            SCALE      : 0.1,
            FILL_STYLE : "#192427"
        })
    }
});
GameScene.prototype = Object.freeze(Object.create(NetworkScene.prototype, {
    update : {
        value : function (dt) {
            var gameObjects = this.getGameObjects();
        
            for (var i = 0; i < gameObjects.length; i++) {
                var obj = gameObjects[i];
                obj.acceleration.multiply(GameScene.FRICTION);
                obj.velocity.multiply(GameScene.FRICTION);
            }
            
            NetworkScene.prototype.update.call(this, dt);
            
            this.handleInput();
        }
    },
    
    handleInput : {
        value : function () {
            var player       = this.player;
            var keyboard     = this.keyboard;
            var leftPressed  = keyboard.isPressed(keyboard.LEFT);
            var rightPressed = keyboard.isPressed(keyboard.RIGHT);
            var upPressed    = keyboard.isPressed(keyboard.UP);
            var downPressed  = keyboard.isPressed(keyboard.DOWN);

            // Left/ Right Key -- Player turns
            if (leftPressed || rightPressed) {
                var rotation = 0;

                if (leftPressed) {
                    rotation -= Player.TURN_SPEED;
                }

                if (rightPressed) {
                    rotation += Player.TURN_SPEED;
                }

                player.rotate(rotation);
            }

            // Up Key -- Player goes forward
            if (upPressed) {
                var movementForce = geom.Vec2.fromAngle(player.getRotation());
                movementForce.multiply(
                    Player.BOOST_ACCELERATION * player.mass
                );

                player.addForce(movementForce);
            }

            // Down Key -- Apply brakes to player
            if (downPressed) {
                player.velocity.multiply(Player.BRAKE_RATE);
            }
        }
    }
}));

module.exports = GameScene;
},{"../entities":4,"../network":8,"../util":21,"./NetworkScene":17}],15:[function(require,module,exports){
"use strict";

var Scene = wfl.display.Scene;
var overlays = require('../overlays');

var LoadingScene = function (canvas) {
    Scene.call(this, canvas);
    
    this.loadingOverlay = new overlays.LoadingOverlay();
    $(canvas).parent().append(this.loadingOverlay.domObject);
};
LoadingScene.prototype = Object.freeze(Object.create(Scene.prototype, {
    destroy : {
        value : function () {
            this.loadingOverlay.domObject.remove();
        }
    }
}));

module.exports = LoadingScene;
},{"../overlays":13}],16:[function(require,module,exports){
"use strict";

var Scene = wfl.display.Scene;
var overlays = require('../overlays');
var Network = require('../network');

var LoadingScene = function (canvas) {
    Scene.call(this, canvas);

    this.curRoomId = undefined;

    this.lobbyOverlay = new overlays.LobbyOverlay();
    this.createRoomOverlay = new overlays.CreateRoomOverlay();
    $(canvas).parent().append(this.lobbyOverlay.domObject);
    $(canvas).parent().append(this.createRoomOverlay.domObject);

    this.createRoomOverlay.domObject.hide();

    this.lobbyOverlay.playBtn.click(this._onPlayButtonClick.bind(this));
    this.lobbyOverlay.createRoomBtn.click(this._onCreateRoomButtonClick.bind(this));

    this.createRoomOverlay.cancelBtn.click(this._onCreateRoomCancel.bind(this));
    this.createRoomOverlay.createBtn.click(this._onCreateRoom.bind(this));

    $(this.lobbyOverlay).on(overlays.LobbyOverlay.Event.ENTER_ROOM, this._onEnterRoomAttempt.bind(this));

    $(Network).on(Network.Event.UPDATE_ROOMS, this._onUpdateRoomList.bind(this));
    $(Network).on(Network.Event.ENTER_ROOM_SUCCESS, this._onEnterRoomSuccess.bind(this));
    $(Network).on(Network.Event.ENTER_ROOM_FAIL, this._onEnterRoomFail.bind(this));

    this.roomUpdateInterval =
        setInterval(this.updateRoomList.bind(this), LoadingScene.ROOM_UPDATE_FREQUENCY);

    this.updateRoomList();
};

Object.defineProperties(LoadingScene, {
    ROOM_UPDATE_FREQUENCY : {
        value : 5000
    }
});

LoadingScene.prototype = Object.freeze(Object.create(Scene.prototype, {
    destroy : {
        value : function () {
            this.lobbyOverlay.domObject.remove();
            this.createRoomOverlay.domObject.remove();
            this.createRoomOverlay.inputField.off("keypress");
            clearInterval(this.roomUpdateInterval);
            $(Network).off(Network.Event.UPDATE_ROOMS);
        }
    },

    updateRoomList : {
        value : function () {
            Network.getRooms();
        }
    },

    _onPlayButtonClick : {
        value : function (e) {
            $(this).trigger("play-game", this.curRoomId);
        }
    },

    _onCreateRoomButtonClick : {
        value : function (e) {
            this.createRoomOverlay.inputField.off("keypress");

            this.createRoomOverlay.inputField.val("");
            this.createRoomOverlay.domObject.removeClass("fade-in");
            this.createRoomOverlay.domObject.show();
            this.createRoomOverlay.domObject.addClass("fade-in");
            this.createRoomOverlay.inputField.focus();

            this.createRoomOverlay.inputField.on("keypress", this._onCreateRoomKeyPress.bind(this));
        }
    },

    _onCreateRoomKeyPress : {
        value : function (e) {
            if (e.keyCode === 13) {
                this._onCreateRoom();
            }
        }
    },

    _onCreateRoomCancel : {
        value : function (e) {
            this.createRoomOverlay.domObject.hide();
        }
    },

    _onCreateRoom : {
        value : function (e) {
            this.createRoomOverlay.domObject.hide();
            var name = this.createRoomOverlay.inputField.val();
            Network.createRoom(name);
        }
    },

    _onUpdateRoomList : {
        value : function (e, data) {
            this.lobbyOverlay.showRooms(data);

            if (this.curRoomId !== undefined) {
                this.lobbyOverlay.renderRoom(data[this.curRoomId]);
            }
        }
    },

    _onEnterRoomAttempt : {
        value : function (e, data) {
            Network.enterRoom(data);
        }
    },

    _onEnterRoomSuccess : {
        value : function (e, data) {
            this.curRoomId = data.id;
            this.lobbyOverlay.renderRoom(data);
        }
    },

    _onEnterRoomFail : {
        value : function (e, data) {
            alert(data.msg);
            this.curRoomId = undefined;
            this.lobbyOverlay.renderRoom(undefined);
        }
    }
}));

Object.freeze(LoadingScene);

module.exports = LoadingScene;
},{"../network":8,"../overlays":13}],17:[function(require,module,exports){
"use strict";

var Network = require('../network');
var Scene = wfl.display.Scene;

var NetworkScene = function (canvas, roomId) {
    Scene.call(this, canvas);
    
    $(Network).on(
        Network.Event.ADD_CLIENT,
        this.onAddClient.bind(this)
    );
    $(Network).on(
        Network.Event.REMOVE_CLIENT,
        this.onRemoveClient.bind(this)
    );

    // Add other clients that are already connected
    var room = Network.rooms[roomId];
    var players = room.players;

    for (var i = 0; i < players.length; i++) {
        var id = players[i];
        var client = Network.clients[id];

        if (client !== Network.localClient) {
            this.addGameObject(client.gameObject, 1);
        }
    }
};
NetworkScene.prototype = Object.freeze(Object.create(Scene.prototype, {
    onAddClient : {
        value : function (e, client) {
            if (client) {
                this.addGameObject(client.gameObject, 1);
            }
        }
    },

    onRemoveClient : {
        value : function (e, client) {
            if (client) {
                this.removeGameObject(client.gameObject, 1);
            }
        }
    }
}));

module.exports = NetworkScene;
},{"../network":8}],18:[function(require,module,exports){
"use strict";

var LoadingScene = require('./LoadingScene.js');
var LobbyScene = require('./LobbyScene.js');
var NetworkScene = require('./NetworkScene.js');
var GameScene = require('./GameScene.js');

module.exports = {
    LoadingScene : LoadingScene,
    LobbyScene   : LobbyScene,
    NetworkScene : NetworkScene,
    GameScene    : GameScene
};
},{"./GameScene.js":14,"./LoadingScene.js":15,"./LobbyScene.js":16,"./NetworkScene.js":17}],19:[function(require,module,exports){
"use strict";

module.exports = {
    BG_TILE    : "./assets/img/BG-tile1.png",
    BLOCK_FULL : "./assets/img/BlockFull.png",
    PLAYER     : "./assets/img/Ship.png",
    CLIENT     : "./assets/img/OtherShip.png",
    
    // Preloader replaces getter with appropriate definition
    get        : function (path) { }
};
},{}],20:[function(require,module,exports){
"use strict";

var Assets = require('./Assets.js');

var Preloader = function (onComplete) {
    // Set up preloader
	this.queue = new createjs.LoadQueue(false);

    // Replace definition of Asset getter to use the data from the queue
    Assets.get = this.queue.getResult.bind(this.queue);

    // Once everything has been preloaded, start the application
    if (onComplete) {
        this.queue.on("complete", onComplete);
    }

    var needToLoad = [];

    // Prepare to load images
    for (var img in Assets) {
        var imgObj = {
            id : img,
            src : Assets[img]
        }

        needToLoad.push(imgObj);
    }

	this.queue.loadManifest(needToLoad);
};

module.exports = Preloader;
},{"./Assets.js":19}],21:[function(require,module,exports){
"use strict";

var Assets = require('./Assets.js');
var Preloader = require('./Preloader.js');

module.exports = {
    Assets : Assets,
    Preloader : Preloader
};
},{"./Assets.js":19,"./Preloader.js":20}]},{},[5])(5)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvZ2FtZS9zcmMvZW50aXRpZXMvQ2xpZW50UGxheWVyLmpzIiwiY2xpZW50L2dhbWUvc3JjL2VudGl0aWVzL0Z1bGxCbG9jay5qcyIsImNsaWVudC9nYW1lL3NyYy9lbnRpdGllcy9QbGF5ZXIuanMiLCJjbGllbnQvZ2FtZS9zcmMvZW50aXRpZXMvaW5kZXguanMiLCJjbGllbnQvZ2FtZS9zcmMvaW5kZXguanMiLCJjbGllbnQvZ2FtZS9zcmMvbmV0d29yay9DbGllbnQuanMiLCJjbGllbnQvZ2FtZS9zcmMvbmV0d29yay9Mb2NhbENsaWVudC5qcyIsImNsaWVudC9nYW1lL3NyYy9uZXR3b3JrL2luZGV4LmpzIiwiY2xpZW50L2dhbWUvc3JjL292ZXJsYXlzL0NyZWF0ZVJvb21PdmVybGF5LmpzIiwiY2xpZW50L2dhbWUvc3JjL292ZXJsYXlzL0xvYWRpbmdPdmVybGF5LmpzIiwiY2xpZW50L2dhbWUvc3JjL292ZXJsYXlzL0xvYmJ5T3ZlcmxheS5qcyIsImNsaWVudC9nYW1lL3NyYy9vdmVybGF5cy9PdmVybGF5LmpzIiwiY2xpZW50L2dhbWUvc3JjL292ZXJsYXlzL2luZGV4LmpzIiwiY2xpZW50L2dhbWUvc3JjL3NjZW5lcy9HYW1lU2NlbmUuanMiLCJjbGllbnQvZ2FtZS9zcmMvc2NlbmVzL0xvYWRpbmdTY2VuZS5qcyIsImNsaWVudC9nYW1lL3NyYy9zY2VuZXMvTG9iYnlTY2VuZS5qcyIsImNsaWVudC9nYW1lL3NyYy9zY2VuZXMvTmV0d29ya1NjZW5lLmpzIiwiY2xpZW50L2dhbWUvc3JjL3NjZW5lcy9pbmRleC5qcyIsImNsaWVudC9nYW1lL3NyYy91dGlsL0Fzc2V0cy5qcyIsImNsaWVudC9nYW1lL3NyYy91dGlsL1ByZWxvYWRlci5qcyIsImNsaWVudC9nYW1lL3NyYy91dGlsL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25KQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcclxudmFyIEFzc2V0cyA9IHV0aWwuQXNzZXRzO1xyXG52YXIgUGxheWVyID0gcmVxdWlyZSgnLi9QbGF5ZXInKTtcclxudmFyIEdhbWVPYmplY3QgPSB3ZmwuY29yZS5lbnRpdGllcy5HYW1lT2JqZWN0O1xyXG52YXIgTGl2aW5nT2JqZWN0ID0gd2ZsLmNvcmUuZW50aXRpZXMuTGl2aW5nT2JqZWN0O1xyXG52YXIgZ2VvbSA9IHdmbC5nZW9tO1xyXG5cclxudmFyIENsaWVudFBsYXllciA9IGZ1bmN0aW9uICgpIHtcclxuICAgIExpdmluZ09iamVjdC5jYWxsKHRoaXMpO1xyXG5cclxuICAgIC8vIENyZWF0ZSBkZWZhdWx0IHN0YXRlXHJcbiAgICB0aGlzLmRlZmF1bHRHcmFwaGljID0gQXNzZXRzLmdldChBc3NldHMuQ0xJRU5UKTtcclxuXHJcbiAgICB2YXIgdyA9IHRoaXMuZGVmYXVsdEdyYXBoaWMud2lkdGg7XHJcbiAgICB2YXIgaCA9IHRoaXMuZGVmYXVsdEdyYXBoaWMuaGVpZ2h0O1xyXG4gICAgdmFyIHZlcnRzID0gW1xyXG4gICAgICAgIG5ldyBnZW9tLlZlYzIoLXcgKiAwLjUsIC1oICogMC41KSxcclxuICAgICAgICBuZXcgZ2VvbS5WZWMyKHcgKiAwLjUsIDApLFxyXG4gICAgICAgIG5ldyBnZW9tLlZlYzIoLXcgKiAwLjUsIGggKiAwLjUpXHJcbiAgICBdO1xyXG4gICAgdmFyIGZyYW1lT2JqID0gdGhpcy5jcmVhdGVGcmFtZSh0aGlzLmRlZmF1bHRHcmFwaGljLCAxLCBmYWxzZSk7XHJcbiAgICBmcmFtZU9iai52ZXJ0aWNlcyA9IHZlcnRzO1xyXG5cclxuICAgIHRoaXMuZGVmYXVsdFN0YXRlID0gdGhpcy5jcmVhdGVTdGF0ZSgpO1xyXG4gICAgdGhpcy5kZWZhdWx0U3RhdGUuYWRkRnJhbWUoZnJhbWVPYmopO1xyXG4gICAgdGhpcy5hZGRTdGF0ZShHYW1lT2JqZWN0LlNUQVRFLkRFRkFVTFQsIHRoaXMuZGVmYXVsdFN0YXRlKTtcclxuXHJcbiAgICB0aGlzLnJvdGF0ZSgtTWF0aC5QSSAqIDAuNSk7XHJcbn07XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKENsaWVudFBsYXllciwge1xyXG4gICAgQVJSSVZBTF9TTE9XSU5HX1JBRElVUyA6IHtcclxuICAgICAgICB2YWx1ZSA6IDIwMFxyXG4gICAgfSxcclxuXHJcbiAgICBNSU5fQVJSSVZBTF9SQURJVVMgOiB7XHJcbiAgICAgICAgdmFsdWUgOiA4XHJcbiAgICB9LFxyXG5cclxuICAgIE1JTklNQVBfRklMTF9TVFlMRSA6IHtcclxuICAgICAgICB2YWx1ZSA6IFwiIzA2YzgzM1wiXHJcbiAgICB9XHJcbn0pO1xyXG5DbGllbnRQbGF5ZXIucHJvdG90eXBlID0gT2JqZWN0LmZyZWV6ZShPYmplY3QuY3JlYXRlKExpdmluZ09iamVjdC5wcm90b3R5cGUsIHtcclxuICAgIGRyYXdPbk1pbmltYXAgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoY3R4KSB7XHJcbiAgICAgICAgICAgIHZhciB3ID0gdGhpcy5nZXRXaWR0aCgpO1xyXG4gICAgICAgICAgICB2YXIgaCA9IHRoaXMuZ2V0SGVpZ2h0KCk7XHJcbiAgICAgICAgICAgIHZhciBvZmZzZXRYID0gTWF0aC5yb3VuZCgtdyAqIDAuNSk7XHJcbiAgICAgICAgICAgIHZhciBvZmZzZXRZID0gTWF0aC5yb3VuZCgtaCAqIDAuNSk7XHJcbiAgICAgICAgICAgIHZhciBkaXNwbGF5V2lkdGggPSBNYXRoLnJvdW5kKHcpO1xyXG4gICAgICAgICAgICB2YXIgZGlzcGxheUhlaWdodCA9IE1hdGgucm91bmQoaCk7XHJcblxyXG4gICAgICAgICAgICBjdHguc2F2ZSgpO1xyXG5cclxuICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9IENsaWVudFBsYXllci5NSU5JTUFQX0ZJTExfU1RZTEU7XHJcbiAgICAgICAgICAgIGN0eC5maWxsUmVjdChvZmZzZXRYLCBvZmZzZXRZLCBkaXNwbGF5V2lkdGgsIGRpc3BsYXlIZWlnaHQpO1xyXG5cclxuICAgICAgICAgICAgY3R4LnJlc3RvcmUoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKTtcclxuT2JqZWN0LmZyZWV6ZShDbGllbnRQbGF5ZXIpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDbGllbnRQbGF5ZXI7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcclxudmFyIEFzc2V0cyA9IHV0aWwuQXNzZXRzO1xyXG52YXIgR2FtZU9iamVjdCA9IHdmbC5jb3JlLmVudGl0aWVzLkdhbWVPYmplY3Q7XHJcbnZhciBQaHlzaWNzT2JqZWN0ID0gd2ZsLmNvcmUuZW50aXRpZXMuUGh5c2ljc09iamVjdDtcclxuXHJcbi8qKlxyXG4gKiBBIGZ1bGwtc2l6ZWQsIHF1YWRyaWxhdGVyYWwgYmxvY2tcclxuICovXHJcbnZhciBGdWxsQmxvY2sgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICBQaHlzaWNzT2JqZWN0LmNhbGwodGhpcyk7XHJcblxyXG4gICAgdGhpcy5pZCA9IEZ1bGxCbG9jay5pZDtcclxuXHJcbiAgICAvLyBDcmVhdGUgZGVmYXVsdCBzdGF0ZVxyXG4gICAgdGhpcy5kZWZhdWx0R3JhcGhpYyA9IEFzc2V0cy5nZXQoQXNzZXRzLkJMT0NLX0ZVTEwpO1xyXG4gICAgdGhpcy5kZWZhdWx0U3RhdGUgPSB0aGlzLmNyZWF0ZVN0YXRlKCk7XHJcbiAgICB0aGlzLmRlZmF1bHRTdGF0ZS5hZGRGcmFtZShcclxuICAgICAgICB0aGlzLmNyZWF0ZUZyYW1lKHRoaXMuZGVmYXVsdEdyYXBoaWMpXHJcbiAgICApO1xyXG4gICAgdGhpcy5hZGRTdGF0ZShHYW1lT2JqZWN0LlNUQVRFLkRFRkFVTFQsIHRoaXMuZGVmYXVsdFN0YXRlKTtcclxuXHJcbiAgICB0aGlzLnNvbGlkID0gdHJ1ZTtcclxuICAgIHRoaXMuZml4ZWQgPSB0cnVlO1xyXG4gICAgdGhpcy5yb3RhdGUoLU1hdGguUEkgKiAwLjUpO1xyXG59O1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyhGdWxsQmxvY2ssIHtcclxuICAgIG5hbWUgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBcIkZ1bGxCbG9ja1wiXHJcbiAgICB9LFxyXG5cclxuICAgIGlkIDoge1xyXG4gICAgICAgIHZhbHVlIDogMFxyXG4gICAgfVxyXG59KTtcclxuRnVsbEJsb2NrLnByb3RvdHlwZSA9IE9iamVjdC5mcmVlemUoT2JqZWN0LmNyZWF0ZShQaHlzaWNzT2JqZWN0LnByb3RvdHlwZSwge1xyXG4gICAgZHJhd09uTWluaW1hcCA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChjdHgpIHtcclxuICAgICAgICAgICAgdmFyIHcgPSB0aGlzLmdldFdpZHRoKCk7XHJcbiAgICAgICAgICAgIHZhciBoID0gdGhpcy5nZXRIZWlnaHQoKTtcclxuICAgICAgICAgICAgdmFyIG9mZnNldFggPSBNYXRoLnJvdW5kKC13ICogMC41KTtcclxuICAgICAgICAgICAgdmFyIG9mZnNldFkgPSBNYXRoLnJvdW5kKC1oICogMC41KTtcclxuICAgICAgICAgICAgdmFyIGRpc3BsYXlXaWR0aCA9IE1hdGgucm91bmQodyk7XHJcbiAgICAgICAgICAgIHZhciBkaXNwbGF5SGVpZ2h0ID0gTWF0aC5yb3VuZChoKTtcclxuXHJcbiAgICAgICAgICAgIGN0eC5zYXZlKCk7XHJcblxyXG4gICAgICAgICAgICBjdHgucm90YXRlKHRoaXMuZ2V0Um90YXRpb24oKSk7XHJcblxyXG4gICAgICAgICAgICAvKmN0eC5maWxsU3R5bGUgPVxyXG4gICAgICAgICAgICAgICAgYXBwLmdhbWVvYmplY3QuUGh5c2ljc09iamVjdC5NSU5JTUFQX0ZJTExfU1RZTEU7XHJcbiAgICAgICAgICAgIGN0eC5zdHJva2VTdHlsZSA9XHJcbiAgICAgICAgICAgICAgICBhcHAuZ2FtZW9iamVjdC5QaHlzaWNzT2JqZWN0Lk1JTklNQVBfU1RST0tFX1NUWUxFOyovXHJcblxyXG4gICAgICAgICAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgICAgIGN0eC5yZWN0KG9mZnNldFgsIG9mZnNldFksIGRpc3BsYXlXaWR0aCwgZGlzcGxheUhlaWdodCk7XHJcbiAgICAgICAgICAgIGN0eC5maWxsKCk7XHJcbiAgICAgICAgICAgIGN0eC5zdHJva2UoKTtcclxuXHJcbiAgICAgICAgICAgIGN0eC5yZXN0b3JlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSk7XHJcbk9iamVjdC5mcmVlemUoRnVsbEJsb2NrKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRnVsbEJsb2NrOyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIHV0aWwgPSByZXF1aXJlKCcuLi91dGlsJyk7XHJcbnZhciBBc3NldHMgPSB1dGlsLkFzc2V0cztcclxudmFyIE5ldHdvcmsgPSByZXF1aXJlKCcuLi9uZXR3b3JrJyk7XHJcbnZhciBHYW1lT2JqZWN0ID0gd2ZsLmNvcmUuZW50aXRpZXMuR2FtZU9iamVjdDtcclxudmFyIExpdmluZ09iamVjdCA9IHdmbC5jb3JlLmVudGl0aWVzLkxpdmluZ09iamVjdDtcclxudmFyIGdlb20gPSB3ZmwuZ2VvbTtcclxuXHJcbnZhciBQbGF5ZXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICBMaXZpbmdPYmplY3QuY2FsbCh0aGlzKTtcclxuXHJcbiAgICB0aGlzLnNvbGlkID0gdHJ1ZTtcclxuXHJcbiAgICAvLyBDcmVhdGUgZGVmYXVsdCBzdGF0ZVxyXG4gICAgdGhpcy5kZWZhdWx0R3JhcGhpYyA9IEFzc2V0cy5nZXQoQXNzZXRzLlBMQVlFUik7XHJcblxyXG4gICAgdmFyIHcgPSB0aGlzLmRlZmF1bHRHcmFwaGljLndpZHRoO1xyXG4gICAgdmFyIGggPSB0aGlzLmRlZmF1bHRHcmFwaGljLmhlaWdodDtcclxuICAgIHZhciB2ZXJ0cyA9IFtcclxuICAgICAgICBuZXcgZ2VvbS5WZWMyKC13ICogMC41LCAtaCAqIDAuNSksXHJcbiAgICAgICAgbmV3IGdlb20uVmVjMih3ICogMC41LCAwKSxcclxuICAgICAgICBuZXcgZ2VvbS5WZWMyKC13ICogMC41LCBoICogMC41KVxyXG4gICAgXTtcclxuICAgIHZhciBmcmFtZU9iaiA9IHRoaXMuY3JlYXRlRnJhbWUodGhpcy5kZWZhdWx0R3JhcGhpYywgMSwgZmFsc2UpO1xyXG4gICAgZnJhbWVPYmoudmVydGljZXMgPSB2ZXJ0cztcclxuXHJcbiAgICB0aGlzLmRlZmF1bHRTdGF0ZSA9IHRoaXMuY3JlYXRlU3RhdGUoKTtcclxuICAgIHRoaXMuZGVmYXVsdFN0YXRlLmFkZEZyYW1lKGZyYW1lT2JqKTtcclxuICAgIHRoaXMuYWRkU3RhdGUoR2FtZU9iamVjdC5TVEFURS5ERUZBVUxULCB0aGlzLmRlZmF1bHRTdGF0ZSk7XHJcblxyXG4gICAgdGhpcy5sYXN0U2VudFBvc2l0aW9uID0gbmV3IGdlb20uVmVjMigtSW5maW5pdHksIC1JbmZpbml0eSk7XHJcblxyXG4gICAgdGhpcy5yb3RhdGUoLU1hdGguUEkgKiAwLjUpO1xyXG59O1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyhQbGF5ZXIsIHtcclxuICAgIFRVUk5fU1BFRUQgOiB7XHJcbiAgICAgICAgdmFsdWUgOiAwLjA1XHJcbiAgICB9LFxyXG5cclxuICAgIEJSQUtFX1JBVEUgOiB7XHJcbiAgICAgICAgdmFsdWUgOiAwLjk1XHJcbiAgICB9LFxyXG5cclxuICAgIEJPT1NUX0FDQ0VMRVJBVElPTiA6IHtcclxuICAgICAgICB2YWx1ZSA6IDAuMDAwMlxyXG4gICAgfSxcclxuXHJcbiAgICBQT1NJVElPTl9VUERBVEVfRElTVEFOQ0UgOiB7XHJcbiAgICAgICAgdmFsdWUgOiAwLjVcclxuICAgIH0sXHJcblxyXG4gICAgTUlOSU1BUF9GSUxMX1NUWUxFIDoge1xyXG4gICAgICAgIHZhbHVlIDogXCIjODZjOGQzXCJcclxuICAgIH1cclxufSk7XHJcblBsYXllci5wcm90b3R5cGUgPSBPYmplY3QuZnJlZXplKE9iamVjdC5jcmVhdGUoTGl2aW5nT2JqZWN0LnByb3RvdHlwZSwge1xyXG4gICAgdXBkYXRlIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGR0KSB7XHJcbiAgICAgICAgICAgIExpdmluZ09iamVjdC5wcm90b3R5cGUudXBkYXRlLmNhbGwodGhpcywgZHQpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy8gSWYgdGhlIHBsYXllciBpcyBjb25uZWN0ZWQgdG8gdGhlIG5ldHdvcmssIHNlbmQgb3V0IHVwZGF0ZXMgdG9cclxuICAgICAgICAgICAgLy8gb3RoZXIgcGxheWVycyB3aGVuIG5lY2Vzc2FyeVxyXG4gICAgICAgICAgICBpZiAoTmV0d29yay5jb25uZWN0ZWQpIHtcclxuICAgICAgICAgICAgICAgIE5ldHdvcmsuc29ja2V0LmVtaXQoJ3VwZGF0ZU90aGVyJywge1xyXG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uICAgICA6IHRoaXMucG9zaXRpb24sXHJcbiAgICAgICAgICAgICAgICAgICAgdmVsb2NpdHkgICAgIDogdGhpcy52ZWxvY2l0eSxcclxuICAgICAgICAgICAgICAgICAgICBhY2NlbGVyYXRpb24gOiB0aGlzLmFjY2VsZXJhdGlvbixcclxuICAgICAgICAgICAgICAgICAgICByb3RhdGlvbiAgICAgOiB0aGlzLmdldFJvdGF0aW9uKClcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBkcmF3T25NaW5pbWFwIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGN0eCkge1xyXG4gICAgICAgICAgICB2YXIgdyA9IHRoaXMuZ2V0V2lkdGgoKTtcclxuICAgICAgICAgICAgdmFyIGggPSB0aGlzLmdldEhlaWdodCgpO1xyXG4gICAgICAgICAgICB2YXIgb2Zmc2V0WCA9IE1hdGgucm91bmQoLXcgKiAwLjUpO1xyXG4gICAgICAgICAgICB2YXIgb2Zmc2V0WSA9IE1hdGgucm91bmQoLWggKiAwLjUpO1xyXG4gICAgICAgICAgICB2YXIgZGlzcGxheVdpZHRoID0gTWF0aC5yb3VuZCh3KTtcclxuICAgICAgICAgICAgdmFyIGRpc3BsYXlIZWlnaHQgPSBNYXRoLnJvdW5kKGgpO1xyXG5cclxuICAgICAgICAgICAgY3R4LnNhdmUoKTtcclxuXHJcbiAgICAgICAgICAgIGN0eC5maWxsU3R5bGUgPSBQbGF5ZXIuTUlOSU1BUF9GSUxMX1NUWUxFO1xyXG4gICAgICAgICAgICBjdHguZmlsbFJlY3Qob2Zmc2V0WCwgb2Zmc2V0WSwgZGlzcGxheVdpZHRoLCBkaXNwbGF5SGVpZ2h0KTtcclxuXHJcbiAgICAgICAgICAgIGN0eC5yZXN0b3JlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSk7XHJcbk9iamVjdC5mcmVlemUoUGxheWVyKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUGxheWVyOyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIEZ1bGxCbG9jayA9IHJlcXVpcmUoJy4vRnVsbEJsb2NrLmpzJyk7XHJcbnZhciBQbGF5ZXIgPSByZXF1aXJlKCcuL1BsYXllci5qcycpO1xyXG52YXIgQ2xpZW50UGxheWVyID0gcmVxdWlyZSgnLi9DbGllbnRQbGF5ZXIuanMnKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgRnVsbEJsb2NrIDogRnVsbEJsb2NrLFxyXG4gICAgUGxheWVyOiBQbGF5ZXIsXHJcbiAgICBDbGllbnRQbGF5ZXIgOiBDbGllbnRQbGF5ZXJcclxufTsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBOZXR3b3JrID0gcmVxdWlyZSgnLi9uZXR3b3JrJyk7XHJcbnZhciB1dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XHJcbnZhciBBc3NldHMgPSB1dGlsLkFzc2V0cztcclxudmFyIHNjZW5lcyA9IHJlcXVpcmUoJy4vc2NlbmVzJyk7XHJcbnZhciBvdmVybGF5cyA9IHJlcXVpcmUoJy4vb3ZlcmxheXMnKTtcclxuXHJcbi8vIENyZWF0ZSBnYW1lXHJcbnZhciBjYW52YXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2dhbWUtY2FudmFzXCIpO1xyXG52YXIgZ2FtZSAgID0gd2ZsLmNyZWF0ZShjYW52YXMpO1xyXG5cclxudmFyIGxvYWRpbmdTY2VuZSA9IG5ldyBzY2VuZXMuTG9hZGluZ1NjZW5lKGNhbnZhcyk7XHJcbmdhbWUuc2V0U2NlbmUobG9hZGluZ1NjZW5lKTtcclxuXHJcbnZhciBvbkxvYWQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAkKE5ldHdvcmspLm9uKFxyXG4gICAgICAgIE5ldHdvcmsuRXZlbnQuQ09OTkVDVCxcclxuICAgICAgICBvbk5ldHdvcmtDb25uZWN0XHJcbiAgICApO1xyXG5cclxuICAgIE5ldHdvcmsuaW5pdCgpO1xyXG59O1xyXG5cclxudmFyIG9uTmV0d29ya0Nvbm5lY3QgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgbG9iYnlTY2VuZSA9IG5ldyBzY2VuZXMuTG9iYnlTY2VuZShjYW52YXMpO1xyXG4gICAgZ2FtZS5zZXRTY2VuZShsb2JieVNjZW5lKTtcclxuICAgIFxyXG4gICAgJChsb2JieVNjZW5lKS5vbihcInBsYXktZ2FtZVwiLCBvblBsYXlHYW1lKTtcclxufTtcclxuXHJcbnZhciBvblBsYXlHYW1lID0gZnVuY3Rpb24gKGUsIHJvb21JZCkge1xyXG4gICAgJChnYW1lLmdldFNjZW5lKCkpLm9mZigpO1xyXG4gICAgXHJcbiAgICB2YXIgZ2FtZVNjZW5lID0gbmV3IHNjZW5lcy5HYW1lU2NlbmUoY2FudmFzLCByb29tSWQpO1xyXG4gICAgZ2FtZS5zZXRTY2VuZShnYW1lU2NlbmUpO1xyXG59O1xyXG5cclxudmFyIFByZWxvYWRlciA9IG5ldyB1dGlsLlByZWxvYWRlcihvbkxvYWQuYmluZCh0aGlzKSk7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgZW50aXRpZXMgPSByZXF1aXJlKCcuLi9lbnRpdGllcycpO1xyXG5cclxudmFyIENsaWVudCA9IGZ1bmN0aW9uIChpZCwgZGF0YSkge1xyXG4gICAgdGhpcy5pZCA9IGlkO1xyXG4gICAgdGhpcy5kYXRhID0gZGF0YTtcclxuICAgIHRoaXMuZ2FtZU9iamVjdCA9IG5ldyBlbnRpdGllcy5DbGllbnRQbGF5ZXIoKTtcclxufTtcclxuT2JqZWN0LmZyZWV6ZShDbGllbnQpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDbGllbnQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgZW50aXRpZXMgPSByZXF1aXJlKCcuLi9lbnRpdGllcycpO1xyXG5cclxudmFyIExvY2FsQ2xpZW50ID0gZnVuY3Rpb24gKGlkLCBkYXRhKSB7XHJcbiAgICB0aGlzLmlkID0gaWQ7XHJcbiAgICB0aGlzLmRhdGEgPSBkYXRhO1xyXG4gICAgdGhpcy5nYW1lT2JqZWN0ID0gbmV3IGVudGl0aWVzLlBsYXllcigpO1xyXG59O1xyXG5PYmplY3QuZnJlZXplKExvY2FsQ2xpZW50KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTG9jYWxDbGllbnQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgTmV0d29yayA9IHtcclxuICAgIHNvY2tldCAgICAgIDogdW5kZWZpbmVkLFxyXG4gICAgbG9jYWxDbGllbnQgOiB7fSxcclxuICAgIGNsaWVudHMgICAgIDoge30sXHJcbiAgICByb29tcyAgICAgICA6IHt9LFxyXG4gICAgY29ubmVjdGVkICAgOiBmYWxzZSxcclxuICAgIEV2ZW50ICAgICAgIDoge1xyXG4gICAgICAgIENPTk5FQ1QgICAgICAgICAgICA6IFwiY29ubmVjdFwiLFxyXG4gICAgICAgIFJFTU9WRV9DTElFTlQgICAgICA6IFwicmVtb3ZlQ2xpZW50XCIsXHJcbiAgICAgICAgQUREX0NMSUVOVCAgICAgICAgIDogXCJhZGRDbGllbnRcIixcclxuICAgICAgICBVUERBVEVfUk9PTVMgICAgICAgOiBcInVwZGF0ZVJvb21zXCIsXHJcbiAgICAgICAgRU5URVJfUk9PTV9TVUNDRVNTIDogXCJlbnRlclJvb21TdWNjZXNzXCIsXHJcbiAgICAgICAgRU5URVJfUk9PTV9GQUlMICAgIDogXCJlbnRlclJvb21GYWlsXCJcclxuICAgIH0sXHJcblxyXG4gICAgaW5pdCA6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLnNvY2tldCA9IGlvLmNvbm5lY3QoKTtcclxuXHJcbiAgICAgICAgdGhpcy5zb2NrZXQub24oJ2NvbmZpcm0nLCB0aGlzLl9vbkNvbmZpcm1DbGllbnQuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgdGhpcy5zb2NrZXQub24oJ2FkZE90aGVyJywgdGhpcy5fb25BZGRPdGhlckNsaWVudC5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLnNvY2tldC5vbigncmVtb3ZlT3RoZXInLCB0aGlzLl9vblJlbW92ZU90aGVyQ2xpZW50LmJpbmQodGhpcykpO1xyXG4gICAgICAgIHRoaXMuc29ja2V0Lm9uKCdsb2FkUHJldmlvdXMnLCB0aGlzLl9vbkxvYWRQcmV2aW91c0NsaWVudHMuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgdGhpcy5zb2NrZXQub24oJ3VwZGF0ZU90aGVyJywgdGhpcy5fb25VcGRhdGVDbGllbnQuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgdGhpcy5zb2NrZXQub24oJ3VwZGF0ZVJvb21zJywgdGhpcy5fb25VcGRhdGVSb29tcy5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLnNvY2tldC5vbignZW50ZXJSb29tU3VjY2VzcycsIHRoaXMuX29uRW50ZXJSb29tU3VjY2Vzcy5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLnNvY2tldC5vbignZW50ZXJSb29tRmFpbCcsIHRoaXMuX29uRW50ZXJSb29tRmFpbC5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAgICAgdGhpcy5zb2NrZXQuZW1pdCgnaW5pdCcsIHtcclxuICAgICAgICAgICAgdXNlciA6ICQoXCIjdXNlck5hbWVcIikuaHRtbCgpXHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG5cclxuICAgIGdldFJvb21zIDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuc29ja2V0LmVtaXQoJ3VwZGF0ZVJvb21zJyk7XHJcbiAgICB9LFxyXG5cclxuICAgIGNyZWF0ZVJvb20gOiBmdW5jdGlvbiAobmFtZSkge1xyXG4gICAgICAgIHZhciByb29tRGF0YSA9IHtcclxuICAgICAgICAgICAgbmFtZSAgOiBuYW1lLFxyXG4gICAgICAgICAgICBlbnRlciA6IHRydWVcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLnNvY2tldC5lbWl0KCdjcmVhdGVSb29tJywgcm9vbURhdGEpO1xyXG4gICAgfSxcclxuXHJcbiAgICBlbnRlclJvb20gOiBmdW5jdGlvbiAocm9vbSkge1xyXG4gICAgICAgIHRoaXMuc29ja2V0LmVtaXQoJ2VudGVyUm9vbScsIHJvb20uaWQpO1xyXG4gICAgfSxcclxuXHJcbiAgICBsZWF2ZVJvb20gOiBmdW5jdGlvbiAocm9vbSkge1xyXG4gICAgICAgIHRoaXMuc29ja2V0LmVtaXQoJ2xlYXZlUm9vbScsIHJvb20uaWQpO1xyXG4gICAgfSxcclxuXHJcbiAgICBfb25Db25maXJtQ2xpZW50IDogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICB2YXIgaWQgPSBkYXRhLmlkO1xyXG4gICAgICAgIHRoaXMubG9jYWxDbGllbnQgPSBuZXcgTG9jYWxDbGllbnQoaWQsIGRhdGEpO1xyXG4gICAgICAgIHRoaXMuY2xpZW50c1tpZF0gPSB0aGlzLmxvY2FsQ2xpZW50O1xyXG5cclxuICAgICAgICB0aGlzLl9vblVwZGF0ZUNsaWVudChkYXRhKTtcclxuXHJcbiAgICAgICAgdGhpcy5jb25uZWN0ZWQgPSB0cnVlO1xyXG5cclxuICAgICAgICAkKHRoaXMpLnRyaWdnZXIoXHJcbiAgICAgICAgICAgIHRoaXMuRXZlbnQuQ09OTkVDVFxyXG4gICAgICAgICk7XHJcbiAgICB9LFxyXG5cclxuICAgIF9vbkFkZE90aGVyQ2xpZW50IDogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICB2YXIgaWQgPSBkYXRhLmlkO1xyXG4gICAgICAgIHZhciBuZXdDbGllbnQgPSBuZXcgQ2xpZW50KGlkLCBkYXRhKTtcclxuXHJcbiAgICAgICAgdGhpcy5jbGllbnRzW2RhdGEuaWRdID0gbmV3Q2xpZW50O1xyXG5cclxuICAgICAgICB0aGlzLl9vblVwZGF0ZUNsaWVudChkYXRhKTtcclxuXHJcbiAgICAgICAgJCh0aGlzKS50cmlnZ2VyKFxyXG4gICAgICAgICAgICB0aGlzLkV2ZW50LkFERF9DTElFTlQsXHJcbiAgICAgICAgICAgIHRoaXMuY2xpZW50c1tkYXRhLmlkXVxyXG4gICAgICAgICk7XHJcbiAgICB9LFxyXG5cclxuICAgIF9vblJlbW92ZU90aGVyQ2xpZW50IDogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAkKHRoaXMpLnRyaWdnZXIoXHJcbiAgICAgICAgICAgIHRoaXMuRXZlbnQuUkVNT1ZFX0NMSUVOVCxcclxuICAgICAgICAgICAgdGhpcy5jbGllbnRzW2RhdGEuaWRdXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgdGhpcy5jbGllbnRzW2RhdGEuaWRdID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIGRlbGV0ZSB0aGlzLmNsaWVudHNbZGF0YS5pZF07XHJcbiAgICB9LFxyXG5cclxuICAgIF9vbkxvYWRQcmV2aW91c0NsaWVudHMgOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMoZGF0YSk7XHJcblxyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB2YXIgaWQgPSBwYXJzZUludChrZXlzW2ldKTtcclxuICAgICAgICAgICAgdmFyIHVzZXJEYXRhID0gZGF0YVtpZF07XHJcblxyXG4gICAgICAgICAgICB0aGlzLl9vbkFkZE90aGVyQ2xpZW50KHVzZXJEYXRhKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIF9vblVwZGF0ZUNsaWVudCA6IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgdmFyIGlkID0gZGF0YS5pZDtcclxuICAgICAgICB2YXIgY2xpZW50ID0gdGhpcy5jbGllbnRzW2lkXTtcclxuXHJcbiAgICAgICAgY2xpZW50LmRhdGEgPSBkYXRhO1xyXG4gICAgICAgIGNsaWVudC5nYW1lT2JqZWN0LnBvc2l0aW9uLnggPSBkYXRhLnBvc2l0aW9uLng7XHJcbiAgICAgICAgY2xpZW50LmdhbWVPYmplY3QucG9zaXRpb24ueSA9IGRhdGEucG9zaXRpb24ueTtcclxuICAgICAgICBjbGllbnQuZ2FtZU9iamVjdC52ZWxvY2l0eS54ID0gZGF0YS52ZWxvY2l0eS54O1xyXG4gICAgICAgIGNsaWVudC5nYW1lT2JqZWN0LnZlbG9jaXR5LnkgPSBkYXRhLnZlbG9jaXR5Lnk7XHJcbiAgICAgICAgY2xpZW50LmdhbWVPYmplY3QuYWNjZWxlcmF0aW9uLnggPSBkYXRhLmFjY2VsZXJhdGlvbi54O1xyXG4gICAgICAgIGNsaWVudC5nYW1lT2JqZWN0LmFjY2VsZXJhdGlvbi55ID0gZGF0YS5hY2NlbGVyYXRpb24ueTtcclxuICAgICAgICBjbGllbnQuZ2FtZU9iamVjdC5zZXRSb3RhdGlvbihkYXRhLnJvdGF0aW9uKTtcclxuICAgIH0sXHJcblxyXG4gICAgX29uVXBkYXRlUm9vbXMgOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgIHRoaXMucm9vbXMgPSBkYXRhO1xyXG5cclxuICAgICAgICAkKHRoaXMpLnRyaWdnZXIoXHJcbiAgICAgICAgICAgIHRoaXMuRXZlbnQuVVBEQVRFX1JPT01TLFxyXG4gICAgICAgICAgICBkYXRhXHJcbiAgICAgICAgKTtcclxuICAgIH0sXHJcblxyXG4gICAgX29uRW50ZXJSb29tU3VjY2VzcyA6IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgJCh0aGlzKS50cmlnZ2VyKFxyXG4gICAgICAgICAgICB0aGlzLkV2ZW50LkVOVEVSX1JPT01fU1VDQ0VTUyxcclxuICAgICAgICAgICAgZGF0YVxyXG4gICAgICAgICk7XHJcbiAgICB9LFxyXG5cclxuICAgIF9vbkVudGVyUm9vbUZhaWwgOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICQodGhpcykudHJpZ2dlcihcclxuICAgICAgICAgICAgdGhpcy5FdmVudC5FTlRFUl9ST09NX0ZBSUwsXHJcbiAgICAgICAgICAgIGRhdGFcclxuICAgICAgICApO1xyXG4gICAgfVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBOZXR3b3JrO1xyXG5cclxudmFyIENsaWVudCA9IHJlcXVpcmUoJy4vQ2xpZW50LmpzJyk7XHJcbnZhciBMb2NhbENsaWVudCA9IHJlcXVpcmUoJy4vTG9jYWxDbGllbnQuanMnKTsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBPdmVybGF5ID0gcmVxdWlyZSgnLi9PdmVybGF5Jyk7XHJcblxyXG52YXIgQ3JlYXRlUm9vbU92ZXJsYXkgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICBPdmVybGF5LmNhbGwodGhpcyk7XHJcbiAgICBcclxuICAgIHRoaXMuaW5wdXRGaWVsZCA9ICQoXCI8aW5wdXQ+XCIpO1xyXG4gICAgdGhpcy5pbnB1dEZpZWxkLmF0dHIoeyBcInBsYWNlaG9sZGVyXCIgOiBcIlJvb20gTmFtZVwiIH0pO1xyXG4gICAgdGhpcy5pbnB1dEZpZWxkLmFkZENsYXNzKFwiY3JlYXRlLXJvb20tb3ZlcmxheS1pbnB1dFwiKTtcclxuICAgIFxyXG4gICAgdGhpcy5idXR0b25Db250YWluZXIgPSAkKFwiPGRpdj5cIik7XHJcbiAgICB0aGlzLmJ1dHRvbkNvbnRhaW5lci5hZGRDbGFzcyhcImNyZWF0ZS1yb29tLW92ZXJsYXktYnV0dG9uLWNvbnRhaW5lclwiKTtcclxuICAgIFxyXG4gICAgdGhpcy5jYW5jZWxCdG4gPSAkKFwiPGJ1dHRvbj5cIik7XHJcbiAgICB0aGlzLmNhbmNlbEJ0bi50ZXh0KFwiQ2FuY2VsXCIpO1xyXG4gICAgdGhpcy5idXR0b25Db250YWluZXIuYXBwZW5kKHRoaXMuY2FuY2VsQnRuKTtcclxuICAgIFxyXG4gICAgdGhpcy5jcmVhdGVCdG4gPSAkKFwiPGJ1dHRvbj5cIik7XHJcbiAgICB0aGlzLmNyZWF0ZUJ0bi50ZXh0KFwiQ3JlYXRlXCIpO1xyXG4gICAgdGhpcy5idXR0b25Db250YWluZXIuYXBwZW5kKHRoaXMuY3JlYXRlQnRuKTtcclxuXHJcbiAgICB0aGlzLmRvbU9iamVjdC5hcHBlbmQodGhpcy5pbnB1dEZpZWxkKTtcclxuICAgIHRoaXMuZG9tT2JqZWN0LmFwcGVuZCh0aGlzLmJ1dHRvbkNvbnRhaW5lcik7XHJcbiAgICB0aGlzLmRvbU9iamVjdC5hZGRDbGFzcyhcImNyZWF0ZS1yb29tLW92ZXJsYXlcIik7XHJcbn07XHJcblxyXG5DcmVhdGVSb29tT3ZlcmxheS5wcm90b3R5cGUgPSBPYmplY3QuZnJlZXplKE9iamVjdC5jcmVhdGUoT3ZlcmxheS5wcm90b3R5cGUsIHtcclxuXHJcbn0pKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ3JlYXRlUm9vbU92ZXJsYXk7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgT3ZlcmxheSA9IHJlcXVpcmUoJy4vT3ZlcmxheScpO1xyXG5cclxudmFyIExvYWRpbmdPdmVybGF5ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgT3ZlcmxheS5jYWxsKHRoaXMpO1xyXG4gICAgXHJcbiAgICB0aGlzLmRvbU9iamVjdC5hZGRDbGFzcyhcImxvYWRpbmctb3ZlcmxheVwiKTtcclxufTtcclxuXHJcbkxvYWRpbmdPdmVybGF5LnByb3RvdHlwZSA9IE9iamVjdC5mcmVlemUoT2JqZWN0LmNyZWF0ZShPdmVybGF5LnByb3RvdHlwZSwge1xyXG5cclxufSkpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBMb2FkaW5nT3ZlcmxheTsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBPdmVybGF5ID0gcmVxdWlyZSgnLi9PdmVybGF5Jyk7XHJcbnZhciBOZXR3b3JrID0gcmVxdWlyZSgnLi4vbmV0d29yaycpO1xyXG5cclxudmFyIExvYmJ5T3ZlcmxheSA9IGZ1bmN0aW9uICgpIHtcclxuICAgIE92ZXJsYXkuY2FsbCh0aGlzKTtcclxuXHJcbiAgICAvLyBTZXQgdXAgbGVmdCBzaWRlXHJcbiAgICB0aGlzLmxlZnRDb250YWluZXIgPSAkKFwiPHNwYW4+XCIpO1xyXG4gICAgdGhpcy5sZWZ0Q29udGFpbmVyLmFkZENsYXNzKFwibG9iYnktb3ZlcmxheS1sZWZ0XCIpO1xyXG5cclxuICAgIHRoaXMucm9vbUJ1dHRvbkNvbnRhaW5lciA9ICQoXCI8ZGl2PlwiKTtcclxuICAgIHRoaXMucm9vbUJ1dHRvbkNvbnRhaW5lci5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXktYnV0dG9uLWNvbnRhaW5lclwiKTtcclxuICAgIHRoaXMubGVmdENvbnRhaW5lci5hcHBlbmQodGhpcy5yb29tQnV0dG9uQ29udGFpbmVyKTtcclxuXHJcbiAgICB0aGlzLnNlbGVjdFJvb21MYWJlbCA9ICQoXCI8ZGl2PlwiKTtcclxuICAgIHRoaXMuc2VsZWN0Um9vbUxhYmVsLmh0bWwoXCJTZWxlY3Qgb3IgY3JlYXRlIGEgcm9vbVwiKTtcclxuICAgIHRoaXMucm9vbUJ1dHRvbkNvbnRhaW5lci5hcHBlbmQodGhpcy5zZWxlY3RSb29tTGFiZWwpO1xyXG4gICAgdGhpcy5yb29tQnV0dG9uQ29udGFpbmVyLmFwcGVuZCgkKFwiPGJyPlwiKSk7XHJcblxyXG4gICAgdGhpcy5jcmVhdGVSb29tQnRuID0gJChcIjxidXR0b24+XCIpO1xyXG4gICAgdGhpcy5jcmVhdGVSb29tQnRuLnRleHQoXCJDcmVhdGUgUm9vbVwiKTtcclxuICAgIHRoaXMucm9vbUJ1dHRvbkNvbnRhaW5lci5hcHBlbmQodGhpcy5jcmVhdGVSb29tQnRuKTtcclxuXHJcbiAgICB0aGlzLnJvb21MaXN0Q29udGFpbmVyID0gJChcIjxkaXY+XCIpO1xyXG4gICAgdGhpcy5yb29tTGlzdENvbnRhaW5lci5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXktcm9vbS1saXN0XCIpO1xyXG4gICAgdGhpcy5yb29tTGlzdENvbnRhaW5lci5odG1sKFwiTG9hZGluZyByb29tcy4uLlwiKTtcclxuICAgIHRoaXMubGVmdENvbnRhaW5lci5hcHBlbmQodGhpcy5yb29tTGlzdENvbnRhaW5lcik7XHJcblxyXG4gICAgLy8gU2V0IHVwIHJpZ2h0IHNpZGVcclxuICAgIHRoaXMucmlnaHRDb250YWluZXIgPSAkKFwiPHNwYW4+XCIpO1xyXG4gICAgdGhpcy5yaWdodENvbnRhaW5lci5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXktcmlnaHRcIik7XHJcblxyXG4gICAgdGhpcy5zZWxlY3RlZFJvb21MYWJlbCA9ICQoXCI8ZGl2PlwiKTtcclxuICAgIHRoaXMucmVuZGVyUm9vbUxhYmVsKCk7XHJcbiAgICB0aGlzLnJpZ2h0Q29udGFpbmVyLmFwcGVuZCh0aGlzLnNlbGVjdGVkUm9vbUxhYmVsKTtcclxuXHJcbiAgICB0aGlzLnBsYXllckxpc3QgPSAkKFwiPGRpdj5cIik7XHJcbiAgICB0aGlzLnJlbmRlclBsYXllcnMoKTtcclxuICAgIHRoaXMucmlnaHRDb250YWluZXIuYXBwZW5kKHRoaXMucGxheWVyTGlzdCk7XHJcblxyXG4gICAgdGhpcy5wbGF5QnRuID0gJChcIjxidXR0b24+XCIpO1xyXG4gICAgdGhpcy5wbGF5QnRuLnRleHQoXCJQbGF5XCIpO1xyXG4gICAgdGhpcy5wbGF5QnRuLmFkZENsYXNzKFwibG9iYnktb3ZlcmxheS1wbGF5LWJ0blwiKTtcclxuICAgIHRoaXMucmlnaHRDb250YWluZXIuYXBwZW5kKHRoaXMucGxheUJ0bik7XHJcblxyXG4gICAgdGhpcy5kb21PYmplY3QuYXBwZW5kKHRoaXMubGVmdENvbnRhaW5lcik7XHJcbiAgICB0aGlzLmRvbU9iamVjdC5hcHBlbmQodGhpcy5yaWdodENvbnRhaW5lcik7XHJcbiAgICB0aGlzLmRvbU9iamVjdC5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXlcIik7XHJcbiAgICB0aGlzLmRvbU9iamVjdC5hZGRDbGFzcyhcImZhZGUtaW5cIik7XHJcbn07XHJcblxyXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyhMb2JieU92ZXJsYXksIHtcclxuICAgIEV2ZW50IDoge1xyXG4gICAgICAgIHZhbHVlIDoge1xyXG4gICAgICAgICAgICBFTlRFUl9ST09NIDogXCJlbnRlclJvb21cIlxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSk7XHJcblxyXG5Mb2JieU92ZXJsYXkucHJvdG90eXBlID0gT2JqZWN0LmZyZWV6ZShPYmplY3QuY3JlYXRlKE92ZXJsYXkucHJvdG90eXBlLCB7XHJcbiAgICBzaG93Um9vbXMgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAocm9vbURhdGEpIHtcclxuICAgICAgICAgICAgdGhpcy5yb29tTGlzdENvbnRhaW5lci5odG1sKFwiXCIpO1xyXG5cclxuICAgICAgICAgICAgJChcIi5sb2JieS1vdmVybGF5LXJvb21cIikub2ZmKFwiY2xpY2tcIik7XHJcblxyXG4gICAgICAgICAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHJvb21EYXRhKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChrZXlzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yb29tTGlzdENvbnRhaW5lci5odG1sKFwiTm8gcm9vbXMgYXZhaWxhYmxlXCIpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGN1clJvb20gPSByb29tRGF0YVtrZXlzW2ldXTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgY3VyUm9vbUNvbnRhaW5lciA9ICQoXCI8ZGl2PlwiKTtcclxuICAgICAgICAgICAgICAgICAgICBjdXJSb29tQ29udGFpbmVyLmFkZENsYXNzKFwibG9iYnktb3ZlcmxheS1yb29tXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGN1clJvb21Db250YWluZXIuaHRtbChjdXJSb29tLm5hbWUpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAkKGN1clJvb21Db250YWluZXIpLm9uKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcImNsaWNrXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1clJvb20sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX29uQ2xpY2tSb29tLmJpbmQodGhpcylcclxuICAgICAgICAgICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJvb21MaXN0Q29udGFpbmVyLmFwcGVuZChjdXJSb29tQ29udGFpbmVyKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgcmVuZGVyUm9vbSA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgIGlmIChkYXRhID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyUm9vbUxhYmVsKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlclBsYXllcnMoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyUm9vbUxhYmVsKGRhdGEubmFtZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlclBsYXllcnMoZGF0YS5wbGF5ZXJzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgcmVuZGVyUm9vbUxhYmVsIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGxhYmVsKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgbGFiZWwgIT09IFwic3RyaW5nXCIgfHwgbGFiZWwgPT09IFwiXCIpIHtcclxuICAgICAgICAgICAgICAgIGxhYmVsID0gXCJObyByb29tIHNlbGVjdGVkXCI7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxhYmVsID0gXCJDdXJyZW50IHJvb206IFwiICsgbGFiZWw7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkUm9vbUxhYmVsLmh0bWwobGFiZWwpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgcmVuZGVyUGxheWVycyA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChwbGF5ZXJJZHMpIHtcclxuICAgICAgICAgICAgdGhpcy5wbGF5ZXJMaXN0Lmh0bWwoXCJcIik7XHJcblxyXG4gICAgICAgICAgICBpZiAocGxheWVySWRzICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGxheWVySWRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGN1cklkID0gcGxheWVySWRzW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBjdXJQbGF5ZXIgPSBOZXR3b3JrLmNsaWVudHNbY3VySWRdO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGN1clBsYXllcik7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBsYXllckNvbnRhaW5lciA9ICQoXCI8ZGl2PlwiKTtcclxuICAgICAgICAgICAgICAgICAgICBwbGF5ZXJDb250YWluZXIuaHRtbChjdXJQbGF5ZXIuZGF0YS51c2VyKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBsYXllckxpc3QuYXBwZW5kKHBsYXllckNvbnRhaW5lcik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIF9vbkNsaWNrUm9vbSA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIHZhciBkYXRhID0gZS5kYXRhO1xyXG4gICAgICAgICAgICB2YXIgcm9vbSA9IHtcclxuICAgICAgICAgICAgICAgIG5hbWUgOiBkYXRhLm5hbWUsXHJcbiAgICAgICAgICAgICAgICBpZCAgIDogZGF0YS5pZFxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgJCh0aGlzKS50cmlnZ2VyKExvYmJ5T3ZlcmxheS5FdmVudC5FTlRFUl9ST09NLCByb29tKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKTtcclxuXHJcbk9iamVjdC5mcmVlemUoTG9iYnlPdmVybGF5KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTG9iYnlPdmVybGF5OyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIE92ZXJsYXkgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLmRvbU9iamVjdCA9ICQoXCI8ZGl2PlwiKTtcclxuICAgIHRoaXMuZG9tT2JqZWN0LmFkZENsYXNzKFwiY2FudmFzLW92ZXJsYXlcIik7XHJcbn07XHJcblxyXG5PdmVybGF5LnByb3RvdHlwZSA9IE9iamVjdC5mcmVlemUoT2JqZWN0LmNyZWF0ZShPdmVybGF5LnByb3RvdHlwZSwge1xyXG5cclxufSkpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBPdmVybGF5OyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIE92ZXJsYXkgPSByZXF1aXJlKCcuL092ZXJsYXkuanMnKTtcclxudmFyIExvYWRpbmdPdmVybGF5ID0gcmVxdWlyZSgnLi9Mb2FkaW5nT3ZlcmxheS5qcycpO1xyXG52YXIgQ3JlYXRlUm9vbU92ZXJsYXkgPSByZXF1aXJlKCcuL0NyZWF0ZVJvb21PdmVybGF5LmpzJyk7XHJcbnZhciBMb2JieU92ZXJsYXkgPSByZXF1aXJlKCcuL0xvYmJ5T3ZlcmxheS5qcycpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICBPdmVybGF5IDogT3ZlcmxheSxcclxuICAgIExvYWRpbmdPdmVybGF5IDogTG9hZGluZ092ZXJsYXksXHJcbiAgICBDcmVhdGVSb29tT3ZlcmxheSA6IENyZWF0ZVJvb21PdmVybGF5LFxyXG4gICAgTG9iYnlPdmVybGF5IDogTG9iYnlPdmVybGF5XHJcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcclxudmFyIEFzc2V0cyA9IHV0aWwuQXNzZXRzO1xyXG52YXIgTmV0d29yayA9IHJlcXVpcmUoJy4uL25ldHdvcmsnKTtcclxudmFyIGVudGl0aWVzID0gcmVxdWlyZSgnLi4vZW50aXRpZXMnKTtcclxudmFyIEZ1bGxCb2NrID0gZW50aXRpZXMuRnVsbEJsb2NrO1xyXG52YXIgUGxheWVyID0gZW50aXRpZXMuUGxheWVyO1xyXG52YXIgTmV0d29ya1NjZW5lID0gcmVxdWlyZSgnLi9OZXR3b3JrU2NlbmUnKTtcclxudmFyIGJhY2tncm91bmRzID0gd2ZsLmRpc3BsYXkuYmFja2dyb3VuZHM7XHJcbnZhciBnZW9tID0gd2ZsLmdlb207XHJcblxyXG52YXIgR2FtZVNjZW5lID0gZnVuY3Rpb24gKGNhbnZhcywgcm9vbUlkKSB7XHJcbiAgICBOZXR3b3JrU2NlbmUuY2FsbCh0aGlzLCBjYW52YXMsIHJvb21JZCk7XHJcblxyXG4gICAgdmFyIHdhbGxTaXplID0gMTA7XHJcbiAgICB2YXIgYmxvY2tTaXplID0gMTI4O1xyXG4gICAgdmFyIG9mZnNldCA9IC0od2FsbFNpemUgKiAwLjUgLSAxKSAqIGJsb2NrU2l6ZTtcclxuXHJcbiAgICAvLyBMaW5lIHRoZSB0b3BcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgOTsgaSsrKSB7XHJcbiAgICAgICAgdmFyIG5ld0Jsb2NrID0gbmV3IEZ1bGxCb2NrKCk7XHJcbiAgICAgICAgbmV3QmxvY2sucG9zaXRpb24ueCA9IGJsb2NrU2l6ZSAqIGkgKyBvZmZzZXQ7XHJcbiAgICAgICAgbmV3QmxvY2sucG9zaXRpb24ueSA9IG9mZnNldDtcclxuXHJcbiAgICAgICAgdGhpcy5hZGRHYW1lT2JqZWN0KG5ld0Jsb2NrKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBMaW5lIHRoZSBib3R0b21cclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgOTsgaSsrKSB7XHJcbiAgICAgICAgdmFyIG5ld0Jsb2NrID0gbmV3IEZ1bGxCb2NrKCk7XHJcbiAgICAgICAgbmV3QmxvY2sucG9zaXRpb24ueCA9IGJsb2NrU2l6ZSAqIGkgKyBvZmZzZXQ7XHJcbiAgICAgICAgbmV3QmxvY2sucG9zaXRpb24ueSA9IC1vZmZzZXQ7XHJcblxyXG4gICAgICAgIHRoaXMuYWRkR2FtZU9iamVjdChuZXdCbG9jayk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gTGluZSB0aGUgbGVmdFxyXG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCA4OyBpKyspIHtcclxuICAgICAgICB2YXIgbmV3QmxvY2sgPSBuZXcgRnVsbEJvY2soKTtcclxuICAgICAgICBuZXdCbG9jay5wb3NpdGlvbi54ID0gb2Zmc2V0O1xyXG4gICAgICAgIG5ld0Jsb2NrLnBvc2l0aW9uLnkgPSBibG9ja1NpemUgKiBpICsgb2Zmc2V0O1xyXG5cclxuICAgICAgICB0aGlzLmFkZEdhbWVPYmplY3QobmV3QmxvY2spO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIExpbmUgdGhlIHJpZ2h0XHJcbiAgICBmb3IgKHZhciBpID0gMTsgaSA8IDg7IGkrKykge1xyXG4gICAgICAgIHZhciBuZXdCbG9jayA9IG5ldyBGdWxsQm9jaygpO1xyXG4gICAgICAgIG5ld0Jsb2NrLnBvc2l0aW9uLnggPSAtb2Zmc2V0O1xyXG4gICAgICAgIG5ld0Jsb2NrLnBvc2l0aW9uLnkgPSBibG9ja1NpemUgKiBpICsgb2Zmc2V0O1xyXG5cclxuICAgICAgICB0aGlzLmFkZEdhbWVPYmplY3QobmV3QmxvY2spO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICB0aGlzLmJnID0gbmV3IGJhY2tncm91bmRzLlBhcmFsbGF4QmFja2dyb3VuZChcclxuICAgICAgICBBc3NldHMuZ2V0KEFzc2V0cy5CR19USUxFKVxyXG4gICAgKTtcclxuICAgIFxyXG4gICAgdGhpcy5wbGF5ZXIgPSBOZXR3b3JrLmxvY2FsQ2xpZW50LmdhbWVPYmplY3Q7XHJcbiAgICB0aGlzLmFkZEdhbWVPYmplY3QodGhpcy5wbGF5ZXIsIDIpO1xyXG59O1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyhHYW1lU2NlbmUsIHtcclxuICAgIEZSSUNUSU9OIDoge1xyXG4gICAgICAgIHZhbHVlIDogMC45MjVcclxuICAgIH0sXHJcblxyXG4gICAgTUlOSU1BUCA6IHtcclxuICAgICAgICB2YWx1ZSA6IE9iamVjdC5mcmVlemUoe1xyXG4gICAgICAgICAgICBXSURUSCAgICAgIDogMTUwLFxyXG4gICAgICAgICAgICBIRUlHSFQgICAgIDogMTAwLFxyXG4gICAgICAgICAgICBTQ0FMRSAgICAgIDogMC4xLFxyXG4gICAgICAgICAgICBGSUxMX1NUWUxFIDogXCIjMTkyNDI3XCJcclxuICAgICAgICB9KVxyXG4gICAgfVxyXG59KTtcclxuR2FtZVNjZW5lLnByb3RvdHlwZSA9IE9iamVjdC5mcmVlemUoT2JqZWN0LmNyZWF0ZShOZXR3b3JrU2NlbmUucHJvdG90eXBlLCB7XHJcbiAgICB1cGRhdGUgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoZHQpIHtcclxuICAgICAgICAgICAgdmFyIGdhbWVPYmplY3RzID0gdGhpcy5nZXRHYW1lT2JqZWN0cygpO1xyXG4gICAgICAgIFxyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGdhbWVPYmplY3RzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgb2JqID0gZ2FtZU9iamVjdHNbaV07XHJcbiAgICAgICAgICAgICAgICBvYmouYWNjZWxlcmF0aW9uLm11bHRpcGx5KEdhbWVTY2VuZS5GUklDVElPTik7XHJcbiAgICAgICAgICAgICAgICBvYmoudmVsb2NpdHkubXVsdGlwbHkoR2FtZVNjZW5lLkZSSUNUSU9OKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgTmV0d29ya1NjZW5lLnByb3RvdHlwZS51cGRhdGUuY2FsbCh0aGlzLCBkdCk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB0aGlzLmhhbmRsZUlucHV0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIFxyXG4gICAgaGFuZGxlSW5wdXQgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciBwbGF5ZXIgICAgICAgPSB0aGlzLnBsYXllcjtcclxuICAgICAgICAgICAgdmFyIGtleWJvYXJkICAgICA9IHRoaXMua2V5Ym9hcmQ7XHJcbiAgICAgICAgICAgIHZhciBsZWZ0UHJlc3NlZCAgPSBrZXlib2FyZC5pc1ByZXNzZWQoa2V5Ym9hcmQuTEVGVCk7XHJcbiAgICAgICAgICAgIHZhciByaWdodFByZXNzZWQgPSBrZXlib2FyZC5pc1ByZXNzZWQoa2V5Ym9hcmQuUklHSFQpO1xyXG4gICAgICAgICAgICB2YXIgdXBQcmVzc2VkICAgID0ga2V5Ym9hcmQuaXNQcmVzc2VkKGtleWJvYXJkLlVQKTtcclxuICAgICAgICAgICAgdmFyIGRvd25QcmVzc2VkICA9IGtleWJvYXJkLmlzUHJlc3NlZChrZXlib2FyZC5ET1dOKTtcclxuXHJcbiAgICAgICAgICAgIC8vIExlZnQvIFJpZ2h0IEtleSAtLSBQbGF5ZXIgdHVybnNcclxuICAgICAgICAgICAgaWYgKGxlZnRQcmVzc2VkIHx8IHJpZ2h0UHJlc3NlZCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHJvdGF0aW9uID0gMDtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAobGVmdFByZXNzZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICByb3RhdGlvbiAtPSBQbGF5ZXIuVFVSTl9TUEVFRDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAocmlnaHRQcmVzc2VkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcm90YXRpb24gKz0gUGxheWVyLlRVUk5fU1BFRUQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcGxheWVyLnJvdGF0ZShyb3RhdGlvbik7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIFVwIEtleSAtLSBQbGF5ZXIgZ29lcyBmb3J3YXJkXHJcbiAgICAgICAgICAgIGlmICh1cFByZXNzZWQpIHtcclxuICAgICAgICAgICAgICAgIHZhciBtb3ZlbWVudEZvcmNlID0gZ2VvbS5WZWMyLmZyb21BbmdsZShwbGF5ZXIuZ2V0Um90YXRpb24oKSk7XHJcbiAgICAgICAgICAgICAgICBtb3ZlbWVudEZvcmNlLm11bHRpcGx5KFxyXG4gICAgICAgICAgICAgICAgICAgIFBsYXllci5CT09TVF9BQ0NFTEVSQVRJT04gKiBwbGF5ZXIubWFzc1xyXG4gICAgICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgICAgICBwbGF5ZXIuYWRkRm9yY2UobW92ZW1lbnRGb3JjZSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIERvd24gS2V5IC0tIEFwcGx5IGJyYWtlcyB0byBwbGF5ZXJcclxuICAgICAgICAgICAgaWYgKGRvd25QcmVzc2VkKSB7XHJcbiAgICAgICAgICAgICAgICBwbGF5ZXIudmVsb2NpdHkubXVsdGlwbHkoUGxheWVyLkJSQUtFX1JBVEUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEdhbWVTY2VuZTsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBTY2VuZSA9IHdmbC5kaXNwbGF5LlNjZW5lO1xyXG52YXIgb3ZlcmxheXMgPSByZXF1aXJlKCcuLi9vdmVybGF5cycpO1xyXG5cclxudmFyIExvYWRpbmdTY2VuZSA9IGZ1bmN0aW9uIChjYW52YXMpIHtcclxuICAgIFNjZW5lLmNhbGwodGhpcywgY2FudmFzKTtcclxuICAgIFxyXG4gICAgdGhpcy5sb2FkaW5nT3ZlcmxheSA9IG5ldyBvdmVybGF5cy5Mb2FkaW5nT3ZlcmxheSgpO1xyXG4gICAgJChjYW52YXMpLnBhcmVudCgpLmFwcGVuZCh0aGlzLmxvYWRpbmdPdmVybGF5LmRvbU9iamVjdCk7XHJcbn07XHJcbkxvYWRpbmdTY2VuZS5wcm90b3R5cGUgPSBPYmplY3QuZnJlZXplKE9iamVjdC5jcmVhdGUoU2NlbmUucHJvdG90eXBlLCB7XHJcbiAgICBkZXN0cm95IDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLmxvYWRpbmdPdmVybGF5LmRvbU9iamVjdC5yZW1vdmUoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTG9hZGluZ1NjZW5lOyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIFNjZW5lID0gd2ZsLmRpc3BsYXkuU2NlbmU7XHJcbnZhciBvdmVybGF5cyA9IHJlcXVpcmUoJy4uL292ZXJsYXlzJyk7XHJcbnZhciBOZXR3b3JrID0gcmVxdWlyZSgnLi4vbmV0d29yaycpO1xyXG5cclxudmFyIExvYWRpbmdTY2VuZSA9IGZ1bmN0aW9uIChjYW52YXMpIHtcclxuICAgIFNjZW5lLmNhbGwodGhpcywgY2FudmFzKTtcclxuXHJcbiAgICB0aGlzLmN1clJvb21JZCA9IHVuZGVmaW5lZDtcclxuXHJcbiAgICB0aGlzLmxvYmJ5T3ZlcmxheSA9IG5ldyBvdmVybGF5cy5Mb2JieU92ZXJsYXkoKTtcclxuICAgIHRoaXMuY3JlYXRlUm9vbU92ZXJsYXkgPSBuZXcgb3ZlcmxheXMuQ3JlYXRlUm9vbU92ZXJsYXkoKTtcclxuICAgICQoY2FudmFzKS5wYXJlbnQoKS5hcHBlbmQodGhpcy5sb2JieU92ZXJsYXkuZG9tT2JqZWN0KTtcclxuICAgICQoY2FudmFzKS5wYXJlbnQoKS5hcHBlbmQodGhpcy5jcmVhdGVSb29tT3ZlcmxheS5kb21PYmplY3QpO1xyXG5cclxuICAgIHRoaXMuY3JlYXRlUm9vbU92ZXJsYXkuZG9tT2JqZWN0LmhpZGUoKTtcclxuXHJcbiAgICB0aGlzLmxvYmJ5T3ZlcmxheS5wbGF5QnRuLmNsaWNrKHRoaXMuX29uUGxheUJ1dHRvbkNsaWNrLmJpbmQodGhpcykpO1xyXG4gICAgdGhpcy5sb2JieU92ZXJsYXkuY3JlYXRlUm9vbUJ0bi5jbGljayh0aGlzLl9vbkNyZWF0ZVJvb21CdXR0b25DbGljay5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICB0aGlzLmNyZWF0ZVJvb21PdmVybGF5LmNhbmNlbEJ0bi5jbGljayh0aGlzLl9vbkNyZWF0ZVJvb21DYW5jZWwuYmluZCh0aGlzKSk7XHJcbiAgICB0aGlzLmNyZWF0ZVJvb21PdmVybGF5LmNyZWF0ZUJ0bi5jbGljayh0aGlzLl9vbkNyZWF0ZVJvb20uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgJCh0aGlzLmxvYmJ5T3ZlcmxheSkub24ob3ZlcmxheXMuTG9iYnlPdmVybGF5LkV2ZW50LkVOVEVSX1JPT00sIHRoaXMuX29uRW50ZXJSb29tQXR0ZW1wdC5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAkKE5ldHdvcmspLm9uKE5ldHdvcmsuRXZlbnQuVVBEQVRFX1JPT01TLCB0aGlzLl9vblVwZGF0ZVJvb21MaXN0LmJpbmQodGhpcykpO1xyXG4gICAgJChOZXR3b3JrKS5vbihOZXR3b3JrLkV2ZW50LkVOVEVSX1JPT01fU1VDQ0VTUywgdGhpcy5fb25FbnRlclJvb21TdWNjZXNzLmJpbmQodGhpcykpO1xyXG4gICAgJChOZXR3b3JrKS5vbihOZXR3b3JrLkV2ZW50LkVOVEVSX1JPT01fRkFJTCwgdGhpcy5fb25FbnRlclJvb21GYWlsLmJpbmQodGhpcykpO1xyXG5cclxuICAgIHRoaXMucm9vbVVwZGF0ZUludGVydmFsID1cclxuICAgICAgICBzZXRJbnRlcnZhbCh0aGlzLnVwZGF0ZVJvb21MaXN0LmJpbmQodGhpcyksIExvYWRpbmdTY2VuZS5ST09NX1VQREFURV9GUkVRVUVOQ1kpO1xyXG5cclxuICAgIHRoaXMudXBkYXRlUm9vbUxpc3QoKTtcclxufTtcclxuXHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKExvYWRpbmdTY2VuZSwge1xyXG4gICAgUk9PTV9VUERBVEVfRlJFUVVFTkNZIDoge1xyXG4gICAgICAgIHZhbHVlIDogNTAwMFxyXG4gICAgfVxyXG59KTtcclxuXHJcbkxvYWRpbmdTY2VuZS5wcm90b3R5cGUgPSBPYmplY3QuZnJlZXplKE9iamVjdC5jcmVhdGUoU2NlbmUucHJvdG90eXBlLCB7XHJcbiAgICBkZXN0cm95IDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLmxvYmJ5T3ZlcmxheS5kb21PYmplY3QucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlUm9vbU92ZXJsYXkuZG9tT2JqZWN0LnJlbW92ZSgpO1xyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZVJvb21PdmVybGF5LmlucHV0RmllbGQub2ZmKFwia2V5cHJlc3NcIik7XHJcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy5yb29tVXBkYXRlSW50ZXJ2YWwpO1xyXG4gICAgICAgICAgICAkKE5ldHdvcmspLm9mZihOZXR3b3JrLkV2ZW50LlVQREFURV9ST09NUyk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICB1cGRhdGVSb29tTGlzdCA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgTmV0d29yay5nZXRSb29tcygpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX29uUGxheUJ1dHRvbkNsaWNrIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgJCh0aGlzKS50cmlnZ2VyKFwicGxheS1nYW1lXCIsIHRoaXMuY3VyUm9vbUlkKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIF9vbkNyZWF0ZVJvb21CdXR0b25DbGljayA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlUm9vbU92ZXJsYXkuaW5wdXRGaWVsZC5vZmYoXCJrZXlwcmVzc1wiKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlUm9vbU92ZXJsYXkuaW5wdXRGaWVsZC52YWwoXCJcIik7XHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlUm9vbU92ZXJsYXkuZG9tT2JqZWN0LnJlbW92ZUNsYXNzKFwiZmFkZS1pblwiKTtcclxuICAgICAgICAgICAgdGhpcy5jcmVhdGVSb29tT3ZlcmxheS5kb21PYmplY3Quc2hvdygpO1xyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZVJvb21PdmVybGF5LmRvbU9iamVjdC5hZGRDbGFzcyhcImZhZGUtaW5cIik7XHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlUm9vbU92ZXJsYXkuaW5wdXRGaWVsZC5mb2N1cygpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5jcmVhdGVSb29tT3ZlcmxheS5pbnB1dEZpZWxkLm9uKFwia2V5cHJlc3NcIiwgdGhpcy5fb25DcmVhdGVSb29tS2V5UHJlc3MuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBfb25DcmVhdGVSb29tS2V5UHJlc3MgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICBpZiAoZS5rZXlDb2RlID09PSAxMykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fb25DcmVhdGVSb29tKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIF9vbkNyZWF0ZVJvb21DYW5jZWwgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZVJvb21PdmVybGF5LmRvbU9iamVjdC5oaWRlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBfb25DcmVhdGVSb29tIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgdGhpcy5jcmVhdGVSb29tT3ZlcmxheS5kb21PYmplY3QuaGlkZSgpO1xyXG4gICAgICAgICAgICB2YXIgbmFtZSA9IHRoaXMuY3JlYXRlUm9vbU92ZXJsYXkuaW5wdXRGaWVsZC52YWwoKTtcclxuICAgICAgICAgICAgTmV0d29yay5jcmVhdGVSb29tKG5hbWUpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX29uVXBkYXRlUm9vbUxpc3QgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoZSwgZGF0YSkge1xyXG4gICAgICAgICAgICB0aGlzLmxvYmJ5T3ZlcmxheS5zaG93Um9vbXMoZGF0YSk7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5jdXJSb29tSWQgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5sb2JieU92ZXJsYXkucmVuZGVyUm9vbShkYXRhW3RoaXMuY3VyUm9vbUlkXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIF9vbkVudGVyUm9vbUF0dGVtcHQgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoZSwgZGF0YSkge1xyXG4gICAgICAgICAgICBOZXR3b3JrLmVudGVyUm9vbShkYXRhKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIF9vbkVudGVyUm9vbVN1Y2Nlc3MgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoZSwgZGF0YSkge1xyXG4gICAgICAgICAgICB0aGlzLmN1clJvb21JZCA9IGRhdGEuaWQ7XHJcbiAgICAgICAgICAgIHRoaXMubG9iYnlPdmVybGF5LnJlbmRlclJvb20oZGF0YSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBfb25FbnRlclJvb21GYWlsIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGUsIGRhdGEpIHtcclxuICAgICAgICAgICAgYWxlcnQoZGF0YS5tc2cpO1xyXG4gICAgICAgICAgICB0aGlzLmN1clJvb21JZCA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgdGhpcy5sb2JieU92ZXJsYXkucmVuZGVyUm9vbSh1bmRlZmluZWQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkpO1xyXG5cclxuT2JqZWN0LmZyZWV6ZShMb2FkaW5nU2NlbmUpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBMb2FkaW5nU2NlbmU7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgTmV0d29yayA9IHJlcXVpcmUoJy4uL25ldHdvcmsnKTtcclxudmFyIFNjZW5lID0gd2ZsLmRpc3BsYXkuU2NlbmU7XHJcblxyXG52YXIgTmV0d29ya1NjZW5lID0gZnVuY3Rpb24gKGNhbnZhcywgcm9vbUlkKSB7XHJcbiAgICBTY2VuZS5jYWxsKHRoaXMsIGNhbnZhcyk7XHJcbiAgICBcclxuICAgICQoTmV0d29yaykub24oXHJcbiAgICAgICAgTmV0d29yay5FdmVudC5BRERfQ0xJRU5ULFxyXG4gICAgICAgIHRoaXMub25BZGRDbGllbnQuYmluZCh0aGlzKVxyXG4gICAgKTtcclxuICAgICQoTmV0d29yaykub24oXHJcbiAgICAgICAgTmV0d29yay5FdmVudC5SRU1PVkVfQ0xJRU5ULFxyXG4gICAgICAgIHRoaXMub25SZW1vdmVDbGllbnQuYmluZCh0aGlzKVxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBBZGQgb3RoZXIgY2xpZW50cyB0aGF0IGFyZSBhbHJlYWR5IGNvbm5lY3RlZFxyXG4gICAgdmFyIHJvb20gPSBOZXR3b3JrLnJvb21zW3Jvb21JZF07XHJcbiAgICB2YXIgcGxheWVycyA9IHJvb20ucGxheWVycztcclxuXHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBsYXllcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB2YXIgaWQgPSBwbGF5ZXJzW2ldO1xyXG4gICAgICAgIHZhciBjbGllbnQgPSBOZXR3b3JrLmNsaWVudHNbaWRdO1xyXG5cclxuICAgICAgICBpZiAoY2xpZW50ICE9PSBOZXR3b3JrLmxvY2FsQ2xpZW50KSB7XHJcbiAgICAgICAgICAgIHRoaXMuYWRkR2FtZU9iamVjdChjbGllbnQuZ2FtZU9iamVjdCwgMSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5OZXR3b3JrU2NlbmUucHJvdG90eXBlID0gT2JqZWN0LmZyZWV6ZShPYmplY3QuY3JlYXRlKFNjZW5lLnByb3RvdHlwZSwge1xyXG4gICAgb25BZGRDbGllbnQgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoZSwgY2xpZW50KSB7XHJcbiAgICAgICAgICAgIGlmIChjbGllbnQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYWRkR2FtZU9iamVjdChjbGllbnQuZ2FtZU9iamVjdCwgMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIG9uUmVtb3ZlQ2xpZW50IDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGUsIGNsaWVudCkge1xyXG4gICAgICAgICAgICBpZiAoY2xpZW50KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZUdhbWVPYmplY3QoY2xpZW50LmdhbWVPYmplY3QsIDEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE5ldHdvcmtTY2VuZTsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBMb2FkaW5nU2NlbmUgPSByZXF1aXJlKCcuL0xvYWRpbmdTY2VuZS5qcycpO1xyXG52YXIgTG9iYnlTY2VuZSA9IHJlcXVpcmUoJy4vTG9iYnlTY2VuZS5qcycpO1xyXG52YXIgTmV0d29ya1NjZW5lID0gcmVxdWlyZSgnLi9OZXR3b3JrU2NlbmUuanMnKTtcclxudmFyIEdhbWVTY2VuZSA9IHJlcXVpcmUoJy4vR2FtZVNjZW5lLmpzJyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIExvYWRpbmdTY2VuZSA6IExvYWRpbmdTY2VuZSxcclxuICAgIExvYmJ5U2NlbmUgICA6IExvYmJ5U2NlbmUsXHJcbiAgICBOZXR3b3JrU2NlbmUgOiBOZXR3b3JrU2NlbmUsXHJcbiAgICBHYW1lU2NlbmUgICAgOiBHYW1lU2NlbmVcclxufTsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgQkdfVElMRSAgICA6IFwiLi9hc3NldHMvaW1nL0JHLXRpbGUxLnBuZ1wiLFxyXG4gICAgQkxPQ0tfRlVMTCA6IFwiLi9hc3NldHMvaW1nL0Jsb2NrRnVsbC5wbmdcIixcclxuICAgIFBMQVlFUiAgICAgOiBcIi4vYXNzZXRzL2ltZy9TaGlwLnBuZ1wiLFxyXG4gICAgQ0xJRU5UICAgICA6IFwiLi9hc3NldHMvaW1nL090aGVyU2hpcC5wbmdcIixcclxuICAgIFxyXG4gICAgLy8gUHJlbG9hZGVyIHJlcGxhY2VzIGdldHRlciB3aXRoIGFwcHJvcHJpYXRlIGRlZmluaXRpb25cclxuICAgIGdldCAgICAgICAgOiBmdW5jdGlvbiAocGF0aCkgeyB9XHJcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgQXNzZXRzID0gcmVxdWlyZSgnLi9Bc3NldHMuanMnKTtcclxuXHJcbnZhciBQcmVsb2FkZXIgPSBmdW5jdGlvbiAob25Db21wbGV0ZSkge1xyXG4gICAgLy8gU2V0IHVwIHByZWxvYWRlclxyXG5cdHRoaXMucXVldWUgPSBuZXcgY3JlYXRlanMuTG9hZFF1ZXVlKGZhbHNlKTtcclxuXHJcbiAgICAvLyBSZXBsYWNlIGRlZmluaXRpb24gb2YgQXNzZXQgZ2V0dGVyIHRvIHVzZSB0aGUgZGF0YSBmcm9tIHRoZSBxdWV1ZVxyXG4gICAgQXNzZXRzLmdldCA9IHRoaXMucXVldWUuZ2V0UmVzdWx0LmJpbmQodGhpcy5xdWV1ZSk7XHJcblxyXG4gICAgLy8gT25jZSBldmVyeXRoaW5nIGhhcyBiZWVuIHByZWxvYWRlZCwgc3RhcnQgdGhlIGFwcGxpY2F0aW9uXHJcbiAgICBpZiAob25Db21wbGV0ZSkge1xyXG4gICAgICAgIHRoaXMucXVldWUub24oXCJjb21wbGV0ZVwiLCBvbkNvbXBsZXRlKTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgbmVlZFRvTG9hZCA9IFtdO1xyXG5cclxuICAgIC8vIFByZXBhcmUgdG8gbG9hZCBpbWFnZXNcclxuICAgIGZvciAodmFyIGltZyBpbiBBc3NldHMpIHtcclxuICAgICAgICB2YXIgaW1nT2JqID0ge1xyXG4gICAgICAgICAgICBpZCA6IGltZyxcclxuICAgICAgICAgICAgc3JjIDogQXNzZXRzW2ltZ11cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIG5lZWRUb0xvYWQucHVzaChpbWdPYmopO1xyXG4gICAgfVxyXG5cclxuXHR0aGlzLnF1ZXVlLmxvYWRNYW5pZmVzdChuZWVkVG9Mb2FkKTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUHJlbG9hZGVyOyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIEFzc2V0cyA9IHJlcXVpcmUoJy4vQXNzZXRzLmpzJyk7XHJcbnZhciBQcmVsb2FkZXIgPSByZXF1aXJlKCcuL1ByZWxvYWRlci5qcycpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICBBc3NldHMgOiBBc3NldHMsXHJcbiAgICBQcmVsb2FkZXIgOiBQcmVsb2FkZXJcclxufTsiXX0=
