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
},{"../util":14,"./Player":3}],2:[function(require,module,exports){
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
},{"../util":14}],3:[function(require,module,exports){
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
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
/*
            // If the player is connected to the network, send out updates to
            // other players when necessary
            if (Network.connected) {
                var displacementSinceUpdate = geom.Vec2.subtract(
                    this.position,
                    this.lastSentPosition
                );
                var distanceSquaredSinceUpdate =
                    displacementSinceUpdate.getMagnitudeSquared();
                var maxUpdateDistance = Player.POSITION_UPDATE_DISTANCE;

                // If player has moved too far since last sending out an update
                // for its position, send out a new position update and update
                // the last-sent position
                if (distanceSquaredSinceUpdate >=
                    maxUpdateDistance * maxUpdateDistance) {

                    var predictedVelocity = this.velocity.clone();
                    predictedVelocity.add(
                        this.acceleration.clone().multiply(3)
                    );

                    var predictedPos = this.position.clone();
                    predictedPos.add(
                        predictedVelocity.multiply(3)
                    );

                    Network.socket.emit('updateOther', {
                        x        : predictedPos.x,
                        y        : predictedPos.y,
                        rotation : this.getRotation()
                    });

                    this.lastSentPosition = this.position.clone();
                }
            }
*/
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
},{"../network":8,"../util":14}],4:[function(require,module,exports){
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

// Create game
var canvas = document.querySelector("#game-canvas");
var game   = wfl.create(canvas);

var onLoad = function () {
    $(Network).on(
        Network.event.CONNECT,
        onNetworkConnect
    );

    Network.init();
};

var onNetworkConnect = function () {
    var gameScene = new scenes.GameScene(canvas);

    // TODO: Avoid having to pass the keyboard in like this
    gameScene.keyboard = game.keyboard;

    game.addScene(gameScene);
};

var Preloader = new util.Preloader(onLoad.bind(this));
},{"./network":8,"./scenes":11,"./util":14}],6:[function(require,module,exports){
"use strict";

var entities = require('../entities');

var Client = function (id) {
    this.id = id;
    this.gameObject = new entities.ClientPlayer();
};
Object.freeze(Client);

module.exports = Client;
},{"../entities":4}],7:[function(require,module,exports){
"use strict";

var entities = require('../entities');

var LocalClient = function (id) {
    this.id = id;
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
},{"./Client.js":6,"./LocalClient.js":7}],9:[function(require,module,exports){
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

var GameScene = function (canvas) {
    NetworkScene.call(this, canvas);

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
},{"../entities":4,"../network":8,"../util":14,"./NetworkScene":10}],10:[function(require,module,exports){
"use strict";

var Network = require('../network');
var Scene = wfl.display.Scene;

var NetworkScene = function (canvas) {
    Scene.call(this, canvas);
    
    $(Network).on(
        Network.event.ADD_CLIENT,
        this.onAddClient.bind(this)
    );
    $(Network).on(
        Network.event.REMOVE_CLIENT,
        this.onRemoveClient.bind(this)
    );

    // Add other clients that are already connected
    var keys = Object.keys(Network.clients);

    for (var i = 0; i < keys.length; i++) {
        var id = parseInt(keys[i]);
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
},{"../network":8}],11:[function(require,module,exports){
"use strict";

var NetworkScene = require('./NetworkScene.js');
var GameScene = require('./GameScene.js');

module.exports = {
    NetworkScene : NetworkScene,
    GameScene    : GameScene
};
},{"./GameScene.js":9,"./NetworkScene.js":10}],12:[function(require,module,exports){
"use strict";

module.exports = {
    BG_TILE    : "./assets/img/BG-tile1.png",
    BLOCK_FULL : "./assets/img/BlockFull.png",
    PLAYER     : "./assets/img/Ship.png",
    CLIENT     : "./assets/img/OtherShip.png",
    
    // Preloader replaces getter with appropriate definition
    get        : function (path) { }
};
},{}],13:[function(require,module,exports){
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
},{"./Assets.js":12}],14:[function(require,module,exports){
"use strict";

var Assets = require('./Assets.js');
var Preloader = require('./Preloader.js');

module.exports = {
    Assets : Assets,
    Preloader : Preloader
};
},{"./Assets.js":12,"./Preloader.js":13}]},{},[5])(5)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvc3JjL2VudGl0aWVzL0NsaWVudFBsYXllci5qcyIsImNsaWVudC9zcmMvZW50aXRpZXMvRnVsbEJsb2NrLmpzIiwiY2xpZW50L3NyYy9lbnRpdGllcy9QbGF5ZXIuanMiLCJjbGllbnQvc3JjL2VudGl0aWVzL2luZGV4LmpzIiwiY2xpZW50L3NyYy9pbmRleC5qcyIsImNsaWVudC9zcmMvbmV0d29yay9DbGllbnQuanMiLCJjbGllbnQvc3JjL25ldHdvcmsvTG9jYWxDbGllbnQuanMiLCJjbGllbnQvc3JjL25ldHdvcmsvaW5kZXguanMiLCJjbGllbnQvc3JjL3NjZW5lcy9HYW1lU2NlbmUuanMiLCJjbGllbnQvc3JjL3NjZW5lcy9OZXR3b3JrU2NlbmUuanMiLCJjbGllbnQvc3JjL3NjZW5lcy9pbmRleC5qcyIsImNsaWVudC9zcmMvdXRpbC9Bc3NldHMuanMiLCJjbGllbnQvc3JjL3V0aWwvUHJlbG9hZGVyLmpzIiwiY2xpZW50L3NyYy91dGlsL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xyXG52YXIgQXNzZXRzID0gdXRpbC5Bc3NldHM7XHJcbnZhciBQbGF5ZXIgPSByZXF1aXJlKCcuL1BsYXllcicpO1xyXG52YXIgR2FtZU9iamVjdCA9IHdmbC5jb3JlLmVudGl0aWVzLkdhbWVPYmplY3Q7XHJcbnZhciBMaXZpbmdPYmplY3QgPSB3ZmwuY29yZS5lbnRpdGllcy5MaXZpbmdPYmplY3Q7XHJcbnZhciBnZW9tID0gd2ZsLmdlb207XHJcblxyXG52YXIgQ2xpZW50UGxheWVyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgTGl2aW5nT2JqZWN0LmNhbGwodGhpcyk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIGRlZmF1bHQgc3RhdGVcclxuICAgIHRoaXMuZGVmYXVsdEdyYXBoaWMgPSBBc3NldHMuZ2V0KEFzc2V0cy5DTElFTlQpO1xyXG5cclxuICAgIHZhciB3ID0gdGhpcy5kZWZhdWx0R3JhcGhpYy53aWR0aDtcclxuICAgIHZhciBoID0gdGhpcy5kZWZhdWx0R3JhcGhpYy5oZWlnaHQ7XHJcbiAgICB2YXIgdmVydHMgPSBbXHJcbiAgICAgICAgbmV3IGdlb20uVmVjMigtdyAqIDAuNSwgLWggKiAwLjUpLFxyXG4gICAgICAgIG5ldyBnZW9tLlZlYzIodyAqIDAuNSwgMCksXHJcbiAgICAgICAgbmV3IGdlb20uVmVjMigtdyAqIDAuNSwgaCAqIDAuNSlcclxuICAgIF07XHJcbiAgICB2YXIgZnJhbWVPYmogPSB0aGlzLmNyZWF0ZUZyYW1lKHRoaXMuZGVmYXVsdEdyYXBoaWMsIDEsIGZhbHNlKTtcclxuICAgIGZyYW1lT2JqLnZlcnRpY2VzID0gdmVydHM7XHJcblxyXG4gICAgdGhpcy5kZWZhdWx0U3RhdGUgPSB0aGlzLmNyZWF0ZVN0YXRlKCk7XHJcbiAgICB0aGlzLmRlZmF1bHRTdGF0ZS5hZGRGcmFtZShmcmFtZU9iaik7XHJcbiAgICB0aGlzLmFkZFN0YXRlKEdhbWVPYmplY3QuU1RBVEUuREVGQVVMVCwgdGhpcy5kZWZhdWx0U3RhdGUpO1xyXG5cclxuICAgIHRoaXMucm90YXRlKC1NYXRoLlBJICogMC41KTtcclxufTtcclxuT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoQ2xpZW50UGxheWVyLCB7XHJcbiAgICBBUlJJVkFMX1NMT1dJTkdfUkFESVVTIDoge1xyXG4gICAgICAgIHZhbHVlIDogMjAwXHJcbiAgICB9LFxyXG5cclxuICAgIE1JTl9BUlJJVkFMX1JBRElVUyA6IHtcclxuICAgICAgICB2YWx1ZSA6IDhcclxuICAgIH0sXHJcblxyXG4gICAgTUlOSU1BUF9GSUxMX1NUWUxFIDoge1xyXG4gICAgICAgIHZhbHVlIDogXCIjMDZjODMzXCJcclxuICAgIH1cclxufSk7XHJcbkNsaWVudFBsYXllci5wcm90b3R5cGUgPSBPYmplY3QuZnJlZXplKE9iamVjdC5jcmVhdGUoTGl2aW5nT2JqZWN0LnByb3RvdHlwZSwge1xyXG4gICAgZHJhd09uTWluaW1hcCA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChjdHgpIHtcclxuICAgICAgICAgICAgdmFyIHcgPSB0aGlzLmdldFdpZHRoKCk7XHJcbiAgICAgICAgICAgIHZhciBoID0gdGhpcy5nZXRIZWlnaHQoKTtcclxuICAgICAgICAgICAgdmFyIG9mZnNldFggPSBNYXRoLnJvdW5kKC13ICogMC41KTtcclxuICAgICAgICAgICAgdmFyIG9mZnNldFkgPSBNYXRoLnJvdW5kKC1oICogMC41KTtcclxuICAgICAgICAgICAgdmFyIGRpc3BsYXlXaWR0aCA9IE1hdGgucm91bmQodyk7XHJcbiAgICAgICAgICAgIHZhciBkaXNwbGF5SGVpZ2h0ID0gTWF0aC5yb3VuZChoKTtcclxuXHJcbiAgICAgICAgICAgIGN0eC5zYXZlKCk7XHJcblxyXG4gICAgICAgICAgICBjdHguZmlsbFN0eWxlID0gQ2xpZW50UGxheWVyLk1JTklNQVBfRklMTF9TVFlMRTtcclxuICAgICAgICAgICAgY3R4LmZpbGxSZWN0KG9mZnNldFgsIG9mZnNldFksIGRpc3BsYXlXaWR0aCwgZGlzcGxheUhlaWdodCk7XHJcblxyXG4gICAgICAgICAgICBjdHgucmVzdG9yZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkpO1xyXG5PYmplY3QuZnJlZXplKENsaWVudFBsYXllcik7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENsaWVudFBsYXllcjsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xyXG52YXIgQXNzZXRzID0gdXRpbC5Bc3NldHM7XHJcbnZhciBHYW1lT2JqZWN0ID0gd2ZsLmNvcmUuZW50aXRpZXMuR2FtZU9iamVjdDtcclxudmFyIFBoeXNpY3NPYmplY3QgPSB3ZmwuY29yZS5lbnRpdGllcy5QaHlzaWNzT2JqZWN0O1xyXG5cclxuLyoqXHJcbiAqIEEgZnVsbC1zaXplZCwgcXVhZHJpbGF0ZXJhbCBibG9ja1xyXG4gKi9cclxudmFyIEZ1bGxCbG9jayA9IGZ1bmN0aW9uICgpIHtcclxuICAgIFBoeXNpY3NPYmplY3QuY2FsbCh0aGlzKTtcclxuXHJcbiAgICB0aGlzLmlkID0gRnVsbEJsb2NrLmlkO1xyXG5cclxuICAgIC8vIENyZWF0ZSBkZWZhdWx0IHN0YXRlXHJcbiAgICB0aGlzLmRlZmF1bHRHcmFwaGljID0gQXNzZXRzLmdldChBc3NldHMuQkxPQ0tfRlVMTCk7XHJcbiAgICB0aGlzLmRlZmF1bHRTdGF0ZSA9IHRoaXMuY3JlYXRlU3RhdGUoKTtcclxuICAgIHRoaXMuZGVmYXVsdFN0YXRlLmFkZEZyYW1lKFxyXG4gICAgICAgIHRoaXMuY3JlYXRlRnJhbWUodGhpcy5kZWZhdWx0R3JhcGhpYylcclxuICAgICk7XHJcbiAgICB0aGlzLmFkZFN0YXRlKEdhbWVPYmplY3QuU1RBVEUuREVGQVVMVCwgdGhpcy5kZWZhdWx0U3RhdGUpO1xyXG5cclxuICAgIHRoaXMuc29saWQgPSB0cnVlO1xyXG4gICAgdGhpcy5maXhlZCA9IHRydWU7XHJcbiAgICB0aGlzLnJvdGF0ZSgtTWF0aC5QSSAqIDAuNSk7XHJcbn07XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKEZ1bGxCbG9jaywge1xyXG4gICAgbmFtZSA6IHtcclxuICAgICAgICB2YWx1ZSA6IFwiRnVsbEJsb2NrXCJcclxuICAgIH0sXHJcblxyXG4gICAgaWQgOiB7XHJcbiAgICAgICAgdmFsdWUgOiAwXHJcbiAgICB9XHJcbn0pO1xyXG5GdWxsQmxvY2sucHJvdG90eXBlID0gT2JqZWN0LmZyZWV6ZShPYmplY3QuY3JlYXRlKFBoeXNpY3NPYmplY3QucHJvdG90eXBlLCB7XHJcbiAgICBkcmF3T25NaW5pbWFwIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGN0eCkge1xyXG4gICAgICAgICAgICB2YXIgdyA9IHRoaXMuZ2V0V2lkdGgoKTtcclxuICAgICAgICAgICAgdmFyIGggPSB0aGlzLmdldEhlaWdodCgpO1xyXG4gICAgICAgICAgICB2YXIgb2Zmc2V0WCA9IE1hdGgucm91bmQoLXcgKiAwLjUpO1xyXG4gICAgICAgICAgICB2YXIgb2Zmc2V0WSA9IE1hdGgucm91bmQoLWggKiAwLjUpO1xyXG4gICAgICAgICAgICB2YXIgZGlzcGxheVdpZHRoID0gTWF0aC5yb3VuZCh3KTtcclxuICAgICAgICAgICAgdmFyIGRpc3BsYXlIZWlnaHQgPSBNYXRoLnJvdW5kKGgpO1xyXG5cclxuICAgICAgICAgICAgY3R4LnNhdmUoKTtcclxuXHJcbiAgICAgICAgICAgIGN0eC5yb3RhdGUodGhpcy5nZXRSb3RhdGlvbigpKTtcclxuXHJcbiAgICAgICAgICAgIC8qY3R4LmZpbGxTdHlsZSA9XHJcbiAgICAgICAgICAgICAgICBhcHAuZ2FtZW9iamVjdC5QaHlzaWNzT2JqZWN0Lk1JTklNQVBfRklMTF9TVFlMRTtcclxuICAgICAgICAgICAgY3R4LnN0cm9rZVN0eWxlID1cclxuICAgICAgICAgICAgICAgIGFwcC5nYW1lb2JqZWN0LlBoeXNpY3NPYmplY3QuTUlOSU1BUF9TVFJPS0VfU1RZTEU7Ki9cclxuXHJcbiAgICAgICAgICAgIGN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICAgICAgY3R4LnJlY3Qob2Zmc2V0WCwgb2Zmc2V0WSwgZGlzcGxheVdpZHRoLCBkaXNwbGF5SGVpZ2h0KTtcclxuICAgICAgICAgICAgY3R4LmZpbGwoKTtcclxuICAgICAgICAgICAgY3R4LnN0cm9rZSgpO1xyXG5cclxuICAgICAgICAgICAgY3R4LnJlc3RvcmUoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKTtcclxuT2JqZWN0LmZyZWV6ZShGdWxsQmxvY2spO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBGdWxsQmxvY2s7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcclxudmFyIEFzc2V0cyA9IHV0aWwuQXNzZXRzO1xyXG52YXIgTmV0d29yayA9IHJlcXVpcmUoJy4uL25ldHdvcmsnKTtcclxudmFyIEdhbWVPYmplY3QgPSB3ZmwuY29yZS5lbnRpdGllcy5HYW1lT2JqZWN0O1xyXG52YXIgTGl2aW5nT2JqZWN0ID0gd2ZsLmNvcmUuZW50aXRpZXMuTGl2aW5nT2JqZWN0O1xyXG52YXIgZ2VvbSA9IHdmbC5nZW9tO1xyXG5cclxudmFyIFBsYXllciA9IGZ1bmN0aW9uICgpIHtcclxuICAgIExpdmluZ09iamVjdC5jYWxsKHRoaXMpO1xyXG5cclxuICAgIHRoaXMuc29saWQgPSB0cnVlO1xyXG5cclxuICAgIC8vIENyZWF0ZSBkZWZhdWx0IHN0YXRlXHJcbiAgICB0aGlzLmRlZmF1bHRHcmFwaGljID0gQXNzZXRzLmdldChBc3NldHMuUExBWUVSKTtcclxuXHJcbiAgICB2YXIgdyA9IHRoaXMuZGVmYXVsdEdyYXBoaWMud2lkdGg7XHJcbiAgICB2YXIgaCA9IHRoaXMuZGVmYXVsdEdyYXBoaWMuaGVpZ2h0O1xyXG4gICAgdmFyIHZlcnRzID0gW1xyXG4gICAgICAgIG5ldyBnZW9tLlZlYzIoLXcgKiAwLjUsIC1oICogMC41KSxcclxuICAgICAgICBuZXcgZ2VvbS5WZWMyKHcgKiAwLjUsIDApLFxyXG4gICAgICAgIG5ldyBnZW9tLlZlYzIoLXcgKiAwLjUsIGggKiAwLjUpXHJcbiAgICBdO1xyXG4gICAgdmFyIGZyYW1lT2JqID0gdGhpcy5jcmVhdGVGcmFtZSh0aGlzLmRlZmF1bHRHcmFwaGljLCAxLCBmYWxzZSk7XHJcbiAgICBmcmFtZU9iai52ZXJ0aWNlcyA9IHZlcnRzO1xyXG5cclxuICAgIHRoaXMuZGVmYXVsdFN0YXRlID0gdGhpcy5jcmVhdGVTdGF0ZSgpO1xyXG4gICAgdGhpcy5kZWZhdWx0U3RhdGUuYWRkRnJhbWUoZnJhbWVPYmopO1xyXG4gICAgdGhpcy5hZGRTdGF0ZShHYW1lT2JqZWN0LlNUQVRFLkRFRkFVTFQsIHRoaXMuZGVmYXVsdFN0YXRlKTtcclxuXHJcbiAgICB0aGlzLmxhc3RTZW50UG9zaXRpb24gPSBuZXcgZ2VvbS5WZWMyKC1JbmZpbml0eSwgLUluZmluaXR5KTtcclxuXHJcbiAgICB0aGlzLnJvdGF0ZSgtTWF0aC5QSSAqIDAuNSk7XHJcbn07XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKFBsYXllciwge1xyXG4gICAgVFVSTl9TUEVFRCA6IHtcclxuICAgICAgICB2YWx1ZSA6IDAuMDVcclxuICAgIH0sXHJcblxyXG4gICAgQlJBS0VfUkFURSA6IHtcclxuICAgICAgICB2YWx1ZSA6IDAuOTVcclxuICAgIH0sXHJcblxyXG4gICAgQk9PU1RfQUNDRUxFUkFUSU9OIDoge1xyXG4gICAgICAgIHZhbHVlIDogMC4wMDAyXHJcbiAgICB9LFxyXG5cclxuICAgIFBPU0lUSU9OX1VQREFURV9ESVNUQU5DRSA6IHtcclxuICAgICAgICB2YWx1ZSA6IDAuNVxyXG4gICAgfSxcclxuXHJcbiAgICBNSU5JTUFQX0ZJTExfU1RZTEUgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBcIiM4NmM4ZDNcIlxyXG4gICAgfVxyXG59KTtcclxuUGxheWVyLnByb3RvdHlwZSA9IE9iamVjdC5mcmVlemUoT2JqZWN0LmNyZWF0ZShMaXZpbmdPYmplY3QucHJvdG90eXBlLCB7XHJcbiAgICB1cGRhdGUgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoZHQpIHtcclxuICAgICAgICAgICAgTGl2aW5nT2JqZWN0LnByb3RvdHlwZS51cGRhdGUuY2FsbCh0aGlzLCBkdCk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvLyBJZiB0aGUgcGxheWVyIGlzIGNvbm5lY3RlZCB0byB0aGUgbmV0d29yaywgc2VuZCBvdXQgdXBkYXRlcyB0b1xyXG4gICAgICAgICAgICAvLyBvdGhlciBwbGF5ZXJzIHdoZW4gbmVjZXNzYXJ5XHJcbiAgICAgICAgICAgIGlmIChOZXR3b3JrLmNvbm5lY3RlZCkge1xyXG4gICAgICAgICAgICAgICAgTmV0d29yay5zb2NrZXQuZW1pdCgndXBkYXRlT3RoZXInLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb24gICAgIDogdGhpcy5wb3NpdGlvbixcclxuICAgICAgICAgICAgICAgICAgICB2ZWxvY2l0eSAgICAgOiB0aGlzLnZlbG9jaXR5LFxyXG4gICAgICAgICAgICAgICAgICAgIGFjY2VsZXJhdGlvbiA6IHRoaXMuYWNjZWxlcmF0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgIHJvdGF0aW9uICAgICA6IHRoaXMuZ2V0Um90YXRpb24oKVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBcclxuLypcclxuICAgICAgICAgICAgLy8gSWYgdGhlIHBsYXllciBpcyBjb25uZWN0ZWQgdG8gdGhlIG5ldHdvcmssIHNlbmQgb3V0IHVwZGF0ZXMgdG9cclxuICAgICAgICAgICAgLy8gb3RoZXIgcGxheWVycyB3aGVuIG5lY2Vzc2FyeVxyXG4gICAgICAgICAgICBpZiAoTmV0d29yay5jb25uZWN0ZWQpIHtcclxuICAgICAgICAgICAgICAgIHZhciBkaXNwbGFjZW1lbnRTaW5jZVVwZGF0ZSA9IGdlb20uVmVjMi5zdWJ0cmFjdChcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBvc2l0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubGFzdFNlbnRQb3NpdGlvblxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgIHZhciBkaXN0YW5jZVNxdWFyZWRTaW5jZVVwZGF0ZSA9XHJcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxhY2VtZW50U2luY2VVcGRhdGUuZ2V0TWFnbml0dWRlU3F1YXJlZCgpO1xyXG4gICAgICAgICAgICAgICAgdmFyIG1heFVwZGF0ZURpc3RhbmNlID0gUGxheWVyLlBPU0lUSU9OX1VQREFURV9ESVNUQU5DRTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBJZiBwbGF5ZXIgaGFzIG1vdmVkIHRvbyBmYXIgc2luY2UgbGFzdCBzZW5kaW5nIG91dCBhbiB1cGRhdGVcclxuICAgICAgICAgICAgICAgIC8vIGZvciBpdHMgcG9zaXRpb24sIHNlbmQgb3V0IGEgbmV3IHBvc2l0aW9uIHVwZGF0ZSBhbmQgdXBkYXRlXHJcbiAgICAgICAgICAgICAgICAvLyB0aGUgbGFzdC1zZW50IHBvc2l0aW9uXHJcbiAgICAgICAgICAgICAgICBpZiAoZGlzdGFuY2VTcXVhcmVkU2luY2VVcGRhdGUgPj1cclxuICAgICAgICAgICAgICAgICAgICBtYXhVcGRhdGVEaXN0YW5jZSAqIG1heFVwZGF0ZURpc3RhbmNlKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBwcmVkaWN0ZWRWZWxvY2l0eSA9IHRoaXMudmVsb2NpdHkuY2xvbmUoKTtcclxuICAgICAgICAgICAgICAgICAgICBwcmVkaWN0ZWRWZWxvY2l0eS5hZGQoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYWNjZWxlcmF0aW9uLmNsb25lKCkubXVsdGlwbHkoMylcclxuICAgICAgICAgICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB2YXIgcHJlZGljdGVkUG9zID0gdGhpcy5wb3NpdGlvbi5jbG9uZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHByZWRpY3RlZFBvcy5hZGQoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZWRpY3RlZFZlbG9jaXR5Lm11bHRpcGx5KDMpXHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgTmV0d29yay5zb2NrZXQuZW1pdCgndXBkYXRlT3RoZXInLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHggICAgICAgIDogcHJlZGljdGVkUG9zLngsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHkgICAgICAgIDogcHJlZGljdGVkUG9zLnksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvdGF0aW9uIDogdGhpcy5nZXRSb3RhdGlvbigpXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubGFzdFNlbnRQb3NpdGlvbiA9IHRoaXMucG9zaXRpb24uY2xvbmUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4qL1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgZHJhd09uTWluaW1hcCA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChjdHgpIHtcclxuICAgICAgICAgICAgdmFyIHcgPSB0aGlzLmdldFdpZHRoKCk7XHJcbiAgICAgICAgICAgIHZhciBoID0gdGhpcy5nZXRIZWlnaHQoKTtcclxuICAgICAgICAgICAgdmFyIG9mZnNldFggPSBNYXRoLnJvdW5kKC13ICogMC41KTtcclxuICAgICAgICAgICAgdmFyIG9mZnNldFkgPSBNYXRoLnJvdW5kKC1oICogMC41KTtcclxuICAgICAgICAgICAgdmFyIGRpc3BsYXlXaWR0aCA9IE1hdGgucm91bmQodyk7XHJcbiAgICAgICAgICAgIHZhciBkaXNwbGF5SGVpZ2h0ID0gTWF0aC5yb3VuZChoKTtcclxuXHJcbiAgICAgICAgICAgIGN0eC5zYXZlKCk7XHJcblxyXG4gICAgICAgICAgICBjdHguZmlsbFN0eWxlID0gUGxheWVyLk1JTklNQVBfRklMTF9TVFlMRTtcclxuICAgICAgICAgICAgY3R4LmZpbGxSZWN0KG9mZnNldFgsIG9mZnNldFksIGRpc3BsYXlXaWR0aCwgZGlzcGxheUhlaWdodCk7XHJcblxyXG4gICAgICAgICAgICBjdHgucmVzdG9yZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkpO1xyXG5PYmplY3QuZnJlZXplKFBsYXllcik7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFBsYXllcjsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBGdWxsQmxvY2sgPSByZXF1aXJlKCcuL0Z1bGxCbG9jay5qcycpO1xyXG52YXIgUGxheWVyID0gcmVxdWlyZSgnLi9QbGF5ZXIuanMnKTtcclxudmFyIENsaWVudFBsYXllciA9IHJlcXVpcmUoJy4vQ2xpZW50UGxheWVyLmpzJyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIEZ1bGxCbG9jayA6IEZ1bGxCbG9jayxcclxuICAgIFBsYXllcjogUGxheWVyLFxyXG4gICAgQ2xpZW50UGxheWVyIDogQ2xpZW50UGxheWVyXHJcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgTmV0d29yayA9IHJlcXVpcmUoJy4vbmV0d29yaycpO1xyXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xyXG52YXIgQXNzZXRzID0gdXRpbC5Bc3NldHM7XHJcbnZhciBzY2VuZXMgPSByZXF1aXJlKCcuL3NjZW5lcycpO1xyXG5cclxuLy8gQ3JlYXRlIGdhbWVcclxudmFyIGNhbnZhcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZ2FtZS1jYW52YXNcIik7XHJcbnZhciBnYW1lICAgPSB3ZmwuY3JlYXRlKGNhbnZhcyk7XHJcblxyXG52YXIgb25Mb2FkID0gZnVuY3Rpb24gKCkge1xyXG4gICAgJChOZXR3b3JrKS5vbihcclxuICAgICAgICBOZXR3b3JrLmV2ZW50LkNPTk5FQ1QsXHJcbiAgICAgICAgb25OZXR3b3JrQ29ubmVjdFxyXG4gICAgKTtcclxuXHJcbiAgICBOZXR3b3JrLmluaXQoKTtcclxufTtcclxuXHJcbnZhciBvbk5ldHdvcmtDb25uZWN0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIGdhbWVTY2VuZSA9IG5ldyBzY2VuZXMuR2FtZVNjZW5lKGNhbnZhcyk7XHJcblxyXG4gICAgLy8gVE9ETzogQXZvaWQgaGF2aW5nIHRvIHBhc3MgdGhlIGtleWJvYXJkIGluIGxpa2UgdGhpc1xyXG4gICAgZ2FtZVNjZW5lLmtleWJvYXJkID0gZ2FtZS5rZXlib2FyZDtcclxuXHJcbiAgICBnYW1lLmFkZFNjZW5lKGdhbWVTY2VuZSk7XHJcbn07XHJcblxyXG52YXIgUHJlbG9hZGVyID0gbmV3IHV0aWwuUHJlbG9hZGVyKG9uTG9hZC5iaW5kKHRoaXMpKTsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBlbnRpdGllcyA9IHJlcXVpcmUoJy4uL2VudGl0aWVzJyk7XHJcblxyXG52YXIgQ2xpZW50ID0gZnVuY3Rpb24gKGlkKSB7XHJcbiAgICB0aGlzLmlkID0gaWQ7XHJcbiAgICB0aGlzLmdhbWVPYmplY3QgPSBuZXcgZW50aXRpZXMuQ2xpZW50UGxheWVyKCk7XHJcbn07XHJcbk9iamVjdC5mcmVlemUoQ2xpZW50KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ2xpZW50OyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIGVudGl0aWVzID0gcmVxdWlyZSgnLi4vZW50aXRpZXMnKTtcclxuXHJcbnZhciBMb2NhbENsaWVudCA9IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgdGhpcy5pZCA9IGlkO1xyXG4gICAgdGhpcy5nYW1lT2JqZWN0ID0gbmV3IGVudGl0aWVzLlBsYXllcigpO1xyXG59O1xyXG5PYmplY3QuZnJlZXplKExvY2FsQ2xpZW50KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTG9jYWxDbGllbnQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgTmV0d29yayA9IHtcclxuICAgIHNvY2tldCAgICAgIDogdW5kZWZpbmVkLFxyXG4gICAgbG9jYWxDbGllbnQgOiB7fSxcclxuICAgIGNsaWVudHMgICAgIDoge30sXHJcbiAgICBjb25uZWN0ZWQgICA6IGZhbHNlLFxyXG4gICAgZXZlbnQgICAgICAgOiB7XHJcbiAgICAgICAgQ09OTkVDVCAgICAgICA6IFwiY29ubmVjdFwiLFxyXG4gICAgICAgIFJFTU9WRV9DTElFTlQgOiBcInJlbW92ZUNsaWVudFwiLFxyXG4gICAgICAgIEFERF9DTElFTlQgICAgOiBcImFkZENsaWVudFwiXHJcbiAgICB9LFxyXG5cclxuICAgIGluaXQgOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5zb2NrZXQgPSBpby5jb25uZWN0KCk7XHJcblxyXG4gICAgICAgIHRoaXMuc29ja2V0Lm9uKCdjb25maXJtJywgdGhpcy5vbkNvbmZpcm1DbGllbnQuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgdGhpcy5zb2NrZXQub24oJ2FkZE90aGVyJywgdGhpcy5vbkFkZE90aGVyQ2xpZW50LmJpbmQodGhpcykpO1xyXG4gICAgICAgIHRoaXMuc29ja2V0Lm9uKCdyZW1vdmVPdGhlcicsIHRoaXMub25SZW1vdmVPdGhlckNsaWVudC5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLnNvY2tldC5vbignbG9hZFByZXZpb3VzJywgdGhpcy5vbkxvYWRQcmV2aW91c0NsaWVudHMuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgdGhpcy5zb2NrZXQub24oJ3VwZGF0ZU90aGVyJywgdGhpcy5vblVwZGF0ZUNsaWVudC5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAgICAgdGhpcy5zb2NrZXQuZW1pdCgnaW5pdCcsIHtcclxuICAgICAgICAgICAgdXNlciA6IFwidXNlclwiXHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG5cclxuICAgIG9uQ29uZmlybUNsaWVudCA6IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgdmFyIGlkID0gZGF0YS5pZDtcclxuICAgICAgICB0aGlzLmxvY2FsQ2xpZW50ID0gbmV3IExvY2FsQ2xpZW50KGlkKTtcclxuICAgICAgICB0aGlzLmNsaWVudHNbaWRdID0gdGhpcy5sb2NhbENsaWVudDtcclxuXHJcbiAgICAgICAgdGhpcy5vblVwZGF0ZUNsaWVudChkYXRhKTtcclxuXHJcbiAgICAgICAgdGhpcy5jb25uZWN0ZWQgPSB0cnVlO1xyXG5cclxuICAgICAgICAkKHRoaXMpLnRyaWdnZXIoXHJcbiAgICAgICAgICAgIHRoaXMuZXZlbnQuQ09OTkVDVFxyXG4gICAgICAgICk7XHJcbiAgICB9LFxyXG5cclxuICAgIG9uQWRkT3RoZXJDbGllbnQgOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgIHZhciBpZCA9IGRhdGEuaWQ7XHJcbiAgICAgICAgdmFyIG5ld0NsaWVudCA9IG5ldyBDbGllbnQoaWQpO1xyXG5cclxuICAgICAgICB0aGlzLmNsaWVudHNbZGF0YS5pZF0gPSBuZXdDbGllbnQ7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5vblVwZGF0ZUNsaWVudChkYXRhKTtcclxuXHJcbiAgICAgICAgJCh0aGlzKS50cmlnZ2VyKFxyXG4gICAgICAgICAgICB0aGlzLmV2ZW50LkFERF9DTElFTlQsXHJcbiAgICAgICAgICAgIHRoaXMuY2xpZW50c1tkYXRhLmlkXVxyXG4gICAgICAgICk7XHJcbiAgICB9LFxyXG5cclxuICAgIG9uUmVtb3ZlT3RoZXJDbGllbnQgOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICQodGhpcykudHJpZ2dlcihcclxuICAgICAgICAgICAgdGhpcy5ldmVudC5SRU1PVkVfQ0xJRU5ULFxyXG4gICAgICAgICAgICB0aGlzLmNsaWVudHNbZGF0YS5pZF1cclxuICAgICAgICApO1xyXG5cclxuICAgICAgICB0aGlzLmNsaWVudHNbZGF0YS5pZF0gPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgZGVsZXRlIHRoaXMuY2xpZW50c1tkYXRhLmlkXTtcclxuICAgIH0sXHJcblxyXG4gICAgb25Mb2FkUHJldmlvdXNDbGllbnRzIDogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGRhdGEpO1xyXG5cclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdmFyIGlkID0gcGFyc2VJbnQoa2V5c1tpXSk7XHJcbiAgICAgICAgICAgIHZhciB1c2VyRGF0YSA9IGRhdGFbaWRdO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5vbkFkZE90aGVyQ2xpZW50KHVzZXJEYXRhKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIG9uVXBkYXRlQ2xpZW50IDogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICB2YXIgaWQgPSBkYXRhLmlkO1xyXG4gICAgICAgIHZhciBjbGllbnQgPSB0aGlzLmNsaWVudHNbaWRdO1xyXG5cclxuICAgICAgICBjbGllbnQuZ2FtZU9iamVjdC5wb3NpdGlvbi54ID0gZGF0YS5wb3NpdGlvbi54O1xyXG4gICAgICAgIGNsaWVudC5nYW1lT2JqZWN0LnBvc2l0aW9uLnkgPSBkYXRhLnBvc2l0aW9uLnk7XHJcbiAgICAgICAgY2xpZW50LmdhbWVPYmplY3QudmVsb2NpdHkueCA9IGRhdGEudmVsb2NpdHkueDtcclxuICAgICAgICBjbGllbnQuZ2FtZU9iamVjdC52ZWxvY2l0eS55ID0gZGF0YS52ZWxvY2l0eS55O1xyXG4gICAgICAgIGNsaWVudC5nYW1lT2JqZWN0LmFjY2VsZXJhdGlvbi54ID0gZGF0YS5hY2NlbGVyYXRpb24ueDtcclxuICAgICAgICBjbGllbnQuZ2FtZU9iamVjdC5hY2NlbGVyYXRpb24ueSA9IGRhdGEuYWNjZWxlcmF0aW9uLnk7XHJcbiAgICAgICAgY2xpZW50LmdhbWVPYmplY3Quc2V0Um90YXRpb24oZGF0YS5yb3RhdGlvbik7XHJcbiAgICB9XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE5ldHdvcms7XHJcblxyXG52YXIgQ2xpZW50ID0gcmVxdWlyZSgnLi9DbGllbnQuanMnKTtcclxudmFyIExvY2FsQ2xpZW50ID0gcmVxdWlyZSgnLi9Mb2NhbENsaWVudC5qcycpOyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIHV0aWwgPSByZXF1aXJlKCcuLi91dGlsJyk7XHJcbnZhciBBc3NldHMgPSB1dGlsLkFzc2V0cztcclxudmFyIE5ldHdvcmsgPSByZXF1aXJlKCcuLi9uZXR3b3JrJyk7XHJcbnZhciBlbnRpdGllcyA9IHJlcXVpcmUoJy4uL2VudGl0aWVzJyk7XHJcbnZhciBGdWxsQm9jayA9IGVudGl0aWVzLkZ1bGxCbG9jaztcclxudmFyIFBsYXllciA9IGVudGl0aWVzLlBsYXllcjtcclxudmFyIE5ldHdvcmtTY2VuZSA9IHJlcXVpcmUoJy4vTmV0d29ya1NjZW5lJyk7XHJcbnZhciBiYWNrZ3JvdW5kcyA9IHdmbC5kaXNwbGF5LmJhY2tncm91bmRzO1xyXG52YXIgZ2VvbSA9IHdmbC5nZW9tO1xyXG5cclxudmFyIEdhbWVTY2VuZSA9IGZ1bmN0aW9uIChjYW52YXMpIHtcclxuICAgIE5ldHdvcmtTY2VuZS5jYWxsKHRoaXMsIGNhbnZhcyk7XHJcblxyXG4gICAgdmFyIHdhbGxTaXplID0gMTA7XHJcbiAgICB2YXIgYmxvY2tTaXplID0gMTI4O1xyXG4gICAgdmFyIG9mZnNldCA9IC0od2FsbFNpemUgKiAwLjUgLSAxKSAqIGJsb2NrU2l6ZTtcclxuXHJcbiAgICAvLyBMaW5lIHRoZSB0b3BcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgOTsgaSsrKSB7XHJcbiAgICAgICAgdmFyIG5ld0Jsb2NrID0gbmV3IEZ1bGxCb2NrKCk7XHJcbiAgICAgICAgbmV3QmxvY2sucG9zaXRpb24ueCA9IGJsb2NrU2l6ZSAqIGkgKyBvZmZzZXQ7XHJcbiAgICAgICAgbmV3QmxvY2sucG9zaXRpb24ueSA9IG9mZnNldDtcclxuXHJcbiAgICAgICAgdGhpcy5hZGRHYW1lT2JqZWN0KG5ld0Jsb2NrKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBMaW5lIHRoZSBib3R0b21cclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgOTsgaSsrKSB7XHJcbiAgICAgICAgdmFyIG5ld0Jsb2NrID0gbmV3IEZ1bGxCb2NrKCk7XHJcbiAgICAgICAgbmV3QmxvY2sucG9zaXRpb24ueCA9IGJsb2NrU2l6ZSAqIGkgKyBvZmZzZXQ7XHJcbiAgICAgICAgbmV3QmxvY2sucG9zaXRpb24ueSA9IC1vZmZzZXQ7XHJcblxyXG4gICAgICAgIHRoaXMuYWRkR2FtZU9iamVjdChuZXdCbG9jayk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gTGluZSB0aGUgbGVmdFxyXG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCA4OyBpKyspIHtcclxuICAgICAgICB2YXIgbmV3QmxvY2sgPSBuZXcgRnVsbEJvY2soKTtcclxuICAgICAgICBuZXdCbG9jay5wb3NpdGlvbi54ID0gb2Zmc2V0O1xyXG4gICAgICAgIG5ld0Jsb2NrLnBvc2l0aW9uLnkgPSBibG9ja1NpemUgKiBpICsgb2Zmc2V0O1xyXG5cclxuICAgICAgICB0aGlzLmFkZEdhbWVPYmplY3QobmV3QmxvY2spO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIExpbmUgdGhlIHJpZ2h0XHJcbiAgICBmb3IgKHZhciBpID0gMTsgaSA8IDg7IGkrKykge1xyXG4gICAgICAgIHZhciBuZXdCbG9jayA9IG5ldyBGdWxsQm9jaygpO1xyXG4gICAgICAgIG5ld0Jsb2NrLnBvc2l0aW9uLnggPSAtb2Zmc2V0O1xyXG4gICAgICAgIG5ld0Jsb2NrLnBvc2l0aW9uLnkgPSBibG9ja1NpemUgKiBpICsgb2Zmc2V0O1xyXG5cclxuICAgICAgICB0aGlzLmFkZEdhbWVPYmplY3QobmV3QmxvY2spO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICB0aGlzLmJnID0gbmV3IGJhY2tncm91bmRzLlBhcmFsbGF4QmFja2dyb3VuZChcclxuICAgICAgICBBc3NldHMuZ2V0KEFzc2V0cy5CR19USUxFKVxyXG4gICAgKTtcclxuICAgIFxyXG4gICAgdGhpcy5wbGF5ZXIgPSBOZXR3b3JrLmxvY2FsQ2xpZW50LmdhbWVPYmplY3Q7XHJcbiAgICB0aGlzLmFkZEdhbWVPYmplY3QodGhpcy5wbGF5ZXIsIDIpO1xyXG59O1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyhHYW1lU2NlbmUsIHtcclxuICAgIEZSSUNUSU9OIDoge1xyXG4gICAgICAgIHZhbHVlIDogMC45MjVcclxuICAgIH0sXHJcblxyXG4gICAgTUlOSU1BUCA6IHtcclxuICAgICAgICB2YWx1ZSA6IE9iamVjdC5mcmVlemUoe1xyXG4gICAgICAgICAgICBXSURUSCAgICAgIDogMTUwLFxyXG4gICAgICAgICAgICBIRUlHSFQgICAgIDogMTAwLFxyXG4gICAgICAgICAgICBTQ0FMRSAgICAgIDogMC4xLFxyXG4gICAgICAgICAgICBGSUxMX1NUWUxFIDogXCIjMTkyNDI3XCJcclxuICAgICAgICB9KVxyXG4gICAgfVxyXG59KTtcclxuR2FtZVNjZW5lLnByb3RvdHlwZSA9IE9iamVjdC5mcmVlemUoT2JqZWN0LmNyZWF0ZShOZXR3b3JrU2NlbmUucHJvdG90eXBlLCB7XHJcbiAgICB1cGRhdGUgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoZHQpIHtcclxuICAgICAgICAgICAgdmFyIGdhbWVPYmplY3RzID0gdGhpcy5nZXRHYW1lT2JqZWN0cygpO1xyXG4gICAgICAgIFxyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGdhbWVPYmplY3RzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgb2JqID0gZ2FtZU9iamVjdHNbaV07XHJcbiAgICAgICAgICAgICAgICBvYmouYWNjZWxlcmF0aW9uLm11bHRpcGx5KEdhbWVTY2VuZS5GUklDVElPTik7XHJcbiAgICAgICAgICAgICAgICBvYmoudmVsb2NpdHkubXVsdGlwbHkoR2FtZVNjZW5lLkZSSUNUSU9OKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgTmV0d29ya1NjZW5lLnByb3RvdHlwZS51cGRhdGUuY2FsbCh0aGlzLCBkdCk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB0aGlzLmhhbmRsZUlucHV0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIFxyXG4gICAgaGFuZGxlSW5wdXQgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciBwbGF5ZXIgICAgICAgPSB0aGlzLnBsYXllcjtcclxuICAgICAgICAgICAgdmFyIGtleWJvYXJkICAgICA9IHRoaXMua2V5Ym9hcmQ7XHJcbiAgICAgICAgICAgIHZhciBsZWZ0UHJlc3NlZCAgPSBrZXlib2FyZC5pc1ByZXNzZWQoa2V5Ym9hcmQuTEVGVCk7XHJcbiAgICAgICAgICAgIHZhciByaWdodFByZXNzZWQgPSBrZXlib2FyZC5pc1ByZXNzZWQoa2V5Ym9hcmQuUklHSFQpO1xyXG4gICAgICAgICAgICB2YXIgdXBQcmVzc2VkICAgID0ga2V5Ym9hcmQuaXNQcmVzc2VkKGtleWJvYXJkLlVQKTtcclxuICAgICAgICAgICAgdmFyIGRvd25QcmVzc2VkICA9IGtleWJvYXJkLmlzUHJlc3NlZChrZXlib2FyZC5ET1dOKTtcclxuXHJcbiAgICAgICAgICAgIC8vIExlZnQvIFJpZ2h0IEtleSAtLSBQbGF5ZXIgdHVybnNcclxuICAgICAgICAgICAgaWYgKGxlZnRQcmVzc2VkIHx8IHJpZ2h0UHJlc3NlZCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHJvdGF0aW9uID0gMDtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAobGVmdFByZXNzZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICByb3RhdGlvbiAtPSBQbGF5ZXIuVFVSTl9TUEVFRDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAocmlnaHRQcmVzc2VkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcm90YXRpb24gKz0gUGxheWVyLlRVUk5fU1BFRUQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcGxheWVyLnJvdGF0ZShyb3RhdGlvbik7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIFVwIEtleSAtLSBQbGF5ZXIgZ29lcyBmb3J3YXJkXHJcbiAgICAgICAgICAgIGlmICh1cFByZXNzZWQpIHtcclxuICAgICAgICAgICAgICAgIHZhciBtb3ZlbWVudEZvcmNlID0gZ2VvbS5WZWMyLmZyb21BbmdsZShwbGF5ZXIuZ2V0Um90YXRpb24oKSk7XHJcbiAgICAgICAgICAgICAgICBtb3ZlbWVudEZvcmNlLm11bHRpcGx5KFxyXG4gICAgICAgICAgICAgICAgICAgIFBsYXllci5CT09TVF9BQ0NFTEVSQVRJT04gKiBwbGF5ZXIubWFzc1xyXG4gICAgICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgICAgICBwbGF5ZXIuYWRkRm9yY2UobW92ZW1lbnRGb3JjZSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIERvd24gS2V5IC0tIEFwcGx5IGJyYWtlcyB0byBwbGF5ZXJcclxuICAgICAgICAgICAgaWYgKGRvd25QcmVzc2VkKSB7XHJcbiAgICAgICAgICAgICAgICBwbGF5ZXIudmVsb2NpdHkubXVsdGlwbHkoUGxheWVyLkJSQUtFX1JBVEUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEdhbWVTY2VuZTsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBOZXR3b3JrID0gcmVxdWlyZSgnLi4vbmV0d29yaycpO1xyXG52YXIgU2NlbmUgPSB3ZmwuZGlzcGxheS5TY2VuZTtcclxuXHJcbnZhciBOZXR3b3JrU2NlbmUgPSBmdW5jdGlvbiAoY2FudmFzKSB7XHJcbiAgICBTY2VuZS5jYWxsKHRoaXMsIGNhbnZhcyk7XHJcbiAgICBcclxuICAgICQoTmV0d29yaykub24oXHJcbiAgICAgICAgTmV0d29yay5ldmVudC5BRERfQ0xJRU5ULFxyXG4gICAgICAgIHRoaXMub25BZGRDbGllbnQuYmluZCh0aGlzKVxyXG4gICAgKTtcclxuICAgICQoTmV0d29yaykub24oXHJcbiAgICAgICAgTmV0d29yay5ldmVudC5SRU1PVkVfQ0xJRU5ULFxyXG4gICAgICAgIHRoaXMub25SZW1vdmVDbGllbnQuYmluZCh0aGlzKVxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBBZGQgb3RoZXIgY2xpZW50cyB0aGF0IGFyZSBhbHJlYWR5IGNvbm5lY3RlZFxyXG4gICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhOZXR3b3JrLmNsaWVudHMpO1xyXG5cclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHZhciBpZCA9IHBhcnNlSW50KGtleXNbaV0pO1xyXG4gICAgICAgIHZhciBjbGllbnQgPSBOZXR3b3JrLmNsaWVudHNbaWRdO1xyXG5cclxuICAgICAgICBpZiAoY2xpZW50ICE9PSBOZXR3b3JrLmxvY2FsQ2xpZW50KSB7XHJcbiAgICAgICAgICAgIHRoaXMuYWRkR2FtZU9iamVjdChjbGllbnQuZ2FtZU9iamVjdCwgMSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5OZXR3b3JrU2NlbmUucHJvdG90eXBlID0gT2JqZWN0LmZyZWV6ZShPYmplY3QuY3JlYXRlKFNjZW5lLnByb3RvdHlwZSwge1xyXG4gICAgb25BZGRDbGllbnQgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoZSwgY2xpZW50KSB7XHJcbiAgICAgICAgICAgIGlmIChjbGllbnQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYWRkR2FtZU9iamVjdChjbGllbnQuZ2FtZU9iamVjdCwgMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIG9uUmVtb3ZlQ2xpZW50IDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGUsIGNsaWVudCkge1xyXG4gICAgICAgICAgICBpZiAoY2xpZW50KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZUdhbWVPYmplY3QoY2xpZW50LmdhbWVPYmplY3QsIDEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE5ldHdvcmtTY2VuZTsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBOZXR3b3JrU2NlbmUgPSByZXF1aXJlKCcuL05ldHdvcmtTY2VuZS5qcycpO1xyXG52YXIgR2FtZVNjZW5lID0gcmVxdWlyZSgnLi9HYW1lU2NlbmUuanMnKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgTmV0d29ya1NjZW5lIDogTmV0d29ya1NjZW5lLFxyXG4gICAgR2FtZVNjZW5lICAgIDogR2FtZVNjZW5lXHJcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIEJHX1RJTEUgICAgOiBcIi4vYXNzZXRzL2ltZy9CRy10aWxlMS5wbmdcIixcclxuICAgIEJMT0NLX0ZVTEwgOiBcIi4vYXNzZXRzL2ltZy9CbG9ja0Z1bGwucG5nXCIsXHJcbiAgICBQTEFZRVIgICAgIDogXCIuL2Fzc2V0cy9pbWcvU2hpcC5wbmdcIixcclxuICAgIENMSUVOVCAgICAgOiBcIi4vYXNzZXRzL2ltZy9PdGhlclNoaXAucG5nXCIsXHJcbiAgICBcclxuICAgIC8vIFByZWxvYWRlciByZXBsYWNlcyBnZXR0ZXIgd2l0aCBhcHByb3ByaWF0ZSBkZWZpbml0aW9uXHJcbiAgICBnZXQgICAgICAgIDogZnVuY3Rpb24gKHBhdGgpIHsgfVxyXG59OyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIEFzc2V0cyA9IHJlcXVpcmUoJy4vQXNzZXRzLmpzJyk7XHJcblxyXG52YXIgUHJlbG9hZGVyID0gZnVuY3Rpb24gKG9uQ29tcGxldGUpIHtcclxuICAgIC8vIFNldCB1cCBwcmVsb2FkZXJcclxuXHR0aGlzLnF1ZXVlID0gbmV3IGNyZWF0ZWpzLkxvYWRRdWV1ZShmYWxzZSk7XHJcblxyXG4gICAgLy8gUmVwbGFjZSBkZWZpbml0aW9uIG9mIEFzc2V0IGdldHRlciB0byB1c2UgdGhlIGRhdGEgZnJvbSB0aGUgcXVldWVcclxuICAgIEFzc2V0cy5nZXQgPSB0aGlzLnF1ZXVlLmdldFJlc3VsdC5iaW5kKHRoaXMucXVldWUpO1xyXG5cclxuICAgIC8vIE9uY2UgZXZlcnl0aGluZyBoYXMgYmVlbiBwcmVsb2FkZWQsIHN0YXJ0IHRoZSBhcHBsaWNhdGlvblxyXG4gICAgaWYgKG9uQ29tcGxldGUpIHtcclxuICAgICAgICB0aGlzLnF1ZXVlLm9uKFwiY29tcGxldGVcIiwgb25Db21wbGV0ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIG5lZWRUb0xvYWQgPSBbXTtcclxuXHJcbiAgICAvLyBQcmVwYXJlIHRvIGxvYWQgaW1hZ2VzXHJcbiAgICBmb3IgKHZhciBpbWcgaW4gQXNzZXRzKSB7XHJcbiAgICAgICAgdmFyIGltZ09iaiA9IHtcclxuICAgICAgICAgICAgaWQgOiBpbWcsXHJcbiAgICAgICAgICAgIHNyYyA6IEFzc2V0c1tpbWddXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBuZWVkVG9Mb2FkLnB1c2goaW1nT2JqKTtcclxuICAgIH1cclxuXHJcblx0dGhpcy5xdWV1ZS5sb2FkTWFuaWZlc3QobmVlZFRvTG9hZCk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFByZWxvYWRlcjsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBBc3NldHMgPSByZXF1aXJlKCcuL0Fzc2V0cy5qcycpO1xyXG52YXIgUHJlbG9hZGVyID0gcmVxdWlyZSgnLi9QcmVsb2FkZXIuanMnKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgQXNzZXRzIDogQXNzZXRzLFxyXG4gICAgUHJlbG9hZGVyIDogUHJlbG9hZGVyXHJcbn07Il19
