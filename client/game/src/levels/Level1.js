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