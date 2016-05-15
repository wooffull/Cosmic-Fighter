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
},{"../util":30}],2:[function(require,module,exports){
"use strict";

var util = require('../util');
var Assets = util.Assets;
var Player = require('./Player.js');
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
    sendUpdateToServer : {
        value : function () { }
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
},{"../util":30,"./Player.js":5}],3:[function(require,module,exports){
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
},{"../util":30}],4:[function(require,module,exports){
"use strict";

var util = require('../util');
var Assets = util.Assets;
var GameObject = wfl.core.entities.GameObject;
var PhysicsObject = wfl.core.entities.PhysicsObject;
var geom = wfl.geom;

/**
 * A full-sized, quadrilateral block
 */
var HalfBlock = function () {
    PhysicsObject.call(this);

    this.id = HalfBlock.id;

    // Create default state
    this.defaultGraphic = Assets.get(Assets.BLOCK_HALF);

    var w = this.defaultGraphic.width;
    var h = this.defaultGraphic.height;
    var verts = [
        new geom.Vec2(-w * 0.5, -h * 0.5),
        new geom.Vec2(w * 0.5, -h * 0.5),
        new geom.Vec2(-w * 0.5, h * 0.5)
    ];
    var frameObj = this.createFrame(this.defaultGraphic, 1, false);
    frameObj.vertices = verts;

    this.defaultState = this.createState();
    this.defaultState.addFrame(frameObj);
    this.addState(GameObject.STATE.DEFAULT, this.defaultState);

    this.solid = true;
    this.fixed = true;
    this.rotate(-Math.PI * 0.5);
};
Object.defineProperties(HalfBlock, {
    name : {
        value : "HalfBlock"
    },

    id : {
        value : 0
    }
});
HalfBlock.prototype = Object.freeze(Object.create(PhysicsObject.prototype, {
    drawOnMinimap : {
        value : function (ctx) {
            var w = this.getWidth();
            var h = this.getHeight();
            var offsetX = Math.round(-w * 0.5);
            var offsetY = Math.round(-h * 0.5);

            ctx.save();
            ctx.rotate(this.getRotation());
            ctx.fillStyle = app.PhysicsObject.MINIMAP_FILL_STYLE;
            ctx.strokeStyle = app.PhysicsObject.MINIMAP_STROKE_STYLE;
            ctx.beginPath();
            ctx.moveTo(offsetX, offsetY);
            ctx.lineTo(-offsetX, offsetY);
            ctx.lineTo(offsetX, -offsetY);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.restore();
        }
    }
}));
Object.freeze(HalfBlock);

module.exports = HalfBlock;
},{"../util":30}],5:[function(require,module,exports){
"use strict";

var util = require('../util');
var Assets = util.Assets;
var Network = require('../network');
var GameObject = wfl.core.entities.GameObject;
var LivingObject = wfl.core.entities.LivingObject;
var particles = require('../particles');
var Emitter = particles.Emitter;
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

    if (team === 0) {
        this.explosionGraphic1 = Assets.get(Assets.EXPLOSION_A_1);
        this.explosionGraphic2 = Assets.get(Assets.EXPLOSION_A_2);
        this.explosionGraphic3 = Assets.get(Assets.EXPLOSION_A_3);
        this.explosionGraphic4 = Assets.get(Assets.EXPLOSION_END);
    } else {
        this.explosionGraphic1 = Assets.get(Assets.EXPLOSION_B_1);
        this.explosionGraphic2 = Assets.get(Assets.EXPLOSION_B_2);
        this.explosionGraphic3 = Assets.get(Assets.EXPLOSION_B_3);
        this.explosionGraphic4 = Assets.get(Assets.EXPLOSION_END);
    }

    this.explosionState = this.createState();

    this.explosionState.addFrame(this.createFrame(this.explosionGraphic1, 2));
    this.explosionState.addFrame(this.createFrame(this.explosionGraphic2, 2));
    this.explosionState.addFrame(this.createFrame(this.explosionGraphic3, 2));
    this.explosionState.addFrame(this.createFrame(this.explosionGraphic4, Infinity));
    this.addState(Player.STATE.EXPLOSION, this.explosionState);

    this.shootTimer = 0;
    this.maxShootTimer = Player.DEFAULT_MAX_SHOOT_TIMER;

    this.exhaust = new Emitter();
    this.exhaustTimer = 0;
    this.maxExhaustTimer = Player.DEFAULT_MAX_EXHAUST_TIMER;

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

    MIN_EXHAUST_ACCELERATION : {
        value : 0.0004
    },

    DEFAULT_MAX_EXHAUST_TIMER : {
        value : 10
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

            if (this.health > 0) {
                if (this.acceleration.getMagnitudeSquared() > Player.MIN_EXHAUST_ACCELERATION * Player.MIN_EXHAUST_ACCELERATION) {
                    // Add the next particle for the exhaust if we're able to
                    if (this.exhaustTimer === 0) {
                        var particlePosition = this.forward.clone().multiply(-this.defaultGraphic.height * 0.5);
                        this.exhaust.addParticle(particlePosition, this.velocity);
                    }
                }

                // Update exhaust timer for when to add the next particle
                this.exhaustTimer += dt;
                if (this.exhaustTimer >= this.maxExhaustTimer) {
                    this.exhaustTimer = 0;
                }
            }

            // Update exhaust particle system
            this.exhaust.update(dt);

            this.sendUpdateToServer();
        }
    },

    sendUpdateToServer : {
        value : function () {
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

    draw : {
        value : function (ctx) {
            LivingObject.prototype.draw.call(this, ctx);

            this.exhaust.draw(ctx);
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
},{"../network":12,"../particles":21,"../util":30}],6:[function(require,module,exports){
"use strict";

var FullBlock = require('./FullBlock.js');
var HalfBlock = require('./HalfBlock.js');
var Player = require('./Player.js');
var ClientPlayer = require('./ClientPlayer.js');
var Bullet = require('./Bullet.js');

module.exports = {
    FullBlock    : FullBlock,
    HalfBlock    : HalfBlock,
    Player       : Player,
    ClientPlayer : ClientPlayer,
    Bullet       : Bullet
};
},{"./Bullet.js":1,"./ClientPlayer.js":2,"./FullBlock.js":3,"./HalfBlock.js":4,"./Player.js":5}],7:[function(require,module,exports){
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

var goToGameStart = function (room) {
    // Stop the game so that canvas updates don't affect performance with
    // overlays
    game.stop();

    // Reset all listeners on the Network
    $(Network).off();

    var gameStartScene = new scenes.GameStartScene(canvas, room);
    game.setScene(gameStartScene);

    $(gameStartScene).on(
        scenes.GameStartScene.Event.START_GAME,
        onGameStartToGame
    );
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
    goToGameStart(room);
};

var onEndGame = function (e, room) {
    goToGameOver(room);
};

var onGameStartToGame = function (e, room) {
    goToGame(room);
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
},{"./network":12,"./overlays":18,"./scenes":27,"./util":30}],8:[function(require,module,exports){
"use strict";

var entities = require('../entities');
var FullBock = entities.FullBlock;
var HalfBlock = entities.HalfBlock;

var Level1 = function (scene) {
    var blockSize = 128;

    // Line the top
    for (var i = 0; i < 16; i++) {
        var newBlock = new FullBock();
        newBlock.position.x = blockSize * i;
        newBlock.position.y = 0;

        scene.addGameObject(newBlock);
    }

    // Line the bottom
    for (var i = 0; i < 16; i++) {
        var newBlock = new FullBock();
        newBlock.position.x = blockSize * i;
        newBlock.position.y = blockSize * 10;

        scene.addGameObject(newBlock);
    }

    // Line the left
    for (var i = 1; i < 10; i++) {
        var newBlock = new FullBock();
        newBlock.position.x = 0;
        newBlock.position.y = blockSize * i;

        scene.addGameObject(newBlock);
    }

    // Line the right
    for (var i = 1; i < 10; i++) {
        var newBlock = new FullBock();
        newBlock.position.x = blockSize * 15;
        newBlock.position.y = blockSize * i;

        scene.addGameObject(newBlock);
    }

    var obj;
    
    obj = new FullBock();
    obj.position.x = blockSize * 3;
    obj.position.y = blockSize * 3;
    scene.addGameObject(obj);
    
    obj = new FullBock();
    obj.position.x = blockSize * 4;
    obj.position.y = blockSize * 4;
    scene.addGameObject(obj);
    
    obj = new FullBock();
    obj.position.x = blockSize * 7;
    obj.position.y = blockSize * 4;
    scene.addGameObject(obj);
    
    obj = new FullBock();
    obj.position.x = blockSize * 8;
    obj.position.y = blockSize * 6;
    scene.addGameObject(obj);
    
    obj = new FullBock();
    obj.position.x = blockSize * 11;
    obj.position.y = blockSize * 6;
    scene.addGameObject(obj);
    
    obj = new FullBock();
    obj.position.x = blockSize * 12;
    obj.position.y = blockSize * 7;
    scene.addGameObject(obj);

    obj = new HalfBlock();
    obj.position.x = blockSize * 1;
    obj.position.y = blockSize * 6;
    scene.addGameObject(obj);

    obj = new HalfBlock();
    obj.position.x = blockSize * 4;
    obj.position.y = blockSize * 3;
    scene.addGameObject(obj);

    obj = new HalfBlock();
    obj.position.x = blockSize * 4;
    obj.position.y = blockSize * 9;
    scene.addGameObject(obj);

    obj = new HalfBlock();
    obj.position.x = blockSize * 8;
    obj.position.y = blockSize * 5;
    scene.addGameObject(obj);

    obj = new HalfBlock();
    obj.position.x = blockSize * 7;
    obj.position.y = blockSize * 5;
    obj.rotate(Math.PI);
    scene.addGameObject(obj);

    obj = new HalfBlock();
    obj.position.x = blockSize * 11;
    obj.position.y = blockSize * 1;
    obj.rotate(Math.PI);
    scene.addGameObject(obj);

    obj = new HalfBlock();
    obj.position.x = blockSize * 11;
    obj.position.y = blockSize * 7;
    obj.rotate(Math.PI);
    scene.addGameObject(obj);

    obj = new HalfBlock();
    obj.position.x = blockSize * 14;
    obj.position.y = blockSize * 4;
    obj.rotate(Math.PI);
    scene.addGameObject(obj);
};

Object.freeze(Level1);

module.exports = Level1;
},{"../entities":6}],9:[function(require,module,exports){
"use strict";

var Level1 = require("./Level1.js");

module.exports = {
    Level1 : Level1
};
},{"./Level1.js":8}],10:[function(require,module,exports){
"use strict";

var entities = require('../entities');

var Client = function (id, data) {
    this.id = id;
    this.data = data;
    this.gameObject = undefined;
};
Object.freeze(Client);

module.exports = Client;
},{"../entities":6}],11:[function(require,module,exports){
"use strict";

var entities = require('../entities');

var LocalClient = function (id, data) {
    this.id = id;
    this.data = data;
    this.gameObject = undefined;
};
Object.freeze(LocalClient);

module.exports = LocalClient;
},{"../entities":6}],12:[function(require,module,exports){
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
        GAME_START_DATA    : "gameStartData",
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
        this.socket.on('gameStartData', this._onGameStartData.bind(this));
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

    _onGameStartData : function (data) {
        $(this).trigger(
            this.Event.GAME_START_DATA,
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
},{"./Client.js":10,"./LocalClient.js":11}],13:[function(require,module,exports){
"use strict";

var Overlay = require('./Overlay.js');

var CreateRoomOverlay = function () {
    Overlay.call(this);

    this.inputField = $("<input>");
    this.inputField.attr({ "placeholder" : "Room Name" });
    this.inputField.attr({ "maxlength"   : 30 });
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
},{"./Overlay.js":17}],14:[function(require,module,exports){
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
                        label = "*" + label;
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
                        label = "*" + label;
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
},{"../network":12,"./Overlay.js":17}],15:[function(require,module,exports){
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
},{"./Overlay.js":17}],16:[function(require,module,exports){
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

    this.kdrContainer = $("<div>");
    this.kdrContainer.addClass("lobby-overlay-kdr-container");
    this.leftContainer.append(this.kdrContainer);

    this.renderKdr();

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
                            label = "*" + label;

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
                            label = "*" + label;

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

    renderKdr : {
        value : function (data) {
            if (!data) {
                this.kdrContainer.html("KDR: ---");
            } else {
                var kills = data.kills;
                var deaths = data.deaths;

                var ratio;

                if (deaths === 0) {
                    ratio = kills;
                } else {
                    ratio = Math.floor((kills / deaths) * 100) / 100;
                }

                this.kdrContainer.html("KDR: " + ratio.toFixed(2));
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
},{"../network":12,"./Overlay.js":17}],17:[function(require,module,exports){
"use strict";

var Overlay = function () {
    this.domObject = $("<div>");
    this.domObject.addClass("canvas-overlay");
};

Overlay.prototype = Object.freeze(Object.create(Overlay.prototype, {

}));

module.exports = Overlay;
},{}],18:[function(require,module,exports){
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
},{"./CreateRoomOverlay.js":13,"./GameOverOverlay.js":14,"./LoadingOverlay.js":15,"./LobbyOverlay.js":16,"./Overlay.js":17}],19:[function(require,module,exports){
"use strict";

var util = require('../util');
var Assets = util.Assets;
var GameObject = wfl.core.entities.GameObject;
var EmitterParticle = require('./EmitterParticle.js');
var geom = wfl.geom;

var Emitter = function () {
    GameObject.call(this);

    this.particles = [];
    this.angleRange = Emitter.DEFAULT_ANGLE_OFFSET_RANGE;
    this.maxParticles = Emitter.DEFAULT_MAX_PARTICLES;
};
Object.defineProperties(Emitter, {
    DEFAULT_ANGLE_OFFSET_RANGE : {
        value : 0.675
    },

    DEFAULT_MAX_PARTICLES : {
        value : 150
    }
});
Emitter.prototype = Object.freeze(Object.create(GameObject.prototype, {
    addParticle : {
        value : function (position, velocity) {
            // Too many particles, remove the first one
            if (this.particles.length > this.maxParticles) {
                this.particles.splice(0, 1);
            }

            var angleOffset = Math.random() * this.angleRange - this.angleRange * 0.5;
            var particle = new EmitterParticle();
            particle.position = position.clone();
            particle.velocity = velocity.clone().multiply(-1);
            particle.velocity.rotate(angleOffset);

            // Choose from 2 colors
            var colorIdSelected = Math.floor(Math.random() * 2);
            var r = 0;
            var g = 0;
            var b = 0;

            switch (colorIdSelected) {
            case 0:
                r = 223;
                g = 44;
                b = 56;
                break;

            case 1:
                r = 246;
                g = 110;
                b = 73;
                break;
            }

            particle.red = r;
            particle.green = g;
            particle.blue = b;

            this.particles.push(particle);
        }
    },

    update : {
        value : function (dt) {
            for (var i = this.particles.length - 1; i >= 0; i--) {
                var cur = this.particles[i];

                cur.update(dt);

                // Remove the particle when its time is up
                if (cur.age >= cur.lifeTime) {
                    this.particles.splice(i, 1);
                }
            }
        }
    },

    draw : {
        value : function (ctx) {
            for (var i = this.particles.length - 1; i >= 0; i--) {
                this.particles[i].draw(ctx);
            }
        }
    }
}));
Object.freeze(Emitter);

module.exports = Emitter;
},{"../util":30,"./EmitterParticle.js":20}],20:[function(require,module,exports){
"use strict";

var util = require('../util');
var Assets = util.Assets;
var PhysicsObject = wfl.core.entities.PhysicsObject;
var geom = wfl.geom;

var EmitterParticle = function () {
    PhysicsObject.call(this);

    this.age = 0;
    this.lifeTime = EmitterParticle.DEFAULT_LIFE_TIME;
    this.red = 0;
    this.green = 0;
    this.blue = 0;
    this.startSize = EmitterParticle.DEFAULT_START_SIZE;
    this.size = this.startSize;
    this.decayRate = EmitterParticle.DEFAULT_DECAY_RATE;
    this.expansionRate = EmitterParticle.DEFAULT_EXPANSION_RATE;
};
Object.defineProperties(EmitterParticle, {
    DEFAULT_LIFE_TIME : {
        value : 100
    },

    DEFAULT_START_SIZE : {
        value : 5.0
    },

    DEFAULT_DECAY_RATE : {
        value : 2.35
    },

    DEFAULT_EXPANSION_RATE : {
        value : 0.25
    },

    MAX_ALPHA : {
        value : 1
    }
});
EmitterParticle.prototype = Object.freeze(Object.create(PhysicsObject.prototype, {
    update : {
        value : function (dt) {
            if (this.age < this.lifeTime) {
                PhysicsObject.prototype.update.call(this, dt);

                this.age += this.decayRate;
                this.size += this.expansionRate;
            }
        }
    },

    draw : {
        value : function (ctx) {
            var alpha = EmitterParticle.MAX_ALPHA * (1 - this.age / this.lifeTime);

            ctx.save();

            ctx.translate(this.position.x, this.position.y);
            ctx.beginPath();
            ctx.globalAlpha *= alpha;
            ctx.fillStyle = "rgb(" + this.red + "," + this.green + "," + this.blue + ")";
            ctx.rect(-this.size * 0.5, -this.size * 0.5, this.size, this.size);
            ctx.fill();

            ctx.restore();
        }
    }
}));
Object.freeze(EmitterParticle);

module.exports = EmitterParticle;
},{"../util":30}],21:[function(require,module,exports){
"use strict";

var EmitterParticle = require('./EmitterParticle.js');
var Emitter = require('./Emitter.js');

module.exports = {
    Emitter         : Emitter,
    EmitterParticle : EmitterParticle
};
},{"./Emitter.js":19,"./EmitterParticle.js":20}],22:[function(require,module,exports){
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

            var localPlayerData;
            var teamA = data.teamA;
            var teamB = data.teamB;

            for (var i = 0; i < teamA.length; i++) {
                if (teamA[i].id === Network.localClient.id) {
                    localPlayerData = teamA[i];
                    break;
                }
            }

            for (var i = 0; i < teamB.length; i++) {
                if (teamB[i].id === Network.localClient.id) {
                    localPlayerData = teamB[i];
                    break;
                }
            }

            this._sendScoreToServer(localPlayerData);
        }
    },

    _onReturnToLobby : {
        value : function (e) {
            $(this).trigger(
                GameOverScene.Event.RETURN_TO_LOBBY,
                this.room
            );
        }
    },

    _sendScoreToServer : {
        value : function (playerData) {
            var kills = playerData.kills;
            var deaths = playerData.deaths;
            var form = $("#scoreForm");
            var formData = form.serialize();
            
            formData += "&kills=" + kills;
            formData += "&deaths=" + deaths;
            formData += "&username=" + playerData.user;

            $.ajax({
                cache: false,
                type: "POST",
                url: "/score",
                data: formData,
                dataType: "json"
            });
        }
    }
}));
Object.freeze(GameOverScene);

module.exports = GameOverScene;
},{"../network":12,"../overlays":18}],23:[function(require,module,exports){
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
var Player = entities.Player;
var levels = require('../levels');
var backgrounds = wfl.display.backgrounds;
var geom = wfl.geom;

var GameScene = function (canvas, room) {
    Scene.call(this, canvas, room);

    // Add other clients that are already connected
    var room = Network.rooms[room.id];
    this.players = room.players;

    for (var i = 0; i < this.players.length; i++) {
        var id = this.players[i];
        var client = Network.clients[id];

        if (client !== Network.localClient) {
            var gameObject = new ClientPlayer(client.data.team);
            client.gameObject = gameObject;
            client.gameObject.customData.clientId = client.data.id;
            client.gameObject.position.x = client.data.position.x;
            client.gameObject.position.y = client.data.position.y;
            client.gameObject.setRotation(client.data.rotation);
            client.gameObject.customData.spawnPosition = client.data.position;
            client.gameObject.customData.spawnRotation = client.data.rotation;
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

    // TODO: Design levels better
    levels.Level1(this);

    this.timeRemaining = room.timeRemaining;
    this.initialCountdown = room.countdown;
    this.countingDown = true;
    this.respawnTime = room.respawnTime;
    this.respawnTimeRemaining = this.respawnTime;

    this.bg = new backgrounds.ParallaxBackground(
        Assets.get(Assets.BG_TILE)
    );

    this.player = new Player(Network.localClient.data.team);
    this.player.position.x = Network.localClient.data.position.x;
    this.player.position.y = Network.localClient.data.position.y;
    this.player.setRotation(Network.localClient.data.rotation);
    this.player.customData.spawnPosition = Network.localClient.data.position;
    this.player.customData.spawnRotation = Network.localClient.data.rotation;

    Network.localClient.gameObject = this.player;
    this.player.customData.clientId = Network.localClient.data.id;
    this.addGameObject(this.player, 2);

    this.camera.follow(this.player);
    this.camera.position.x = this.player.position.x;
    this.camera.position.y = this.player.position.y;
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

            var cameraPos    = this.camera.position;
            var screenWidth  = ctx.canvas.width;
            var screenHeight = ctx.canvas.height;
            var offset       = new geom.Vec2(
                screenWidth  * 0.5,
                screenHeight * 0.5
            );

            ctx.fillStyle = "#fff";
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            ctx.font = "12px Munro";

            // Write players' names under their ship
            for (var i = 0; i < this.players.length; i++) {
                var client = Network.clients[this.players[i]];
                var objOffset = new geom.Vec2(
                    client.gameObject.position.x - cameraPos.x,
                    client.gameObject.position.y - cameraPos.y
                );
                
                ctx.save();
                ctx.translate(objOffset.x, objOffset.y + 24);
                ctx.translate(offset.x, offset.y);
                ctx.fillText(client.data.user, 0, 0);
                ctx.restore();
            }
            
            ctx.font = "24px Munro";

            // Show the remaining duration of the game
            var timeText;
            if (this.timeRemaining > 0) {
                var minutes = Math.floor((this.timeRemaining) / (1000 * 60));
                var seconds = Math.floor((this.timeRemaining - minutes * 1000 * 60) / 1000);
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

                // Also draw controls!
                ctx.fillStyle = "#fff";
                ctx.translate(0, 48);
                ctx.font = "24px Munro";
                ctx.fillText("Use Arrow Keys to Move", 0, 0);

                ctx.translate(0, 24);
                ctx.fillText("Press Z to Shoot", 0, 0);
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
            this.timeRemaining = parseInt(data.timeRemaining);
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
            player.position.x = player.customData.spawnPosition.x;
            player.position.y = player.customData.spawnPosition.y;
            player.setRotation(player.customData.spawnRotation);
            player.setState(GameObject.STATE.DEFAULT);
            player.health = player.maxHealth;
            player.solid = true;

            // Activate "spawn shield"
            player.takeDamage(0);

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
},{"../entities":6,"../levels":9,"../network":12,"../util":30}],24:[function(require,module,exports){
"use strict";

var Scene = wfl.display.Scene;
var overlays = require('../overlays');
var Network = require('../network');

var GameStartScene = function (canvas, room) {
    Scene.call(this, canvas);

    this.room = room;

    $(Network).on(Network.Event.GAME_START_DATA, this._onGetStartData.bind(this));

    if (Network.isHost()) {
        Network.socket.emit(Network.Event.GAME_START_DATA, room.id);
    }

    this.loadingOverlay = new overlays.LoadingOverlay();
    $(canvas).parent().append(this.loadingOverlay.domObject);
};
Object.defineProperties(GameStartScene, {
    Event : {
        value : {
            START_GAME : "startGame"
        }
    }
});
GameStartScene.prototype = Object.freeze(Object.create(Scene.prototype, {
    destroy : {
        value : function () {
            this.loadingOverlay.domObject.remove();
        }
    },

    _onGetStartData : {
        value : function (e, data) {
            var teamA = data.teamA;
            var teamB = data.teamB;

            for (var i = 0; i < teamA.length; i++) {
                var ref = teamA[i];
                Network.clients[ref.id].data = ref;
            }

            for (var i = 0; i < teamB.length; i++) {
                var ref = teamB[i];
                Network.clients[ref.id].data = ref;
            }

            $(this).trigger(
                GameStartScene.Event.START_GAME,
                this.room
            );
        }
    }
}));
Object.freeze(GameStartScene);

module.exports = GameStartScene;
},{"../network":12,"../overlays":18}],25:[function(require,module,exports){
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
},{"../overlays":18}],26:[function(require,module,exports){
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

    this._requestKdr();
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

    _requestKdr : {
        value : function () {
            $.ajax({
                cache: false,
                type: "GET",
                url: "/getScore",
                dataType: "json",
                success: this._onGetKdr.bind(this)
            });
        }
    },

    _onGetKdr : {
        value : function (result, status, xhr) {
            this.lobbyOverlay.renderKdr(result);
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
            var name = this.createRoomOverlay.inputField.val().trim();

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
},{"../network":12,"../overlays":18}],27:[function(require,module,exports){
"use strict";

var LoadingScene = require('./LoadingScene.js');
var LobbyScene = require('./LobbyScene.js');
var GameStartScene = require('./GameStartScene.js');
var GameOverScene = require('./GameOverScene.js');
var GameScene = require('./GameScene.js');

module.exports = {
    LoadingScene   : LoadingScene,
    LobbyScene     : LobbyScene,
    GameStartScene : GameStartScene,
    GameOverScene  : GameOverScene,
    GameScene      : GameScene
};
},{"./GameOverScene.js":22,"./GameScene.js":23,"./GameStartScene.js":24,"./LoadingScene.js":25,"./LobbyScene.js":26}],28:[function(require,module,exports){
"use strict";

module.exports = {
    BG_TILE       : "./assets/img/BG-tile1.png",
    BLOCK_FULL    : "./assets/img/BlockFull.png",
    BLOCK_HALF    : "./assets/img/BlockHalf.png",
    SHIP_1        : "./assets/img/OtherShip.png",
    SHIP_2        : "./assets/img/Ship.png",
    WEAK_BULLET_1 : "./assets/img/BulletWeak_a.png",
    WEAK_BULLET_2 : "./assets/img/BulletWeak_b.png",
    WEAK_BULLET_3 : "./assets/img/BulletWeak_c.png",
    WEAK_BULLET_4 : "./assets/img/BulletWeak_d.png",
    EXPLOSION_A_1 : "./assets/img/OtherExplosion1.png",
    EXPLOSION_A_2 : "./assets/img/OtherExplosion2.png",
    EXPLOSION_A_3 : "./assets/img/OtherExplosion3.png",
    EXPLOSION_B_1 : "./assets/img/Explosion1.png",
    EXPLOSION_B_2 : "./assets/img/Explosion2.png",
    EXPLOSION_B_3 : "./assets/img/Explosion3.png",
    EXPLOSION_END : "./assets/img/ExplosionEnd.png",
    HP_FULL       : "./assets/img/HealthOrbFull.png",
    HP_EMPTY      : "./assets/img/HealthOrbEmpty.png",

    // Preloader replaces getter with appropriate definition
    get        : function (path) { }
};
},{}],29:[function(require,module,exports){
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
},{"./Assets.js":28}],30:[function(require,module,exports){
"use strict";

var Assets = require('./Assets.js');
var Preloader = require('./Preloader.js');

module.exports = {
    Assets    : Assets,
    Preloader : Preloader
};
},{"./Assets.js":28,"./Preloader.js":29}]},{},[7])(7)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvZ2FtZS9zcmMvZW50aXRpZXMvQnVsbGV0LmpzIiwiY2xpZW50L2dhbWUvc3JjL2VudGl0aWVzL0NsaWVudFBsYXllci5qcyIsImNsaWVudC9nYW1lL3NyYy9lbnRpdGllcy9GdWxsQmxvY2suanMiLCJjbGllbnQvZ2FtZS9zcmMvZW50aXRpZXMvSGFsZkJsb2NrLmpzIiwiY2xpZW50L2dhbWUvc3JjL2VudGl0aWVzL1BsYXllci5qcyIsImNsaWVudC9nYW1lL3NyYy9lbnRpdGllcy9pbmRleC5qcyIsImNsaWVudC9nYW1lL3NyYy9pbmRleC5qcyIsImNsaWVudC9nYW1lL3NyYy9sZXZlbHMvTGV2ZWwxLmpzIiwiY2xpZW50L2dhbWUvc3JjL2xldmVscy9pbmRleC5qcyIsImNsaWVudC9nYW1lL3NyYy9uZXR3b3JrL0NsaWVudC5qcyIsImNsaWVudC9nYW1lL3NyYy9uZXR3b3JrL0xvY2FsQ2xpZW50LmpzIiwiY2xpZW50L2dhbWUvc3JjL25ldHdvcmsvaW5kZXguanMiLCJjbGllbnQvZ2FtZS9zcmMvb3ZlcmxheXMvQ3JlYXRlUm9vbU92ZXJsYXkuanMiLCJjbGllbnQvZ2FtZS9zcmMvb3ZlcmxheXMvR2FtZU92ZXJPdmVybGF5LmpzIiwiY2xpZW50L2dhbWUvc3JjL292ZXJsYXlzL0xvYWRpbmdPdmVybGF5LmpzIiwiY2xpZW50L2dhbWUvc3JjL292ZXJsYXlzL0xvYmJ5T3ZlcmxheS5qcyIsImNsaWVudC9nYW1lL3NyYy9vdmVybGF5cy9PdmVybGF5LmpzIiwiY2xpZW50L2dhbWUvc3JjL292ZXJsYXlzL2luZGV4LmpzIiwiY2xpZW50L2dhbWUvc3JjL3BhcnRpY2xlcy9FbWl0dGVyLmpzIiwiY2xpZW50L2dhbWUvc3JjL3BhcnRpY2xlcy9FbWl0dGVyUGFydGljbGUuanMiLCJjbGllbnQvZ2FtZS9zcmMvcGFydGljbGVzL2luZGV4LmpzIiwiY2xpZW50L2dhbWUvc3JjL3NjZW5lcy9HYW1lT3ZlclNjZW5lLmpzIiwiY2xpZW50L2dhbWUvc3JjL3NjZW5lcy9HYW1lU2NlbmUuanMiLCJjbGllbnQvZ2FtZS9zcmMvc2NlbmVzL0dhbWVTdGFydFNjZW5lLmpzIiwiY2xpZW50L2dhbWUvc3JjL3NjZW5lcy9Mb2FkaW5nU2NlbmUuanMiLCJjbGllbnQvZ2FtZS9zcmMvc2NlbmVzL0xvYmJ5U2NlbmUuanMiLCJjbGllbnQvZ2FtZS9zcmMvc2NlbmVzL2luZGV4LmpzIiwiY2xpZW50L2dhbWUvc3JjL3V0aWwvQXNzZXRzLmpzIiwiY2xpZW50L2dhbWUvc3JjL3V0aWwvUHJlbG9hZGVyLmpzIiwiY2xpZW50L2dhbWUvc3JjL3V0aWwvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcE9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9lQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcclxudmFyIEFzc2V0cyA9IHV0aWwuQXNzZXRzO1xyXG52YXIgR2FtZU9iamVjdCA9IHdmbC5jb3JlLmVudGl0aWVzLkdhbWVPYmplY3Q7XHJcbnZhciBQaHlzaWNzT2JqZWN0ID0gd2ZsLmNvcmUuZW50aXRpZXMuUGh5c2ljc09iamVjdDtcclxudmFyIGdlb20gPSB3ZmwuZ2VvbTtcclxuXHJcbi8qKlxyXG4gKiBQcm9qZWN0aWxlcyBjcmVhdGVkIGZyb20gYSBTaGlwXHJcbiAqL1xyXG52YXIgQnVsbGV0ID0gZnVuY3Rpb24gKGRhbWFnZSwgY3JlYXRvcikge1xyXG4gICAgaWYgKGlzTmFOKGRhbWFnZSkgfHwgZGFtYWdlIDw9IDApIHtcclxuICAgICAgICBkYW1hZ2UgPSAxO1xyXG4gICAgfVxyXG5cclxuICAgIFBoeXNpY3NPYmplY3QuY2FsbCh0aGlzKTtcclxuXHJcbiAgICB0aGlzLmNyZWF0b3IgPSBjcmVhdG9yO1xyXG4gICAgdGhpcy5jdXN0b21EYXRhLnRlYW0gPSBjcmVhdG9yLmN1c3RvbURhdGEudGVhbTtcclxuICAgIHRoaXMuY3VzdG9tRGF0YS5pZ25vcmVGcmljdGlvbiA9IHRydWU7XHJcblxyXG4gICAgLy8gQ3JlYXRlIGRlZmF1bHQgc3RhdGVcclxuICAgIHRoaXMuZ3JhcGhpYzEgPSBBc3NldHMuZ2V0KEFzc2V0cy5XRUFLX0JVTExFVF8xKTtcclxuICAgIHRoaXMuZ3JhcGhpYzIgPSBBc3NldHMuZ2V0KEFzc2V0cy5XRUFLX0JVTExFVF8yKTtcclxuICAgIHRoaXMuZ3JhcGhpYzMgPSBBc3NldHMuZ2V0KEFzc2V0cy5XRUFLX0JVTExFVF8zKTtcclxuICAgIHRoaXMuZ3JhcGhpYzQgPSBBc3NldHMuZ2V0KEFzc2V0cy5XRUFLX0JVTExFVF80KTtcclxuICAgIHRoaXMuZGVmYXVsdFN0YXRlID0gdGhpcy5jcmVhdGVTdGF0ZSgpO1xyXG4gICAgdGhpcy5kZWZhdWx0U3RhdGUuYWRkRnJhbWUoXHJcbiAgICAgICAgdGhpcy5jcmVhdGVGcmFtZSh0aGlzLmdyYXBoaWMxLCAyKVxyXG4gICAgKTtcclxuICAgIHRoaXMuZGVmYXVsdFN0YXRlLmFkZEZyYW1lKFxyXG4gICAgICAgIHRoaXMuY3JlYXRlRnJhbWUodGhpcy5ncmFwaGljMiwgMilcclxuICAgICk7XHJcbiAgICB0aGlzLmRlZmF1bHRTdGF0ZS5hZGRGcmFtZShcclxuICAgICAgICB0aGlzLmNyZWF0ZUZyYW1lKHRoaXMuZ3JhcGhpYzMsIDIpXHJcbiAgICApO1xyXG4gICAgdGhpcy5kZWZhdWx0U3RhdGUuYWRkRnJhbWUoXHJcbiAgICAgICAgdGhpcy5jcmVhdGVGcmFtZSh0aGlzLmdyYXBoaWM0LCAyKVxyXG4gICAgKTtcclxuICAgIHRoaXMuYWRkU3RhdGUoR2FtZU9iamVjdC5TVEFURS5ERUZBVUxULCB0aGlzLmRlZmF1bHRTdGF0ZSk7XHJcblxyXG4gICAgdGhpcy5kYW1hZ2UgPSBkYW1hZ2U7XHJcbiAgICB0aGlzLmFnZSA9IDA7XHJcbiAgICB0aGlzLmxpZmVUaW1lID0gQnVsbGV0LkRFRkFVTFRfTUFYX0xJRkVfVElNRTtcclxuICAgIHRoaXMubWF4U3BlZWQgPSBCdWxsZXQuREVGQVVMVF9NQVhfU1BFRUQ7XHJcbiAgICB0aGlzLnNvbGlkID0gdHJ1ZTtcclxufTtcclxuT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoQnVsbGV0LCB7XHJcbiAgICBERUZBVUxUX01BWF9MSUZFX1RJTUUgOiB7XHJcbiAgICAgICAgdmFsdWUgOiA0MFxyXG4gICAgfSxcclxuXHJcbiAgICBERUZBVUxUX1NQRUVEIDoge1xyXG4gICAgICAgIHZhbHVlIDogMC42NVxyXG4gICAgfSxcclxuXHJcbiAgICBERUZBVUxUX01BWF9TUEVFRCA6IHtcclxuICAgICAgICB2YWx1ZSA6IDAuOFxyXG4gICAgfVxyXG59KTtcclxuQnVsbGV0LnByb3RvdHlwZSA9IE9iamVjdC5mcmVlemUoT2JqZWN0LmNyZWF0ZShQaHlzaWNzT2JqZWN0LnByb3RvdHlwZSwge1xyXG4gICAgdXBkYXRlIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGR0KSB7XHJcbiAgICAgICAgICAgIFBoeXNpY3NPYmplY3QucHJvdG90eXBlLnVwZGF0ZS5jYWxsKHRoaXMsIGR0KTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuYWdlKys7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5hZ2UgPj0gdGhpcy5saWZlVGltZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXN0b21EYXRhLnJlbW92ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICByZXNvbHZlQ29sbGlzaW9uIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKHBoeXNPYmosIGNvbGxpc2lvbkRhdGEpIHtcclxuICAgICAgICAgICAgdmFyIHRlYW0gPSB0aGlzLmN1c3RvbURhdGEudGVhbTtcclxuICAgICAgICAgICAgdmFyIG90aGVyVGVhbSA9IHBoeXNPYmouY3VzdG9tRGF0YS50ZWFtO1xyXG5cclxuICAgICAgICAgICAgaWYgKHBoeXNPYmogIT09IHRoaXMuY3JlYXRvciAmJiBwaHlzT2JqLnNvbGlkKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1c3RvbURhdGEucmVtb3ZlZCA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gSWYgaGl0dGluZyBzb21ldGhpbmcgdGhhdCdzIG9uIGEgdGVhbSAocGxheWVyLCBidWxsZXQsXHJcbiAgICAgICAgICAgICAgICAvLyBldGMpLi4uXHJcbiAgICAgICAgICAgICAgICBpZiAob3RoZXJUZWFtICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBJZiB0aGUgYnVsbGV0IGhpdHMgYSBwbGF5ZXIgb24gYSBkaWZmZXJlbnQgdGVhbSwgZGVhbFxyXG4gICAgICAgICAgICAgICAgICAgIC8vIGRhbWFnZSB0byB0aGVtXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG90aGVyVGVhbSAhPT0gdGVhbSAmJiBwaHlzT2JqLnRha2VEYW1hZ2UpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGh5c09iai50YWtlRGFtYWdlKHRoaXMuZGFtYWdlKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIElmIGtpbGxlZCB0aGUgcGxheWVyLCB3ZSdsbCBtYWtlIHRoZSBjYW0gZm9sbG93IHRoaXNcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gYnVsbGV0J3MgY3JlYXRvclxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocGh5c09iai5oZWFsdGggPD0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGh5c09iai5jdXN0b21EYXRhLmtpbGxlciA9IHRoaXMuY3JlYXRvcjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkpO1xyXG5PYmplY3QuZnJlZXplKEJ1bGxldCk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEJ1bGxldDsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xyXG52YXIgQXNzZXRzID0gdXRpbC5Bc3NldHM7XHJcbnZhciBQbGF5ZXIgPSByZXF1aXJlKCcuL1BsYXllci5qcycpO1xyXG52YXIgTGl2aW5nT2JqZWN0ID0gd2ZsLmNvcmUuZW50aXRpZXMuTGl2aW5nT2JqZWN0O1xyXG52YXIgZ2VvbSA9IHdmbC5nZW9tO1xyXG5cclxudmFyIENsaWVudFBsYXllciA9IGZ1bmN0aW9uICh0ZWFtKSB7XHJcbiAgICBQbGF5ZXIuY2FsbCh0aGlzLCB0ZWFtKTtcclxufTtcclxuT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoQ2xpZW50UGxheWVyLCB7XHJcbiAgICBNSU5JTUFQX0ZJTExfU1RZTEUgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBcIiMwNmM4MzNcIlxyXG4gICAgfVxyXG59KTtcclxuQ2xpZW50UGxheWVyLnByb3RvdHlwZSA9IE9iamVjdC5mcmVlemUoT2JqZWN0LmNyZWF0ZShQbGF5ZXIucHJvdG90eXBlLCB7XHJcbiAgICBzZW5kVXBkYXRlVG9TZXJ2ZXIgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoKSB7IH1cclxuICAgIH0sXHJcblxyXG4gICAgZHJhd09uTWluaW1hcCA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChjdHgpIHtcclxuICAgICAgICAgICAgdmFyIHcgPSB0aGlzLmdldFdpZHRoKCk7XHJcbiAgICAgICAgICAgIHZhciBoID0gdGhpcy5nZXRIZWlnaHQoKTtcclxuICAgICAgICAgICAgdmFyIG9mZnNldFggPSBNYXRoLnJvdW5kKC13ICogMC41KTtcclxuICAgICAgICAgICAgdmFyIG9mZnNldFkgPSBNYXRoLnJvdW5kKC1oICogMC41KTtcclxuICAgICAgICAgICAgdmFyIGRpc3BsYXlXaWR0aCA9IE1hdGgucm91bmQodyk7XHJcbiAgICAgICAgICAgIHZhciBkaXNwbGF5SGVpZ2h0ID0gTWF0aC5yb3VuZChoKTtcclxuXHJcbiAgICAgICAgICAgIGN0eC5zYXZlKCk7XHJcblxyXG4gICAgICAgICAgICBjdHguZmlsbFN0eWxlID0gQ2xpZW50UGxheWVyLk1JTklNQVBfRklMTF9TVFlMRTtcclxuICAgICAgICAgICAgY3R4LmZpbGxSZWN0KG9mZnNldFgsIG9mZnNldFksIGRpc3BsYXlXaWR0aCwgZGlzcGxheUhlaWdodCk7XHJcblxyXG4gICAgICAgICAgICBjdHgucmVzdG9yZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgc2hvb3QgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoKSB7IH1cclxuICAgIH0sXHJcblxyXG4gICAganVzdFNob3QgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoKSB7IH1cclxuICAgIH1cclxufSkpO1xyXG5PYmplY3QuZnJlZXplKENsaWVudFBsYXllcik7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENsaWVudFBsYXllcjsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xyXG52YXIgQXNzZXRzID0gdXRpbC5Bc3NldHM7XHJcbnZhciBHYW1lT2JqZWN0ID0gd2ZsLmNvcmUuZW50aXRpZXMuR2FtZU9iamVjdDtcclxudmFyIFBoeXNpY3NPYmplY3QgPSB3ZmwuY29yZS5lbnRpdGllcy5QaHlzaWNzT2JqZWN0O1xyXG5cclxuLyoqXHJcbiAqIEEgZnVsbC1zaXplZCwgcXVhZHJpbGF0ZXJhbCBibG9ja1xyXG4gKi9cclxudmFyIEZ1bGxCbG9jayA9IGZ1bmN0aW9uICgpIHtcclxuICAgIFBoeXNpY3NPYmplY3QuY2FsbCh0aGlzKTtcclxuXHJcbiAgICB0aGlzLmlkID0gRnVsbEJsb2NrLmlkO1xyXG5cclxuICAgIC8vIENyZWF0ZSBkZWZhdWx0IHN0YXRlXHJcbiAgICB0aGlzLmRlZmF1bHRHcmFwaGljID0gQXNzZXRzLmdldChBc3NldHMuQkxPQ0tfRlVMTCk7XHJcbiAgICB0aGlzLmRlZmF1bHRTdGF0ZSA9IHRoaXMuY3JlYXRlU3RhdGUoKTtcclxuICAgIHRoaXMuZGVmYXVsdFN0YXRlLmFkZEZyYW1lKFxyXG4gICAgICAgIHRoaXMuY3JlYXRlRnJhbWUodGhpcy5kZWZhdWx0R3JhcGhpYylcclxuICAgICk7XHJcbiAgICB0aGlzLmFkZFN0YXRlKEdhbWVPYmplY3QuU1RBVEUuREVGQVVMVCwgdGhpcy5kZWZhdWx0U3RhdGUpO1xyXG5cclxuICAgIHRoaXMuc29saWQgPSB0cnVlO1xyXG4gICAgdGhpcy5maXhlZCA9IHRydWU7XHJcbiAgICB0aGlzLnJvdGF0ZSgtTWF0aC5QSSAqIDAuNSk7XHJcbn07XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKEZ1bGxCbG9jaywge1xyXG4gICAgbmFtZSA6IHtcclxuICAgICAgICB2YWx1ZSA6IFwiRnVsbEJsb2NrXCJcclxuICAgIH0sXHJcblxyXG4gICAgaWQgOiB7XHJcbiAgICAgICAgdmFsdWUgOiAwXHJcbiAgICB9XHJcbn0pO1xyXG5GdWxsQmxvY2sucHJvdG90eXBlID0gT2JqZWN0LmZyZWV6ZShPYmplY3QuY3JlYXRlKFBoeXNpY3NPYmplY3QucHJvdG90eXBlLCB7XHJcbiAgICBkcmF3T25NaW5pbWFwIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGN0eCkge1xyXG4gICAgICAgICAgICB2YXIgdyA9IHRoaXMuZ2V0V2lkdGgoKTtcclxuICAgICAgICAgICAgdmFyIGggPSB0aGlzLmdldEhlaWdodCgpO1xyXG4gICAgICAgICAgICB2YXIgb2Zmc2V0WCA9IE1hdGgucm91bmQoLXcgKiAwLjUpO1xyXG4gICAgICAgICAgICB2YXIgb2Zmc2V0WSA9IE1hdGgucm91bmQoLWggKiAwLjUpO1xyXG4gICAgICAgICAgICB2YXIgZGlzcGxheVdpZHRoID0gTWF0aC5yb3VuZCh3KTtcclxuICAgICAgICAgICAgdmFyIGRpc3BsYXlIZWlnaHQgPSBNYXRoLnJvdW5kKGgpO1xyXG5cclxuICAgICAgICAgICAgY3R4LnNhdmUoKTtcclxuXHJcbiAgICAgICAgICAgIGN0eC5yb3RhdGUodGhpcy5nZXRSb3RhdGlvbigpKTtcclxuXHJcbiAgICAgICAgICAgIGN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICAgICAgY3R4LnJlY3Qob2Zmc2V0WCwgb2Zmc2V0WSwgZGlzcGxheVdpZHRoLCBkaXNwbGF5SGVpZ2h0KTtcclxuICAgICAgICAgICAgY3R4LmZpbGwoKTtcclxuICAgICAgICAgICAgY3R4LnN0cm9rZSgpO1xyXG5cclxuICAgICAgICAgICAgY3R4LnJlc3RvcmUoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKTtcclxuT2JqZWN0LmZyZWV6ZShGdWxsQmxvY2spO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBGdWxsQmxvY2s7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcclxudmFyIEFzc2V0cyA9IHV0aWwuQXNzZXRzO1xyXG52YXIgR2FtZU9iamVjdCA9IHdmbC5jb3JlLmVudGl0aWVzLkdhbWVPYmplY3Q7XHJcbnZhciBQaHlzaWNzT2JqZWN0ID0gd2ZsLmNvcmUuZW50aXRpZXMuUGh5c2ljc09iamVjdDtcclxudmFyIGdlb20gPSB3ZmwuZ2VvbTtcclxuXHJcbi8qKlxyXG4gKiBBIGZ1bGwtc2l6ZWQsIHF1YWRyaWxhdGVyYWwgYmxvY2tcclxuICovXHJcbnZhciBIYWxmQmxvY2sgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICBQaHlzaWNzT2JqZWN0LmNhbGwodGhpcyk7XHJcblxyXG4gICAgdGhpcy5pZCA9IEhhbGZCbG9jay5pZDtcclxuXHJcbiAgICAvLyBDcmVhdGUgZGVmYXVsdCBzdGF0ZVxyXG4gICAgdGhpcy5kZWZhdWx0R3JhcGhpYyA9IEFzc2V0cy5nZXQoQXNzZXRzLkJMT0NLX0hBTEYpO1xyXG5cclxuICAgIHZhciB3ID0gdGhpcy5kZWZhdWx0R3JhcGhpYy53aWR0aDtcclxuICAgIHZhciBoID0gdGhpcy5kZWZhdWx0R3JhcGhpYy5oZWlnaHQ7XHJcbiAgICB2YXIgdmVydHMgPSBbXHJcbiAgICAgICAgbmV3IGdlb20uVmVjMigtdyAqIDAuNSwgLWggKiAwLjUpLFxyXG4gICAgICAgIG5ldyBnZW9tLlZlYzIodyAqIDAuNSwgLWggKiAwLjUpLFxyXG4gICAgICAgIG5ldyBnZW9tLlZlYzIoLXcgKiAwLjUsIGggKiAwLjUpXHJcbiAgICBdO1xyXG4gICAgdmFyIGZyYW1lT2JqID0gdGhpcy5jcmVhdGVGcmFtZSh0aGlzLmRlZmF1bHRHcmFwaGljLCAxLCBmYWxzZSk7XHJcbiAgICBmcmFtZU9iai52ZXJ0aWNlcyA9IHZlcnRzO1xyXG5cclxuICAgIHRoaXMuZGVmYXVsdFN0YXRlID0gdGhpcy5jcmVhdGVTdGF0ZSgpO1xyXG4gICAgdGhpcy5kZWZhdWx0U3RhdGUuYWRkRnJhbWUoZnJhbWVPYmopO1xyXG4gICAgdGhpcy5hZGRTdGF0ZShHYW1lT2JqZWN0LlNUQVRFLkRFRkFVTFQsIHRoaXMuZGVmYXVsdFN0YXRlKTtcclxuXHJcbiAgICB0aGlzLnNvbGlkID0gdHJ1ZTtcclxuICAgIHRoaXMuZml4ZWQgPSB0cnVlO1xyXG4gICAgdGhpcy5yb3RhdGUoLU1hdGguUEkgKiAwLjUpO1xyXG59O1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyhIYWxmQmxvY2ssIHtcclxuICAgIG5hbWUgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBcIkhhbGZCbG9ja1wiXHJcbiAgICB9LFxyXG5cclxuICAgIGlkIDoge1xyXG4gICAgICAgIHZhbHVlIDogMFxyXG4gICAgfVxyXG59KTtcclxuSGFsZkJsb2NrLnByb3RvdHlwZSA9IE9iamVjdC5mcmVlemUoT2JqZWN0LmNyZWF0ZShQaHlzaWNzT2JqZWN0LnByb3RvdHlwZSwge1xyXG4gICAgZHJhd09uTWluaW1hcCA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChjdHgpIHtcclxuICAgICAgICAgICAgdmFyIHcgPSB0aGlzLmdldFdpZHRoKCk7XHJcbiAgICAgICAgICAgIHZhciBoID0gdGhpcy5nZXRIZWlnaHQoKTtcclxuICAgICAgICAgICAgdmFyIG9mZnNldFggPSBNYXRoLnJvdW5kKC13ICogMC41KTtcclxuICAgICAgICAgICAgdmFyIG9mZnNldFkgPSBNYXRoLnJvdW5kKC1oICogMC41KTtcclxuXHJcbiAgICAgICAgICAgIGN0eC5zYXZlKCk7XHJcbiAgICAgICAgICAgIGN0eC5yb3RhdGUodGhpcy5nZXRSb3RhdGlvbigpKTtcclxuICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9IGFwcC5QaHlzaWNzT2JqZWN0Lk1JTklNQVBfRklMTF9TVFlMRTtcclxuICAgICAgICAgICAgY3R4LnN0cm9rZVN0eWxlID0gYXBwLlBoeXNpY3NPYmplY3QuTUlOSU1BUF9TVFJPS0VfU1RZTEU7XHJcbiAgICAgICAgICAgIGN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICAgICAgY3R4Lm1vdmVUbyhvZmZzZXRYLCBvZmZzZXRZKTtcclxuICAgICAgICAgICAgY3R4LmxpbmVUbygtb2Zmc2V0WCwgb2Zmc2V0WSk7XHJcbiAgICAgICAgICAgIGN0eC5saW5lVG8ob2Zmc2V0WCwgLW9mZnNldFkpO1xyXG4gICAgICAgICAgICBjdHguY2xvc2VQYXRoKCk7XHJcbiAgICAgICAgICAgIGN0eC5maWxsKCk7XHJcbiAgICAgICAgICAgIGN0eC5zdHJva2UoKTtcclxuXHJcbiAgICAgICAgICAgIGN0eC5yZXN0b3JlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSk7XHJcbk9iamVjdC5mcmVlemUoSGFsZkJsb2NrKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gSGFsZkJsb2NrOyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIHV0aWwgPSByZXF1aXJlKCcuLi91dGlsJyk7XHJcbnZhciBBc3NldHMgPSB1dGlsLkFzc2V0cztcclxudmFyIE5ldHdvcmsgPSByZXF1aXJlKCcuLi9uZXR3b3JrJyk7XHJcbnZhciBHYW1lT2JqZWN0ID0gd2ZsLmNvcmUuZW50aXRpZXMuR2FtZU9iamVjdDtcclxudmFyIExpdmluZ09iamVjdCA9IHdmbC5jb3JlLmVudGl0aWVzLkxpdmluZ09iamVjdDtcclxudmFyIHBhcnRpY2xlcyA9IHJlcXVpcmUoJy4uL3BhcnRpY2xlcycpO1xyXG52YXIgRW1pdHRlciA9IHBhcnRpY2xlcy5FbWl0dGVyO1xyXG52YXIgZ2VvbSA9IHdmbC5nZW9tO1xyXG5cclxudmFyIFBsYXllciA9IGZ1bmN0aW9uICh0ZWFtKSB7XHJcbiAgICBMaXZpbmdPYmplY3QuY2FsbCh0aGlzKTtcclxuXHJcbiAgICB0aGlzLmN1c3RvbURhdGEudGVhbSA9IHRlYW07XHJcblxyXG4gICAgdmFyIHNoaXBUeXBlO1xyXG4gICAgaWYgKHRlYW0gPT09IDApIHtcclxuICAgICAgICBzaGlwVHlwZSA9IEFzc2V0cy5TSElQXzE7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHNoaXBUeXBlID0gQXNzZXRzLlNISVBfMjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBDcmVhdGUgZGVmYXVsdCBzdGF0ZVxyXG4gICAgdGhpcy5kZWZhdWx0R3JhcGhpYyA9IEFzc2V0cy5nZXQoc2hpcFR5cGUpO1xyXG5cclxuICAgIHZhciB3ID0gdGhpcy5kZWZhdWx0R3JhcGhpYy53aWR0aDtcclxuICAgIHZhciBoID0gdGhpcy5kZWZhdWx0R3JhcGhpYy5oZWlnaHQ7XHJcbiAgICB2YXIgdmVydHMgPSBbXHJcbiAgICAgICAgbmV3IGdlb20uVmVjMigtdyAqIDAuNSwgLWggKiAwLjUpLFxyXG4gICAgICAgIG5ldyBnZW9tLlZlYzIodyAqIDAuNSwgMCksXHJcbiAgICAgICAgbmV3IGdlb20uVmVjMigtdyAqIDAuNSwgaCAqIDAuNSlcclxuICAgIF07XHJcbiAgICB2YXIgZnJhbWVPYmogPSB0aGlzLmNyZWF0ZUZyYW1lKHRoaXMuZGVmYXVsdEdyYXBoaWMsIDEsIGZhbHNlKTtcclxuICAgIGZyYW1lT2JqLnZlcnRpY2VzID0gdmVydHM7XHJcblxyXG4gICAgdGhpcy5kZWZhdWx0U3RhdGUgPSB0aGlzLmNyZWF0ZVN0YXRlKCk7XHJcbiAgICB0aGlzLmRlZmF1bHRTdGF0ZS5hZGRGcmFtZShmcmFtZU9iaik7XHJcbiAgICB0aGlzLmFkZFN0YXRlKEdhbWVPYmplY3QuU1RBVEUuREVGQVVMVCwgdGhpcy5kZWZhdWx0U3RhdGUpO1xyXG5cclxuICAgIC8vIENyZWF0ZSBleHBsb3Npb24gc3RhdGVcclxuXHJcbiAgICBpZiAodGVhbSA9PT0gMCkge1xyXG4gICAgICAgIHRoaXMuZXhwbG9zaW9uR3JhcGhpYzEgPSBBc3NldHMuZ2V0KEFzc2V0cy5FWFBMT1NJT05fQV8xKTtcclxuICAgICAgICB0aGlzLmV4cGxvc2lvbkdyYXBoaWMyID0gQXNzZXRzLmdldChBc3NldHMuRVhQTE9TSU9OX0FfMik7XHJcbiAgICAgICAgdGhpcy5leHBsb3Npb25HcmFwaGljMyA9IEFzc2V0cy5nZXQoQXNzZXRzLkVYUExPU0lPTl9BXzMpO1xyXG4gICAgICAgIHRoaXMuZXhwbG9zaW9uR3JhcGhpYzQgPSBBc3NldHMuZ2V0KEFzc2V0cy5FWFBMT1NJT05fRU5EKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5leHBsb3Npb25HcmFwaGljMSA9IEFzc2V0cy5nZXQoQXNzZXRzLkVYUExPU0lPTl9CXzEpO1xyXG4gICAgICAgIHRoaXMuZXhwbG9zaW9uR3JhcGhpYzIgPSBBc3NldHMuZ2V0KEFzc2V0cy5FWFBMT1NJT05fQl8yKTtcclxuICAgICAgICB0aGlzLmV4cGxvc2lvbkdyYXBoaWMzID0gQXNzZXRzLmdldChBc3NldHMuRVhQTE9TSU9OX0JfMyk7XHJcbiAgICAgICAgdGhpcy5leHBsb3Npb25HcmFwaGljNCA9IEFzc2V0cy5nZXQoQXNzZXRzLkVYUExPU0lPTl9FTkQpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuZXhwbG9zaW9uU3RhdGUgPSB0aGlzLmNyZWF0ZVN0YXRlKCk7XHJcblxyXG4gICAgdGhpcy5leHBsb3Npb25TdGF0ZS5hZGRGcmFtZSh0aGlzLmNyZWF0ZUZyYW1lKHRoaXMuZXhwbG9zaW9uR3JhcGhpYzEsIDIpKTtcclxuICAgIHRoaXMuZXhwbG9zaW9uU3RhdGUuYWRkRnJhbWUodGhpcy5jcmVhdGVGcmFtZSh0aGlzLmV4cGxvc2lvbkdyYXBoaWMyLCAyKSk7XHJcbiAgICB0aGlzLmV4cGxvc2lvblN0YXRlLmFkZEZyYW1lKHRoaXMuY3JlYXRlRnJhbWUodGhpcy5leHBsb3Npb25HcmFwaGljMywgMikpO1xyXG4gICAgdGhpcy5leHBsb3Npb25TdGF0ZS5hZGRGcmFtZSh0aGlzLmNyZWF0ZUZyYW1lKHRoaXMuZXhwbG9zaW9uR3JhcGhpYzQsIEluZmluaXR5KSk7XHJcbiAgICB0aGlzLmFkZFN0YXRlKFBsYXllci5TVEFURS5FWFBMT1NJT04sIHRoaXMuZXhwbG9zaW9uU3RhdGUpO1xyXG5cclxuICAgIHRoaXMuc2hvb3RUaW1lciA9IDA7XHJcbiAgICB0aGlzLm1heFNob290VGltZXIgPSBQbGF5ZXIuREVGQVVMVF9NQVhfU0hPT1RfVElNRVI7XHJcblxyXG4gICAgdGhpcy5leGhhdXN0ID0gbmV3IEVtaXR0ZXIoKTtcclxuICAgIHRoaXMuZXhoYXVzdFRpbWVyID0gMDtcclxuICAgIHRoaXMubWF4RXhoYXVzdFRpbWVyID0gUGxheWVyLkRFRkFVTFRfTUFYX0VYSEFVU1RfVElNRVI7XHJcblxyXG4gICAgdGhpcy5oZWFsdGggPSBOZXR3b3JrLmxvY2FsQ2xpZW50LmRhdGEuaGVhbHRoO1xyXG4gICAgdGhpcy5tYXhIZWFsdGggPSBOZXR3b3JrLmxvY2FsQ2xpZW50LmRhdGEuaGVhbHRoO1xyXG5cclxuICAgIHRoaXMucm90YXRlKC1NYXRoLlBJICogMC41KTtcclxufTtcclxuT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoUGxheWVyLCB7XHJcbiAgICBUVVJOX1NQRUVEIDoge1xyXG4gICAgICAgIHZhbHVlIDogMC4wNVxyXG4gICAgfSxcclxuXHJcbiAgICBCUkFLRV9SQVRFIDoge1xyXG4gICAgICAgIHZhbHVlIDogMC45NVxyXG4gICAgfSxcclxuXHJcbiAgICBCT09TVF9BQ0NFTEVSQVRJT04gOiB7XHJcbiAgICAgICAgdmFsdWUgOiAwLjAwMDJcclxuICAgIH0sXHJcblxyXG4gICAgUE9TSVRJT05fVVBEQVRFX0RJU1RBTkNFIDoge1xyXG4gICAgICAgIHZhbHVlIDogMC41XHJcbiAgICB9LFxyXG5cclxuICAgIE1JTklNQVBfRklMTF9TVFlMRSA6IHtcclxuICAgICAgICB2YWx1ZSA6IFwiIzg2YzhkM1wiXHJcbiAgICB9LFxyXG5cclxuICAgIERFRkFVTFRfTUFYX1NIT09UX1RJTUVSIDoge1xyXG4gICAgICAgIHZhbHVlIDogMjBcclxuICAgIH0sXHJcblxyXG4gICAgTUlOX0VYSEFVU1RfQUNDRUxFUkFUSU9OIDoge1xyXG4gICAgICAgIHZhbHVlIDogMC4wMDA0XHJcbiAgICB9LFxyXG5cclxuICAgIERFRkFVTFRfTUFYX0VYSEFVU1RfVElNRVIgOiB7XHJcbiAgICAgICAgdmFsdWUgOiAxMFxyXG4gICAgfSxcclxuXHJcbiAgICBTVEFURSA6IHtcclxuICAgICAgICB2YWx1ZSA6IHtcclxuICAgICAgICAgICAgRVhQTE9TSU9OIDogXCJleHBsb3Npb25cIlxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSk7XHJcblBsYXllci5wcm90b3R5cGUgPSBPYmplY3QuZnJlZXplKE9iamVjdC5jcmVhdGUoTGl2aW5nT2JqZWN0LnByb3RvdHlwZSwge1xyXG4gICAgdXBkYXRlIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGR0KSB7XHJcbiAgICAgICAgICAgIExpdmluZ09iamVjdC5wcm90b3R5cGUudXBkYXRlLmNhbGwodGhpcywgZHQpO1xyXG5cclxuICAgICAgICAgICAgLy8gVXBkYXRlIHNob290IHRpbWVyIHdoZW4ganVzdCBzaG90XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmp1c3RTaG90KCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2hvb3RUaW1lcisrO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnNob290VGltZXIgPj0gdGhpcy5tYXhTaG9vdFRpbWVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zaG9vdFRpbWVyID0gMDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMuaGVhbHRoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuYWNjZWxlcmF0aW9uLmdldE1hZ25pdHVkZVNxdWFyZWQoKSA+IFBsYXllci5NSU5fRVhIQVVTVF9BQ0NFTEVSQVRJT04gKiBQbGF5ZXIuTUlOX0VYSEFVU1RfQUNDRUxFUkFUSU9OKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gQWRkIHRoZSBuZXh0IHBhcnRpY2xlIGZvciB0aGUgZXhoYXVzdCBpZiB3ZSdyZSBhYmxlIHRvXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuZXhoYXVzdFRpbWVyID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwYXJ0aWNsZVBvc2l0aW9uID0gdGhpcy5mb3J3YXJkLmNsb25lKCkubXVsdGlwbHkoLXRoaXMuZGVmYXVsdEdyYXBoaWMuaGVpZ2h0ICogMC41KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5leGhhdXN0LmFkZFBhcnRpY2xlKHBhcnRpY2xlUG9zaXRpb24sIHRoaXMudmVsb2NpdHkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyBVcGRhdGUgZXhoYXVzdCB0aW1lciBmb3Igd2hlbiB0byBhZGQgdGhlIG5leHQgcGFydGljbGVcclxuICAgICAgICAgICAgICAgIHRoaXMuZXhoYXVzdFRpbWVyICs9IGR0O1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZXhoYXVzdFRpbWVyID49IHRoaXMubWF4RXhoYXVzdFRpbWVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5leGhhdXN0VGltZXIgPSAwO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBVcGRhdGUgZXhoYXVzdCBwYXJ0aWNsZSBzeXN0ZW1cclxuICAgICAgICAgICAgdGhpcy5leGhhdXN0LnVwZGF0ZShkdCk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnNlbmRVcGRhdGVUb1NlcnZlcigpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgc2VuZFVwZGF0ZVRvU2VydmVyIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAvLyBJZiB0aGUgcGxheWVyIGlzIGNvbm5lY3RlZCB0byB0aGUgbmV0d29yaywgc2VuZCBvdXQgdXBkYXRlcyB0b1xyXG4gICAgICAgICAgICAvLyBvdGhlciBwbGF5ZXJzIHdoZW4gbmVjZXNzYXJ5XHJcbiAgICAgICAgICAgIGlmIChOZXR3b3JrLmNvbm5lY3RlZCkge1xyXG4gICAgICAgICAgICAgICAgTmV0d29yay5zb2NrZXQuZW1pdCgndXBkYXRlT3RoZXInLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb24gICAgIDogdGhpcy5wb3NpdGlvbixcclxuICAgICAgICAgICAgICAgICAgICB2ZWxvY2l0eSAgICAgOiB0aGlzLnZlbG9jaXR5LFxyXG4gICAgICAgICAgICAgICAgICAgIGFjY2VsZXJhdGlvbiA6IHRoaXMuYWNjZWxlcmF0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgIHJvdGF0aW9uICAgICA6IHRoaXMuZ2V0Um90YXRpb24oKVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIGRyYXcgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoY3R4KSB7XHJcbiAgICAgICAgICAgIExpdmluZ09iamVjdC5wcm90b3R5cGUuZHJhdy5jYWxsKHRoaXMsIGN0eCk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmV4aGF1c3QuZHJhdyhjdHgpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgZHJhd09uTWluaW1hcCA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChjdHgpIHtcclxuICAgICAgICAgICAgdmFyIHcgPSB0aGlzLmdldFdpZHRoKCk7XHJcbiAgICAgICAgICAgIHZhciBoID0gdGhpcy5nZXRIZWlnaHQoKTtcclxuICAgICAgICAgICAgdmFyIG9mZnNldFggPSBNYXRoLnJvdW5kKC13ICogMC41KTtcclxuICAgICAgICAgICAgdmFyIG9mZnNldFkgPSBNYXRoLnJvdW5kKC1oICogMC41KTtcclxuICAgICAgICAgICAgdmFyIGRpc3BsYXlXaWR0aCA9IE1hdGgucm91bmQodyk7XHJcbiAgICAgICAgICAgIHZhciBkaXNwbGF5SGVpZ2h0ID0gTWF0aC5yb3VuZChoKTtcclxuXHJcbiAgICAgICAgICAgIGN0eC5zYXZlKCk7XHJcblxyXG4gICAgICAgICAgICBjdHguZmlsbFN0eWxlID0gUGxheWVyLk1JTklNQVBfRklMTF9TVFlMRTtcclxuICAgICAgICAgICAgY3R4LmZpbGxSZWN0KG9mZnNldFgsIG9mZnNldFksIGRpc3BsYXlXaWR0aCwgZGlzcGxheUhlaWdodCk7XHJcblxyXG4gICAgICAgICAgICBjdHgucmVzdG9yZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgc2hvb3QgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5qdXN0U2hvdCgpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNob290VGltZXIgPSAxO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChOZXR3b3JrLmNvbm5lY3RlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIE5ldHdvcmsuc29ja2V0LmVtaXQoJ2J1bGxldCcsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb24gICAgIDogdGhpcy5wb3NpdGlvbixcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmVsb2NpdHkgICAgIDogdGhpcy52ZWxvY2l0eSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWNjZWxlcmF0aW9uIDogdGhpcy5hY2NlbGVyYXRpb24sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvdGF0aW9uICAgICA6IHRoaXMuZ2V0Um90YXRpb24oKVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBqdXN0U2hvdCA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuICh0aGlzLnNob290VGltZXIgPiAwKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIHJlc29sdmVDb2xsaXNpb24gOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAocGh5c09iaiwgY29sbGlzaW9uRGF0YSkge1xyXG4gICAgICAgICAgICB2YXIgdGVhbSA9IHRoaXMuY3VzdG9tRGF0YS50ZWFtO1xyXG4gICAgICAgICAgICB2YXIgb3RoZXJUZWFtID0gcGh5c09iai5jdXN0b21EYXRhLnRlYW07XHJcblxyXG4gICAgICAgICAgICAvLyBJZiBoaXR0aW5nIHNvbWV0aGluZyB0aGF0J3Mgbm90IG9uIHRoaXMgdGVhbVxyXG4gICAgICAgICAgICBpZiAob3RoZXJUZWFtID09PSB1bmRlZmluZWQgfHwgb3RoZXJUZWFtICE9PSB0ZWFtIHx8IHBoeXNPYmoudGFrZURhbWFnZSkge1xyXG4gICAgICAgICAgICAgICAgTGl2aW5nT2JqZWN0LnByb3RvdHlwZS5yZXNvbHZlQ29sbGlzaW9uLmNhbGwodGhpcywgcGh5c09iaiwgY29sbGlzaW9uRGF0YSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKTtcclxuT2JqZWN0LmZyZWV6ZShQbGF5ZXIpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQbGF5ZXI7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgRnVsbEJsb2NrID0gcmVxdWlyZSgnLi9GdWxsQmxvY2suanMnKTtcclxudmFyIEhhbGZCbG9jayA9IHJlcXVpcmUoJy4vSGFsZkJsb2NrLmpzJyk7XHJcbnZhciBQbGF5ZXIgPSByZXF1aXJlKCcuL1BsYXllci5qcycpO1xyXG52YXIgQ2xpZW50UGxheWVyID0gcmVxdWlyZSgnLi9DbGllbnRQbGF5ZXIuanMnKTtcclxudmFyIEJ1bGxldCA9IHJlcXVpcmUoJy4vQnVsbGV0LmpzJyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIEZ1bGxCbG9jayAgICA6IEZ1bGxCbG9jayxcclxuICAgIEhhbGZCbG9jayAgICA6IEhhbGZCbG9jayxcclxuICAgIFBsYXllciAgICAgICA6IFBsYXllcixcclxuICAgIENsaWVudFBsYXllciA6IENsaWVudFBsYXllcixcclxuICAgIEJ1bGxldCAgICAgICA6IEJ1bGxldFxyXG59OyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIE5ldHdvcmsgPSByZXF1aXJlKCcuL25ldHdvcmsnKTtcclxudmFyIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcclxudmFyIEFzc2V0cyA9IHV0aWwuQXNzZXRzO1xyXG52YXIgc2NlbmVzID0gcmVxdWlyZSgnLi9zY2VuZXMnKTtcclxudmFyIG92ZXJsYXlzID0gcmVxdWlyZSgnLi9vdmVybGF5cycpO1xyXG5cclxuLy8gQ3JlYXRlIGdhbWVcclxudmFyIGNhbnZhcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZ2FtZS1jYW52YXNcIik7XHJcbnZhciBnYW1lICAgPSB3ZmwuY3JlYXRlKGNhbnZhcyk7XHJcblxyXG52YXIgbG9hZGluZ1NjZW5lID0gbmV3IHNjZW5lcy5Mb2FkaW5nU2NlbmUoY2FudmFzKTtcclxuZ2FtZS5zZXRTY2VuZShsb2FkaW5nU2NlbmUpO1xyXG5cclxuLy8gU3RvcCB0aGUgZ2FtZSBzbyB0aGF0IGNhbnZhcyB1cGRhdGVzIGRvbid0IGFmZmVjdCBwZXJmb3JtYW5jZSB3aXRoXHJcbi8vIG92ZXJsYXlzXHJcbmdhbWUuc3RvcCgpO1xyXG5cclxuLy8gRHJhdyBpbml0aWFsIGJsYWNrIEJHIG9uIGNhbnZhc1xyXG52YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcclxuY3R4LmZpbGxTdHlsZSA9IFwiIzA0MEIwQ1wiO1xyXG5jdHguZmlsbFJlY3QoMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcclxuXHJcbnZhciBvbkxvYWQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAkKE5ldHdvcmspLm9uKFxyXG4gICAgICAgIE5ldHdvcmsuRXZlbnQuQ09OTkVDVCxcclxuICAgICAgICBvbk5ldHdvcmtDb25uZWN0XHJcbiAgICApO1xyXG5cclxuICAgIE5ldHdvcmsuaW5pdCgpO1xyXG59O1xyXG5cclxudmFyIGdvVG9HYW1lID0gZnVuY3Rpb24gKHJvb20pIHtcclxuICAgIC8vIFVwZGF0ZSB0aGUgZ2FtZSB3aXRoIHRoZSBjdXJyZW50IHRpbWUgYmVjYXVzZSB0aGUgZHQgd2lsbCBiZSBodWdlIG5leHRcclxuICAgIC8vIHVwZGF0ZSBzaW5jZSB0aGUgZ2FtZSB3YXMgc3RvcHBlZCB3aGlsZSBpbiB0aGUgbG9iYnlcclxuICAgIGdhbWUudXBkYXRlKERhdGUubm93KCkpO1xyXG5cclxuICAgICQoZ2FtZS5nZXRTY2VuZSgpKS5vZmYoKTtcclxuXHJcbiAgICB2YXIgZ2FtZVNjZW5lID0gbmV3IHNjZW5lcy5HYW1lU2NlbmUoY2FudmFzLCByb29tKTtcclxuICAgIGdhbWUuc2V0U2NlbmUoZ2FtZVNjZW5lKTtcclxuXHJcbiAgICAkKE5ldHdvcmspLm9uKFxyXG4gICAgICAgIE5ldHdvcmsuRXZlbnQuRU5EX0dBTUUsXHJcbiAgICAgICAgb25FbmRHYW1lXHJcbiAgICApO1xyXG5cclxuICAgIC8vIElmIHRoZSBwbGF5ZXIgcmVjZWl2ZXMgZGF0YSBmb3IgZ2FtZSBvdmVyIGJlZm9yZSB0aGV5IGFjdHVhbGx5IGxvYWQgdGhlXHJcbiAgICAvLyBnYXZlIG92ZXIgc2NyZWVuLCBza2lwIGltbWVkaWF0ZWx5IHRvIHRoZSBnYW1lIG92ZXIgc2NyZWVuIChiZWNhdXNlIG9ubHlcclxuICAgIC8vIHRoZSBob3N0IHdvdWxkIHNlbmQgdGhhdCBkYXRhKVxyXG4gICAgJChOZXR3b3JrKS5vbihcclxuICAgICAgICBOZXR3b3JrLkV2ZW50LkdBTUVfT1ZFUl9EQVRBLFxyXG4gICAgICAgIHJvb20sXHJcbiAgICAgICAgb25HZXRHYW1lT3ZlckRhdGFcclxuICAgICk7XHJcblxyXG4gICAgLy8gU3RhcnQgdGhlIGdhbWUgc2luY2UgaXQgd2FzIHN0b3BwZWQgdG8gaGVscCBwZXJmb3JtYW5jZSB3aXRoIG92ZXJsYXlzIG9uXHJcbiAgICAvLyBhIGNhbnZhc1xyXG4gICAgZ2FtZS5zdGFydCgpO1xyXG59O1xyXG5cclxudmFyIGdvVG9HYW1lU3RhcnQgPSBmdW5jdGlvbiAocm9vbSkge1xyXG4gICAgLy8gU3RvcCB0aGUgZ2FtZSBzbyB0aGF0IGNhbnZhcyB1cGRhdGVzIGRvbid0IGFmZmVjdCBwZXJmb3JtYW5jZSB3aXRoXHJcbiAgICAvLyBvdmVybGF5c1xyXG4gICAgZ2FtZS5zdG9wKCk7XHJcblxyXG4gICAgLy8gUmVzZXQgYWxsIGxpc3RlbmVycyBvbiB0aGUgTmV0d29ya1xyXG4gICAgJChOZXR3b3JrKS5vZmYoKTtcclxuXHJcbiAgICB2YXIgZ2FtZVN0YXJ0U2NlbmUgPSBuZXcgc2NlbmVzLkdhbWVTdGFydFNjZW5lKGNhbnZhcywgcm9vbSk7XHJcbiAgICBnYW1lLnNldFNjZW5lKGdhbWVTdGFydFNjZW5lKTtcclxuXHJcbiAgICAkKGdhbWVTdGFydFNjZW5lKS5vbihcclxuICAgICAgICBzY2VuZXMuR2FtZVN0YXJ0U2NlbmUuRXZlbnQuU1RBUlRfR0FNRSxcclxuICAgICAgICBvbkdhbWVTdGFydFRvR2FtZVxyXG4gICAgKTtcclxufTtcclxuXHJcbnZhciBnb1RvTG9iYnkgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAvLyBEcmF3IGJsYWNrIG92ZXIgdGhlIGNhbnZhc1xyXG4gICAgY3R4LmZpbGxTdHlsZSA9IFwiIzA0MEIwQ1wiO1xyXG4gICAgY3R4LmZpbGxSZWN0KDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XHJcblxyXG4gICAgLy8gU3RvcCB0aGUgZ2FtZSBzbyB0aGF0IGNhbnZhcyB1cGRhdGVzIGRvbid0IGFmZmVjdCBwZXJmb3JtYW5jZSB3aXRoXHJcbiAgICAvLyBvdmVybGF5c1xyXG4gICAgZ2FtZS5zdG9wKCk7XHJcblxyXG4gICAgJChnYW1lLmdldFNjZW5lKCkpLm9mZigpO1xyXG5cclxuICAgIC8vIFJlc2V0IGFsbCBsaXN0ZW5lcnMgb24gdGhlIE5ldHdvcmtcclxuICAgICQoTmV0d29yaykub2ZmKCk7XHJcblxyXG4gICAgdmFyIGxvYmJ5U2NlbmUgPSBuZXcgc2NlbmVzLkxvYmJ5U2NlbmUoY2FudmFzKTtcclxuICAgIGdhbWUuc2V0U2NlbmUobG9iYnlTY2VuZSk7XHJcblxyXG4gICAgJChOZXR3b3JrKS5vbihcclxuICAgICAgICBOZXR3b3JrLkV2ZW50LlNUQVJUX0dBTUUsXHJcbiAgICAgICAgb25TdGFydEdhbWVcclxuICAgICk7XHJcblxyXG4gICAgLy8gVHJhbnNpdGlvbiB0aGUgcGFnZSdzIEJHIGNvbG9yIHRvIGJsYWNrIHRvIGhpZGUgdGhlIEJHIGltYWdlIHdoaWNoXHJcbiAgICAvLyBiZWNvbWVzIGRpc3RyYWN0aW5nIGR1cmluZyBnYW1lIHBsYXlcclxuICAgICQoXCJib2R5XCIpLmNzcyh7XCJiYWNrZ3JvdW5kLWNvbG9yXCI6IFwiIzA3MTIxM1wifSk7XHJcbn07XHJcblxyXG52YXIgZ29Ub0dhbWVPdmVyID0gZnVuY3Rpb24gKHJvb20pIHtcclxuICAgIC8vIFN0b3AgdGhlIGdhbWUgc28gdGhhdCBjYW52YXMgdXBkYXRlcyBkb24ndCBhZmZlY3QgcGVyZm9ybWFuY2Ugd2l0aFxyXG4gICAgLy8gb3ZlcmxheXNcclxuICAgIGdhbWUuc3RvcCgpO1xyXG5cclxuICAgIC8vIFJlc2V0IGFsbCBsaXN0ZW5lcnMgb24gdGhlIE5ldHdvcmtcclxuICAgICQoTmV0d29yaykub2ZmKCk7XHJcblxyXG4gICAgdmFyIGdhbWVPdmVyU2NlbmUgPSBuZXcgc2NlbmVzLkdhbWVPdmVyU2NlbmUoY2FudmFzLCByb29tKTtcclxuICAgIGdhbWUuc2V0U2NlbmUoZ2FtZU92ZXJTY2VuZSk7XHJcblxyXG4gICAgJChnYW1lT3ZlclNjZW5lKS5vbihcclxuICAgICAgICBzY2VuZXMuR2FtZU92ZXJTY2VuZS5FdmVudC5SRVRVUk5fVE9fTE9CQlksXHJcbiAgICAgICAgb25HYW1lT3ZlclRvTG9iYnlcclxuICAgICk7XHJcbn07XHJcblxyXG52YXIgb25TdGFydEdhbWUgPSBmdW5jdGlvbiAoZSwgcm9vbSkge1xyXG4gICAgZ29Ub0dhbWVTdGFydChyb29tKTtcclxufTtcclxuXHJcbnZhciBvbkVuZEdhbWUgPSBmdW5jdGlvbiAoZSwgcm9vbSkge1xyXG4gICAgZ29Ub0dhbWVPdmVyKHJvb20pO1xyXG59O1xyXG5cclxudmFyIG9uR2FtZVN0YXJ0VG9HYW1lID0gZnVuY3Rpb24gKGUsIHJvb20pIHtcclxuICAgIGdvVG9HYW1lKHJvb20pO1xyXG59O1xyXG5cclxudmFyIG9uR2V0R2FtZU92ZXJEYXRhID0gZnVuY3Rpb24gKGUsIGdhbWVPdmVyRGF0YSkge1xyXG4gICAgZ29Ub0dhbWVPdmVyKGUuZGF0YSk7XHJcbiAgICBnYW1lLmdldFNjZW5lKCkuX29uVXBkYXRlU2NvcmUoZ2FtZU92ZXJEYXRhKTtcclxufTtcclxuXHJcbnZhciBvbkdhbWVPdmVyVG9Mb2JieSA9IGZ1bmN0aW9uIChlLCByb29tKSB7XHJcbiAgICBnb1RvTG9iYnkoKTtcclxuXHJcbiAgICAvLyBUcmlnZ2VyIGFuIGV2ZW50IHNvIHRoZSBsb2JieSBzY2VuZSBrbm93cyB0byBqb2luIHRoZSByb29tIGl0IHdhcyBqdXN0XHJcbiAgICAvLyBpbiBiZWZvcmUgcGxheWluZyB0aGUgZ2FtZVxyXG4gICAgTmV0d29yay5fb25FbnRlclJvb21TdWNjZXNzKHJvb20pO1xyXG59O1xyXG5cclxudmFyIG9uTmV0d29ya0Nvbm5lY3QgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICBnb1RvTG9iYnkoKTtcclxufTtcclxuXHJcbnZhciBQcmVsb2FkZXIgPSBuZXcgdXRpbC5QcmVsb2FkZXIob25Mb2FkLmJpbmQodGhpcykpOyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIGVudGl0aWVzID0gcmVxdWlyZSgnLi4vZW50aXRpZXMnKTtcclxudmFyIEZ1bGxCb2NrID0gZW50aXRpZXMuRnVsbEJsb2NrO1xyXG52YXIgSGFsZkJsb2NrID0gZW50aXRpZXMuSGFsZkJsb2NrO1xyXG5cclxudmFyIExldmVsMSA9IGZ1bmN0aW9uIChzY2VuZSkge1xyXG4gICAgdmFyIGJsb2NrU2l6ZSA9IDEyODtcclxuXHJcbiAgICAvLyBMaW5lIHRoZSB0b3BcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMTY7IGkrKykge1xyXG4gICAgICAgIHZhciBuZXdCbG9jayA9IG5ldyBGdWxsQm9jaygpO1xyXG4gICAgICAgIG5ld0Jsb2NrLnBvc2l0aW9uLnggPSBibG9ja1NpemUgKiBpO1xyXG4gICAgICAgIG5ld0Jsb2NrLnBvc2l0aW9uLnkgPSAwO1xyXG5cclxuICAgICAgICBzY2VuZS5hZGRHYW1lT2JqZWN0KG5ld0Jsb2NrKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBMaW5lIHRoZSBib3R0b21cclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMTY7IGkrKykge1xyXG4gICAgICAgIHZhciBuZXdCbG9jayA9IG5ldyBGdWxsQm9jaygpO1xyXG4gICAgICAgIG5ld0Jsb2NrLnBvc2l0aW9uLnggPSBibG9ja1NpemUgKiBpO1xyXG4gICAgICAgIG5ld0Jsb2NrLnBvc2l0aW9uLnkgPSBibG9ja1NpemUgKiAxMDtcclxuXHJcbiAgICAgICAgc2NlbmUuYWRkR2FtZU9iamVjdChuZXdCbG9jayk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gTGluZSB0aGUgbGVmdFxyXG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCAxMDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIG5ld0Jsb2NrID0gbmV3IEZ1bGxCb2NrKCk7XHJcbiAgICAgICAgbmV3QmxvY2sucG9zaXRpb24ueCA9IDA7XHJcbiAgICAgICAgbmV3QmxvY2sucG9zaXRpb24ueSA9IGJsb2NrU2l6ZSAqIGk7XHJcblxyXG4gICAgICAgIHNjZW5lLmFkZEdhbWVPYmplY3QobmV3QmxvY2spO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIExpbmUgdGhlIHJpZ2h0XHJcbiAgICBmb3IgKHZhciBpID0gMTsgaSA8IDEwOyBpKyspIHtcclxuICAgICAgICB2YXIgbmV3QmxvY2sgPSBuZXcgRnVsbEJvY2soKTtcclxuICAgICAgICBuZXdCbG9jay5wb3NpdGlvbi54ID0gYmxvY2tTaXplICogMTU7XHJcbiAgICAgICAgbmV3QmxvY2sucG9zaXRpb24ueSA9IGJsb2NrU2l6ZSAqIGk7XHJcblxyXG4gICAgICAgIHNjZW5lLmFkZEdhbWVPYmplY3QobmV3QmxvY2spO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBvYmo7XHJcbiAgICBcclxuICAgIG9iaiA9IG5ldyBGdWxsQm9jaygpO1xyXG4gICAgb2JqLnBvc2l0aW9uLnggPSBibG9ja1NpemUgKiAzO1xyXG4gICAgb2JqLnBvc2l0aW9uLnkgPSBibG9ja1NpemUgKiAzO1xyXG4gICAgc2NlbmUuYWRkR2FtZU9iamVjdChvYmopO1xyXG4gICAgXHJcbiAgICBvYmogPSBuZXcgRnVsbEJvY2soKTtcclxuICAgIG9iai5wb3NpdGlvbi54ID0gYmxvY2tTaXplICogNDtcclxuICAgIG9iai5wb3NpdGlvbi55ID0gYmxvY2tTaXplICogNDtcclxuICAgIHNjZW5lLmFkZEdhbWVPYmplY3Qob2JqKTtcclxuICAgIFxyXG4gICAgb2JqID0gbmV3IEZ1bGxCb2NrKCk7XHJcbiAgICBvYmoucG9zaXRpb24ueCA9IGJsb2NrU2l6ZSAqIDc7XHJcbiAgICBvYmoucG9zaXRpb24ueSA9IGJsb2NrU2l6ZSAqIDQ7XHJcbiAgICBzY2VuZS5hZGRHYW1lT2JqZWN0KG9iaik7XHJcbiAgICBcclxuICAgIG9iaiA9IG5ldyBGdWxsQm9jaygpO1xyXG4gICAgb2JqLnBvc2l0aW9uLnggPSBibG9ja1NpemUgKiA4O1xyXG4gICAgb2JqLnBvc2l0aW9uLnkgPSBibG9ja1NpemUgKiA2O1xyXG4gICAgc2NlbmUuYWRkR2FtZU9iamVjdChvYmopO1xyXG4gICAgXHJcbiAgICBvYmogPSBuZXcgRnVsbEJvY2soKTtcclxuICAgIG9iai5wb3NpdGlvbi54ID0gYmxvY2tTaXplICogMTE7XHJcbiAgICBvYmoucG9zaXRpb24ueSA9IGJsb2NrU2l6ZSAqIDY7XHJcbiAgICBzY2VuZS5hZGRHYW1lT2JqZWN0KG9iaik7XHJcbiAgICBcclxuICAgIG9iaiA9IG5ldyBGdWxsQm9jaygpO1xyXG4gICAgb2JqLnBvc2l0aW9uLnggPSBibG9ja1NpemUgKiAxMjtcclxuICAgIG9iai5wb3NpdGlvbi55ID0gYmxvY2tTaXplICogNztcclxuICAgIHNjZW5lLmFkZEdhbWVPYmplY3Qob2JqKTtcclxuXHJcbiAgICBvYmogPSBuZXcgSGFsZkJsb2NrKCk7XHJcbiAgICBvYmoucG9zaXRpb24ueCA9IGJsb2NrU2l6ZSAqIDE7XHJcbiAgICBvYmoucG9zaXRpb24ueSA9IGJsb2NrU2l6ZSAqIDY7XHJcbiAgICBzY2VuZS5hZGRHYW1lT2JqZWN0KG9iaik7XHJcblxyXG4gICAgb2JqID0gbmV3IEhhbGZCbG9jaygpO1xyXG4gICAgb2JqLnBvc2l0aW9uLnggPSBibG9ja1NpemUgKiA0O1xyXG4gICAgb2JqLnBvc2l0aW9uLnkgPSBibG9ja1NpemUgKiAzO1xyXG4gICAgc2NlbmUuYWRkR2FtZU9iamVjdChvYmopO1xyXG5cclxuICAgIG9iaiA9IG5ldyBIYWxmQmxvY2soKTtcclxuICAgIG9iai5wb3NpdGlvbi54ID0gYmxvY2tTaXplICogNDtcclxuICAgIG9iai5wb3NpdGlvbi55ID0gYmxvY2tTaXplICogOTtcclxuICAgIHNjZW5lLmFkZEdhbWVPYmplY3Qob2JqKTtcclxuXHJcbiAgICBvYmogPSBuZXcgSGFsZkJsb2NrKCk7XHJcbiAgICBvYmoucG9zaXRpb24ueCA9IGJsb2NrU2l6ZSAqIDg7XHJcbiAgICBvYmoucG9zaXRpb24ueSA9IGJsb2NrU2l6ZSAqIDU7XHJcbiAgICBzY2VuZS5hZGRHYW1lT2JqZWN0KG9iaik7XHJcblxyXG4gICAgb2JqID0gbmV3IEhhbGZCbG9jaygpO1xyXG4gICAgb2JqLnBvc2l0aW9uLnggPSBibG9ja1NpemUgKiA3O1xyXG4gICAgb2JqLnBvc2l0aW9uLnkgPSBibG9ja1NpemUgKiA1O1xyXG4gICAgb2JqLnJvdGF0ZShNYXRoLlBJKTtcclxuICAgIHNjZW5lLmFkZEdhbWVPYmplY3Qob2JqKTtcclxuXHJcbiAgICBvYmogPSBuZXcgSGFsZkJsb2NrKCk7XHJcbiAgICBvYmoucG9zaXRpb24ueCA9IGJsb2NrU2l6ZSAqIDExO1xyXG4gICAgb2JqLnBvc2l0aW9uLnkgPSBibG9ja1NpemUgKiAxO1xyXG4gICAgb2JqLnJvdGF0ZShNYXRoLlBJKTtcclxuICAgIHNjZW5lLmFkZEdhbWVPYmplY3Qob2JqKTtcclxuXHJcbiAgICBvYmogPSBuZXcgSGFsZkJsb2NrKCk7XHJcbiAgICBvYmoucG9zaXRpb24ueCA9IGJsb2NrU2l6ZSAqIDExO1xyXG4gICAgb2JqLnBvc2l0aW9uLnkgPSBibG9ja1NpemUgKiA3O1xyXG4gICAgb2JqLnJvdGF0ZShNYXRoLlBJKTtcclxuICAgIHNjZW5lLmFkZEdhbWVPYmplY3Qob2JqKTtcclxuXHJcbiAgICBvYmogPSBuZXcgSGFsZkJsb2NrKCk7XHJcbiAgICBvYmoucG9zaXRpb24ueCA9IGJsb2NrU2l6ZSAqIDE0O1xyXG4gICAgb2JqLnBvc2l0aW9uLnkgPSBibG9ja1NpemUgKiA0O1xyXG4gICAgb2JqLnJvdGF0ZShNYXRoLlBJKTtcclxuICAgIHNjZW5lLmFkZEdhbWVPYmplY3Qob2JqKTtcclxufTtcclxuXHJcbk9iamVjdC5mcmVlemUoTGV2ZWwxKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTGV2ZWwxOyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIExldmVsMSA9IHJlcXVpcmUoXCIuL0xldmVsMS5qc1wiKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgTGV2ZWwxIDogTGV2ZWwxXHJcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgZW50aXRpZXMgPSByZXF1aXJlKCcuLi9lbnRpdGllcycpO1xyXG5cclxudmFyIENsaWVudCA9IGZ1bmN0aW9uIChpZCwgZGF0YSkge1xyXG4gICAgdGhpcy5pZCA9IGlkO1xyXG4gICAgdGhpcy5kYXRhID0gZGF0YTtcclxuICAgIHRoaXMuZ2FtZU9iamVjdCA9IHVuZGVmaW5lZDtcclxufTtcclxuT2JqZWN0LmZyZWV6ZShDbGllbnQpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDbGllbnQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgZW50aXRpZXMgPSByZXF1aXJlKCcuLi9lbnRpdGllcycpO1xyXG5cclxudmFyIExvY2FsQ2xpZW50ID0gZnVuY3Rpb24gKGlkLCBkYXRhKSB7XHJcbiAgICB0aGlzLmlkID0gaWQ7XHJcbiAgICB0aGlzLmRhdGEgPSBkYXRhO1xyXG4gICAgdGhpcy5nYW1lT2JqZWN0ID0gdW5kZWZpbmVkO1xyXG59O1xyXG5PYmplY3QuZnJlZXplKExvY2FsQ2xpZW50KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTG9jYWxDbGllbnQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgTmV0d29yayA9IHtcclxuICAgIHNvY2tldCAgICAgIDogdW5kZWZpbmVkLFxyXG4gICAgbG9jYWxDbGllbnQgOiB7fSxcclxuICAgIGNsaWVudHMgICAgIDoge30sXHJcbiAgICByb29tcyAgICAgICA6IHt9LFxyXG4gICAgY29ubmVjdGVkICAgOiBmYWxzZSxcclxuICAgIGhvc3RJZCAgICAgIDogLTEsXHJcblxyXG4gICAgLy8gRXZlbnRzIGZvciBleHRlcm5hbCBlbnRpdGllcyB0byBzdWJzY3JpYmUgdG9cclxuICAgIEV2ZW50ICAgICAgIDoge1xyXG4gICAgICAgIENPTk5FQ1QgICAgICAgICAgICA6IFwiY29ubmVjdFwiLFxyXG4gICAgICAgIFVQREFURV9ST09NUyAgICAgICA6IFwidXBkYXRlUm9vbXNcIixcclxuICAgICAgICBFTlRFUl9ST09NX1NVQ0NFU1MgOiBcImVudGVyUm9vbVN1Y2Nlc3NcIixcclxuICAgICAgICBFTlRFUl9ST09NX0ZBSUwgICAgOiBcImVudGVyUm9vbUZhaWxcIixcclxuICAgICAgICBQTEFZICAgICAgICAgICAgICAgOiBcInBsYXlcIixcclxuICAgICAgICBTVEFSVF9HQU1FICAgICAgICAgOiBcInN0YXJ0R2FtZVwiLFxyXG4gICAgICAgIEVORF9HQU1FICAgICAgICAgICA6IFwiZW5kR2FtZVwiLFxyXG4gICAgICAgIFBMQVlFUl9ERUFUSCAgICAgICA6IFwicGxheWVyRGVhdGhcIixcclxuICAgICAgICBQTEFZRVJfUkVTUEFXTiAgICAgOiBcInBsYXllclJlc3Bhd25cIixcclxuICAgICAgICBCVUxMRVQgICAgICAgICAgICAgOiBcImJ1bGxldFwiLFxyXG4gICAgICAgIENMT0NLX1RJQ0sgICAgICAgICA6IFwiY2xvY2tUaWNrXCIsXHJcbiAgICAgICAgQ09VTlRET1dOICAgICAgICAgIDogXCJjb3VudGRvd25cIixcclxuICAgICAgICBHQU1FX1NUQVJUX0RBVEEgICAgOiBcImdhbWVTdGFydERhdGFcIixcclxuICAgICAgICBHQU1FX09WRVJfREFUQSAgICAgOiBcImdhbWVPdmVyRGF0YVwiXHJcbiAgICB9LFxyXG5cclxuICAgIGluaXQgOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5zb2NrZXQgPSBpby5jb25uZWN0KCk7XHJcblxyXG4gICAgICAgIHRoaXMuc29ja2V0Lm9uKCdjb25maXJtJywgdGhpcy5fb25Db25maXJtQ2xpZW50LmJpbmQodGhpcykpO1xyXG4gICAgICAgIHRoaXMuc29ja2V0Lm9uKCdhZGRPdGhlcicsIHRoaXMuX29uQWRkT3RoZXJDbGllbnQuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgdGhpcy5zb2NrZXQub24oJ3JlbW92ZU90aGVyJywgdGhpcy5fb25SZW1vdmVPdGhlckNsaWVudC5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLnNvY2tldC5vbignbG9hZFByZXZpb3VzJywgdGhpcy5fb25Mb2FkUHJldmlvdXNDbGllbnRzLmJpbmQodGhpcykpO1xyXG4gICAgICAgIHRoaXMuc29ja2V0Lm9uKCd1cGRhdGVPdGhlcicsIHRoaXMuX29uVXBkYXRlQ2xpZW50LmJpbmQodGhpcykpO1xyXG4gICAgICAgIHRoaXMuc29ja2V0Lm9uKCd1cGRhdGVSb29tcycsIHRoaXMuX29uVXBkYXRlUm9vbXMuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgdGhpcy5zb2NrZXQub24oJ2VudGVyUm9vbVN1Y2Nlc3MnLCB0aGlzLl9vbkVudGVyUm9vbVN1Y2Nlc3MuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgdGhpcy5zb2NrZXQub24oJ2VudGVyUm9vbUZhaWwnLCB0aGlzLl9vbkVudGVyUm9vbUZhaWwuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgdGhpcy5zb2NrZXQub24oJ3BpbmcnLCB0aGlzLl9vblBpbmcuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgdGhpcy5zb2NrZXQub24oJ3NldEhvc3QnLCB0aGlzLl9vblNldEhvc3QuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgdGhpcy5zb2NrZXQub24oJ3N0YXJ0R2FtZScsIHRoaXMuX29uU3RhcnRHYW1lLmJpbmQodGhpcykpO1xyXG4gICAgICAgIHRoaXMuc29ja2V0Lm9uKCdlbmRHYW1lJywgdGhpcy5fb25FbmRHYW1lLmJpbmQodGhpcykpO1xyXG4gICAgICAgIHRoaXMuc29ja2V0Lm9uKCdwbGF5ZXJEZWF0aCcsIHRoaXMuX29uUGxheWVyRGVhdGguYmluZCh0aGlzKSk7XHJcbiAgICAgICAgdGhpcy5zb2NrZXQub24oJ3BsYXllclJlc3Bhd24nLCB0aGlzLl9vblBsYXllclJlc3Bhd24uYmluZCh0aGlzKSk7XHJcbiAgICAgICAgdGhpcy5zb2NrZXQub24oJ2J1bGxldCcsIHRoaXMuX29uQnVsbGV0LmJpbmQodGhpcykpO1xyXG4gICAgICAgIHRoaXMuc29ja2V0Lm9uKCdjb3VudGRvd24nLCB0aGlzLl9vbkNvdW50ZG93bi5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLnNvY2tldC5vbignY2xvY2tUaWNrJywgdGhpcy5fb25DbG9ja1RpY2suYmluZCh0aGlzKSk7XHJcbiAgICAgICAgdGhpcy5zb2NrZXQub24oJ2dhbWVTdGFydERhdGEnLCB0aGlzLl9vbkdhbWVTdGFydERhdGEuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgdGhpcy5zb2NrZXQub24oJ2dhbWVPdmVyRGF0YScsIHRoaXMuX29uR2FtZU92ZXJEYXRhLmJpbmQodGhpcykpO1xyXG5cclxuICAgICAgICB0aGlzLnNvY2tldC5lbWl0KCdpbml0Jywge1xyXG4gICAgICAgICAgICB1c2VyIDogJChcIiN1c2VyTmFtZVwiKS5odG1sKClcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcblxyXG4gICAgZ2V0Um9vbXMgOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5zb2NrZXQuZW1pdCgndXBkYXRlUm9vbXMnKTtcclxuICAgIH0sXHJcblxyXG4gICAgY3JlYXRlUm9vbSA6IGZ1bmN0aW9uIChuYW1lKSB7XHJcbiAgICAgICAgdmFyIHJvb21EYXRhID0ge1xyXG4gICAgICAgICAgICBuYW1lICA6IG5hbWUsXHJcbiAgICAgICAgICAgIGVudGVyIDogdHJ1ZVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuc29ja2V0LmVtaXQoJ2NyZWF0ZVJvb20nLCByb29tRGF0YSk7XHJcbiAgICB9LFxyXG5cclxuICAgIGVudGVyUm9vbSA6IGZ1bmN0aW9uIChyb29tSWQpIHtcclxuICAgICAgICB0aGlzLnNvY2tldC5lbWl0KCdlbnRlclJvb20nLCByb29tSWQpO1xyXG4gICAgfSxcclxuXHJcbiAgICBsZWF2ZVJvb20gOiBmdW5jdGlvbiAocm9vbUlkKSB7XHJcbiAgICAgICAgdGhpcy5zb2NrZXQuZW1pdCgnbGVhdmVSb29tJywgcm9vbUlkKTtcclxuICAgIH0sXHJcblxyXG4gICAgc3dpdGNoVGVhbSA6IGZ1bmN0aW9uIChyb29tSWQpIHtcclxuICAgICAgICB0aGlzLnNvY2tldC5lbWl0KCdzd2l0Y2hUZWFtJywgcm9vbUlkKTtcclxuICAgIH0sXHJcblxyXG4gICAgaXNIb3N0IDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmhvc3RJZCA9PT0gdGhpcy5sb2NhbENsaWVudC5pZDtcclxuICAgIH0sXHJcblxyXG4gICAgX29uQ29uZmlybUNsaWVudCA6IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgdmFyIGlkID0gZGF0YS5pZDtcclxuICAgICAgICB0aGlzLmxvY2FsQ2xpZW50ID0gbmV3IExvY2FsQ2xpZW50KGlkLCBkYXRhKTtcclxuICAgICAgICB0aGlzLmNsaWVudHNbaWRdID0gdGhpcy5sb2NhbENsaWVudDtcclxuXHJcbiAgICAgICAgdGhpcy5jb25uZWN0ZWQgPSB0cnVlO1xyXG5cclxuICAgICAgICAkKHRoaXMpLnRyaWdnZXIoXHJcbiAgICAgICAgICAgIHRoaXMuRXZlbnQuQ09OTkVDVFxyXG4gICAgICAgICk7XHJcbiAgICB9LFxyXG5cclxuICAgIF9vbkFkZE90aGVyQ2xpZW50IDogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICB2YXIgaWQgPSBkYXRhLmlkO1xyXG4gICAgICAgIHZhciBuZXdDbGllbnQgPSBuZXcgQ2xpZW50KGlkLCBkYXRhKTtcclxuXHJcbiAgICAgICAgdGhpcy5jbGllbnRzW2RhdGEuaWRdID0gbmV3Q2xpZW50O1xyXG4gICAgfSxcclxuXHJcbiAgICBfb25SZW1vdmVPdGhlckNsaWVudCA6IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgdGhpcy5jbGllbnRzW2RhdGEuaWRdID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIGRlbGV0ZSB0aGlzLmNsaWVudHNbZGF0YS5pZF07XHJcbiAgICB9LFxyXG5cclxuICAgIF9vbkxvYWRQcmV2aW91c0NsaWVudHMgOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMoZGF0YSk7XHJcblxyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB2YXIgaWQgPSBwYXJzZUludChrZXlzW2ldKTtcclxuICAgICAgICAgICAgdmFyIHVzZXJEYXRhID0gZGF0YVtpZF07XHJcblxyXG4gICAgICAgICAgICB0aGlzLl9vbkFkZE90aGVyQ2xpZW50KHVzZXJEYXRhKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIF9vblVwZGF0ZUNsaWVudCA6IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgdmFyIGlkID0gZGF0YS5pZDtcclxuICAgICAgICB2YXIgY2xpZW50ID0gdGhpcy5jbGllbnRzW2lkXTtcclxuXHJcbiAgICAgICAgY2xpZW50LmRhdGEgPSBkYXRhO1xyXG5cclxuICAgICAgICBpZiAoY2xpZW50LmdhbWVPYmplY3QpIHtcclxuICAgICAgICAgICAgY2xpZW50LmdhbWVPYmplY3QucG9zaXRpb24ueCA9IGRhdGEucG9zaXRpb24ueDtcclxuICAgICAgICAgICAgY2xpZW50LmdhbWVPYmplY3QucG9zaXRpb24ueSA9IGRhdGEucG9zaXRpb24ueTtcclxuICAgICAgICAgICAgY2xpZW50LmdhbWVPYmplY3QudmVsb2NpdHkueCA9IGRhdGEudmVsb2NpdHkueDtcclxuICAgICAgICAgICAgY2xpZW50LmdhbWVPYmplY3QudmVsb2NpdHkueSA9IGRhdGEudmVsb2NpdHkueTtcclxuICAgICAgICAgICAgY2xpZW50LmdhbWVPYmplY3QuYWNjZWxlcmF0aW9uLnggPSBkYXRhLmFjY2VsZXJhdGlvbi54O1xyXG4gICAgICAgICAgICBjbGllbnQuZ2FtZU9iamVjdC5hY2NlbGVyYXRpb24ueSA9IGRhdGEuYWNjZWxlcmF0aW9uLnk7XHJcbiAgICAgICAgICAgIGNsaWVudC5nYW1lT2JqZWN0LnNldFJvdGF0aW9uKGRhdGEucm90YXRpb24pO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX29uVXBkYXRlUm9vbXMgOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgIHRoaXMucm9vbXMgPSBkYXRhO1xyXG5cclxuICAgICAgICAkKHRoaXMpLnRyaWdnZXIoXHJcbiAgICAgICAgICAgIHRoaXMuRXZlbnQuVVBEQVRFX1JPT01TLFxyXG4gICAgICAgICAgICBkYXRhXHJcbiAgICAgICAgKTtcclxuICAgIH0sXHJcblxyXG4gICAgX29uRW50ZXJSb29tU3VjY2VzcyA6IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgJCh0aGlzKS50cmlnZ2VyKFxyXG4gICAgICAgICAgICB0aGlzLkV2ZW50LkVOVEVSX1JPT01fU1VDQ0VTUyxcclxuICAgICAgICAgICAgZGF0YVxyXG4gICAgICAgICk7XHJcbiAgICB9LFxyXG5cclxuICAgIF9vbkVudGVyUm9vbUZhaWwgOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICQodGhpcykudHJpZ2dlcihcclxuICAgICAgICAgICAgdGhpcy5FdmVudC5FTlRFUl9ST09NX0ZBSUwsXHJcbiAgICAgICAgICAgIGRhdGFcclxuICAgICAgICApO1xyXG4gICAgfSxcclxuXHJcbiAgICBfb25QaW5nIDogZnVuY3Rpb24gKHBpbmdPYmopIHtcclxuICAgICAgICBpZiAocGluZ09iaikge1xyXG4gICAgICAgICAgICB0aGlzLnNvY2tldC5lbWl0KCdyZXR1cm5QaW5nJywgcGluZ09iaik7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBfb25TZXRIb3N0IDogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICB0aGlzLmhvc3RJZCA9IGRhdGEuaWQ7XHJcbiAgICB9LFxyXG5cclxuICAgIF9vblN0YXJ0R2FtZSA6IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgJCh0aGlzKS50cmlnZ2VyKFxyXG4gICAgICAgICAgICB0aGlzLkV2ZW50LlNUQVJUX0dBTUUsXHJcbiAgICAgICAgICAgIGRhdGFcclxuICAgICAgICApO1xyXG4gICAgfSxcclxuXHJcbiAgICBfb25FbmRHYW1lIDogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICB2YXIgcm9vbSA9IHRoaXMucm9vbXNbZGF0YS5pZF07XHJcblxyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcm9vbS5wbGF5ZXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2xpZW50c1tyb29tLnBsYXllcnNbaV1dLmRhdGEucmVhZHkgPSBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMubG9jYWxDbGllbnQuZGF0YS5yZWFkeSA9IGZhbHNlO1xyXG5cclxuICAgICAgICAkKHRoaXMpLnRyaWdnZXIoXHJcbiAgICAgICAgICAgIHRoaXMuRXZlbnQuRU5EX0dBTUUsXHJcbiAgICAgICAgICAgIGRhdGFcclxuICAgICAgICApO1xyXG4gICAgfSxcclxuXHJcbiAgICBfb25QbGF5ZXJEZWF0aCA6IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgJCh0aGlzKS50cmlnZ2VyKFxyXG4gICAgICAgICAgICB0aGlzLkV2ZW50LlBMQVlFUl9ERUFUSCxcclxuICAgICAgICAgICAgZGF0YVxyXG4gICAgICAgICk7XHJcbiAgICB9LFxyXG5cclxuICAgIF9vblBsYXllclJlc3Bhd24gOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICQodGhpcykudHJpZ2dlcihcclxuICAgICAgICAgICAgdGhpcy5FdmVudC5QTEFZRVJfUkVTUEFXTixcclxuICAgICAgICAgICAgZGF0YVxyXG4gICAgICAgICk7XHJcbiAgICB9LFxyXG5cclxuICAgIF9vbkJ1bGxldCA6IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgJCh0aGlzKS50cmlnZ2VyKFxyXG4gICAgICAgICAgICB0aGlzLkV2ZW50LkJVTExFVCxcclxuICAgICAgICAgICAgZGF0YVxyXG4gICAgICAgICk7XHJcbiAgICB9LFxyXG5cclxuICAgIF9vbkNvdW50ZG93biA6IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgJCh0aGlzKS50cmlnZ2VyKFxyXG4gICAgICAgICAgICB0aGlzLkV2ZW50LkNPVU5URE9XTixcclxuICAgICAgICAgICAgZGF0YVxyXG4gICAgICAgICk7XHJcbiAgICB9LFxyXG5cclxuICAgIF9vbkNsb2NrVGljayA6IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgJCh0aGlzKS50cmlnZ2VyKFxyXG4gICAgICAgICAgICB0aGlzLkV2ZW50LkNMT0NLX1RJQ0ssXHJcbiAgICAgICAgICAgIGRhdGFcclxuICAgICAgICApO1xyXG4gICAgfSxcclxuXHJcbiAgICBfb25HYW1lU3RhcnREYXRhIDogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAkKHRoaXMpLnRyaWdnZXIoXHJcbiAgICAgICAgICAgIHRoaXMuRXZlbnQuR0FNRV9TVEFSVF9EQVRBLFxyXG4gICAgICAgICAgICBkYXRhXHJcbiAgICAgICAgKTtcclxuICAgIH0sXHJcblxyXG4gICAgX29uR2FtZU92ZXJEYXRhIDogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAkKHRoaXMpLnRyaWdnZXIoXHJcbiAgICAgICAgICAgIHRoaXMuRXZlbnQuR0FNRV9PVkVSX0RBVEEsXHJcbiAgICAgICAgICAgIGRhdGFcclxuICAgICAgICApO1xyXG4gICAgfVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBOZXR3b3JrO1xyXG5cclxudmFyIENsaWVudCA9IHJlcXVpcmUoJy4vQ2xpZW50LmpzJyk7XHJcbnZhciBMb2NhbENsaWVudCA9IHJlcXVpcmUoJy4vTG9jYWxDbGllbnQuanMnKTsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBPdmVybGF5ID0gcmVxdWlyZSgnLi9PdmVybGF5LmpzJyk7XHJcblxyXG52YXIgQ3JlYXRlUm9vbU92ZXJsYXkgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICBPdmVybGF5LmNhbGwodGhpcyk7XHJcblxyXG4gICAgdGhpcy5pbnB1dEZpZWxkID0gJChcIjxpbnB1dD5cIik7XHJcbiAgICB0aGlzLmlucHV0RmllbGQuYXR0cih7IFwicGxhY2Vob2xkZXJcIiA6IFwiUm9vbSBOYW1lXCIgfSk7XHJcbiAgICB0aGlzLmlucHV0RmllbGQuYXR0cih7IFwibWF4bGVuZ3RoXCIgICA6IDMwIH0pO1xyXG4gICAgdGhpcy5pbnB1dEZpZWxkLmFkZENsYXNzKFwiY3JlYXRlLXJvb20tb3ZlcmxheS1pbnB1dFwiKTtcclxuXHJcbiAgICB0aGlzLmJ1dHRvbkNvbnRhaW5lciA9ICQoXCI8ZGl2PlwiKTtcclxuICAgIHRoaXMuYnV0dG9uQ29udGFpbmVyLmFkZENsYXNzKFwiY3JlYXRlLXJvb20tb3ZlcmxheS1idXR0b24tY29udGFpbmVyXCIpO1xyXG5cclxuICAgIHRoaXMuY2FuY2VsQnRuID0gJChcIjxidXR0b24+XCIpO1xyXG4gICAgdGhpcy5jYW5jZWxCdG4udGV4dChcIkNhbmNlbFwiKTtcclxuICAgIHRoaXMuYnV0dG9uQ29udGFpbmVyLmFwcGVuZCh0aGlzLmNhbmNlbEJ0bik7XHJcblxyXG4gICAgdGhpcy5jcmVhdGVCdG4gPSAkKFwiPGJ1dHRvbj5cIik7XHJcbiAgICB0aGlzLmNyZWF0ZUJ0bi50ZXh0KFwiQ3JlYXRlXCIpO1xyXG4gICAgdGhpcy5idXR0b25Db250YWluZXIuYXBwZW5kKHRoaXMuY3JlYXRlQnRuKTtcclxuXHJcbiAgICB0aGlzLmRvbU9iamVjdC5hcHBlbmQodGhpcy5pbnB1dEZpZWxkKTtcclxuICAgIHRoaXMuZG9tT2JqZWN0LmFwcGVuZCh0aGlzLmJ1dHRvbkNvbnRhaW5lcik7XHJcbiAgICB0aGlzLmRvbU9iamVjdC5hZGRDbGFzcyhcImNyZWF0ZS1yb29tLW92ZXJsYXlcIik7XHJcbn07XHJcblxyXG5DcmVhdGVSb29tT3ZlcmxheS5wcm90b3R5cGUgPSBPYmplY3QuZnJlZXplKE9iamVjdC5jcmVhdGUoT3ZlcmxheS5wcm90b3R5cGUsIHtcclxuXHJcbn0pKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ3JlYXRlUm9vbU92ZXJsYXk7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgT3ZlcmxheSA9IHJlcXVpcmUoJy4vT3ZlcmxheS5qcycpO1xyXG52YXIgTmV0d29yayA9IHJlcXVpcmUoJy4uL25ldHdvcmsnKTtcclxuXHJcbnZhciBHYW1lT3Zlck92ZXJsYXkgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICBPdmVybGF5LmNhbGwodGhpcyk7XHJcblxyXG4gICAgdGhpcy5yZXN1bHRzTGFiZWwgPSAkKFwiPGRpdj5cIik7XHJcbiAgICB0aGlzLnJlc3VsdHNMYWJlbC5odG1sKFwiUmVzdWx0c1wiKTtcclxuICAgIHRoaXMucmVzdWx0c0xhYmVsLmFkZENsYXNzKFwiZ2FtZS1vdmVyLW92ZXJsYXktcmVzdWx0cy1sYWJlbFwiKTtcclxuXHJcbiAgICB0aGlzLnRlYW1BQ29udGFpbmVyID0gJChcIjxkaXY+XCIpO1xyXG4gICAgdGhpcy50ZWFtQUNvbnRhaW5lci5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXktdGVhbUEtY29udGFpbmVyXCIpO1xyXG5cclxuICAgIHRoaXMudGVhbUJDb250YWluZXIgPSAkKFwiPGRpdj5cIik7XHJcbiAgICB0aGlzLnRlYW1CQ29udGFpbmVyLmFkZENsYXNzKFwibG9iYnktb3ZlcmxheS10ZWFtQi1jb250YWluZXJcIik7XHJcblxyXG4gICAgdGhpcy5yZXR1cm5Ub0xvYmJ5QnRuID0gJChcIjxidXR0b24+XCIpO1xyXG4gICAgdGhpcy5yZXR1cm5Ub0xvYmJ5QnRuLnRleHQoXCJSZXR1cm4gdG8gTG9iYnlcIik7XHJcbiAgICB0aGlzLnJldHVyblRvTG9iYnlCdG4uYWRkQ2xhc3MoXCJnYW1lLW92ZXItb3ZlcmxheS1yZXR1cm4tdG8tbG9iYnktYnV0dG9uXCIpO1xyXG5cclxuICAgIHRoaXMuZG9tT2JqZWN0LmFwcGVuZCh0aGlzLnJlc3VsdHNMYWJlbCk7XHJcbiAgICB0aGlzLmRvbU9iamVjdC5hcHBlbmQodGhpcy5sb2FkaW5nSWNvbik7XHJcbiAgICB0aGlzLmRvbU9iamVjdC5hcHBlbmQodGhpcy50ZWFtQUNvbnRhaW5lcik7XHJcbiAgICB0aGlzLmRvbU9iamVjdC5hcHBlbmQodGhpcy50ZWFtQkNvbnRhaW5lcik7XHJcbiAgICB0aGlzLmRvbU9iamVjdC5hcHBlbmQodGhpcy5yZXR1cm5Ub0xvYmJ5QnRuKTtcclxuXHJcbiAgICB0aGlzLmRvbU9iamVjdC5hZGRDbGFzcyhcImdhbWUtb3Zlci1vdmVybGF5XCIpO1xyXG4gICAgdGhpcy5kb21PYmplY3QuYWRkQ2xhc3MoXCJmYWRlLWluXCIpO1xyXG5cclxuICAgIHRoaXMucmVuZGVyU2NvcmUoKTtcclxufTtcclxuXHJcbkdhbWVPdmVyT3ZlcmxheS5wcm90b3R5cGUgPSBPYmplY3QuZnJlZXplKE9iamVjdC5jcmVhdGUoT3ZlcmxheS5wcm90b3R5cGUsIHtcclxuICAgIHJlbmRlclNjb3JlIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKHJvb21EYXRhKSB7XHJcbiAgICAgICAgICAgIHRoaXMudGVhbUFDb250YWluZXIuaHRtbChcIlwiKTtcclxuICAgICAgICAgICAgdGhpcy50ZWFtQkNvbnRhaW5lci5odG1sKFwiXCIpO1xyXG5cclxuICAgICAgICAgICAgdmFyIHRlYW1BTGFiZWwgPSAkKFwiPHNwYW4+XCIpO1xyXG4gICAgICAgICAgICB0ZWFtQUxhYmVsLmh0bWwoXCJSb3NlIFRlYW1cIik7XHJcbiAgICAgICAgICAgIHRlYW1BTGFiZWwuYWRkQ2xhc3MoXCJnYW1lLW92ZXItb3ZlcmxheS10ZWFtLWxhYmVsXCIpO1xyXG5cclxuICAgICAgICAgICAgdmFyIHRlYW1BS2lsbExhYmVsID0gJChcIjxzcGFuPlwiKTtcclxuICAgICAgICAgICAgdGVhbUFLaWxsTGFiZWwuaHRtbChcIktcIik7XHJcbiAgICAgICAgICAgIHRlYW1BS2lsbExhYmVsLmFkZENsYXNzKFwiZ2FtZS1vdmVyLW92ZXJsYXktdGVhbS1raWxsLWxhYmVsXCIpO1xyXG5cclxuICAgICAgICAgICAgdmFyIHRlYW1BRGVhdGhMYWJlbCA9ICQoXCI8c3Bhbj5cIik7XHJcbiAgICAgICAgICAgIHRlYW1BRGVhdGhMYWJlbC5odG1sKFwiRFwiKTtcclxuICAgICAgICAgICAgdGVhbUFEZWF0aExhYmVsLmFkZENsYXNzKFwiZ2FtZS1vdmVyLW92ZXJsYXktdGVhbS1kZWF0aC1sYWJlbFwiKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMudGVhbUFDb250YWluZXIuYXBwZW5kKHRlYW1BTGFiZWwpO1xyXG4gICAgICAgICAgICB0aGlzLnRlYW1BQ29udGFpbmVyLmFwcGVuZCh0ZWFtQUtpbGxMYWJlbCk7XHJcbiAgICAgICAgICAgIHRoaXMudGVhbUFDb250YWluZXIuYXBwZW5kKHRlYW1BRGVhdGhMYWJlbCk7XHJcblxyXG4gICAgICAgICAgICB2YXIgdGVhbUJMYWJlbCA9ICQoXCI8c3Bhbj5cIik7XHJcbiAgICAgICAgICAgIHRlYW1CTGFiZWwuaHRtbChcIlNreSBUZWFtXCIpO1xyXG4gICAgICAgICAgICB0ZWFtQkxhYmVsLmFkZENsYXNzKFwiZ2FtZS1vdmVyLW92ZXJsYXktdGVhbS1sYWJlbFwiKTtcclxuXHJcbiAgICAgICAgICAgIHZhciB0ZWFtQktpbGxMYWJlbCA9ICQoXCI8c3Bhbj5cIik7XHJcbiAgICAgICAgICAgIHRlYW1CS2lsbExhYmVsLmh0bWwoXCJLXCIpO1xyXG4gICAgICAgICAgICB0ZWFtQktpbGxMYWJlbC5hZGRDbGFzcyhcImdhbWUtb3Zlci1vdmVybGF5LXRlYW0ta2lsbC1sYWJlbFwiKTtcclxuXHJcbiAgICAgICAgICAgIHZhciB0ZWFtQkRlYXRoTGFiZWwgPSAkKFwiPHNwYW4+XCIpO1xyXG4gICAgICAgICAgICB0ZWFtQkRlYXRoTGFiZWwuaHRtbChcIkRcIik7XHJcbiAgICAgICAgICAgIHRlYW1CRGVhdGhMYWJlbC5hZGRDbGFzcyhcImdhbWUtb3Zlci1vdmVybGF5LXRlYW0tZGVhdGgtbGFiZWxcIik7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnRlYW1CQ29udGFpbmVyLmFwcGVuZCh0ZWFtQkxhYmVsKTtcclxuICAgICAgICAgICAgdGhpcy50ZWFtQkNvbnRhaW5lci5hcHBlbmQodGVhbUJLaWxsTGFiZWwpO1xyXG4gICAgICAgICAgICB0aGlzLnRlYW1CQ29udGFpbmVyLmFwcGVuZCh0ZWFtQkRlYXRoTGFiZWwpO1xyXG5cclxuICAgICAgICAgICAgaWYgKCFyb29tRGF0YSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHRlYW1BTG9hZGluZ0NvbnRhaW5lciA9ICQoXCI8ZGl2PlwiKTtcclxuICAgICAgICAgICAgICAgIHRlYW1BTG9hZGluZ0NvbnRhaW5lci5odG1sKFwiTG9hZGluZy4uLlwiKTtcclxuICAgICAgICAgICAgICAgIHRlYW1BTGFiZWwuYXBwZW5kKHRlYW1BTG9hZGluZ0NvbnRhaW5lcik7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIHRlYW1CTG9hZGluZ0NvbnRhaW5lciA9ICQoXCI8ZGl2PlwiKTtcclxuICAgICAgICAgICAgICAgIHRlYW1CTG9hZGluZ0NvbnRhaW5lci5odG1sKFwiTG9hZGluZy4uLlwiKTtcclxuICAgICAgICAgICAgICAgIHRlYW1CTGFiZWwuYXBwZW5kKHRlYW1CTG9hZGluZ0NvbnRhaW5lcik7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB2YXIgdGVhbUEgPSByb29tRGF0YS50ZWFtQTtcclxuICAgICAgICAgICAgdmFyIHRlYW1CID0gcm9vbURhdGEudGVhbUI7XHJcbiAgICAgICAgICAgIHZhciBsb2NhbElkID0gTmV0d29yay5sb2NhbENsaWVudC5pZDtcclxuXHJcbiAgICAgICAgICAgIHZhciB0ZWFtQU5hbWVDb250YWluZXIgPSAkKFwiPHNwYW4+XCIpO1xyXG4gICAgICAgICAgICB2YXIgdGVhbUFLaWxsc0NvbnRhaW5lciA9ICQoXCI8c3Bhbj5cIik7XHJcbiAgICAgICAgICAgIHZhciB0ZWFtQURlYXRoc0NvbnRhaW5lciA9ICQoXCI8c3Bhbj5cIik7XHJcbiAgICAgICAgICAgIHRlYW1BTmFtZUNvbnRhaW5lci5hZGRDbGFzcyhcImdhbWUtb3Zlci1vdmVybGF5LW5hbWUtY29udGFpbmVyXCIpO1xyXG4gICAgICAgICAgICB0ZWFtQUtpbGxzQ29udGFpbmVyLmFkZENsYXNzKFwiZ2FtZS1vdmVyLW92ZXJsYXkta2lsbHMtY29udGFpbmVyXCIpO1xyXG4gICAgICAgICAgICB0ZWFtQURlYXRoc0NvbnRhaW5lci5hZGRDbGFzcyhcImdhbWUtb3Zlci1vdmVybGF5LWRlYXRocy1jb250YWluZXJcIik7XHJcblxyXG4gICAgICAgICAgICB2YXIgdGVhbUJOYW1lQ29udGFpbmVyID0gJChcIjxzcGFuPlwiKTtcclxuICAgICAgICAgICAgdmFyIHRlYW1CS2lsbHNDb250YWluZXIgPSAkKFwiPHNwYW4+XCIpO1xyXG4gICAgICAgICAgICB2YXIgdGVhbUJEZWF0aHNDb250YWluZXIgPSAkKFwiPHNwYW4+XCIpO1xyXG4gICAgICAgICAgICB0ZWFtQk5hbWVDb250YWluZXIuYWRkQ2xhc3MoXCJnYW1lLW92ZXItb3ZlcmxheS1uYW1lLWNvbnRhaW5lclwiKTtcclxuICAgICAgICAgICAgdGVhbUJLaWxsc0NvbnRhaW5lci5hZGRDbGFzcyhcImdhbWUtb3Zlci1vdmVybGF5LWtpbGxzLWNvbnRhaW5lclwiKTtcclxuICAgICAgICAgICAgdGVhbUJEZWF0aHNDb250YWluZXIuYWRkQ2xhc3MoXCJnYW1lLW92ZXItb3ZlcmxheS1kZWF0aHMtY29udGFpbmVyXCIpO1xyXG5cclxuICAgICAgICAgICAgLy8gQWRkIHRlYW0gQSBwbGF5ZXJzXHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbGFiZWw7XHJcbiAgICAgICAgICAgICAgICB2YXIga2lsbHM7XHJcbiAgICAgICAgICAgICAgICB2YXIgZGVhdGhzO1xyXG4gICAgICAgICAgICAgICAgdmFyIHBsYXllckNvbnRhaW5lciA9ICQoXCI8ZGl2PlwiKTtcclxuICAgICAgICAgICAgICAgIHZhciBraWxsc0NvbnRhaW5lciA9ICQoXCI8ZGl2PlwiKTtcclxuICAgICAgICAgICAgICAgIHZhciBkZWF0aHNDb250YWluZXIgPSAkKFwiPGRpdj5cIik7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGkgPCB0ZWFtQS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgY3VyUGxheWVyID0gdGVhbUFbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWwgPSBjdXJQbGF5ZXIudXNlcjtcclxuICAgICAgICAgICAgICAgICAgICBraWxscyA9IGN1clBsYXllci5raWxscztcclxuICAgICAgICAgICAgICAgICAgICBkZWF0aHMgPSBjdXJQbGF5ZXIuZGVhdGhzO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoY3VyUGxheWVyLmlkID09PSBsb2NhbElkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsID0gXCIqXCIgKyBsYWJlbDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsID0gXCItLS0tLS1cIjtcclxuICAgICAgICAgICAgICAgICAgICBraWxscyA9IFwiLVwiO1xyXG4gICAgICAgICAgICAgICAgICAgIGRlYXRocyA9IFwiLVwiO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHBsYXllckNvbnRhaW5lci5odG1sKGxhYmVsKTtcclxuICAgICAgICAgICAgICAgIGtpbGxzQ29udGFpbmVyLmh0bWwoa2lsbHMpO1xyXG4gICAgICAgICAgICAgICAgZGVhdGhzQ29udGFpbmVyLmh0bWwoZGVhdGhzKTtcclxuICAgICAgICAgICAgICAgIHRlYW1BTmFtZUNvbnRhaW5lci5hcHBlbmQocGxheWVyQ29udGFpbmVyKTtcclxuICAgICAgICAgICAgICAgIHRlYW1BS2lsbHNDb250YWluZXIuYXBwZW5kKGtpbGxzQ29udGFpbmVyKTtcclxuICAgICAgICAgICAgICAgIHRlYW1BRGVhdGhzQ29udGFpbmVyLmFwcGVuZChkZWF0aHNDb250YWluZXIpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLnRlYW1BQ29udGFpbmVyLmFwcGVuZCh0ZWFtQU5hbWVDb250YWluZXIpO1xyXG4gICAgICAgICAgICB0aGlzLnRlYW1BQ29udGFpbmVyLmFwcGVuZCh0ZWFtQUtpbGxzQ29udGFpbmVyKTtcclxuICAgICAgICAgICAgdGhpcy50ZWFtQUNvbnRhaW5lci5hcHBlbmQodGVhbUFEZWF0aHNDb250YWluZXIpO1xyXG5cclxuICAgICAgICAgICAgLy8gQWRkIHRlYW0gQiBwbGF5ZXJzXHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbGFiZWw7XHJcbiAgICAgICAgICAgICAgICB2YXIga2lsbHM7XHJcbiAgICAgICAgICAgICAgICB2YXIgZGVhdGhzO1xyXG4gICAgICAgICAgICAgICAgdmFyIHBsYXllckNvbnRhaW5lciA9ICQoXCI8ZGl2PlwiKTtcclxuICAgICAgICAgICAgICAgIHZhciBraWxsc0NvbnRhaW5lciA9ICQoXCI8ZGl2PlwiKTtcclxuICAgICAgICAgICAgICAgIHZhciBkZWF0aHNDb250YWluZXIgPSAkKFwiPGRpdj5cIik7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGkgPCB0ZWFtQi5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgY3VyUGxheWVyID0gdGVhbUJbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWwgPSBjdXJQbGF5ZXIudXNlcjtcclxuICAgICAgICAgICAgICAgICAgICBraWxscyA9IGN1clBsYXllci5raWxscztcclxuICAgICAgICAgICAgICAgICAgICBkZWF0aHMgPSBjdXJQbGF5ZXIuZGVhdGhzO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoY3VyUGxheWVyLmlkID09PSBsb2NhbElkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsID0gXCIqXCIgKyBsYWJlbDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsID0gXCItLS0tLS1cIjtcclxuICAgICAgICAgICAgICAgICAgICBraWxscyA9IFwiLVwiO1xyXG4gICAgICAgICAgICAgICAgICAgIGRlYXRocyA9IFwiLVwiO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHBsYXllckNvbnRhaW5lci5odG1sKGxhYmVsKTtcclxuICAgICAgICAgICAgICAgIGtpbGxzQ29udGFpbmVyLmh0bWwoa2lsbHMpO1xyXG4gICAgICAgICAgICAgICAgZGVhdGhzQ29udGFpbmVyLmh0bWwoZGVhdGhzKTtcclxuICAgICAgICAgICAgICAgIHRlYW1CTmFtZUNvbnRhaW5lci5hcHBlbmQocGxheWVyQ29udGFpbmVyKTtcclxuICAgICAgICAgICAgICAgIHRlYW1CS2lsbHNDb250YWluZXIuYXBwZW5kKGtpbGxzQ29udGFpbmVyKTtcclxuICAgICAgICAgICAgICAgIHRlYW1CRGVhdGhzQ29udGFpbmVyLmFwcGVuZChkZWF0aHNDb250YWluZXIpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLnRlYW1CQ29udGFpbmVyLmFwcGVuZCh0ZWFtQk5hbWVDb250YWluZXIpO1xyXG4gICAgICAgICAgICB0aGlzLnRlYW1CQ29udGFpbmVyLmFwcGVuZCh0ZWFtQktpbGxzQ29udGFpbmVyKTtcclxuICAgICAgICAgICAgdGhpcy50ZWFtQkNvbnRhaW5lci5hcHBlbmQodGVhbUJEZWF0aHNDb250YWluZXIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBHYW1lT3Zlck92ZXJsYXk7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgT3ZlcmxheSA9IHJlcXVpcmUoJy4vT3ZlcmxheS5qcycpO1xyXG5cclxudmFyIExvYWRpbmdPdmVybGF5ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgT3ZlcmxheS5jYWxsKHRoaXMpO1xyXG4gICAgXHJcbiAgICB0aGlzLmRvbU9iamVjdC5hZGRDbGFzcyhcImxvYWRpbmctb3ZlcmxheS1iZ1wiKTtcclxuICAgIFxyXG4gICAgdGhpcy5sb2FkaW5nSWNvbiA9ICQoXCI8ZGl2PlwiKTtcclxuICAgIHRoaXMubG9hZGluZ0ljb24uYWRkQ2xhc3MoXCJsb2FkaW5nLW92ZXJsYXlcIik7XHJcbiAgICBcclxuICAgIHRoaXMuZG9tT2JqZWN0LmFwcGVuZCh0aGlzLmxvYWRpbmdJY29uKTtcclxufTtcclxuXHJcbkxvYWRpbmdPdmVybGF5LnByb3RvdHlwZSA9IE9iamVjdC5mcmVlemUoT2JqZWN0LmNyZWF0ZShPdmVybGF5LnByb3RvdHlwZSwge1xyXG5cclxufSkpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBMb2FkaW5nT3ZlcmxheTsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBPdmVybGF5ID0gcmVxdWlyZSgnLi9PdmVybGF5LmpzJyk7XHJcbnZhciBOZXR3b3JrID0gcmVxdWlyZSgnLi4vbmV0d29yaycpO1xyXG5cclxudmFyIExvYmJ5T3ZlcmxheSA9IGZ1bmN0aW9uICgpIHtcclxuICAgIE92ZXJsYXkuY2FsbCh0aGlzKTtcclxuXHJcbiAgICAvLyBTZXQgdXAgbGVmdCBzaWRlXHJcbiAgICB0aGlzLmxlZnRDb250YWluZXIgPSAkKFwiPHNwYW4+XCIpO1xyXG4gICAgdGhpcy5sZWZ0Q29udGFpbmVyLmFkZENsYXNzKFwibG9iYnktb3ZlcmxheS1sZWZ0XCIpO1xyXG4gICAgdGhpcy5sZWZ0Q29udGFpbmVyLmFkZENsYXNzKFwibG9iYnktb3ZlcmxheS1tYXhpbWl6ZWQtc2lkZVwiKTtcclxuXHJcbiAgICB0aGlzLnJvb21CdXR0b25Db250YWluZXIgPSAkKFwiPGRpdj5cIik7XHJcbiAgICB0aGlzLnJvb21CdXR0b25Db250YWluZXIuYWRkQ2xhc3MoXCJsb2JieS1vdmVybGF5LWJ1dHRvbi1jb250YWluZXJcIik7XHJcbiAgICB0aGlzLmxlZnRDb250YWluZXIuYXBwZW5kKHRoaXMucm9vbUJ1dHRvbkNvbnRhaW5lcik7XHJcblxyXG4gICAgdGhpcy5zZWxlY3RSb29tTGFiZWwgPSAkKFwiPGRpdj5cIik7XHJcbiAgICB0aGlzLnNlbGVjdFJvb21MYWJlbC5odG1sKFwiU2VsZWN0IG9yIGNyZWF0ZSByb29tXCIpO1xyXG4gICAgdGhpcy5yb29tQnV0dG9uQ29udGFpbmVyLmFwcGVuZCh0aGlzLnNlbGVjdFJvb21MYWJlbCk7XHJcbiAgICB0aGlzLnJvb21CdXR0b25Db250YWluZXIuYXBwZW5kKCQoXCI8YnI+XCIpKTtcclxuXHJcbiAgICB0aGlzLmNyZWF0ZVJvb21CdG4gPSAkKFwiPGJ1dHRvbj5cIik7XHJcbiAgICB0aGlzLmNyZWF0ZVJvb21CdG4udGV4dChcIkNyZWF0ZSBSb29tXCIpO1xyXG4gICAgdGhpcy5yb29tQnV0dG9uQ29udGFpbmVyLmFwcGVuZCh0aGlzLmNyZWF0ZVJvb21CdG4pO1xyXG5cclxuICAgIHRoaXMucm9vbUxpc3RDb250YWluZXIgPSAkKFwiPGRpdj5cIik7XHJcbiAgICB0aGlzLnJvb21MaXN0Q29udGFpbmVyLmFkZENsYXNzKFwibG9iYnktb3ZlcmxheS1yb29tLWxpc3RcIik7XHJcbiAgICB0aGlzLnJvb21MaXN0Q29udGFpbmVyLmh0bWwoXCJMb2FkaW5nIHJvb21zLi4uXCIpO1xyXG4gICAgdGhpcy5sZWZ0Q29udGFpbmVyLmFwcGVuZCh0aGlzLnJvb21MaXN0Q29udGFpbmVyKTtcclxuXHJcbiAgICB0aGlzLmtkckNvbnRhaW5lciA9ICQoXCI8ZGl2PlwiKTtcclxuICAgIHRoaXMua2RyQ29udGFpbmVyLmFkZENsYXNzKFwibG9iYnktb3ZlcmxheS1rZHItY29udGFpbmVyXCIpO1xyXG4gICAgdGhpcy5sZWZ0Q29udGFpbmVyLmFwcGVuZCh0aGlzLmtkckNvbnRhaW5lcik7XHJcblxyXG4gICAgdGhpcy5yZW5kZXJLZHIoKTtcclxuXHJcbiAgICAvLyBTZXQgdXAgcmlnaHQgc2lkZVxyXG4gICAgdGhpcy5yaWdodENvbnRhaW5lciA9ICQoXCI8c3Bhbj5cIik7XHJcbiAgICB0aGlzLnJpZ2h0Q29udGFpbmVyLmFkZENsYXNzKFwibG9iYnktb3ZlcmxheS1yaWdodFwiKTtcclxuICAgIHRoaXMucmlnaHRDb250YWluZXIuYWRkQ2xhc3MoXCJsb2JieS1vdmVybGF5LW1pbmltaXplZC1zaWRlXCIpO1xyXG5cclxuICAgIHRoaXMuc2VsZWN0ZWRSb29tTGFiZWwgPSAkKFwiPGRpdj5cIik7XHJcbiAgICB0aGlzLnNlbGVjdGVkUm9vbUxhYmVsLmFkZENsYXNzKFwibG9iYnktb3ZlcmxheS1yb29tLWxhYmVsLWNvbnRhaW5lclwiKTtcclxuXHJcbiAgICB0aGlzLnJlbmRlclJvb21MYWJlbCgpO1xyXG4gICAgdGhpcy5yaWdodENvbnRhaW5lci5hcHBlbmQodGhpcy5zZWxlY3RlZFJvb21MYWJlbCk7XHJcblxyXG4gICAgdGhpcy5zd2l0Y2hUZWFtQnRuID0gJChcIjxidXR0b24+XCIpO1xyXG4gICAgdGhpcy5zd2l0Y2hUZWFtQnRuLnRleHQoXCJTd2l0Y2ggVGVhbXNcIik7XHJcbiAgICB0aGlzLnN3aXRjaFRlYW1CdG4uYWRkQ2xhc3MoXCJsb2JieS1vdmVybGF5LXN3aXRjaC10ZWFtLWJ0blwiKTtcclxuXHJcbiAgICB0aGlzLnRlYW1BQ29udGFpbmVyID0gJChcIjxkaXY+XCIpO1xyXG4gICAgdGhpcy50ZWFtQUNvbnRhaW5lci5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXktdGVhbUEtY29udGFpbmVyXCIpO1xyXG5cclxuICAgIHRoaXMudGVhbUJDb250YWluZXIgPSAkKFwiPGRpdj5cIik7XHJcbiAgICB0aGlzLnRlYW1CQ29udGFpbmVyLmFkZENsYXNzKFwibG9iYnktb3ZlcmxheS10ZWFtQi1jb250YWluZXJcIik7XHJcblxyXG4gICAgdGhpcy5yZW5kZXJQbGF5ZXJzKCk7XHJcblxyXG4gICAgdGhpcy5yaWdodENvbnRhaW5lci5hcHBlbmQodGhpcy50ZWFtQUNvbnRhaW5lcik7XHJcbiAgICB0aGlzLnJpZ2h0Q29udGFpbmVyLmFwcGVuZCh0aGlzLnN3aXRjaFRlYW1CdG4pO1xyXG4gICAgdGhpcy5yaWdodENvbnRhaW5lci5hcHBlbmQodGhpcy50ZWFtQkNvbnRhaW5lcik7XHJcblxyXG4gICAgdGhpcy5sZWF2ZVJvb21CdG4gPSAkKFwiPGJ1dHRvbj5cIik7XHJcbiAgICB0aGlzLmxlYXZlUm9vbUJ0bi50ZXh0KFwiTGVhdmUgUm9vbVwiKTtcclxuICAgIHRoaXMubGVhdmVSb29tQnRuLmFkZENsYXNzKFwibG9iYnktb3ZlcmxheS1sZWF2ZS1yb29tLWJ0blwiKTtcclxuICAgIHRoaXMubGVhdmVSb29tQnRuLmhpZGUoKTtcclxuICAgIHRoaXMucmlnaHRDb250YWluZXIuYXBwZW5kKHRoaXMubGVhdmVSb29tQnRuKTtcclxuXHJcbiAgICB0aGlzLnJlYWR5QnRuID0gJChcIjxidXR0b24+XCIpO1xyXG4gICAgdGhpcy5yZWFkeUJ0bi50ZXh0KFwiUmVhZHlcIik7XHJcbiAgICB0aGlzLnJlYWR5QnRuLmFkZENsYXNzKFwibG9iYnktb3ZlcmxheS1yZWFkeS1idG5cIik7XHJcbiAgICB0aGlzLnJlYWR5QnRuLmhpZGUoKTtcclxuICAgIHRoaXMucmlnaHRDb250YWluZXIuYXBwZW5kKHRoaXMucmVhZHlCdG4pO1xyXG5cclxuICAgIHRoaXMuZG9tT2JqZWN0LmFwcGVuZCh0aGlzLmxlZnRDb250YWluZXIpO1xyXG4gICAgdGhpcy5kb21PYmplY3QuYXBwZW5kKHRoaXMucmlnaHRDb250YWluZXIpO1xyXG4gICAgdGhpcy5kb21PYmplY3QuYWRkQ2xhc3MoXCJsb2JieS1vdmVybGF5XCIpO1xyXG4gICAgdGhpcy5kb21PYmplY3QuYWRkQ2xhc3MoXCJmYWRlLWluXCIpO1xyXG59O1xyXG5cclxuT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoTG9iYnlPdmVybGF5LCB7XHJcbiAgICBFdmVudCA6IHtcclxuICAgICAgICB2YWx1ZSA6IHtcclxuICAgICAgICAgICAgRU5URVJfUk9PTSA6IFwiZW50ZXJSb29tXCJcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pO1xyXG5cclxuTG9iYnlPdmVybGF5LnByb3RvdHlwZSA9IE9iamVjdC5mcmVlemUoT2JqZWN0LmNyZWF0ZShPdmVybGF5LnByb3RvdHlwZSwge1xyXG4gICAgc2hvd1Jvb21zIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKHJvb21EYXRhKSB7XHJcbiAgICAgICAgICAgIHRoaXMucm9vbUxpc3RDb250YWluZXIuaHRtbChcIlwiKTtcclxuXHJcbiAgICAgICAgICAgICQoXCIubG9iYnktb3ZlcmxheS1yb29tXCIpLm9mZihcImNsaWNrXCIpO1xyXG5cclxuICAgICAgICAgICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhyb29tRGF0YSk7XHJcblxyXG4gICAgICAgICAgICBpZiAoa2V5cy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucm9vbUxpc3RDb250YWluZXIuaHRtbChcIk5vIHJvb21zIGF2YWlsYWJsZVwiKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBjdXJSb29tID0gcm9vbURhdGFba2V5c1tpXV07XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGN1clJvb21Db250YWluZXIgPSAkKFwiPGRpdj5cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgY3VyUm9vbUNvbnRhaW5lci5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXktcm9vbVwiKTtcclxuICAgICAgICAgICAgICAgICAgICBjdXJSb29tQ29udGFpbmVyLmh0bWwoY3VyUm9vbS5uYW1lKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgJChjdXJSb29tQ29udGFpbmVyKS5vbihcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJjbGlja1wiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJSb29tLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9vbkNsaWNrUm9vbS5iaW5kKHRoaXMpXHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yb29tTGlzdENvbnRhaW5lci5hcHBlbmQoY3VyUm9vbUNvbnRhaW5lcik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIHJlbmRlclJvb20gOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICBpZiAoZGF0YSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlclJvb21MYWJlbCgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJQbGF5ZXJzKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5fb25FeGl0Um9vbSgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJSb29tTGFiZWwoZGF0YS5uYW1lKTtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyUGxheWVycyhkYXRhKTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLl9vbkVudGVyUm9vbSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICByZW5kZXJSb29tTGFiZWwgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAobGFiZWwpIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBsYWJlbCAhPT0gXCJzdHJpbmdcIiB8fCBsYWJlbCA9PT0gXCJcIikge1xyXG4gICAgICAgICAgICAgICAgbGFiZWwgPSBcIk5vIHJvb20gc2VsZWN0ZWRcIjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGFiZWwgPSBcIkN1cnJlbnQgcm9vbTogXCIgKyBsYWJlbDtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRSb29tTGFiZWwuaHRtbChsYWJlbCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICByZW5kZXJQbGF5ZXJzIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKHJvb21EYXRhKSB7XHJcbiAgICAgICAgICAgIHRoaXMudGVhbUFDb250YWluZXIuaHRtbChcIlwiKTtcclxuICAgICAgICAgICAgdGhpcy50ZWFtQkNvbnRhaW5lci5odG1sKFwiXCIpO1xyXG4gICAgICAgICAgICB0aGlzLnN3aXRjaFRlYW1CdG4uaGlkZSgpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHJvb21EYXRhICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIHZhciB0ZWFtQSA9IHJvb21EYXRhLnRlYW1BO1xyXG4gICAgICAgICAgICAgICAgdmFyIHRlYW1CID0gcm9vbURhdGEudGVhbUI7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIHRlYW1BTGFiZWwgPSAkKFwiPGRpdj5cIik7XHJcbiAgICAgICAgICAgICAgICB0ZWFtQUxhYmVsLmh0bWwoXCJSb3NlIFRlYW1cIik7XHJcbiAgICAgICAgICAgICAgICB0ZWFtQUxhYmVsLmFkZENsYXNzKFwibG9iYnktb3ZlcmxheS10ZWFtLWxhYmVsXCIpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy50ZWFtQUNvbnRhaW5lci5hcHBlbmQodGVhbUFMYWJlbCk7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIHRlYW1CTGFiZWwgPSAkKFwiPGRpdj5cIik7XHJcbiAgICAgICAgICAgICAgICB0ZWFtQkxhYmVsLmh0bWwoXCJTa3kgVGVhbVwiKTtcclxuICAgICAgICAgICAgICAgIHRlYW1CTGFiZWwuYWRkQ2xhc3MoXCJsb2JieS1vdmVybGF5LXRlYW0tbGFiZWxcIik7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnRlYW1CQ29udGFpbmVyLmFwcGVuZCh0ZWFtQkxhYmVsKTtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgbG9jYWxJZCA9IE5ldHdvcmsubG9jYWxDbGllbnQuaWQ7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQWRkIHRlYW0gQSBwbGF5ZXJzXHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDQ7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBsYWJlbDtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcGxheWVyQ29udGFpbmVyID0gJChcIjxkaXY+XCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciByZWFkeSA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoaSA8IHRlYW1BLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY3VySWQgPSB0ZWFtQVtpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGN1clBsYXllciA9IE5ldHdvcmsuY2xpZW50c1tjdXJJZF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlYWR5ID0gY3VyUGxheWVyLmRhdGEucmVhZHk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsID0gY3VyUGxheWVyLmRhdGEudXNlcjtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdXJJZCA9PT0gbG9jYWxJZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWwgPSBcIipcIiArIGxhYmVsO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghcmVhZHkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlYWR5QnRuLmh0bWwoXCJSZWFkeVwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN3aXRjaFRlYW1CdG4ucHJvcChcImRpc2FibGVkXCIsIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWFkeUJ0bi5odG1sKFwiQ2FuY2VsXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3dpdGNoVGVhbUJ0bi5wcm9wKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbCA9IFwiLS0tLS0tXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBwbGF5ZXJDb250YWluZXIuaHRtbChsYWJlbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50ZWFtQUNvbnRhaW5lci5hcHBlbmQocGxheWVyQ29udGFpbmVyKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlYWR5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciByZWFkeUNvbnRhaW5lciA9ICQoXCI8c3Bhbj5cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlYWR5Q29udGFpbmVyLmh0bWwoXCJSZWFkeVwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVhZHlDb250YWluZXIuYWRkQ2xhc3MoXCJsb2JieS1vdmVybGF5LXJlYWR5LWNvbnRhaW5lclwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGxheWVyQ29udGFpbmVyLmFwcGVuZChyZWFkeUNvbnRhaW5lcik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIEFkZCB0ZWFtIEIgcGxheWVyc1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCA0OyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbGFiZWw7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBsYXllckNvbnRhaW5lciA9ICQoXCI8ZGl2PlwiKTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcmVhZHkgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGkgPCB0ZWFtQi5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGN1cklkID0gdGVhbUJbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjdXJQbGF5ZXIgPSBOZXR3b3JrLmNsaWVudHNbY3VySWRdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZWFkeSA9IGN1clBsYXllci5kYXRhLnJlYWR5O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbCA9IGN1clBsYXllci5kYXRhLnVzZXI7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3VySWQgPT09IGxvY2FsSWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsID0gXCIqXCIgKyBsYWJlbDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXJlYWR5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWFkeUJ0bi5odG1sKFwiUmVhZHlcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zd2l0Y2hUZWFtQnRuLnByb3AoXCJkaXNhYmxlZFwiLCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVhZHlCdG4uaHRtbChcIkNhbmNlbFwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN3aXRjaFRlYW1CdG4ucHJvcChcImRpc2FibGVkXCIsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWwgPSBcIi0tLS0tLVwiO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcGxheWVyQ29udGFpbmVyLmh0bWwobGFiZWwpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGVhbUJDb250YWluZXIuYXBwZW5kKHBsYXllckNvbnRhaW5lcik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZWFkeSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcmVhZHlDb250YWluZXIgPSAkKFwiPHNwYW4+XCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZWFkeUNvbnRhaW5lci5odG1sKFwiUmVhZHlcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlYWR5Q29udGFpbmVyLmFkZENsYXNzKFwibG9iYnktb3ZlcmxheS1yZWFkeS1jb250YWluZXJcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYXllckNvbnRhaW5lci5hcHBlbmQocmVhZHlDb250YWluZXIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLnN3aXRjaFRlYW1CdG4uc2hvdygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICByZW5kZXJLZHIgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICBpZiAoIWRhdGEpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMua2RyQ29udGFpbmVyLmh0bWwoXCJLRFI6IC0tLVwiKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHZhciBraWxscyA9IGRhdGEua2lsbHM7XHJcbiAgICAgICAgICAgICAgICB2YXIgZGVhdGhzID0gZGF0YS5kZWF0aHM7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIHJhdGlvO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChkZWF0aHMgPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICByYXRpbyA9IGtpbGxzO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByYXRpbyA9IE1hdGguZmxvb3IoKGtpbGxzIC8gZGVhdGhzKSAqIDEwMCkgLyAxMDA7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5rZHJDb250YWluZXIuaHRtbChcIktEUjogXCIgKyByYXRpby50b0ZpeGVkKDIpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX29uQ2xpY2tSb29tIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgdmFyIGRhdGEgPSBlLmRhdGE7XHJcbiAgICAgICAgICAgIHZhciByb29tID0ge1xyXG4gICAgICAgICAgICAgICAgbmFtZSA6IGRhdGEubmFtZSxcclxuICAgICAgICAgICAgICAgIGlkICAgOiBkYXRhLmlkXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAkKHRoaXMpLnRyaWdnZXIoTG9iYnlPdmVybGF5LkV2ZW50LkVOVEVSX1JPT00sIHJvb20pO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX29uRXhpdFJvb20gOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMubGVhdmVSb29tQnRuLmhpZGUoKTtcclxuICAgICAgICAgICAgdGhpcy5yZWFkeUJ0bi5oaWRlKCk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmxlZnRDb250YWluZXIucmVtb3ZlQ2xhc3MoXCJsb2JieS1vdmVybGF5LW1pbmltaXplZC1zaWRlXCIpO1xyXG4gICAgICAgICAgICB0aGlzLnJpZ2h0Q29udGFpbmVyLnJlbW92ZUNsYXNzKFwibG9iYnktb3ZlcmxheS1tYXhpbWl6ZWQtc2lkZVwiKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMubGVmdENvbnRhaW5lci5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXktbWF4aW1pemVkLXNpZGVcIik7XHJcbiAgICAgICAgICAgIHRoaXMucmlnaHRDb250YWluZXIuYWRkQ2xhc3MoXCJsb2JieS1vdmVybGF5LW1pbmltaXplZC1zaWRlXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX29uRW50ZXJSb29tIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLmxlYXZlUm9vbUJ0bi5zaG93KCk7XHJcbiAgICAgICAgICAgIHRoaXMucmVhZHlCdG4uc2hvdygpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5sZWZ0Q29udGFpbmVyLnJlbW92ZUNsYXNzKFwibG9iYnktb3ZlcmxheS1tYXhpbWl6ZWQtc2lkZVwiKTtcclxuICAgICAgICAgICAgdGhpcy5yaWdodENvbnRhaW5lci5yZW1vdmVDbGFzcyhcImxvYmJ5LW92ZXJsYXktbWluaW1pemVkLXNpZGVcIik7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmxlZnRDb250YWluZXIuYWRkQ2xhc3MoXCJsb2JieS1vdmVybGF5LW1pbmltaXplZC1zaWRlXCIpO1xyXG4gICAgICAgICAgICB0aGlzLnJpZ2h0Q29udGFpbmVyLmFkZENsYXNzKFwibG9iYnktb3ZlcmxheS1tYXhpbWl6ZWQtc2lkZVwiKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKTtcclxuXHJcbk9iamVjdC5mcmVlemUoTG9iYnlPdmVybGF5KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTG9iYnlPdmVybGF5OyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIE92ZXJsYXkgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLmRvbU9iamVjdCA9ICQoXCI8ZGl2PlwiKTtcclxuICAgIHRoaXMuZG9tT2JqZWN0LmFkZENsYXNzKFwiY2FudmFzLW92ZXJsYXlcIik7XHJcbn07XHJcblxyXG5PdmVybGF5LnByb3RvdHlwZSA9IE9iamVjdC5mcmVlemUoT2JqZWN0LmNyZWF0ZShPdmVybGF5LnByb3RvdHlwZSwge1xyXG5cclxufSkpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBPdmVybGF5OyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIE92ZXJsYXkgPSByZXF1aXJlKCcuL092ZXJsYXkuanMnKTtcclxudmFyIExvYWRpbmdPdmVybGF5ID0gcmVxdWlyZSgnLi9Mb2FkaW5nT3ZlcmxheS5qcycpO1xyXG52YXIgQ3JlYXRlUm9vbU92ZXJsYXkgPSByZXF1aXJlKCcuL0NyZWF0ZVJvb21PdmVybGF5LmpzJyk7XHJcbnZhciBHYW1lT3Zlck92ZXJsYXkgPSByZXF1aXJlKCcuL0dhbWVPdmVyT3ZlcmxheS5qcycpO1xyXG52YXIgTG9iYnlPdmVybGF5ID0gcmVxdWlyZSgnLi9Mb2JieU92ZXJsYXkuanMnKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgT3ZlcmxheSA6IE92ZXJsYXksXHJcbiAgICBMb2FkaW5nT3ZlcmxheSA6IExvYWRpbmdPdmVybGF5LFxyXG4gICAgQ3JlYXRlUm9vbU92ZXJsYXkgOiBDcmVhdGVSb29tT3ZlcmxheSxcclxuICAgIEdhbWVPdmVyT3ZlcmxheSA6IEdhbWVPdmVyT3ZlcmxheSxcclxuICAgIExvYmJ5T3ZlcmxheSA6IExvYmJ5T3ZlcmxheVxyXG59OyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIHV0aWwgPSByZXF1aXJlKCcuLi91dGlsJyk7XHJcbnZhciBBc3NldHMgPSB1dGlsLkFzc2V0cztcclxudmFyIEdhbWVPYmplY3QgPSB3ZmwuY29yZS5lbnRpdGllcy5HYW1lT2JqZWN0O1xyXG52YXIgRW1pdHRlclBhcnRpY2xlID0gcmVxdWlyZSgnLi9FbWl0dGVyUGFydGljbGUuanMnKTtcclxudmFyIGdlb20gPSB3ZmwuZ2VvbTtcclxuXHJcbnZhciBFbWl0dGVyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgR2FtZU9iamVjdC5jYWxsKHRoaXMpO1xyXG5cclxuICAgIHRoaXMucGFydGljbGVzID0gW107XHJcbiAgICB0aGlzLmFuZ2xlUmFuZ2UgPSBFbWl0dGVyLkRFRkFVTFRfQU5HTEVfT0ZGU0VUX1JBTkdFO1xyXG4gICAgdGhpcy5tYXhQYXJ0aWNsZXMgPSBFbWl0dGVyLkRFRkFVTFRfTUFYX1BBUlRJQ0xFUztcclxufTtcclxuT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoRW1pdHRlciwge1xyXG4gICAgREVGQVVMVF9BTkdMRV9PRkZTRVRfUkFOR0UgOiB7XHJcbiAgICAgICAgdmFsdWUgOiAwLjY3NVxyXG4gICAgfSxcclxuXHJcbiAgICBERUZBVUxUX01BWF9QQVJUSUNMRVMgOiB7XHJcbiAgICAgICAgdmFsdWUgOiAxNTBcclxuICAgIH1cclxufSk7XHJcbkVtaXR0ZXIucHJvdG90eXBlID0gT2JqZWN0LmZyZWV6ZShPYmplY3QuY3JlYXRlKEdhbWVPYmplY3QucHJvdG90eXBlLCB7XHJcbiAgICBhZGRQYXJ0aWNsZSA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChwb3NpdGlvbiwgdmVsb2NpdHkpIHtcclxuICAgICAgICAgICAgLy8gVG9vIG1hbnkgcGFydGljbGVzLCByZW1vdmUgdGhlIGZpcnN0IG9uZVxyXG4gICAgICAgICAgICBpZiAodGhpcy5wYXJ0aWNsZXMubGVuZ3RoID4gdGhpcy5tYXhQYXJ0aWNsZXMpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGFydGljbGVzLnNwbGljZSgwLCAxKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdmFyIGFuZ2xlT2Zmc2V0ID0gTWF0aC5yYW5kb20oKSAqIHRoaXMuYW5nbGVSYW5nZSAtIHRoaXMuYW5nbGVSYW5nZSAqIDAuNTtcclxuICAgICAgICAgICAgdmFyIHBhcnRpY2xlID0gbmV3IEVtaXR0ZXJQYXJ0aWNsZSgpO1xyXG4gICAgICAgICAgICBwYXJ0aWNsZS5wb3NpdGlvbiA9IHBvc2l0aW9uLmNsb25lKCk7XHJcbiAgICAgICAgICAgIHBhcnRpY2xlLnZlbG9jaXR5ID0gdmVsb2NpdHkuY2xvbmUoKS5tdWx0aXBseSgtMSk7XHJcbiAgICAgICAgICAgIHBhcnRpY2xlLnZlbG9jaXR5LnJvdGF0ZShhbmdsZU9mZnNldCk7XHJcblxyXG4gICAgICAgICAgICAvLyBDaG9vc2UgZnJvbSAyIGNvbG9yc1xyXG4gICAgICAgICAgICB2YXIgY29sb3JJZFNlbGVjdGVkID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMik7XHJcbiAgICAgICAgICAgIHZhciByID0gMDtcclxuICAgICAgICAgICAgdmFyIGcgPSAwO1xyXG4gICAgICAgICAgICB2YXIgYiA9IDA7XHJcblxyXG4gICAgICAgICAgICBzd2l0Y2ggKGNvbG9ySWRTZWxlY3RlZCkge1xyXG4gICAgICAgICAgICBjYXNlIDA6XHJcbiAgICAgICAgICAgICAgICByID0gMjIzO1xyXG4gICAgICAgICAgICAgICAgZyA9IDQ0O1xyXG4gICAgICAgICAgICAgICAgYiA9IDU2O1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICByID0gMjQ2O1xyXG4gICAgICAgICAgICAgICAgZyA9IDExMDtcclxuICAgICAgICAgICAgICAgIGIgPSA3MztcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBwYXJ0aWNsZS5yZWQgPSByO1xyXG4gICAgICAgICAgICBwYXJ0aWNsZS5ncmVlbiA9IGc7XHJcbiAgICAgICAgICAgIHBhcnRpY2xlLmJsdWUgPSBiO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5wYXJ0aWNsZXMucHVzaChwYXJ0aWNsZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICB1cGRhdGUgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoZHQpIHtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IHRoaXMucGFydGljbGVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgY3VyID0gdGhpcy5wYXJ0aWNsZXNbaV07XHJcblxyXG4gICAgICAgICAgICAgICAgY3VyLnVwZGF0ZShkdCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gUmVtb3ZlIHRoZSBwYXJ0aWNsZSB3aGVuIGl0cyB0aW1lIGlzIHVwXHJcbiAgICAgICAgICAgICAgICBpZiAoY3VyLmFnZSA+PSBjdXIubGlmZVRpbWUpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcnRpY2xlcy5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIGRyYXcgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoY3R4KSB7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSB0aGlzLnBhcnRpY2xlcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJ0aWNsZXNbaV0uZHJhdyhjdHgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSk7XHJcbk9iamVjdC5mcmVlemUoRW1pdHRlcik7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEVtaXR0ZXI7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcclxudmFyIEFzc2V0cyA9IHV0aWwuQXNzZXRzO1xyXG52YXIgUGh5c2ljc09iamVjdCA9IHdmbC5jb3JlLmVudGl0aWVzLlBoeXNpY3NPYmplY3Q7XHJcbnZhciBnZW9tID0gd2ZsLmdlb207XHJcblxyXG52YXIgRW1pdHRlclBhcnRpY2xlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgUGh5c2ljc09iamVjdC5jYWxsKHRoaXMpO1xyXG5cclxuICAgIHRoaXMuYWdlID0gMDtcclxuICAgIHRoaXMubGlmZVRpbWUgPSBFbWl0dGVyUGFydGljbGUuREVGQVVMVF9MSUZFX1RJTUU7XHJcbiAgICB0aGlzLnJlZCA9IDA7XHJcbiAgICB0aGlzLmdyZWVuID0gMDtcclxuICAgIHRoaXMuYmx1ZSA9IDA7XHJcbiAgICB0aGlzLnN0YXJ0U2l6ZSA9IEVtaXR0ZXJQYXJ0aWNsZS5ERUZBVUxUX1NUQVJUX1NJWkU7XHJcbiAgICB0aGlzLnNpemUgPSB0aGlzLnN0YXJ0U2l6ZTtcclxuICAgIHRoaXMuZGVjYXlSYXRlID0gRW1pdHRlclBhcnRpY2xlLkRFRkFVTFRfREVDQVlfUkFURTtcclxuICAgIHRoaXMuZXhwYW5zaW9uUmF0ZSA9IEVtaXR0ZXJQYXJ0aWNsZS5ERUZBVUxUX0VYUEFOU0lPTl9SQVRFO1xyXG59O1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyhFbWl0dGVyUGFydGljbGUsIHtcclxuICAgIERFRkFVTFRfTElGRV9USU1FIDoge1xyXG4gICAgICAgIHZhbHVlIDogMTAwXHJcbiAgICB9LFxyXG5cclxuICAgIERFRkFVTFRfU1RBUlRfU0laRSA6IHtcclxuICAgICAgICB2YWx1ZSA6IDUuMFxyXG4gICAgfSxcclxuXHJcbiAgICBERUZBVUxUX0RFQ0FZX1JBVEUgOiB7XHJcbiAgICAgICAgdmFsdWUgOiAyLjM1XHJcbiAgICB9LFxyXG5cclxuICAgIERFRkFVTFRfRVhQQU5TSU9OX1JBVEUgOiB7XHJcbiAgICAgICAgdmFsdWUgOiAwLjI1XHJcbiAgICB9LFxyXG5cclxuICAgIE1BWF9BTFBIQSA6IHtcclxuICAgICAgICB2YWx1ZSA6IDFcclxuICAgIH1cclxufSk7XHJcbkVtaXR0ZXJQYXJ0aWNsZS5wcm90b3R5cGUgPSBPYmplY3QuZnJlZXplKE9iamVjdC5jcmVhdGUoUGh5c2ljc09iamVjdC5wcm90b3R5cGUsIHtcclxuICAgIHVwZGF0ZSA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChkdCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5hZ2UgPCB0aGlzLmxpZmVUaW1lKSB7XHJcbiAgICAgICAgICAgICAgICBQaHlzaWNzT2JqZWN0LnByb3RvdHlwZS51cGRhdGUuY2FsbCh0aGlzLCBkdCk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5hZ2UgKz0gdGhpcy5kZWNheVJhdGU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNpemUgKz0gdGhpcy5leHBhbnNpb25SYXRlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBkcmF3IDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGN0eCkge1xyXG4gICAgICAgICAgICB2YXIgYWxwaGEgPSBFbWl0dGVyUGFydGljbGUuTUFYX0FMUEhBICogKDEgLSB0aGlzLmFnZSAvIHRoaXMubGlmZVRpbWUpO1xyXG5cclxuICAgICAgICAgICAgY3R4LnNhdmUoKTtcclxuXHJcbiAgICAgICAgICAgIGN0eC50cmFuc2xhdGUodGhpcy5wb3NpdGlvbi54LCB0aGlzLnBvc2l0aW9uLnkpO1xyXG4gICAgICAgICAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgICAgIGN0eC5nbG9iYWxBbHBoYSAqPSBhbHBoYTtcclxuICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9IFwicmdiKFwiICsgdGhpcy5yZWQgKyBcIixcIiArIHRoaXMuZ3JlZW4gKyBcIixcIiArIHRoaXMuYmx1ZSArIFwiKVwiO1xyXG4gICAgICAgICAgICBjdHgucmVjdCgtdGhpcy5zaXplICogMC41LCAtdGhpcy5zaXplICogMC41LCB0aGlzLnNpemUsIHRoaXMuc2l6ZSk7XHJcbiAgICAgICAgICAgIGN0eC5maWxsKCk7XHJcblxyXG4gICAgICAgICAgICBjdHgucmVzdG9yZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkpO1xyXG5PYmplY3QuZnJlZXplKEVtaXR0ZXJQYXJ0aWNsZSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEVtaXR0ZXJQYXJ0aWNsZTsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBFbWl0dGVyUGFydGljbGUgPSByZXF1aXJlKCcuL0VtaXR0ZXJQYXJ0aWNsZS5qcycpO1xyXG52YXIgRW1pdHRlciA9IHJlcXVpcmUoJy4vRW1pdHRlci5qcycpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICBFbWl0dGVyICAgICAgICAgOiBFbWl0dGVyLFxyXG4gICAgRW1pdHRlclBhcnRpY2xlIDogRW1pdHRlclBhcnRpY2xlXHJcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgU2NlbmUgPSB3ZmwuZGlzcGxheS5TY2VuZTtcclxudmFyIG92ZXJsYXlzID0gcmVxdWlyZSgnLi4vb3ZlcmxheXMnKTtcclxudmFyIE5ldHdvcmsgPSByZXF1aXJlKCcuLi9uZXR3b3JrJyk7XHJcblxyXG52YXIgR2FtZU92ZXJTY2VuZSA9IGZ1bmN0aW9uIChjYW52YXMsIHJvb20pIHtcclxuICAgIFNjZW5lLmNhbGwodGhpcywgY2FudmFzKTtcclxuXHJcbiAgICB0aGlzLnJvb20gPSByb29tO1xyXG5cclxuICAgICQoTmV0d29yaykub24oTmV0d29yay5FdmVudC5HQU1FX09WRVJfREFUQSwgdGhpcy5fb25VcGRhdGVTY29yZS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICBpZiAoTmV0d29yay5pc0hvc3QoKSkge1xyXG4gICAgICAgIE5ldHdvcmsuc29ja2V0LmVtaXQoTmV0d29yay5FdmVudC5HQU1FX09WRVJfREFUQSwgcm9vbS5pZCk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5nYW1lT3Zlck92ZXJsYXkgPSBuZXcgb3ZlcmxheXMuR2FtZU92ZXJPdmVybGF5KCk7XHJcbiAgICAkKGNhbnZhcykucGFyZW50KCkuYXBwZW5kKHRoaXMuZ2FtZU92ZXJPdmVybGF5LmRvbU9iamVjdCk7XHJcblxyXG4gICAgdGhpcy5sb2FkaW5nT3ZlcmxheSA9IG5ldyBvdmVybGF5cy5Mb2FkaW5nT3ZlcmxheSgpO1xyXG4gICAgJChjYW52YXMpLnBhcmVudCgpLmFwcGVuZCh0aGlzLmxvYWRpbmdPdmVybGF5LmRvbU9iamVjdCk7XHJcblxyXG4gICAgdGhpcy5nYW1lT3Zlck92ZXJsYXkucmV0dXJuVG9Mb2JieUJ0bi5jbGljayh0aGlzLl9vblJldHVyblRvTG9iYnkuYmluZCh0aGlzKSk7XHJcbn07XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKEdhbWVPdmVyU2NlbmUsIHtcclxuICAgIEV2ZW50IDoge1xyXG4gICAgICAgIHZhbHVlIDoge1xyXG4gICAgICAgICAgICBSRVRVUk5fVE9fTE9CQlkgOiBcInJldHVyblRvTG9iYnlcIlxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSk7XHJcbkdhbWVPdmVyU2NlbmUucHJvdG90eXBlID0gT2JqZWN0LmZyZWV6ZShPYmplY3QuY3JlYXRlKFNjZW5lLnByb3RvdHlwZSwge1xyXG4gICAgZGVzdHJveSA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy5nYW1lT3Zlck92ZXJsYXkuZG9tT2JqZWN0LnJlbW92ZSgpO1xyXG4gICAgICAgICAgICB0aGlzLmxvYWRpbmdPdmVybGF5LmRvbU9iamVjdC5yZW1vdmUoKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIF9vblVwZGF0ZVNjb3JlIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGUsIGRhdGEpIHtcclxuICAgICAgICAgICAgdGhpcy5sb2FkaW5nT3ZlcmxheS5kb21PYmplY3QucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuZ2FtZU92ZXJPdmVybGF5LnJlbmRlclNjb3JlKGRhdGEpO1xyXG5cclxuICAgICAgICAgICAgdmFyIGxvY2FsUGxheWVyRGF0YTtcclxuICAgICAgICAgICAgdmFyIHRlYW1BID0gZGF0YS50ZWFtQTtcclxuICAgICAgICAgICAgdmFyIHRlYW1CID0gZGF0YS50ZWFtQjtcclxuXHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGVhbUEubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGlmICh0ZWFtQVtpXS5pZCA9PT0gTmV0d29yay5sb2NhbENsaWVudC5pZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxvY2FsUGxheWVyRGF0YSA9IHRlYW1BW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRlYW1CLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGVhbUJbaV0uaWQgPT09IE5ldHdvcmsubG9jYWxDbGllbnQuaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBsb2NhbFBsYXllckRhdGEgPSB0ZWFtQltpXTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5fc2VuZFNjb3JlVG9TZXJ2ZXIobG9jYWxQbGF5ZXJEYXRhKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIF9vblJldHVyblRvTG9iYnkgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAkKHRoaXMpLnRyaWdnZXIoXHJcbiAgICAgICAgICAgICAgICBHYW1lT3ZlclNjZW5lLkV2ZW50LlJFVFVSTl9UT19MT0JCWSxcclxuICAgICAgICAgICAgICAgIHRoaXMucm9vbVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX3NlbmRTY29yZVRvU2VydmVyIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKHBsYXllckRhdGEpIHtcclxuICAgICAgICAgICAgdmFyIGtpbGxzID0gcGxheWVyRGF0YS5raWxscztcclxuICAgICAgICAgICAgdmFyIGRlYXRocyA9IHBsYXllckRhdGEuZGVhdGhzO1xyXG4gICAgICAgICAgICB2YXIgZm9ybSA9ICQoXCIjc2NvcmVGb3JtXCIpO1xyXG4gICAgICAgICAgICB2YXIgZm9ybURhdGEgPSBmb3JtLnNlcmlhbGl6ZSgpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgZm9ybURhdGEgKz0gXCIma2lsbHM9XCIgKyBraWxscztcclxuICAgICAgICAgICAgZm9ybURhdGEgKz0gXCImZGVhdGhzPVwiICsgZGVhdGhzO1xyXG4gICAgICAgICAgICBmb3JtRGF0YSArPSBcIiZ1c2VybmFtZT1cIiArIHBsYXllckRhdGEudXNlcjtcclxuXHJcbiAgICAgICAgICAgICQuYWpheCh7XHJcbiAgICAgICAgICAgICAgICBjYWNoZTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICB0eXBlOiBcIlBPU1RcIixcclxuICAgICAgICAgICAgICAgIHVybDogXCIvc2NvcmVcIixcclxuICAgICAgICAgICAgICAgIGRhdGE6IGZvcm1EYXRhLFxyXG4gICAgICAgICAgICAgICAgZGF0YVR5cGU6IFwianNvblwiXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkpO1xyXG5PYmplY3QuZnJlZXplKEdhbWVPdmVyU2NlbmUpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBHYW1lT3ZlclNjZW5lOyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIHV0aWwgPSByZXF1aXJlKCcuLi91dGlsJyk7XHJcbnZhciBBc3NldHMgPSB1dGlsLkFzc2V0cztcclxudmFyIFNjZW5lID0gd2ZsLmRpc3BsYXkuU2NlbmU7XHJcbnZhciBOZXR3b3JrID0gcmVxdWlyZSgnLi4vbmV0d29yaycpO1xyXG52YXIgR2FtZU9iamVjdCA9IHdmbC5jb3JlLmVudGl0aWVzLkdhbWVPYmplY3Q7XHJcbnZhciBQaHlzaWNzT2JqZWN0ID0gd2ZsLmNvcmUuZW50aXRpZXMuUGh5c2ljc09iamVjdDtcclxudmFyIGVudGl0aWVzID0gcmVxdWlyZSgnLi4vZW50aXRpZXMnKTtcclxudmFyIEJ1bGxldCA9IGVudGl0aWVzLkJ1bGxldDtcclxudmFyIENsaWVudFBsYXllciA9IGVudGl0aWVzLkNsaWVudFBsYXllcjtcclxudmFyIFBsYXllciA9IGVudGl0aWVzLlBsYXllcjtcclxudmFyIGxldmVscyA9IHJlcXVpcmUoJy4uL2xldmVscycpO1xyXG52YXIgYmFja2dyb3VuZHMgPSB3ZmwuZGlzcGxheS5iYWNrZ3JvdW5kcztcclxudmFyIGdlb20gPSB3ZmwuZ2VvbTtcclxuXHJcbnZhciBHYW1lU2NlbmUgPSBmdW5jdGlvbiAoY2FudmFzLCByb29tKSB7XHJcbiAgICBTY2VuZS5jYWxsKHRoaXMsIGNhbnZhcywgcm9vbSk7XHJcblxyXG4gICAgLy8gQWRkIG90aGVyIGNsaWVudHMgdGhhdCBhcmUgYWxyZWFkeSBjb25uZWN0ZWRcclxuICAgIHZhciByb29tID0gTmV0d29yay5yb29tc1tyb29tLmlkXTtcclxuICAgIHRoaXMucGxheWVycyA9IHJvb20ucGxheWVycztcclxuXHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucGxheWVycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHZhciBpZCA9IHRoaXMucGxheWVyc1tpXTtcclxuICAgICAgICB2YXIgY2xpZW50ID0gTmV0d29yay5jbGllbnRzW2lkXTtcclxuXHJcbiAgICAgICAgaWYgKGNsaWVudCAhPT0gTmV0d29yay5sb2NhbENsaWVudCkge1xyXG4gICAgICAgICAgICB2YXIgZ2FtZU9iamVjdCA9IG5ldyBDbGllbnRQbGF5ZXIoY2xpZW50LmRhdGEudGVhbSk7XHJcbiAgICAgICAgICAgIGNsaWVudC5nYW1lT2JqZWN0ID0gZ2FtZU9iamVjdDtcclxuICAgICAgICAgICAgY2xpZW50LmdhbWVPYmplY3QuY3VzdG9tRGF0YS5jbGllbnRJZCA9IGNsaWVudC5kYXRhLmlkO1xyXG4gICAgICAgICAgICBjbGllbnQuZ2FtZU9iamVjdC5wb3NpdGlvbi54ID0gY2xpZW50LmRhdGEucG9zaXRpb24ueDtcclxuICAgICAgICAgICAgY2xpZW50LmdhbWVPYmplY3QucG9zaXRpb24ueSA9IGNsaWVudC5kYXRhLnBvc2l0aW9uLnk7XHJcbiAgICAgICAgICAgIGNsaWVudC5nYW1lT2JqZWN0LnNldFJvdGF0aW9uKGNsaWVudC5kYXRhLnJvdGF0aW9uKTtcclxuICAgICAgICAgICAgY2xpZW50LmdhbWVPYmplY3QuY3VzdG9tRGF0YS5zcGF3blBvc2l0aW9uID0gY2xpZW50LmRhdGEucG9zaXRpb247XHJcbiAgICAgICAgICAgIGNsaWVudC5nYW1lT2JqZWN0LmN1c3RvbURhdGEuc3Bhd25Sb3RhdGlvbiA9IGNsaWVudC5kYXRhLnJvdGF0aW9uO1xyXG4gICAgICAgICAgICB0aGlzLmFkZEdhbWVPYmplY3QoZ2FtZU9iamVjdCwgMSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgICQoTmV0d29yaykub24oXHJcbiAgICAgICAgTmV0d29yay5FdmVudC5CVUxMRVQsXHJcbiAgICAgICAgdGhpcy5vbkJ1bGxldC5iaW5kKHRoaXMpXHJcbiAgICApO1xyXG5cclxuICAgICQoTmV0d29yaykub24oXHJcbiAgICAgICAgTmV0d29yay5FdmVudC5DTE9DS19USUNLLFxyXG4gICAgICAgIHRoaXMub25DbG9ja1RpY2suYmluZCh0aGlzKVxyXG4gICAgKTtcclxuXHJcbiAgICAkKE5ldHdvcmspLm9uKFxyXG4gICAgICAgIE5ldHdvcmsuRXZlbnQuQ09VTlRET1dOLFxyXG4gICAgICAgIHRoaXMub25Db3VudGRvd24uYmluZCh0aGlzKVxyXG4gICAgKTtcclxuXHJcbiAgICAkKE5ldHdvcmspLm9uKFxyXG4gICAgICAgIE5ldHdvcmsuRXZlbnQuUExBWUVSX0RFQVRILFxyXG4gICAgICAgIHRoaXMub25QbGF5ZXJEZWF0aC5iaW5kKHRoaXMpXHJcbiAgICApO1xyXG5cclxuICAgICQoTmV0d29yaykub24oXHJcbiAgICAgICAgTmV0d29yay5FdmVudC5QTEFZRVJfUkVTUEFXTixcclxuICAgICAgICB0aGlzLm9uUGxheWVyUmVzcGF3bi5iaW5kKHRoaXMpXHJcbiAgICApO1xyXG5cclxuICAgIC8vIFRPRE86IERlc2lnbiBsZXZlbHMgYmV0dGVyXHJcbiAgICBsZXZlbHMuTGV2ZWwxKHRoaXMpO1xyXG5cclxuICAgIHRoaXMudGltZVJlbWFpbmluZyA9IHJvb20udGltZVJlbWFpbmluZztcclxuICAgIHRoaXMuaW5pdGlhbENvdW50ZG93biA9IHJvb20uY291bnRkb3duO1xyXG4gICAgdGhpcy5jb3VudGluZ0Rvd24gPSB0cnVlO1xyXG4gICAgdGhpcy5yZXNwYXduVGltZSA9IHJvb20ucmVzcGF3blRpbWU7XHJcbiAgICB0aGlzLnJlc3Bhd25UaW1lUmVtYWluaW5nID0gdGhpcy5yZXNwYXduVGltZTtcclxuXHJcbiAgICB0aGlzLmJnID0gbmV3IGJhY2tncm91bmRzLlBhcmFsbGF4QmFja2dyb3VuZChcclxuICAgICAgICBBc3NldHMuZ2V0KEFzc2V0cy5CR19USUxFKVxyXG4gICAgKTtcclxuXHJcbiAgICB0aGlzLnBsYXllciA9IG5ldyBQbGF5ZXIoTmV0d29yay5sb2NhbENsaWVudC5kYXRhLnRlYW0pO1xyXG4gICAgdGhpcy5wbGF5ZXIucG9zaXRpb24ueCA9IE5ldHdvcmsubG9jYWxDbGllbnQuZGF0YS5wb3NpdGlvbi54O1xyXG4gICAgdGhpcy5wbGF5ZXIucG9zaXRpb24ueSA9IE5ldHdvcmsubG9jYWxDbGllbnQuZGF0YS5wb3NpdGlvbi55O1xyXG4gICAgdGhpcy5wbGF5ZXIuc2V0Um90YXRpb24oTmV0d29yay5sb2NhbENsaWVudC5kYXRhLnJvdGF0aW9uKTtcclxuICAgIHRoaXMucGxheWVyLmN1c3RvbURhdGEuc3Bhd25Qb3NpdGlvbiA9IE5ldHdvcmsubG9jYWxDbGllbnQuZGF0YS5wb3NpdGlvbjtcclxuICAgIHRoaXMucGxheWVyLmN1c3RvbURhdGEuc3Bhd25Sb3RhdGlvbiA9IE5ldHdvcmsubG9jYWxDbGllbnQuZGF0YS5yb3RhdGlvbjtcclxuXHJcbiAgICBOZXR3b3JrLmxvY2FsQ2xpZW50LmdhbWVPYmplY3QgPSB0aGlzLnBsYXllcjtcclxuICAgIHRoaXMucGxheWVyLmN1c3RvbURhdGEuY2xpZW50SWQgPSBOZXR3b3JrLmxvY2FsQ2xpZW50LmRhdGEuaWQ7XHJcbiAgICB0aGlzLmFkZEdhbWVPYmplY3QodGhpcy5wbGF5ZXIsIDIpO1xyXG5cclxuICAgIHRoaXMuY2FtZXJhLmZvbGxvdyh0aGlzLnBsYXllcik7XHJcbiAgICB0aGlzLmNhbWVyYS5wb3NpdGlvbi54ID0gdGhpcy5wbGF5ZXIucG9zaXRpb24ueDtcclxuICAgIHRoaXMuY2FtZXJhLnBvc2l0aW9uLnkgPSB0aGlzLnBsYXllci5wb3NpdGlvbi55O1xyXG59O1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyhHYW1lU2NlbmUsIHtcclxuICAgIEZSSUNUSU9OIDoge1xyXG4gICAgICAgIHZhbHVlIDogMC45MjVcclxuICAgIH0sXHJcblxyXG4gICAgTUlOSU1BUCA6IHtcclxuICAgICAgICB2YWx1ZSA6IE9iamVjdC5mcmVlemUoe1xyXG4gICAgICAgICAgICBXSURUSCAgICAgIDogMTUwLFxyXG4gICAgICAgICAgICBIRUlHSFQgICAgIDogMTAwLFxyXG4gICAgICAgICAgICBTQ0FMRSAgICAgIDogMC4xLFxyXG4gICAgICAgICAgICBGSUxMX1NUWUxFIDogXCIjMTkyNDI3XCJcclxuICAgICAgICB9KVxyXG4gICAgfVxyXG59KTtcclxuR2FtZVNjZW5lLnByb3RvdHlwZSA9IE9iamVjdC5mcmVlemUoT2JqZWN0LmNyZWF0ZShTY2VuZS5wcm90b3R5cGUsIHtcclxuICAgIC8qKlxyXG4gICAgICogVXBkYXRlcyB0aGUgc2NlbmUgYW5kIGFsbCBnYW1lIG9iamVjdHMgaW4gaXRcclxuICAgICAqL1xyXG4gICAgdXBkYXRlIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGR0KSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmNvdW50aW5nRG93biA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pbml0aWFsQ291bnRkb3duIC09IGR0O1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChOZXR3b3JrLmlzSG9zdCgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZW5kQ291bnRkb3duKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaW5pdGlhbENvdW50ZG93biA8PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb3VudGluZ0Rvd24gPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIFNjZW5lLnByb3RvdHlwZS51cGRhdGUuY2FsbCh0aGlzLCBkdCk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy50aW1lUmVtYWluaW5nIC09IGR0O1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIE1ha2UgdGhlIGNhbWVyYSBmb2xsb3cgdGhlIGtpbGxlciBpZiB0aGUgcGxheWVyIHdhcyBraWxsZWRcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnBsYXllci5oZWFsdGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9oYW5kbGVQbGF5ZXJEZWF0aChkdCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gT3RoZXJ3aXNlLCBhbGxvdyB0aGUgcGxheWVyIHRvIG1vdmVcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5faGFuZGxlSW5wdXQoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLl9hcHBseUZyaWN0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9yZW1vdmVEZWFkR2FtZU9iamVjdHMoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoTmV0d29yay5pc0hvc3QoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VuZENsb2NrVGljaygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBzZW5kQ291bnRkb3duIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAoTmV0d29yay5jb25uZWN0ZWQpIHtcclxuICAgICAgICAgICAgICAgIE5ldHdvcmsuc29ja2V0LmVtaXQoJ2NvdW50ZG93bicsIHtcclxuICAgICAgICAgICAgICAgICAgICBjb3VudGRvd24gOiB0aGlzLmluaXRpYWxDb3VudGRvd25cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBzZW5kQ2xvY2tUaWNrIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAoTmV0d29yay5jb25uZWN0ZWQpIHtcclxuICAgICAgICAgICAgICAgIE5ldHdvcmsuc29ja2V0LmVtaXQoJ2Nsb2NrVGljaycsIHtcclxuICAgICAgICAgICAgICAgICAgICB0aW1lUmVtYWluaW5nIDogdGhpcy50aW1lUmVtYWluaW5nXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgc2VuZFBsYXllckRlYXRoIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAoTmV0d29yay5jb25uZWN0ZWQpIHtcclxuICAgICAgICAgICAgICAgIE5ldHdvcmsuc29ja2V0LmVtaXQoJ3BsYXllckRlYXRoJywge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlYWQgOiB0aGlzLnBsYXllci5jdXN0b21EYXRhLmNsaWVudElkLFxyXG4gICAgICAgICAgICAgICAgICAgIGtpbGxlciA6IHRoaXMucGxheWVyLmN1c3RvbURhdGEua2lsbGVyLmN1c3RvbURhdGEuY2xpZW50SWRcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIERyYXdzIHRoZSBzY2VuZSBhbmQgYWxsIGdhbWUgb2JqZWN0cyBpbiBpdFxyXG4gICAgICovXHJcbiAgICBkcmF3IDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGN0eCkge1xyXG4gICAgICAgICAgICBTY2VuZS5wcm90b3R5cGUuZHJhdy5jYWxsKHRoaXMsIGN0eCk7XHJcblxyXG4gICAgICAgICAgICBjdHguc2F2ZSgpO1xyXG5cclxuICAgICAgICAgICAgdmFyIGNhbWVyYVBvcyAgICA9IHRoaXMuY2FtZXJhLnBvc2l0aW9uO1xyXG4gICAgICAgICAgICB2YXIgc2NyZWVuV2lkdGggID0gY3R4LmNhbnZhcy53aWR0aDtcclxuICAgICAgICAgICAgdmFyIHNjcmVlbkhlaWdodCA9IGN0eC5jYW52YXMuaGVpZ2h0O1xyXG4gICAgICAgICAgICB2YXIgb2Zmc2V0ICAgICAgID0gbmV3IGdlb20uVmVjMihcclxuICAgICAgICAgICAgICAgIHNjcmVlbldpZHRoICAqIDAuNSxcclxuICAgICAgICAgICAgICAgIHNjcmVlbkhlaWdodCAqIDAuNVxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9IFwiI2ZmZlwiO1xyXG4gICAgICAgICAgICBjdHgudGV4dEFsaWduID0gXCJjZW50ZXJcIjtcclxuICAgICAgICAgICAgY3R4LnRleHRCYXNlbGluZSA9IFwidG9wXCI7XHJcbiAgICAgICAgICAgIGN0eC5mb250ID0gXCIxMnB4IE11bnJvXCI7XHJcblxyXG4gICAgICAgICAgICAvLyBXcml0ZSBwbGF5ZXJzJyBuYW1lcyB1bmRlciB0aGVpciBzaGlwXHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5wbGF5ZXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgY2xpZW50ID0gTmV0d29yay5jbGllbnRzW3RoaXMucGxheWVyc1tpXV07XHJcbiAgICAgICAgICAgICAgICB2YXIgb2JqT2Zmc2V0ID0gbmV3IGdlb20uVmVjMihcclxuICAgICAgICAgICAgICAgICAgICBjbGllbnQuZ2FtZU9iamVjdC5wb3NpdGlvbi54IC0gY2FtZXJhUG9zLngsXHJcbiAgICAgICAgICAgICAgICAgICAgY2xpZW50LmdhbWVPYmplY3QucG9zaXRpb24ueSAtIGNhbWVyYVBvcy55XHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBjdHguc2F2ZSgpO1xyXG4gICAgICAgICAgICAgICAgY3R4LnRyYW5zbGF0ZShvYmpPZmZzZXQueCwgb2JqT2Zmc2V0LnkgKyAyNCk7XHJcbiAgICAgICAgICAgICAgICBjdHgudHJhbnNsYXRlKG9mZnNldC54LCBvZmZzZXQueSk7XHJcbiAgICAgICAgICAgICAgICBjdHguZmlsbFRleHQoY2xpZW50LmRhdGEudXNlciwgMCwgMCk7XHJcbiAgICAgICAgICAgICAgICBjdHgucmVzdG9yZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBjdHguZm9udCA9IFwiMjRweCBNdW5yb1wiO1xyXG5cclxuICAgICAgICAgICAgLy8gU2hvdyB0aGUgcmVtYWluaW5nIGR1cmF0aW9uIG9mIHRoZSBnYW1lXHJcbiAgICAgICAgICAgIHZhciB0aW1lVGV4dDtcclxuICAgICAgICAgICAgaWYgKHRoaXMudGltZVJlbWFpbmluZyA+IDApIHtcclxuICAgICAgICAgICAgICAgIHZhciBtaW51dGVzID0gTWF0aC5mbG9vcigodGhpcy50aW1lUmVtYWluaW5nKSAvICgxMDAwICogNjApKTtcclxuICAgICAgICAgICAgICAgIHZhciBzZWNvbmRzID0gTWF0aC5mbG9vcigodGhpcy50aW1lUmVtYWluaW5nIC0gbWludXRlcyAqIDEwMDAgKiA2MCkgLyAxMDAwKTtcclxuICAgICAgICAgICAgICAgIHRpbWVUZXh0ID0gbWludXRlcyArIFwiOlwiO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChzZWNvbmRzIDwgMTApIHtcclxuICAgICAgICAgICAgICAgICAgICB0aW1lVGV4dCArPSBcIjBcIjtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB0aW1lVGV4dCArPSBzZWNvbmRzO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGltZVRleHQgPSBcIjA6MDBcIjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMudGltZVJlbWFpbmluZyA8IDEwMDAgKiAxMCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMudGltZVJlbWFpbmluZyAlIDUwMCA8IDI1MCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGN0eC5maWxsU3R5bGUgPSBcInJnYigyNTUsIDc5LCA3OSlcIjtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9IFwicmdiYSgwLCAwLCAwLCAwKVwiO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY3R4LmZvbnQgPSBcIjMwcHggTXVucm9cIjtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnRpbWVSZW1haW5pbmcgPCAxMDAwICogMzApIHtcclxuICAgICAgICAgICAgICAgIGN0eC5maWxsU3R5bGUgPSBcInJnYigyNDEsIDIwOCwgOTIpXCI7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGN0eC50cmFuc2xhdGUob2Zmc2V0LngsIDApO1xyXG4gICAgICAgICAgICBjdHguZmlsbFRleHQodGltZVRleHQsIDAsIDApO1xyXG5cclxuICAgICAgICAgICAgLy8gU2hvdyB0aGUgaW5pdGlhbCBjb3VudGRvd24gYmVmb3JlIHRoZSBnYW1lXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmluaXRpYWxDb3VudGRvd24gPiAwKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgY291bnRkb3duU2Vjb25kcyA9IE1hdGgucm91bmQodGhpcy5pbml0aWFsQ291bnRkb3duIC8gMTAwMCk7XHJcbiAgICAgICAgICAgICAgICB2YXIgY291bnRkb3duVGV4dCA9IGNvdW50ZG93blNlY29uZHMudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgICAgIGN0eC5maWxsU3R5bGUgPSBcIiNmZmZcIjtcclxuXHJcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKGNvdW50ZG93blNlY29uZHMpIHtcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICBjYXNlIDU6XHJcbiAgICAgICAgICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9IFwicmdiKDI1NSwgNzksIDc5KVwiO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgICAgIGNhc2UgNDpcclxuICAgICAgICAgICAgICAgICAgICBjdHguZmlsbFN0eWxlID0gXCJyZ2IoMjQ3LCAxNTUsIDg3KVwiO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgICAgIGNhc2UgMzpcclxuICAgICAgICAgICAgICAgICAgICBjdHguZmlsbFN0eWxlID0gXCJyZ2IoMjQxLCAyMDgsIDkyKVwiO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgICAgIGNhc2UgMjpcclxuICAgICAgICAgICAgICAgICAgICBjdHguZmlsbFN0eWxlID0gXCJyZ2IoMjE1LCAyMzUsIDk5KVwiO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgICAgICAgICBjdHguZmlsbFN0eWxlID0gXCJyZ2IoMTMyLCAyMzEsIDEwMylcIjtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgICAgICBjYXNlIDA6XHJcbiAgICAgICAgICAgICAgICAgICAgY291bnRkb3duVGV4dCA9IFwiRklHSFRcIjtcclxuICAgICAgICAgICAgICAgICAgICBjdHguZmlsbFN0eWxlID0gXCIjZmZmXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgY3R4LnRyYW5zbGF0ZSgwLCBvZmZzZXQueSk7XHJcbiAgICAgICAgICAgICAgICBjdHgudGV4dEFsaWduID0gXCJjZW50ZXJcIjtcclxuICAgICAgICAgICAgICAgIGN0eC50ZXh0QmFzZWxpbmUgPSBcIm1pZGRsZVwiO1xyXG4gICAgICAgICAgICAgICAgY3R4LmZvbnQgPSBcIjk2cHggTXVucm9cIjtcclxuICAgICAgICAgICAgICAgIGN0eC5maWxsVGV4dChjb3VudGRvd25UZXh0LCAwLCAwKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBBbHNvIGRyYXcgY29udHJvbHMhXHJcbiAgICAgICAgICAgICAgICBjdHguZmlsbFN0eWxlID0gXCIjZmZmXCI7XHJcbiAgICAgICAgICAgICAgICBjdHgudHJhbnNsYXRlKDAsIDQ4KTtcclxuICAgICAgICAgICAgICAgIGN0eC5mb250ID0gXCIyNHB4IE11bnJvXCI7XHJcbiAgICAgICAgICAgICAgICBjdHguZmlsbFRleHQoXCJVc2UgQXJyb3cgS2V5cyB0byBNb3ZlXCIsIDAsIDApO1xyXG5cclxuICAgICAgICAgICAgICAgIGN0eC50cmFuc2xhdGUoMCwgMjQpO1xyXG4gICAgICAgICAgICAgICAgY3R4LmZpbGxUZXh0KFwiUHJlc3MgWiB0byBTaG9vdFwiLCAwLCAwKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY3R4LnJlc3RvcmUoKTtcclxuXHJcbiAgICAgICAgICAgIC8vIERyYXcgSFBcclxuICAgICAgICAgICAgY3R4LnNhdmUoKTtcclxuXHJcbiAgICAgICAgICAgIGN0eC50cmFuc2xhdGUoNCwgNCk7XHJcblxyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucGxheWVyLm1heEhlYWx0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZ3JhcGhpYztcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnBsYXllci5oZWFsdGggPiBpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZ3JhcGhpYyA9IEFzc2V0cy5nZXQoQXNzZXRzLkhQX0ZVTEwpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBncmFwaGljID0gQXNzZXRzLmdldChBc3NldHMuSFBfRU1QVFkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGN0eC5kcmF3SW1hZ2UoZ3JhcGhpYywgMCwgMCk7XHJcbiAgICAgICAgICAgICAgICBjdHgudHJhbnNsYXRlKDI0LCAwKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY3R4LnJlc3RvcmUoKTtcclxuXHJcbiAgICAgICAgICAgIC8vIERyYXcgUmVzcGF3biBtZXNzYWdlIGlmIG5lY2Vzc2FyeVxyXG4gICAgICAgICAgICBpZiAodGhpcy5wbGF5ZXIuaGVhbHRoIDw9IDApIHtcclxuICAgICAgICAgICAgICAgIGN0eC5zYXZlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIHJlc3Bhd25UaW1lUmVtYWluaW5nID0gTWF0aC5yb3VuZCh0aGlzLnJlc3Bhd25UaW1lUmVtYWluaW5nIC8gMTAwMCk7XHJcbiAgICAgICAgICAgICAgICB2YXIgcmVzcGF3bk1lc3NhZ2UgPSBcIlJlc3Bhd24gaW4gXCIgKyByZXNwYXduVGltZVJlbWFpbmluZy50b1N0cmluZygpICsgXCIgc2Vjb25kc1wiO1xyXG5cclxuICAgICAgICAgICAgICAgIGN0eC50cmFuc2xhdGUob2Zmc2V0LngsIG9mZnNldC55KTtcclxuICAgICAgICAgICAgICAgIGN0eC50ZXh0QWxpZ24gPSBcImNlbnRlclwiO1xyXG4gICAgICAgICAgICAgICAgY3R4LnRleHRCYXNlbGluZSA9IFwibWlkZGxlXCI7XHJcbiAgICAgICAgICAgICAgICBjdHguZm9udCA9IFwiNDhweCBNdW5yb1wiO1xyXG4gICAgICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9IFwiI2ZmZlwiO1xyXG4gICAgICAgICAgICAgICAgY3R4LmZpbGxUZXh0KHJlc3Bhd25NZXNzYWdlLCAwLCAwKTtcclxuXHJcbiAgICAgICAgICAgICAgICBjdHgucmVzdG9yZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBvbkNvdW50ZG93biA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChlLCBkYXRhKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaW5pdGlhbENvdW50ZG93biA9IGRhdGEuY291bnRkb3duO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgb25DbG9ja1RpY2sgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoZSwgZGF0YSkge1xyXG4gICAgICAgICAgICB0aGlzLnRpbWVSZW1haW5pbmcgPSBwYXJzZUludChkYXRhLnRpbWVSZW1haW5pbmcpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgb25CdWxsZXQgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoZSwgZGF0YSkge1xyXG4gICAgICAgICAgICB2YXIgcm90YXRpb24gPSBQaHlzaWNzT2JqZWN0LnByb3RvdHlwZS5nZXREaXNwbGF5QW5nbGUoZGF0YS5yb3RhdGlvbik7XHJcbiAgICAgICAgICAgIHZhciBmb3J3YXJkID0gZ2VvbS5WZWMyLmZyb21BbmdsZShyb3RhdGlvbik7XHJcbiAgICAgICAgICAgIHZhciBwbGF5ZXIgPSBOZXR3b3JrLmNsaWVudHNbZGF0YS5wbGF5ZXJJZF0uZ2FtZU9iamVjdDtcclxuICAgICAgICAgICAgdmFyIGJ1bGxldCA9IG5ldyBCdWxsZXQoMSwgcGxheWVyKTtcclxuICAgICAgICAgICAgYnVsbGV0LnBvc2l0aW9uLnggPSBkYXRhLnBvc2l0aW9uLng7XHJcbiAgICAgICAgICAgIGJ1bGxldC5wb3NpdGlvbi55ID0gZGF0YS5wb3NpdGlvbi55O1xyXG4gICAgICAgICAgICBidWxsZXQudmVsb2NpdHkueCA9IGZvcndhcmQueDtcclxuICAgICAgICAgICAgYnVsbGV0LnZlbG9jaXR5LnkgPSBmb3J3YXJkLnk7XHJcbiAgICAgICAgICAgIGJ1bGxldC5yb3RhdGUocm90YXRpb24pO1xyXG4gICAgICAgICAgICBidWxsZXQudmVsb2NpdHkubXVsdGlwbHkoQnVsbGV0LkRFRkFVTFRfU1BFRUQpO1xyXG4gICAgICAgICAgICBidWxsZXQudmVsb2NpdHkueCArPSBkYXRhLnZlbG9jaXR5Lng7XHJcbiAgICAgICAgICAgIGJ1bGxldC52ZWxvY2l0eS55ICs9IGRhdGEudmVsb2NpdHkueTtcclxuXHJcbiAgICAgICAgICAgIGlmIChidWxsZXQudmVsb2NpdHkuZ2V0TWFnbml0dWRlU3F1YXJlZCgpIDwgQnVsbGV0LkRFRkFVTFRfU1BFRUQgKiBCdWxsZXQuREVGQVVMVF9TUEVFRCkge1xyXG4gICAgICAgICAgICAgICAgYnVsbGV0LnZlbG9jaXR5LnNldE1hZ25pdHVkZShCdWxsZXQuREVGQVVMVF9TUEVFRCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuYWRkR2FtZU9iamVjdChidWxsZXQsIDEpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgb25QbGF5ZXJEZWF0aCA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChlLCBkYXRhKSB7XHJcbiAgICAgICAgICAgIHZhciBwbGF5ZXIgPSBOZXR3b3JrLmNsaWVudHNbZGF0YS5kZWFkXS5nYW1lT2JqZWN0O1xyXG4gICAgICAgICAgICBwbGF5ZXIuc29saWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgcGxheWVyLnNldFN0YXRlKFBsYXllci5TVEFURS5FWFBMT1NJT04pO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgb25QbGF5ZXJSZXNwYXduIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGUsIGRhdGEpIHtcclxuICAgICAgICAgICAgdmFyIHBsYXllciA9IE5ldHdvcmsuY2xpZW50c1tkYXRhLnJlc3Bhd25dLmdhbWVPYmplY3Q7XHJcbiAgICAgICAgICAgIHBsYXllci5wb3NpdGlvbi54ID0gcGxheWVyLmN1c3RvbURhdGEuc3Bhd25Qb3NpdGlvbi54O1xyXG4gICAgICAgICAgICBwbGF5ZXIucG9zaXRpb24ueSA9IHBsYXllci5jdXN0b21EYXRhLnNwYXduUG9zaXRpb24ueTtcclxuICAgICAgICAgICAgcGxheWVyLnNldFJvdGF0aW9uKHBsYXllci5jdXN0b21EYXRhLnNwYXduUm90YXRpb24pO1xyXG4gICAgICAgICAgICBwbGF5ZXIuc2V0U3RhdGUoR2FtZU9iamVjdC5TVEFURS5ERUZBVUxUKTtcclxuICAgICAgICAgICAgcGxheWVyLmhlYWx0aCA9IHBsYXllci5tYXhIZWFsdGg7XHJcbiAgICAgICAgICAgIHBsYXllci5zb2xpZCA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICAvLyBBY3RpdmF0ZSBcInNwYXduIHNoaWVsZFwiXHJcbiAgICAgICAgICAgIHBsYXllci50YWtlRGFtYWdlKDApO1xyXG5cclxuICAgICAgICAgICAgLy8gSWYgdGhpcyBjbGllbnQncyBwbGF5ZXIgaXMgcmVzcGF3bmluZywgdGhlbiBtYWtlIHRoZSBjYW1lcmFcclxuICAgICAgICAgICAgLy8gc3RhcnQgZm9sbG93aW5nIGl0IGFnYWluXHJcbiAgICAgICAgICAgIGlmIChwbGF5ZXIgPT09IHRoaXMucGxheWVyKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNhbWVyYS5mb2xsb3cocGxheWVyKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX2hhbmRsZUlucHV0IDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgcGxheWVyICAgICAgID0gdGhpcy5wbGF5ZXI7XHJcbiAgICAgICAgICAgIHZhciBrZXlib2FyZCAgICAgPSB0aGlzLmtleWJvYXJkO1xyXG4gICAgICAgICAgICB2YXIgbGVmdFByZXNzZWQgID0ga2V5Ym9hcmQuaXNQcmVzc2VkKGtleWJvYXJkLkxFRlQpO1xyXG4gICAgICAgICAgICB2YXIgcmlnaHRQcmVzc2VkID0ga2V5Ym9hcmQuaXNQcmVzc2VkKGtleWJvYXJkLlJJR0hUKTtcclxuICAgICAgICAgICAgdmFyIHVwUHJlc3NlZCAgICA9IGtleWJvYXJkLmlzUHJlc3NlZChrZXlib2FyZC5VUCk7XHJcbiAgICAgICAgICAgIHZhciBkb3duUHJlc3NlZCAgPSBrZXlib2FyZC5pc1ByZXNzZWQoa2V5Ym9hcmQuRE9XTik7XHJcbiAgICAgICAgICAgIHZhciBzaG9vdGluZyAgICAgPSBrZXlib2FyZC5pc1ByZXNzZWQoa2V5Ym9hcmQuWik7XHJcblxyXG4gICAgICAgICAgICAvLyBMZWZ0LyBSaWdodCBLZXkgLS0gUGxheWVyIHR1cm5zXHJcbiAgICAgICAgICAgIGlmIChsZWZ0UHJlc3NlZCB8fCByaWdodFByZXNzZWQpIHtcclxuICAgICAgICAgICAgICAgIHZhciByb3RhdGlvbiA9IDA7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGxlZnRQcmVzc2VkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcm90YXRpb24gLT0gUGxheWVyLlRVUk5fU1BFRUQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHJpZ2h0UHJlc3NlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJvdGF0aW9uICs9IFBsYXllci5UVVJOX1NQRUVEO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHBsYXllci5yb3RhdGUocm90YXRpb24pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBVcCBLZXkgLS0gUGxheWVyIGdvZXMgZm9yd2FyZFxyXG4gICAgICAgICAgICBpZiAodXBQcmVzc2VkKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbW92ZW1lbnRGb3JjZSA9IGdlb20uVmVjMi5mcm9tQW5nbGUocGxheWVyLmdldFJvdGF0aW9uKCkpO1xyXG4gICAgICAgICAgICAgICAgbW92ZW1lbnRGb3JjZS5tdWx0aXBseShcclxuICAgICAgICAgICAgICAgICAgICBQbGF5ZXIuQk9PU1RfQUNDRUxFUkFUSU9OICogcGxheWVyLm1hc3NcclxuICAgICAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAgICAgcGxheWVyLmFkZEZvcmNlKG1vdmVtZW50Rm9yY2UpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBEb3duIEtleSAtLSBBcHBseSBicmFrZXMgdG8gcGxheWVyXHJcbiAgICAgICAgICAgIGlmIChkb3duUHJlc3NlZCkge1xyXG4gICAgICAgICAgICAgICAgcGxheWVyLnZlbG9jaXR5Lm11bHRpcGx5KFBsYXllci5CUkFLRV9SQVRFKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHNob290aW5nKSB7XHJcbiAgICAgICAgICAgICAgICBwbGF5ZXIuc2hvb3QoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX2hhbmRsZVBsYXllckRlYXRoIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGR0KSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnBsYXllci5jdXN0b21EYXRhLmtpbGxlcikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZW5kUGxheWVyRGVhdGgoKTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmNhbWVyYS5mb2xsb3codGhpcy5wbGF5ZXIuY3VzdG9tRGF0YS5raWxsZXIpO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMucGxheWVyLmN1c3RvbURhdGEua2lsbGVyID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbGF5ZXIuc2V0U3RhdGUoUGxheWVyLlNUQVRFLkVYUExPU0lPTik7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5yZXNwYXduVGltZVJlbWFpbmluZyA9IHRoaXMucmVzcGF3blRpbWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMucmVzcGF3blRpbWVSZW1haW5pbmcgLT0gZHQ7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBfYXBwbHlGcmljdGlvbiA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIGdhbWVPYmplY3RzID0gdGhpcy5nZXRHYW1lT2JqZWN0cygpO1xyXG5cclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBnYW1lT2JqZWN0cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgdmFyIG9iaiA9IGdhbWVPYmplY3RzW2ldO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFvYmouY3VzdG9tRGF0YS5pZ25vcmVGcmljdGlvbikge1xyXG4gICAgICAgICAgICAgICAgICAgIG9iai5hY2NlbGVyYXRpb24ubXVsdGlwbHkoR2FtZVNjZW5lLkZSSUNUSU9OKTtcclxuICAgICAgICAgICAgICAgICAgICBvYmoudmVsb2NpdHkubXVsdGlwbHkoR2FtZVNjZW5lLkZSSUNUSU9OKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX3JlbW92ZURlYWRHYW1lT2JqZWN0cyA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIGdhbWVPYmplY3RzID0gdGhpcy5nZXRHYW1lT2JqZWN0cygpO1xyXG5cclxuICAgICAgICAgICAgLy8gR28gdGhyb3VnaCBhbGwgZ2FtZSBvYmplY3RzIGFuZCByZW1vdmUgYW55IHRoYXQgaGF2ZSBiZWVuXHJcbiAgICAgICAgICAgIC8vIGZsYWdnZWQgZm9yIHJlbW92YWxcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IGdhbWVPYmplY3RzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgb2JqID0gZ2FtZU9iamVjdHNbaV07XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKG9iai5jdXN0b21EYXRhLnJlbW92ZWQgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZUdhbWVPYmplY3Qob2JqKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBHYW1lU2NlbmU7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgU2NlbmUgPSB3ZmwuZGlzcGxheS5TY2VuZTtcclxudmFyIG92ZXJsYXlzID0gcmVxdWlyZSgnLi4vb3ZlcmxheXMnKTtcclxudmFyIE5ldHdvcmsgPSByZXF1aXJlKCcuLi9uZXR3b3JrJyk7XHJcblxyXG52YXIgR2FtZVN0YXJ0U2NlbmUgPSBmdW5jdGlvbiAoY2FudmFzLCByb29tKSB7XHJcbiAgICBTY2VuZS5jYWxsKHRoaXMsIGNhbnZhcyk7XHJcblxyXG4gICAgdGhpcy5yb29tID0gcm9vbTtcclxuXHJcbiAgICAkKE5ldHdvcmspLm9uKE5ldHdvcmsuRXZlbnQuR0FNRV9TVEFSVF9EQVRBLCB0aGlzLl9vbkdldFN0YXJ0RGF0YS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICBpZiAoTmV0d29yay5pc0hvc3QoKSkge1xyXG4gICAgICAgIE5ldHdvcmsuc29ja2V0LmVtaXQoTmV0d29yay5FdmVudC5HQU1FX1NUQVJUX0RBVEEsIHJvb20uaWQpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMubG9hZGluZ092ZXJsYXkgPSBuZXcgb3ZlcmxheXMuTG9hZGluZ092ZXJsYXkoKTtcclxuICAgICQoY2FudmFzKS5wYXJlbnQoKS5hcHBlbmQodGhpcy5sb2FkaW5nT3ZlcmxheS5kb21PYmplY3QpO1xyXG59O1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyhHYW1lU3RhcnRTY2VuZSwge1xyXG4gICAgRXZlbnQgOiB7XHJcbiAgICAgICAgdmFsdWUgOiB7XHJcbiAgICAgICAgICAgIFNUQVJUX0dBTUUgOiBcInN0YXJ0R2FtZVwiXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KTtcclxuR2FtZVN0YXJ0U2NlbmUucHJvdG90eXBlID0gT2JqZWN0LmZyZWV6ZShPYmplY3QuY3JlYXRlKFNjZW5lLnByb3RvdHlwZSwge1xyXG4gICAgZGVzdHJveSA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy5sb2FkaW5nT3ZlcmxheS5kb21PYmplY3QucmVtb3ZlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBfb25HZXRTdGFydERhdGEgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoZSwgZGF0YSkge1xyXG4gICAgICAgICAgICB2YXIgdGVhbUEgPSBkYXRhLnRlYW1BO1xyXG4gICAgICAgICAgICB2YXIgdGVhbUIgPSBkYXRhLnRlYW1CO1xyXG5cclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0ZWFtQS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgdmFyIHJlZiA9IHRlYW1BW2ldO1xyXG4gICAgICAgICAgICAgICAgTmV0d29yay5jbGllbnRzW3JlZi5pZF0uZGF0YSA9IHJlZjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0ZWFtQi5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgdmFyIHJlZiA9IHRlYW1CW2ldO1xyXG4gICAgICAgICAgICAgICAgTmV0d29yay5jbGllbnRzW3JlZi5pZF0uZGF0YSA9IHJlZjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgJCh0aGlzKS50cmlnZ2VyKFxyXG4gICAgICAgICAgICAgICAgR2FtZVN0YXJ0U2NlbmUuRXZlbnQuU1RBUlRfR0FNRSxcclxuICAgICAgICAgICAgICAgIHRoaXMucm9vbVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkpO1xyXG5PYmplY3QuZnJlZXplKEdhbWVTdGFydFNjZW5lKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gR2FtZVN0YXJ0U2NlbmU7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgU2NlbmUgPSB3ZmwuZGlzcGxheS5TY2VuZTtcclxudmFyIG92ZXJsYXlzID0gcmVxdWlyZSgnLi4vb3ZlcmxheXMnKTtcclxuXHJcbnZhciBMb2FkaW5nU2NlbmUgPSBmdW5jdGlvbiAoY2FudmFzKSB7XHJcbiAgICBTY2VuZS5jYWxsKHRoaXMsIGNhbnZhcyk7XHJcbiAgICBcclxuICAgIHRoaXMubG9hZGluZ092ZXJsYXkgPSBuZXcgb3ZlcmxheXMuTG9hZGluZ092ZXJsYXkoKTtcclxuICAgICQoY2FudmFzKS5wYXJlbnQoKS5hcHBlbmQodGhpcy5sb2FkaW5nT3ZlcmxheS5kb21PYmplY3QpO1xyXG59O1xyXG5Mb2FkaW5nU2NlbmUucHJvdG90eXBlID0gT2JqZWN0LmZyZWV6ZShPYmplY3QuY3JlYXRlKFNjZW5lLnByb3RvdHlwZSwge1xyXG4gICAgZGVzdHJveSA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy5sb2FkaW5nT3ZlcmxheS5kb21PYmplY3QucmVtb3ZlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IExvYWRpbmdTY2VuZTsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBTY2VuZSA9IHdmbC5kaXNwbGF5LlNjZW5lO1xyXG52YXIgb3ZlcmxheXMgPSByZXF1aXJlKCcuLi9vdmVybGF5cycpO1xyXG52YXIgTmV0d29yayA9IHJlcXVpcmUoJy4uL25ldHdvcmsnKTtcclxuXHJcbnZhciBMb2JieVNjZW5lID0gZnVuY3Rpb24gKGNhbnZhcykge1xyXG4gICAgU2NlbmUuY2FsbCh0aGlzLCBjYW52YXMpO1xyXG5cclxuICAgIHRoaXMuY3VyUm9vbUlkID0gdW5kZWZpbmVkO1xyXG5cclxuICAgIHRoaXMubG9iYnlPdmVybGF5ID0gbmV3IG92ZXJsYXlzLkxvYmJ5T3ZlcmxheSgpO1xyXG4gICAgdGhpcy5jcmVhdGVSb29tT3ZlcmxheSA9IG5ldyBvdmVybGF5cy5DcmVhdGVSb29tT3ZlcmxheSgpO1xyXG4gICAgJChjYW52YXMpLnBhcmVudCgpLmFwcGVuZCh0aGlzLmxvYmJ5T3ZlcmxheS5kb21PYmplY3QpO1xyXG4gICAgJChjYW52YXMpLnBhcmVudCgpLmFwcGVuZCh0aGlzLmNyZWF0ZVJvb21PdmVybGF5LmRvbU9iamVjdCk7XHJcblxyXG4gICAgdGhpcy5jcmVhdGVSb29tT3ZlcmxheS5kb21PYmplY3QuaGlkZSgpO1xyXG5cclxuICAgIHRoaXMubG9iYnlPdmVybGF5LmxlYXZlUm9vbUJ0bi5jbGljayh0aGlzLl9vbkxlYXZlUm9vbUJ1dHRvbkNsaWNrLmJpbmQodGhpcykpO1xyXG4gICAgdGhpcy5sb2JieU92ZXJsYXkucmVhZHlCdG4uY2xpY2sodGhpcy5fb25SZWFkeUJ1dHRvbkNsaWNrLmJpbmQodGhpcykpO1xyXG4gICAgdGhpcy5sb2JieU92ZXJsYXkuc3dpdGNoVGVhbUJ0bi5jbGljayh0aGlzLl9vblN3aXRjaFRlYW1CdXR0b25DbGljay5iaW5kKHRoaXMpKTtcclxuICAgIHRoaXMubG9iYnlPdmVybGF5LmNyZWF0ZVJvb21CdG4uY2xpY2sodGhpcy5fb25DcmVhdGVSb29tQnV0dG9uQ2xpY2suYmluZCh0aGlzKSk7XHJcblxyXG4gICAgdGhpcy5jcmVhdGVSb29tT3ZlcmxheS5jYW5jZWxCdG4uY2xpY2sodGhpcy5fb25DcmVhdGVSb29tQ2FuY2VsLmJpbmQodGhpcykpO1xyXG4gICAgdGhpcy5jcmVhdGVSb29tT3ZlcmxheS5jcmVhdGVCdG4uY2xpY2sodGhpcy5fb25DcmVhdGVSb29tLmJpbmQodGhpcykpO1xyXG5cclxuICAgICQodGhpcy5sb2JieU92ZXJsYXkpLm9uKG92ZXJsYXlzLkxvYmJ5T3ZlcmxheS5FdmVudC5FTlRFUl9ST09NLCB0aGlzLl9vbkVudGVyUm9vbUF0dGVtcHQuYmluZCh0aGlzKSk7XHJcblxyXG4gICAgJChOZXR3b3JrKS5vbihOZXR3b3JrLkV2ZW50LlVQREFURV9ST09NUywgdGhpcy5fb25VcGRhdGVSb29tTGlzdC5iaW5kKHRoaXMpKTtcclxuICAgICQoTmV0d29yaykub24oTmV0d29yay5FdmVudC5FTlRFUl9ST09NX1NVQ0NFU1MsIHRoaXMuX29uRW50ZXJSb29tU3VjY2Vzcy5iaW5kKHRoaXMpKTtcclxuICAgICQoTmV0d29yaykub24oTmV0d29yay5FdmVudC5FTlRFUl9ST09NX0ZBSUwsIHRoaXMuX29uRW50ZXJSb29tRmFpbC5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICB0aGlzLnJvb21VcGRhdGVJbnRlcnZhbCA9XHJcbiAgICAgICAgc2V0SW50ZXJ2YWwodGhpcy51cGRhdGVSb29tTGlzdC5iaW5kKHRoaXMpLCBMb2JieVNjZW5lLlJPT01fVVBEQVRFX0ZSRVFVRU5DWSk7XHJcblxyXG4gICAgdGhpcy51cGRhdGVSb29tTGlzdCgpO1xyXG5cclxuICAgIHRoaXMuX3JlcXVlc3RLZHIoKTtcclxufTtcclxuXHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKExvYmJ5U2NlbmUsIHtcclxuICAgIFJPT01fVVBEQVRFX0ZSRVFVRU5DWSA6IHtcclxuICAgICAgICB2YWx1ZSA6IDUwMDBcclxuICAgIH0sXHJcblxyXG4gICAgRXZlbnQgOiB7XHJcbiAgICAgICAgdmFsdWUgOiB7XHJcbiAgICAgICAgICAgIFRPR0dMRV9SRUFEWSA6IFwidG9nZ2xlUmVhZHlcIlxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSk7XHJcblxyXG5Mb2JieVNjZW5lLnByb3RvdHlwZSA9IE9iamVjdC5mcmVlemUoT2JqZWN0LmNyZWF0ZShTY2VuZS5wcm90b3R5cGUsIHtcclxuICAgIGRlc3Ryb3kgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMubG9iYnlPdmVybGF5LmRvbU9iamVjdC5yZW1vdmUoKTtcclxuICAgICAgICAgICAgdGhpcy5jcmVhdGVSb29tT3ZlcmxheS5kb21PYmplY3QucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlUm9vbU92ZXJsYXkuaW5wdXRGaWVsZC5vZmYoXCJrZXlwcmVzc1wiKTtcclxuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGlzLnJvb21VcGRhdGVJbnRlcnZhbCk7XHJcbiAgICAgICAgICAgICQoTmV0d29yaykub2ZmKE5ldHdvcmsuRXZlbnQuVVBEQVRFX1JPT01TKTtcclxuICAgICAgICAgICAgJChOZXR3b3JrKS5vZmYoTmV0d29yay5FdmVudC5FTlRFUl9ST09NX1NVQ0NFU1MpO1xyXG4gICAgICAgICAgICAkKE5ldHdvcmspLm9mZihOZXR3b3JrLkV2ZW50LkVOVEVSX1JPT01fRkFJTCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICB1cGRhdGVSb29tTGlzdCA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgTmV0d29yay5nZXRSb29tcygpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX3JlcXVlc3RLZHIgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICQuYWpheCh7XHJcbiAgICAgICAgICAgICAgICBjYWNoZTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICB0eXBlOiBcIkdFVFwiLFxyXG4gICAgICAgICAgICAgICAgdXJsOiBcIi9nZXRTY29yZVwiLFxyXG4gICAgICAgICAgICAgICAgZGF0YVR5cGU6IFwianNvblwiLFxyXG4gICAgICAgICAgICAgICAgc3VjY2VzczogdGhpcy5fb25HZXRLZHIuYmluZCh0aGlzKVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIF9vbkdldEtkciA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChyZXN1bHQsIHN0YXR1cywgeGhyKSB7XHJcbiAgICAgICAgICAgIHRoaXMubG9iYnlPdmVybGF5LnJlbmRlcktkcihyZXN1bHQpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX29uTGVhdmVSb29tQnV0dG9uQ2xpY2sgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICBOZXR3b3JrLmxlYXZlUm9vbSh0aGlzLmN1clJvb21JZCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3VyUm9vbUlkID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX29uUmVhZHlCdXR0b25DbGljayA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIHZhciBjbGllbnRXaWxsQmVSZWFkeSA9ICFOZXR3b3JrLmxvY2FsQ2xpZW50LmRhdGEucmVhZHk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmxvYmJ5T3ZlcmxheS5zd2l0Y2hUZWFtQnRuLnByb3AoXCJkaXNhYmxlZFwiLCBjbGllbnRXaWxsQmVSZWFkeSk7XHJcblxyXG4gICAgICAgICAgICBOZXR3b3JrLnNvY2tldC5lbWl0KCd1cGRhdGVSZWFkeScsIHtcclxuICAgICAgICAgICAgICAgIHJlYWR5IDogY2xpZW50V2lsbEJlUmVhZHlcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBfb25DcmVhdGVSb29tQnV0dG9uQ2xpY2sgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZVJvb21PdmVybGF5LmlucHV0RmllbGQub2ZmKFwia2V5cHJlc3NcIik7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZVJvb21PdmVybGF5LmlucHV0RmllbGQudmFsKFwiXCIpO1xyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZVJvb21PdmVybGF5LmRvbU9iamVjdC5yZW1vdmVDbGFzcyhcImZhZGUtaW5cIik7XHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlUm9vbU92ZXJsYXkuZG9tT2JqZWN0LnNob3coKTtcclxuICAgICAgICAgICAgdGhpcy5jcmVhdGVSb29tT3ZlcmxheS5kb21PYmplY3QuYWRkQ2xhc3MoXCJmYWRlLWluXCIpO1xyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZVJvb21PdmVybGF5LmlucHV0RmllbGQuZm9jdXMoKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlUm9vbU92ZXJsYXkuaW5wdXRGaWVsZC5vbihcImtleXByZXNzXCIsIHRoaXMuX29uQ3JlYXRlUm9vbUtleVByZXNzLmJpbmQodGhpcykpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX29uQ3JlYXRlUm9vbUtleVByZXNzIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgaWYgKGUua2V5Q29kZSA9PT0gMTMpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX29uQ3JlYXRlUm9vbSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBfb25DcmVhdGVSb29tQ2FuY2VsIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgdGhpcy5jcmVhdGVSb29tT3ZlcmxheS5kb21PYmplY3QuaGlkZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX29uQ3JlYXRlUm9vbSA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIHZhciBuYW1lID0gdGhpcy5jcmVhdGVSb29tT3ZlcmxheS5pbnB1dEZpZWxkLnZhbCgpLnRyaW0oKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChuYW1lICE9PSBcIlwiKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZVJvb21PdmVybGF5LmRvbU9iamVjdC5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICBOZXR3b3JrLmNyZWF0ZVJvb20obmFtZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIF9vblN3aXRjaFRlYW1CdXR0b25DbGljayA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIE5ldHdvcmsuc3dpdGNoVGVhbSh0aGlzLmN1clJvb21JZCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBfb25VcGRhdGVSb29tTGlzdCA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChlLCBkYXRhKSB7XHJcbiAgICAgICAgICAgIHRoaXMubG9iYnlPdmVybGF5LnNob3dSb29tcyhkYXRhKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmN1clJvb21JZCAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxvYmJ5T3ZlcmxheS5yZW5kZXJSb29tKGRhdGFbdGhpcy5jdXJSb29tSWRdKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubG9iYnlPdmVybGF5LnJlbmRlclJvb20oKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX29uRW50ZXJSb29tQXR0ZW1wdCA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChlLCBkYXRhKSB7XHJcbiAgICAgICAgICAgIE5ldHdvcmsuZW50ZXJSb29tKGRhdGEuaWQpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX29uRW50ZXJSb29tU3VjY2VzcyA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChlLCBkYXRhKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VyUm9vbUlkID0gZGF0YS5pZDtcclxuICAgICAgICAgICAgdGhpcy5sb2JieU92ZXJsYXkucmVuZGVyUm9vbShkYXRhKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIF9vbkVudGVyUm9vbUZhaWwgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoZSwgZGF0YSkge1xyXG4gICAgICAgICAgICBhbGVydChkYXRhLm1zZyk7XHJcbiAgICAgICAgICAgIHRoaXMuY3VyUm9vbUlkID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICB0aGlzLmxvYmJ5T3ZlcmxheS5yZW5kZXJSb29tKHVuZGVmaW5lZCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSk7XHJcblxyXG5PYmplY3QuZnJlZXplKExvYmJ5U2NlbmUpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBMb2JieVNjZW5lOyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIExvYWRpbmdTY2VuZSA9IHJlcXVpcmUoJy4vTG9hZGluZ1NjZW5lLmpzJyk7XHJcbnZhciBMb2JieVNjZW5lID0gcmVxdWlyZSgnLi9Mb2JieVNjZW5lLmpzJyk7XHJcbnZhciBHYW1lU3RhcnRTY2VuZSA9IHJlcXVpcmUoJy4vR2FtZVN0YXJ0U2NlbmUuanMnKTtcclxudmFyIEdhbWVPdmVyU2NlbmUgPSByZXF1aXJlKCcuL0dhbWVPdmVyU2NlbmUuanMnKTtcclxudmFyIEdhbWVTY2VuZSA9IHJlcXVpcmUoJy4vR2FtZVNjZW5lLmpzJyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIExvYWRpbmdTY2VuZSAgIDogTG9hZGluZ1NjZW5lLFxyXG4gICAgTG9iYnlTY2VuZSAgICAgOiBMb2JieVNjZW5lLFxyXG4gICAgR2FtZVN0YXJ0U2NlbmUgOiBHYW1lU3RhcnRTY2VuZSxcclxuICAgIEdhbWVPdmVyU2NlbmUgIDogR2FtZU92ZXJTY2VuZSxcclxuICAgIEdhbWVTY2VuZSAgICAgIDogR2FtZVNjZW5lXHJcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIEJHX1RJTEUgICAgICAgOiBcIi4vYXNzZXRzL2ltZy9CRy10aWxlMS5wbmdcIixcclxuICAgIEJMT0NLX0ZVTEwgICAgOiBcIi4vYXNzZXRzL2ltZy9CbG9ja0Z1bGwucG5nXCIsXHJcbiAgICBCTE9DS19IQUxGICAgIDogXCIuL2Fzc2V0cy9pbWcvQmxvY2tIYWxmLnBuZ1wiLFxyXG4gICAgU0hJUF8xICAgICAgICA6IFwiLi9hc3NldHMvaW1nL090aGVyU2hpcC5wbmdcIixcclxuICAgIFNISVBfMiAgICAgICAgOiBcIi4vYXNzZXRzL2ltZy9TaGlwLnBuZ1wiLFxyXG4gICAgV0VBS19CVUxMRVRfMSA6IFwiLi9hc3NldHMvaW1nL0J1bGxldFdlYWtfYS5wbmdcIixcclxuICAgIFdFQUtfQlVMTEVUXzIgOiBcIi4vYXNzZXRzL2ltZy9CdWxsZXRXZWFrX2IucG5nXCIsXHJcbiAgICBXRUFLX0JVTExFVF8zIDogXCIuL2Fzc2V0cy9pbWcvQnVsbGV0V2Vha19jLnBuZ1wiLFxyXG4gICAgV0VBS19CVUxMRVRfNCA6IFwiLi9hc3NldHMvaW1nL0J1bGxldFdlYWtfZC5wbmdcIixcclxuICAgIEVYUExPU0lPTl9BXzEgOiBcIi4vYXNzZXRzL2ltZy9PdGhlckV4cGxvc2lvbjEucG5nXCIsXHJcbiAgICBFWFBMT1NJT05fQV8yIDogXCIuL2Fzc2V0cy9pbWcvT3RoZXJFeHBsb3Npb24yLnBuZ1wiLFxyXG4gICAgRVhQTE9TSU9OX0FfMyA6IFwiLi9hc3NldHMvaW1nL090aGVyRXhwbG9zaW9uMy5wbmdcIixcclxuICAgIEVYUExPU0lPTl9CXzEgOiBcIi4vYXNzZXRzL2ltZy9FeHBsb3Npb24xLnBuZ1wiLFxyXG4gICAgRVhQTE9TSU9OX0JfMiA6IFwiLi9hc3NldHMvaW1nL0V4cGxvc2lvbjIucG5nXCIsXHJcbiAgICBFWFBMT1NJT05fQl8zIDogXCIuL2Fzc2V0cy9pbWcvRXhwbG9zaW9uMy5wbmdcIixcclxuICAgIEVYUExPU0lPTl9FTkQgOiBcIi4vYXNzZXRzL2ltZy9FeHBsb3Npb25FbmQucG5nXCIsXHJcbiAgICBIUF9GVUxMICAgICAgIDogXCIuL2Fzc2V0cy9pbWcvSGVhbHRoT3JiRnVsbC5wbmdcIixcclxuICAgIEhQX0VNUFRZICAgICAgOiBcIi4vYXNzZXRzL2ltZy9IZWFsdGhPcmJFbXB0eS5wbmdcIixcclxuXHJcbiAgICAvLyBQcmVsb2FkZXIgcmVwbGFjZXMgZ2V0dGVyIHdpdGggYXBwcm9wcmlhdGUgZGVmaW5pdGlvblxyXG4gICAgZ2V0ICAgICAgICA6IGZ1bmN0aW9uIChwYXRoKSB7IH1cclxufTsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBBc3NldHMgPSByZXF1aXJlKCcuL0Fzc2V0cy5qcycpO1xyXG5cclxudmFyIFByZWxvYWRlciA9IGZ1bmN0aW9uIChvbkNvbXBsZXRlKSB7XHJcbiAgICAvLyBTZXQgdXAgcHJlbG9hZGVyXHJcblx0dGhpcy5xdWV1ZSA9IG5ldyBjcmVhdGVqcy5Mb2FkUXVldWUoZmFsc2UpO1xyXG5cclxuICAgIC8vIFJlcGxhY2UgZGVmaW5pdGlvbiBvZiBBc3NldCBnZXR0ZXIgdG8gdXNlIHRoZSBkYXRhIGZyb20gdGhlIHF1ZXVlXHJcbiAgICBBc3NldHMuZ2V0ID0gdGhpcy5xdWV1ZS5nZXRSZXN1bHQuYmluZCh0aGlzLnF1ZXVlKTtcclxuXHJcbiAgICAvLyBPbmNlIGV2ZXJ5dGhpbmcgaGFzIGJlZW4gcHJlbG9hZGVkLCBzdGFydCB0aGUgYXBwbGljYXRpb25cclxuICAgIGlmIChvbkNvbXBsZXRlKSB7XHJcbiAgICAgICAgdGhpcy5xdWV1ZS5vbihcImNvbXBsZXRlXCIsIG9uQ29tcGxldGUpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBuZWVkVG9Mb2FkID0gW107XHJcblxyXG4gICAgLy8gUHJlcGFyZSB0byBsb2FkIGltYWdlc1xyXG4gICAgZm9yICh2YXIgaW1nIGluIEFzc2V0cykge1xyXG4gICAgICAgIHZhciBpbWdPYmogPSB7XHJcbiAgICAgICAgICAgIGlkIDogaW1nLFxyXG4gICAgICAgICAgICBzcmMgOiBBc3NldHNbaW1nXVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbmVlZFRvTG9hZC5wdXNoKGltZ09iaik7XHJcbiAgICB9XHJcblxyXG5cdHRoaXMucXVldWUubG9hZE1hbmlmZXN0KG5lZWRUb0xvYWQpO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQcmVsb2FkZXI7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgQXNzZXRzID0gcmVxdWlyZSgnLi9Bc3NldHMuanMnKTtcclxudmFyIFByZWxvYWRlciA9IHJlcXVpcmUoJy4vUHJlbG9hZGVyLmpzJyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIEFzc2V0cyAgICA6IEFzc2V0cyxcclxuICAgIFByZWxvYWRlciA6IFByZWxvYWRlclxyXG59OyJdfQ==
