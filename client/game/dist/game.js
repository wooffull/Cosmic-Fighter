(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.cf = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var util = require('../util');
var Assets = util.Assets;
var GameObject = wfl.core.entities.GameObject;
var PhysicsObject = wfl.core.entities.PhysicsObject;
var geom = wfl.geom;

/**
 * Projectiles created from a Ship
 */
var Bullet = function (damage, creator) {
    if (isNaN(damage) || damage <= 0) {
        damage = 1;
    }

    PhysicsObject.call(this);

    this.creator = creator;
    this.customData.team = creator.customData.team;
    this.customData.ignoreFriction = true;

    // Create default state
    this.graphic1 = Assets.get(Assets.WEAK_BULLET_1);
    this.graphic2 = Assets.get(Assets.WEAK_BULLET_2);
    this.graphic3 = Assets.get(Assets.WEAK_BULLET_3);
    this.graphic4 = Assets.get(Assets.WEAK_BULLET_4);
    this.defaultState = this.createState();
    this.defaultState.addFrame(
        this.createFrame(this.graphic1, 2)
    );
    this.defaultState.addFrame(
        this.createFrame(this.graphic2, 2)
    );
    this.defaultState.addFrame(
        this.createFrame(this.graphic3, 2)
    );
    this.defaultState.addFrame(
        this.createFrame(this.graphic4, 2)
    );
    this.addState(GameObject.STATE.DEFAULT, this.defaultState);

    this.damage = damage;
    this.age = 0;
    this.lifeTime = Bullet.DEFAULT_MAX_LIFE_TIME;
    this.maxSpeed = Bullet.DEFAULT_MAX_SPEED;
    this.solid = true;
};
Object.defineProperties(Bullet, {
    DEFAULT_MAX_LIFE_TIME : {
        value : 40
    },

    DEFAULT_SPEED : {
        value : 0.65
    },

    DEFAULT_MAX_SPEED : {
        value : 0.8
    }
});
Bullet.prototype = Object.freeze(Object.create(PhysicsObject.prototype, {
    update : {
        value : function (dt) {
            PhysicsObject.prototype.update.call(this, dt);

            this.age++;

            if (this.age >= this.lifeTime) {
                this.customData.removed = true;
            }
        }
    },

    resolveCollision : {
        value : function (physObj, collisionData) {
            var team = this.customData.team;
            var otherTeam = physObj.customData.team;

            if (physObj !== this.creator && physObj.solid) {
                this.customData.removed = true;

                // If hitting something that's on a team (player, bullet,
                // etc)...
                if (otherTeam !== undefined) {
                    // If the bullet hits a player on a different team, deal
                    // damage to them
                    if (otherTeam !== team && physObj.takeDamage) {
                        physObj.takeDamage(this.damage);

                        // If killed the player, we'll make the cam follow this
                        // bullet's creator
                        if (physObj.health <= 0) {
                            physObj.customData.killer = this.creator;
                        }
                    }
                }
            }
        }
    }
}));
Object.freeze(Bullet);

module.exports = Bullet;
},{"../util":23}],2:[function(require,module,exports){
"use strict";

var util = require('../util');
var Assets = util.Assets;
var Player = require('./Player');
var LivingObject = wfl.core.entities.LivingObject;
var geom = wfl.geom;

var ClientPlayer = function (team) {
    Player.call(this, team);
};
Object.defineProperties(ClientPlayer, {
    MINIMAP_FILL_STYLE : {
        value : "#06c833"
    }
});
ClientPlayer.prototype = Object.freeze(Object.create(Player.prototype, {
    update : {
        value : function (dt) {
            LivingObject.prototype.update.call(this, dt);
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

            ctx.fillStyle = ClientPlayer.MINIMAP_FILL_STYLE;
            ctx.fillRect(offsetX, offsetY, displayWidth, displayHeight);

            ctx.restore();
        }
    },

    shoot : {
        value : function () { }
    },

    justShot : {
        value : function () { }
    }
}));
Object.freeze(ClientPlayer);

module.exports = ClientPlayer;
},{"../util":23,"./Player":4}],3:[function(require,module,exports){
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
},{"../util":23}],4:[function(require,module,exports){
"use strict";

var util = require('../util');
var Assets = util.Assets;
var Network = require('../network');
var GameObject = wfl.core.entities.GameObject;
var LivingObject = wfl.core.entities.LivingObject;
var geom = wfl.geom;

var Player = function (team) {
    LivingObject.call(this);

    this.customData.team = team;

    var shipType;
    if (team === 0) {
        shipType = Assets.SHIP_1;
    } else {
        shipType = Assets.SHIP_2;
    }

    // Create default state
    this.defaultGraphic = Assets.get(shipType);

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

    // Create explosion state
    this.explosionGraphic = Assets.get(Assets.EXPLOSION);
    this.explosionState = this.createState();

    frameObj = this.createFrame(this.explosionGraphic, 1, false);
    frameObj.vertices = verts;
    this.explosionState.addFrame(frameObj);
    this.addState(Player.STATE.EXPLOSION, this.explosionState);

    this.shootTimer = 0;
    this.maxShootTimer = Player.DEFAULT_MAX_SHOOT_TIMER;

    this.health = Network.localClient.data.health;
    this.maxHealth = Network.localClient.data.health;

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
    },

    DEFAULT_MAX_SHOOT_TIMER : {
        value : 20
    },

    STATE : {
        value : {
            EXPLOSION : "explosion"
        }
    }
});
Player.prototype = Object.freeze(Object.create(LivingObject.prototype, {
    update : {
        value : function (dt) {
            LivingObject.prototype.update.call(this, dt);

            // Update shoot timer when just shot
            if (this.justShot()) {
                this.shootTimer++;

                if (this.shootTimer >= this.maxShootTimer) {
                    this.shootTimer = 0;
                }
            }

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
    },

    shoot : {
        value : function () {
            if (!this.justShot()) {
                this.shootTimer = 1;

                if (Network.connected) {
                    Network.socket.emit('bullet', {
                        position     : this.position,
                        velocity     : this.velocity,
                        acceleration : this.acceleration,
                        rotation     : this.getRotation()
                    });
                }
            }
        }
    },

    justShot : {
        value : function () {
            return (this.shootTimer > 0);
        }
    },

    resolveCollision : {
        value : function (physObj, collisionData) {
            var team = this.customData.team;
            var otherTeam = physObj.customData.team;

            // If hitting something that's not on this team
            if (otherTeam === undefined || otherTeam !== team || physObj.takeDamage) {
                LivingObject.prototype.resolveCollision.call(this, physObj, collisionData);
            }
        }
    }
}));
Object.freeze(Player);

module.exports = Player;
},{"../network":9,"../util":23}],5:[function(require,module,exports){
"use strict";

var FullBlock = require('./FullBlock.js');
var Player = require('./Player.js');
var ClientPlayer = require('./ClientPlayer.js');
var Bullet = require('./Bullet.js');

module.exports = {
    FullBlock    : FullBlock,
    Player       : Player,
    ClientPlayer : ClientPlayer,
    Bullet       : Bullet
};
},{"./Bullet.js":1,"./ClientPlayer.js":2,"./FullBlock.js":3,"./Player.js":4}],6:[function(require,module,exports){
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

// Stop the game so that canvas updates don't affect performance with
// overlays
game.stop();

// Draw initial black BG on canvas
var ctx = canvas.getContext("2d");
ctx.fillStyle = "#040B0C";
ctx.fillRect(0, 0, canvas.width, canvas.height);

var onLoad = function () {
    $(Network).on(
        Network.Event.CONNECT,
        onNetworkConnect
    );

    Network.init();
};

var goToGame = function (room) {
    // Update the game with the current time because the dt will be huge next
    // update since the game was stopped while in the lobby
    game.update(Date.now());

    $(game.getScene()).off();

    var gameScene = new scenes.GameScene(canvas, room);
    game.setScene(gameScene);

    $(Network).on(
        Network.Event.END_GAME,
        onEndGame
    );

    // If the player receives data for game over before they actually load the
    // gave over screen, skip immediately to the game over screen (because only
    // the host would send that data)
    $(Network).on(
        Network.Event.GAME_OVER_DATA,
        room,
        onGetGameOverData
    );

    // Start the game since it was stopped to help performance with overlays on
    // a canvas
    game.start();
};

var goToLobby = function () {
    // Draw black over the canvas
    ctx.fillStyle = "#040B0C";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Stop the game so that canvas updates don't affect performance with
    // overlays
    game.stop();

    $(game.getScene()).off();

    // Reset all listeners on the Network
    $(Network).off();

    var lobbyScene = new scenes.LobbyScene(canvas);
    game.setScene(lobbyScene);

    $(Network).on(
        Network.Event.START_GAME,
        onStartGame
    );

    // Transition the page's BG color to black to hide the BG image which
    // becomes distracting during game play
    $("body").css({"background-color": "#071213"});
};

var goToGameOver = function (room) {
    // Stop the game so that canvas updates don't affect performance with
    // overlays
    game.stop();

    // Reset all listeners on the Network
    $(Network).off();

    var gameOverScene = new scenes.GameOverScene(canvas, room);
    game.setScene(gameOverScene);

    $(gameOverScene).on(
        scenes.GameOverScene.Event.RETURN_TO_LOBBY,
        onGameOverToLobby
    );
};

var onStartGame = function (e, room) {
    goToGame(room);
};

var onEndGame = function (e, room) {
    goToGameOver(room);
};

var onGetGameOverData = function (e, gameOverData) {
    goToGameOver(e.data);
    game.getScene()._onUpdateScore(gameOverData);
};

var onGameOverToLobby = function (e, room) {
    goToLobby();

    // Trigger an event so the lobby scene knows to join the room it was just
    // in before playing the game
    Network._onEnterRoomSuccess(room);
};

var onNetworkConnect = function () {
    goToLobby();
};

var Preloader = new util.Preloader(onLoad.bind(this));
},{"./network":9,"./overlays":15,"./scenes":20,"./util":23}],7:[function(require,module,exports){
"use strict";

var entities = require('../entities');

var Client = function (id, data) {
    this.id = id;
    this.data = data;
    this.gameObject = undefined;
};
Object.freeze(Client);

module.exports = Client;
},{"../entities":5}],8:[function(require,module,exports){
"use strict";

var entities = require('../entities');

var LocalClient = function (id, data) {
    this.id = id;
    this.data = data;
    this.gameObject = undefined;
};
Object.freeze(LocalClient);

module.exports = LocalClient;
},{"../entities":5}],9:[function(require,module,exports){
"use strict";

var Network = {
    socket      : undefined,
    localClient : {},
    clients     : {},
    rooms       : {},
    connected   : false,
    hostId      : -1,

    // Events for external entities to subscribe to
    Event       : {
        CONNECT            : "connect",
        UPDATE_ROOMS       : "updateRooms",
        ENTER_ROOM_SUCCESS : "enterRoomSuccess",
        ENTER_ROOM_FAIL    : "enterRoomFail",
        PLAY               : "play",
        START_GAME         : "startGame",
        END_GAME           : "endGame",
        PLAYER_DEATH       : "playerDeath",
        PLAYER_RESPAWN     : "playerRespawn",
        BULLET             : "bullet",
        CLOCK_TICK         : "clockTick",
        COUNTDOWN          : "countdown",
        GAME_OVER_DATA     : "gameOverData"
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
        this.socket.on('ping', this._onPing.bind(this));
        this.socket.on('setHost', this._onSetHost.bind(this));
        this.socket.on('startGame', this._onStartGame.bind(this));
        this.socket.on('endGame', this._onEndGame.bind(this));
        this.socket.on('playerDeath', this._onPlayerDeath.bind(this));
        this.socket.on('playerRespawn', this._onPlayerRespawn.bind(this));
        this.socket.on('bullet', this._onBullet.bind(this));
        this.socket.on('countdown', this._onCountdown.bind(this));
        this.socket.on('clockTick', this._onClockTick.bind(this));
        this.socket.on('gameOverData', this._onGameOverData.bind(this));

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

    enterRoom : function (roomId) {
        this.socket.emit('enterRoom', roomId);
    },

    leaveRoom : function (roomId) {
        this.socket.emit('leaveRoom', roomId);
    },

    switchTeam : function (roomId) {
        this.socket.emit('switchTeam', roomId);
    },

    isHost : function () {
        return this.hostId === this.localClient.id;
    },

    _onConfirmClient : function (data) {
        var id = data.id;
        this.localClient = new LocalClient(id, data);
        this.clients[id] = this.localClient;

        this.connected = true;

        $(this).trigger(
            this.Event.CONNECT
        );
    },

    _onAddOtherClient : function (data) {
        var id = data.id;
        var newClient = new Client(id, data);

        this.clients[data.id] = newClient;
    },

    _onRemoveOtherClient : function (data) {
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

        if (client.gameObject) {
            client.gameObject.position.x = data.position.x;
            client.gameObject.position.y = data.position.y;
            client.gameObject.velocity.x = data.velocity.x;
            client.gameObject.velocity.y = data.velocity.y;
            client.gameObject.acceleration.x = data.acceleration.x;
            client.gameObject.acceleration.y = data.acceleration.y;
            client.gameObject.setRotation(data.rotation);
        }
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
    },

    _onPing : function (pingObj) {
        if (pingObj) {
            this.socket.emit('returnPing', pingObj);
        }
    },

    _onSetHost : function (data) {
        this.hostId = data.id;
    },

    _onStartGame : function (data) {
        $(this).trigger(
            this.Event.START_GAME,
            data
        );
    },

    _onEndGame : function (data) {
        var room = this.rooms[data.id];

        for (var i = 0; i < room.players.length; i++) {
            this.clients[room.players[i]].data.ready = false;
        }

        this.localClient.data.ready = false;

        $(this).trigger(
            this.Event.END_GAME,
            data
        );
    },

    _onPlayerDeath : function (data) {
        $(this).trigger(
            this.Event.PLAYER_DEATH,
            data
        );
    },

    _onPlayerRespawn : function (data) {
        $(this).trigger(
            this.Event.PLAYER_RESPAWN,
            data
        );
    },

    _onBullet : function (data) {
        $(this).trigger(
            this.Event.BULLET,
            data
        );
    },

    _onCountdown : function (data) {
        $(this).trigger(
            this.Event.COUNTDOWN,
            data
        );
    },

    _onClockTick : function (data) {
        $(this).trigger(
            this.Event.CLOCK_TICK,
            data
        );
    },

    _onGameOverData : function (data) {
        $(this).trigger(
            this.Event.GAME_OVER_DATA,
            data
        );
    }
};

module.exports = Network;

var Client = require('./Client.js');
var LocalClient = require('./LocalClient.js');
},{"./Client.js":7,"./LocalClient.js":8}],10:[function(require,module,exports){
"use strict";

var Overlay = require('./Overlay.js');

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
},{"./Overlay.js":14}],11:[function(require,module,exports){
"use strict";

var Overlay = require('./Overlay.js');
var Network = require('../network');

var GameOverOverlay = function () {
    Overlay.call(this);

    this.resultsLabel = $("<div>");
    this.resultsLabel.html("Results");
    this.resultsLabel.addClass("game-over-overlay-results-label");

    this.teamAContainer = $("<div>");
    this.teamAContainer.addClass("lobby-overlay-teamA-container");

    this.teamBContainer = $("<div>");
    this.teamBContainer.addClass("lobby-overlay-teamB-container");

    this.returnToLobbyBtn = $("<button>");
    this.returnToLobbyBtn.text("Return to Lobby");
    this.returnToLobbyBtn.addClass("game-over-overlay-return-to-lobby-button");

    this.domObject.append(this.resultsLabel);
    this.domObject.append(this.loadingIcon);
    this.domObject.append(this.teamAContainer);
    this.domObject.append(this.teamBContainer);
    this.domObject.append(this.returnToLobbyBtn);

    this.domObject.addClass("game-over-overlay");
    this.domObject.addClass("fade-in");

    this.renderScore();
};

GameOverOverlay.prototype = Object.freeze(Object.create(Overlay.prototype, {
    renderScore : {
        value : function (roomData) {
            this.teamAContainer.html("");
            this.teamBContainer.html("");

            var teamALabel = $("<span>");
            teamALabel.html("Rose Team");
            teamALabel.addClass("game-over-overlay-team-label");

            var teamAKillLabel = $("<span>");
            teamAKillLabel.html("K");
            teamAKillLabel.addClass("game-over-overlay-team-kill-label");

            var teamADeathLabel = $("<span>");
            teamADeathLabel.html("D");
            teamADeathLabel.addClass("game-over-overlay-team-death-label");

            this.teamAContainer.append(teamALabel);
            this.teamAContainer.append(teamAKillLabel);
            this.teamAContainer.append(teamADeathLabel);

            var teamBLabel = $("<span>");
            teamBLabel.html("Sky Team");
            teamBLabel.addClass("game-over-overlay-team-label");

            var teamBKillLabel = $("<span>");
            teamBKillLabel.html("K");
            teamBKillLabel.addClass("game-over-overlay-team-kill-label");

            var teamBDeathLabel = $("<span>");
            teamBDeathLabel.html("D");
            teamBDeathLabel.addClass("game-over-overlay-team-death-label");

            this.teamBContainer.append(teamBLabel);
            this.teamBContainer.append(teamBKillLabel);
            this.teamBContainer.append(teamBDeathLabel);

            if (!roomData) {
                var teamALoadingContainer = $("<div>");
                teamALoadingContainer.html("Loading...");
                teamALabel.append(teamALoadingContainer);

                var teamBLoadingContainer = $("<div>");
                teamBLoadingContainer.html("Loading...");
                teamBLabel.append(teamBLoadingContainer);

                return;
            }

            var teamA = roomData.teamA;
            var teamB = roomData.teamB;
            var localId = Network.localClient.id;

            var teamANameContainer = $("<span>");
            var teamAKillsContainer = $("<span>");
            var teamADeathsContainer = $("<span>");
            teamANameContainer.addClass("game-over-overlay-name-container");
            teamAKillsContainer.addClass("game-over-overlay-kills-container");
            teamADeathsContainer.addClass("game-over-overlay-deaths-container");

            var teamBNameContainer = $("<span>");
            var teamBKillsContainer = $("<span>");
            var teamBDeathsContainer = $("<span>");
            teamBNameContainer.addClass("game-over-overlay-name-container");
            teamBKillsContainer.addClass("game-over-overlay-kills-container");
            teamBDeathsContainer.addClass("game-over-overlay-deaths-container");

            // Add team A players
            for (var i = 0; i < 4; i++) {
                var label;
                var kills;
                var deaths;
                var playerContainer = $("<div>");
                var killsContainer = $("<div>");
                var deathsContainer = $("<div>");

                if (i < teamA.length) {
                    var curPlayer = teamA[i];
                    label = curPlayer.user;
                    kills = curPlayer.kills;
                    deaths = curPlayer.deaths;

                    if (curPlayer.id === localId) {
                        playerContainer.addClass("lobby-overlay-local-player-container");
                    }
                } else {
                    label = "------";
                    kills = "-";
                    deaths = "-";
                }

                playerContainer.html(label);
                killsContainer.html(kills);
                deathsContainer.html(deaths);
                teamANameContainer.append(playerContainer);
                teamAKillsContainer.append(killsContainer);
                teamADeathsContainer.append(deathsContainer);
            }

            this.teamAContainer.append(teamANameContainer);
            this.teamAContainer.append(teamAKillsContainer);
            this.teamAContainer.append(teamADeathsContainer);

            // Add team B players
            for (var i = 0; i < 4; i++) {
                var label;
                var kills;
                var deaths;
                var playerContainer = $("<div>");
                var killsContainer = $("<div>");
                var deathsContainer = $("<div>");

                if (i < teamB.length) {
                    var curPlayer = teamB[i];
                    label = curPlayer.user;
                    kills = curPlayer.kills;
                    deaths = curPlayer.deaths;

                    if (curPlayer.id === localId) {
                        playerContainer.addClass("lobby-overlay-local-player-container");
                    }
                } else {
                    label = "------";
                    kills = "-";
                    deaths = "-";
                }

                playerContainer.html(label);
                killsContainer.html(kills);
                deathsContainer.html(deaths);
                teamBNameContainer.append(playerContainer);
                teamBKillsContainer.append(killsContainer);
                teamBDeathsContainer.append(deathsContainer);
            }

            this.teamBContainer.append(teamBNameContainer);
            this.teamBContainer.append(teamBKillsContainer);
            this.teamBContainer.append(teamBDeathsContainer);
        }
    }
}));

module.exports = GameOverOverlay;
},{"../network":9,"./Overlay.js":14}],12:[function(require,module,exports){
"use strict";

var Overlay = require('./Overlay.js');

var LoadingOverlay = function () {
    Overlay.call(this);
    
    this.domObject.addClass("loading-overlay-bg");
    
    this.loadingIcon = $("<div>");
    this.loadingIcon.addClass("loading-overlay");
    
    this.domObject.append(this.loadingIcon);
};

LoadingOverlay.prototype = Object.freeze(Object.create(Overlay.prototype, {

}));

module.exports = LoadingOverlay;
},{"./Overlay.js":14}],13:[function(require,module,exports){
"use strict";

var Overlay = require('./Overlay.js');
var Network = require('../network');

var LobbyOverlay = function () {
    Overlay.call(this);

    // Set up left side
    this.leftContainer = $("<span>");
    this.leftContainer.addClass("lobby-overlay-left");
    this.leftContainer.addClass("lobby-overlay-maximized-side");

    this.roomButtonContainer = $("<div>");
    this.roomButtonContainer.addClass("lobby-overlay-button-container");
    this.leftContainer.append(this.roomButtonContainer);

    this.selectRoomLabel = $("<div>");
    this.selectRoomLabel.html("Select or create room");
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
    this.rightContainer.addClass("lobby-overlay-minimized-side");

    this.selectedRoomLabel = $("<div>");
    this.selectedRoomLabel.addClass("lobby-overlay-room-label-container");

    this.renderRoomLabel();
    this.rightContainer.append(this.selectedRoomLabel);

    this.switchTeamBtn = $("<button>");
    this.switchTeamBtn.text("Switch Teams");
    this.switchTeamBtn.addClass("lobby-overlay-switch-team-btn");

    this.teamAContainer = $("<div>");
    this.teamAContainer.addClass("lobby-overlay-teamA-container");

    this.teamBContainer = $("<div>");
    this.teamBContainer.addClass("lobby-overlay-teamB-container");

    this.renderPlayers();

    this.rightContainer.append(this.teamAContainer);
    this.rightContainer.append(this.switchTeamBtn);
    this.rightContainer.append(this.teamBContainer);

    this.leaveRoomBtn = $("<button>");
    this.leaveRoomBtn.text("Leave Room");
    this.leaveRoomBtn.addClass("lobby-overlay-leave-room-btn");
    this.leaveRoomBtn.hide();
    this.rightContainer.append(this.leaveRoomBtn);

    this.readyBtn = $("<button>");
    this.readyBtn.text("Ready");
    this.readyBtn.addClass("lobby-overlay-ready-btn");
    this.readyBtn.hide();
    this.rightContainer.append(this.readyBtn);

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

                this._onExitRoom();
            } else {
                this.renderRoomLabel(data.name);
                this.renderPlayers(data);

                this._onEnterRoom();
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
        value : function (roomData) {
            this.teamAContainer.html("");
            this.teamBContainer.html("");
            this.switchTeamBtn.hide();

            if (roomData !== undefined) {
                var teamA = roomData.teamA;
                var teamB = roomData.teamB;

                var teamALabel = $("<div>");
                teamALabel.html("Rose Team");
                teamALabel.addClass("lobby-overlay-team-label");
                this.teamAContainer.append(teamALabel);

                var teamBLabel = $("<div>");
                teamBLabel.html("Sky Team");
                teamBLabel.addClass("lobby-overlay-team-label");
                this.teamBContainer.append(teamBLabel);

                var localId = Network.localClient.id;

                // Add team A players
                for (var i = 0; i < 4; i++) {
                    var label;
                    var playerContainer = $("<div>");
                    var ready = false;

                    if (i < teamA.length) {
                        var curId = teamA[i];
                        var curPlayer = Network.clients[curId];
                        ready = curPlayer.data.ready;
                        label = curPlayer.data.user;

                        if (curId === localId) {
                            playerContainer.addClass("lobby-overlay-local-player-container");

                            if (!ready) {
                                this.readyBtn.html("Ready");
                                this.switchTeamBtn.prop("disabled", false);
                            } else {
                                this.readyBtn.html("Cancel");
                                this.switchTeamBtn.prop("disabled", true);
                            }
                        }
                    } else {
                        label = "------";
                    }

                    playerContainer.html(label);
                    this.teamAContainer.append(playerContainer);

                    if (ready) {
                        var readyContainer = $("<span>");
                        readyContainer.html("Ready");
                        readyContainer.addClass("lobby-overlay-ready-container");
                        playerContainer.append(readyContainer);
                    }
                }

                // Add team B players
                for (var i = 0; i < 4; i++) {
                    var label;
                    var playerContainer = $("<div>");
                    var ready = false;

                    if (i < teamB.length) {
                        var curId = teamB[i];
                        var curPlayer = Network.clients[curId];
                        ready = curPlayer.data.ready;
                        label = curPlayer.data.user;

                        if (curId === localId) {
                            playerContainer.addClass("lobby-overlay-local-player-container");

                            if (!ready) {
                                this.readyBtn.html("Ready");
                                this.switchTeamBtn.prop("disabled", false);
                            } else {
                                this.readyBtn.html("Cancel");
                                this.switchTeamBtn.prop("disabled", true);
                            }
                        }
                    } else {
                        label = "------";
                    }

                    playerContainer.html(label);
                    this.teamBContainer.append(playerContainer);

                    if (ready) {
                        var readyContainer = $("<span>");
                        readyContainer.html("Ready");
                        readyContainer.addClass("lobby-overlay-ready-container");
                        playerContainer.append(readyContainer);
                    }
                }

                this.switchTeamBtn.show();
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
    },

    _onExitRoom : {
        value : function () {
            this.leaveRoomBtn.hide();
            this.readyBtn.hide();

            this.leftContainer.removeClass("lobby-overlay-minimized-side");
            this.rightContainer.removeClass("lobby-overlay-maximized-side");

            this.leftContainer.addClass("lobby-overlay-maximized-side");
            this.rightContainer.addClass("lobby-overlay-minimized-side");
        }
    },

    _onEnterRoom : {
        value : function () {
            this.leaveRoomBtn.show();
            this.readyBtn.show();

            this.leftContainer.removeClass("lobby-overlay-maximized-side");
            this.rightContainer.removeClass("lobby-overlay-minimized-side");

            this.leftContainer.addClass("lobby-overlay-minimized-side");
            this.rightContainer.addClass("lobby-overlay-maximized-side");
        }
    }
}));

Object.freeze(LobbyOverlay);

module.exports = LobbyOverlay;
},{"../network":9,"./Overlay.js":14}],14:[function(require,module,exports){
"use strict";

var Overlay = function () {
    this.domObject = $("<div>");
    this.domObject.addClass("canvas-overlay");
};

Overlay.prototype = Object.freeze(Object.create(Overlay.prototype, {

}));

module.exports = Overlay;
},{}],15:[function(require,module,exports){
"use strict";

var Overlay = require('./Overlay.js');
var LoadingOverlay = require('./LoadingOverlay.js');
var CreateRoomOverlay = require('./CreateRoomOverlay.js');
var GameOverOverlay = require('./GameOverOverlay.js');
var LobbyOverlay = require('./LobbyOverlay.js');

module.exports = {
    Overlay : Overlay,
    LoadingOverlay : LoadingOverlay,
    CreateRoomOverlay : CreateRoomOverlay,
    GameOverOverlay : GameOverOverlay,
    LobbyOverlay : LobbyOverlay
};
},{"./CreateRoomOverlay.js":10,"./GameOverOverlay.js":11,"./LoadingOverlay.js":12,"./LobbyOverlay.js":13,"./Overlay.js":14}],16:[function(require,module,exports){
"use strict";

var Scene = wfl.display.Scene;
var overlays = require('../overlays');
var Network = require('../network');

var GameOverScene = function (canvas, room) {
    Scene.call(this, canvas);

    this.room = room;

    $(Network).on(Network.Event.GAME_OVER_DATA, this._onUpdateScore.bind(this));

    if (Network.isHost()) {
        Network.socket.emit(Network.Event.GAME_OVER_DATA, room.id);
    }

    this.gameOverOverlay = new overlays.GameOverOverlay();
    $(canvas).parent().append(this.gameOverOverlay.domObject);

    this.loadingOverlay = new overlays.LoadingOverlay();
    $(canvas).parent().append(this.loadingOverlay.domObject);

    this.gameOverOverlay.returnToLobbyBtn.click(this._onReturnToLobby.bind(this));
};
Object.defineProperties(GameOverScene, {
    Event : {
        value : {
            RETURN_TO_LOBBY : "returnToLobby"
        }
    }
});
GameOverScene.prototype = Object.freeze(Object.create(Scene.prototype, {
    destroy : {
        value : function () {
            this.gameOverOverlay.domObject.remove();
            this.loadingOverlay.domObject.remove();
        }
    },

    _onUpdateScore : {
        value : function (e, data) {
            this.loadingOverlay.domObject.remove();
            this.gameOverOverlay.renderScore(data);
        }
    },

    _onReturnToLobby : {
        value : function (e) {
            $(this).trigger(
                GameOverScene.Event.RETURN_TO_LOBBY,
                this.room
            );
        }
    }
}));
Object.freeze(GameOverScene);

module.exports = GameOverScene;
},{"../network":9,"../overlays":15}],17:[function(require,module,exports){
"use strict";

var util = require('../util');
var Assets = util.Assets;
var Scene = wfl.display.Scene;
var Network = require('../network');
var GameObject = wfl.core.entities.GameObject;
var PhysicsObject = wfl.core.entities.PhysicsObject;
var entities = require('../entities');
var Bullet = entities.Bullet;
var ClientPlayer = entities.ClientPlayer;
var FullBock = entities.FullBlock;
var Player = entities.Player;
var backgrounds = wfl.display.backgrounds;
var geom = wfl.geom;

var GameScene = function (canvas, room) {
    Scene.call(this, canvas, room);

    // Add other clients that are already connected
    var room = Network.rooms[room.id];
    var players = room.players;

    for (var i = 0; i < players.length; i++) {
        var id = players[i];
        var client = Network.clients[id];

        if (client !== Network.localClient) {
            var gameObject = new ClientPlayer(client.data.team);
            client.gameObject = gameObject;
            client.gameObject.customData.clientId = client.data.id;
            this.addGameObject(gameObject, 1);
        }
    }

    $(Network).on(
        Network.Event.BULLET,
        this.onBullet.bind(this)
    );

    $(Network).on(
        Network.Event.CLOCK_TICK,
        this.onClockTick.bind(this)
    );

    $(Network).on(
        Network.Event.COUNTDOWN,
        this.onCountdown.bind(this)
    );

    $(Network).on(
        Network.Event.PLAYER_DEATH,
        this.onPlayerDeath.bind(this)
    );

    $(Network).on(
        Network.Event.PLAYER_RESPAWN,
        this.onPlayerRespawn.bind(this)
    );

    this.timeRemaining = room.timeRemaining;
    this.initialCountdown = room.countdown;
    this.countingDown = true;
    this.respawnTime = room.respawnTime;
    this.respawnTimeRemaining = this.respawnTime;

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

    this.player = new Player(Network.localClient.data.team);

    Network.localClient.gameObject = this.player;
    this.player.customData.clientId = Network.localClient.data.id;
    this.addGameObject(this.player, 2);

    this.camera.follow(this.player);
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
GameScene.prototype = Object.freeze(Object.create(Scene.prototype, {
    /**
     * Updates the scene and all game objects in it
     */
    update : {
        value : function (dt) {
            if (this.countingDown === true) {
                this.initialCountdown -= dt;

                if (Network.isHost()) {
                    this.sendCountdown();
                }

                if (this.initialCountdown <= 0) {
                    this.countingDown = false;
                }
            } else {
                Scene.prototype.update.call(this, dt);

                this.timeRemaining -= dt;

                // Make the camera follow the killer if the player was killed
                if (this.player.health === 0) {
                    this._handlePlayerDeath(dt);

                // Otherwise, allow the player to move
                } else {
                    this._handleInput();
                }

                this._applyFriction();
                this._removeDeadGameObjects();

                if (Network.isHost()) {
                    this.sendClockTick();
                }
            }
        }
    },

    sendCountdown : {
        value : function () {
            if (Network.connected) {
                Network.socket.emit('countdown', {
                    countdown : this.initialCountdown
                });
            }
        }
    },

    sendClockTick : {
        value : function () {
            if (Network.connected) {
                Network.socket.emit('clockTick', {
                    timeRemaining : this.timeRemaining
                });
            }
        }
    },

    sendPlayerDeath : {
        value : function () {
            if (Network.connected) {
                Network.socket.emit('playerDeath', {
                    dead : this.player.customData.clientId,
                    killer : this.player.customData.killer.customData.clientId
                });
            }
        }
    },

    /**
     * Draws the scene and all game objects in it
     */
    draw : {
        value : function (ctx) {
            Scene.prototype.draw.call(this, ctx);

            ctx.save();

            var screenWidth  = ctx.canvas.width;
            var screenHeight = ctx.canvas.height;
            var offset       = new geom.Vec2(
                screenWidth  * 0.5,
                screenHeight * 0.5
            );

            ctx.fillStyle = "#fff";
            ctx.font = "24px Munro";

            // Show the remaining duration of the game
            var timeText;
            if (this.timeRemaining > 0) {
                var minutes = Math.floor((this.timeRemaining + 999) / (1000 * 60));
                var seconds = Math.round((this.timeRemaining - minutes * 1000 * 60) / 1000);
                timeText = minutes + ":";

                if (seconds < 10) {
                    timeText += "0";
                }

                timeText += seconds;
            } else {
                timeText = "0:00";
            }

            if (this.timeRemaining < 1000 * 10) {
                if (this.timeRemaining % 500 < 250) {
                    ctx.fillStyle = "rgb(255, 79, 79)";
                } else {
                    ctx.fillStyle = "rgba(0, 0, 0, 0)";
                }
                ctx.font = "30px Munro";
            } else if (this.timeRemaining < 1000 * 30) {
                ctx.fillStyle = "rgb(241, 208, 92)";
            }

            ctx.translate(offset.x, 0);
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            ctx.fillText(timeText, 0, 0);

            // Show the initial countdown before the game
            if (this.initialCountdown > 0) {
                var countdownSeconds = Math.round(this.initialCountdown / 1000);
                var countdownText = countdownSeconds.toString();
                ctx.fillStyle = "#fff";

                switch (countdownSeconds) {
                default:
                case 5:
                    ctx.fillStyle = "rgb(255, 79, 79)";
                    break;

                case 4:
                    ctx.fillStyle = "rgb(247, 155, 87)";
                    break;

                case 3:
                    ctx.fillStyle = "rgb(241, 208, 92)";
                    break;

                case 2:
                    ctx.fillStyle = "rgb(215, 235, 99)";
                    break;

                case 1:
                    ctx.fillStyle = "rgb(132, 231, 103)";
                    break;

                case 0:
                    countdownText = "FIGHT";
                    ctx.fillStyle = "#fff";
                    break;
                }

                ctx.translate(0, offset.y);
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.font = "96px Munro";
                ctx.fillText(countdownText, 0, 0);
            }

            ctx.restore();

            // Draw HP
            ctx.save();

            ctx.translate(4, 4);

            for (var i = 0; i < this.player.maxHealth; i++) {
                var graphic;
                if (this.player.health > i) {
                    graphic = Assets.get(Assets.HP_FULL);
                } else {
                    graphic = Assets.get(Assets.HP_EMPTY);
                }

                ctx.drawImage(graphic, 0, 0);
                ctx.translate(24, 0);
            }

            ctx.restore();

            // Draw Respawn message if necessary
            if (this.player.health <= 0) {
                ctx.save();

                var respawnTimeRemaining = Math.round(this.respawnTimeRemaining / 1000);
                var respawnMessage = "Respawn in " + respawnTimeRemaining.toString() + " seconds";

                ctx.translate(offset.x, offset.y);
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.font = "48px Munro";
                ctx.fillStyle = "#fff";
                ctx.fillText(respawnMessage, 0, 0);

                ctx.restore();
            }
        }
    },

    onCountdown : {
        value : function (e, data) {
            this.initialCountdown = data.countdown;
        }
    },

    onClockTick : {
        value : function (e, data) {
            this.timeRemaining = data.timeRemaining;
        }
    },

    onBullet : {
        value : function (e, data) {
            var rotation = PhysicsObject.prototype.getDisplayAngle(data.rotation);
            var forward = geom.Vec2.fromAngle(rotation);
            var player = Network.clients[data.playerId].gameObject;
            var bullet = new Bullet(1, player);
            bullet.position.x = data.position.x;
            bullet.position.y = data.position.y;
            bullet.velocity.x = forward.x;
            bullet.velocity.y = forward.y;
            bullet.rotate(rotation);
            bullet.velocity.multiply(Bullet.DEFAULT_SPEED);
            bullet.velocity.x += data.velocity.x;
            bullet.velocity.y += data.velocity.y;

            if (bullet.velocity.getMagnitudeSquared() < Bullet.DEFAULT_SPEED * Bullet.DEFAULT_SPEED) {
                bullet.velocity.setMagnitude(Bullet.DEFAULT_SPEED);
            }

            this.addGameObject(bullet, 1);
        }
    },

    onPlayerDeath : {
        value : function (e, data) {
            var player = Network.clients[data.dead].gameObject;
            player.solid = false;
            player.setState(Player.STATE.EXPLOSION);
        }
    },

    onPlayerRespawn : {
        value : function (e, data) {
            var player = Network.clients[data.respawn].gameObject;
            player.setState(GameObject.STATE.DEFAULT);
            player.health = player.maxHealth;
            player.solid = true;

            // If this client's player is respawning, then make the camera
            // start following it again
            if (player === this.player) {
                this.camera.follow(player);
            }
        }
    },

    _handleInput : {
        value : function () {
            var player       = this.player;
            var keyboard     = this.keyboard;
            var leftPressed  = keyboard.isPressed(keyboard.LEFT);
            var rightPressed = keyboard.isPressed(keyboard.RIGHT);
            var upPressed    = keyboard.isPressed(keyboard.UP);
            var downPressed  = keyboard.isPressed(keyboard.DOWN);
            var shooting     = keyboard.isPressed(keyboard.Z);

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

            if (shooting) {
                player.shoot();
            }
        }
    },

    _handlePlayerDeath : {
        value : function (dt) {
            if (this.player.customData.killer) {
                this.sendPlayerDeath();

                this.camera.follow(this.player.customData.killer);

                this.player.customData.killer = undefined;
                this.player.setState(Player.STATE.EXPLOSION);

                this.respawnTimeRemaining = this.respawnTime;
            }

            this.respawnTimeRemaining -= dt;
        }
    },

    _applyFriction : {
        value : function () {
            var gameObjects = this.getGameObjects();

            for (var i = 0; i < gameObjects.length; i++) {
                var obj = gameObjects[i];
                if (!obj.customData.ignoreFriction) {
                    obj.acceleration.multiply(GameScene.FRICTION);
                    obj.velocity.multiply(GameScene.FRICTION);
                }
            }
        }
    },

    _removeDeadGameObjects : {
        value : function () {
            var gameObjects = this.getGameObjects();

            // Go through all game objects and remove any that have been
            // flagged for removal
            for (var i = gameObjects.length - 1; i >= 0; i--) {
                var obj = gameObjects[i];

                if (obj.customData.removed === true) {
                    this.removeGameObject(obj);
                }
            }
        }
    }
}));

module.exports = GameScene;
},{"../entities":5,"../network":9,"../util":23}],18:[function(require,module,exports){
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
},{"../overlays":15}],19:[function(require,module,exports){
"use strict";

var Scene = wfl.display.Scene;
var overlays = require('../overlays');
var Network = require('../network');

var LobbyScene = function (canvas) {
    Scene.call(this, canvas);

    this.curRoomId = undefined;

    this.lobbyOverlay = new overlays.LobbyOverlay();
    this.createRoomOverlay = new overlays.CreateRoomOverlay();
    $(canvas).parent().append(this.lobbyOverlay.domObject);
    $(canvas).parent().append(this.createRoomOverlay.domObject);

    this.createRoomOverlay.domObject.hide();

    this.lobbyOverlay.leaveRoomBtn.click(this._onLeaveRoomButtonClick.bind(this));
    this.lobbyOverlay.readyBtn.click(this._onReadyButtonClick.bind(this));
    this.lobbyOverlay.switchTeamBtn.click(this._onSwitchTeamButtonClick.bind(this));
    this.lobbyOverlay.createRoomBtn.click(this._onCreateRoomButtonClick.bind(this));

    this.createRoomOverlay.cancelBtn.click(this._onCreateRoomCancel.bind(this));
    this.createRoomOverlay.createBtn.click(this._onCreateRoom.bind(this));

    $(this.lobbyOverlay).on(overlays.LobbyOverlay.Event.ENTER_ROOM, this._onEnterRoomAttempt.bind(this));

    $(Network).on(Network.Event.UPDATE_ROOMS, this._onUpdateRoomList.bind(this));
    $(Network).on(Network.Event.ENTER_ROOM_SUCCESS, this._onEnterRoomSuccess.bind(this));
    $(Network).on(Network.Event.ENTER_ROOM_FAIL, this._onEnterRoomFail.bind(this));

    this.roomUpdateInterval =
        setInterval(this.updateRoomList.bind(this), LobbyScene.ROOM_UPDATE_FREQUENCY);

    this.updateRoomList();
};

Object.defineProperties(LobbyScene, {
    ROOM_UPDATE_FREQUENCY : {
        value : 5000
    },

    Event : {
        value : {
            TOGGLE_READY : "toggleReady"
        }
    }
});

LobbyScene.prototype = Object.freeze(Object.create(Scene.prototype, {
    destroy : {
        value : function () {
            this.lobbyOverlay.domObject.remove();
            this.createRoomOverlay.domObject.remove();
            this.createRoomOverlay.inputField.off("keypress");
            clearInterval(this.roomUpdateInterval);
            $(Network).off(Network.Event.UPDATE_ROOMS);
            $(Network).off(Network.Event.ENTER_ROOM_SUCCESS);
            $(Network).off(Network.Event.ENTER_ROOM_FAIL);
        }
    },

    updateRoomList : {
        value : function () {
            Network.getRooms();
        }
    },

    _onLeaveRoomButtonClick : {
        value : function (e) {
            Network.leaveRoom(this.curRoomId);
            this.curRoomId = undefined;
        }
    },

    _onReadyButtonClick : {
        value : function (e) {
            var clientWillBeReady = !Network.localClient.data.ready;

            this.lobbyOverlay.switchTeamBtn.prop("disabled", clientWillBeReady);

            Network.socket.emit('updateReady', {
                ready : clientWillBeReady
            });
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
            var name = this.createRoomOverlay.inputField.val();

            if (name !== "") {
                this.createRoomOverlay.domObject.hide();
                Network.createRoom(name);
            }
        }
    },

    _onSwitchTeamButtonClick : {
        value : function (e) {
            Network.switchTeam(this.curRoomId);
        }
    },

    _onUpdateRoomList : {
        value : function (e, data) {
            this.lobbyOverlay.showRooms(data);

            if (this.curRoomId !== undefined) {
                this.lobbyOverlay.renderRoom(data[this.curRoomId]);
            } else {
                this.lobbyOverlay.renderRoom();
            }
        }
    },

    _onEnterRoomAttempt : {
        value : function (e, data) {
            Network.enterRoom(data.id);
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

Object.freeze(LobbyScene);

module.exports = LobbyScene;
},{"../network":9,"../overlays":15}],20:[function(require,module,exports){
"use strict";

var LoadingScene = require('./LoadingScene.js');
var LobbyScene = require('./LobbyScene.js');
var GameOverScene = require('./GameOverScene.js');
var GameScene = require('./GameScene.js');

module.exports = {
    LoadingScene  : LoadingScene,
    LobbyScene    : LobbyScene,
    GameOverScene : GameOverScene,
    GameScene     : GameScene
};
},{"./GameOverScene.js":16,"./GameScene.js":17,"./LoadingScene.js":18,"./LobbyScene.js":19}],21:[function(require,module,exports){
"use strict";

module.exports = {
    BG_TILE       : "./assets/img/BG-tile1.png",
    BLOCK_FULL    : "./assets/img/BlockFull.png",
    SHIP_1        : "./assets/img/OtherShip.png",
    SHIP_2        : "./assets/img/Ship.png",
    WEAK_BULLET_1 : "./assets/img/BulletWeak_a.png",
    WEAK_BULLET_2 : "./assets/img/BulletWeak_b.png",
    WEAK_BULLET_3 : "./assets/img/BulletWeak_c.png",
    WEAK_BULLET_4 : "./assets/img/BulletWeak_d.png",
    EXPLOSION     : "./assets/img/Explosion.png",
    HP_FULL       : "./assets/img/HealthOrbFull.png",
    HP_EMPTY      : "./assets/img/HealthOrbEmpty.png",

    // Preloader replaces getter with appropriate definition
    get        : function (path) { }
};
},{}],22:[function(require,module,exports){
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
},{"./Assets.js":21}],23:[function(require,module,exports){
"use strict";

var Assets = require('./Assets.js');
var Preloader = require('./Preloader.js');

module.exports = {
    Assets    : Assets,
    Preloader : Preloader
};
},{"./Assets.js":21,"./Preloader.js":22}]},{},[6])(6)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvZ2FtZS9zcmMvZW50aXRpZXMvQnVsbGV0LmpzIiwiY2xpZW50L2dhbWUvc3JjL2VudGl0aWVzL0NsaWVudFBsYXllci5qcyIsImNsaWVudC9nYW1lL3NyYy9lbnRpdGllcy9GdWxsQmxvY2suanMiLCJjbGllbnQvZ2FtZS9zcmMvZW50aXRpZXMvUGxheWVyLmpzIiwiY2xpZW50L2dhbWUvc3JjL2VudGl0aWVzL2luZGV4LmpzIiwiY2xpZW50L2dhbWUvc3JjL2luZGV4LmpzIiwiY2xpZW50L2dhbWUvc3JjL25ldHdvcmsvQ2xpZW50LmpzIiwiY2xpZW50L2dhbWUvc3JjL25ldHdvcmsvTG9jYWxDbGllbnQuanMiLCJjbGllbnQvZ2FtZS9zcmMvbmV0d29yay9pbmRleC5qcyIsImNsaWVudC9nYW1lL3NyYy9vdmVybGF5cy9DcmVhdGVSb29tT3ZlcmxheS5qcyIsImNsaWVudC9nYW1lL3NyYy9vdmVybGF5cy9HYW1lT3Zlck92ZXJsYXkuanMiLCJjbGllbnQvZ2FtZS9zcmMvb3ZlcmxheXMvTG9hZGluZ092ZXJsYXkuanMiLCJjbGllbnQvZ2FtZS9zcmMvb3ZlcmxheXMvTG9iYnlPdmVybGF5LmpzIiwiY2xpZW50L2dhbWUvc3JjL292ZXJsYXlzL092ZXJsYXkuanMiLCJjbGllbnQvZ2FtZS9zcmMvb3ZlcmxheXMvaW5kZXguanMiLCJjbGllbnQvZ2FtZS9zcmMvc2NlbmVzL0dhbWVPdmVyU2NlbmUuanMiLCJjbGllbnQvZ2FtZS9zcmMvc2NlbmVzL0dhbWVTY2VuZS5qcyIsImNsaWVudC9nYW1lL3NyYy9zY2VuZXMvTG9hZGluZ1NjZW5lLmpzIiwiY2xpZW50L2dhbWUvc3JjL3NjZW5lcy9Mb2JieVNjZW5lLmpzIiwiY2xpZW50L2dhbWUvc3JjL3NjZW5lcy9pbmRleC5qcyIsImNsaWVudC9nYW1lL3NyYy91dGlsL0Fzc2V0cy5qcyIsImNsaWVudC9nYW1lL3NyYy91dGlsL1ByZWxvYWRlci5qcyIsImNsaWVudC9nYW1lL3NyYy91dGlsL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25JQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1T0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOVJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2ZUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcclxudmFyIEFzc2V0cyA9IHV0aWwuQXNzZXRzO1xyXG52YXIgR2FtZU9iamVjdCA9IHdmbC5jb3JlLmVudGl0aWVzLkdhbWVPYmplY3Q7XHJcbnZhciBQaHlzaWNzT2JqZWN0ID0gd2ZsLmNvcmUuZW50aXRpZXMuUGh5c2ljc09iamVjdDtcclxudmFyIGdlb20gPSB3ZmwuZ2VvbTtcclxuXHJcbi8qKlxyXG4gKiBQcm9qZWN0aWxlcyBjcmVhdGVkIGZyb20gYSBTaGlwXHJcbiAqL1xyXG52YXIgQnVsbGV0ID0gZnVuY3Rpb24gKGRhbWFnZSwgY3JlYXRvcikge1xyXG4gICAgaWYgKGlzTmFOKGRhbWFnZSkgfHwgZGFtYWdlIDw9IDApIHtcclxuICAgICAgICBkYW1hZ2UgPSAxO1xyXG4gICAgfVxyXG5cclxuICAgIFBoeXNpY3NPYmplY3QuY2FsbCh0aGlzKTtcclxuXHJcbiAgICB0aGlzLmNyZWF0b3IgPSBjcmVhdG9yO1xyXG4gICAgdGhpcy5jdXN0b21EYXRhLnRlYW0gPSBjcmVhdG9yLmN1c3RvbURhdGEudGVhbTtcclxuICAgIHRoaXMuY3VzdG9tRGF0YS5pZ25vcmVGcmljdGlvbiA9IHRydWU7XHJcblxyXG4gICAgLy8gQ3JlYXRlIGRlZmF1bHQgc3RhdGVcclxuICAgIHRoaXMuZ3JhcGhpYzEgPSBBc3NldHMuZ2V0KEFzc2V0cy5XRUFLX0JVTExFVF8xKTtcclxuICAgIHRoaXMuZ3JhcGhpYzIgPSBBc3NldHMuZ2V0KEFzc2V0cy5XRUFLX0JVTExFVF8yKTtcclxuICAgIHRoaXMuZ3JhcGhpYzMgPSBBc3NldHMuZ2V0KEFzc2V0cy5XRUFLX0JVTExFVF8zKTtcclxuICAgIHRoaXMuZ3JhcGhpYzQgPSBBc3NldHMuZ2V0KEFzc2V0cy5XRUFLX0JVTExFVF80KTtcclxuICAgIHRoaXMuZGVmYXVsdFN0YXRlID0gdGhpcy5jcmVhdGVTdGF0ZSgpO1xyXG4gICAgdGhpcy5kZWZhdWx0U3RhdGUuYWRkRnJhbWUoXHJcbiAgICAgICAgdGhpcy5jcmVhdGVGcmFtZSh0aGlzLmdyYXBoaWMxLCAyKVxyXG4gICAgKTtcclxuICAgIHRoaXMuZGVmYXVsdFN0YXRlLmFkZEZyYW1lKFxyXG4gICAgICAgIHRoaXMuY3JlYXRlRnJhbWUodGhpcy5ncmFwaGljMiwgMilcclxuICAgICk7XHJcbiAgICB0aGlzLmRlZmF1bHRTdGF0ZS5hZGRGcmFtZShcclxuICAgICAgICB0aGlzLmNyZWF0ZUZyYW1lKHRoaXMuZ3JhcGhpYzMsIDIpXHJcbiAgICApO1xyXG4gICAgdGhpcy5kZWZhdWx0U3RhdGUuYWRkRnJhbWUoXHJcbiAgICAgICAgdGhpcy5jcmVhdGVGcmFtZSh0aGlzLmdyYXBoaWM0LCAyKVxyXG4gICAgKTtcclxuICAgIHRoaXMuYWRkU3RhdGUoR2FtZU9iamVjdC5TVEFURS5ERUZBVUxULCB0aGlzLmRlZmF1bHRTdGF0ZSk7XHJcblxyXG4gICAgdGhpcy5kYW1hZ2UgPSBkYW1hZ2U7XHJcbiAgICB0aGlzLmFnZSA9IDA7XHJcbiAgICB0aGlzLmxpZmVUaW1lID0gQnVsbGV0LkRFRkFVTFRfTUFYX0xJRkVfVElNRTtcclxuICAgIHRoaXMubWF4U3BlZWQgPSBCdWxsZXQuREVGQVVMVF9NQVhfU1BFRUQ7XHJcbiAgICB0aGlzLnNvbGlkID0gdHJ1ZTtcclxufTtcclxuT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoQnVsbGV0LCB7XHJcbiAgICBERUZBVUxUX01BWF9MSUZFX1RJTUUgOiB7XHJcbiAgICAgICAgdmFsdWUgOiA0MFxyXG4gICAgfSxcclxuXHJcbiAgICBERUZBVUxUX1NQRUVEIDoge1xyXG4gICAgICAgIHZhbHVlIDogMC42NVxyXG4gICAgfSxcclxuXHJcbiAgICBERUZBVUxUX01BWF9TUEVFRCA6IHtcclxuICAgICAgICB2YWx1ZSA6IDAuOFxyXG4gICAgfVxyXG59KTtcclxuQnVsbGV0LnByb3RvdHlwZSA9IE9iamVjdC5mcmVlemUoT2JqZWN0LmNyZWF0ZShQaHlzaWNzT2JqZWN0LnByb3RvdHlwZSwge1xyXG4gICAgdXBkYXRlIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGR0KSB7XHJcbiAgICAgICAgICAgIFBoeXNpY3NPYmplY3QucHJvdG90eXBlLnVwZGF0ZS5jYWxsKHRoaXMsIGR0KTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuYWdlKys7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5hZ2UgPj0gdGhpcy5saWZlVGltZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXN0b21EYXRhLnJlbW92ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICByZXNvbHZlQ29sbGlzaW9uIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKHBoeXNPYmosIGNvbGxpc2lvbkRhdGEpIHtcclxuICAgICAgICAgICAgdmFyIHRlYW0gPSB0aGlzLmN1c3RvbURhdGEudGVhbTtcclxuICAgICAgICAgICAgdmFyIG90aGVyVGVhbSA9IHBoeXNPYmouY3VzdG9tRGF0YS50ZWFtO1xyXG5cclxuICAgICAgICAgICAgaWYgKHBoeXNPYmogIT09IHRoaXMuY3JlYXRvciAmJiBwaHlzT2JqLnNvbGlkKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1c3RvbURhdGEucmVtb3ZlZCA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gSWYgaGl0dGluZyBzb21ldGhpbmcgdGhhdCdzIG9uIGEgdGVhbSAocGxheWVyLCBidWxsZXQsXHJcbiAgICAgICAgICAgICAgICAvLyBldGMpLi4uXHJcbiAgICAgICAgICAgICAgICBpZiAob3RoZXJUZWFtICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBJZiB0aGUgYnVsbGV0IGhpdHMgYSBwbGF5ZXIgb24gYSBkaWZmZXJlbnQgdGVhbSwgZGVhbFxyXG4gICAgICAgICAgICAgICAgICAgIC8vIGRhbWFnZSB0byB0aGVtXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG90aGVyVGVhbSAhPT0gdGVhbSAmJiBwaHlzT2JqLnRha2VEYW1hZ2UpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGh5c09iai50YWtlRGFtYWdlKHRoaXMuZGFtYWdlKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIElmIGtpbGxlZCB0aGUgcGxheWVyLCB3ZSdsbCBtYWtlIHRoZSBjYW0gZm9sbG93IHRoaXNcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gYnVsbGV0J3MgY3JlYXRvclxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocGh5c09iai5oZWFsdGggPD0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGh5c09iai5jdXN0b21EYXRhLmtpbGxlciA9IHRoaXMuY3JlYXRvcjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkpO1xyXG5PYmplY3QuZnJlZXplKEJ1bGxldCk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEJ1bGxldDsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xyXG52YXIgQXNzZXRzID0gdXRpbC5Bc3NldHM7XHJcbnZhciBQbGF5ZXIgPSByZXF1aXJlKCcuL1BsYXllcicpO1xyXG52YXIgTGl2aW5nT2JqZWN0ID0gd2ZsLmNvcmUuZW50aXRpZXMuTGl2aW5nT2JqZWN0O1xyXG52YXIgZ2VvbSA9IHdmbC5nZW9tO1xyXG5cclxudmFyIENsaWVudFBsYXllciA9IGZ1bmN0aW9uICh0ZWFtKSB7XHJcbiAgICBQbGF5ZXIuY2FsbCh0aGlzLCB0ZWFtKTtcclxufTtcclxuT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoQ2xpZW50UGxheWVyLCB7XHJcbiAgICBNSU5JTUFQX0ZJTExfU1RZTEUgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBcIiMwNmM4MzNcIlxyXG4gICAgfVxyXG59KTtcclxuQ2xpZW50UGxheWVyLnByb3RvdHlwZSA9IE9iamVjdC5mcmVlemUoT2JqZWN0LmNyZWF0ZShQbGF5ZXIucHJvdG90eXBlLCB7XHJcbiAgICB1cGRhdGUgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoZHQpIHtcclxuICAgICAgICAgICAgTGl2aW5nT2JqZWN0LnByb3RvdHlwZS51cGRhdGUuY2FsbCh0aGlzLCBkdCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIFxyXG4gICAgZHJhd09uTWluaW1hcCA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChjdHgpIHtcclxuICAgICAgICAgICAgdmFyIHcgPSB0aGlzLmdldFdpZHRoKCk7XHJcbiAgICAgICAgICAgIHZhciBoID0gdGhpcy5nZXRIZWlnaHQoKTtcclxuICAgICAgICAgICAgdmFyIG9mZnNldFggPSBNYXRoLnJvdW5kKC13ICogMC41KTtcclxuICAgICAgICAgICAgdmFyIG9mZnNldFkgPSBNYXRoLnJvdW5kKC1oICogMC41KTtcclxuICAgICAgICAgICAgdmFyIGRpc3BsYXlXaWR0aCA9IE1hdGgucm91bmQodyk7XHJcbiAgICAgICAgICAgIHZhciBkaXNwbGF5SGVpZ2h0ID0gTWF0aC5yb3VuZChoKTtcclxuXHJcbiAgICAgICAgICAgIGN0eC5zYXZlKCk7XHJcblxyXG4gICAgICAgICAgICBjdHguZmlsbFN0eWxlID0gQ2xpZW50UGxheWVyLk1JTklNQVBfRklMTF9TVFlMRTtcclxuICAgICAgICAgICAgY3R4LmZpbGxSZWN0KG9mZnNldFgsIG9mZnNldFksIGRpc3BsYXlXaWR0aCwgZGlzcGxheUhlaWdodCk7XHJcblxyXG4gICAgICAgICAgICBjdHgucmVzdG9yZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgc2hvb3QgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoKSB7IH1cclxuICAgIH0sXHJcblxyXG4gICAganVzdFNob3QgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoKSB7IH1cclxuICAgIH1cclxufSkpO1xyXG5PYmplY3QuZnJlZXplKENsaWVudFBsYXllcik7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENsaWVudFBsYXllcjsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xyXG52YXIgQXNzZXRzID0gdXRpbC5Bc3NldHM7XHJcbnZhciBHYW1lT2JqZWN0ID0gd2ZsLmNvcmUuZW50aXRpZXMuR2FtZU9iamVjdDtcclxudmFyIFBoeXNpY3NPYmplY3QgPSB3ZmwuY29yZS5lbnRpdGllcy5QaHlzaWNzT2JqZWN0O1xyXG5cclxuLyoqXHJcbiAqIEEgZnVsbC1zaXplZCwgcXVhZHJpbGF0ZXJhbCBibG9ja1xyXG4gKi9cclxudmFyIEZ1bGxCbG9jayA9IGZ1bmN0aW9uICgpIHtcclxuICAgIFBoeXNpY3NPYmplY3QuY2FsbCh0aGlzKTtcclxuXHJcbiAgICB0aGlzLmlkID0gRnVsbEJsb2NrLmlkO1xyXG5cclxuICAgIC8vIENyZWF0ZSBkZWZhdWx0IHN0YXRlXHJcbiAgICB0aGlzLmRlZmF1bHRHcmFwaGljID0gQXNzZXRzLmdldChBc3NldHMuQkxPQ0tfRlVMTCk7XHJcbiAgICB0aGlzLmRlZmF1bHRTdGF0ZSA9IHRoaXMuY3JlYXRlU3RhdGUoKTtcclxuICAgIHRoaXMuZGVmYXVsdFN0YXRlLmFkZEZyYW1lKFxyXG4gICAgICAgIHRoaXMuY3JlYXRlRnJhbWUodGhpcy5kZWZhdWx0R3JhcGhpYylcclxuICAgICk7XHJcbiAgICB0aGlzLmFkZFN0YXRlKEdhbWVPYmplY3QuU1RBVEUuREVGQVVMVCwgdGhpcy5kZWZhdWx0U3RhdGUpO1xyXG5cclxuICAgIHRoaXMuc29saWQgPSB0cnVlO1xyXG4gICAgdGhpcy5maXhlZCA9IHRydWU7XHJcbiAgICB0aGlzLnJvdGF0ZSgtTWF0aC5QSSAqIDAuNSk7XHJcbn07XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKEZ1bGxCbG9jaywge1xyXG4gICAgbmFtZSA6IHtcclxuICAgICAgICB2YWx1ZSA6IFwiRnVsbEJsb2NrXCJcclxuICAgIH0sXHJcblxyXG4gICAgaWQgOiB7XHJcbiAgICAgICAgdmFsdWUgOiAwXHJcbiAgICB9XHJcbn0pO1xyXG5GdWxsQmxvY2sucHJvdG90eXBlID0gT2JqZWN0LmZyZWV6ZShPYmplY3QuY3JlYXRlKFBoeXNpY3NPYmplY3QucHJvdG90eXBlLCB7XHJcbiAgICBkcmF3T25NaW5pbWFwIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGN0eCkge1xyXG4gICAgICAgICAgICB2YXIgdyA9IHRoaXMuZ2V0V2lkdGgoKTtcclxuICAgICAgICAgICAgdmFyIGggPSB0aGlzLmdldEhlaWdodCgpO1xyXG4gICAgICAgICAgICB2YXIgb2Zmc2V0WCA9IE1hdGgucm91bmQoLXcgKiAwLjUpO1xyXG4gICAgICAgICAgICB2YXIgb2Zmc2V0WSA9IE1hdGgucm91bmQoLWggKiAwLjUpO1xyXG4gICAgICAgICAgICB2YXIgZGlzcGxheVdpZHRoID0gTWF0aC5yb3VuZCh3KTtcclxuICAgICAgICAgICAgdmFyIGRpc3BsYXlIZWlnaHQgPSBNYXRoLnJvdW5kKGgpO1xyXG5cclxuICAgICAgICAgICAgY3R4LnNhdmUoKTtcclxuXHJcbiAgICAgICAgICAgIGN0eC5yb3RhdGUodGhpcy5nZXRSb3RhdGlvbigpKTtcclxuXHJcbiAgICAgICAgICAgIC8qY3R4LmZpbGxTdHlsZSA9XHJcbiAgICAgICAgICAgICAgICBhcHAuZ2FtZW9iamVjdC5QaHlzaWNzT2JqZWN0Lk1JTklNQVBfRklMTF9TVFlMRTtcclxuICAgICAgICAgICAgY3R4LnN0cm9rZVN0eWxlID1cclxuICAgICAgICAgICAgICAgIGFwcC5nYW1lb2JqZWN0LlBoeXNpY3NPYmplY3QuTUlOSU1BUF9TVFJPS0VfU1RZTEU7Ki9cclxuXHJcbiAgICAgICAgICAgIGN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICAgICAgY3R4LnJlY3Qob2Zmc2V0WCwgb2Zmc2V0WSwgZGlzcGxheVdpZHRoLCBkaXNwbGF5SGVpZ2h0KTtcclxuICAgICAgICAgICAgY3R4LmZpbGwoKTtcclxuICAgICAgICAgICAgY3R4LnN0cm9rZSgpO1xyXG5cclxuICAgICAgICAgICAgY3R4LnJlc3RvcmUoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKTtcclxuT2JqZWN0LmZyZWV6ZShGdWxsQmxvY2spO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBGdWxsQmxvY2s7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcclxudmFyIEFzc2V0cyA9IHV0aWwuQXNzZXRzO1xyXG52YXIgTmV0d29yayA9IHJlcXVpcmUoJy4uL25ldHdvcmsnKTtcclxudmFyIEdhbWVPYmplY3QgPSB3ZmwuY29yZS5lbnRpdGllcy5HYW1lT2JqZWN0O1xyXG52YXIgTGl2aW5nT2JqZWN0ID0gd2ZsLmNvcmUuZW50aXRpZXMuTGl2aW5nT2JqZWN0O1xyXG52YXIgZ2VvbSA9IHdmbC5nZW9tO1xyXG5cclxudmFyIFBsYXllciA9IGZ1bmN0aW9uICh0ZWFtKSB7XHJcbiAgICBMaXZpbmdPYmplY3QuY2FsbCh0aGlzKTtcclxuXHJcbiAgICB0aGlzLmN1c3RvbURhdGEudGVhbSA9IHRlYW07XHJcblxyXG4gICAgdmFyIHNoaXBUeXBlO1xyXG4gICAgaWYgKHRlYW0gPT09IDApIHtcclxuICAgICAgICBzaGlwVHlwZSA9IEFzc2V0cy5TSElQXzE7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHNoaXBUeXBlID0gQXNzZXRzLlNISVBfMjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBDcmVhdGUgZGVmYXVsdCBzdGF0ZVxyXG4gICAgdGhpcy5kZWZhdWx0R3JhcGhpYyA9IEFzc2V0cy5nZXQoc2hpcFR5cGUpO1xyXG5cclxuICAgIHZhciB3ID0gdGhpcy5kZWZhdWx0R3JhcGhpYy53aWR0aDtcclxuICAgIHZhciBoID0gdGhpcy5kZWZhdWx0R3JhcGhpYy5oZWlnaHQ7XHJcbiAgICB2YXIgdmVydHMgPSBbXHJcbiAgICAgICAgbmV3IGdlb20uVmVjMigtdyAqIDAuNSwgLWggKiAwLjUpLFxyXG4gICAgICAgIG5ldyBnZW9tLlZlYzIodyAqIDAuNSwgMCksXHJcbiAgICAgICAgbmV3IGdlb20uVmVjMigtdyAqIDAuNSwgaCAqIDAuNSlcclxuICAgIF07XHJcbiAgICB2YXIgZnJhbWVPYmogPSB0aGlzLmNyZWF0ZUZyYW1lKHRoaXMuZGVmYXVsdEdyYXBoaWMsIDEsIGZhbHNlKTtcclxuICAgIGZyYW1lT2JqLnZlcnRpY2VzID0gdmVydHM7XHJcblxyXG4gICAgdGhpcy5kZWZhdWx0U3RhdGUgPSB0aGlzLmNyZWF0ZVN0YXRlKCk7XHJcbiAgICB0aGlzLmRlZmF1bHRTdGF0ZS5hZGRGcmFtZShmcmFtZU9iaik7XHJcbiAgICB0aGlzLmFkZFN0YXRlKEdhbWVPYmplY3QuU1RBVEUuREVGQVVMVCwgdGhpcy5kZWZhdWx0U3RhdGUpO1xyXG5cclxuICAgIC8vIENyZWF0ZSBleHBsb3Npb24gc3RhdGVcclxuICAgIHRoaXMuZXhwbG9zaW9uR3JhcGhpYyA9IEFzc2V0cy5nZXQoQXNzZXRzLkVYUExPU0lPTik7XHJcbiAgICB0aGlzLmV4cGxvc2lvblN0YXRlID0gdGhpcy5jcmVhdGVTdGF0ZSgpO1xyXG5cclxuICAgIGZyYW1lT2JqID0gdGhpcy5jcmVhdGVGcmFtZSh0aGlzLmV4cGxvc2lvbkdyYXBoaWMsIDEsIGZhbHNlKTtcclxuICAgIGZyYW1lT2JqLnZlcnRpY2VzID0gdmVydHM7XHJcbiAgICB0aGlzLmV4cGxvc2lvblN0YXRlLmFkZEZyYW1lKGZyYW1lT2JqKTtcclxuICAgIHRoaXMuYWRkU3RhdGUoUGxheWVyLlNUQVRFLkVYUExPU0lPTiwgdGhpcy5leHBsb3Npb25TdGF0ZSk7XHJcblxyXG4gICAgdGhpcy5zaG9vdFRpbWVyID0gMDtcclxuICAgIHRoaXMubWF4U2hvb3RUaW1lciA9IFBsYXllci5ERUZBVUxUX01BWF9TSE9PVF9USU1FUjtcclxuXHJcbiAgICB0aGlzLmhlYWx0aCA9IE5ldHdvcmsubG9jYWxDbGllbnQuZGF0YS5oZWFsdGg7XHJcbiAgICB0aGlzLm1heEhlYWx0aCA9IE5ldHdvcmsubG9jYWxDbGllbnQuZGF0YS5oZWFsdGg7XHJcblxyXG4gICAgdGhpcy5yb3RhdGUoLU1hdGguUEkgKiAwLjUpO1xyXG59O1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyhQbGF5ZXIsIHtcclxuICAgIFRVUk5fU1BFRUQgOiB7XHJcbiAgICAgICAgdmFsdWUgOiAwLjA1XHJcbiAgICB9LFxyXG5cclxuICAgIEJSQUtFX1JBVEUgOiB7XHJcbiAgICAgICAgdmFsdWUgOiAwLjk1XHJcbiAgICB9LFxyXG5cclxuICAgIEJPT1NUX0FDQ0VMRVJBVElPTiA6IHtcclxuICAgICAgICB2YWx1ZSA6IDAuMDAwMlxyXG4gICAgfSxcclxuXHJcbiAgICBQT1NJVElPTl9VUERBVEVfRElTVEFOQ0UgOiB7XHJcbiAgICAgICAgdmFsdWUgOiAwLjVcclxuICAgIH0sXHJcblxyXG4gICAgTUlOSU1BUF9GSUxMX1NUWUxFIDoge1xyXG4gICAgICAgIHZhbHVlIDogXCIjODZjOGQzXCJcclxuICAgIH0sXHJcblxyXG4gICAgREVGQVVMVF9NQVhfU0hPT1RfVElNRVIgOiB7XHJcbiAgICAgICAgdmFsdWUgOiAyMFxyXG4gICAgfSxcclxuXHJcbiAgICBTVEFURSA6IHtcclxuICAgICAgICB2YWx1ZSA6IHtcclxuICAgICAgICAgICAgRVhQTE9TSU9OIDogXCJleHBsb3Npb25cIlxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSk7XHJcblBsYXllci5wcm90b3R5cGUgPSBPYmplY3QuZnJlZXplKE9iamVjdC5jcmVhdGUoTGl2aW5nT2JqZWN0LnByb3RvdHlwZSwge1xyXG4gICAgdXBkYXRlIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGR0KSB7XHJcbiAgICAgICAgICAgIExpdmluZ09iamVjdC5wcm90b3R5cGUudXBkYXRlLmNhbGwodGhpcywgZHQpO1xyXG5cclxuICAgICAgICAgICAgLy8gVXBkYXRlIHNob290IHRpbWVyIHdoZW4ganVzdCBzaG90XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmp1c3RTaG90KCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2hvb3RUaW1lcisrO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnNob290VGltZXIgPj0gdGhpcy5tYXhTaG9vdFRpbWVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zaG9vdFRpbWVyID0gMDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gSWYgdGhlIHBsYXllciBpcyBjb25uZWN0ZWQgdG8gdGhlIG5ldHdvcmssIHNlbmQgb3V0IHVwZGF0ZXMgdG9cclxuICAgICAgICAgICAgLy8gb3RoZXIgcGxheWVycyB3aGVuIG5lY2Vzc2FyeVxyXG4gICAgICAgICAgICBpZiAoTmV0d29yay5jb25uZWN0ZWQpIHtcclxuICAgICAgICAgICAgICAgIE5ldHdvcmsuc29ja2V0LmVtaXQoJ3VwZGF0ZU90aGVyJywge1xyXG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uICAgICA6IHRoaXMucG9zaXRpb24sXHJcbiAgICAgICAgICAgICAgICAgICAgdmVsb2NpdHkgICAgIDogdGhpcy52ZWxvY2l0eSxcclxuICAgICAgICAgICAgICAgICAgICBhY2NlbGVyYXRpb24gOiB0aGlzLmFjY2VsZXJhdGlvbixcclxuICAgICAgICAgICAgICAgICAgICByb3RhdGlvbiAgICAgOiB0aGlzLmdldFJvdGF0aW9uKClcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBkcmF3T25NaW5pbWFwIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGN0eCkge1xyXG4gICAgICAgICAgICB2YXIgdyA9IHRoaXMuZ2V0V2lkdGgoKTtcclxuICAgICAgICAgICAgdmFyIGggPSB0aGlzLmdldEhlaWdodCgpO1xyXG4gICAgICAgICAgICB2YXIgb2Zmc2V0WCA9IE1hdGgucm91bmQoLXcgKiAwLjUpO1xyXG4gICAgICAgICAgICB2YXIgb2Zmc2V0WSA9IE1hdGgucm91bmQoLWggKiAwLjUpO1xyXG4gICAgICAgICAgICB2YXIgZGlzcGxheVdpZHRoID0gTWF0aC5yb3VuZCh3KTtcclxuICAgICAgICAgICAgdmFyIGRpc3BsYXlIZWlnaHQgPSBNYXRoLnJvdW5kKGgpO1xyXG5cclxuICAgICAgICAgICAgY3R4LnNhdmUoKTtcclxuXHJcbiAgICAgICAgICAgIGN0eC5maWxsU3R5bGUgPSBQbGF5ZXIuTUlOSU1BUF9GSUxMX1NUWUxFO1xyXG4gICAgICAgICAgICBjdHguZmlsbFJlY3Qob2Zmc2V0WCwgb2Zmc2V0WSwgZGlzcGxheVdpZHRoLCBkaXNwbGF5SGVpZ2h0KTtcclxuXHJcbiAgICAgICAgICAgIGN0eC5yZXN0b3JlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBzaG9vdCA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLmp1c3RTaG90KCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2hvb3RUaW1lciA9IDE7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKE5ldHdvcmsuY29ubmVjdGVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgTmV0d29yay5zb2NrZXQuZW1pdCgnYnVsbGV0Jywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbiAgICAgOiB0aGlzLnBvc2l0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2ZWxvY2l0eSAgICAgOiB0aGlzLnZlbG9jaXR5LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhY2NlbGVyYXRpb24gOiB0aGlzLmFjY2VsZXJhdGlvbixcclxuICAgICAgICAgICAgICAgICAgICAgICAgcm90YXRpb24gICAgIDogdGhpcy5nZXRSb3RhdGlvbigpXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIGp1c3RTaG90IDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gKHRoaXMuc2hvb3RUaW1lciA+IDApO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgcmVzb2x2ZUNvbGxpc2lvbiA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChwaHlzT2JqLCBjb2xsaXNpb25EYXRhKSB7XHJcbiAgICAgICAgICAgIHZhciB0ZWFtID0gdGhpcy5jdXN0b21EYXRhLnRlYW07XHJcbiAgICAgICAgICAgIHZhciBvdGhlclRlYW0gPSBwaHlzT2JqLmN1c3RvbURhdGEudGVhbTtcclxuXHJcbiAgICAgICAgICAgIC8vIElmIGhpdHRpbmcgc29tZXRoaW5nIHRoYXQncyBub3Qgb24gdGhpcyB0ZWFtXHJcbiAgICAgICAgICAgIGlmIChvdGhlclRlYW0gPT09IHVuZGVmaW5lZCB8fCBvdGhlclRlYW0gIT09IHRlYW0gfHwgcGh5c09iai50YWtlRGFtYWdlKSB7XHJcbiAgICAgICAgICAgICAgICBMaXZpbmdPYmplY3QucHJvdG90eXBlLnJlc29sdmVDb2xsaXNpb24uY2FsbCh0aGlzLCBwaHlzT2JqLCBjb2xsaXNpb25EYXRhKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkpO1xyXG5PYmplY3QuZnJlZXplKFBsYXllcik7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFBsYXllcjsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBGdWxsQmxvY2sgPSByZXF1aXJlKCcuL0Z1bGxCbG9jay5qcycpO1xyXG52YXIgUGxheWVyID0gcmVxdWlyZSgnLi9QbGF5ZXIuanMnKTtcclxudmFyIENsaWVudFBsYXllciA9IHJlcXVpcmUoJy4vQ2xpZW50UGxheWVyLmpzJyk7XHJcbnZhciBCdWxsZXQgPSByZXF1aXJlKCcuL0J1bGxldC5qcycpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICBGdWxsQmxvY2sgICAgOiBGdWxsQmxvY2ssXHJcbiAgICBQbGF5ZXIgICAgICAgOiBQbGF5ZXIsXHJcbiAgICBDbGllbnRQbGF5ZXIgOiBDbGllbnRQbGF5ZXIsXHJcbiAgICBCdWxsZXQgICAgICAgOiBCdWxsZXRcclxufTsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBOZXR3b3JrID0gcmVxdWlyZSgnLi9uZXR3b3JrJyk7XHJcbnZhciB1dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XHJcbnZhciBBc3NldHMgPSB1dGlsLkFzc2V0cztcclxudmFyIHNjZW5lcyA9IHJlcXVpcmUoJy4vc2NlbmVzJyk7XHJcbnZhciBvdmVybGF5cyA9IHJlcXVpcmUoJy4vb3ZlcmxheXMnKTtcclxuXHJcbi8vIENyZWF0ZSBnYW1lXHJcbnZhciBjYW52YXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2dhbWUtY2FudmFzXCIpO1xyXG52YXIgZ2FtZSAgID0gd2ZsLmNyZWF0ZShjYW52YXMpO1xyXG5cclxudmFyIGxvYWRpbmdTY2VuZSA9IG5ldyBzY2VuZXMuTG9hZGluZ1NjZW5lKGNhbnZhcyk7XHJcbmdhbWUuc2V0U2NlbmUobG9hZGluZ1NjZW5lKTtcclxuXHJcbi8vIFN0b3AgdGhlIGdhbWUgc28gdGhhdCBjYW52YXMgdXBkYXRlcyBkb24ndCBhZmZlY3QgcGVyZm9ybWFuY2Ugd2l0aFxyXG4vLyBvdmVybGF5c1xyXG5nYW1lLnN0b3AoKTtcclxuXHJcbi8vIERyYXcgaW5pdGlhbCBibGFjayBCRyBvbiBjYW52YXNcclxudmFyIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XHJcbmN0eC5maWxsU3R5bGUgPSBcIiMwNDBCMENcIjtcclxuY3R4LmZpbGxSZWN0KDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XHJcblxyXG52YXIgb25Mb2FkID0gZnVuY3Rpb24gKCkge1xyXG4gICAgJChOZXR3b3JrKS5vbihcclxuICAgICAgICBOZXR3b3JrLkV2ZW50LkNPTk5FQ1QsXHJcbiAgICAgICAgb25OZXR3b3JrQ29ubmVjdFxyXG4gICAgKTtcclxuXHJcbiAgICBOZXR3b3JrLmluaXQoKTtcclxufTtcclxuXHJcbnZhciBnb1RvR2FtZSA9IGZ1bmN0aW9uIChyb29tKSB7XHJcbiAgICAvLyBVcGRhdGUgdGhlIGdhbWUgd2l0aCB0aGUgY3VycmVudCB0aW1lIGJlY2F1c2UgdGhlIGR0IHdpbGwgYmUgaHVnZSBuZXh0XHJcbiAgICAvLyB1cGRhdGUgc2luY2UgdGhlIGdhbWUgd2FzIHN0b3BwZWQgd2hpbGUgaW4gdGhlIGxvYmJ5XHJcbiAgICBnYW1lLnVwZGF0ZShEYXRlLm5vdygpKTtcclxuXHJcbiAgICAkKGdhbWUuZ2V0U2NlbmUoKSkub2ZmKCk7XHJcblxyXG4gICAgdmFyIGdhbWVTY2VuZSA9IG5ldyBzY2VuZXMuR2FtZVNjZW5lKGNhbnZhcywgcm9vbSk7XHJcbiAgICBnYW1lLnNldFNjZW5lKGdhbWVTY2VuZSk7XHJcblxyXG4gICAgJChOZXR3b3JrKS5vbihcclxuICAgICAgICBOZXR3b3JrLkV2ZW50LkVORF9HQU1FLFxyXG4gICAgICAgIG9uRW5kR2FtZVxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBJZiB0aGUgcGxheWVyIHJlY2VpdmVzIGRhdGEgZm9yIGdhbWUgb3ZlciBiZWZvcmUgdGhleSBhY3R1YWxseSBsb2FkIHRoZVxyXG4gICAgLy8gZ2F2ZSBvdmVyIHNjcmVlbiwgc2tpcCBpbW1lZGlhdGVseSB0byB0aGUgZ2FtZSBvdmVyIHNjcmVlbiAoYmVjYXVzZSBvbmx5XHJcbiAgICAvLyB0aGUgaG9zdCB3b3VsZCBzZW5kIHRoYXQgZGF0YSlcclxuICAgICQoTmV0d29yaykub24oXHJcbiAgICAgICAgTmV0d29yay5FdmVudC5HQU1FX09WRVJfREFUQSxcclxuICAgICAgICByb29tLFxyXG4gICAgICAgIG9uR2V0R2FtZU92ZXJEYXRhXHJcbiAgICApO1xyXG5cclxuICAgIC8vIFN0YXJ0IHRoZSBnYW1lIHNpbmNlIGl0IHdhcyBzdG9wcGVkIHRvIGhlbHAgcGVyZm9ybWFuY2Ugd2l0aCBvdmVybGF5cyBvblxyXG4gICAgLy8gYSBjYW52YXNcclxuICAgIGdhbWUuc3RhcnQoKTtcclxufTtcclxuXHJcbnZhciBnb1RvTG9iYnkgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAvLyBEcmF3IGJsYWNrIG92ZXIgdGhlIGNhbnZhc1xyXG4gICAgY3R4LmZpbGxTdHlsZSA9IFwiIzA0MEIwQ1wiO1xyXG4gICAgY3R4LmZpbGxSZWN0KDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XHJcblxyXG4gICAgLy8gU3RvcCB0aGUgZ2FtZSBzbyB0aGF0IGNhbnZhcyB1cGRhdGVzIGRvbid0IGFmZmVjdCBwZXJmb3JtYW5jZSB3aXRoXHJcbiAgICAvLyBvdmVybGF5c1xyXG4gICAgZ2FtZS5zdG9wKCk7XHJcblxyXG4gICAgJChnYW1lLmdldFNjZW5lKCkpLm9mZigpO1xyXG5cclxuICAgIC8vIFJlc2V0IGFsbCBsaXN0ZW5lcnMgb24gdGhlIE5ldHdvcmtcclxuICAgICQoTmV0d29yaykub2ZmKCk7XHJcblxyXG4gICAgdmFyIGxvYmJ5U2NlbmUgPSBuZXcgc2NlbmVzLkxvYmJ5U2NlbmUoY2FudmFzKTtcclxuICAgIGdhbWUuc2V0U2NlbmUobG9iYnlTY2VuZSk7XHJcblxyXG4gICAgJChOZXR3b3JrKS5vbihcclxuICAgICAgICBOZXR3b3JrLkV2ZW50LlNUQVJUX0dBTUUsXHJcbiAgICAgICAgb25TdGFydEdhbWVcclxuICAgICk7XHJcblxyXG4gICAgLy8gVHJhbnNpdGlvbiB0aGUgcGFnZSdzIEJHIGNvbG9yIHRvIGJsYWNrIHRvIGhpZGUgdGhlIEJHIGltYWdlIHdoaWNoXHJcbiAgICAvLyBiZWNvbWVzIGRpc3RyYWN0aW5nIGR1cmluZyBnYW1lIHBsYXlcclxuICAgICQoXCJib2R5XCIpLmNzcyh7XCJiYWNrZ3JvdW5kLWNvbG9yXCI6IFwiIzA3MTIxM1wifSk7XHJcbn07XHJcblxyXG52YXIgZ29Ub0dhbWVPdmVyID0gZnVuY3Rpb24gKHJvb20pIHtcclxuICAgIC8vIFN0b3AgdGhlIGdhbWUgc28gdGhhdCBjYW52YXMgdXBkYXRlcyBkb24ndCBhZmZlY3QgcGVyZm9ybWFuY2Ugd2l0aFxyXG4gICAgLy8gb3ZlcmxheXNcclxuICAgIGdhbWUuc3RvcCgpO1xyXG5cclxuICAgIC8vIFJlc2V0IGFsbCBsaXN0ZW5lcnMgb24gdGhlIE5ldHdvcmtcclxuICAgICQoTmV0d29yaykub2ZmKCk7XHJcblxyXG4gICAgdmFyIGdhbWVPdmVyU2NlbmUgPSBuZXcgc2NlbmVzLkdhbWVPdmVyU2NlbmUoY2FudmFzLCByb29tKTtcclxuICAgIGdhbWUuc2V0U2NlbmUoZ2FtZU92ZXJTY2VuZSk7XHJcblxyXG4gICAgJChnYW1lT3ZlclNjZW5lKS5vbihcclxuICAgICAgICBzY2VuZXMuR2FtZU92ZXJTY2VuZS5FdmVudC5SRVRVUk5fVE9fTE9CQlksXHJcbiAgICAgICAgb25HYW1lT3ZlclRvTG9iYnlcclxuICAgICk7XHJcbn07XHJcblxyXG52YXIgb25TdGFydEdhbWUgPSBmdW5jdGlvbiAoZSwgcm9vbSkge1xyXG4gICAgZ29Ub0dhbWUocm9vbSk7XHJcbn07XHJcblxyXG52YXIgb25FbmRHYW1lID0gZnVuY3Rpb24gKGUsIHJvb20pIHtcclxuICAgIGdvVG9HYW1lT3Zlcihyb29tKTtcclxufTtcclxuXHJcbnZhciBvbkdldEdhbWVPdmVyRGF0YSA9IGZ1bmN0aW9uIChlLCBnYW1lT3ZlckRhdGEpIHtcclxuICAgIGdvVG9HYW1lT3ZlcihlLmRhdGEpO1xyXG4gICAgZ2FtZS5nZXRTY2VuZSgpLl9vblVwZGF0ZVNjb3JlKGdhbWVPdmVyRGF0YSk7XHJcbn07XHJcblxyXG52YXIgb25HYW1lT3ZlclRvTG9iYnkgPSBmdW5jdGlvbiAoZSwgcm9vbSkge1xyXG4gICAgZ29Ub0xvYmJ5KCk7XHJcblxyXG4gICAgLy8gVHJpZ2dlciBhbiBldmVudCBzbyB0aGUgbG9iYnkgc2NlbmUga25vd3MgdG8gam9pbiB0aGUgcm9vbSBpdCB3YXMganVzdFxyXG4gICAgLy8gaW4gYmVmb3JlIHBsYXlpbmcgdGhlIGdhbWVcclxuICAgIE5ldHdvcmsuX29uRW50ZXJSb29tU3VjY2Vzcyhyb29tKTtcclxufTtcclxuXHJcbnZhciBvbk5ldHdvcmtDb25uZWN0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgZ29Ub0xvYmJ5KCk7XHJcbn07XHJcblxyXG52YXIgUHJlbG9hZGVyID0gbmV3IHV0aWwuUHJlbG9hZGVyKG9uTG9hZC5iaW5kKHRoaXMpKTsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBlbnRpdGllcyA9IHJlcXVpcmUoJy4uL2VudGl0aWVzJyk7XHJcblxyXG52YXIgQ2xpZW50ID0gZnVuY3Rpb24gKGlkLCBkYXRhKSB7XHJcbiAgICB0aGlzLmlkID0gaWQ7XHJcbiAgICB0aGlzLmRhdGEgPSBkYXRhO1xyXG4gICAgdGhpcy5nYW1lT2JqZWN0ID0gdW5kZWZpbmVkO1xyXG59O1xyXG5PYmplY3QuZnJlZXplKENsaWVudCk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENsaWVudDsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBlbnRpdGllcyA9IHJlcXVpcmUoJy4uL2VudGl0aWVzJyk7XHJcblxyXG52YXIgTG9jYWxDbGllbnQgPSBmdW5jdGlvbiAoaWQsIGRhdGEpIHtcclxuICAgIHRoaXMuaWQgPSBpZDtcclxuICAgIHRoaXMuZGF0YSA9IGRhdGE7XHJcbiAgICB0aGlzLmdhbWVPYmplY3QgPSB1bmRlZmluZWQ7XHJcbn07XHJcbk9iamVjdC5mcmVlemUoTG9jYWxDbGllbnQpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBMb2NhbENsaWVudDsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBOZXR3b3JrID0ge1xyXG4gICAgc29ja2V0ICAgICAgOiB1bmRlZmluZWQsXHJcbiAgICBsb2NhbENsaWVudCA6IHt9LFxyXG4gICAgY2xpZW50cyAgICAgOiB7fSxcclxuICAgIHJvb21zICAgICAgIDoge30sXHJcbiAgICBjb25uZWN0ZWQgICA6IGZhbHNlLFxyXG4gICAgaG9zdElkICAgICAgOiAtMSxcclxuXHJcbiAgICAvLyBFdmVudHMgZm9yIGV4dGVybmFsIGVudGl0aWVzIHRvIHN1YnNjcmliZSB0b1xyXG4gICAgRXZlbnQgICAgICAgOiB7XHJcbiAgICAgICAgQ09OTkVDVCAgICAgICAgICAgIDogXCJjb25uZWN0XCIsXHJcbiAgICAgICAgVVBEQVRFX1JPT01TICAgICAgIDogXCJ1cGRhdGVSb29tc1wiLFxyXG4gICAgICAgIEVOVEVSX1JPT01fU1VDQ0VTUyA6IFwiZW50ZXJSb29tU3VjY2Vzc1wiLFxyXG4gICAgICAgIEVOVEVSX1JPT01fRkFJTCAgICA6IFwiZW50ZXJSb29tRmFpbFwiLFxyXG4gICAgICAgIFBMQVkgICAgICAgICAgICAgICA6IFwicGxheVwiLFxyXG4gICAgICAgIFNUQVJUX0dBTUUgICAgICAgICA6IFwic3RhcnRHYW1lXCIsXHJcbiAgICAgICAgRU5EX0dBTUUgICAgICAgICAgIDogXCJlbmRHYW1lXCIsXHJcbiAgICAgICAgUExBWUVSX0RFQVRIICAgICAgIDogXCJwbGF5ZXJEZWF0aFwiLFxyXG4gICAgICAgIFBMQVlFUl9SRVNQQVdOICAgICA6IFwicGxheWVyUmVzcGF3blwiLFxyXG4gICAgICAgIEJVTExFVCAgICAgICAgICAgICA6IFwiYnVsbGV0XCIsXHJcbiAgICAgICAgQ0xPQ0tfVElDSyAgICAgICAgIDogXCJjbG9ja1RpY2tcIixcclxuICAgICAgICBDT1VOVERPV04gICAgICAgICAgOiBcImNvdW50ZG93blwiLFxyXG4gICAgICAgIEdBTUVfT1ZFUl9EQVRBICAgICA6IFwiZ2FtZU92ZXJEYXRhXCJcclxuICAgIH0sXHJcblxyXG4gICAgaW5pdCA6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLnNvY2tldCA9IGlvLmNvbm5lY3QoKTtcclxuXHJcbiAgICAgICAgdGhpcy5zb2NrZXQub24oJ2NvbmZpcm0nLCB0aGlzLl9vbkNvbmZpcm1DbGllbnQuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgdGhpcy5zb2NrZXQub24oJ2FkZE90aGVyJywgdGhpcy5fb25BZGRPdGhlckNsaWVudC5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLnNvY2tldC5vbigncmVtb3ZlT3RoZXInLCB0aGlzLl9vblJlbW92ZU90aGVyQ2xpZW50LmJpbmQodGhpcykpO1xyXG4gICAgICAgIHRoaXMuc29ja2V0Lm9uKCdsb2FkUHJldmlvdXMnLCB0aGlzLl9vbkxvYWRQcmV2aW91c0NsaWVudHMuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgdGhpcy5zb2NrZXQub24oJ3VwZGF0ZU90aGVyJywgdGhpcy5fb25VcGRhdGVDbGllbnQuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgdGhpcy5zb2NrZXQub24oJ3VwZGF0ZVJvb21zJywgdGhpcy5fb25VcGRhdGVSb29tcy5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLnNvY2tldC5vbignZW50ZXJSb29tU3VjY2VzcycsIHRoaXMuX29uRW50ZXJSb29tU3VjY2Vzcy5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLnNvY2tldC5vbignZW50ZXJSb29tRmFpbCcsIHRoaXMuX29uRW50ZXJSb29tRmFpbC5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLnNvY2tldC5vbigncGluZycsIHRoaXMuX29uUGluZy5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLnNvY2tldC5vbignc2V0SG9zdCcsIHRoaXMuX29uU2V0SG9zdC5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLnNvY2tldC5vbignc3RhcnRHYW1lJywgdGhpcy5fb25TdGFydEdhbWUuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgdGhpcy5zb2NrZXQub24oJ2VuZEdhbWUnLCB0aGlzLl9vbkVuZEdhbWUuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgdGhpcy5zb2NrZXQub24oJ3BsYXllckRlYXRoJywgdGhpcy5fb25QbGF5ZXJEZWF0aC5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLnNvY2tldC5vbigncGxheWVyUmVzcGF3bicsIHRoaXMuX29uUGxheWVyUmVzcGF3bi5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLnNvY2tldC5vbignYnVsbGV0JywgdGhpcy5fb25CdWxsZXQuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgdGhpcy5zb2NrZXQub24oJ2NvdW50ZG93bicsIHRoaXMuX29uQ291bnRkb3duLmJpbmQodGhpcykpO1xyXG4gICAgICAgIHRoaXMuc29ja2V0Lm9uKCdjbG9ja1RpY2snLCB0aGlzLl9vbkNsb2NrVGljay5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLnNvY2tldC5vbignZ2FtZU92ZXJEYXRhJywgdGhpcy5fb25HYW1lT3ZlckRhdGEuYmluZCh0aGlzKSk7XHJcblxyXG4gICAgICAgIHRoaXMuc29ja2V0LmVtaXQoJ2luaXQnLCB7XHJcbiAgICAgICAgICAgIHVzZXIgOiAkKFwiI3VzZXJOYW1lXCIpLmh0bWwoKVxyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuXHJcbiAgICBnZXRSb29tcyA6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLnNvY2tldC5lbWl0KCd1cGRhdGVSb29tcycpO1xyXG4gICAgfSxcclxuXHJcbiAgICBjcmVhdGVSb29tIDogZnVuY3Rpb24gKG5hbWUpIHtcclxuICAgICAgICB2YXIgcm9vbURhdGEgPSB7XHJcbiAgICAgICAgICAgIG5hbWUgIDogbmFtZSxcclxuICAgICAgICAgICAgZW50ZXIgOiB0cnVlXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5zb2NrZXQuZW1pdCgnY3JlYXRlUm9vbScsIHJvb21EYXRhKTtcclxuICAgIH0sXHJcblxyXG4gICAgZW50ZXJSb29tIDogZnVuY3Rpb24gKHJvb21JZCkge1xyXG4gICAgICAgIHRoaXMuc29ja2V0LmVtaXQoJ2VudGVyUm9vbScsIHJvb21JZCk7XHJcbiAgICB9LFxyXG5cclxuICAgIGxlYXZlUm9vbSA6IGZ1bmN0aW9uIChyb29tSWQpIHtcclxuICAgICAgICB0aGlzLnNvY2tldC5lbWl0KCdsZWF2ZVJvb20nLCByb29tSWQpO1xyXG4gICAgfSxcclxuXHJcbiAgICBzd2l0Y2hUZWFtIDogZnVuY3Rpb24gKHJvb21JZCkge1xyXG4gICAgICAgIHRoaXMuc29ja2V0LmVtaXQoJ3N3aXRjaFRlYW0nLCByb29tSWQpO1xyXG4gICAgfSxcclxuXHJcbiAgICBpc0hvc3QgOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuaG9zdElkID09PSB0aGlzLmxvY2FsQ2xpZW50LmlkO1xyXG4gICAgfSxcclxuXHJcbiAgICBfb25Db25maXJtQ2xpZW50IDogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICB2YXIgaWQgPSBkYXRhLmlkO1xyXG4gICAgICAgIHRoaXMubG9jYWxDbGllbnQgPSBuZXcgTG9jYWxDbGllbnQoaWQsIGRhdGEpO1xyXG4gICAgICAgIHRoaXMuY2xpZW50c1tpZF0gPSB0aGlzLmxvY2FsQ2xpZW50O1xyXG5cclxuICAgICAgICB0aGlzLmNvbm5lY3RlZCA9IHRydWU7XHJcblxyXG4gICAgICAgICQodGhpcykudHJpZ2dlcihcclxuICAgICAgICAgICAgdGhpcy5FdmVudC5DT05ORUNUXHJcbiAgICAgICAgKTtcclxuICAgIH0sXHJcblxyXG4gICAgX29uQWRkT3RoZXJDbGllbnQgOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgIHZhciBpZCA9IGRhdGEuaWQ7XHJcbiAgICAgICAgdmFyIG5ld0NsaWVudCA9IG5ldyBDbGllbnQoaWQsIGRhdGEpO1xyXG5cclxuICAgICAgICB0aGlzLmNsaWVudHNbZGF0YS5pZF0gPSBuZXdDbGllbnQ7XHJcbiAgICB9LFxyXG5cclxuICAgIF9vblJlbW92ZU90aGVyQ2xpZW50IDogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICB0aGlzLmNsaWVudHNbZGF0YS5pZF0gPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgZGVsZXRlIHRoaXMuY2xpZW50c1tkYXRhLmlkXTtcclxuICAgIH0sXHJcblxyXG4gICAgX29uTG9hZFByZXZpb3VzQ2xpZW50cyA6IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhkYXRhKTtcclxuXHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHZhciBpZCA9IHBhcnNlSW50KGtleXNbaV0pO1xyXG4gICAgICAgICAgICB2YXIgdXNlckRhdGEgPSBkYXRhW2lkXTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuX29uQWRkT3RoZXJDbGllbnQodXNlckRhdGEpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX29uVXBkYXRlQ2xpZW50IDogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICB2YXIgaWQgPSBkYXRhLmlkO1xyXG4gICAgICAgIHZhciBjbGllbnQgPSB0aGlzLmNsaWVudHNbaWRdO1xyXG5cclxuICAgICAgICBjbGllbnQuZGF0YSA9IGRhdGE7XHJcblxyXG4gICAgICAgIGlmIChjbGllbnQuZ2FtZU9iamVjdCkge1xyXG4gICAgICAgICAgICBjbGllbnQuZ2FtZU9iamVjdC5wb3NpdGlvbi54ID0gZGF0YS5wb3NpdGlvbi54O1xyXG4gICAgICAgICAgICBjbGllbnQuZ2FtZU9iamVjdC5wb3NpdGlvbi55ID0gZGF0YS5wb3NpdGlvbi55O1xyXG4gICAgICAgICAgICBjbGllbnQuZ2FtZU9iamVjdC52ZWxvY2l0eS54ID0gZGF0YS52ZWxvY2l0eS54O1xyXG4gICAgICAgICAgICBjbGllbnQuZ2FtZU9iamVjdC52ZWxvY2l0eS55ID0gZGF0YS52ZWxvY2l0eS55O1xyXG4gICAgICAgICAgICBjbGllbnQuZ2FtZU9iamVjdC5hY2NlbGVyYXRpb24ueCA9IGRhdGEuYWNjZWxlcmF0aW9uLng7XHJcbiAgICAgICAgICAgIGNsaWVudC5nYW1lT2JqZWN0LmFjY2VsZXJhdGlvbi55ID0gZGF0YS5hY2NlbGVyYXRpb24ueTtcclxuICAgICAgICAgICAgY2xpZW50LmdhbWVPYmplY3Quc2V0Um90YXRpb24oZGF0YS5yb3RhdGlvbik7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBfb25VcGRhdGVSb29tcyA6IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgdGhpcy5yb29tcyA9IGRhdGE7XHJcblxyXG4gICAgICAgICQodGhpcykudHJpZ2dlcihcclxuICAgICAgICAgICAgdGhpcy5FdmVudC5VUERBVEVfUk9PTVMsXHJcbiAgICAgICAgICAgIGRhdGFcclxuICAgICAgICApO1xyXG4gICAgfSxcclxuXHJcbiAgICBfb25FbnRlclJvb21TdWNjZXNzIDogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAkKHRoaXMpLnRyaWdnZXIoXHJcbiAgICAgICAgICAgIHRoaXMuRXZlbnQuRU5URVJfUk9PTV9TVUNDRVNTLFxyXG4gICAgICAgICAgICBkYXRhXHJcbiAgICAgICAgKTtcclxuICAgIH0sXHJcblxyXG4gICAgX29uRW50ZXJSb29tRmFpbCA6IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgJCh0aGlzKS50cmlnZ2VyKFxyXG4gICAgICAgICAgICB0aGlzLkV2ZW50LkVOVEVSX1JPT01fRkFJTCxcclxuICAgICAgICAgICAgZGF0YVxyXG4gICAgICAgICk7XHJcbiAgICB9LFxyXG5cclxuICAgIF9vblBpbmcgOiBmdW5jdGlvbiAocGluZ09iaikge1xyXG4gICAgICAgIGlmIChwaW5nT2JqKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc29ja2V0LmVtaXQoJ3JldHVyblBpbmcnLCBwaW5nT2JqKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIF9vblNldEhvc3QgOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgIHRoaXMuaG9zdElkID0gZGF0YS5pZDtcclxuICAgIH0sXHJcblxyXG4gICAgX29uU3RhcnRHYW1lIDogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAkKHRoaXMpLnRyaWdnZXIoXHJcbiAgICAgICAgICAgIHRoaXMuRXZlbnQuU1RBUlRfR0FNRSxcclxuICAgICAgICAgICAgZGF0YVxyXG4gICAgICAgICk7XHJcbiAgICB9LFxyXG5cclxuICAgIF9vbkVuZEdhbWUgOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgIHZhciByb29tID0gdGhpcy5yb29tc1tkYXRhLmlkXTtcclxuXHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByb29tLnBsYXllcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdGhpcy5jbGllbnRzW3Jvb20ucGxheWVyc1tpXV0uZGF0YS5yZWFkeSA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5sb2NhbENsaWVudC5kYXRhLnJlYWR5ID0gZmFsc2U7XHJcblxyXG4gICAgICAgICQodGhpcykudHJpZ2dlcihcclxuICAgICAgICAgICAgdGhpcy5FdmVudC5FTkRfR0FNRSxcclxuICAgICAgICAgICAgZGF0YVxyXG4gICAgICAgICk7XHJcbiAgICB9LFxyXG5cclxuICAgIF9vblBsYXllckRlYXRoIDogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAkKHRoaXMpLnRyaWdnZXIoXHJcbiAgICAgICAgICAgIHRoaXMuRXZlbnQuUExBWUVSX0RFQVRILFxyXG4gICAgICAgICAgICBkYXRhXHJcbiAgICAgICAgKTtcclxuICAgIH0sXHJcblxyXG4gICAgX29uUGxheWVyUmVzcGF3biA6IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgJCh0aGlzKS50cmlnZ2VyKFxyXG4gICAgICAgICAgICB0aGlzLkV2ZW50LlBMQVlFUl9SRVNQQVdOLFxyXG4gICAgICAgICAgICBkYXRhXHJcbiAgICAgICAgKTtcclxuICAgIH0sXHJcblxyXG4gICAgX29uQnVsbGV0IDogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAkKHRoaXMpLnRyaWdnZXIoXHJcbiAgICAgICAgICAgIHRoaXMuRXZlbnQuQlVMTEVULFxyXG4gICAgICAgICAgICBkYXRhXHJcbiAgICAgICAgKTtcclxuICAgIH0sXHJcblxyXG4gICAgX29uQ291bnRkb3duIDogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAkKHRoaXMpLnRyaWdnZXIoXHJcbiAgICAgICAgICAgIHRoaXMuRXZlbnQuQ09VTlRET1dOLFxyXG4gICAgICAgICAgICBkYXRhXHJcbiAgICAgICAgKTtcclxuICAgIH0sXHJcblxyXG4gICAgX29uQ2xvY2tUaWNrIDogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAkKHRoaXMpLnRyaWdnZXIoXHJcbiAgICAgICAgICAgIHRoaXMuRXZlbnQuQ0xPQ0tfVElDSyxcclxuICAgICAgICAgICAgZGF0YVxyXG4gICAgICAgICk7XHJcbiAgICB9LFxyXG5cclxuICAgIF9vbkdhbWVPdmVyRGF0YSA6IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgJCh0aGlzKS50cmlnZ2VyKFxyXG4gICAgICAgICAgICB0aGlzLkV2ZW50LkdBTUVfT1ZFUl9EQVRBLFxyXG4gICAgICAgICAgICBkYXRhXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTmV0d29yaztcclxuXHJcbnZhciBDbGllbnQgPSByZXF1aXJlKCcuL0NsaWVudC5qcycpO1xyXG52YXIgTG9jYWxDbGllbnQgPSByZXF1aXJlKCcuL0xvY2FsQ2xpZW50LmpzJyk7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgT3ZlcmxheSA9IHJlcXVpcmUoJy4vT3ZlcmxheS5qcycpO1xyXG5cclxudmFyIENyZWF0ZVJvb21PdmVybGF5ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgT3ZlcmxheS5jYWxsKHRoaXMpO1xyXG4gICAgXHJcbiAgICB0aGlzLmlucHV0RmllbGQgPSAkKFwiPGlucHV0PlwiKTtcclxuICAgIHRoaXMuaW5wdXRGaWVsZC5hdHRyKHsgXCJwbGFjZWhvbGRlclwiIDogXCJSb29tIE5hbWVcIiB9KTtcclxuICAgIHRoaXMuaW5wdXRGaWVsZC5hZGRDbGFzcyhcImNyZWF0ZS1yb29tLW92ZXJsYXktaW5wdXRcIik7XHJcbiAgICBcclxuICAgIHRoaXMuYnV0dG9uQ29udGFpbmVyID0gJChcIjxkaXY+XCIpO1xyXG4gICAgdGhpcy5idXR0b25Db250YWluZXIuYWRkQ2xhc3MoXCJjcmVhdGUtcm9vbS1vdmVybGF5LWJ1dHRvbi1jb250YWluZXJcIik7XHJcbiAgICBcclxuICAgIHRoaXMuY2FuY2VsQnRuID0gJChcIjxidXR0b24+XCIpO1xyXG4gICAgdGhpcy5jYW5jZWxCdG4udGV4dChcIkNhbmNlbFwiKTtcclxuICAgIHRoaXMuYnV0dG9uQ29udGFpbmVyLmFwcGVuZCh0aGlzLmNhbmNlbEJ0bik7XHJcbiAgICBcclxuICAgIHRoaXMuY3JlYXRlQnRuID0gJChcIjxidXR0b24+XCIpO1xyXG4gICAgdGhpcy5jcmVhdGVCdG4udGV4dChcIkNyZWF0ZVwiKTtcclxuICAgIHRoaXMuYnV0dG9uQ29udGFpbmVyLmFwcGVuZCh0aGlzLmNyZWF0ZUJ0bik7XHJcblxyXG4gICAgdGhpcy5kb21PYmplY3QuYXBwZW5kKHRoaXMuaW5wdXRGaWVsZCk7XHJcbiAgICB0aGlzLmRvbU9iamVjdC5hcHBlbmQodGhpcy5idXR0b25Db250YWluZXIpO1xyXG4gICAgdGhpcy5kb21PYmplY3QuYWRkQ2xhc3MoXCJjcmVhdGUtcm9vbS1vdmVybGF5XCIpO1xyXG59O1xyXG5cclxuQ3JlYXRlUm9vbU92ZXJsYXkucHJvdG90eXBlID0gT2JqZWN0LmZyZWV6ZShPYmplY3QuY3JlYXRlKE92ZXJsYXkucHJvdG90eXBlLCB7XHJcblxyXG59KSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENyZWF0ZVJvb21PdmVybGF5OyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIE92ZXJsYXkgPSByZXF1aXJlKCcuL092ZXJsYXkuanMnKTtcclxudmFyIE5ldHdvcmsgPSByZXF1aXJlKCcuLi9uZXR3b3JrJyk7XHJcblxyXG52YXIgR2FtZU92ZXJPdmVybGF5ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgT3ZlcmxheS5jYWxsKHRoaXMpO1xyXG5cclxuICAgIHRoaXMucmVzdWx0c0xhYmVsID0gJChcIjxkaXY+XCIpO1xyXG4gICAgdGhpcy5yZXN1bHRzTGFiZWwuaHRtbChcIlJlc3VsdHNcIik7XHJcbiAgICB0aGlzLnJlc3VsdHNMYWJlbC5hZGRDbGFzcyhcImdhbWUtb3Zlci1vdmVybGF5LXJlc3VsdHMtbGFiZWxcIik7XHJcblxyXG4gICAgdGhpcy50ZWFtQUNvbnRhaW5lciA9ICQoXCI8ZGl2PlwiKTtcclxuICAgIHRoaXMudGVhbUFDb250YWluZXIuYWRkQ2xhc3MoXCJsb2JieS1vdmVybGF5LXRlYW1BLWNvbnRhaW5lclwiKTtcclxuXHJcbiAgICB0aGlzLnRlYW1CQ29udGFpbmVyID0gJChcIjxkaXY+XCIpO1xyXG4gICAgdGhpcy50ZWFtQkNvbnRhaW5lci5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXktdGVhbUItY29udGFpbmVyXCIpO1xyXG5cclxuICAgIHRoaXMucmV0dXJuVG9Mb2JieUJ0biA9ICQoXCI8YnV0dG9uPlwiKTtcclxuICAgIHRoaXMucmV0dXJuVG9Mb2JieUJ0bi50ZXh0KFwiUmV0dXJuIHRvIExvYmJ5XCIpO1xyXG4gICAgdGhpcy5yZXR1cm5Ub0xvYmJ5QnRuLmFkZENsYXNzKFwiZ2FtZS1vdmVyLW92ZXJsYXktcmV0dXJuLXRvLWxvYmJ5LWJ1dHRvblwiKTtcclxuXHJcbiAgICB0aGlzLmRvbU9iamVjdC5hcHBlbmQodGhpcy5yZXN1bHRzTGFiZWwpO1xyXG4gICAgdGhpcy5kb21PYmplY3QuYXBwZW5kKHRoaXMubG9hZGluZ0ljb24pO1xyXG4gICAgdGhpcy5kb21PYmplY3QuYXBwZW5kKHRoaXMudGVhbUFDb250YWluZXIpO1xyXG4gICAgdGhpcy5kb21PYmplY3QuYXBwZW5kKHRoaXMudGVhbUJDb250YWluZXIpO1xyXG4gICAgdGhpcy5kb21PYmplY3QuYXBwZW5kKHRoaXMucmV0dXJuVG9Mb2JieUJ0bik7XHJcblxyXG4gICAgdGhpcy5kb21PYmplY3QuYWRkQ2xhc3MoXCJnYW1lLW92ZXItb3ZlcmxheVwiKTtcclxuICAgIHRoaXMuZG9tT2JqZWN0LmFkZENsYXNzKFwiZmFkZS1pblwiKTtcclxuXHJcbiAgICB0aGlzLnJlbmRlclNjb3JlKCk7XHJcbn07XHJcblxyXG5HYW1lT3Zlck92ZXJsYXkucHJvdG90eXBlID0gT2JqZWN0LmZyZWV6ZShPYmplY3QuY3JlYXRlKE92ZXJsYXkucHJvdG90eXBlLCB7XHJcbiAgICByZW5kZXJTY29yZSA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChyb29tRGF0YSkge1xyXG4gICAgICAgICAgICB0aGlzLnRlYW1BQ29udGFpbmVyLmh0bWwoXCJcIik7XHJcbiAgICAgICAgICAgIHRoaXMudGVhbUJDb250YWluZXIuaHRtbChcIlwiKTtcclxuXHJcbiAgICAgICAgICAgIHZhciB0ZWFtQUxhYmVsID0gJChcIjxzcGFuPlwiKTtcclxuICAgICAgICAgICAgdGVhbUFMYWJlbC5odG1sKFwiUm9zZSBUZWFtXCIpO1xyXG4gICAgICAgICAgICB0ZWFtQUxhYmVsLmFkZENsYXNzKFwiZ2FtZS1vdmVyLW92ZXJsYXktdGVhbS1sYWJlbFwiKTtcclxuXHJcbiAgICAgICAgICAgIHZhciB0ZWFtQUtpbGxMYWJlbCA9ICQoXCI8c3Bhbj5cIik7XHJcbiAgICAgICAgICAgIHRlYW1BS2lsbExhYmVsLmh0bWwoXCJLXCIpO1xyXG4gICAgICAgICAgICB0ZWFtQUtpbGxMYWJlbC5hZGRDbGFzcyhcImdhbWUtb3Zlci1vdmVybGF5LXRlYW0ta2lsbC1sYWJlbFwiKTtcclxuXHJcbiAgICAgICAgICAgIHZhciB0ZWFtQURlYXRoTGFiZWwgPSAkKFwiPHNwYW4+XCIpO1xyXG4gICAgICAgICAgICB0ZWFtQURlYXRoTGFiZWwuaHRtbChcIkRcIik7XHJcbiAgICAgICAgICAgIHRlYW1BRGVhdGhMYWJlbC5hZGRDbGFzcyhcImdhbWUtb3Zlci1vdmVybGF5LXRlYW0tZGVhdGgtbGFiZWxcIik7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnRlYW1BQ29udGFpbmVyLmFwcGVuZCh0ZWFtQUxhYmVsKTtcclxuICAgICAgICAgICAgdGhpcy50ZWFtQUNvbnRhaW5lci5hcHBlbmQodGVhbUFLaWxsTGFiZWwpO1xyXG4gICAgICAgICAgICB0aGlzLnRlYW1BQ29udGFpbmVyLmFwcGVuZCh0ZWFtQURlYXRoTGFiZWwpO1xyXG5cclxuICAgICAgICAgICAgdmFyIHRlYW1CTGFiZWwgPSAkKFwiPHNwYW4+XCIpO1xyXG4gICAgICAgICAgICB0ZWFtQkxhYmVsLmh0bWwoXCJTa3kgVGVhbVwiKTtcclxuICAgICAgICAgICAgdGVhbUJMYWJlbC5hZGRDbGFzcyhcImdhbWUtb3Zlci1vdmVybGF5LXRlYW0tbGFiZWxcIik7XHJcblxyXG4gICAgICAgICAgICB2YXIgdGVhbUJLaWxsTGFiZWwgPSAkKFwiPHNwYW4+XCIpO1xyXG4gICAgICAgICAgICB0ZWFtQktpbGxMYWJlbC5odG1sKFwiS1wiKTtcclxuICAgICAgICAgICAgdGVhbUJLaWxsTGFiZWwuYWRkQ2xhc3MoXCJnYW1lLW92ZXItb3ZlcmxheS10ZWFtLWtpbGwtbGFiZWxcIik7XHJcblxyXG4gICAgICAgICAgICB2YXIgdGVhbUJEZWF0aExhYmVsID0gJChcIjxzcGFuPlwiKTtcclxuICAgICAgICAgICAgdGVhbUJEZWF0aExhYmVsLmh0bWwoXCJEXCIpO1xyXG4gICAgICAgICAgICB0ZWFtQkRlYXRoTGFiZWwuYWRkQ2xhc3MoXCJnYW1lLW92ZXItb3ZlcmxheS10ZWFtLWRlYXRoLWxhYmVsXCIpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy50ZWFtQkNvbnRhaW5lci5hcHBlbmQodGVhbUJMYWJlbCk7XHJcbiAgICAgICAgICAgIHRoaXMudGVhbUJDb250YWluZXIuYXBwZW5kKHRlYW1CS2lsbExhYmVsKTtcclxuICAgICAgICAgICAgdGhpcy50ZWFtQkNvbnRhaW5lci5hcHBlbmQodGVhbUJEZWF0aExhYmVsKTtcclxuXHJcbiAgICAgICAgICAgIGlmICghcm9vbURhdGEpIHtcclxuICAgICAgICAgICAgICAgIHZhciB0ZWFtQUxvYWRpbmdDb250YWluZXIgPSAkKFwiPGRpdj5cIik7XHJcbiAgICAgICAgICAgICAgICB0ZWFtQUxvYWRpbmdDb250YWluZXIuaHRtbChcIkxvYWRpbmcuLi5cIik7XHJcbiAgICAgICAgICAgICAgICB0ZWFtQUxhYmVsLmFwcGVuZCh0ZWFtQUxvYWRpbmdDb250YWluZXIpO1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciB0ZWFtQkxvYWRpbmdDb250YWluZXIgPSAkKFwiPGRpdj5cIik7XHJcbiAgICAgICAgICAgICAgICB0ZWFtQkxvYWRpbmdDb250YWluZXIuaHRtbChcIkxvYWRpbmcuLi5cIik7XHJcbiAgICAgICAgICAgICAgICB0ZWFtQkxhYmVsLmFwcGVuZCh0ZWFtQkxvYWRpbmdDb250YWluZXIpO1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdmFyIHRlYW1BID0gcm9vbURhdGEudGVhbUE7XHJcbiAgICAgICAgICAgIHZhciB0ZWFtQiA9IHJvb21EYXRhLnRlYW1CO1xyXG4gICAgICAgICAgICB2YXIgbG9jYWxJZCA9IE5ldHdvcmsubG9jYWxDbGllbnQuaWQ7XHJcblxyXG4gICAgICAgICAgICB2YXIgdGVhbUFOYW1lQ29udGFpbmVyID0gJChcIjxzcGFuPlwiKTtcclxuICAgICAgICAgICAgdmFyIHRlYW1BS2lsbHNDb250YWluZXIgPSAkKFwiPHNwYW4+XCIpO1xyXG4gICAgICAgICAgICB2YXIgdGVhbUFEZWF0aHNDb250YWluZXIgPSAkKFwiPHNwYW4+XCIpO1xyXG4gICAgICAgICAgICB0ZWFtQU5hbWVDb250YWluZXIuYWRkQ2xhc3MoXCJnYW1lLW92ZXItb3ZlcmxheS1uYW1lLWNvbnRhaW5lclwiKTtcclxuICAgICAgICAgICAgdGVhbUFLaWxsc0NvbnRhaW5lci5hZGRDbGFzcyhcImdhbWUtb3Zlci1vdmVybGF5LWtpbGxzLWNvbnRhaW5lclwiKTtcclxuICAgICAgICAgICAgdGVhbUFEZWF0aHNDb250YWluZXIuYWRkQ2xhc3MoXCJnYW1lLW92ZXItb3ZlcmxheS1kZWF0aHMtY29udGFpbmVyXCIpO1xyXG5cclxuICAgICAgICAgICAgdmFyIHRlYW1CTmFtZUNvbnRhaW5lciA9ICQoXCI8c3Bhbj5cIik7XHJcbiAgICAgICAgICAgIHZhciB0ZWFtQktpbGxzQ29udGFpbmVyID0gJChcIjxzcGFuPlwiKTtcclxuICAgICAgICAgICAgdmFyIHRlYW1CRGVhdGhzQ29udGFpbmVyID0gJChcIjxzcGFuPlwiKTtcclxuICAgICAgICAgICAgdGVhbUJOYW1lQ29udGFpbmVyLmFkZENsYXNzKFwiZ2FtZS1vdmVyLW92ZXJsYXktbmFtZS1jb250YWluZXJcIik7XHJcbiAgICAgICAgICAgIHRlYW1CS2lsbHNDb250YWluZXIuYWRkQ2xhc3MoXCJnYW1lLW92ZXItb3ZlcmxheS1raWxscy1jb250YWluZXJcIik7XHJcbiAgICAgICAgICAgIHRlYW1CRGVhdGhzQ29udGFpbmVyLmFkZENsYXNzKFwiZ2FtZS1vdmVyLW92ZXJsYXktZGVhdGhzLWNvbnRhaW5lclwiKTtcclxuXHJcbiAgICAgICAgICAgIC8vIEFkZCB0ZWFtIEEgcGxheWVyc1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDQ7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgdmFyIGxhYmVsO1xyXG4gICAgICAgICAgICAgICAgdmFyIGtpbGxzO1xyXG4gICAgICAgICAgICAgICAgdmFyIGRlYXRocztcclxuICAgICAgICAgICAgICAgIHZhciBwbGF5ZXJDb250YWluZXIgPSAkKFwiPGRpdj5cIik7XHJcbiAgICAgICAgICAgICAgICB2YXIga2lsbHNDb250YWluZXIgPSAkKFwiPGRpdj5cIik7XHJcbiAgICAgICAgICAgICAgICB2YXIgZGVhdGhzQ29udGFpbmVyID0gJChcIjxkaXY+XCIpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChpIDwgdGVhbUEubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGN1clBsYXllciA9IHRlYW1BW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsID0gY3VyUGxheWVyLnVzZXI7XHJcbiAgICAgICAgICAgICAgICAgICAga2lsbHMgPSBjdXJQbGF5ZXIua2lsbHM7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVhdGhzID0gY3VyUGxheWVyLmRlYXRocztcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGN1clBsYXllci5pZCA9PT0gbG9jYWxJZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwbGF5ZXJDb250YWluZXIuYWRkQ2xhc3MoXCJsb2JieS1vdmVybGF5LWxvY2FsLXBsYXllci1jb250YWluZXJcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBsYWJlbCA9IFwiLS0tLS0tXCI7XHJcbiAgICAgICAgICAgICAgICAgICAga2lsbHMgPSBcIi1cIjtcclxuICAgICAgICAgICAgICAgICAgICBkZWF0aHMgPSBcIi1cIjtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBwbGF5ZXJDb250YWluZXIuaHRtbChsYWJlbCk7XHJcbiAgICAgICAgICAgICAgICBraWxsc0NvbnRhaW5lci5odG1sKGtpbGxzKTtcclxuICAgICAgICAgICAgICAgIGRlYXRoc0NvbnRhaW5lci5odG1sKGRlYXRocyk7XHJcbiAgICAgICAgICAgICAgICB0ZWFtQU5hbWVDb250YWluZXIuYXBwZW5kKHBsYXllckNvbnRhaW5lcik7XHJcbiAgICAgICAgICAgICAgICB0ZWFtQUtpbGxzQ29udGFpbmVyLmFwcGVuZChraWxsc0NvbnRhaW5lcik7XHJcbiAgICAgICAgICAgICAgICB0ZWFtQURlYXRoc0NvbnRhaW5lci5hcHBlbmQoZGVhdGhzQ29udGFpbmVyKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy50ZWFtQUNvbnRhaW5lci5hcHBlbmQodGVhbUFOYW1lQ29udGFpbmVyKTtcclxuICAgICAgICAgICAgdGhpcy50ZWFtQUNvbnRhaW5lci5hcHBlbmQodGVhbUFLaWxsc0NvbnRhaW5lcik7XHJcbiAgICAgICAgICAgIHRoaXMudGVhbUFDb250YWluZXIuYXBwZW5kKHRlYW1BRGVhdGhzQ29udGFpbmVyKTtcclxuXHJcbiAgICAgICAgICAgIC8vIEFkZCB0ZWFtIEIgcGxheWVyc1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDQ7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgdmFyIGxhYmVsO1xyXG4gICAgICAgICAgICAgICAgdmFyIGtpbGxzO1xyXG4gICAgICAgICAgICAgICAgdmFyIGRlYXRocztcclxuICAgICAgICAgICAgICAgIHZhciBwbGF5ZXJDb250YWluZXIgPSAkKFwiPGRpdj5cIik7XHJcbiAgICAgICAgICAgICAgICB2YXIga2lsbHNDb250YWluZXIgPSAkKFwiPGRpdj5cIik7XHJcbiAgICAgICAgICAgICAgICB2YXIgZGVhdGhzQ29udGFpbmVyID0gJChcIjxkaXY+XCIpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChpIDwgdGVhbUIubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGN1clBsYXllciA9IHRlYW1CW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsID0gY3VyUGxheWVyLnVzZXI7XHJcbiAgICAgICAgICAgICAgICAgICAga2lsbHMgPSBjdXJQbGF5ZXIua2lsbHM7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVhdGhzID0gY3VyUGxheWVyLmRlYXRocztcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGN1clBsYXllci5pZCA9PT0gbG9jYWxJZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwbGF5ZXJDb250YWluZXIuYWRkQ2xhc3MoXCJsb2JieS1vdmVybGF5LWxvY2FsLXBsYXllci1jb250YWluZXJcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBsYWJlbCA9IFwiLS0tLS0tXCI7XHJcbiAgICAgICAgICAgICAgICAgICAga2lsbHMgPSBcIi1cIjtcclxuICAgICAgICAgICAgICAgICAgICBkZWF0aHMgPSBcIi1cIjtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBwbGF5ZXJDb250YWluZXIuaHRtbChsYWJlbCk7XHJcbiAgICAgICAgICAgICAgICBraWxsc0NvbnRhaW5lci5odG1sKGtpbGxzKTtcclxuICAgICAgICAgICAgICAgIGRlYXRoc0NvbnRhaW5lci5odG1sKGRlYXRocyk7XHJcbiAgICAgICAgICAgICAgICB0ZWFtQk5hbWVDb250YWluZXIuYXBwZW5kKHBsYXllckNvbnRhaW5lcik7XHJcbiAgICAgICAgICAgICAgICB0ZWFtQktpbGxzQ29udGFpbmVyLmFwcGVuZChraWxsc0NvbnRhaW5lcik7XHJcbiAgICAgICAgICAgICAgICB0ZWFtQkRlYXRoc0NvbnRhaW5lci5hcHBlbmQoZGVhdGhzQ29udGFpbmVyKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy50ZWFtQkNvbnRhaW5lci5hcHBlbmQodGVhbUJOYW1lQ29udGFpbmVyKTtcclxuICAgICAgICAgICAgdGhpcy50ZWFtQkNvbnRhaW5lci5hcHBlbmQodGVhbUJLaWxsc0NvbnRhaW5lcik7XHJcbiAgICAgICAgICAgIHRoaXMudGVhbUJDb250YWluZXIuYXBwZW5kKHRlYW1CRGVhdGhzQ29udGFpbmVyKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gR2FtZU92ZXJPdmVybGF5OyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIE92ZXJsYXkgPSByZXF1aXJlKCcuL092ZXJsYXkuanMnKTtcclxuXHJcbnZhciBMb2FkaW5nT3ZlcmxheSA9IGZ1bmN0aW9uICgpIHtcclxuICAgIE92ZXJsYXkuY2FsbCh0aGlzKTtcclxuICAgIFxyXG4gICAgdGhpcy5kb21PYmplY3QuYWRkQ2xhc3MoXCJsb2FkaW5nLW92ZXJsYXktYmdcIik7XHJcbiAgICBcclxuICAgIHRoaXMubG9hZGluZ0ljb24gPSAkKFwiPGRpdj5cIik7XHJcbiAgICB0aGlzLmxvYWRpbmdJY29uLmFkZENsYXNzKFwibG9hZGluZy1vdmVybGF5XCIpO1xyXG4gICAgXHJcbiAgICB0aGlzLmRvbU9iamVjdC5hcHBlbmQodGhpcy5sb2FkaW5nSWNvbik7XHJcbn07XHJcblxyXG5Mb2FkaW5nT3ZlcmxheS5wcm90b3R5cGUgPSBPYmplY3QuZnJlZXplKE9iamVjdC5jcmVhdGUoT3ZlcmxheS5wcm90b3R5cGUsIHtcclxuXHJcbn0pKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTG9hZGluZ092ZXJsYXk7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgT3ZlcmxheSA9IHJlcXVpcmUoJy4vT3ZlcmxheS5qcycpO1xyXG52YXIgTmV0d29yayA9IHJlcXVpcmUoJy4uL25ldHdvcmsnKTtcclxuXHJcbnZhciBMb2JieU92ZXJsYXkgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICBPdmVybGF5LmNhbGwodGhpcyk7XHJcblxyXG4gICAgLy8gU2V0IHVwIGxlZnQgc2lkZVxyXG4gICAgdGhpcy5sZWZ0Q29udGFpbmVyID0gJChcIjxzcGFuPlwiKTtcclxuICAgIHRoaXMubGVmdENvbnRhaW5lci5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXktbGVmdFwiKTtcclxuICAgIHRoaXMubGVmdENvbnRhaW5lci5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXktbWF4aW1pemVkLXNpZGVcIik7XHJcblxyXG4gICAgdGhpcy5yb29tQnV0dG9uQ29udGFpbmVyID0gJChcIjxkaXY+XCIpO1xyXG4gICAgdGhpcy5yb29tQnV0dG9uQ29udGFpbmVyLmFkZENsYXNzKFwibG9iYnktb3ZlcmxheS1idXR0b24tY29udGFpbmVyXCIpO1xyXG4gICAgdGhpcy5sZWZ0Q29udGFpbmVyLmFwcGVuZCh0aGlzLnJvb21CdXR0b25Db250YWluZXIpO1xyXG5cclxuICAgIHRoaXMuc2VsZWN0Um9vbUxhYmVsID0gJChcIjxkaXY+XCIpO1xyXG4gICAgdGhpcy5zZWxlY3RSb29tTGFiZWwuaHRtbChcIlNlbGVjdCBvciBjcmVhdGUgcm9vbVwiKTtcclxuICAgIHRoaXMucm9vbUJ1dHRvbkNvbnRhaW5lci5hcHBlbmQodGhpcy5zZWxlY3RSb29tTGFiZWwpO1xyXG4gICAgdGhpcy5yb29tQnV0dG9uQ29udGFpbmVyLmFwcGVuZCgkKFwiPGJyPlwiKSk7XHJcblxyXG4gICAgdGhpcy5jcmVhdGVSb29tQnRuID0gJChcIjxidXR0b24+XCIpO1xyXG4gICAgdGhpcy5jcmVhdGVSb29tQnRuLnRleHQoXCJDcmVhdGUgUm9vbVwiKTtcclxuICAgIHRoaXMucm9vbUJ1dHRvbkNvbnRhaW5lci5hcHBlbmQodGhpcy5jcmVhdGVSb29tQnRuKTtcclxuXHJcbiAgICB0aGlzLnJvb21MaXN0Q29udGFpbmVyID0gJChcIjxkaXY+XCIpO1xyXG4gICAgdGhpcy5yb29tTGlzdENvbnRhaW5lci5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXktcm9vbS1saXN0XCIpO1xyXG4gICAgdGhpcy5yb29tTGlzdENvbnRhaW5lci5odG1sKFwiTG9hZGluZyByb29tcy4uLlwiKTtcclxuICAgIHRoaXMubGVmdENvbnRhaW5lci5hcHBlbmQodGhpcy5yb29tTGlzdENvbnRhaW5lcik7XHJcblxyXG4gICAgLy8gU2V0IHVwIHJpZ2h0IHNpZGVcclxuICAgIHRoaXMucmlnaHRDb250YWluZXIgPSAkKFwiPHNwYW4+XCIpO1xyXG4gICAgdGhpcy5yaWdodENvbnRhaW5lci5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXktcmlnaHRcIik7XHJcbiAgICB0aGlzLnJpZ2h0Q29udGFpbmVyLmFkZENsYXNzKFwibG9iYnktb3ZlcmxheS1taW5pbWl6ZWQtc2lkZVwiKTtcclxuXHJcbiAgICB0aGlzLnNlbGVjdGVkUm9vbUxhYmVsID0gJChcIjxkaXY+XCIpO1xyXG4gICAgdGhpcy5zZWxlY3RlZFJvb21MYWJlbC5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXktcm9vbS1sYWJlbC1jb250YWluZXJcIik7XHJcblxyXG4gICAgdGhpcy5yZW5kZXJSb29tTGFiZWwoKTtcclxuICAgIHRoaXMucmlnaHRDb250YWluZXIuYXBwZW5kKHRoaXMuc2VsZWN0ZWRSb29tTGFiZWwpO1xyXG5cclxuICAgIHRoaXMuc3dpdGNoVGVhbUJ0biA9ICQoXCI8YnV0dG9uPlwiKTtcclxuICAgIHRoaXMuc3dpdGNoVGVhbUJ0bi50ZXh0KFwiU3dpdGNoIFRlYW1zXCIpO1xyXG4gICAgdGhpcy5zd2l0Y2hUZWFtQnRuLmFkZENsYXNzKFwibG9iYnktb3ZlcmxheS1zd2l0Y2gtdGVhbS1idG5cIik7XHJcblxyXG4gICAgdGhpcy50ZWFtQUNvbnRhaW5lciA9ICQoXCI8ZGl2PlwiKTtcclxuICAgIHRoaXMudGVhbUFDb250YWluZXIuYWRkQ2xhc3MoXCJsb2JieS1vdmVybGF5LXRlYW1BLWNvbnRhaW5lclwiKTtcclxuXHJcbiAgICB0aGlzLnRlYW1CQ29udGFpbmVyID0gJChcIjxkaXY+XCIpO1xyXG4gICAgdGhpcy50ZWFtQkNvbnRhaW5lci5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXktdGVhbUItY29udGFpbmVyXCIpO1xyXG5cclxuICAgIHRoaXMucmVuZGVyUGxheWVycygpO1xyXG5cclxuICAgIHRoaXMucmlnaHRDb250YWluZXIuYXBwZW5kKHRoaXMudGVhbUFDb250YWluZXIpO1xyXG4gICAgdGhpcy5yaWdodENvbnRhaW5lci5hcHBlbmQodGhpcy5zd2l0Y2hUZWFtQnRuKTtcclxuICAgIHRoaXMucmlnaHRDb250YWluZXIuYXBwZW5kKHRoaXMudGVhbUJDb250YWluZXIpO1xyXG5cclxuICAgIHRoaXMubGVhdmVSb29tQnRuID0gJChcIjxidXR0b24+XCIpO1xyXG4gICAgdGhpcy5sZWF2ZVJvb21CdG4udGV4dChcIkxlYXZlIFJvb21cIik7XHJcbiAgICB0aGlzLmxlYXZlUm9vbUJ0bi5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXktbGVhdmUtcm9vbS1idG5cIik7XHJcbiAgICB0aGlzLmxlYXZlUm9vbUJ0bi5oaWRlKCk7XHJcbiAgICB0aGlzLnJpZ2h0Q29udGFpbmVyLmFwcGVuZCh0aGlzLmxlYXZlUm9vbUJ0bik7XHJcblxyXG4gICAgdGhpcy5yZWFkeUJ0biA9ICQoXCI8YnV0dG9uPlwiKTtcclxuICAgIHRoaXMucmVhZHlCdG4udGV4dChcIlJlYWR5XCIpO1xyXG4gICAgdGhpcy5yZWFkeUJ0bi5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXktcmVhZHktYnRuXCIpO1xyXG4gICAgdGhpcy5yZWFkeUJ0bi5oaWRlKCk7XHJcbiAgICB0aGlzLnJpZ2h0Q29udGFpbmVyLmFwcGVuZCh0aGlzLnJlYWR5QnRuKTtcclxuXHJcbiAgICB0aGlzLmRvbU9iamVjdC5hcHBlbmQodGhpcy5sZWZ0Q29udGFpbmVyKTtcclxuICAgIHRoaXMuZG9tT2JqZWN0LmFwcGVuZCh0aGlzLnJpZ2h0Q29udGFpbmVyKTtcclxuICAgIHRoaXMuZG9tT2JqZWN0LmFkZENsYXNzKFwibG9iYnktb3ZlcmxheVwiKTtcclxuICAgIHRoaXMuZG9tT2JqZWN0LmFkZENsYXNzKFwiZmFkZS1pblwiKTtcclxufTtcclxuXHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKExvYmJ5T3ZlcmxheSwge1xyXG4gICAgRXZlbnQgOiB7XHJcbiAgICAgICAgdmFsdWUgOiB7XHJcbiAgICAgICAgICAgIEVOVEVSX1JPT00gOiBcImVudGVyUm9vbVwiXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KTtcclxuXHJcbkxvYmJ5T3ZlcmxheS5wcm90b3R5cGUgPSBPYmplY3QuZnJlZXplKE9iamVjdC5jcmVhdGUoT3ZlcmxheS5wcm90b3R5cGUsIHtcclxuICAgIHNob3dSb29tcyA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChyb29tRGF0YSkge1xyXG4gICAgICAgICAgICB0aGlzLnJvb21MaXN0Q29udGFpbmVyLmh0bWwoXCJcIik7XHJcblxyXG4gICAgICAgICAgICAkKFwiLmxvYmJ5LW92ZXJsYXktcm9vbVwiKS5vZmYoXCJjbGlja1wiKTtcclxuXHJcbiAgICAgICAgICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMocm9vbURhdGEpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGtleXMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJvb21MaXN0Q29udGFpbmVyLmh0bWwoXCJObyByb29tcyBhdmFpbGFibGVcIik7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgY3VyUm9vbSA9IHJvb21EYXRhW2tleXNbaV1dO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBjdXJSb29tQ29udGFpbmVyID0gJChcIjxkaXY+XCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGN1clJvb21Db250YWluZXIuYWRkQ2xhc3MoXCJsb2JieS1vdmVybGF5LXJvb21cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgY3VyUm9vbUNvbnRhaW5lci5odG1sKGN1clJvb20ubmFtZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICQoY3VyUm9vbUNvbnRhaW5lcikub24oXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiY2xpY2tcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3VyUm9vbSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fb25DbGlja1Jvb20uYmluZCh0aGlzKVxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucm9vbUxpc3RDb250YWluZXIuYXBwZW5kKGN1clJvb21Db250YWluZXIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICByZW5kZXJSb29tIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgaWYgKGRhdGEgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJSb29tTGFiZWwoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyUGxheWVycygpO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuX29uRXhpdFJvb20oKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyUm9vbUxhYmVsKGRhdGEubmFtZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlclBsYXllcnMoZGF0YSk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5fb25FbnRlclJvb20oKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgcmVuZGVyUm9vbUxhYmVsIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGxhYmVsKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgbGFiZWwgIT09IFwic3RyaW5nXCIgfHwgbGFiZWwgPT09IFwiXCIpIHtcclxuICAgICAgICAgICAgICAgIGxhYmVsID0gXCJObyByb29tIHNlbGVjdGVkXCI7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxhYmVsID0gXCJDdXJyZW50IHJvb206IFwiICsgbGFiZWw7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkUm9vbUxhYmVsLmh0bWwobGFiZWwpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgcmVuZGVyUGxheWVycyA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChyb29tRGF0YSkge1xyXG4gICAgICAgICAgICB0aGlzLnRlYW1BQ29udGFpbmVyLmh0bWwoXCJcIik7XHJcbiAgICAgICAgICAgIHRoaXMudGVhbUJDb250YWluZXIuaHRtbChcIlwiKTtcclxuICAgICAgICAgICAgdGhpcy5zd2l0Y2hUZWFtQnRuLmhpZGUoKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChyb29tRGF0YSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgdGVhbUEgPSByb29tRGF0YS50ZWFtQTtcclxuICAgICAgICAgICAgICAgIHZhciB0ZWFtQiA9IHJvb21EYXRhLnRlYW1CO1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciB0ZWFtQUxhYmVsID0gJChcIjxkaXY+XCIpO1xyXG4gICAgICAgICAgICAgICAgdGVhbUFMYWJlbC5odG1sKFwiUm9zZSBUZWFtXCIpO1xyXG4gICAgICAgICAgICAgICAgdGVhbUFMYWJlbC5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXktdGVhbS1sYWJlbFwiKTtcclxuICAgICAgICAgICAgICAgIHRoaXMudGVhbUFDb250YWluZXIuYXBwZW5kKHRlYW1BTGFiZWwpO1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciB0ZWFtQkxhYmVsID0gJChcIjxkaXY+XCIpO1xyXG4gICAgICAgICAgICAgICAgdGVhbUJMYWJlbC5odG1sKFwiU2t5IFRlYW1cIik7XHJcbiAgICAgICAgICAgICAgICB0ZWFtQkxhYmVsLmFkZENsYXNzKFwibG9iYnktb3ZlcmxheS10ZWFtLWxhYmVsXCIpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy50ZWFtQkNvbnRhaW5lci5hcHBlbmQodGVhbUJMYWJlbCk7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIGxvY2FsSWQgPSBOZXR3b3JrLmxvY2FsQ2xpZW50LmlkO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIEFkZCB0ZWFtIEEgcGxheWVyc1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCA0OyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbGFiZWw7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBsYXllckNvbnRhaW5lciA9ICQoXCI8ZGl2PlwiKTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcmVhZHkgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGkgPCB0ZWFtQS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGN1cklkID0gdGVhbUFbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjdXJQbGF5ZXIgPSBOZXR3b3JrLmNsaWVudHNbY3VySWRdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZWFkeSA9IGN1clBsYXllci5kYXRhLnJlYWR5O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbCA9IGN1clBsYXllci5kYXRhLnVzZXI7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3VySWQgPT09IGxvY2FsSWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBsYXllckNvbnRhaW5lci5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXktbG9jYWwtcGxheWVyLWNvbnRhaW5lclwiKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXJlYWR5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWFkeUJ0bi5odG1sKFwiUmVhZHlcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zd2l0Y2hUZWFtQnRuLnByb3AoXCJkaXNhYmxlZFwiLCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVhZHlCdG4uaHRtbChcIkNhbmNlbFwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN3aXRjaFRlYW1CdG4ucHJvcChcImRpc2FibGVkXCIsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWwgPSBcIi0tLS0tLVwiO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcGxheWVyQ29udGFpbmVyLmh0bWwobGFiZWwpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGVhbUFDb250YWluZXIuYXBwZW5kKHBsYXllckNvbnRhaW5lcik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZWFkeSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcmVhZHlDb250YWluZXIgPSAkKFwiPHNwYW4+XCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZWFkeUNvbnRhaW5lci5odG1sKFwiUmVhZHlcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlYWR5Q29udGFpbmVyLmFkZENsYXNzKFwibG9iYnktb3ZlcmxheS1yZWFkeS1jb250YWluZXJcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYXllckNvbnRhaW5lci5hcHBlbmQocmVhZHlDb250YWluZXIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyBBZGQgdGVhbSBCIHBsYXllcnNcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGxhYmVsO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBwbGF5ZXJDb250YWluZXIgPSAkKFwiPGRpdj5cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlYWR5ID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpIDwgdGVhbUIubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjdXJJZCA9IHRlYW1CW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY3VyUGxheWVyID0gTmV0d29yay5jbGllbnRzW2N1cklkXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVhZHkgPSBjdXJQbGF5ZXIuZGF0YS5yZWFkeTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWwgPSBjdXJQbGF5ZXIuZGF0YS51c2VyO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN1cklkID09PSBsb2NhbElkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwbGF5ZXJDb250YWluZXIuYWRkQ2xhc3MoXCJsb2JieS1vdmVybGF5LWxvY2FsLXBsYXllci1jb250YWluZXJcIik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFyZWFkeSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVhZHlCdG4uaHRtbChcIlJlYWR5XCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3dpdGNoVGVhbUJ0bi5wcm9wKFwiZGlzYWJsZWRcIiwgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlYWR5QnRuLmh0bWwoXCJDYW5jZWxcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zd2l0Y2hUZWFtQnRuLnByb3AoXCJkaXNhYmxlZFwiLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsID0gXCItLS0tLS1cIjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHBsYXllckNvbnRhaW5lci5odG1sKGxhYmVsKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRlYW1CQ29udGFpbmVyLmFwcGVuZChwbGF5ZXJDb250YWluZXIpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAocmVhZHkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlYWR5Q29udGFpbmVyID0gJChcIjxzcGFuPlwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVhZHlDb250YWluZXIuaHRtbChcIlJlYWR5XCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZWFkeUNvbnRhaW5lci5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXktcmVhZHktY29udGFpbmVyXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwbGF5ZXJDb250YWluZXIuYXBwZW5kKHJlYWR5Q29udGFpbmVyKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5zd2l0Y2hUZWFtQnRuLnNob3coKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX29uQ2xpY2tSb29tIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgdmFyIGRhdGEgPSBlLmRhdGE7XHJcbiAgICAgICAgICAgIHZhciByb29tID0ge1xyXG4gICAgICAgICAgICAgICAgbmFtZSA6IGRhdGEubmFtZSxcclxuICAgICAgICAgICAgICAgIGlkICAgOiBkYXRhLmlkXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAkKHRoaXMpLnRyaWdnZXIoTG9iYnlPdmVybGF5LkV2ZW50LkVOVEVSX1JPT00sIHJvb20pO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX29uRXhpdFJvb20gOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMubGVhdmVSb29tQnRuLmhpZGUoKTtcclxuICAgICAgICAgICAgdGhpcy5yZWFkeUJ0bi5oaWRlKCk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmxlZnRDb250YWluZXIucmVtb3ZlQ2xhc3MoXCJsb2JieS1vdmVybGF5LW1pbmltaXplZC1zaWRlXCIpO1xyXG4gICAgICAgICAgICB0aGlzLnJpZ2h0Q29udGFpbmVyLnJlbW92ZUNsYXNzKFwibG9iYnktb3ZlcmxheS1tYXhpbWl6ZWQtc2lkZVwiKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMubGVmdENvbnRhaW5lci5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXktbWF4aW1pemVkLXNpZGVcIik7XHJcbiAgICAgICAgICAgIHRoaXMucmlnaHRDb250YWluZXIuYWRkQ2xhc3MoXCJsb2JieS1vdmVybGF5LW1pbmltaXplZC1zaWRlXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX29uRW50ZXJSb29tIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLmxlYXZlUm9vbUJ0bi5zaG93KCk7XHJcbiAgICAgICAgICAgIHRoaXMucmVhZHlCdG4uc2hvdygpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5sZWZ0Q29udGFpbmVyLnJlbW92ZUNsYXNzKFwibG9iYnktb3ZlcmxheS1tYXhpbWl6ZWQtc2lkZVwiKTtcclxuICAgICAgICAgICAgdGhpcy5yaWdodENvbnRhaW5lci5yZW1vdmVDbGFzcyhcImxvYmJ5LW92ZXJsYXktbWluaW1pemVkLXNpZGVcIik7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmxlZnRDb250YWluZXIuYWRkQ2xhc3MoXCJsb2JieS1vdmVybGF5LW1pbmltaXplZC1zaWRlXCIpO1xyXG4gICAgICAgICAgICB0aGlzLnJpZ2h0Q29udGFpbmVyLmFkZENsYXNzKFwibG9iYnktb3ZlcmxheS1tYXhpbWl6ZWQtc2lkZVwiKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKTtcclxuXHJcbk9iamVjdC5mcmVlemUoTG9iYnlPdmVybGF5KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTG9iYnlPdmVybGF5OyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIE92ZXJsYXkgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLmRvbU9iamVjdCA9ICQoXCI8ZGl2PlwiKTtcclxuICAgIHRoaXMuZG9tT2JqZWN0LmFkZENsYXNzKFwiY2FudmFzLW92ZXJsYXlcIik7XHJcbn07XHJcblxyXG5PdmVybGF5LnByb3RvdHlwZSA9IE9iamVjdC5mcmVlemUoT2JqZWN0LmNyZWF0ZShPdmVybGF5LnByb3RvdHlwZSwge1xyXG5cclxufSkpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBPdmVybGF5OyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIE92ZXJsYXkgPSByZXF1aXJlKCcuL092ZXJsYXkuanMnKTtcclxudmFyIExvYWRpbmdPdmVybGF5ID0gcmVxdWlyZSgnLi9Mb2FkaW5nT3ZlcmxheS5qcycpO1xyXG52YXIgQ3JlYXRlUm9vbU92ZXJsYXkgPSByZXF1aXJlKCcuL0NyZWF0ZVJvb21PdmVybGF5LmpzJyk7XHJcbnZhciBHYW1lT3Zlck92ZXJsYXkgPSByZXF1aXJlKCcuL0dhbWVPdmVyT3ZlcmxheS5qcycpO1xyXG52YXIgTG9iYnlPdmVybGF5ID0gcmVxdWlyZSgnLi9Mb2JieU92ZXJsYXkuanMnKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgT3ZlcmxheSA6IE92ZXJsYXksXHJcbiAgICBMb2FkaW5nT3ZlcmxheSA6IExvYWRpbmdPdmVybGF5LFxyXG4gICAgQ3JlYXRlUm9vbU92ZXJsYXkgOiBDcmVhdGVSb29tT3ZlcmxheSxcclxuICAgIEdhbWVPdmVyT3ZlcmxheSA6IEdhbWVPdmVyT3ZlcmxheSxcclxuICAgIExvYmJ5T3ZlcmxheSA6IExvYmJ5T3ZlcmxheVxyXG59OyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIFNjZW5lID0gd2ZsLmRpc3BsYXkuU2NlbmU7XHJcbnZhciBvdmVybGF5cyA9IHJlcXVpcmUoJy4uL292ZXJsYXlzJyk7XHJcbnZhciBOZXR3b3JrID0gcmVxdWlyZSgnLi4vbmV0d29yaycpO1xyXG5cclxudmFyIEdhbWVPdmVyU2NlbmUgPSBmdW5jdGlvbiAoY2FudmFzLCByb29tKSB7XHJcbiAgICBTY2VuZS5jYWxsKHRoaXMsIGNhbnZhcyk7XHJcblxyXG4gICAgdGhpcy5yb29tID0gcm9vbTtcclxuXHJcbiAgICAkKE5ldHdvcmspLm9uKE5ldHdvcmsuRXZlbnQuR0FNRV9PVkVSX0RBVEEsIHRoaXMuX29uVXBkYXRlU2NvcmUuYmluZCh0aGlzKSk7XHJcblxyXG4gICAgaWYgKE5ldHdvcmsuaXNIb3N0KCkpIHtcclxuICAgICAgICBOZXR3b3JrLnNvY2tldC5lbWl0KE5ldHdvcmsuRXZlbnQuR0FNRV9PVkVSX0RBVEEsIHJvb20uaWQpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuZ2FtZU92ZXJPdmVybGF5ID0gbmV3IG92ZXJsYXlzLkdhbWVPdmVyT3ZlcmxheSgpO1xyXG4gICAgJChjYW52YXMpLnBhcmVudCgpLmFwcGVuZCh0aGlzLmdhbWVPdmVyT3ZlcmxheS5kb21PYmplY3QpO1xyXG5cclxuICAgIHRoaXMubG9hZGluZ092ZXJsYXkgPSBuZXcgb3ZlcmxheXMuTG9hZGluZ092ZXJsYXkoKTtcclxuICAgICQoY2FudmFzKS5wYXJlbnQoKS5hcHBlbmQodGhpcy5sb2FkaW5nT3ZlcmxheS5kb21PYmplY3QpO1xyXG5cclxuICAgIHRoaXMuZ2FtZU92ZXJPdmVybGF5LnJldHVyblRvTG9iYnlCdG4uY2xpY2sodGhpcy5fb25SZXR1cm5Ub0xvYmJ5LmJpbmQodGhpcykpO1xyXG59O1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyhHYW1lT3ZlclNjZW5lLCB7XHJcbiAgICBFdmVudCA6IHtcclxuICAgICAgICB2YWx1ZSA6IHtcclxuICAgICAgICAgICAgUkVUVVJOX1RPX0xPQkJZIDogXCJyZXR1cm5Ub0xvYmJ5XCJcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pO1xyXG5HYW1lT3ZlclNjZW5lLnByb3RvdHlwZSA9IE9iamVjdC5mcmVlemUoT2JqZWN0LmNyZWF0ZShTY2VuZS5wcm90b3R5cGUsIHtcclxuICAgIGRlc3Ryb3kgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZ2FtZU92ZXJPdmVybGF5LmRvbU9iamVjdC5yZW1vdmUoKTtcclxuICAgICAgICAgICAgdGhpcy5sb2FkaW5nT3ZlcmxheS5kb21PYmplY3QucmVtb3ZlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBfb25VcGRhdGVTY29yZSA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChlLCBkYXRhKSB7XHJcbiAgICAgICAgICAgIHRoaXMubG9hZGluZ092ZXJsYXkuZG9tT2JqZWN0LnJlbW92ZSgpO1xyXG4gICAgICAgICAgICB0aGlzLmdhbWVPdmVyT3ZlcmxheS5yZW5kZXJTY29yZShkYXRhKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIF9vblJldHVyblRvTG9iYnkgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAkKHRoaXMpLnRyaWdnZXIoXHJcbiAgICAgICAgICAgICAgICBHYW1lT3ZlclNjZW5lLkV2ZW50LlJFVFVSTl9UT19MT0JCWSxcclxuICAgICAgICAgICAgICAgIHRoaXMucm9vbVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkpO1xyXG5PYmplY3QuZnJlZXplKEdhbWVPdmVyU2NlbmUpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBHYW1lT3ZlclNjZW5lOyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIHV0aWwgPSByZXF1aXJlKCcuLi91dGlsJyk7XHJcbnZhciBBc3NldHMgPSB1dGlsLkFzc2V0cztcclxudmFyIFNjZW5lID0gd2ZsLmRpc3BsYXkuU2NlbmU7XHJcbnZhciBOZXR3b3JrID0gcmVxdWlyZSgnLi4vbmV0d29yaycpO1xyXG52YXIgR2FtZU9iamVjdCA9IHdmbC5jb3JlLmVudGl0aWVzLkdhbWVPYmplY3Q7XHJcbnZhciBQaHlzaWNzT2JqZWN0ID0gd2ZsLmNvcmUuZW50aXRpZXMuUGh5c2ljc09iamVjdDtcclxudmFyIGVudGl0aWVzID0gcmVxdWlyZSgnLi4vZW50aXRpZXMnKTtcclxudmFyIEJ1bGxldCA9IGVudGl0aWVzLkJ1bGxldDtcclxudmFyIENsaWVudFBsYXllciA9IGVudGl0aWVzLkNsaWVudFBsYXllcjtcclxudmFyIEZ1bGxCb2NrID0gZW50aXRpZXMuRnVsbEJsb2NrO1xyXG52YXIgUGxheWVyID0gZW50aXRpZXMuUGxheWVyO1xyXG52YXIgYmFja2dyb3VuZHMgPSB3ZmwuZGlzcGxheS5iYWNrZ3JvdW5kcztcclxudmFyIGdlb20gPSB3ZmwuZ2VvbTtcclxuXHJcbnZhciBHYW1lU2NlbmUgPSBmdW5jdGlvbiAoY2FudmFzLCByb29tKSB7XHJcbiAgICBTY2VuZS5jYWxsKHRoaXMsIGNhbnZhcywgcm9vbSk7XHJcblxyXG4gICAgLy8gQWRkIG90aGVyIGNsaWVudHMgdGhhdCBhcmUgYWxyZWFkeSBjb25uZWN0ZWRcclxuICAgIHZhciByb29tID0gTmV0d29yay5yb29tc1tyb29tLmlkXTtcclxuICAgIHZhciBwbGF5ZXJzID0gcm9vbS5wbGF5ZXJzO1xyXG5cclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGxheWVycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHZhciBpZCA9IHBsYXllcnNbaV07XHJcbiAgICAgICAgdmFyIGNsaWVudCA9IE5ldHdvcmsuY2xpZW50c1tpZF07XHJcblxyXG4gICAgICAgIGlmIChjbGllbnQgIT09IE5ldHdvcmsubG9jYWxDbGllbnQpIHtcclxuICAgICAgICAgICAgdmFyIGdhbWVPYmplY3QgPSBuZXcgQ2xpZW50UGxheWVyKGNsaWVudC5kYXRhLnRlYW0pO1xyXG4gICAgICAgICAgICBjbGllbnQuZ2FtZU9iamVjdCA9IGdhbWVPYmplY3Q7XHJcbiAgICAgICAgICAgIGNsaWVudC5nYW1lT2JqZWN0LmN1c3RvbURhdGEuY2xpZW50SWQgPSBjbGllbnQuZGF0YS5pZDtcclxuICAgICAgICAgICAgdGhpcy5hZGRHYW1lT2JqZWN0KGdhbWVPYmplY3QsIDEpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAkKE5ldHdvcmspLm9uKFxyXG4gICAgICAgIE5ldHdvcmsuRXZlbnQuQlVMTEVULFxyXG4gICAgICAgIHRoaXMub25CdWxsZXQuYmluZCh0aGlzKVxyXG4gICAgKTtcclxuXHJcbiAgICAkKE5ldHdvcmspLm9uKFxyXG4gICAgICAgIE5ldHdvcmsuRXZlbnQuQ0xPQ0tfVElDSyxcclxuICAgICAgICB0aGlzLm9uQ2xvY2tUaWNrLmJpbmQodGhpcylcclxuICAgICk7XHJcblxyXG4gICAgJChOZXR3b3JrKS5vbihcclxuICAgICAgICBOZXR3b3JrLkV2ZW50LkNPVU5URE9XTixcclxuICAgICAgICB0aGlzLm9uQ291bnRkb3duLmJpbmQodGhpcylcclxuICAgICk7XHJcblxyXG4gICAgJChOZXR3b3JrKS5vbihcclxuICAgICAgICBOZXR3b3JrLkV2ZW50LlBMQVlFUl9ERUFUSCxcclxuICAgICAgICB0aGlzLm9uUGxheWVyRGVhdGguYmluZCh0aGlzKVxyXG4gICAgKTtcclxuXHJcbiAgICAkKE5ldHdvcmspLm9uKFxyXG4gICAgICAgIE5ldHdvcmsuRXZlbnQuUExBWUVSX1JFU1BBV04sXHJcbiAgICAgICAgdGhpcy5vblBsYXllclJlc3Bhd24uYmluZCh0aGlzKVxyXG4gICAgKTtcclxuXHJcbiAgICB0aGlzLnRpbWVSZW1haW5pbmcgPSByb29tLnRpbWVSZW1haW5pbmc7XHJcbiAgICB0aGlzLmluaXRpYWxDb3VudGRvd24gPSByb29tLmNvdW50ZG93bjtcclxuICAgIHRoaXMuY291bnRpbmdEb3duID0gdHJ1ZTtcclxuICAgIHRoaXMucmVzcGF3blRpbWUgPSByb29tLnJlc3Bhd25UaW1lO1xyXG4gICAgdGhpcy5yZXNwYXduVGltZVJlbWFpbmluZyA9IHRoaXMucmVzcGF3blRpbWU7XHJcblxyXG4gICAgdmFyIHdhbGxTaXplID0gMTA7XHJcbiAgICB2YXIgYmxvY2tTaXplID0gMTI4O1xyXG4gICAgdmFyIG9mZnNldCA9IC0od2FsbFNpemUgKiAwLjUgLSAxKSAqIGJsb2NrU2l6ZTtcclxuXHJcbiAgICAvLyBMaW5lIHRoZSB0b3BcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgOTsgaSsrKSB7XHJcbiAgICAgICAgdmFyIG5ld0Jsb2NrID0gbmV3IEZ1bGxCb2NrKCk7XHJcbiAgICAgICAgbmV3QmxvY2sucG9zaXRpb24ueCA9IGJsb2NrU2l6ZSAqIGkgKyBvZmZzZXQ7XHJcbiAgICAgICAgbmV3QmxvY2sucG9zaXRpb24ueSA9IG9mZnNldDtcclxuXHJcbiAgICAgICAgdGhpcy5hZGRHYW1lT2JqZWN0KG5ld0Jsb2NrKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBMaW5lIHRoZSBib3R0b21cclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgOTsgaSsrKSB7XHJcbiAgICAgICAgdmFyIG5ld0Jsb2NrID0gbmV3IEZ1bGxCb2NrKCk7XHJcbiAgICAgICAgbmV3QmxvY2sucG9zaXRpb24ueCA9IGJsb2NrU2l6ZSAqIGkgKyBvZmZzZXQ7XHJcbiAgICAgICAgbmV3QmxvY2sucG9zaXRpb24ueSA9IC1vZmZzZXQ7XHJcblxyXG4gICAgICAgIHRoaXMuYWRkR2FtZU9iamVjdChuZXdCbG9jayk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gTGluZSB0aGUgbGVmdFxyXG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCA4OyBpKyspIHtcclxuICAgICAgICB2YXIgbmV3QmxvY2sgPSBuZXcgRnVsbEJvY2soKTtcclxuICAgICAgICBuZXdCbG9jay5wb3NpdGlvbi54ID0gb2Zmc2V0O1xyXG4gICAgICAgIG5ld0Jsb2NrLnBvc2l0aW9uLnkgPSBibG9ja1NpemUgKiBpICsgb2Zmc2V0O1xyXG5cclxuICAgICAgICB0aGlzLmFkZEdhbWVPYmplY3QobmV3QmxvY2spO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIExpbmUgdGhlIHJpZ2h0XHJcbiAgICBmb3IgKHZhciBpID0gMTsgaSA8IDg7IGkrKykge1xyXG4gICAgICAgIHZhciBuZXdCbG9jayA9IG5ldyBGdWxsQm9jaygpO1xyXG4gICAgICAgIG5ld0Jsb2NrLnBvc2l0aW9uLnggPSAtb2Zmc2V0O1xyXG4gICAgICAgIG5ld0Jsb2NrLnBvc2l0aW9uLnkgPSBibG9ja1NpemUgKiBpICsgb2Zmc2V0O1xyXG5cclxuICAgICAgICB0aGlzLmFkZEdhbWVPYmplY3QobmV3QmxvY2spO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuYmcgPSBuZXcgYmFja2dyb3VuZHMuUGFyYWxsYXhCYWNrZ3JvdW5kKFxyXG4gICAgICAgIEFzc2V0cy5nZXQoQXNzZXRzLkJHX1RJTEUpXHJcbiAgICApO1xyXG5cclxuICAgIHRoaXMucGxheWVyID0gbmV3IFBsYXllcihOZXR3b3JrLmxvY2FsQ2xpZW50LmRhdGEudGVhbSk7XHJcblxyXG4gICAgTmV0d29yay5sb2NhbENsaWVudC5nYW1lT2JqZWN0ID0gdGhpcy5wbGF5ZXI7XHJcbiAgICB0aGlzLnBsYXllci5jdXN0b21EYXRhLmNsaWVudElkID0gTmV0d29yay5sb2NhbENsaWVudC5kYXRhLmlkO1xyXG4gICAgdGhpcy5hZGRHYW1lT2JqZWN0KHRoaXMucGxheWVyLCAyKTtcclxuXHJcbiAgICB0aGlzLmNhbWVyYS5mb2xsb3codGhpcy5wbGF5ZXIpO1xyXG59O1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyhHYW1lU2NlbmUsIHtcclxuICAgIEZSSUNUSU9OIDoge1xyXG4gICAgICAgIHZhbHVlIDogMC45MjVcclxuICAgIH0sXHJcblxyXG4gICAgTUlOSU1BUCA6IHtcclxuICAgICAgICB2YWx1ZSA6IE9iamVjdC5mcmVlemUoe1xyXG4gICAgICAgICAgICBXSURUSCAgICAgIDogMTUwLFxyXG4gICAgICAgICAgICBIRUlHSFQgICAgIDogMTAwLFxyXG4gICAgICAgICAgICBTQ0FMRSAgICAgIDogMC4xLFxyXG4gICAgICAgICAgICBGSUxMX1NUWUxFIDogXCIjMTkyNDI3XCJcclxuICAgICAgICB9KVxyXG4gICAgfVxyXG59KTtcclxuR2FtZVNjZW5lLnByb3RvdHlwZSA9IE9iamVjdC5mcmVlemUoT2JqZWN0LmNyZWF0ZShTY2VuZS5wcm90b3R5cGUsIHtcclxuICAgIC8qKlxyXG4gICAgICogVXBkYXRlcyB0aGUgc2NlbmUgYW5kIGFsbCBnYW1lIG9iamVjdHMgaW4gaXRcclxuICAgICAqL1xyXG4gICAgdXBkYXRlIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGR0KSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmNvdW50aW5nRG93biA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pbml0aWFsQ291bnRkb3duIC09IGR0O1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChOZXR3b3JrLmlzSG9zdCgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZW5kQ291bnRkb3duKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaW5pdGlhbENvdW50ZG93biA8PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb3VudGluZ0Rvd24gPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIFNjZW5lLnByb3RvdHlwZS51cGRhdGUuY2FsbCh0aGlzLCBkdCk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy50aW1lUmVtYWluaW5nIC09IGR0O1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIE1ha2UgdGhlIGNhbWVyYSBmb2xsb3cgdGhlIGtpbGxlciBpZiB0aGUgcGxheWVyIHdhcyBraWxsZWRcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnBsYXllci5oZWFsdGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9oYW5kbGVQbGF5ZXJEZWF0aChkdCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gT3RoZXJ3aXNlLCBhbGxvdyB0aGUgcGxheWVyIHRvIG1vdmVcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5faGFuZGxlSW5wdXQoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLl9hcHBseUZyaWN0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9yZW1vdmVEZWFkR2FtZU9iamVjdHMoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoTmV0d29yay5pc0hvc3QoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VuZENsb2NrVGljaygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBzZW5kQ291bnRkb3duIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAoTmV0d29yay5jb25uZWN0ZWQpIHtcclxuICAgICAgICAgICAgICAgIE5ldHdvcmsuc29ja2V0LmVtaXQoJ2NvdW50ZG93bicsIHtcclxuICAgICAgICAgICAgICAgICAgICBjb3VudGRvd24gOiB0aGlzLmluaXRpYWxDb3VudGRvd25cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBzZW5kQ2xvY2tUaWNrIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAoTmV0d29yay5jb25uZWN0ZWQpIHtcclxuICAgICAgICAgICAgICAgIE5ldHdvcmsuc29ja2V0LmVtaXQoJ2Nsb2NrVGljaycsIHtcclxuICAgICAgICAgICAgICAgICAgICB0aW1lUmVtYWluaW5nIDogdGhpcy50aW1lUmVtYWluaW5nXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgc2VuZFBsYXllckRlYXRoIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAoTmV0d29yay5jb25uZWN0ZWQpIHtcclxuICAgICAgICAgICAgICAgIE5ldHdvcmsuc29ja2V0LmVtaXQoJ3BsYXllckRlYXRoJywge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlYWQgOiB0aGlzLnBsYXllci5jdXN0b21EYXRhLmNsaWVudElkLFxyXG4gICAgICAgICAgICAgICAgICAgIGtpbGxlciA6IHRoaXMucGxheWVyLmN1c3RvbURhdGEua2lsbGVyLmN1c3RvbURhdGEuY2xpZW50SWRcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIERyYXdzIHRoZSBzY2VuZSBhbmQgYWxsIGdhbWUgb2JqZWN0cyBpbiBpdFxyXG4gICAgICovXHJcbiAgICBkcmF3IDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGN0eCkge1xyXG4gICAgICAgICAgICBTY2VuZS5wcm90b3R5cGUuZHJhdy5jYWxsKHRoaXMsIGN0eCk7XHJcblxyXG4gICAgICAgICAgICBjdHguc2F2ZSgpO1xyXG5cclxuICAgICAgICAgICAgdmFyIHNjcmVlbldpZHRoICA9IGN0eC5jYW52YXMud2lkdGg7XHJcbiAgICAgICAgICAgIHZhciBzY3JlZW5IZWlnaHQgPSBjdHguY2FudmFzLmhlaWdodDtcclxuICAgICAgICAgICAgdmFyIG9mZnNldCAgICAgICA9IG5ldyBnZW9tLlZlYzIoXHJcbiAgICAgICAgICAgICAgICBzY3JlZW5XaWR0aCAgKiAwLjUsXHJcbiAgICAgICAgICAgICAgICBzY3JlZW5IZWlnaHQgKiAwLjVcclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIGN0eC5maWxsU3R5bGUgPSBcIiNmZmZcIjtcclxuICAgICAgICAgICAgY3R4LmZvbnQgPSBcIjI0cHggTXVucm9cIjtcclxuXHJcbiAgICAgICAgICAgIC8vIFNob3cgdGhlIHJlbWFpbmluZyBkdXJhdGlvbiBvZiB0aGUgZ2FtZVxyXG4gICAgICAgICAgICB2YXIgdGltZVRleHQ7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnRpbWVSZW1haW5pbmcgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbWludXRlcyA9IE1hdGguZmxvb3IoKHRoaXMudGltZVJlbWFpbmluZyArIDk5OSkgLyAoMTAwMCAqIDYwKSk7XHJcbiAgICAgICAgICAgICAgICB2YXIgc2Vjb25kcyA9IE1hdGgucm91bmQoKHRoaXMudGltZVJlbWFpbmluZyAtIG1pbnV0ZXMgKiAxMDAwICogNjApIC8gMTAwMCk7XHJcbiAgICAgICAgICAgICAgICB0aW1lVGV4dCA9IG1pbnV0ZXMgKyBcIjpcIjtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoc2Vjb25kcyA8IDEwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGltZVRleHQgKz0gXCIwXCI7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdGltZVRleHQgKz0gc2Vjb25kcztcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRpbWVUZXh0ID0gXCIwOjAwXCI7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnRpbWVSZW1haW5pbmcgPCAxMDAwICogMTApIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnRpbWVSZW1haW5pbmcgJSA1MDAgPCAyNTApIHtcclxuICAgICAgICAgICAgICAgICAgICBjdHguZmlsbFN0eWxlID0gXCJyZ2IoMjU1LCA3OSwgNzkpXCI7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGN0eC5maWxsU3R5bGUgPSBcInJnYmEoMCwgMCwgMCwgMClcIjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGN0eC5mb250ID0gXCIzMHB4IE11bnJvXCI7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy50aW1lUmVtYWluaW5nIDwgMTAwMCAqIDMwKSB7XHJcbiAgICAgICAgICAgICAgICBjdHguZmlsbFN0eWxlID0gXCJyZ2IoMjQxLCAyMDgsIDkyKVwiO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjdHgudHJhbnNsYXRlKG9mZnNldC54LCAwKTtcclxuICAgICAgICAgICAgY3R4LnRleHRBbGlnbiA9IFwiY2VudGVyXCI7XHJcbiAgICAgICAgICAgIGN0eC50ZXh0QmFzZWxpbmUgPSBcInRvcFwiO1xyXG4gICAgICAgICAgICBjdHguZmlsbFRleHQodGltZVRleHQsIDAsIDApO1xyXG5cclxuICAgICAgICAgICAgLy8gU2hvdyB0aGUgaW5pdGlhbCBjb3VudGRvd24gYmVmb3JlIHRoZSBnYW1lXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmluaXRpYWxDb3VudGRvd24gPiAwKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgY291bnRkb3duU2Vjb25kcyA9IE1hdGgucm91bmQodGhpcy5pbml0aWFsQ291bnRkb3duIC8gMTAwMCk7XHJcbiAgICAgICAgICAgICAgICB2YXIgY291bnRkb3duVGV4dCA9IGNvdW50ZG93blNlY29uZHMudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgICAgIGN0eC5maWxsU3R5bGUgPSBcIiNmZmZcIjtcclxuXHJcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKGNvdW50ZG93blNlY29uZHMpIHtcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICBjYXNlIDU6XHJcbiAgICAgICAgICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9IFwicmdiKDI1NSwgNzksIDc5KVwiO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgICAgIGNhc2UgNDpcclxuICAgICAgICAgICAgICAgICAgICBjdHguZmlsbFN0eWxlID0gXCJyZ2IoMjQ3LCAxNTUsIDg3KVwiO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgICAgIGNhc2UgMzpcclxuICAgICAgICAgICAgICAgICAgICBjdHguZmlsbFN0eWxlID0gXCJyZ2IoMjQxLCAyMDgsIDkyKVwiO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgICAgIGNhc2UgMjpcclxuICAgICAgICAgICAgICAgICAgICBjdHguZmlsbFN0eWxlID0gXCJyZ2IoMjE1LCAyMzUsIDk5KVwiO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgICAgICAgICBjdHguZmlsbFN0eWxlID0gXCJyZ2IoMTMyLCAyMzEsIDEwMylcIjtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgICAgICBjYXNlIDA6XHJcbiAgICAgICAgICAgICAgICAgICAgY291bnRkb3duVGV4dCA9IFwiRklHSFRcIjtcclxuICAgICAgICAgICAgICAgICAgICBjdHguZmlsbFN0eWxlID0gXCIjZmZmXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgY3R4LnRyYW5zbGF0ZSgwLCBvZmZzZXQueSk7XHJcbiAgICAgICAgICAgICAgICBjdHgudGV4dEFsaWduID0gXCJjZW50ZXJcIjtcclxuICAgICAgICAgICAgICAgIGN0eC50ZXh0QmFzZWxpbmUgPSBcIm1pZGRsZVwiO1xyXG4gICAgICAgICAgICAgICAgY3R4LmZvbnQgPSBcIjk2cHggTXVucm9cIjtcclxuICAgICAgICAgICAgICAgIGN0eC5maWxsVGV4dChjb3VudGRvd25UZXh0LCAwLCAwKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY3R4LnJlc3RvcmUoKTtcclxuXHJcbiAgICAgICAgICAgIC8vIERyYXcgSFBcclxuICAgICAgICAgICAgY3R4LnNhdmUoKTtcclxuXHJcbiAgICAgICAgICAgIGN0eC50cmFuc2xhdGUoNCwgNCk7XHJcblxyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucGxheWVyLm1heEhlYWx0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZ3JhcGhpYztcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnBsYXllci5oZWFsdGggPiBpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZ3JhcGhpYyA9IEFzc2V0cy5nZXQoQXNzZXRzLkhQX0ZVTEwpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBncmFwaGljID0gQXNzZXRzLmdldChBc3NldHMuSFBfRU1QVFkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGN0eC5kcmF3SW1hZ2UoZ3JhcGhpYywgMCwgMCk7XHJcbiAgICAgICAgICAgICAgICBjdHgudHJhbnNsYXRlKDI0LCAwKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY3R4LnJlc3RvcmUoKTtcclxuXHJcbiAgICAgICAgICAgIC8vIERyYXcgUmVzcGF3biBtZXNzYWdlIGlmIG5lY2Vzc2FyeVxyXG4gICAgICAgICAgICBpZiAodGhpcy5wbGF5ZXIuaGVhbHRoIDw9IDApIHtcclxuICAgICAgICAgICAgICAgIGN0eC5zYXZlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIHJlc3Bhd25UaW1lUmVtYWluaW5nID0gTWF0aC5yb3VuZCh0aGlzLnJlc3Bhd25UaW1lUmVtYWluaW5nIC8gMTAwMCk7XHJcbiAgICAgICAgICAgICAgICB2YXIgcmVzcGF3bk1lc3NhZ2UgPSBcIlJlc3Bhd24gaW4gXCIgKyByZXNwYXduVGltZVJlbWFpbmluZy50b1N0cmluZygpICsgXCIgc2Vjb25kc1wiO1xyXG5cclxuICAgICAgICAgICAgICAgIGN0eC50cmFuc2xhdGUob2Zmc2V0LngsIG9mZnNldC55KTtcclxuICAgICAgICAgICAgICAgIGN0eC50ZXh0QWxpZ24gPSBcImNlbnRlclwiO1xyXG4gICAgICAgICAgICAgICAgY3R4LnRleHRCYXNlbGluZSA9IFwibWlkZGxlXCI7XHJcbiAgICAgICAgICAgICAgICBjdHguZm9udCA9IFwiNDhweCBNdW5yb1wiO1xyXG4gICAgICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9IFwiI2ZmZlwiO1xyXG4gICAgICAgICAgICAgICAgY3R4LmZpbGxUZXh0KHJlc3Bhd25NZXNzYWdlLCAwLCAwKTtcclxuXHJcbiAgICAgICAgICAgICAgICBjdHgucmVzdG9yZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBvbkNvdW50ZG93biA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChlLCBkYXRhKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaW5pdGlhbENvdW50ZG93biA9IGRhdGEuY291bnRkb3duO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgb25DbG9ja1RpY2sgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoZSwgZGF0YSkge1xyXG4gICAgICAgICAgICB0aGlzLnRpbWVSZW1haW5pbmcgPSBkYXRhLnRpbWVSZW1haW5pbmc7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBvbkJ1bGxldCA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChlLCBkYXRhKSB7XHJcbiAgICAgICAgICAgIHZhciByb3RhdGlvbiA9IFBoeXNpY3NPYmplY3QucHJvdG90eXBlLmdldERpc3BsYXlBbmdsZShkYXRhLnJvdGF0aW9uKTtcclxuICAgICAgICAgICAgdmFyIGZvcndhcmQgPSBnZW9tLlZlYzIuZnJvbUFuZ2xlKHJvdGF0aW9uKTtcclxuICAgICAgICAgICAgdmFyIHBsYXllciA9IE5ldHdvcmsuY2xpZW50c1tkYXRhLnBsYXllcklkXS5nYW1lT2JqZWN0O1xyXG4gICAgICAgICAgICB2YXIgYnVsbGV0ID0gbmV3IEJ1bGxldCgxLCBwbGF5ZXIpO1xyXG4gICAgICAgICAgICBidWxsZXQucG9zaXRpb24ueCA9IGRhdGEucG9zaXRpb24ueDtcclxuICAgICAgICAgICAgYnVsbGV0LnBvc2l0aW9uLnkgPSBkYXRhLnBvc2l0aW9uLnk7XHJcbiAgICAgICAgICAgIGJ1bGxldC52ZWxvY2l0eS54ID0gZm9yd2FyZC54O1xyXG4gICAgICAgICAgICBidWxsZXQudmVsb2NpdHkueSA9IGZvcndhcmQueTtcclxuICAgICAgICAgICAgYnVsbGV0LnJvdGF0ZShyb3RhdGlvbik7XHJcbiAgICAgICAgICAgIGJ1bGxldC52ZWxvY2l0eS5tdWx0aXBseShCdWxsZXQuREVGQVVMVF9TUEVFRCk7XHJcbiAgICAgICAgICAgIGJ1bGxldC52ZWxvY2l0eS54ICs9IGRhdGEudmVsb2NpdHkueDtcclxuICAgICAgICAgICAgYnVsbGV0LnZlbG9jaXR5LnkgKz0gZGF0YS52ZWxvY2l0eS55O1xyXG5cclxuICAgICAgICAgICAgaWYgKGJ1bGxldC52ZWxvY2l0eS5nZXRNYWduaXR1ZGVTcXVhcmVkKCkgPCBCdWxsZXQuREVGQVVMVF9TUEVFRCAqIEJ1bGxldC5ERUZBVUxUX1NQRUVEKSB7XHJcbiAgICAgICAgICAgICAgICBidWxsZXQudmVsb2NpdHkuc2V0TWFnbml0dWRlKEJ1bGxldC5ERUZBVUxUX1NQRUVEKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5hZGRHYW1lT2JqZWN0KGJ1bGxldCwgMSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBvblBsYXllckRlYXRoIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGUsIGRhdGEpIHtcclxuICAgICAgICAgICAgdmFyIHBsYXllciA9IE5ldHdvcmsuY2xpZW50c1tkYXRhLmRlYWRdLmdhbWVPYmplY3Q7XHJcbiAgICAgICAgICAgIHBsYXllci5zb2xpZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICBwbGF5ZXIuc2V0U3RhdGUoUGxheWVyLlNUQVRFLkVYUExPU0lPTik7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBvblBsYXllclJlc3Bhd24gOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoZSwgZGF0YSkge1xyXG4gICAgICAgICAgICB2YXIgcGxheWVyID0gTmV0d29yay5jbGllbnRzW2RhdGEucmVzcGF3bl0uZ2FtZU9iamVjdDtcclxuICAgICAgICAgICAgcGxheWVyLnNldFN0YXRlKEdhbWVPYmplY3QuU1RBVEUuREVGQVVMVCk7XHJcbiAgICAgICAgICAgIHBsYXllci5oZWFsdGggPSBwbGF5ZXIubWF4SGVhbHRoO1xyXG4gICAgICAgICAgICBwbGF5ZXIuc29saWQgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgLy8gSWYgdGhpcyBjbGllbnQncyBwbGF5ZXIgaXMgcmVzcGF3bmluZywgdGhlbiBtYWtlIHRoZSBjYW1lcmFcclxuICAgICAgICAgICAgLy8gc3RhcnQgZm9sbG93aW5nIGl0IGFnYWluXHJcbiAgICAgICAgICAgIGlmIChwbGF5ZXIgPT09IHRoaXMucGxheWVyKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNhbWVyYS5mb2xsb3cocGxheWVyKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX2hhbmRsZUlucHV0IDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgcGxheWVyICAgICAgID0gdGhpcy5wbGF5ZXI7XHJcbiAgICAgICAgICAgIHZhciBrZXlib2FyZCAgICAgPSB0aGlzLmtleWJvYXJkO1xyXG4gICAgICAgICAgICB2YXIgbGVmdFByZXNzZWQgID0ga2V5Ym9hcmQuaXNQcmVzc2VkKGtleWJvYXJkLkxFRlQpO1xyXG4gICAgICAgICAgICB2YXIgcmlnaHRQcmVzc2VkID0ga2V5Ym9hcmQuaXNQcmVzc2VkKGtleWJvYXJkLlJJR0hUKTtcclxuICAgICAgICAgICAgdmFyIHVwUHJlc3NlZCAgICA9IGtleWJvYXJkLmlzUHJlc3NlZChrZXlib2FyZC5VUCk7XHJcbiAgICAgICAgICAgIHZhciBkb3duUHJlc3NlZCAgPSBrZXlib2FyZC5pc1ByZXNzZWQoa2V5Ym9hcmQuRE9XTik7XHJcbiAgICAgICAgICAgIHZhciBzaG9vdGluZyAgICAgPSBrZXlib2FyZC5pc1ByZXNzZWQoa2V5Ym9hcmQuWik7XHJcblxyXG4gICAgICAgICAgICAvLyBMZWZ0LyBSaWdodCBLZXkgLS0gUGxheWVyIHR1cm5zXHJcbiAgICAgICAgICAgIGlmIChsZWZ0UHJlc3NlZCB8fCByaWdodFByZXNzZWQpIHtcclxuICAgICAgICAgICAgICAgIHZhciByb3RhdGlvbiA9IDA7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGxlZnRQcmVzc2VkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcm90YXRpb24gLT0gUGxheWVyLlRVUk5fU1BFRUQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHJpZ2h0UHJlc3NlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJvdGF0aW9uICs9IFBsYXllci5UVVJOX1NQRUVEO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHBsYXllci5yb3RhdGUocm90YXRpb24pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBVcCBLZXkgLS0gUGxheWVyIGdvZXMgZm9yd2FyZFxyXG4gICAgICAgICAgICBpZiAodXBQcmVzc2VkKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbW92ZW1lbnRGb3JjZSA9IGdlb20uVmVjMi5mcm9tQW5nbGUocGxheWVyLmdldFJvdGF0aW9uKCkpO1xyXG4gICAgICAgICAgICAgICAgbW92ZW1lbnRGb3JjZS5tdWx0aXBseShcclxuICAgICAgICAgICAgICAgICAgICBQbGF5ZXIuQk9PU1RfQUNDRUxFUkFUSU9OICogcGxheWVyLm1hc3NcclxuICAgICAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAgICAgcGxheWVyLmFkZEZvcmNlKG1vdmVtZW50Rm9yY2UpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBEb3duIEtleSAtLSBBcHBseSBicmFrZXMgdG8gcGxheWVyXHJcbiAgICAgICAgICAgIGlmIChkb3duUHJlc3NlZCkge1xyXG4gICAgICAgICAgICAgICAgcGxheWVyLnZlbG9jaXR5Lm11bHRpcGx5KFBsYXllci5CUkFLRV9SQVRFKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHNob290aW5nKSB7XHJcbiAgICAgICAgICAgICAgICBwbGF5ZXIuc2hvb3QoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX2hhbmRsZVBsYXllckRlYXRoIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGR0KSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnBsYXllci5jdXN0b21EYXRhLmtpbGxlcikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZW5kUGxheWVyRGVhdGgoKTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmNhbWVyYS5mb2xsb3codGhpcy5wbGF5ZXIuY3VzdG9tRGF0YS5raWxsZXIpO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMucGxheWVyLmN1c3RvbURhdGEua2lsbGVyID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbGF5ZXIuc2V0U3RhdGUoUGxheWVyLlNUQVRFLkVYUExPU0lPTik7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5yZXNwYXduVGltZVJlbWFpbmluZyA9IHRoaXMucmVzcGF3blRpbWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMucmVzcGF3blRpbWVSZW1haW5pbmcgLT0gZHQ7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBfYXBwbHlGcmljdGlvbiA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIGdhbWVPYmplY3RzID0gdGhpcy5nZXRHYW1lT2JqZWN0cygpO1xyXG5cclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBnYW1lT2JqZWN0cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgdmFyIG9iaiA9IGdhbWVPYmplY3RzW2ldO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFvYmouY3VzdG9tRGF0YS5pZ25vcmVGcmljdGlvbikge1xyXG4gICAgICAgICAgICAgICAgICAgIG9iai5hY2NlbGVyYXRpb24ubXVsdGlwbHkoR2FtZVNjZW5lLkZSSUNUSU9OKTtcclxuICAgICAgICAgICAgICAgICAgICBvYmoudmVsb2NpdHkubXVsdGlwbHkoR2FtZVNjZW5lLkZSSUNUSU9OKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX3JlbW92ZURlYWRHYW1lT2JqZWN0cyA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIGdhbWVPYmplY3RzID0gdGhpcy5nZXRHYW1lT2JqZWN0cygpO1xyXG5cclxuICAgICAgICAgICAgLy8gR28gdGhyb3VnaCBhbGwgZ2FtZSBvYmplY3RzIGFuZCByZW1vdmUgYW55IHRoYXQgaGF2ZSBiZWVuXHJcbiAgICAgICAgICAgIC8vIGZsYWdnZWQgZm9yIHJlbW92YWxcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IGdhbWVPYmplY3RzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgb2JqID0gZ2FtZU9iamVjdHNbaV07XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKG9iai5jdXN0b21EYXRhLnJlbW92ZWQgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZUdhbWVPYmplY3Qob2JqKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBHYW1lU2NlbmU7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgU2NlbmUgPSB3ZmwuZGlzcGxheS5TY2VuZTtcclxudmFyIG92ZXJsYXlzID0gcmVxdWlyZSgnLi4vb3ZlcmxheXMnKTtcclxuXHJcbnZhciBMb2FkaW5nU2NlbmUgPSBmdW5jdGlvbiAoY2FudmFzKSB7XHJcbiAgICBTY2VuZS5jYWxsKHRoaXMsIGNhbnZhcyk7XHJcbiAgICBcclxuICAgIHRoaXMubG9hZGluZ092ZXJsYXkgPSBuZXcgb3ZlcmxheXMuTG9hZGluZ092ZXJsYXkoKTtcclxuICAgICQoY2FudmFzKS5wYXJlbnQoKS5hcHBlbmQodGhpcy5sb2FkaW5nT3ZlcmxheS5kb21PYmplY3QpO1xyXG59O1xyXG5Mb2FkaW5nU2NlbmUucHJvdG90eXBlID0gT2JqZWN0LmZyZWV6ZShPYmplY3QuY3JlYXRlKFNjZW5lLnByb3RvdHlwZSwge1xyXG4gICAgZGVzdHJveSA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy5sb2FkaW5nT3ZlcmxheS5kb21PYmplY3QucmVtb3ZlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IExvYWRpbmdTY2VuZTsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBTY2VuZSA9IHdmbC5kaXNwbGF5LlNjZW5lO1xyXG52YXIgb3ZlcmxheXMgPSByZXF1aXJlKCcuLi9vdmVybGF5cycpO1xyXG52YXIgTmV0d29yayA9IHJlcXVpcmUoJy4uL25ldHdvcmsnKTtcclxuXHJcbnZhciBMb2JieVNjZW5lID0gZnVuY3Rpb24gKGNhbnZhcykge1xyXG4gICAgU2NlbmUuY2FsbCh0aGlzLCBjYW52YXMpO1xyXG5cclxuICAgIHRoaXMuY3VyUm9vbUlkID0gdW5kZWZpbmVkO1xyXG5cclxuICAgIHRoaXMubG9iYnlPdmVybGF5ID0gbmV3IG92ZXJsYXlzLkxvYmJ5T3ZlcmxheSgpO1xyXG4gICAgdGhpcy5jcmVhdGVSb29tT3ZlcmxheSA9IG5ldyBvdmVybGF5cy5DcmVhdGVSb29tT3ZlcmxheSgpO1xyXG4gICAgJChjYW52YXMpLnBhcmVudCgpLmFwcGVuZCh0aGlzLmxvYmJ5T3ZlcmxheS5kb21PYmplY3QpO1xyXG4gICAgJChjYW52YXMpLnBhcmVudCgpLmFwcGVuZCh0aGlzLmNyZWF0ZVJvb21PdmVybGF5LmRvbU9iamVjdCk7XHJcblxyXG4gICAgdGhpcy5jcmVhdGVSb29tT3ZlcmxheS5kb21PYmplY3QuaGlkZSgpO1xyXG5cclxuICAgIHRoaXMubG9iYnlPdmVybGF5LmxlYXZlUm9vbUJ0bi5jbGljayh0aGlzLl9vbkxlYXZlUm9vbUJ1dHRvbkNsaWNrLmJpbmQodGhpcykpO1xyXG4gICAgdGhpcy5sb2JieU92ZXJsYXkucmVhZHlCdG4uY2xpY2sodGhpcy5fb25SZWFkeUJ1dHRvbkNsaWNrLmJpbmQodGhpcykpO1xyXG4gICAgdGhpcy5sb2JieU92ZXJsYXkuc3dpdGNoVGVhbUJ0bi5jbGljayh0aGlzLl9vblN3aXRjaFRlYW1CdXR0b25DbGljay5iaW5kKHRoaXMpKTtcclxuICAgIHRoaXMubG9iYnlPdmVybGF5LmNyZWF0ZVJvb21CdG4uY2xpY2sodGhpcy5fb25DcmVhdGVSb29tQnV0dG9uQ2xpY2suYmluZCh0aGlzKSk7XHJcblxyXG4gICAgdGhpcy5jcmVhdGVSb29tT3ZlcmxheS5jYW5jZWxCdG4uY2xpY2sodGhpcy5fb25DcmVhdGVSb29tQ2FuY2VsLmJpbmQodGhpcykpO1xyXG4gICAgdGhpcy5jcmVhdGVSb29tT3ZlcmxheS5jcmVhdGVCdG4uY2xpY2sodGhpcy5fb25DcmVhdGVSb29tLmJpbmQodGhpcykpO1xyXG5cclxuICAgICQodGhpcy5sb2JieU92ZXJsYXkpLm9uKG92ZXJsYXlzLkxvYmJ5T3ZlcmxheS5FdmVudC5FTlRFUl9ST09NLCB0aGlzLl9vbkVudGVyUm9vbUF0dGVtcHQuYmluZCh0aGlzKSk7XHJcblxyXG4gICAgJChOZXR3b3JrKS5vbihOZXR3b3JrLkV2ZW50LlVQREFURV9ST09NUywgdGhpcy5fb25VcGRhdGVSb29tTGlzdC5iaW5kKHRoaXMpKTtcclxuICAgICQoTmV0d29yaykub24oTmV0d29yay5FdmVudC5FTlRFUl9ST09NX1NVQ0NFU1MsIHRoaXMuX29uRW50ZXJSb29tU3VjY2Vzcy5iaW5kKHRoaXMpKTtcclxuICAgICQoTmV0d29yaykub24oTmV0d29yay5FdmVudC5FTlRFUl9ST09NX0ZBSUwsIHRoaXMuX29uRW50ZXJSb29tRmFpbC5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICB0aGlzLnJvb21VcGRhdGVJbnRlcnZhbCA9XHJcbiAgICAgICAgc2V0SW50ZXJ2YWwodGhpcy51cGRhdGVSb29tTGlzdC5iaW5kKHRoaXMpLCBMb2JieVNjZW5lLlJPT01fVVBEQVRFX0ZSRVFVRU5DWSk7XHJcblxyXG4gICAgdGhpcy51cGRhdGVSb29tTGlzdCgpO1xyXG59O1xyXG5cclxuT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoTG9iYnlTY2VuZSwge1xyXG4gICAgUk9PTV9VUERBVEVfRlJFUVVFTkNZIDoge1xyXG4gICAgICAgIHZhbHVlIDogNTAwMFxyXG4gICAgfSxcclxuXHJcbiAgICBFdmVudCA6IHtcclxuICAgICAgICB2YWx1ZSA6IHtcclxuICAgICAgICAgICAgVE9HR0xFX1JFQURZIDogXCJ0b2dnbGVSZWFkeVwiXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KTtcclxuXHJcbkxvYmJ5U2NlbmUucHJvdG90eXBlID0gT2JqZWN0LmZyZWV6ZShPYmplY3QuY3JlYXRlKFNjZW5lLnByb3RvdHlwZSwge1xyXG4gICAgZGVzdHJveSA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy5sb2JieU92ZXJsYXkuZG9tT2JqZWN0LnJlbW92ZSgpO1xyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZVJvb21PdmVybGF5LmRvbU9iamVjdC5yZW1vdmUoKTtcclxuICAgICAgICAgICAgdGhpcy5jcmVhdGVSb29tT3ZlcmxheS5pbnB1dEZpZWxkLm9mZihcImtleXByZXNzXCIpO1xyXG4gICAgICAgICAgICBjbGVhckludGVydmFsKHRoaXMucm9vbVVwZGF0ZUludGVydmFsKTtcclxuICAgICAgICAgICAgJChOZXR3b3JrKS5vZmYoTmV0d29yay5FdmVudC5VUERBVEVfUk9PTVMpO1xyXG4gICAgICAgICAgICAkKE5ldHdvcmspLm9mZihOZXR3b3JrLkV2ZW50LkVOVEVSX1JPT01fU1VDQ0VTUyk7XHJcbiAgICAgICAgICAgICQoTmV0d29yaykub2ZmKE5ldHdvcmsuRXZlbnQuRU5URVJfUk9PTV9GQUlMKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIHVwZGF0ZVJvb21MaXN0IDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBOZXR3b3JrLmdldFJvb21zKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBfb25MZWF2ZVJvb21CdXR0b25DbGljayA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIE5ldHdvcmsubGVhdmVSb29tKHRoaXMuY3VyUm9vbUlkKTtcclxuICAgICAgICAgICAgdGhpcy5jdXJSb29tSWQgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBfb25SZWFkeUJ1dHRvbkNsaWNrIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgdmFyIGNsaWVudFdpbGxCZVJlYWR5ID0gIU5ldHdvcmsubG9jYWxDbGllbnQuZGF0YS5yZWFkeTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMubG9iYnlPdmVybGF5LnN3aXRjaFRlYW1CdG4ucHJvcChcImRpc2FibGVkXCIsIGNsaWVudFdpbGxCZVJlYWR5KTtcclxuXHJcbiAgICAgICAgICAgIE5ldHdvcmsuc29ja2V0LmVtaXQoJ3VwZGF0ZVJlYWR5Jywge1xyXG4gICAgICAgICAgICAgICAgcmVhZHkgOiBjbGllbnRXaWxsQmVSZWFkeVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIF9vbkNyZWF0ZVJvb21CdXR0b25DbGljayA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlUm9vbU92ZXJsYXkuaW5wdXRGaWVsZC5vZmYoXCJrZXlwcmVzc1wiKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlUm9vbU92ZXJsYXkuaW5wdXRGaWVsZC52YWwoXCJcIik7XHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlUm9vbU92ZXJsYXkuZG9tT2JqZWN0LnJlbW92ZUNsYXNzKFwiZmFkZS1pblwiKTtcclxuICAgICAgICAgICAgdGhpcy5jcmVhdGVSb29tT3ZlcmxheS5kb21PYmplY3Quc2hvdygpO1xyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZVJvb21PdmVybGF5LmRvbU9iamVjdC5hZGRDbGFzcyhcImZhZGUtaW5cIik7XHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlUm9vbU92ZXJsYXkuaW5wdXRGaWVsZC5mb2N1cygpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5jcmVhdGVSb29tT3ZlcmxheS5pbnB1dEZpZWxkLm9uKFwia2V5cHJlc3NcIiwgdGhpcy5fb25DcmVhdGVSb29tS2V5UHJlc3MuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBfb25DcmVhdGVSb29tS2V5UHJlc3MgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICBpZiAoZS5rZXlDb2RlID09PSAxMykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fb25DcmVhdGVSb29tKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIF9vbkNyZWF0ZVJvb21DYW5jZWwgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZVJvb21PdmVybGF5LmRvbU9iamVjdC5oaWRlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBfb25DcmVhdGVSb29tIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgdmFyIG5hbWUgPSB0aGlzLmNyZWF0ZVJvb21PdmVybGF5LmlucHV0RmllbGQudmFsKCk7XHJcblxyXG4gICAgICAgICAgICBpZiAobmFtZSAhPT0gXCJcIikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jcmVhdGVSb29tT3ZlcmxheS5kb21PYmplY3QuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgTmV0d29yay5jcmVhdGVSb29tKG5hbWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBfb25Td2l0Y2hUZWFtQnV0dG9uQ2xpY2sgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICBOZXR3b3JrLnN3aXRjaFRlYW0odGhpcy5jdXJSb29tSWQpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX29uVXBkYXRlUm9vbUxpc3QgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoZSwgZGF0YSkge1xyXG4gICAgICAgICAgICB0aGlzLmxvYmJ5T3ZlcmxheS5zaG93Um9vbXMoZGF0YSk7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5jdXJSb29tSWQgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5sb2JieU92ZXJsYXkucmVuZGVyUm9vbShkYXRhW3RoaXMuY3VyUm9vbUlkXSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxvYmJ5T3ZlcmxheS5yZW5kZXJSb29tKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIF9vbkVudGVyUm9vbUF0dGVtcHQgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoZSwgZGF0YSkge1xyXG4gICAgICAgICAgICBOZXR3b3JrLmVudGVyUm9vbShkYXRhLmlkKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIF9vbkVudGVyUm9vbVN1Y2Nlc3MgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoZSwgZGF0YSkge1xyXG4gICAgICAgICAgICB0aGlzLmN1clJvb21JZCA9IGRhdGEuaWQ7XHJcbiAgICAgICAgICAgIHRoaXMubG9iYnlPdmVybGF5LnJlbmRlclJvb20oZGF0YSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBfb25FbnRlclJvb21GYWlsIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGUsIGRhdGEpIHtcclxuICAgICAgICAgICAgYWxlcnQoZGF0YS5tc2cpO1xyXG4gICAgICAgICAgICB0aGlzLmN1clJvb21JZCA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgdGhpcy5sb2JieU92ZXJsYXkucmVuZGVyUm9vbSh1bmRlZmluZWQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkpO1xyXG5cclxuT2JqZWN0LmZyZWV6ZShMb2JieVNjZW5lKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTG9iYnlTY2VuZTsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBMb2FkaW5nU2NlbmUgPSByZXF1aXJlKCcuL0xvYWRpbmdTY2VuZS5qcycpO1xyXG52YXIgTG9iYnlTY2VuZSA9IHJlcXVpcmUoJy4vTG9iYnlTY2VuZS5qcycpO1xyXG52YXIgR2FtZU92ZXJTY2VuZSA9IHJlcXVpcmUoJy4vR2FtZU92ZXJTY2VuZS5qcycpO1xyXG52YXIgR2FtZVNjZW5lID0gcmVxdWlyZSgnLi9HYW1lU2NlbmUuanMnKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgTG9hZGluZ1NjZW5lICA6IExvYWRpbmdTY2VuZSxcclxuICAgIExvYmJ5U2NlbmUgICAgOiBMb2JieVNjZW5lLFxyXG4gICAgR2FtZU92ZXJTY2VuZSA6IEdhbWVPdmVyU2NlbmUsXHJcbiAgICBHYW1lU2NlbmUgICAgIDogR2FtZVNjZW5lXHJcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIEJHX1RJTEUgICAgICAgOiBcIi4vYXNzZXRzL2ltZy9CRy10aWxlMS5wbmdcIixcclxuICAgIEJMT0NLX0ZVTEwgICAgOiBcIi4vYXNzZXRzL2ltZy9CbG9ja0Z1bGwucG5nXCIsXHJcbiAgICBTSElQXzEgICAgICAgIDogXCIuL2Fzc2V0cy9pbWcvT3RoZXJTaGlwLnBuZ1wiLFxyXG4gICAgU0hJUF8yICAgICAgICA6IFwiLi9hc3NldHMvaW1nL1NoaXAucG5nXCIsXHJcbiAgICBXRUFLX0JVTExFVF8xIDogXCIuL2Fzc2V0cy9pbWcvQnVsbGV0V2Vha19hLnBuZ1wiLFxyXG4gICAgV0VBS19CVUxMRVRfMiA6IFwiLi9hc3NldHMvaW1nL0J1bGxldFdlYWtfYi5wbmdcIixcclxuICAgIFdFQUtfQlVMTEVUXzMgOiBcIi4vYXNzZXRzL2ltZy9CdWxsZXRXZWFrX2MucG5nXCIsXHJcbiAgICBXRUFLX0JVTExFVF80IDogXCIuL2Fzc2V0cy9pbWcvQnVsbGV0V2Vha19kLnBuZ1wiLFxyXG4gICAgRVhQTE9TSU9OICAgICA6IFwiLi9hc3NldHMvaW1nL0V4cGxvc2lvbi5wbmdcIixcclxuICAgIEhQX0ZVTEwgICAgICAgOiBcIi4vYXNzZXRzL2ltZy9IZWFsdGhPcmJGdWxsLnBuZ1wiLFxyXG4gICAgSFBfRU1QVFkgICAgICA6IFwiLi9hc3NldHMvaW1nL0hlYWx0aE9yYkVtcHR5LnBuZ1wiLFxyXG5cclxuICAgIC8vIFByZWxvYWRlciByZXBsYWNlcyBnZXR0ZXIgd2l0aCBhcHByb3ByaWF0ZSBkZWZpbml0aW9uXHJcbiAgICBnZXQgICAgICAgIDogZnVuY3Rpb24gKHBhdGgpIHsgfVxyXG59OyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIEFzc2V0cyA9IHJlcXVpcmUoJy4vQXNzZXRzLmpzJyk7XHJcblxyXG52YXIgUHJlbG9hZGVyID0gZnVuY3Rpb24gKG9uQ29tcGxldGUpIHtcclxuICAgIC8vIFNldCB1cCBwcmVsb2FkZXJcclxuXHR0aGlzLnF1ZXVlID0gbmV3IGNyZWF0ZWpzLkxvYWRRdWV1ZShmYWxzZSk7XHJcblxyXG4gICAgLy8gUmVwbGFjZSBkZWZpbml0aW9uIG9mIEFzc2V0IGdldHRlciB0byB1c2UgdGhlIGRhdGEgZnJvbSB0aGUgcXVldWVcclxuICAgIEFzc2V0cy5nZXQgPSB0aGlzLnF1ZXVlLmdldFJlc3VsdC5iaW5kKHRoaXMucXVldWUpO1xyXG5cclxuICAgIC8vIE9uY2UgZXZlcnl0aGluZyBoYXMgYmVlbiBwcmVsb2FkZWQsIHN0YXJ0IHRoZSBhcHBsaWNhdGlvblxyXG4gICAgaWYgKG9uQ29tcGxldGUpIHtcclxuICAgICAgICB0aGlzLnF1ZXVlLm9uKFwiY29tcGxldGVcIiwgb25Db21wbGV0ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIG5lZWRUb0xvYWQgPSBbXTtcclxuXHJcbiAgICAvLyBQcmVwYXJlIHRvIGxvYWQgaW1hZ2VzXHJcbiAgICBmb3IgKHZhciBpbWcgaW4gQXNzZXRzKSB7XHJcbiAgICAgICAgdmFyIGltZ09iaiA9IHtcclxuICAgICAgICAgICAgaWQgOiBpbWcsXHJcbiAgICAgICAgICAgIHNyYyA6IEFzc2V0c1tpbWddXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBuZWVkVG9Mb2FkLnB1c2goaW1nT2JqKTtcclxuICAgIH1cclxuXHJcblx0dGhpcy5xdWV1ZS5sb2FkTWFuaWZlc3QobmVlZFRvTG9hZCk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFByZWxvYWRlcjsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBBc3NldHMgPSByZXF1aXJlKCcuL0Fzc2V0cy5qcycpO1xyXG52YXIgUHJlbG9hZGVyID0gcmVxdWlyZSgnLi9QcmVsb2FkZXIuanMnKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgQXNzZXRzICAgIDogQXNzZXRzLFxyXG4gICAgUHJlbG9hZGVyIDogUHJlbG9hZGVyXHJcbn07Il19
