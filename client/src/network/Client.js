"use strict";

var entities = require('../entities');

var Client = function (id) {
    this.id = id;
    this.gameObject = new entities.ClientPlayer();
};
Object.freeze(Client);

module.exports = Client;