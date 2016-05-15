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

    // Start the game since it was stopped to help performance with overlays on
    // a canvas
    game.start();
};

var goToLobby = function () {
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
    Network.socket.emit(Network.Event.GAME_OVER_DATA, room.id);

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

            // Show the remaining duration of the game
            var timeText;
            if (this.timeRemaining > 0) {
                var minutes = Math.floor(this.timeRemaining / (1000 * 60));
                var seconds = Math.round((this.timeRemaining - minutes * 1000 * 60) / 1000);
                timeText = minutes + ":";

                if (seconds < 10) {
                    timeText += "0";
                }

                timeText += seconds;
            } else {
                timeText = "0:00";
            }

            ctx.translate(offset.x, 0);
            ctx.fillStyle = "#fff";
            ctx.textAlign = "center";
            ctx.font = "24px Munro";
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvZ2FtZS9zcmMvZW50aXRpZXMvQnVsbGV0LmpzIiwiY2xpZW50L2dhbWUvc3JjL2VudGl0aWVzL0NsaWVudFBsYXllci5qcyIsImNsaWVudC9nYW1lL3NyYy9lbnRpdGllcy9GdWxsQmxvY2suanMiLCJjbGllbnQvZ2FtZS9zcmMvZW50aXRpZXMvUGxheWVyLmpzIiwiY2xpZW50L2dhbWUvc3JjL2VudGl0aWVzL2luZGV4LmpzIiwiY2xpZW50L2dhbWUvc3JjL2luZGV4LmpzIiwiY2xpZW50L2dhbWUvc3JjL25ldHdvcmsvQ2xpZW50LmpzIiwiY2xpZW50L2dhbWUvc3JjL25ldHdvcmsvTG9jYWxDbGllbnQuanMiLCJjbGllbnQvZ2FtZS9zcmMvbmV0d29yay9pbmRleC5qcyIsImNsaWVudC9nYW1lL3NyYy9vdmVybGF5cy9DcmVhdGVSb29tT3ZlcmxheS5qcyIsImNsaWVudC9nYW1lL3NyYy9vdmVybGF5cy9HYW1lT3Zlck92ZXJsYXkuanMiLCJjbGllbnQvZ2FtZS9zcmMvb3ZlcmxheXMvTG9hZGluZ092ZXJsYXkuanMiLCJjbGllbnQvZ2FtZS9zcmMvb3ZlcmxheXMvTG9iYnlPdmVybGF5LmpzIiwiY2xpZW50L2dhbWUvc3JjL292ZXJsYXlzL092ZXJsYXkuanMiLCJjbGllbnQvZ2FtZS9zcmMvb3ZlcmxheXMvaW5kZXguanMiLCJjbGllbnQvZ2FtZS9zcmMvc2NlbmVzL0dhbWVPdmVyU2NlbmUuanMiLCJjbGllbnQvZ2FtZS9zcmMvc2NlbmVzL0dhbWVTY2VuZS5qcyIsImNsaWVudC9nYW1lL3NyYy9zY2VuZXMvTG9hZGluZ1NjZW5lLmpzIiwiY2xpZW50L2dhbWUvc3JjL3NjZW5lcy9Mb2JieVNjZW5lLmpzIiwiY2xpZW50L2dhbWUvc3JjL3NjZW5lcy9pbmRleC5qcyIsImNsaWVudC9nYW1lL3NyYy91dGlsL0Fzc2V0cy5qcyIsImNsaWVudC9nYW1lL3NyYy91dGlsL1ByZWxvYWRlci5qcyIsImNsaWVudC9nYW1lL3NyYy91dGlsL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1T0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOVJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcclxudmFyIEFzc2V0cyA9IHV0aWwuQXNzZXRzO1xyXG52YXIgR2FtZU9iamVjdCA9IHdmbC5jb3JlLmVudGl0aWVzLkdhbWVPYmplY3Q7XHJcbnZhciBQaHlzaWNzT2JqZWN0ID0gd2ZsLmNvcmUuZW50aXRpZXMuUGh5c2ljc09iamVjdDtcclxudmFyIGdlb20gPSB3ZmwuZ2VvbTtcclxuXHJcbi8qKlxyXG4gKiBQcm9qZWN0aWxlcyBjcmVhdGVkIGZyb20gYSBTaGlwXHJcbiAqL1xyXG52YXIgQnVsbGV0ID0gZnVuY3Rpb24gKGRhbWFnZSwgY3JlYXRvcikge1xyXG4gICAgaWYgKGlzTmFOKGRhbWFnZSkgfHwgZGFtYWdlIDw9IDApIHtcclxuICAgICAgICBkYW1hZ2UgPSAxO1xyXG4gICAgfVxyXG5cclxuICAgIFBoeXNpY3NPYmplY3QuY2FsbCh0aGlzKTtcclxuXHJcbiAgICB0aGlzLmNyZWF0b3IgPSBjcmVhdG9yO1xyXG4gICAgdGhpcy5jdXN0b21EYXRhLnRlYW0gPSBjcmVhdG9yLmN1c3RvbURhdGEudGVhbTtcclxuICAgIHRoaXMuY3VzdG9tRGF0YS5pZ25vcmVGcmljdGlvbiA9IHRydWU7XHJcblxyXG4gICAgLy8gQ3JlYXRlIGRlZmF1bHQgc3RhdGVcclxuICAgIHRoaXMuZ3JhcGhpYzEgPSBBc3NldHMuZ2V0KEFzc2V0cy5XRUFLX0JVTExFVF8xKTtcclxuICAgIHRoaXMuZ3JhcGhpYzIgPSBBc3NldHMuZ2V0KEFzc2V0cy5XRUFLX0JVTExFVF8yKTtcclxuICAgIHRoaXMuZ3JhcGhpYzMgPSBBc3NldHMuZ2V0KEFzc2V0cy5XRUFLX0JVTExFVF8zKTtcclxuICAgIHRoaXMuZ3JhcGhpYzQgPSBBc3NldHMuZ2V0KEFzc2V0cy5XRUFLX0JVTExFVF80KTtcclxuICAgIHRoaXMuZGVmYXVsdFN0YXRlID0gdGhpcy5jcmVhdGVTdGF0ZSgpO1xyXG4gICAgdGhpcy5kZWZhdWx0U3RhdGUuYWRkRnJhbWUoXHJcbiAgICAgICAgdGhpcy5jcmVhdGVGcmFtZSh0aGlzLmdyYXBoaWMxLCAyKVxyXG4gICAgKTtcclxuICAgIHRoaXMuZGVmYXVsdFN0YXRlLmFkZEZyYW1lKFxyXG4gICAgICAgIHRoaXMuY3JlYXRlRnJhbWUodGhpcy5ncmFwaGljMiwgMilcclxuICAgICk7XHJcbiAgICB0aGlzLmRlZmF1bHRTdGF0ZS5hZGRGcmFtZShcclxuICAgICAgICB0aGlzLmNyZWF0ZUZyYW1lKHRoaXMuZ3JhcGhpYzMsIDIpXHJcbiAgICApO1xyXG4gICAgdGhpcy5kZWZhdWx0U3RhdGUuYWRkRnJhbWUoXHJcbiAgICAgICAgdGhpcy5jcmVhdGVGcmFtZSh0aGlzLmdyYXBoaWM0LCAyKVxyXG4gICAgKTtcclxuICAgIHRoaXMuYWRkU3RhdGUoR2FtZU9iamVjdC5TVEFURS5ERUZBVUxULCB0aGlzLmRlZmF1bHRTdGF0ZSk7XHJcblxyXG4gICAgdGhpcy5kYW1hZ2UgPSBkYW1hZ2U7XHJcbiAgICB0aGlzLmFnZSA9IDA7XHJcbiAgICB0aGlzLmxpZmVUaW1lID0gQnVsbGV0LkRFRkFVTFRfTUFYX0xJRkVfVElNRTtcclxuICAgIHRoaXMubWF4U3BlZWQgPSBCdWxsZXQuREVGQVVMVF9NQVhfU1BFRUQ7XHJcbiAgICB0aGlzLnNvbGlkID0gdHJ1ZTtcclxufTtcclxuT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoQnVsbGV0LCB7XHJcbiAgICBERUZBVUxUX01BWF9MSUZFX1RJTUUgOiB7XHJcbiAgICAgICAgdmFsdWUgOiA0MFxyXG4gICAgfSxcclxuXHJcbiAgICBERUZBVUxUX1NQRUVEIDoge1xyXG4gICAgICAgIHZhbHVlIDogMC42NVxyXG4gICAgfSxcclxuXHJcbiAgICBERUZBVUxUX01BWF9TUEVFRCA6IHtcclxuICAgICAgICB2YWx1ZSA6IDAuOFxyXG4gICAgfVxyXG59KTtcclxuQnVsbGV0LnByb3RvdHlwZSA9IE9iamVjdC5mcmVlemUoT2JqZWN0LmNyZWF0ZShQaHlzaWNzT2JqZWN0LnByb3RvdHlwZSwge1xyXG4gICAgdXBkYXRlIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGR0KSB7XHJcbiAgICAgICAgICAgIFBoeXNpY3NPYmplY3QucHJvdG90eXBlLnVwZGF0ZS5jYWxsKHRoaXMsIGR0KTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuYWdlKys7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5hZ2UgPj0gdGhpcy5saWZlVGltZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXN0b21EYXRhLnJlbW92ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICByZXNvbHZlQ29sbGlzaW9uIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKHBoeXNPYmosIGNvbGxpc2lvbkRhdGEpIHtcclxuICAgICAgICAgICAgdmFyIHRlYW0gPSB0aGlzLmN1c3RvbURhdGEudGVhbTtcclxuICAgICAgICAgICAgdmFyIG90aGVyVGVhbSA9IHBoeXNPYmouY3VzdG9tRGF0YS50ZWFtO1xyXG5cclxuICAgICAgICAgICAgaWYgKHBoeXNPYmogIT09IHRoaXMuY3JlYXRvciAmJiBwaHlzT2JqLnNvbGlkKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1c3RvbURhdGEucmVtb3ZlZCA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gSWYgaGl0dGluZyBzb21ldGhpbmcgdGhhdCdzIG9uIGEgdGVhbSAocGxheWVyLCBidWxsZXQsXHJcbiAgICAgICAgICAgICAgICAvLyBldGMpLi4uXHJcbiAgICAgICAgICAgICAgICBpZiAob3RoZXJUZWFtICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBJZiB0aGUgYnVsbGV0IGhpdHMgYSBwbGF5ZXIgb24gYSBkaWZmZXJlbnQgdGVhbSwgZGVhbFxyXG4gICAgICAgICAgICAgICAgICAgIC8vIGRhbWFnZSB0byB0aGVtXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG90aGVyVGVhbSAhPT0gdGVhbSAmJiBwaHlzT2JqLnRha2VEYW1hZ2UpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGh5c09iai50YWtlRGFtYWdlKHRoaXMuZGFtYWdlKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIElmIGtpbGxlZCB0aGUgcGxheWVyLCB3ZSdsbCBtYWtlIHRoZSBjYW0gZm9sbG93IHRoaXNcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gYnVsbGV0J3MgY3JlYXRvclxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocGh5c09iai5oZWFsdGggPD0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGh5c09iai5jdXN0b21EYXRhLmtpbGxlciA9IHRoaXMuY3JlYXRvcjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkpO1xyXG5PYmplY3QuZnJlZXplKEJ1bGxldCk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEJ1bGxldDsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xyXG52YXIgQXNzZXRzID0gdXRpbC5Bc3NldHM7XHJcbnZhciBQbGF5ZXIgPSByZXF1aXJlKCcuL1BsYXllcicpO1xyXG52YXIgTGl2aW5nT2JqZWN0ID0gd2ZsLmNvcmUuZW50aXRpZXMuTGl2aW5nT2JqZWN0O1xyXG52YXIgZ2VvbSA9IHdmbC5nZW9tO1xyXG5cclxudmFyIENsaWVudFBsYXllciA9IGZ1bmN0aW9uICh0ZWFtKSB7XHJcbiAgICBQbGF5ZXIuY2FsbCh0aGlzLCB0ZWFtKTtcclxufTtcclxuT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoQ2xpZW50UGxheWVyLCB7XHJcbiAgICBNSU5JTUFQX0ZJTExfU1RZTEUgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBcIiMwNmM4MzNcIlxyXG4gICAgfVxyXG59KTtcclxuQ2xpZW50UGxheWVyLnByb3RvdHlwZSA9IE9iamVjdC5mcmVlemUoT2JqZWN0LmNyZWF0ZShQbGF5ZXIucHJvdG90eXBlLCB7XHJcbiAgICB1cGRhdGUgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoZHQpIHtcclxuICAgICAgICAgICAgTGl2aW5nT2JqZWN0LnByb3RvdHlwZS51cGRhdGUuY2FsbCh0aGlzLCBkdCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIFxyXG4gICAgZHJhd09uTWluaW1hcCA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChjdHgpIHtcclxuICAgICAgICAgICAgdmFyIHcgPSB0aGlzLmdldFdpZHRoKCk7XHJcbiAgICAgICAgICAgIHZhciBoID0gdGhpcy5nZXRIZWlnaHQoKTtcclxuICAgICAgICAgICAgdmFyIG9mZnNldFggPSBNYXRoLnJvdW5kKC13ICogMC41KTtcclxuICAgICAgICAgICAgdmFyIG9mZnNldFkgPSBNYXRoLnJvdW5kKC1oICogMC41KTtcclxuICAgICAgICAgICAgdmFyIGRpc3BsYXlXaWR0aCA9IE1hdGgucm91bmQodyk7XHJcbiAgICAgICAgICAgIHZhciBkaXNwbGF5SGVpZ2h0ID0gTWF0aC5yb3VuZChoKTtcclxuXHJcbiAgICAgICAgICAgIGN0eC5zYXZlKCk7XHJcblxyXG4gICAgICAgICAgICBjdHguZmlsbFN0eWxlID0gQ2xpZW50UGxheWVyLk1JTklNQVBfRklMTF9TVFlMRTtcclxuICAgICAgICAgICAgY3R4LmZpbGxSZWN0KG9mZnNldFgsIG9mZnNldFksIGRpc3BsYXlXaWR0aCwgZGlzcGxheUhlaWdodCk7XHJcblxyXG4gICAgICAgICAgICBjdHgucmVzdG9yZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgc2hvb3QgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoKSB7IH1cclxuICAgIH0sXHJcblxyXG4gICAganVzdFNob3QgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoKSB7IH1cclxuICAgIH1cclxufSkpO1xyXG5PYmplY3QuZnJlZXplKENsaWVudFBsYXllcik7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENsaWVudFBsYXllcjsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xyXG52YXIgQXNzZXRzID0gdXRpbC5Bc3NldHM7XHJcbnZhciBHYW1lT2JqZWN0ID0gd2ZsLmNvcmUuZW50aXRpZXMuR2FtZU9iamVjdDtcclxudmFyIFBoeXNpY3NPYmplY3QgPSB3ZmwuY29yZS5lbnRpdGllcy5QaHlzaWNzT2JqZWN0O1xyXG5cclxuLyoqXHJcbiAqIEEgZnVsbC1zaXplZCwgcXVhZHJpbGF0ZXJhbCBibG9ja1xyXG4gKi9cclxudmFyIEZ1bGxCbG9jayA9IGZ1bmN0aW9uICgpIHtcclxuICAgIFBoeXNpY3NPYmplY3QuY2FsbCh0aGlzKTtcclxuXHJcbiAgICB0aGlzLmlkID0gRnVsbEJsb2NrLmlkO1xyXG5cclxuICAgIC8vIENyZWF0ZSBkZWZhdWx0IHN0YXRlXHJcbiAgICB0aGlzLmRlZmF1bHRHcmFwaGljID0gQXNzZXRzLmdldChBc3NldHMuQkxPQ0tfRlVMTCk7XHJcbiAgICB0aGlzLmRlZmF1bHRTdGF0ZSA9IHRoaXMuY3JlYXRlU3RhdGUoKTtcclxuICAgIHRoaXMuZGVmYXVsdFN0YXRlLmFkZEZyYW1lKFxyXG4gICAgICAgIHRoaXMuY3JlYXRlRnJhbWUodGhpcy5kZWZhdWx0R3JhcGhpYylcclxuICAgICk7XHJcbiAgICB0aGlzLmFkZFN0YXRlKEdhbWVPYmplY3QuU1RBVEUuREVGQVVMVCwgdGhpcy5kZWZhdWx0U3RhdGUpO1xyXG5cclxuICAgIHRoaXMuc29saWQgPSB0cnVlO1xyXG4gICAgdGhpcy5maXhlZCA9IHRydWU7XHJcbiAgICB0aGlzLnJvdGF0ZSgtTWF0aC5QSSAqIDAuNSk7XHJcbn07XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKEZ1bGxCbG9jaywge1xyXG4gICAgbmFtZSA6IHtcclxuICAgICAgICB2YWx1ZSA6IFwiRnVsbEJsb2NrXCJcclxuICAgIH0sXHJcblxyXG4gICAgaWQgOiB7XHJcbiAgICAgICAgdmFsdWUgOiAwXHJcbiAgICB9XHJcbn0pO1xyXG5GdWxsQmxvY2sucHJvdG90eXBlID0gT2JqZWN0LmZyZWV6ZShPYmplY3QuY3JlYXRlKFBoeXNpY3NPYmplY3QucHJvdG90eXBlLCB7XHJcbiAgICBkcmF3T25NaW5pbWFwIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGN0eCkge1xyXG4gICAgICAgICAgICB2YXIgdyA9IHRoaXMuZ2V0V2lkdGgoKTtcclxuICAgICAgICAgICAgdmFyIGggPSB0aGlzLmdldEhlaWdodCgpO1xyXG4gICAgICAgICAgICB2YXIgb2Zmc2V0WCA9IE1hdGgucm91bmQoLXcgKiAwLjUpO1xyXG4gICAgICAgICAgICB2YXIgb2Zmc2V0WSA9IE1hdGgucm91bmQoLWggKiAwLjUpO1xyXG4gICAgICAgICAgICB2YXIgZGlzcGxheVdpZHRoID0gTWF0aC5yb3VuZCh3KTtcclxuICAgICAgICAgICAgdmFyIGRpc3BsYXlIZWlnaHQgPSBNYXRoLnJvdW5kKGgpO1xyXG5cclxuICAgICAgICAgICAgY3R4LnNhdmUoKTtcclxuXHJcbiAgICAgICAgICAgIGN0eC5yb3RhdGUodGhpcy5nZXRSb3RhdGlvbigpKTtcclxuXHJcbiAgICAgICAgICAgIC8qY3R4LmZpbGxTdHlsZSA9XHJcbiAgICAgICAgICAgICAgICBhcHAuZ2FtZW9iamVjdC5QaHlzaWNzT2JqZWN0Lk1JTklNQVBfRklMTF9TVFlMRTtcclxuICAgICAgICAgICAgY3R4LnN0cm9rZVN0eWxlID1cclxuICAgICAgICAgICAgICAgIGFwcC5nYW1lb2JqZWN0LlBoeXNpY3NPYmplY3QuTUlOSU1BUF9TVFJPS0VfU1RZTEU7Ki9cclxuXHJcbiAgICAgICAgICAgIGN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICAgICAgY3R4LnJlY3Qob2Zmc2V0WCwgb2Zmc2V0WSwgZGlzcGxheVdpZHRoLCBkaXNwbGF5SGVpZ2h0KTtcclxuICAgICAgICAgICAgY3R4LmZpbGwoKTtcclxuICAgICAgICAgICAgY3R4LnN0cm9rZSgpO1xyXG5cclxuICAgICAgICAgICAgY3R4LnJlc3RvcmUoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKTtcclxuT2JqZWN0LmZyZWV6ZShGdWxsQmxvY2spO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBGdWxsQmxvY2s7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcclxudmFyIEFzc2V0cyA9IHV0aWwuQXNzZXRzO1xyXG52YXIgTmV0d29yayA9IHJlcXVpcmUoJy4uL25ldHdvcmsnKTtcclxudmFyIEdhbWVPYmplY3QgPSB3ZmwuY29yZS5lbnRpdGllcy5HYW1lT2JqZWN0O1xyXG52YXIgTGl2aW5nT2JqZWN0ID0gd2ZsLmNvcmUuZW50aXRpZXMuTGl2aW5nT2JqZWN0O1xyXG52YXIgZ2VvbSA9IHdmbC5nZW9tO1xyXG5cclxudmFyIFBsYXllciA9IGZ1bmN0aW9uICh0ZWFtKSB7XHJcbiAgICBMaXZpbmdPYmplY3QuY2FsbCh0aGlzKTtcclxuXHJcbiAgICB0aGlzLmN1c3RvbURhdGEudGVhbSA9IHRlYW07XHJcblxyXG4gICAgdmFyIHNoaXBUeXBlO1xyXG4gICAgaWYgKHRlYW0gPT09IDApIHtcclxuICAgICAgICBzaGlwVHlwZSA9IEFzc2V0cy5TSElQXzE7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHNoaXBUeXBlID0gQXNzZXRzLlNISVBfMjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBDcmVhdGUgZGVmYXVsdCBzdGF0ZVxyXG4gICAgdGhpcy5kZWZhdWx0R3JhcGhpYyA9IEFzc2V0cy5nZXQoc2hpcFR5cGUpO1xyXG5cclxuICAgIHZhciB3ID0gdGhpcy5kZWZhdWx0R3JhcGhpYy53aWR0aDtcclxuICAgIHZhciBoID0gdGhpcy5kZWZhdWx0R3JhcGhpYy5oZWlnaHQ7XHJcbiAgICB2YXIgdmVydHMgPSBbXHJcbiAgICAgICAgbmV3IGdlb20uVmVjMigtdyAqIDAuNSwgLWggKiAwLjUpLFxyXG4gICAgICAgIG5ldyBnZW9tLlZlYzIodyAqIDAuNSwgMCksXHJcbiAgICAgICAgbmV3IGdlb20uVmVjMigtdyAqIDAuNSwgaCAqIDAuNSlcclxuICAgIF07XHJcbiAgICB2YXIgZnJhbWVPYmogPSB0aGlzLmNyZWF0ZUZyYW1lKHRoaXMuZGVmYXVsdEdyYXBoaWMsIDEsIGZhbHNlKTtcclxuICAgIGZyYW1lT2JqLnZlcnRpY2VzID0gdmVydHM7XHJcblxyXG4gICAgdGhpcy5kZWZhdWx0U3RhdGUgPSB0aGlzLmNyZWF0ZVN0YXRlKCk7XHJcbiAgICB0aGlzLmRlZmF1bHRTdGF0ZS5hZGRGcmFtZShmcmFtZU9iaik7XHJcbiAgICB0aGlzLmFkZFN0YXRlKEdhbWVPYmplY3QuU1RBVEUuREVGQVVMVCwgdGhpcy5kZWZhdWx0U3RhdGUpO1xyXG5cclxuICAgIC8vIENyZWF0ZSBleHBsb3Npb24gc3RhdGVcclxuICAgIHRoaXMuZXhwbG9zaW9uR3JhcGhpYyA9IEFzc2V0cy5nZXQoQXNzZXRzLkVYUExPU0lPTik7XHJcbiAgICB0aGlzLmV4cGxvc2lvblN0YXRlID0gdGhpcy5jcmVhdGVTdGF0ZSgpO1xyXG5cclxuICAgIGZyYW1lT2JqID0gdGhpcy5jcmVhdGVGcmFtZSh0aGlzLmV4cGxvc2lvbkdyYXBoaWMsIDEsIGZhbHNlKTtcclxuICAgIGZyYW1lT2JqLnZlcnRpY2VzID0gdmVydHM7XHJcbiAgICB0aGlzLmV4cGxvc2lvblN0YXRlLmFkZEZyYW1lKGZyYW1lT2JqKTtcclxuICAgIHRoaXMuYWRkU3RhdGUoUGxheWVyLlNUQVRFLkVYUExPU0lPTiwgdGhpcy5leHBsb3Npb25TdGF0ZSk7XHJcblxyXG4gICAgdGhpcy5zaG9vdFRpbWVyID0gMDtcclxuICAgIHRoaXMubWF4U2hvb3RUaW1lciA9IFBsYXllci5ERUZBVUxUX01BWF9TSE9PVF9USU1FUjtcclxuXHJcbiAgICB0aGlzLmhlYWx0aCA9IE5ldHdvcmsubG9jYWxDbGllbnQuZGF0YS5oZWFsdGg7XHJcbiAgICB0aGlzLm1heEhlYWx0aCA9IE5ldHdvcmsubG9jYWxDbGllbnQuZGF0YS5oZWFsdGg7XHJcblxyXG4gICAgdGhpcy5yb3RhdGUoLU1hdGguUEkgKiAwLjUpO1xyXG59O1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyhQbGF5ZXIsIHtcclxuICAgIFRVUk5fU1BFRUQgOiB7XHJcbiAgICAgICAgdmFsdWUgOiAwLjA1XHJcbiAgICB9LFxyXG5cclxuICAgIEJSQUtFX1JBVEUgOiB7XHJcbiAgICAgICAgdmFsdWUgOiAwLjk1XHJcbiAgICB9LFxyXG5cclxuICAgIEJPT1NUX0FDQ0VMRVJBVElPTiA6IHtcclxuICAgICAgICB2YWx1ZSA6IDAuMDAwMlxyXG4gICAgfSxcclxuXHJcbiAgICBQT1NJVElPTl9VUERBVEVfRElTVEFOQ0UgOiB7XHJcbiAgICAgICAgdmFsdWUgOiAwLjVcclxuICAgIH0sXHJcblxyXG4gICAgTUlOSU1BUF9GSUxMX1NUWUxFIDoge1xyXG4gICAgICAgIHZhbHVlIDogXCIjODZjOGQzXCJcclxuICAgIH0sXHJcblxyXG4gICAgREVGQVVMVF9NQVhfU0hPT1RfVElNRVIgOiB7XHJcbiAgICAgICAgdmFsdWUgOiAyMFxyXG4gICAgfSxcclxuXHJcbiAgICBTVEFURSA6IHtcclxuICAgICAgICB2YWx1ZSA6IHtcclxuICAgICAgICAgICAgRVhQTE9TSU9OIDogXCJleHBsb3Npb25cIlxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSk7XHJcblBsYXllci5wcm90b3R5cGUgPSBPYmplY3QuZnJlZXplKE9iamVjdC5jcmVhdGUoTGl2aW5nT2JqZWN0LnByb3RvdHlwZSwge1xyXG4gICAgdXBkYXRlIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGR0KSB7XHJcbiAgICAgICAgICAgIExpdmluZ09iamVjdC5wcm90b3R5cGUudXBkYXRlLmNhbGwodGhpcywgZHQpO1xyXG5cclxuICAgICAgICAgICAgLy8gVXBkYXRlIHNob290IHRpbWVyIHdoZW4ganVzdCBzaG90XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmp1c3RTaG90KCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2hvb3RUaW1lcisrO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnNob290VGltZXIgPj0gdGhpcy5tYXhTaG9vdFRpbWVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zaG9vdFRpbWVyID0gMDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gSWYgdGhlIHBsYXllciBpcyBjb25uZWN0ZWQgdG8gdGhlIG5ldHdvcmssIHNlbmQgb3V0IHVwZGF0ZXMgdG9cclxuICAgICAgICAgICAgLy8gb3RoZXIgcGxheWVycyB3aGVuIG5lY2Vzc2FyeVxyXG4gICAgICAgICAgICBpZiAoTmV0d29yay5jb25uZWN0ZWQpIHtcclxuICAgICAgICAgICAgICAgIE5ldHdvcmsuc29ja2V0LmVtaXQoJ3VwZGF0ZU90aGVyJywge1xyXG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uICAgICA6IHRoaXMucG9zaXRpb24sXHJcbiAgICAgICAgICAgICAgICAgICAgdmVsb2NpdHkgICAgIDogdGhpcy52ZWxvY2l0eSxcclxuICAgICAgICAgICAgICAgICAgICBhY2NlbGVyYXRpb24gOiB0aGlzLmFjY2VsZXJhdGlvbixcclxuICAgICAgICAgICAgICAgICAgICByb3RhdGlvbiAgICAgOiB0aGlzLmdldFJvdGF0aW9uKClcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBkcmF3T25NaW5pbWFwIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGN0eCkge1xyXG4gICAgICAgICAgICB2YXIgdyA9IHRoaXMuZ2V0V2lkdGgoKTtcclxuICAgICAgICAgICAgdmFyIGggPSB0aGlzLmdldEhlaWdodCgpO1xyXG4gICAgICAgICAgICB2YXIgb2Zmc2V0WCA9IE1hdGgucm91bmQoLXcgKiAwLjUpO1xyXG4gICAgICAgICAgICB2YXIgb2Zmc2V0WSA9IE1hdGgucm91bmQoLWggKiAwLjUpO1xyXG4gICAgICAgICAgICB2YXIgZGlzcGxheVdpZHRoID0gTWF0aC5yb3VuZCh3KTtcclxuICAgICAgICAgICAgdmFyIGRpc3BsYXlIZWlnaHQgPSBNYXRoLnJvdW5kKGgpO1xyXG5cclxuICAgICAgICAgICAgY3R4LnNhdmUoKTtcclxuXHJcbiAgICAgICAgICAgIGN0eC5maWxsU3R5bGUgPSBQbGF5ZXIuTUlOSU1BUF9GSUxMX1NUWUxFO1xyXG4gICAgICAgICAgICBjdHguZmlsbFJlY3Qob2Zmc2V0WCwgb2Zmc2V0WSwgZGlzcGxheVdpZHRoLCBkaXNwbGF5SGVpZ2h0KTtcclxuXHJcbiAgICAgICAgICAgIGN0eC5yZXN0b3JlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBzaG9vdCA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLmp1c3RTaG90KCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2hvb3RUaW1lciA9IDE7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKE5ldHdvcmsuY29ubmVjdGVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgTmV0d29yay5zb2NrZXQuZW1pdCgnYnVsbGV0Jywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbiAgICAgOiB0aGlzLnBvc2l0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2ZWxvY2l0eSAgICAgOiB0aGlzLnZlbG9jaXR5LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhY2NlbGVyYXRpb24gOiB0aGlzLmFjY2VsZXJhdGlvbixcclxuICAgICAgICAgICAgICAgICAgICAgICAgcm90YXRpb24gICAgIDogdGhpcy5nZXRSb3RhdGlvbigpXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIGp1c3RTaG90IDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gKHRoaXMuc2hvb3RUaW1lciA+IDApO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgcmVzb2x2ZUNvbGxpc2lvbiA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChwaHlzT2JqLCBjb2xsaXNpb25EYXRhKSB7XHJcbiAgICAgICAgICAgIHZhciB0ZWFtID0gdGhpcy5jdXN0b21EYXRhLnRlYW07XHJcbiAgICAgICAgICAgIHZhciBvdGhlclRlYW0gPSBwaHlzT2JqLmN1c3RvbURhdGEudGVhbTtcclxuXHJcbiAgICAgICAgICAgIC8vIElmIGhpdHRpbmcgc29tZXRoaW5nIHRoYXQncyBub3Qgb24gdGhpcyB0ZWFtXHJcbiAgICAgICAgICAgIGlmIChvdGhlclRlYW0gPT09IHVuZGVmaW5lZCB8fCBvdGhlclRlYW0gIT09IHRlYW0gfHwgcGh5c09iai50YWtlRGFtYWdlKSB7XHJcbiAgICAgICAgICAgICAgICBMaXZpbmdPYmplY3QucHJvdG90eXBlLnJlc29sdmVDb2xsaXNpb24uY2FsbCh0aGlzLCBwaHlzT2JqLCBjb2xsaXNpb25EYXRhKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkpO1xyXG5PYmplY3QuZnJlZXplKFBsYXllcik7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFBsYXllcjsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBGdWxsQmxvY2sgPSByZXF1aXJlKCcuL0Z1bGxCbG9jay5qcycpO1xyXG52YXIgUGxheWVyID0gcmVxdWlyZSgnLi9QbGF5ZXIuanMnKTtcclxudmFyIENsaWVudFBsYXllciA9IHJlcXVpcmUoJy4vQ2xpZW50UGxheWVyLmpzJyk7XHJcbnZhciBCdWxsZXQgPSByZXF1aXJlKCcuL0J1bGxldC5qcycpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICBGdWxsQmxvY2sgICAgOiBGdWxsQmxvY2ssXHJcbiAgICBQbGF5ZXIgICAgICAgOiBQbGF5ZXIsXHJcbiAgICBDbGllbnRQbGF5ZXIgOiBDbGllbnRQbGF5ZXIsXHJcbiAgICBCdWxsZXQgICAgICAgOiBCdWxsZXRcclxufTsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBOZXR3b3JrID0gcmVxdWlyZSgnLi9uZXR3b3JrJyk7XHJcbnZhciB1dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XHJcbnZhciBBc3NldHMgPSB1dGlsLkFzc2V0cztcclxudmFyIHNjZW5lcyA9IHJlcXVpcmUoJy4vc2NlbmVzJyk7XHJcbnZhciBvdmVybGF5cyA9IHJlcXVpcmUoJy4vb3ZlcmxheXMnKTtcclxuXHJcbi8vIENyZWF0ZSBnYW1lXHJcbnZhciBjYW52YXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2dhbWUtY2FudmFzXCIpO1xyXG52YXIgZ2FtZSAgID0gd2ZsLmNyZWF0ZShjYW52YXMpO1xyXG5cclxudmFyIGxvYWRpbmdTY2VuZSA9IG5ldyBzY2VuZXMuTG9hZGluZ1NjZW5lKGNhbnZhcyk7XHJcbmdhbWUuc2V0U2NlbmUobG9hZGluZ1NjZW5lKTtcclxuXHJcbi8vIFN0b3AgdGhlIGdhbWUgc28gdGhhdCBjYW52YXMgdXBkYXRlcyBkb24ndCBhZmZlY3QgcGVyZm9ybWFuY2Ugd2l0aFxyXG4vLyBvdmVybGF5c1xyXG5nYW1lLnN0b3AoKTtcclxuXHJcbi8vIERyYXcgaW5pdGlhbCBibGFjayBCRyBvbiBjYW52YXNcclxudmFyIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XHJcbmN0eC5maWxsU3R5bGUgPSBcIiMwNDBCMENcIjtcclxuY3R4LmZpbGxSZWN0KDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XHJcblxyXG52YXIgb25Mb2FkID0gZnVuY3Rpb24gKCkge1xyXG4gICAgJChOZXR3b3JrKS5vbihcclxuICAgICAgICBOZXR3b3JrLkV2ZW50LkNPTk5FQ1QsXHJcbiAgICAgICAgb25OZXR3b3JrQ29ubmVjdFxyXG4gICAgKTtcclxuXHJcbiAgICBOZXR3b3JrLmluaXQoKTtcclxufTtcclxuXHJcbnZhciBnb1RvR2FtZSA9IGZ1bmN0aW9uIChyb29tKSB7XHJcbiAgICAvLyBVcGRhdGUgdGhlIGdhbWUgd2l0aCB0aGUgY3VycmVudCB0aW1lIGJlY2F1c2UgdGhlIGR0IHdpbGwgYmUgaHVnZSBuZXh0XHJcbiAgICAvLyB1cGRhdGUgc2luY2UgdGhlIGdhbWUgd2FzIHN0b3BwZWQgd2hpbGUgaW4gdGhlIGxvYmJ5XHJcbiAgICBnYW1lLnVwZGF0ZShEYXRlLm5vdygpKTtcclxuXHJcbiAgICAkKGdhbWUuZ2V0U2NlbmUoKSkub2ZmKCk7XHJcblxyXG4gICAgdmFyIGdhbWVTY2VuZSA9IG5ldyBzY2VuZXMuR2FtZVNjZW5lKGNhbnZhcywgcm9vbSk7XHJcbiAgICBnYW1lLnNldFNjZW5lKGdhbWVTY2VuZSk7XHJcblxyXG4gICAgJChOZXR3b3JrKS5vbihcclxuICAgICAgICBOZXR3b3JrLkV2ZW50LkVORF9HQU1FLFxyXG4gICAgICAgIG9uRW5kR2FtZVxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBTdGFydCB0aGUgZ2FtZSBzaW5jZSBpdCB3YXMgc3RvcHBlZCB0byBoZWxwIHBlcmZvcm1hbmNlIHdpdGggb3ZlcmxheXMgb25cclxuICAgIC8vIGEgY2FudmFzXHJcbiAgICBnYW1lLnN0YXJ0KCk7XHJcbn07XHJcblxyXG52YXIgZ29Ub0xvYmJ5ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgLy8gU3RvcCB0aGUgZ2FtZSBzbyB0aGF0IGNhbnZhcyB1cGRhdGVzIGRvbid0IGFmZmVjdCBwZXJmb3JtYW5jZSB3aXRoXHJcbiAgICAvLyBvdmVybGF5c1xyXG4gICAgZ2FtZS5zdG9wKCk7XHJcblxyXG4gICAgJChnYW1lLmdldFNjZW5lKCkpLm9mZigpO1xyXG5cclxuICAgIC8vIFJlc2V0IGFsbCBsaXN0ZW5lcnMgb24gdGhlIE5ldHdvcmtcclxuICAgICQoTmV0d29yaykub2ZmKCk7XHJcblxyXG4gICAgdmFyIGxvYmJ5U2NlbmUgPSBuZXcgc2NlbmVzLkxvYmJ5U2NlbmUoY2FudmFzKTtcclxuICAgIGdhbWUuc2V0U2NlbmUobG9iYnlTY2VuZSk7XHJcblxyXG4gICAgJChOZXR3b3JrKS5vbihcclxuICAgICAgICBOZXR3b3JrLkV2ZW50LlNUQVJUX0dBTUUsXHJcbiAgICAgICAgb25TdGFydEdhbWVcclxuICAgICk7XHJcblxyXG4gICAgLy8gVHJhbnNpdGlvbiB0aGUgcGFnZSdzIEJHIGNvbG9yIHRvIGJsYWNrIHRvIGhpZGUgdGhlIEJHIGltYWdlIHdoaWNoXHJcbiAgICAvLyBiZWNvbWVzIGRpc3RyYWN0aW5nIGR1cmluZyBnYW1lIHBsYXlcclxuICAgICQoXCJib2R5XCIpLmNzcyh7XCJiYWNrZ3JvdW5kLWNvbG9yXCI6IFwiIzA3MTIxM1wifSk7XHJcbn07XHJcblxyXG52YXIgZ29Ub0dhbWVPdmVyID0gZnVuY3Rpb24gKHJvb20pIHtcclxuICAgIC8vIFN0b3AgdGhlIGdhbWUgc28gdGhhdCBjYW52YXMgdXBkYXRlcyBkb24ndCBhZmZlY3QgcGVyZm9ybWFuY2Ugd2l0aFxyXG4gICAgLy8gb3ZlcmxheXNcclxuICAgIGdhbWUuc3RvcCgpO1xyXG5cclxuICAgIC8vIFJlc2V0IGFsbCBsaXN0ZW5lcnMgb24gdGhlIE5ldHdvcmtcclxuICAgICQoTmV0d29yaykub2ZmKCk7XHJcblxyXG4gICAgdmFyIGdhbWVPdmVyU2NlbmUgPSBuZXcgc2NlbmVzLkdhbWVPdmVyU2NlbmUoY2FudmFzLCByb29tKTtcclxuICAgIGdhbWUuc2V0U2NlbmUoZ2FtZU92ZXJTY2VuZSk7XHJcblxyXG4gICAgJChnYW1lT3ZlclNjZW5lKS5vbihcclxuICAgICAgICBzY2VuZXMuR2FtZU92ZXJTY2VuZS5FdmVudC5SRVRVUk5fVE9fTE9CQlksXHJcbiAgICAgICAgb25HYW1lT3ZlclRvTG9iYnlcclxuICAgICk7XHJcbn07XHJcblxyXG52YXIgb25TdGFydEdhbWUgPSBmdW5jdGlvbiAoZSwgcm9vbSkge1xyXG4gICAgZ29Ub0dhbWUocm9vbSk7XHJcbn07XHJcblxyXG52YXIgb25FbmRHYW1lID0gZnVuY3Rpb24gKGUsIHJvb20pIHtcclxuICAgIGdvVG9HYW1lT3Zlcihyb29tKTtcclxufTtcclxuXHJcbnZhciBvbkdhbWVPdmVyVG9Mb2JieSA9IGZ1bmN0aW9uIChlLCByb29tKSB7XHJcbiAgICBnb1RvTG9iYnkoKTtcclxuXHJcbiAgICAvLyBUcmlnZ2VyIGFuIGV2ZW50IHNvIHRoZSBsb2JieSBzY2VuZSBrbm93cyB0byBqb2luIHRoZSByb29tIGl0IHdhcyBqdXN0XHJcbiAgICAvLyBpbiBiZWZvcmUgcGxheWluZyB0aGUgZ2FtZVxyXG4gICAgTmV0d29yay5fb25FbnRlclJvb21TdWNjZXNzKHJvb20pO1xyXG59O1xyXG5cclxudmFyIG9uTmV0d29ya0Nvbm5lY3QgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICBnb1RvTG9iYnkoKTtcclxufTtcclxuXHJcbnZhciBQcmVsb2FkZXIgPSBuZXcgdXRpbC5QcmVsb2FkZXIob25Mb2FkLmJpbmQodGhpcykpOyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIGVudGl0aWVzID0gcmVxdWlyZSgnLi4vZW50aXRpZXMnKTtcclxuXHJcbnZhciBDbGllbnQgPSBmdW5jdGlvbiAoaWQsIGRhdGEpIHtcclxuICAgIHRoaXMuaWQgPSBpZDtcclxuICAgIHRoaXMuZGF0YSA9IGRhdGE7XHJcbiAgICB0aGlzLmdhbWVPYmplY3QgPSB1bmRlZmluZWQ7XHJcbn07XHJcbk9iamVjdC5mcmVlemUoQ2xpZW50KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ2xpZW50OyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIGVudGl0aWVzID0gcmVxdWlyZSgnLi4vZW50aXRpZXMnKTtcclxuXHJcbnZhciBMb2NhbENsaWVudCA9IGZ1bmN0aW9uIChpZCwgZGF0YSkge1xyXG4gICAgdGhpcy5pZCA9IGlkO1xyXG4gICAgdGhpcy5kYXRhID0gZGF0YTtcclxuICAgIHRoaXMuZ2FtZU9iamVjdCA9IHVuZGVmaW5lZDtcclxufTtcclxuT2JqZWN0LmZyZWV6ZShMb2NhbENsaWVudCk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IExvY2FsQ2xpZW50OyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIE5ldHdvcmsgPSB7XHJcbiAgICBzb2NrZXQgICAgICA6IHVuZGVmaW5lZCxcclxuICAgIGxvY2FsQ2xpZW50IDoge30sXHJcbiAgICBjbGllbnRzICAgICA6IHt9LFxyXG4gICAgcm9vbXMgICAgICAgOiB7fSxcclxuICAgIGNvbm5lY3RlZCAgIDogZmFsc2UsXHJcbiAgICBob3N0SWQgICAgICA6IC0xLFxyXG5cclxuICAgIC8vIEV2ZW50cyBmb3IgZXh0ZXJuYWwgZW50aXRpZXMgdG8gc3Vic2NyaWJlIHRvXHJcbiAgICBFdmVudCAgICAgICA6IHtcclxuICAgICAgICBDT05ORUNUICAgICAgICAgICAgOiBcImNvbm5lY3RcIixcclxuICAgICAgICBVUERBVEVfUk9PTVMgICAgICAgOiBcInVwZGF0ZVJvb21zXCIsXHJcbiAgICAgICAgRU5URVJfUk9PTV9TVUNDRVNTIDogXCJlbnRlclJvb21TdWNjZXNzXCIsXHJcbiAgICAgICAgRU5URVJfUk9PTV9GQUlMICAgIDogXCJlbnRlclJvb21GYWlsXCIsXHJcbiAgICAgICAgUExBWSAgICAgICAgICAgICAgIDogXCJwbGF5XCIsXHJcbiAgICAgICAgU1RBUlRfR0FNRSAgICAgICAgIDogXCJzdGFydEdhbWVcIixcclxuICAgICAgICBFTkRfR0FNRSAgICAgICAgICAgOiBcImVuZEdhbWVcIixcclxuICAgICAgICBQTEFZRVJfREVBVEggICAgICAgOiBcInBsYXllckRlYXRoXCIsXHJcbiAgICAgICAgUExBWUVSX1JFU1BBV04gICAgIDogXCJwbGF5ZXJSZXNwYXduXCIsXHJcbiAgICAgICAgQlVMTEVUICAgICAgICAgICAgIDogXCJidWxsZXRcIixcclxuICAgICAgICBDTE9DS19USUNLICAgICAgICAgOiBcImNsb2NrVGlja1wiLFxyXG4gICAgICAgIENPVU5URE9XTiAgICAgICAgICA6IFwiY291bnRkb3duXCIsXHJcbiAgICAgICAgR0FNRV9PVkVSX0RBVEEgICAgIDogXCJnYW1lT3ZlckRhdGFcIlxyXG4gICAgfSxcclxuXHJcbiAgICBpbml0IDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuc29ja2V0ID0gaW8uY29ubmVjdCgpO1xyXG5cclxuICAgICAgICB0aGlzLnNvY2tldC5vbignY29uZmlybScsIHRoaXMuX29uQ29uZmlybUNsaWVudC5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLnNvY2tldC5vbignYWRkT3RoZXInLCB0aGlzLl9vbkFkZE90aGVyQ2xpZW50LmJpbmQodGhpcykpO1xyXG4gICAgICAgIHRoaXMuc29ja2V0Lm9uKCdyZW1vdmVPdGhlcicsIHRoaXMuX29uUmVtb3ZlT3RoZXJDbGllbnQuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgdGhpcy5zb2NrZXQub24oJ2xvYWRQcmV2aW91cycsIHRoaXMuX29uTG9hZFByZXZpb3VzQ2xpZW50cy5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLnNvY2tldC5vbigndXBkYXRlT3RoZXInLCB0aGlzLl9vblVwZGF0ZUNsaWVudC5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLnNvY2tldC5vbigndXBkYXRlUm9vbXMnLCB0aGlzLl9vblVwZGF0ZVJvb21zLmJpbmQodGhpcykpO1xyXG4gICAgICAgIHRoaXMuc29ja2V0Lm9uKCdlbnRlclJvb21TdWNjZXNzJywgdGhpcy5fb25FbnRlclJvb21TdWNjZXNzLmJpbmQodGhpcykpO1xyXG4gICAgICAgIHRoaXMuc29ja2V0Lm9uKCdlbnRlclJvb21GYWlsJywgdGhpcy5fb25FbnRlclJvb21GYWlsLmJpbmQodGhpcykpO1xyXG4gICAgICAgIHRoaXMuc29ja2V0Lm9uKCdwaW5nJywgdGhpcy5fb25QaW5nLmJpbmQodGhpcykpO1xyXG4gICAgICAgIHRoaXMuc29ja2V0Lm9uKCdzZXRIb3N0JywgdGhpcy5fb25TZXRIb3N0LmJpbmQodGhpcykpO1xyXG4gICAgICAgIHRoaXMuc29ja2V0Lm9uKCdzdGFydEdhbWUnLCB0aGlzLl9vblN0YXJ0R2FtZS5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLnNvY2tldC5vbignZW5kR2FtZScsIHRoaXMuX29uRW5kR2FtZS5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLnNvY2tldC5vbigncGxheWVyRGVhdGgnLCB0aGlzLl9vblBsYXllckRlYXRoLmJpbmQodGhpcykpO1xyXG4gICAgICAgIHRoaXMuc29ja2V0Lm9uKCdwbGF5ZXJSZXNwYXduJywgdGhpcy5fb25QbGF5ZXJSZXNwYXduLmJpbmQodGhpcykpO1xyXG4gICAgICAgIHRoaXMuc29ja2V0Lm9uKCdidWxsZXQnLCB0aGlzLl9vbkJ1bGxldC5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLnNvY2tldC5vbignY291bnRkb3duJywgdGhpcy5fb25Db3VudGRvd24uYmluZCh0aGlzKSk7XHJcbiAgICAgICAgdGhpcy5zb2NrZXQub24oJ2Nsb2NrVGljaycsIHRoaXMuX29uQ2xvY2tUaWNrLmJpbmQodGhpcykpO1xyXG4gICAgICAgIHRoaXMuc29ja2V0Lm9uKCdnYW1lT3ZlckRhdGEnLCB0aGlzLl9vbkdhbWVPdmVyRGF0YS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAgICAgdGhpcy5zb2NrZXQuZW1pdCgnaW5pdCcsIHtcclxuICAgICAgICAgICAgdXNlciA6ICQoXCIjdXNlck5hbWVcIikuaHRtbCgpXHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG5cclxuICAgIGdldFJvb21zIDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuc29ja2V0LmVtaXQoJ3VwZGF0ZVJvb21zJyk7XHJcbiAgICB9LFxyXG5cclxuICAgIGNyZWF0ZVJvb20gOiBmdW5jdGlvbiAobmFtZSkge1xyXG4gICAgICAgIHZhciByb29tRGF0YSA9IHtcclxuICAgICAgICAgICAgbmFtZSAgOiBuYW1lLFxyXG4gICAgICAgICAgICBlbnRlciA6IHRydWVcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLnNvY2tldC5lbWl0KCdjcmVhdGVSb29tJywgcm9vbURhdGEpO1xyXG4gICAgfSxcclxuXHJcbiAgICBlbnRlclJvb20gOiBmdW5jdGlvbiAocm9vbUlkKSB7XHJcbiAgICAgICAgdGhpcy5zb2NrZXQuZW1pdCgnZW50ZXJSb29tJywgcm9vbUlkKTtcclxuICAgIH0sXHJcblxyXG4gICAgbGVhdmVSb29tIDogZnVuY3Rpb24gKHJvb21JZCkge1xyXG4gICAgICAgIHRoaXMuc29ja2V0LmVtaXQoJ2xlYXZlUm9vbScsIHJvb21JZCk7XHJcbiAgICB9LFxyXG5cclxuICAgIHN3aXRjaFRlYW0gOiBmdW5jdGlvbiAocm9vbUlkKSB7XHJcbiAgICAgICAgdGhpcy5zb2NrZXQuZW1pdCgnc3dpdGNoVGVhbScsIHJvb21JZCk7XHJcbiAgICB9LFxyXG5cclxuICAgIGlzSG9zdCA6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5ob3N0SWQgPT09IHRoaXMubG9jYWxDbGllbnQuaWQ7XHJcbiAgICB9LFxyXG5cclxuICAgIF9vbkNvbmZpcm1DbGllbnQgOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgIHZhciBpZCA9IGRhdGEuaWQ7XHJcbiAgICAgICAgdGhpcy5sb2NhbENsaWVudCA9IG5ldyBMb2NhbENsaWVudChpZCwgZGF0YSk7XHJcbiAgICAgICAgdGhpcy5jbGllbnRzW2lkXSA9IHRoaXMubG9jYWxDbGllbnQ7XHJcblxyXG4gICAgICAgIHRoaXMuY29ubmVjdGVkID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgJCh0aGlzKS50cmlnZ2VyKFxyXG4gICAgICAgICAgICB0aGlzLkV2ZW50LkNPTk5FQ1RcclxuICAgICAgICApO1xyXG4gICAgfSxcclxuXHJcbiAgICBfb25BZGRPdGhlckNsaWVudCA6IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgdmFyIGlkID0gZGF0YS5pZDtcclxuICAgICAgICB2YXIgbmV3Q2xpZW50ID0gbmV3IENsaWVudChpZCwgZGF0YSk7XHJcblxyXG4gICAgICAgIHRoaXMuY2xpZW50c1tkYXRhLmlkXSA9IG5ld0NsaWVudDtcclxuICAgIH0sXHJcblxyXG4gICAgX29uUmVtb3ZlT3RoZXJDbGllbnQgOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgIHRoaXMuY2xpZW50c1tkYXRhLmlkXSA9IHVuZGVmaW5lZDtcclxuICAgICAgICBkZWxldGUgdGhpcy5jbGllbnRzW2RhdGEuaWRdO1xyXG4gICAgfSxcclxuXHJcbiAgICBfb25Mb2FkUHJldmlvdXNDbGllbnRzIDogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGRhdGEpO1xyXG5cclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdmFyIGlkID0gcGFyc2VJbnQoa2V5c1tpXSk7XHJcbiAgICAgICAgICAgIHZhciB1c2VyRGF0YSA9IGRhdGFbaWRdO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5fb25BZGRPdGhlckNsaWVudCh1c2VyRGF0YSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBfb25VcGRhdGVDbGllbnQgOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgIHZhciBpZCA9IGRhdGEuaWQ7XHJcbiAgICAgICAgdmFyIGNsaWVudCA9IHRoaXMuY2xpZW50c1tpZF07XHJcblxyXG4gICAgICAgIGNsaWVudC5kYXRhID0gZGF0YTtcclxuXHJcbiAgICAgICAgaWYgKGNsaWVudC5nYW1lT2JqZWN0KSB7XHJcbiAgICAgICAgICAgIGNsaWVudC5nYW1lT2JqZWN0LnBvc2l0aW9uLnggPSBkYXRhLnBvc2l0aW9uLng7XHJcbiAgICAgICAgICAgIGNsaWVudC5nYW1lT2JqZWN0LnBvc2l0aW9uLnkgPSBkYXRhLnBvc2l0aW9uLnk7XHJcbiAgICAgICAgICAgIGNsaWVudC5nYW1lT2JqZWN0LnZlbG9jaXR5LnggPSBkYXRhLnZlbG9jaXR5Lng7XHJcbiAgICAgICAgICAgIGNsaWVudC5nYW1lT2JqZWN0LnZlbG9jaXR5LnkgPSBkYXRhLnZlbG9jaXR5Lnk7XHJcbiAgICAgICAgICAgIGNsaWVudC5nYW1lT2JqZWN0LmFjY2VsZXJhdGlvbi54ID0gZGF0YS5hY2NlbGVyYXRpb24ueDtcclxuICAgICAgICAgICAgY2xpZW50LmdhbWVPYmplY3QuYWNjZWxlcmF0aW9uLnkgPSBkYXRhLmFjY2VsZXJhdGlvbi55O1xyXG4gICAgICAgICAgICBjbGllbnQuZ2FtZU9iamVjdC5zZXRSb3RhdGlvbihkYXRhLnJvdGF0aW9uKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIF9vblVwZGF0ZVJvb21zIDogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICB0aGlzLnJvb21zID0gZGF0YTtcclxuXHJcbiAgICAgICAgJCh0aGlzKS50cmlnZ2VyKFxyXG4gICAgICAgICAgICB0aGlzLkV2ZW50LlVQREFURV9ST09NUyxcclxuICAgICAgICAgICAgZGF0YVxyXG4gICAgICAgICk7XHJcbiAgICB9LFxyXG5cclxuICAgIF9vbkVudGVyUm9vbVN1Y2Nlc3MgOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICQodGhpcykudHJpZ2dlcihcclxuICAgICAgICAgICAgdGhpcy5FdmVudC5FTlRFUl9ST09NX1NVQ0NFU1MsXHJcbiAgICAgICAgICAgIGRhdGFcclxuICAgICAgICApO1xyXG4gICAgfSxcclxuXHJcbiAgICBfb25FbnRlclJvb21GYWlsIDogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAkKHRoaXMpLnRyaWdnZXIoXHJcbiAgICAgICAgICAgIHRoaXMuRXZlbnQuRU5URVJfUk9PTV9GQUlMLFxyXG4gICAgICAgICAgICBkYXRhXHJcbiAgICAgICAgKTtcclxuICAgIH0sXHJcblxyXG4gICAgX29uUGluZyA6IGZ1bmN0aW9uIChwaW5nT2JqKSB7XHJcbiAgICAgICAgaWYgKHBpbmdPYmopIHtcclxuICAgICAgICAgICAgdGhpcy5zb2NrZXQuZW1pdCgncmV0dXJuUGluZycsIHBpbmdPYmopO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX29uU2V0SG9zdCA6IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgdGhpcy5ob3N0SWQgPSBkYXRhLmlkO1xyXG4gICAgfSxcclxuXHJcbiAgICBfb25TdGFydEdhbWUgOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICQodGhpcykudHJpZ2dlcihcclxuICAgICAgICAgICAgdGhpcy5FdmVudC5TVEFSVF9HQU1FLFxyXG4gICAgICAgICAgICBkYXRhXHJcbiAgICAgICAgKTtcclxuICAgIH0sXHJcblxyXG4gICAgX29uRW5kR2FtZSA6IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgdmFyIHJvb20gPSB0aGlzLnJvb21zW2RhdGEuaWRdO1xyXG5cclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJvb20ucGxheWVycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB0aGlzLmNsaWVudHNbcm9vbS5wbGF5ZXJzW2ldXS5kYXRhLnJlYWR5ID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmxvY2FsQ2xpZW50LmRhdGEucmVhZHkgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgJCh0aGlzKS50cmlnZ2VyKFxyXG4gICAgICAgICAgICB0aGlzLkV2ZW50LkVORF9HQU1FLFxyXG4gICAgICAgICAgICBkYXRhXHJcbiAgICAgICAgKTtcclxuICAgIH0sXHJcblxyXG4gICAgX29uUGxheWVyRGVhdGggOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICQodGhpcykudHJpZ2dlcihcclxuICAgICAgICAgICAgdGhpcy5FdmVudC5QTEFZRVJfREVBVEgsXHJcbiAgICAgICAgICAgIGRhdGFcclxuICAgICAgICApO1xyXG4gICAgfSxcclxuXHJcbiAgICBfb25QbGF5ZXJSZXNwYXduIDogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAkKHRoaXMpLnRyaWdnZXIoXHJcbiAgICAgICAgICAgIHRoaXMuRXZlbnQuUExBWUVSX1JFU1BBV04sXHJcbiAgICAgICAgICAgIGRhdGFcclxuICAgICAgICApO1xyXG4gICAgfSxcclxuXHJcbiAgICBfb25CdWxsZXQgOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICQodGhpcykudHJpZ2dlcihcclxuICAgICAgICAgICAgdGhpcy5FdmVudC5CVUxMRVQsXHJcbiAgICAgICAgICAgIGRhdGFcclxuICAgICAgICApO1xyXG4gICAgfSxcclxuXHJcbiAgICBfb25Db3VudGRvd24gOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICQodGhpcykudHJpZ2dlcihcclxuICAgICAgICAgICAgdGhpcy5FdmVudC5DT1VOVERPV04sXHJcbiAgICAgICAgICAgIGRhdGFcclxuICAgICAgICApO1xyXG4gICAgfSxcclxuXHJcbiAgICBfb25DbG9ja1RpY2sgOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICQodGhpcykudHJpZ2dlcihcclxuICAgICAgICAgICAgdGhpcy5FdmVudC5DTE9DS19USUNLLFxyXG4gICAgICAgICAgICBkYXRhXHJcbiAgICAgICAgKTtcclxuICAgIH0sXHJcblxyXG4gICAgX29uR2FtZU92ZXJEYXRhIDogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAkKHRoaXMpLnRyaWdnZXIoXHJcbiAgICAgICAgICAgIHRoaXMuRXZlbnQuR0FNRV9PVkVSX0RBVEEsXHJcbiAgICAgICAgICAgIGRhdGFcclxuICAgICAgICApO1xyXG4gICAgfVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBOZXR3b3JrO1xyXG5cclxudmFyIENsaWVudCA9IHJlcXVpcmUoJy4vQ2xpZW50LmpzJyk7XHJcbnZhciBMb2NhbENsaWVudCA9IHJlcXVpcmUoJy4vTG9jYWxDbGllbnQuanMnKTsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBPdmVybGF5ID0gcmVxdWlyZSgnLi9PdmVybGF5LmpzJyk7XHJcblxyXG52YXIgQ3JlYXRlUm9vbU92ZXJsYXkgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICBPdmVybGF5LmNhbGwodGhpcyk7XHJcbiAgICBcclxuICAgIHRoaXMuaW5wdXRGaWVsZCA9ICQoXCI8aW5wdXQ+XCIpO1xyXG4gICAgdGhpcy5pbnB1dEZpZWxkLmF0dHIoeyBcInBsYWNlaG9sZGVyXCIgOiBcIlJvb20gTmFtZVwiIH0pO1xyXG4gICAgdGhpcy5pbnB1dEZpZWxkLmFkZENsYXNzKFwiY3JlYXRlLXJvb20tb3ZlcmxheS1pbnB1dFwiKTtcclxuICAgIFxyXG4gICAgdGhpcy5idXR0b25Db250YWluZXIgPSAkKFwiPGRpdj5cIik7XHJcbiAgICB0aGlzLmJ1dHRvbkNvbnRhaW5lci5hZGRDbGFzcyhcImNyZWF0ZS1yb29tLW92ZXJsYXktYnV0dG9uLWNvbnRhaW5lclwiKTtcclxuICAgIFxyXG4gICAgdGhpcy5jYW5jZWxCdG4gPSAkKFwiPGJ1dHRvbj5cIik7XHJcbiAgICB0aGlzLmNhbmNlbEJ0bi50ZXh0KFwiQ2FuY2VsXCIpO1xyXG4gICAgdGhpcy5idXR0b25Db250YWluZXIuYXBwZW5kKHRoaXMuY2FuY2VsQnRuKTtcclxuICAgIFxyXG4gICAgdGhpcy5jcmVhdGVCdG4gPSAkKFwiPGJ1dHRvbj5cIik7XHJcbiAgICB0aGlzLmNyZWF0ZUJ0bi50ZXh0KFwiQ3JlYXRlXCIpO1xyXG4gICAgdGhpcy5idXR0b25Db250YWluZXIuYXBwZW5kKHRoaXMuY3JlYXRlQnRuKTtcclxuXHJcbiAgICB0aGlzLmRvbU9iamVjdC5hcHBlbmQodGhpcy5pbnB1dEZpZWxkKTtcclxuICAgIHRoaXMuZG9tT2JqZWN0LmFwcGVuZCh0aGlzLmJ1dHRvbkNvbnRhaW5lcik7XHJcbiAgICB0aGlzLmRvbU9iamVjdC5hZGRDbGFzcyhcImNyZWF0ZS1yb29tLW92ZXJsYXlcIik7XHJcbn07XHJcblxyXG5DcmVhdGVSb29tT3ZlcmxheS5wcm90b3R5cGUgPSBPYmplY3QuZnJlZXplKE9iamVjdC5jcmVhdGUoT3ZlcmxheS5wcm90b3R5cGUsIHtcclxuXHJcbn0pKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ3JlYXRlUm9vbU92ZXJsYXk7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgT3ZlcmxheSA9IHJlcXVpcmUoJy4vT3ZlcmxheS5qcycpO1xyXG52YXIgTmV0d29yayA9IHJlcXVpcmUoJy4uL25ldHdvcmsnKTtcclxuXHJcbnZhciBHYW1lT3Zlck92ZXJsYXkgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICBPdmVybGF5LmNhbGwodGhpcyk7XHJcblxyXG4gICAgdGhpcy5yZXN1bHRzTGFiZWwgPSAkKFwiPGRpdj5cIik7XHJcbiAgICB0aGlzLnJlc3VsdHNMYWJlbC5odG1sKFwiUmVzdWx0c1wiKTtcclxuICAgIHRoaXMucmVzdWx0c0xhYmVsLmFkZENsYXNzKFwiZ2FtZS1vdmVyLW92ZXJsYXktcmVzdWx0cy1sYWJlbFwiKTtcclxuXHJcbiAgICB0aGlzLnRlYW1BQ29udGFpbmVyID0gJChcIjxkaXY+XCIpO1xyXG4gICAgdGhpcy50ZWFtQUNvbnRhaW5lci5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXktdGVhbUEtY29udGFpbmVyXCIpO1xyXG5cclxuICAgIHRoaXMudGVhbUJDb250YWluZXIgPSAkKFwiPGRpdj5cIik7XHJcbiAgICB0aGlzLnRlYW1CQ29udGFpbmVyLmFkZENsYXNzKFwibG9iYnktb3ZlcmxheS10ZWFtQi1jb250YWluZXJcIik7XHJcblxyXG4gICAgdGhpcy5yZXR1cm5Ub0xvYmJ5QnRuID0gJChcIjxidXR0b24+XCIpO1xyXG4gICAgdGhpcy5yZXR1cm5Ub0xvYmJ5QnRuLnRleHQoXCJSZXR1cm4gdG8gTG9iYnlcIik7XHJcbiAgICB0aGlzLnJldHVyblRvTG9iYnlCdG4uYWRkQ2xhc3MoXCJnYW1lLW92ZXItb3ZlcmxheS1yZXR1cm4tdG8tbG9iYnktYnV0dG9uXCIpO1xyXG5cclxuICAgIHRoaXMuZG9tT2JqZWN0LmFwcGVuZCh0aGlzLnJlc3VsdHNMYWJlbCk7XHJcbiAgICB0aGlzLmRvbU9iamVjdC5hcHBlbmQodGhpcy5sb2FkaW5nSWNvbik7XHJcbiAgICB0aGlzLmRvbU9iamVjdC5hcHBlbmQodGhpcy50ZWFtQUNvbnRhaW5lcik7XHJcbiAgICB0aGlzLmRvbU9iamVjdC5hcHBlbmQodGhpcy50ZWFtQkNvbnRhaW5lcik7XHJcbiAgICB0aGlzLmRvbU9iamVjdC5hcHBlbmQodGhpcy5yZXR1cm5Ub0xvYmJ5QnRuKTtcclxuXHJcbiAgICB0aGlzLmRvbU9iamVjdC5hZGRDbGFzcyhcImdhbWUtb3Zlci1vdmVybGF5XCIpO1xyXG4gICAgdGhpcy5kb21PYmplY3QuYWRkQ2xhc3MoXCJmYWRlLWluXCIpO1xyXG5cclxuICAgIHRoaXMucmVuZGVyU2NvcmUoKTtcclxufTtcclxuXHJcbkdhbWVPdmVyT3ZlcmxheS5wcm90b3R5cGUgPSBPYmplY3QuZnJlZXplKE9iamVjdC5jcmVhdGUoT3ZlcmxheS5wcm90b3R5cGUsIHtcclxuICAgIHJlbmRlclNjb3JlIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKHJvb21EYXRhKSB7XHJcbiAgICAgICAgICAgIHRoaXMudGVhbUFDb250YWluZXIuaHRtbChcIlwiKTtcclxuICAgICAgICAgICAgdGhpcy50ZWFtQkNvbnRhaW5lci5odG1sKFwiXCIpO1xyXG5cclxuICAgICAgICAgICAgdmFyIHRlYW1BTGFiZWwgPSAkKFwiPHNwYW4+XCIpO1xyXG4gICAgICAgICAgICB0ZWFtQUxhYmVsLmh0bWwoXCJSb3NlIFRlYW1cIik7XHJcbiAgICAgICAgICAgIHRlYW1BTGFiZWwuYWRkQ2xhc3MoXCJnYW1lLW92ZXItb3ZlcmxheS10ZWFtLWxhYmVsXCIpO1xyXG5cclxuICAgICAgICAgICAgdmFyIHRlYW1BS2lsbExhYmVsID0gJChcIjxzcGFuPlwiKTtcclxuICAgICAgICAgICAgdGVhbUFLaWxsTGFiZWwuaHRtbChcIktcIik7XHJcbiAgICAgICAgICAgIHRlYW1BS2lsbExhYmVsLmFkZENsYXNzKFwiZ2FtZS1vdmVyLW92ZXJsYXktdGVhbS1raWxsLWxhYmVsXCIpO1xyXG5cclxuICAgICAgICAgICAgdmFyIHRlYW1BRGVhdGhMYWJlbCA9ICQoXCI8c3Bhbj5cIik7XHJcbiAgICAgICAgICAgIHRlYW1BRGVhdGhMYWJlbC5odG1sKFwiRFwiKTtcclxuICAgICAgICAgICAgdGVhbUFEZWF0aExhYmVsLmFkZENsYXNzKFwiZ2FtZS1vdmVyLW92ZXJsYXktdGVhbS1kZWF0aC1sYWJlbFwiKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMudGVhbUFDb250YWluZXIuYXBwZW5kKHRlYW1BTGFiZWwpO1xyXG4gICAgICAgICAgICB0aGlzLnRlYW1BQ29udGFpbmVyLmFwcGVuZCh0ZWFtQUtpbGxMYWJlbCk7XHJcbiAgICAgICAgICAgIHRoaXMudGVhbUFDb250YWluZXIuYXBwZW5kKHRlYW1BRGVhdGhMYWJlbCk7XHJcblxyXG4gICAgICAgICAgICB2YXIgdGVhbUJMYWJlbCA9ICQoXCI8c3Bhbj5cIik7XHJcbiAgICAgICAgICAgIHRlYW1CTGFiZWwuaHRtbChcIlNreSBUZWFtXCIpO1xyXG4gICAgICAgICAgICB0ZWFtQkxhYmVsLmFkZENsYXNzKFwiZ2FtZS1vdmVyLW92ZXJsYXktdGVhbS1sYWJlbFwiKTtcclxuXHJcbiAgICAgICAgICAgIHZhciB0ZWFtQktpbGxMYWJlbCA9ICQoXCI8c3Bhbj5cIik7XHJcbiAgICAgICAgICAgIHRlYW1CS2lsbExhYmVsLmh0bWwoXCJLXCIpO1xyXG4gICAgICAgICAgICB0ZWFtQktpbGxMYWJlbC5hZGRDbGFzcyhcImdhbWUtb3Zlci1vdmVybGF5LXRlYW0ta2lsbC1sYWJlbFwiKTtcclxuXHJcbiAgICAgICAgICAgIHZhciB0ZWFtQkRlYXRoTGFiZWwgPSAkKFwiPHNwYW4+XCIpO1xyXG4gICAgICAgICAgICB0ZWFtQkRlYXRoTGFiZWwuaHRtbChcIkRcIik7XHJcbiAgICAgICAgICAgIHRlYW1CRGVhdGhMYWJlbC5hZGRDbGFzcyhcImdhbWUtb3Zlci1vdmVybGF5LXRlYW0tZGVhdGgtbGFiZWxcIik7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnRlYW1CQ29udGFpbmVyLmFwcGVuZCh0ZWFtQkxhYmVsKTtcclxuICAgICAgICAgICAgdGhpcy50ZWFtQkNvbnRhaW5lci5hcHBlbmQodGVhbUJLaWxsTGFiZWwpO1xyXG4gICAgICAgICAgICB0aGlzLnRlYW1CQ29udGFpbmVyLmFwcGVuZCh0ZWFtQkRlYXRoTGFiZWwpO1xyXG5cclxuICAgICAgICAgICAgaWYgKCFyb29tRGF0YSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHRlYW1BTG9hZGluZ0NvbnRhaW5lciA9ICQoXCI8ZGl2PlwiKTtcclxuICAgICAgICAgICAgICAgIHRlYW1BTG9hZGluZ0NvbnRhaW5lci5odG1sKFwiTG9hZGluZy4uLlwiKTtcclxuICAgICAgICAgICAgICAgIHRlYW1BTGFiZWwuYXBwZW5kKHRlYW1BTG9hZGluZ0NvbnRhaW5lcik7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIHRlYW1CTG9hZGluZ0NvbnRhaW5lciA9ICQoXCI8ZGl2PlwiKTtcclxuICAgICAgICAgICAgICAgIHRlYW1CTG9hZGluZ0NvbnRhaW5lci5odG1sKFwiTG9hZGluZy4uLlwiKTtcclxuICAgICAgICAgICAgICAgIHRlYW1CTGFiZWwuYXBwZW5kKHRlYW1CTG9hZGluZ0NvbnRhaW5lcik7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB2YXIgdGVhbUEgPSByb29tRGF0YS50ZWFtQTtcclxuICAgICAgICAgICAgdmFyIHRlYW1CID0gcm9vbURhdGEudGVhbUI7XHJcbiAgICAgICAgICAgIHZhciBsb2NhbElkID0gTmV0d29yay5sb2NhbENsaWVudC5pZDtcclxuXHJcbiAgICAgICAgICAgIHZhciB0ZWFtQU5hbWVDb250YWluZXIgPSAkKFwiPHNwYW4+XCIpO1xyXG4gICAgICAgICAgICB2YXIgdGVhbUFLaWxsc0NvbnRhaW5lciA9ICQoXCI8c3Bhbj5cIik7XHJcbiAgICAgICAgICAgIHZhciB0ZWFtQURlYXRoc0NvbnRhaW5lciA9ICQoXCI8c3Bhbj5cIik7XHJcbiAgICAgICAgICAgIHRlYW1BTmFtZUNvbnRhaW5lci5hZGRDbGFzcyhcImdhbWUtb3Zlci1vdmVybGF5LW5hbWUtY29udGFpbmVyXCIpO1xyXG4gICAgICAgICAgICB0ZWFtQUtpbGxzQ29udGFpbmVyLmFkZENsYXNzKFwiZ2FtZS1vdmVyLW92ZXJsYXkta2lsbHMtY29udGFpbmVyXCIpO1xyXG4gICAgICAgICAgICB0ZWFtQURlYXRoc0NvbnRhaW5lci5hZGRDbGFzcyhcImdhbWUtb3Zlci1vdmVybGF5LWRlYXRocy1jb250YWluZXJcIik7XHJcblxyXG4gICAgICAgICAgICB2YXIgdGVhbUJOYW1lQ29udGFpbmVyID0gJChcIjxzcGFuPlwiKTtcclxuICAgICAgICAgICAgdmFyIHRlYW1CS2lsbHNDb250YWluZXIgPSAkKFwiPHNwYW4+XCIpO1xyXG4gICAgICAgICAgICB2YXIgdGVhbUJEZWF0aHNDb250YWluZXIgPSAkKFwiPHNwYW4+XCIpO1xyXG4gICAgICAgICAgICB0ZWFtQk5hbWVDb250YWluZXIuYWRkQ2xhc3MoXCJnYW1lLW92ZXItb3ZlcmxheS1uYW1lLWNvbnRhaW5lclwiKTtcclxuICAgICAgICAgICAgdGVhbUJLaWxsc0NvbnRhaW5lci5hZGRDbGFzcyhcImdhbWUtb3Zlci1vdmVybGF5LWtpbGxzLWNvbnRhaW5lclwiKTtcclxuICAgICAgICAgICAgdGVhbUJEZWF0aHNDb250YWluZXIuYWRkQ2xhc3MoXCJnYW1lLW92ZXItb3ZlcmxheS1kZWF0aHMtY29udGFpbmVyXCIpO1xyXG5cclxuICAgICAgICAgICAgLy8gQWRkIHRlYW0gQSBwbGF5ZXJzXHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbGFiZWw7XHJcbiAgICAgICAgICAgICAgICB2YXIga2lsbHM7XHJcbiAgICAgICAgICAgICAgICB2YXIgZGVhdGhzO1xyXG4gICAgICAgICAgICAgICAgdmFyIHBsYXllckNvbnRhaW5lciA9ICQoXCI8ZGl2PlwiKTtcclxuICAgICAgICAgICAgICAgIHZhciBraWxsc0NvbnRhaW5lciA9ICQoXCI8ZGl2PlwiKTtcclxuICAgICAgICAgICAgICAgIHZhciBkZWF0aHNDb250YWluZXIgPSAkKFwiPGRpdj5cIik7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGkgPCB0ZWFtQS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgY3VyUGxheWVyID0gdGVhbUFbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWwgPSBjdXJQbGF5ZXIudXNlcjtcclxuICAgICAgICAgICAgICAgICAgICBraWxscyA9IGN1clBsYXllci5raWxscztcclxuICAgICAgICAgICAgICAgICAgICBkZWF0aHMgPSBjdXJQbGF5ZXIuZGVhdGhzO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoY3VyUGxheWVyLmlkID09PSBsb2NhbElkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYXllckNvbnRhaW5lci5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXktbG9jYWwtcGxheWVyLWNvbnRhaW5lclwiKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsID0gXCItLS0tLS1cIjtcclxuICAgICAgICAgICAgICAgICAgICBraWxscyA9IFwiLVwiO1xyXG4gICAgICAgICAgICAgICAgICAgIGRlYXRocyA9IFwiLVwiO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHBsYXllckNvbnRhaW5lci5odG1sKGxhYmVsKTtcclxuICAgICAgICAgICAgICAgIGtpbGxzQ29udGFpbmVyLmh0bWwoa2lsbHMpO1xyXG4gICAgICAgICAgICAgICAgZGVhdGhzQ29udGFpbmVyLmh0bWwoZGVhdGhzKTtcclxuICAgICAgICAgICAgICAgIHRlYW1BTmFtZUNvbnRhaW5lci5hcHBlbmQocGxheWVyQ29udGFpbmVyKTtcclxuICAgICAgICAgICAgICAgIHRlYW1BS2lsbHNDb250YWluZXIuYXBwZW5kKGtpbGxzQ29udGFpbmVyKTtcclxuICAgICAgICAgICAgICAgIHRlYW1BRGVhdGhzQ29udGFpbmVyLmFwcGVuZChkZWF0aHNDb250YWluZXIpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLnRlYW1BQ29udGFpbmVyLmFwcGVuZCh0ZWFtQU5hbWVDb250YWluZXIpO1xyXG4gICAgICAgICAgICB0aGlzLnRlYW1BQ29udGFpbmVyLmFwcGVuZCh0ZWFtQUtpbGxzQ29udGFpbmVyKTtcclxuICAgICAgICAgICAgdGhpcy50ZWFtQUNvbnRhaW5lci5hcHBlbmQodGVhbUFEZWF0aHNDb250YWluZXIpO1xyXG5cclxuICAgICAgICAgICAgLy8gQWRkIHRlYW0gQiBwbGF5ZXJzXHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbGFiZWw7XHJcbiAgICAgICAgICAgICAgICB2YXIga2lsbHM7XHJcbiAgICAgICAgICAgICAgICB2YXIgZGVhdGhzO1xyXG4gICAgICAgICAgICAgICAgdmFyIHBsYXllckNvbnRhaW5lciA9ICQoXCI8ZGl2PlwiKTtcclxuICAgICAgICAgICAgICAgIHZhciBraWxsc0NvbnRhaW5lciA9ICQoXCI8ZGl2PlwiKTtcclxuICAgICAgICAgICAgICAgIHZhciBkZWF0aHNDb250YWluZXIgPSAkKFwiPGRpdj5cIik7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGkgPCB0ZWFtQi5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgY3VyUGxheWVyID0gdGVhbUJbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWwgPSBjdXJQbGF5ZXIudXNlcjtcclxuICAgICAgICAgICAgICAgICAgICBraWxscyA9IGN1clBsYXllci5raWxscztcclxuICAgICAgICAgICAgICAgICAgICBkZWF0aHMgPSBjdXJQbGF5ZXIuZGVhdGhzO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoY3VyUGxheWVyLmlkID09PSBsb2NhbElkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYXllckNvbnRhaW5lci5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXktbG9jYWwtcGxheWVyLWNvbnRhaW5lclwiKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsID0gXCItLS0tLS1cIjtcclxuICAgICAgICAgICAgICAgICAgICBraWxscyA9IFwiLVwiO1xyXG4gICAgICAgICAgICAgICAgICAgIGRlYXRocyA9IFwiLVwiO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHBsYXllckNvbnRhaW5lci5odG1sKGxhYmVsKTtcclxuICAgICAgICAgICAgICAgIGtpbGxzQ29udGFpbmVyLmh0bWwoa2lsbHMpO1xyXG4gICAgICAgICAgICAgICAgZGVhdGhzQ29udGFpbmVyLmh0bWwoZGVhdGhzKTtcclxuICAgICAgICAgICAgICAgIHRlYW1CTmFtZUNvbnRhaW5lci5hcHBlbmQocGxheWVyQ29udGFpbmVyKTtcclxuICAgICAgICAgICAgICAgIHRlYW1CS2lsbHNDb250YWluZXIuYXBwZW5kKGtpbGxzQ29udGFpbmVyKTtcclxuICAgICAgICAgICAgICAgIHRlYW1CRGVhdGhzQ29udGFpbmVyLmFwcGVuZChkZWF0aHNDb250YWluZXIpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLnRlYW1CQ29udGFpbmVyLmFwcGVuZCh0ZWFtQk5hbWVDb250YWluZXIpO1xyXG4gICAgICAgICAgICB0aGlzLnRlYW1CQ29udGFpbmVyLmFwcGVuZCh0ZWFtQktpbGxzQ29udGFpbmVyKTtcclxuICAgICAgICAgICAgdGhpcy50ZWFtQkNvbnRhaW5lci5hcHBlbmQodGVhbUJEZWF0aHNDb250YWluZXIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBHYW1lT3Zlck92ZXJsYXk7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgT3ZlcmxheSA9IHJlcXVpcmUoJy4vT3ZlcmxheS5qcycpO1xyXG5cclxudmFyIExvYWRpbmdPdmVybGF5ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgT3ZlcmxheS5jYWxsKHRoaXMpO1xyXG4gICAgXHJcbiAgICB0aGlzLmRvbU9iamVjdC5hZGRDbGFzcyhcImxvYWRpbmctb3ZlcmxheS1iZ1wiKTtcclxuICAgIFxyXG4gICAgdGhpcy5sb2FkaW5nSWNvbiA9ICQoXCI8ZGl2PlwiKTtcclxuICAgIHRoaXMubG9hZGluZ0ljb24uYWRkQ2xhc3MoXCJsb2FkaW5nLW92ZXJsYXlcIik7XHJcbiAgICBcclxuICAgIHRoaXMuZG9tT2JqZWN0LmFwcGVuZCh0aGlzLmxvYWRpbmdJY29uKTtcclxufTtcclxuXHJcbkxvYWRpbmdPdmVybGF5LnByb3RvdHlwZSA9IE9iamVjdC5mcmVlemUoT2JqZWN0LmNyZWF0ZShPdmVybGF5LnByb3RvdHlwZSwge1xyXG5cclxufSkpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBMb2FkaW5nT3ZlcmxheTsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBPdmVybGF5ID0gcmVxdWlyZSgnLi9PdmVybGF5LmpzJyk7XHJcbnZhciBOZXR3b3JrID0gcmVxdWlyZSgnLi4vbmV0d29yaycpO1xyXG5cclxudmFyIExvYmJ5T3ZlcmxheSA9IGZ1bmN0aW9uICgpIHtcclxuICAgIE92ZXJsYXkuY2FsbCh0aGlzKTtcclxuXHJcbiAgICAvLyBTZXQgdXAgbGVmdCBzaWRlXHJcbiAgICB0aGlzLmxlZnRDb250YWluZXIgPSAkKFwiPHNwYW4+XCIpO1xyXG4gICAgdGhpcy5sZWZ0Q29udGFpbmVyLmFkZENsYXNzKFwibG9iYnktb3ZlcmxheS1sZWZ0XCIpO1xyXG4gICAgdGhpcy5sZWZ0Q29udGFpbmVyLmFkZENsYXNzKFwibG9iYnktb3ZlcmxheS1tYXhpbWl6ZWQtc2lkZVwiKTtcclxuXHJcbiAgICB0aGlzLnJvb21CdXR0b25Db250YWluZXIgPSAkKFwiPGRpdj5cIik7XHJcbiAgICB0aGlzLnJvb21CdXR0b25Db250YWluZXIuYWRkQ2xhc3MoXCJsb2JieS1vdmVybGF5LWJ1dHRvbi1jb250YWluZXJcIik7XHJcbiAgICB0aGlzLmxlZnRDb250YWluZXIuYXBwZW5kKHRoaXMucm9vbUJ1dHRvbkNvbnRhaW5lcik7XHJcblxyXG4gICAgdGhpcy5zZWxlY3RSb29tTGFiZWwgPSAkKFwiPGRpdj5cIik7XHJcbiAgICB0aGlzLnNlbGVjdFJvb21MYWJlbC5odG1sKFwiU2VsZWN0IG9yIGNyZWF0ZSByb29tXCIpO1xyXG4gICAgdGhpcy5yb29tQnV0dG9uQ29udGFpbmVyLmFwcGVuZCh0aGlzLnNlbGVjdFJvb21MYWJlbCk7XHJcbiAgICB0aGlzLnJvb21CdXR0b25Db250YWluZXIuYXBwZW5kKCQoXCI8YnI+XCIpKTtcclxuXHJcbiAgICB0aGlzLmNyZWF0ZVJvb21CdG4gPSAkKFwiPGJ1dHRvbj5cIik7XHJcbiAgICB0aGlzLmNyZWF0ZVJvb21CdG4udGV4dChcIkNyZWF0ZSBSb29tXCIpO1xyXG4gICAgdGhpcy5yb29tQnV0dG9uQ29udGFpbmVyLmFwcGVuZCh0aGlzLmNyZWF0ZVJvb21CdG4pO1xyXG5cclxuICAgIHRoaXMucm9vbUxpc3RDb250YWluZXIgPSAkKFwiPGRpdj5cIik7XHJcbiAgICB0aGlzLnJvb21MaXN0Q29udGFpbmVyLmFkZENsYXNzKFwibG9iYnktb3ZlcmxheS1yb29tLWxpc3RcIik7XHJcbiAgICB0aGlzLnJvb21MaXN0Q29udGFpbmVyLmh0bWwoXCJMb2FkaW5nIHJvb21zLi4uXCIpO1xyXG4gICAgdGhpcy5sZWZ0Q29udGFpbmVyLmFwcGVuZCh0aGlzLnJvb21MaXN0Q29udGFpbmVyKTtcclxuXHJcbiAgICAvLyBTZXQgdXAgcmlnaHQgc2lkZVxyXG4gICAgdGhpcy5yaWdodENvbnRhaW5lciA9ICQoXCI8c3Bhbj5cIik7XHJcbiAgICB0aGlzLnJpZ2h0Q29udGFpbmVyLmFkZENsYXNzKFwibG9iYnktb3ZlcmxheS1yaWdodFwiKTtcclxuICAgIHRoaXMucmlnaHRDb250YWluZXIuYWRkQ2xhc3MoXCJsb2JieS1vdmVybGF5LW1pbmltaXplZC1zaWRlXCIpO1xyXG5cclxuICAgIHRoaXMuc2VsZWN0ZWRSb29tTGFiZWwgPSAkKFwiPGRpdj5cIik7XHJcbiAgICB0aGlzLnNlbGVjdGVkUm9vbUxhYmVsLmFkZENsYXNzKFwibG9iYnktb3ZlcmxheS1yb29tLWxhYmVsLWNvbnRhaW5lclwiKTtcclxuXHJcbiAgICB0aGlzLnJlbmRlclJvb21MYWJlbCgpO1xyXG4gICAgdGhpcy5yaWdodENvbnRhaW5lci5hcHBlbmQodGhpcy5zZWxlY3RlZFJvb21MYWJlbCk7XHJcblxyXG4gICAgdGhpcy5zd2l0Y2hUZWFtQnRuID0gJChcIjxidXR0b24+XCIpO1xyXG4gICAgdGhpcy5zd2l0Y2hUZWFtQnRuLnRleHQoXCJTd2l0Y2ggVGVhbXNcIik7XHJcbiAgICB0aGlzLnN3aXRjaFRlYW1CdG4uYWRkQ2xhc3MoXCJsb2JieS1vdmVybGF5LXN3aXRjaC10ZWFtLWJ0blwiKTtcclxuXHJcbiAgICB0aGlzLnRlYW1BQ29udGFpbmVyID0gJChcIjxkaXY+XCIpO1xyXG4gICAgdGhpcy50ZWFtQUNvbnRhaW5lci5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXktdGVhbUEtY29udGFpbmVyXCIpO1xyXG5cclxuICAgIHRoaXMudGVhbUJDb250YWluZXIgPSAkKFwiPGRpdj5cIik7XHJcbiAgICB0aGlzLnRlYW1CQ29udGFpbmVyLmFkZENsYXNzKFwibG9iYnktb3ZlcmxheS10ZWFtQi1jb250YWluZXJcIik7XHJcblxyXG4gICAgdGhpcy5yZW5kZXJQbGF5ZXJzKCk7XHJcblxyXG4gICAgdGhpcy5yaWdodENvbnRhaW5lci5hcHBlbmQodGhpcy50ZWFtQUNvbnRhaW5lcik7XHJcbiAgICB0aGlzLnJpZ2h0Q29udGFpbmVyLmFwcGVuZCh0aGlzLnN3aXRjaFRlYW1CdG4pO1xyXG4gICAgdGhpcy5yaWdodENvbnRhaW5lci5hcHBlbmQodGhpcy50ZWFtQkNvbnRhaW5lcik7XHJcblxyXG4gICAgdGhpcy5sZWF2ZVJvb21CdG4gPSAkKFwiPGJ1dHRvbj5cIik7XHJcbiAgICB0aGlzLmxlYXZlUm9vbUJ0bi50ZXh0KFwiTGVhdmUgUm9vbVwiKTtcclxuICAgIHRoaXMubGVhdmVSb29tQnRuLmFkZENsYXNzKFwibG9iYnktb3ZlcmxheS1sZWF2ZS1yb29tLWJ0blwiKTtcclxuICAgIHRoaXMubGVhdmVSb29tQnRuLmhpZGUoKTtcclxuICAgIHRoaXMucmlnaHRDb250YWluZXIuYXBwZW5kKHRoaXMubGVhdmVSb29tQnRuKTtcclxuXHJcbiAgICB0aGlzLnJlYWR5QnRuID0gJChcIjxidXR0b24+XCIpO1xyXG4gICAgdGhpcy5yZWFkeUJ0bi50ZXh0KFwiUmVhZHlcIik7XHJcbiAgICB0aGlzLnJlYWR5QnRuLmFkZENsYXNzKFwibG9iYnktb3ZlcmxheS1yZWFkeS1idG5cIik7XHJcbiAgICB0aGlzLnJlYWR5QnRuLmhpZGUoKTtcclxuICAgIHRoaXMucmlnaHRDb250YWluZXIuYXBwZW5kKHRoaXMucmVhZHlCdG4pO1xyXG5cclxuICAgIHRoaXMuZG9tT2JqZWN0LmFwcGVuZCh0aGlzLmxlZnRDb250YWluZXIpO1xyXG4gICAgdGhpcy5kb21PYmplY3QuYXBwZW5kKHRoaXMucmlnaHRDb250YWluZXIpO1xyXG4gICAgdGhpcy5kb21PYmplY3QuYWRkQ2xhc3MoXCJsb2JieS1vdmVybGF5XCIpO1xyXG4gICAgdGhpcy5kb21PYmplY3QuYWRkQ2xhc3MoXCJmYWRlLWluXCIpO1xyXG59O1xyXG5cclxuT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoTG9iYnlPdmVybGF5LCB7XHJcbiAgICBFdmVudCA6IHtcclxuICAgICAgICB2YWx1ZSA6IHtcclxuICAgICAgICAgICAgRU5URVJfUk9PTSA6IFwiZW50ZXJSb29tXCJcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pO1xyXG5cclxuTG9iYnlPdmVybGF5LnByb3RvdHlwZSA9IE9iamVjdC5mcmVlemUoT2JqZWN0LmNyZWF0ZShPdmVybGF5LnByb3RvdHlwZSwge1xyXG4gICAgc2hvd1Jvb21zIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKHJvb21EYXRhKSB7XHJcbiAgICAgICAgICAgIHRoaXMucm9vbUxpc3RDb250YWluZXIuaHRtbChcIlwiKTtcclxuXHJcbiAgICAgICAgICAgICQoXCIubG9iYnktb3ZlcmxheS1yb29tXCIpLm9mZihcImNsaWNrXCIpO1xyXG5cclxuICAgICAgICAgICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhyb29tRGF0YSk7XHJcblxyXG4gICAgICAgICAgICBpZiAoa2V5cy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucm9vbUxpc3RDb250YWluZXIuaHRtbChcIk5vIHJvb21zIGF2YWlsYWJsZVwiKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBjdXJSb29tID0gcm9vbURhdGFba2V5c1tpXV07XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGN1clJvb21Db250YWluZXIgPSAkKFwiPGRpdj5cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgY3VyUm9vbUNvbnRhaW5lci5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXktcm9vbVwiKTtcclxuICAgICAgICAgICAgICAgICAgICBjdXJSb29tQ29udGFpbmVyLmh0bWwoY3VyUm9vbS5uYW1lKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgJChjdXJSb29tQ29udGFpbmVyKS5vbihcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJjbGlja1wiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJSb29tLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9vbkNsaWNrUm9vbS5iaW5kKHRoaXMpXHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yb29tTGlzdENvbnRhaW5lci5hcHBlbmQoY3VyUm9vbUNvbnRhaW5lcik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIHJlbmRlclJvb20gOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICBpZiAoZGF0YSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlclJvb21MYWJlbCgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJQbGF5ZXJzKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5fb25FeGl0Um9vbSgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJSb29tTGFiZWwoZGF0YS5uYW1lKTtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyUGxheWVycyhkYXRhKTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLl9vbkVudGVyUm9vbSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICByZW5kZXJSb29tTGFiZWwgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAobGFiZWwpIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBsYWJlbCAhPT0gXCJzdHJpbmdcIiB8fCBsYWJlbCA9PT0gXCJcIikge1xyXG4gICAgICAgICAgICAgICAgbGFiZWwgPSBcIk5vIHJvb20gc2VsZWN0ZWRcIjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGFiZWwgPSBcIkN1cnJlbnQgcm9vbTogXCIgKyBsYWJlbDtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRSb29tTGFiZWwuaHRtbChsYWJlbCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICByZW5kZXJQbGF5ZXJzIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKHJvb21EYXRhKSB7XHJcbiAgICAgICAgICAgIHRoaXMudGVhbUFDb250YWluZXIuaHRtbChcIlwiKTtcclxuICAgICAgICAgICAgdGhpcy50ZWFtQkNvbnRhaW5lci5odG1sKFwiXCIpO1xyXG4gICAgICAgICAgICB0aGlzLnN3aXRjaFRlYW1CdG4uaGlkZSgpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHJvb21EYXRhICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIHZhciB0ZWFtQSA9IHJvb21EYXRhLnRlYW1BO1xyXG4gICAgICAgICAgICAgICAgdmFyIHRlYW1CID0gcm9vbURhdGEudGVhbUI7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIHRlYW1BTGFiZWwgPSAkKFwiPGRpdj5cIik7XHJcbiAgICAgICAgICAgICAgICB0ZWFtQUxhYmVsLmh0bWwoXCJSb3NlIFRlYW1cIik7XHJcbiAgICAgICAgICAgICAgICB0ZWFtQUxhYmVsLmFkZENsYXNzKFwibG9iYnktb3ZlcmxheS10ZWFtLWxhYmVsXCIpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy50ZWFtQUNvbnRhaW5lci5hcHBlbmQodGVhbUFMYWJlbCk7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIHRlYW1CTGFiZWwgPSAkKFwiPGRpdj5cIik7XHJcbiAgICAgICAgICAgICAgICB0ZWFtQkxhYmVsLmh0bWwoXCJTa3kgVGVhbVwiKTtcclxuICAgICAgICAgICAgICAgIHRlYW1CTGFiZWwuYWRkQ2xhc3MoXCJsb2JieS1vdmVybGF5LXRlYW0tbGFiZWxcIik7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnRlYW1CQ29udGFpbmVyLmFwcGVuZCh0ZWFtQkxhYmVsKTtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgbG9jYWxJZCA9IE5ldHdvcmsubG9jYWxDbGllbnQuaWQ7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQWRkIHRlYW0gQSBwbGF5ZXJzXHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDQ7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBsYWJlbDtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcGxheWVyQ29udGFpbmVyID0gJChcIjxkaXY+XCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciByZWFkeSA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoaSA8IHRlYW1BLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY3VySWQgPSB0ZWFtQVtpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGN1clBsYXllciA9IE5ldHdvcmsuY2xpZW50c1tjdXJJZF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlYWR5ID0gY3VyUGxheWVyLmRhdGEucmVhZHk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsID0gY3VyUGxheWVyLmRhdGEudXNlcjtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdXJJZCA9PT0gbG9jYWxJZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGxheWVyQ29udGFpbmVyLmFkZENsYXNzKFwibG9iYnktb3ZlcmxheS1sb2NhbC1wbGF5ZXItY29udGFpbmVyXCIpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghcmVhZHkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlYWR5QnRuLmh0bWwoXCJSZWFkeVwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN3aXRjaFRlYW1CdG4ucHJvcChcImRpc2FibGVkXCIsIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWFkeUJ0bi5odG1sKFwiQ2FuY2VsXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3dpdGNoVGVhbUJ0bi5wcm9wKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbCA9IFwiLS0tLS0tXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBwbGF5ZXJDb250YWluZXIuaHRtbChsYWJlbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50ZWFtQUNvbnRhaW5lci5hcHBlbmQocGxheWVyQ29udGFpbmVyKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlYWR5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciByZWFkeUNvbnRhaW5lciA9ICQoXCI8c3Bhbj5cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlYWR5Q29udGFpbmVyLmh0bWwoXCJSZWFkeVwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVhZHlDb250YWluZXIuYWRkQ2xhc3MoXCJsb2JieS1vdmVybGF5LXJlYWR5LWNvbnRhaW5lclwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGxheWVyQ29udGFpbmVyLmFwcGVuZChyZWFkeUNvbnRhaW5lcik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIEFkZCB0ZWFtIEIgcGxheWVyc1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCA0OyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbGFiZWw7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBsYXllckNvbnRhaW5lciA9ICQoXCI8ZGl2PlwiKTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcmVhZHkgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGkgPCB0ZWFtQi5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGN1cklkID0gdGVhbUJbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjdXJQbGF5ZXIgPSBOZXR3b3JrLmNsaWVudHNbY3VySWRdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZWFkeSA9IGN1clBsYXllci5kYXRhLnJlYWR5O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbCA9IGN1clBsYXllci5kYXRhLnVzZXI7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3VySWQgPT09IGxvY2FsSWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBsYXllckNvbnRhaW5lci5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXktbG9jYWwtcGxheWVyLWNvbnRhaW5lclwiKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXJlYWR5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWFkeUJ0bi5odG1sKFwiUmVhZHlcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zd2l0Y2hUZWFtQnRuLnByb3AoXCJkaXNhYmxlZFwiLCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVhZHlCdG4uaHRtbChcIkNhbmNlbFwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN3aXRjaFRlYW1CdG4ucHJvcChcImRpc2FibGVkXCIsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWwgPSBcIi0tLS0tLVwiO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcGxheWVyQ29udGFpbmVyLmh0bWwobGFiZWwpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGVhbUJDb250YWluZXIuYXBwZW5kKHBsYXllckNvbnRhaW5lcik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZWFkeSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcmVhZHlDb250YWluZXIgPSAkKFwiPHNwYW4+XCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZWFkeUNvbnRhaW5lci5odG1sKFwiUmVhZHlcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlYWR5Q29udGFpbmVyLmFkZENsYXNzKFwibG9iYnktb3ZlcmxheS1yZWFkeS1jb250YWluZXJcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYXllckNvbnRhaW5lci5hcHBlbmQocmVhZHlDb250YWluZXIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLnN3aXRjaFRlYW1CdG4uc2hvdygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBfb25DbGlja1Jvb20gOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICB2YXIgZGF0YSA9IGUuZGF0YTtcclxuICAgICAgICAgICAgdmFyIHJvb20gPSB7XHJcbiAgICAgICAgICAgICAgICBuYW1lIDogZGF0YS5uYW1lLFxyXG4gICAgICAgICAgICAgICAgaWQgICA6IGRhdGEuaWRcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICQodGhpcykudHJpZ2dlcihMb2JieU92ZXJsYXkuRXZlbnQuRU5URVJfUk9PTSwgcm9vbSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBfb25FeGl0Um9vbSA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy5sZWF2ZVJvb21CdG4uaGlkZSgpO1xyXG4gICAgICAgICAgICB0aGlzLnJlYWR5QnRuLmhpZGUoKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMubGVmdENvbnRhaW5lci5yZW1vdmVDbGFzcyhcImxvYmJ5LW92ZXJsYXktbWluaW1pemVkLXNpZGVcIik7XHJcbiAgICAgICAgICAgIHRoaXMucmlnaHRDb250YWluZXIucmVtb3ZlQ2xhc3MoXCJsb2JieS1vdmVybGF5LW1heGltaXplZC1zaWRlXCIpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5sZWZ0Q29udGFpbmVyLmFkZENsYXNzKFwibG9iYnktb3ZlcmxheS1tYXhpbWl6ZWQtc2lkZVwiKTtcclxuICAgICAgICAgICAgdGhpcy5yaWdodENvbnRhaW5lci5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXktbWluaW1pemVkLXNpZGVcIik7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBfb25FbnRlclJvb20gOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMubGVhdmVSb29tQnRuLnNob3coKTtcclxuICAgICAgICAgICAgdGhpcy5yZWFkeUJ0bi5zaG93KCk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmxlZnRDb250YWluZXIucmVtb3ZlQ2xhc3MoXCJsb2JieS1vdmVybGF5LW1heGltaXplZC1zaWRlXCIpO1xyXG4gICAgICAgICAgICB0aGlzLnJpZ2h0Q29udGFpbmVyLnJlbW92ZUNsYXNzKFwibG9iYnktb3ZlcmxheS1taW5pbWl6ZWQtc2lkZVwiKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMubGVmdENvbnRhaW5lci5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXktbWluaW1pemVkLXNpZGVcIik7XHJcbiAgICAgICAgICAgIHRoaXMucmlnaHRDb250YWluZXIuYWRkQ2xhc3MoXCJsb2JieS1vdmVybGF5LW1heGltaXplZC1zaWRlXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkpO1xyXG5cclxuT2JqZWN0LmZyZWV6ZShMb2JieU92ZXJsYXkpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBMb2JieU92ZXJsYXk7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgT3ZlcmxheSA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMuZG9tT2JqZWN0ID0gJChcIjxkaXY+XCIpO1xyXG4gICAgdGhpcy5kb21PYmplY3QuYWRkQ2xhc3MoXCJjYW52YXMtb3ZlcmxheVwiKTtcclxufTtcclxuXHJcbk92ZXJsYXkucHJvdG90eXBlID0gT2JqZWN0LmZyZWV6ZShPYmplY3QuY3JlYXRlKE92ZXJsYXkucHJvdG90eXBlLCB7XHJcblxyXG59KSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE92ZXJsYXk7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgT3ZlcmxheSA9IHJlcXVpcmUoJy4vT3ZlcmxheS5qcycpO1xyXG52YXIgTG9hZGluZ092ZXJsYXkgPSByZXF1aXJlKCcuL0xvYWRpbmdPdmVybGF5LmpzJyk7XHJcbnZhciBDcmVhdGVSb29tT3ZlcmxheSA9IHJlcXVpcmUoJy4vQ3JlYXRlUm9vbU92ZXJsYXkuanMnKTtcclxudmFyIEdhbWVPdmVyT3ZlcmxheSA9IHJlcXVpcmUoJy4vR2FtZU92ZXJPdmVybGF5LmpzJyk7XHJcbnZhciBMb2JieU92ZXJsYXkgPSByZXF1aXJlKCcuL0xvYmJ5T3ZlcmxheS5qcycpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICBPdmVybGF5IDogT3ZlcmxheSxcclxuICAgIExvYWRpbmdPdmVybGF5IDogTG9hZGluZ092ZXJsYXksXHJcbiAgICBDcmVhdGVSb29tT3ZlcmxheSA6IENyZWF0ZVJvb21PdmVybGF5LFxyXG4gICAgR2FtZU92ZXJPdmVybGF5IDogR2FtZU92ZXJPdmVybGF5LFxyXG4gICAgTG9iYnlPdmVybGF5IDogTG9iYnlPdmVybGF5XHJcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgU2NlbmUgPSB3ZmwuZGlzcGxheS5TY2VuZTtcclxudmFyIG92ZXJsYXlzID0gcmVxdWlyZSgnLi4vb3ZlcmxheXMnKTtcclxudmFyIE5ldHdvcmsgPSByZXF1aXJlKCcuLi9uZXR3b3JrJyk7XHJcblxyXG52YXIgR2FtZU92ZXJTY2VuZSA9IGZ1bmN0aW9uIChjYW52YXMsIHJvb20pIHtcclxuICAgIFNjZW5lLmNhbGwodGhpcywgY2FudmFzKTtcclxuXHJcbiAgICB0aGlzLnJvb20gPSByb29tO1xyXG5cclxuICAgICQoTmV0d29yaykub24oTmV0d29yay5FdmVudC5HQU1FX09WRVJfREFUQSwgdGhpcy5fb25VcGRhdGVTY29yZS5iaW5kKHRoaXMpKTtcclxuICAgIE5ldHdvcmsuc29ja2V0LmVtaXQoTmV0d29yay5FdmVudC5HQU1FX09WRVJfREFUQSwgcm9vbS5pZCk7XHJcblxyXG4gICAgdGhpcy5nYW1lT3Zlck92ZXJsYXkgPSBuZXcgb3ZlcmxheXMuR2FtZU92ZXJPdmVybGF5KCk7XHJcbiAgICAkKGNhbnZhcykucGFyZW50KCkuYXBwZW5kKHRoaXMuZ2FtZU92ZXJPdmVybGF5LmRvbU9iamVjdCk7XHJcblxyXG4gICAgdGhpcy5sb2FkaW5nT3ZlcmxheSA9IG5ldyBvdmVybGF5cy5Mb2FkaW5nT3ZlcmxheSgpO1xyXG4gICAgJChjYW52YXMpLnBhcmVudCgpLmFwcGVuZCh0aGlzLmxvYWRpbmdPdmVybGF5LmRvbU9iamVjdCk7XHJcblxyXG4gICAgdGhpcy5nYW1lT3Zlck92ZXJsYXkucmV0dXJuVG9Mb2JieUJ0bi5jbGljayh0aGlzLl9vblJldHVyblRvTG9iYnkuYmluZCh0aGlzKSk7XHJcbn07XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKEdhbWVPdmVyU2NlbmUsIHtcclxuICAgIEV2ZW50IDoge1xyXG4gICAgICAgIHZhbHVlIDoge1xyXG4gICAgICAgICAgICBSRVRVUk5fVE9fTE9CQlkgOiBcInJldHVyblRvTG9iYnlcIlxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSk7XHJcbkdhbWVPdmVyU2NlbmUucHJvdG90eXBlID0gT2JqZWN0LmZyZWV6ZShPYmplY3QuY3JlYXRlKFNjZW5lLnByb3RvdHlwZSwge1xyXG4gICAgZGVzdHJveSA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy5nYW1lT3Zlck92ZXJsYXkuZG9tT2JqZWN0LnJlbW92ZSgpO1xyXG4gICAgICAgICAgICB0aGlzLmxvYWRpbmdPdmVybGF5LmRvbU9iamVjdC5yZW1vdmUoKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIF9vblVwZGF0ZVNjb3JlIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGUsIGRhdGEpIHtcclxuICAgICAgICAgICAgdGhpcy5sb2FkaW5nT3ZlcmxheS5kb21PYmplY3QucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuZ2FtZU92ZXJPdmVybGF5LnJlbmRlclNjb3JlKGRhdGEpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX29uUmV0dXJuVG9Mb2JieSA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgICQodGhpcykudHJpZ2dlcihcclxuICAgICAgICAgICAgICAgIEdhbWVPdmVyU2NlbmUuRXZlbnQuUkVUVVJOX1RPX0xPQkJZLFxyXG4gICAgICAgICAgICAgICAgdGhpcy5yb29tXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSk7XHJcbk9iamVjdC5mcmVlemUoR2FtZU92ZXJTY2VuZSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEdhbWVPdmVyU2NlbmU7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcclxudmFyIEFzc2V0cyA9IHV0aWwuQXNzZXRzO1xyXG52YXIgU2NlbmUgPSB3ZmwuZGlzcGxheS5TY2VuZTtcclxudmFyIE5ldHdvcmsgPSByZXF1aXJlKCcuLi9uZXR3b3JrJyk7XHJcbnZhciBHYW1lT2JqZWN0ID0gd2ZsLmNvcmUuZW50aXRpZXMuR2FtZU9iamVjdDtcclxudmFyIFBoeXNpY3NPYmplY3QgPSB3ZmwuY29yZS5lbnRpdGllcy5QaHlzaWNzT2JqZWN0O1xyXG52YXIgZW50aXRpZXMgPSByZXF1aXJlKCcuLi9lbnRpdGllcycpO1xyXG52YXIgQnVsbGV0ID0gZW50aXRpZXMuQnVsbGV0O1xyXG52YXIgQ2xpZW50UGxheWVyID0gZW50aXRpZXMuQ2xpZW50UGxheWVyO1xyXG52YXIgRnVsbEJvY2sgPSBlbnRpdGllcy5GdWxsQmxvY2s7XHJcbnZhciBQbGF5ZXIgPSBlbnRpdGllcy5QbGF5ZXI7XHJcbnZhciBiYWNrZ3JvdW5kcyA9IHdmbC5kaXNwbGF5LmJhY2tncm91bmRzO1xyXG52YXIgZ2VvbSA9IHdmbC5nZW9tO1xyXG5cclxudmFyIEdhbWVTY2VuZSA9IGZ1bmN0aW9uIChjYW52YXMsIHJvb20pIHtcclxuICAgIFNjZW5lLmNhbGwodGhpcywgY2FudmFzLCByb29tKTtcclxuXHJcbiAgICAvLyBBZGQgb3RoZXIgY2xpZW50cyB0aGF0IGFyZSBhbHJlYWR5IGNvbm5lY3RlZFxyXG4gICAgdmFyIHJvb20gPSBOZXR3b3JrLnJvb21zW3Jvb20uaWRdO1xyXG4gICAgdmFyIHBsYXllcnMgPSByb29tLnBsYXllcnM7XHJcblxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwbGF5ZXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIGlkID0gcGxheWVyc1tpXTtcclxuICAgICAgICB2YXIgY2xpZW50ID0gTmV0d29yay5jbGllbnRzW2lkXTtcclxuXHJcbiAgICAgICAgaWYgKGNsaWVudCAhPT0gTmV0d29yay5sb2NhbENsaWVudCkge1xyXG4gICAgICAgICAgICB2YXIgZ2FtZU9iamVjdCA9IG5ldyBDbGllbnRQbGF5ZXIoY2xpZW50LmRhdGEudGVhbSk7XHJcbiAgICAgICAgICAgIGNsaWVudC5nYW1lT2JqZWN0ID0gZ2FtZU9iamVjdDtcclxuICAgICAgICAgICAgY2xpZW50LmdhbWVPYmplY3QuY3VzdG9tRGF0YS5jbGllbnRJZCA9IGNsaWVudC5kYXRhLmlkO1xyXG4gICAgICAgICAgICB0aGlzLmFkZEdhbWVPYmplY3QoZ2FtZU9iamVjdCwgMSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgICQoTmV0d29yaykub24oXHJcbiAgICAgICAgTmV0d29yay5FdmVudC5CVUxMRVQsXHJcbiAgICAgICAgdGhpcy5vbkJ1bGxldC5iaW5kKHRoaXMpXHJcbiAgICApO1xyXG5cclxuICAgICQoTmV0d29yaykub24oXHJcbiAgICAgICAgTmV0d29yay5FdmVudC5DTE9DS19USUNLLFxyXG4gICAgICAgIHRoaXMub25DbG9ja1RpY2suYmluZCh0aGlzKVxyXG4gICAgKTtcclxuXHJcbiAgICAkKE5ldHdvcmspLm9uKFxyXG4gICAgICAgIE5ldHdvcmsuRXZlbnQuQ09VTlRET1dOLFxyXG4gICAgICAgIHRoaXMub25Db3VudGRvd24uYmluZCh0aGlzKVxyXG4gICAgKTtcclxuXHJcbiAgICAkKE5ldHdvcmspLm9uKFxyXG4gICAgICAgIE5ldHdvcmsuRXZlbnQuUExBWUVSX0RFQVRILFxyXG4gICAgICAgIHRoaXMub25QbGF5ZXJEZWF0aC5iaW5kKHRoaXMpXHJcbiAgICApO1xyXG5cclxuICAgICQoTmV0d29yaykub24oXHJcbiAgICAgICAgTmV0d29yay5FdmVudC5QTEFZRVJfUkVTUEFXTixcclxuICAgICAgICB0aGlzLm9uUGxheWVyUmVzcGF3bi5iaW5kKHRoaXMpXHJcbiAgICApO1xyXG5cclxuICAgIHRoaXMudGltZVJlbWFpbmluZyA9IHJvb20udGltZVJlbWFpbmluZztcclxuICAgIHRoaXMuaW5pdGlhbENvdW50ZG93biA9IHJvb20uY291bnRkb3duO1xyXG4gICAgdGhpcy5jb3VudGluZ0Rvd24gPSB0cnVlO1xyXG4gICAgdGhpcy5yZXNwYXduVGltZSA9IHJvb20ucmVzcGF3blRpbWU7XHJcbiAgICB0aGlzLnJlc3Bhd25UaW1lUmVtYWluaW5nID0gdGhpcy5yZXNwYXduVGltZTtcclxuXHJcbiAgICB2YXIgd2FsbFNpemUgPSAxMDtcclxuICAgIHZhciBibG9ja1NpemUgPSAxMjg7XHJcbiAgICB2YXIgb2Zmc2V0ID0gLSh3YWxsU2l6ZSAqIDAuNSAtIDEpICogYmxvY2tTaXplO1xyXG5cclxuICAgIC8vIExpbmUgdGhlIHRvcFxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCA5OyBpKyspIHtcclxuICAgICAgICB2YXIgbmV3QmxvY2sgPSBuZXcgRnVsbEJvY2soKTtcclxuICAgICAgICBuZXdCbG9jay5wb3NpdGlvbi54ID0gYmxvY2tTaXplICogaSArIG9mZnNldDtcclxuICAgICAgICBuZXdCbG9jay5wb3NpdGlvbi55ID0gb2Zmc2V0O1xyXG5cclxuICAgICAgICB0aGlzLmFkZEdhbWVPYmplY3QobmV3QmxvY2spO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIExpbmUgdGhlIGJvdHRvbVxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCA5OyBpKyspIHtcclxuICAgICAgICB2YXIgbmV3QmxvY2sgPSBuZXcgRnVsbEJvY2soKTtcclxuICAgICAgICBuZXdCbG9jay5wb3NpdGlvbi54ID0gYmxvY2tTaXplICogaSArIG9mZnNldDtcclxuICAgICAgICBuZXdCbG9jay5wb3NpdGlvbi55ID0gLW9mZnNldDtcclxuXHJcbiAgICAgICAgdGhpcy5hZGRHYW1lT2JqZWN0KG5ld0Jsb2NrKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBMaW5lIHRoZSBsZWZ0XHJcbiAgICBmb3IgKHZhciBpID0gMTsgaSA8IDg7IGkrKykge1xyXG4gICAgICAgIHZhciBuZXdCbG9jayA9IG5ldyBGdWxsQm9jaygpO1xyXG4gICAgICAgIG5ld0Jsb2NrLnBvc2l0aW9uLnggPSBvZmZzZXQ7XHJcbiAgICAgICAgbmV3QmxvY2sucG9zaXRpb24ueSA9IGJsb2NrU2l6ZSAqIGkgKyBvZmZzZXQ7XHJcblxyXG4gICAgICAgIHRoaXMuYWRkR2FtZU9iamVjdChuZXdCbG9jayk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gTGluZSB0aGUgcmlnaHRcclxuICAgIGZvciAodmFyIGkgPSAxOyBpIDwgODsgaSsrKSB7XHJcbiAgICAgICAgdmFyIG5ld0Jsb2NrID0gbmV3IEZ1bGxCb2NrKCk7XHJcbiAgICAgICAgbmV3QmxvY2sucG9zaXRpb24ueCA9IC1vZmZzZXQ7XHJcbiAgICAgICAgbmV3QmxvY2sucG9zaXRpb24ueSA9IGJsb2NrU2l6ZSAqIGkgKyBvZmZzZXQ7XHJcblxyXG4gICAgICAgIHRoaXMuYWRkR2FtZU9iamVjdChuZXdCbG9jayk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5iZyA9IG5ldyBiYWNrZ3JvdW5kcy5QYXJhbGxheEJhY2tncm91bmQoXHJcbiAgICAgICAgQXNzZXRzLmdldChBc3NldHMuQkdfVElMRSlcclxuICAgICk7XHJcblxyXG4gICAgdGhpcy5wbGF5ZXIgPSBuZXcgUGxheWVyKE5ldHdvcmsubG9jYWxDbGllbnQuZGF0YS50ZWFtKTtcclxuXHJcbiAgICBOZXR3b3JrLmxvY2FsQ2xpZW50LmdhbWVPYmplY3QgPSB0aGlzLnBsYXllcjtcclxuICAgIHRoaXMucGxheWVyLmN1c3RvbURhdGEuY2xpZW50SWQgPSBOZXR3b3JrLmxvY2FsQ2xpZW50LmRhdGEuaWQ7XHJcbiAgICB0aGlzLmFkZEdhbWVPYmplY3QodGhpcy5wbGF5ZXIsIDIpO1xyXG5cclxuICAgIHRoaXMuY2FtZXJhLmZvbGxvdyh0aGlzLnBsYXllcik7XHJcbn07XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKEdhbWVTY2VuZSwge1xyXG4gICAgRlJJQ1RJT04gOiB7XHJcbiAgICAgICAgdmFsdWUgOiAwLjkyNVxyXG4gICAgfSxcclxuXHJcbiAgICBNSU5JTUFQIDoge1xyXG4gICAgICAgIHZhbHVlIDogT2JqZWN0LmZyZWV6ZSh7XHJcbiAgICAgICAgICAgIFdJRFRIICAgICAgOiAxNTAsXHJcbiAgICAgICAgICAgIEhFSUdIVCAgICAgOiAxMDAsXHJcbiAgICAgICAgICAgIFNDQUxFICAgICAgOiAwLjEsXHJcbiAgICAgICAgICAgIEZJTExfU1RZTEUgOiBcIiMxOTI0MjdcIlxyXG4gICAgICAgIH0pXHJcbiAgICB9XHJcbn0pO1xyXG5HYW1lU2NlbmUucHJvdG90eXBlID0gT2JqZWN0LmZyZWV6ZShPYmplY3QuY3JlYXRlKFNjZW5lLnByb3RvdHlwZSwge1xyXG4gICAgLyoqXHJcbiAgICAgKiBVcGRhdGVzIHRoZSBzY2VuZSBhbmQgYWxsIGdhbWUgb2JqZWN0cyBpbiBpdFxyXG4gICAgICovXHJcbiAgICB1cGRhdGUgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoZHQpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuY291bnRpbmdEb3duID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmluaXRpYWxDb3VudGRvd24gLT0gZHQ7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKE5ldHdvcmsuaXNIb3N0KCkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbmRDb3VudGRvd24oKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5pbml0aWFsQ291bnRkb3duIDw9IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvdW50aW5nRG93biA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgU2NlbmUucHJvdG90eXBlLnVwZGF0ZS5jYWxsKHRoaXMsIGR0KTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLnRpbWVSZW1haW5pbmcgLT0gZHQ7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gTWFrZSB0aGUgY2FtZXJhIGZvbGxvdyB0aGUga2lsbGVyIGlmIHRoZSBwbGF5ZXIgd2FzIGtpbGxlZFxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucGxheWVyLmhlYWx0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2hhbmRsZVBsYXllckRlYXRoKGR0KTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBPdGhlcndpc2UsIGFsbG93IHRoZSBwbGF5ZXIgdG8gbW92ZVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9oYW5kbGVJbnB1dCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuX2FwcGx5RnJpY3Rpb24oKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3JlbW92ZURlYWRHYW1lT2JqZWN0cygpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChOZXR3b3JrLmlzSG9zdCgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZW5kQ2xvY2tUaWNrKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIHNlbmRDb3VudGRvd24gOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmIChOZXR3b3JrLmNvbm5lY3RlZCkge1xyXG4gICAgICAgICAgICAgICAgTmV0d29yay5zb2NrZXQuZW1pdCgnY291bnRkb3duJywge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvdW50ZG93biA6IHRoaXMuaW5pdGlhbENvdW50ZG93blxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIHNlbmRDbG9ja1RpY2sgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmIChOZXR3b3JrLmNvbm5lY3RlZCkge1xyXG4gICAgICAgICAgICAgICAgTmV0d29yay5zb2NrZXQuZW1pdCgnY2xvY2tUaWNrJywge1xyXG4gICAgICAgICAgICAgICAgICAgIHRpbWVSZW1haW5pbmcgOiB0aGlzLnRpbWVSZW1haW5pbmdcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBzZW5kUGxheWVyRGVhdGggOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmIChOZXR3b3JrLmNvbm5lY3RlZCkge1xyXG4gICAgICAgICAgICAgICAgTmV0d29yay5zb2NrZXQuZW1pdCgncGxheWVyRGVhdGgnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVhZCA6IHRoaXMucGxheWVyLmN1c3RvbURhdGEuY2xpZW50SWQsXHJcbiAgICAgICAgICAgICAgICAgICAga2lsbGVyIDogdGhpcy5wbGF5ZXIuY3VzdG9tRGF0YS5raWxsZXIuY3VzdG9tRGF0YS5jbGllbnRJZFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRHJhd3MgdGhlIHNjZW5lIGFuZCBhbGwgZ2FtZSBvYmplY3RzIGluIGl0XHJcbiAgICAgKi9cclxuICAgIGRyYXcgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoY3R4KSB7XHJcbiAgICAgICAgICAgIFNjZW5lLnByb3RvdHlwZS5kcmF3LmNhbGwodGhpcywgY3R4KTtcclxuXHJcbiAgICAgICAgICAgIGN0eC5zYXZlKCk7XHJcblxyXG4gICAgICAgICAgICB2YXIgc2NyZWVuV2lkdGggID0gY3R4LmNhbnZhcy53aWR0aDtcclxuICAgICAgICAgICAgdmFyIHNjcmVlbkhlaWdodCA9IGN0eC5jYW52YXMuaGVpZ2h0O1xyXG4gICAgICAgICAgICB2YXIgb2Zmc2V0ICAgICAgID0gbmV3IGdlb20uVmVjMihcclxuICAgICAgICAgICAgICAgIHNjcmVlbldpZHRoICAqIDAuNSxcclxuICAgICAgICAgICAgICAgIHNjcmVlbkhlaWdodCAqIDAuNVxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgLy8gU2hvdyB0aGUgcmVtYWluaW5nIGR1cmF0aW9uIG9mIHRoZSBnYW1lXHJcbiAgICAgICAgICAgIHZhciB0aW1lVGV4dDtcclxuICAgICAgICAgICAgaWYgKHRoaXMudGltZVJlbWFpbmluZyA+IDApIHtcclxuICAgICAgICAgICAgICAgIHZhciBtaW51dGVzID0gTWF0aC5mbG9vcih0aGlzLnRpbWVSZW1haW5pbmcgLyAoMTAwMCAqIDYwKSk7XHJcbiAgICAgICAgICAgICAgICB2YXIgc2Vjb25kcyA9IE1hdGgucm91bmQoKHRoaXMudGltZVJlbWFpbmluZyAtIG1pbnV0ZXMgKiAxMDAwICogNjApIC8gMTAwMCk7XHJcbiAgICAgICAgICAgICAgICB0aW1lVGV4dCA9IG1pbnV0ZXMgKyBcIjpcIjtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoc2Vjb25kcyA8IDEwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGltZVRleHQgKz0gXCIwXCI7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdGltZVRleHQgKz0gc2Vjb25kcztcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRpbWVUZXh0ID0gXCIwOjAwXCI7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGN0eC50cmFuc2xhdGUob2Zmc2V0LngsIDApO1xyXG4gICAgICAgICAgICBjdHguZmlsbFN0eWxlID0gXCIjZmZmXCI7XHJcbiAgICAgICAgICAgIGN0eC50ZXh0QWxpZ24gPSBcImNlbnRlclwiO1xyXG4gICAgICAgICAgICBjdHguZm9udCA9IFwiMjRweCBNdW5yb1wiO1xyXG4gICAgICAgICAgICBjdHgudGV4dEJhc2VsaW5lID0gXCJ0b3BcIjtcclxuICAgICAgICAgICAgY3R4LmZpbGxUZXh0KHRpbWVUZXh0LCAwLCAwKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFNob3cgdGhlIGluaXRpYWwgY291bnRkb3duIGJlZm9yZSB0aGUgZ2FtZVxyXG4gICAgICAgICAgICBpZiAodGhpcy5pbml0aWFsQ291bnRkb3duID4gMCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGNvdW50ZG93blNlY29uZHMgPSBNYXRoLnJvdW5kKHRoaXMuaW5pdGlhbENvdW50ZG93biAvIDEwMDApO1xyXG4gICAgICAgICAgICAgICAgdmFyIGNvdW50ZG93blRleHQgPSBjb3VudGRvd25TZWNvbmRzLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgICAgICBjdHguZmlsbFN0eWxlID0gXCIjZmZmXCI7XHJcblxyXG4gICAgICAgICAgICAgICAgc3dpdGNoIChjb3VudGRvd25TZWNvbmRzKSB7XHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgY2FzZSA1OlxyXG4gICAgICAgICAgICAgICAgICAgIGN0eC5maWxsU3R5bGUgPSBcInJnYigyNTUsIDc5LCA3OSlcIjtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgICAgICBjYXNlIDQ6XHJcbiAgICAgICAgICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9IFwicmdiKDI0NywgMTU1LCA4NylcIjtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgICAgICBjYXNlIDM6XHJcbiAgICAgICAgICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9IFwicmdiKDI0MSwgMjA4LCA5MilcIjtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9IFwicmdiKDIxNSwgMjM1LCA5OSlcIjtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9IFwicmdiKDEzMiwgMjMxLCAxMDMpXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICAgICAgY2FzZSAwOlxyXG4gICAgICAgICAgICAgICAgICAgIGNvdW50ZG93blRleHQgPSBcIkZJR0hUXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9IFwiI2ZmZlwiO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGN0eC50cmFuc2xhdGUoMCwgb2Zmc2V0LnkpO1xyXG4gICAgICAgICAgICAgICAgY3R4LnRleHRBbGlnbiA9IFwiY2VudGVyXCI7XHJcbiAgICAgICAgICAgICAgICBjdHgudGV4dEJhc2VsaW5lID0gXCJtaWRkbGVcIjtcclxuICAgICAgICAgICAgICAgIGN0eC5mb250ID0gXCI5NnB4IE11bnJvXCI7XHJcbiAgICAgICAgICAgICAgICBjdHguZmlsbFRleHQoY291bnRkb3duVGV4dCwgMCwgMCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGN0eC5yZXN0b3JlKCk7XHJcblxyXG4gICAgICAgICAgICAvLyBEcmF3IEhQXHJcbiAgICAgICAgICAgIGN0eC5zYXZlKCk7XHJcblxyXG4gICAgICAgICAgICBjdHgudHJhbnNsYXRlKDQsIDQpO1xyXG5cclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnBsYXllci5tYXhIZWFsdGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgdmFyIGdyYXBoaWM7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5wbGF5ZXIuaGVhbHRoID4gaSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGdyYXBoaWMgPSBBc3NldHMuZ2V0KEFzc2V0cy5IUF9GVUxMKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZ3JhcGhpYyA9IEFzc2V0cy5nZXQoQXNzZXRzLkhQX0VNUFRZKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBjdHguZHJhd0ltYWdlKGdyYXBoaWMsIDAsIDApO1xyXG4gICAgICAgICAgICAgICAgY3R4LnRyYW5zbGF0ZSgyNCwgMCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGN0eC5yZXN0b3JlKCk7XHJcblxyXG4gICAgICAgICAgICAvLyBEcmF3IFJlc3Bhd24gbWVzc2FnZSBpZiBuZWNlc3NhcnlcclxuICAgICAgICAgICAgaWYgKHRoaXMucGxheWVyLmhlYWx0aCA8PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBjdHguc2F2ZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciByZXNwYXduVGltZVJlbWFpbmluZyA9IE1hdGgucm91bmQodGhpcy5yZXNwYXduVGltZVJlbWFpbmluZyAvIDEwMDApO1xyXG4gICAgICAgICAgICAgICAgdmFyIHJlc3Bhd25NZXNzYWdlID0gXCJSZXNwYXduIGluIFwiICsgcmVzcGF3blRpbWVSZW1haW5pbmcudG9TdHJpbmcoKSArIFwiIHNlY29uZHNcIjtcclxuXHJcbiAgICAgICAgICAgICAgICBjdHgudHJhbnNsYXRlKG9mZnNldC54LCBvZmZzZXQueSk7XHJcbiAgICAgICAgICAgICAgICBjdHgudGV4dEFsaWduID0gXCJjZW50ZXJcIjtcclxuICAgICAgICAgICAgICAgIGN0eC50ZXh0QmFzZWxpbmUgPSBcIm1pZGRsZVwiO1xyXG4gICAgICAgICAgICAgICAgY3R4LmZvbnQgPSBcIjQ4cHggTXVucm9cIjtcclxuICAgICAgICAgICAgICAgIGN0eC5maWxsU3R5bGUgPSBcIiNmZmZcIjtcclxuICAgICAgICAgICAgICAgIGN0eC5maWxsVGV4dChyZXNwYXduTWVzc2FnZSwgMCwgMCk7XHJcblxyXG4gICAgICAgICAgICAgICAgY3R4LnJlc3RvcmUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgb25Db3VudGRvd24gOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoZSwgZGF0YSkge1xyXG4gICAgICAgICAgICB0aGlzLmluaXRpYWxDb3VudGRvd24gPSBkYXRhLmNvdW50ZG93bjtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIG9uQ2xvY2tUaWNrIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGUsIGRhdGEpIHtcclxuICAgICAgICAgICAgdGhpcy50aW1lUmVtYWluaW5nID0gZGF0YS50aW1lUmVtYWluaW5nO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgb25CdWxsZXQgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoZSwgZGF0YSkge1xyXG4gICAgICAgICAgICB2YXIgcm90YXRpb24gPSBQaHlzaWNzT2JqZWN0LnByb3RvdHlwZS5nZXREaXNwbGF5QW5nbGUoZGF0YS5yb3RhdGlvbik7XHJcbiAgICAgICAgICAgIHZhciBmb3J3YXJkID0gZ2VvbS5WZWMyLmZyb21BbmdsZShyb3RhdGlvbik7XHJcbiAgICAgICAgICAgIHZhciBwbGF5ZXIgPSBOZXR3b3JrLmNsaWVudHNbZGF0YS5wbGF5ZXJJZF0uZ2FtZU9iamVjdDtcclxuICAgICAgICAgICAgdmFyIGJ1bGxldCA9IG5ldyBCdWxsZXQoMSwgcGxheWVyKTtcclxuICAgICAgICAgICAgYnVsbGV0LnBvc2l0aW9uLnggPSBkYXRhLnBvc2l0aW9uLng7XHJcbiAgICAgICAgICAgIGJ1bGxldC5wb3NpdGlvbi55ID0gZGF0YS5wb3NpdGlvbi55O1xyXG4gICAgICAgICAgICBidWxsZXQudmVsb2NpdHkueCA9IGZvcndhcmQueDtcclxuICAgICAgICAgICAgYnVsbGV0LnZlbG9jaXR5LnkgPSBmb3J3YXJkLnk7XHJcbiAgICAgICAgICAgIGJ1bGxldC5yb3RhdGUocm90YXRpb24pO1xyXG4gICAgICAgICAgICBidWxsZXQudmVsb2NpdHkubXVsdGlwbHkoQnVsbGV0LkRFRkFVTFRfU1BFRUQpO1xyXG4gICAgICAgICAgICBidWxsZXQudmVsb2NpdHkueCArPSBkYXRhLnZlbG9jaXR5Lng7XHJcbiAgICAgICAgICAgIGJ1bGxldC52ZWxvY2l0eS55ICs9IGRhdGEudmVsb2NpdHkueTtcclxuXHJcbiAgICAgICAgICAgIGlmIChidWxsZXQudmVsb2NpdHkuZ2V0TWFnbml0dWRlU3F1YXJlZCgpIDwgQnVsbGV0LkRFRkFVTFRfU1BFRUQgKiBCdWxsZXQuREVGQVVMVF9TUEVFRCkge1xyXG4gICAgICAgICAgICAgICAgYnVsbGV0LnZlbG9jaXR5LnNldE1hZ25pdHVkZShCdWxsZXQuREVGQVVMVF9TUEVFRCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuYWRkR2FtZU9iamVjdChidWxsZXQsIDEpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgb25QbGF5ZXJEZWF0aCA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChlLCBkYXRhKSB7XHJcbiAgICAgICAgICAgIHZhciBwbGF5ZXIgPSBOZXR3b3JrLmNsaWVudHNbZGF0YS5kZWFkXS5nYW1lT2JqZWN0O1xyXG4gICAgICAgICAgICBwbGF5ZXIuc29saWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgcGxheWVyLnNldFN0YXRlKFBsYXllci5TVEFURS5FWFBMT1NJT04pO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgb25QbGF5ZXJSZXNwYXduIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGUsIGRhdGEpIHtcclxuICAgICAgICAgICAgdmFyIHBsYXllciA9IE5ldHdvcmsuY2xpZW50c1tkYXRhLnJlc3Bhd25dLmdhbWVPYmplY3Q7XHJcbiAgICAgICAgICAgIHBsYXllci5zZXRTdGF0ZShHYW1lT2JqZWN0LlNUQVRFLkRFRkFVTFQpO1xyXG4gICAgICAgICAgICBwbGF5ZXIuaGVhbHRoID0gcGxheWVyLm1heEhlYWx0aDtcclxuICAgICAgICAgICAgcGxheWVyLnNvbGlkID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgIC8vIElmIHRoaXMgY2xpZW50J3MgcGxheWVyIGlzIHJlc3Bhd25pbmcsIHRoZW4gbWFrZSB0aGUgY2FtZXJhXHJcbiAgICAgICAgICAgIC8vIHN0YXJ0IGZvbGxvd2luZyBpdCBhZ2FpblxyXG4gICAgICAgICAgICBpZiAocGxheWVyID09PSB0aGlzLnBsYXllcikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jYW1lcmEuZm9sbG93KHBsYXllcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIF9oYW5kbGVJbnB1dCA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIHBsYXllciAgICAgICA9IHRoaXMucGxheWVyO1xyXG4gICAgICAgICAgICB2YXIga2V5Ym9hcmQgICAgID0gdGhpcy5rZXlib2FyZDtcclxuICAgICAgICAgICAgdmFyIGxlZnRQcmVzc2VkICA9IGtleWJvYXJkLmlzUHJlc3NlZChrZXlib2FyZC5MRUZUKTtcclxuICAgICAgICAgICAgdmFyIHJpZ2h0UHJlc3NlZCA9IGtleWJvYXJkLmlzUHJlc3NlZChrZXlib2FyZC5SSUdIVCk7XHJcbiAgICAgICAgICAgIHZhciB1cFByZXNzZWQgICAgPSBrZXlib2FyZC5pc1ByZXNzZWQoa2V5Ym9hcmQuVVApO1xyXG4gICAgICAgICAgICB2YXIgZG93blByZXNzZWQgID0ga2V5Ym9hcmQuaXNQcmVzc2VkKGtleWJvYXJkLkRPV04pO1xyXG4gICAgICAgICAgICB2YXIgc2hvb3RpbmcgICAgID0ga2V5Ym9hcmQuaXNQcmVzc2VkKGtleWJvYXJkLlopO1xyXG5cclxuICAgICAgICAgICAgLy8gTGVmdC8gUmlnaHQgS2V5IC0tIFBsYXllciB0dXJuc1xyXG4gICAgICAgICAgICBpZiAobGVmdFByZXNzZWQgfHwgcmlnaHRQcmVzc2VkKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgcm90YXRpb24gPSAwO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChsZWZ0UHJlc3NlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJvdGF0aW9uIC09IFBsYXllci5UVVJOX1NQRUVEO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChyaWdodFByZXNzZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICByb3RhdGlvbiArPSBQbGF5ZXIuVFVSTl9TUEVFRDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBwbGF5ZXIucm90YXRlKHJvdGF0aW9uKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gVXAgS2V5IC0tIFBsYXllciBnb2VzIGZvcndhcmRcclxuICAgICAgICAgICAgaWYgKHVwUHJlc3NlZCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIG1vdmVtZW50Rm9yY2UgPSBnZW9tLlZlYzIuZnJvbUFuZ2xlKHBsYXllci5nZXRSb3RhdGlvbigpKTtcclxuICAgICAgICAgICAgICAgIG1vdmVtZW50Rm9yY2UubXVsdGlwbHkoXHJcbiAgICAgICAgICAgICAgICAgICAgUGxheWVyLkJPT1NUX0FDQ0VMRVJBVElPTiAqIHBsYXllci5tYXNzXHJcbiAgICAgICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgICAgIHBsYXllci5hZGRGb3JjZShtb3ZlbWVudEZvcmNlKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gRG93biBLZXkgLS0gQXBwbHkgYnJha2VzIHRvIHBsYXllclxyXG4gICAgICAgICAgICBpZiAoZG93blByZXNzZWQpIHtcclxuICAgICAgICAgICAgICAgIHBsYXllci52ZWxvY2l0eS5tdWx0aXBseShQbGF5ZXIuQlJBS0VfUkFURSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChzaG9vdGluZykge1xyXG4gICAgICAgICAgICAgICAgcGxheWVyLnNob290KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIF9oYW5kbGVQbGF5ZXJEZWF0aCA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChkdCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5wbGF5ZXIuY3VzdG9tRGF0YS5raWxsZXIpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VuZFBsYXllckRlYXRoKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5jYW1lcmEuZm9sbG93KHRoaXMucGxheWVyLmN1c3RvbURhdGEua2lsbGVyKTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsYXllci5jdXN0b21EYXRhLmtpbGxlciA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgICAgIHRoaXMucGxheWVyLnNldFN0YXRlKFBsYXllci5TVEFURS5FWFBMT1NJT04pO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMucmVzcGF3blRpbWVSZW1haW5pbmcgPSB0aGlzLnJlc3Bhd25UaW1lO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLnJlc3Bhd25UaW1lUmVtYWluaW5nIC09IGR0O1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX2FwcGx5RnJpY3Rpb24gOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciBnYW1lT2JqZWN0cyA9IHRoaXMuZ2V0R2FtZU9iamVjdHMoKTtcclxuXHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZ2FtZU9iamVjdHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHZhciBvYmogPSBnYW1lT2JqZWN0c1tpXTtcclxuICAgICAgICAgICAgICAgIGlmICghb2JqLmN1c3RvbURhdGEuaWdub3JlRnJpY3Rpb24pIHtcclxuICAgICAgICAgICAgICAgICAgICBvYmouYWNjZWxlcmF0aW9uLm11bHRpcGx5KEdhbWVTY2VuZS5GUklDVElPTik7XHJcbiAgICAgICAgICAgICAgICAgICAgb2JqLnZlbG9jaXR5Lm11bHRpcGx5KEdhbWVTY2VuZS5GUklDVElPTik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIF9yZW1vdmVEZWFkR2FtZU9iamVjdHMgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciBnYW1lT2JqZWN0cyA9IHRoaXMuZ2V0R2FtZU9iamVjdHMoKTtcclxuXHJcbiAgICAgICAgICAgIC8vIEdvIHRocm91Z2ggYWxsIGdhbWUgb2JqZWN0cyBhbmQgcmVtb3ZlIGFueSB0aGF0IGhhdmUgYmVlblxyXG4gICAgICAgICAgICAvLyBmbGFnZ2VkIGZvciByZW1vdmFsXHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSBnYW1lT2JqZWN0cy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIG9iaiA9IGdhbWVPYmplY3RzW2ldO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChvYmouY3VzdG9tRGF0YS5yZW1vdmVkID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVHYW1lT2JqZWN0KG9iaik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gR2FtZVNjZW5lOyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIFNjZW5lID0gd2ZsLmRpc3BsYXkuU2NlbmU7XHJcbnZhciBvdmVybGF5cyA9IHJlcXVpcmUoJy4uL292ZXJsYXlzJyk7XHJcblxyXG52YXIgTG9hZGluZ1NjZW5lID0gZnVuY3Rpb24gKGNhbnZhcykge1xyXG4gICAgU2NlbmUuY2FsbCh0aGlzLCBjYW52YXMpO1xyXG4gICAgXHJcbiAgICB0aGlzLmxvYWRpbmdPdmVybGF5ID0gbmV3IG92ZXJsYXlzLkxvYWRpbmdPdmVybGF5KCk7XHJcbiAgICAkKGNhbnZhcykucGFyZW50KCkuYXBwZW5kKHRoaXMubG9hZGluZ092ZXJsYXkuZG9tT2JqZWN0KTtcclxufTtcclxuTG9hZGluZ1NjZW5lLnByb3RvdHlwZSA9IE9iamVjdC5mcmVlemUoT2JqZWN0LmNyZWF0ZShTY2VuZS5wcm90b3R5cGUsIHtcclxuICAgIGRlc3Ryb3kgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMubG9hZGluZ092ZXJsYXkuZG9tT2JqZWN0LnJlbW92ZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBMb2FkaW5nU2NlbmU7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgU2NlbmUgPSB3ZmwuZGlzcGxheS5TY2VuZTtcclxudmFyIG92ZXJsYXlzID0gcmVxdWlyZSgnLi4vb3ZlcmxheXMnKTtcclxudmFyIE5ldHdvcmsgPSByZXF1aXJlKCcuLi9uZXR3b3JrJyk7XHJcblxyXG52YXIgTG9iYnlTY2VuZSA9IGZ1bmN0aW9uIChjYW52YXMpIHtcclxuICAgIFNjZW5lLmNhbGwodGhpcywgY2FudmFzKTtcclxuXHJcbiAgICB0aGlzLmN1clJvb21JZCA9IHVuZGVmaW5lZDtcclxuXHJcbiAgICB0aGlzLmxvYmJ5T3ZlcmxheSA9IG5ldyBvdmVybGF5cy5Mb2JieU92ZXJsYXkoKTtcclxuICAgIHRoaXMuY3JlYXRlUm9vbU92ZXJsYXkgPSBuZXcgb3ZlcmxheXMuQ3JlYXRlUm9vbU92ZXJsYXkoKTtcclxuICAgICQoY2FudmFzKS5wYXJlbnQoKS5hcHBlbmQodGhpcy5sb2JieU92ZXJsYXkuZG9tT2JqZWN0KTtcclxuICAgICQoY2FudmFzKS5wYXJlbnQoKS5hcHBlbmQodGhpcy5jcmVhdGVSb29tT3ZlcmxheS5kb21PYmplY3QpO1xyXG5cclxuICAgIHRoaXMuY3JlYXRlUm9vbU92ZXJsYXkuZG9tT2JqZWN0LmhpZGUoKTtcclxuXHJcbiAgICB0aGlzLmxvYmJ5T3ZlcmxheS5sZWF2ZVJvb21CdG4uY2xpY2sodGhpcy5fb25MZWF2ZVJvb21CdXR0b25DbGljay5iaW5kKHRoaXMpKTtcclxuICAgIHRoaXMubG9iYnlPdmVybGF5LnJlYWR5QnRuLmNsaWNrKHRoaXMuX29uUmVhZHlCdXR0b25DbGljay5iaW5kKHRoaXMpKTtcclxuICAgIHRoaXMubG9iYnlPdmVybGF5LnN3aXRjaFRlYW1CdG4uY2xpY2sodGhpcy5fb25Td2l0Y2hUZWFtQnV0dG9uQ2xpY2suYmluZCh0aGlzKSk7XHJcbiAgICB0aGlzLmxvYmJ5T3ZlcmxheS5jcmVhdGVSb29tQnRuLmNsaWNrKHRoaXMuX29uQ3JlYXRlUm9vbUJ1dHRvbkNsaWNrLmJpbmQodGhpcykpO1xyXG5cclxuICAgIHRoaXMuY3JlYXRlUm9vbU92ZXJsYXkuY2FuY2VsQnRuLmNsaWNrKHRoaXMuX29uQ3JlYXRlUm9vbUNhbmNlbC5iaW5kKHRoaXMpKTtcclxuICAgIHRoaXMuY3JlYXRlUm9vbU92ZXJsYXkuY3JlYXRlQnRuLmNsaWNrKHRoaXMuX29uQ3JlYXRlUm9vbS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAkKHRoaXMubG9iYnlPdmVybGF5KS5vbihvdmVybGF5cy5Mb2JieU92ZXJsYXkuRXZlbnQuRU5URVJfUk9PTSwgdGhpcy5fb25FbnRlclJvb21BdHRlbXB0LmJpbmQodGhpcykpO1xyXG5cclxuICAgICQoTmV0d29yaykub24oTmV0d29yay5FdmVudC5VUERBVEVfUk9PTVMsIHRoaXMuX29uVXBkYXRlUm9vbUxpc3QuYmluZCh0aGlzKSk7XHJcbiAgICAkKE5ldHdvcmspLm9uKE5ldHdvcmsuRXZlbnQuRU5URVJfUk9PTV9TVUNDRVNTLCB0aGlzLl9vbkVudGVyUm9vbVN1Y2Nlc3MuYmluZCh0aGlzKSk7XHJcbiAgICAkKE5ldHdvcmspLm9uKE5ldHdvcmsuRXZlbnQuRU5URVJfUk9PTV9GQUlMLCB0aGlzLl9vbkVudGVyUm9vbUZhaWwuYmluZCh0aGlzKSk7XHJcblxyXG4gICAgdGhpcy5yb29tVXBkYXRlSW50ZXJ2YWwgPVxyXG4gICAgICAgIHNldEludGVydmFsKHRoaXMudXBkYXRlUm9vbUxpc3QuYmluZCh0aGlzKSwgTG9iYnlTY2VuZS5ST09NX1VQREFURV9GUkVRVUVOQ1kpO1xyXG5cclxuICAgIHRoaXMudXBkYXRlUm9vbUxpc3QoKTtcclxufTtcclxuXHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKExvYmJ5U2NlbmUsIHtcclxuICAgIFJPT01fVVBEQVRFX0ZSRVFVRU5DWSA6IHtcclxuICAgICAgICB2YWx1ZSA6IDUwMDBcclxuICAgIH0sXHJcblxyXG4gICAgRXZlbnQgOiB7XHJcbiAgICAgICAgdmFsdWUgOiB7XHJcbiAgICAgICAgICAgIFRPR0dMRV9SRUFEWSA6IFwidG9nZ2xlUmVhZHlcIlxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSk7XHJcblxyXG5Mb2JieVNjZW5lLnByb3RvdHlwZSA9IE9iamVjdC5mcmVlemUoT2JqZWN0LmNyZWF0ZShTY2VuZS5wcm90b3R5cGUsIHtcclxuICAgIGRlc3Ryb3kgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMubG9iYnlPdmVybGF5LmRvbU9iamVjdC5yZW1vdmUoKTtcclxuICAgICAgICAgICAgdGhpcy5jcmVhdGVSb29tT3ZlcmxheS5kb21PYmplY3QucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlUm9vbU92ZXJsYXkuaW5wdXRGaWVsZC5vZmYoXCJrZXlwcmVzc1wiKTtcclxuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGlzLnJvb21VcGRhdGVJbnRlcnZhbCk7XHJcbiAgICAgICAgICAgICQoTmV0d29yaykub2ZmKE5ldHdvcmsuRXZlbnQuVVBEQVRFX1JPT01TKTtcclxuICAgICAgICAgICAgJChOZXR3b3JrKS5vZmYoTmV0d29yay5FdmVudC5FTlRFUl9ST09NX1NVQ0NFU1MpO1xyXG4gICAgICAgICAgICAkKE5ldHdvcmspLm9mZihOZXR3b3JrLkV2ZW50LkVOVEVSX1JPT01fRkFJTCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICB1cGRhdGVSb29tTGlzdCA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgTmV0d29yay5nZXRSb29tcygpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX29uTGVhdmVSb29tQnV0dG9uQ2xpY2sgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICBOZXR3b3JrLmxlYXZlUm9vbSh0aGlzLmN1clJvb21JZCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3VyUm9vbUlkID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX29uUmVhZHlCdXR0b25DbGljayA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIHZhciBjbGllbnRXaWxsQmVSZWFkeSA9ICFOZXR3b3JrLmxvY2FsQ2xpZW50LmRhdGEucmVhZHk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmxvYmJ5T3ZlcmxheS5zd2l0Y2hUZWFtQnRuLnByb3AoXCJkaXNhYmxlZFwiLCBjbGllbnRXaWxsQmVSZWFkeSk7XHJcblxyXG4gICAgICAgICAgICBOZXR3b3JrLnNvY2tldC5lbWl0KCd1cGRhdGVSZWFkeScsIHtcclxuICAgICAgICAgICAgICAgIHJlYWR5IDogY2xpZW50V2lsbEJlUmVhZHlcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBfb25DcmVhdGVSb29tQnV0dG9uQ2xpY2sgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZVJvb21PdmVybGF5LmlucHV0RmllbGQub2ZmKFwia2V5cHJlc3NcIik7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZVJvb21PdmVybGF5LmlucHV0RmllbGQudmFsKFwiXCIpO1xyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZVJvb21PdmVybGF5LmRvbU9iamVjdC5yZW1vdmVDbGFzcyhcImZhZGUtaW5cIik7XHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlUm9vbU92ZXJsYXkuZG9tT2JqZWN0LnNob3coKTtcclxuICAgICAgICAgICAgdGhpcy5jcmVhdGVSb29tT3ZlcmxheS5kb21PYmplY3QuYWRkQ2xhc3MoXCJmYWRlLWluXCIpO1xyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZVJvb21PdmVybGF5LmlucHV0RmllbGQuZm9jdXMoKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlUm9vbU92ZXJsYXkuaW5wdXRGaWVsZC5vbihcImtleXByZXNzXCIsIHRoaXMuX29uQ3JlYXRlUm9vbUtleVByZXNzLmJpbmQodGhpcykpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX29uQ3JlYXRlUm9vbUtleVByZXNzIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgaWYgKGUua2V5Q29kZSA9PT0gMTMpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX29uQ3JlYXRlUm9vbSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBfb25DcmVhdGVSb29tQ2FuY2VsIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgdGhpcy5jcmVhdGVSb29tT3ZlcmxheS5kb21PYmplY3QuaGlkZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX29uQ3JlYXRlUm9vbSA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIHZhciBuYW1lID0gdGhpcy5jcmVhdGVSb29tT3ZlcmxheS5pbnB1dEZpZWxkLnZhbCgpO1xyXG5cclxuICAgICAgICAgICAgaWYgKG5hbWUgIT09IFwiXCIpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlUm9vbU92ZXJsYXkuZG9tT2JqZWN0LmhpZGUoKTtcclxuICAgICAgICAgICAgICAgIE5ldHdvcmsuY3JlYXRlUm9vbShuYW1lKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX29uU3dpdGNoVGVhbUJ1dHRvbkNsaWNrIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgTmV0d29yay5zd2l0Y2hUZWFtKHRoaXMuY3VyUm9vbUlkKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIF9vblVwZGF0ZVJvb21MaXN0IDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGUsIGRhdGEpIHtcclxuICAgICAgICAgICAgdGhpcy5sb2JieU92ZXJsYXkuc2hvd1Jvb21zKGRhdGEpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMuY3VyUm9vbUlkICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubG9iYnlPdmVybGF5LnJlbmRlclJvb20oZGF0YVt0aGlzLmN1clJvb21JZF0pO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5sb2JieU92ZXJsYXkucmVuZGVyUm9vbSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBfb25FbnRlclJvb21BdHRlbXB0IDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGUsIGRhdGEpIHtcclxuICAgICAgICAgICAgTmV0d29yay5lbnRlclJvb20oZGF0YS5pZCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBfb25FbnRlclJvb21TdWNjZXNzIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGUsIGRhdGEpIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJSb29tSWQgPSBkYXRhLmlkO1xyXG4gICAgICAgICAgICB0aGlzLmxvYmJ5T3ZlcmxheS5yZW5kZXJSb29tKGRhdGEpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX29uRW50ZXJSb29tRmFpbCA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChlLCBkYXRhKSB7XHJcbiAgICAgICAgICAgIGFsZXJ0KGRhdGEubXNnKTtcclxuICAgICAgICAgICAgdGhpcy5jdXJSb29tSWQgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIHRoaXMubG9iYnlPdmVybGF5LnJlbmRlclJvb20odW5kZWZpbmVkKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKTtcclxuXHJcbk9iamVjdC5mcmVlemUoTG9iYnlTY2VuZSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IExvYmJ5U2NlbmU7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgTG9hZGluZ1NjZW5lID0gcmVxdWlyZSgnLi9Mb2FkaW5nU2NlbmUuanMnKTtcclxudmFyIExvYmJ5U2NlbmUgPSByZXF1aXJlKCcuL0xvYmJ5U2NlbmUuanMnKTtcclxudmFyIEdhbWVPdmVyU2NlbmUgPSByZXF1aXJlKCcuL0dhbWVPdmVyU2NlbmUuanMnKTtcclxudmFyIEdhbWVTY2VuZSA9IHJlcXVpcmUoJy4vR2FtZVNjZW5lLmpzJyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIExvYWRpbmdTY2VuZSAgOiBMb2FkaW5nU2NlbmUsXHJcbiAgICBMb2JieVNjZW5lICAgIDogTG9iYnlTY2VuZSxcclxuICAgIEdhbWVPdmVyU2NlbmUgOiBHYW1lT3ZlclNjZW5lLFxyXG4gICAgR2FtZVNjZW5lICAgICA6IEdhbWVTY2VuZVxyXG59OyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICBCR19USUxFICAgICAgIDogXCIuL2Fzc2V0cy9pbWcvQkctdGlsZTEucG5nXCIsXHJcbiAgICBCTE9DS19GVUxMICAgIDogXCIuL2Fzc2V0cy9pbWcvQmxvY2tGdWxsLnBuZ1wiLFxyXG4gICAgU0hJUF8xICAgICAgICA6IFwiLi9hc3NldHMvaW1nL090aGVyU2hpcC5wbmdcIixcclxuICAgIFNISVBfMiAgICAgICAgOiBcIi4vYXNzZXRzL2ltZy9TaGlwLnBuZ1wiLFxyXG4gICAgV0VBS19CVUxMRVRfMSA6IFwiLi9hc3NldHMvaW1nL0J1bGxldFdlYWtfYS5wbmdcIixcclxuICAgIFdFQUtfQlVMTEVUXzIgOiBcIi4vYXNzZXRzL2ltZy9CdWxsZXRXZWFrX2IucG5nXCIsXHJcbiAgICBXRUFLX0JVTExFVF8zIDogXCIuL2Fzc2V0cy9pbWcvQnVsbGV0V2Vha19jLnBuZ1wiLFxyXG4gICAgV0VBS19CVUxMRVRfNCA6IFwiLi9hc3NldHMvaW1nL0J1bGxldFdlYWtfZC5wbmdcIixcclxuICAgIEVYUExPU0lPTiAgICAgOiBcIi4vYXNzZXRzL2ltZy9FeHBsb3Npb24ucG5nXCIsXHJcbiAgICBIUF9GVUxMICAgICAgIDogXCIuL2Fzc2V0cy9pbWcvSGVhbHRoT3JiRnVsbC5wbmdcIixcclxuICAgIEhQX0VNUFRZICAgICAgOiBcIi4vYXNzZXRzL2ltZy9IZWFsdGhPcmJFbXB0eS5wbmdcIixcclxuXHJcbiAgICAvLyBQcmVsb2FkZXIgcmVwbGFjZXMgZ2V0dGVyIHdpdGggYXBwcm9wcmlhdGUgZGVmaW5pdGlvblxyXG4gICAgZ2V0ICAgICAgICA6IGZ1bmN0aW9uIChwYXRoKSB7IH1cclxufTsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBBc3NldHMgPSByZXF1aXJlKCcuL0Fzc2V0cy5qcycpO1xyXG5cclxudmFyIFByZWxvYWRlciA9IGZ1bmN0aW9uIChvbkNvbXBsZXRlKSB7XHJcbiAgICAvLyBTZXQgdXAgcHJlbG9hZGVyXHJcblx0dGhpcy5xdWV1ZSA9IG5ldyBjcmVhdGVqcy5Mb2FkUXVldWUoZmFsc2UpO1xyXG5cclxuICAgIC8vIFJlcGxhY2UgZGVmaW5pdGlvbiBvZiBBc3NldCBnZXR0ZXIgdG8gdXNlIHRoZSBkYXRhIGZyb20gdGhlIHF1ZXVlXHJcbiAgICBBc3NldHMuZ2V0ID0gdGhpcy5xdWV1ZS5nZXRSZXN1bHQuYmluZCh0aGlzLnF1ZXVlKTtcclxuXHJcbiAgICAvLyBPbmNlIGV2ZXJ5dGhpbmcgaGFzIGJlZW4gcHJlbG9hZGVkLCBzdGFydCB0aGUgYXBwbGljYXRpb25cclxuICAgIGlmIChvbkNvbXBsZXRlKSB7XHJcbiAgICAgICAgdGhpcy5xdWV1ZS5vbihcImNvbXBsZXRlXCIsIG9uQ29tcGxldGUpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBuZWVkVG9Mb2FkID0gW107XHJcblxyXG4gICAgLy8gUHJlcGFyZSB0byBsb2FkIGltYWdlc1xyXG4gICAgZm9yICh2YXIgaW1nIGluIEFzc2V0cykge1xyXG4gICAgICAgIHZhciBpbWdPYmogPSB7XHJcbiAgICAgICAgICAgIGlkIDogaW1nLFxyXG4gICAgICAgICAgICBzcmMgOiBBc3NldHNbaW1nXVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbmVlZFRvTG9hZC5wdXNoKGltZ09iaik7XHJcbiAgICB9XHJcblxyXG5cdHRoaXMucXVldWUubG9hZE1hbmlmZXN0KG5lZWRUb0xvYWQpO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQcmVsb2FkZXI7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgQXNzZXRzID0gcmVxdWlyZSgnLi9Bc3NldHMuanMnKTtcclxudmFyIFByZWxvYWRlciA9IHJlcXVpcmUoJy4vUHJlbG9hZGVyLmpzJyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIEFzc2V0cyAgICA6IEFzc2V0cyxcclxuICAgIFByZWxvYWRlciA6IFByZWxvYWRlclxyXG59OyJdfQ==
