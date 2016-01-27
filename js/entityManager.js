/*

entityManager.js

A module which handles arbitrary entity-management for "Asteroids"


We create this module as a single global object, and initialise it
with suitable 'data' and 'methods'.

"Private" properties are denoted by an underscore prefix convention.

*/


"use strict";


// Tell jslint not to complain about my use of underscore prefixes (nomen),
// my flattening of some indentation (white), or my use of incr/decr ops 
// (plusplus).
//

/* global Arena, Player, AI, g_aiCommands, consts */
/* jslint nomen: true, white: true, plusplus: true */


var entityManager = {

// "PRIVATE" DATA

_arenas: {},
_AIs: [],

// "PRIVATE" METHODS

_forEachOf: function(aCategory, fn) {
    for (var i = 0; i < aCategory.length; ++i) {
        fn.call(aCategory[i]);
    }
},

// PUBLIC METHODS

// A special return value, used by other objects,
// to request the blessed release of death!
//
KILL_ME_NOW : -1,

// Some things must be deferred until after initial construction
// i.e. thing which need `this` to be defined.
//
deferredSetup : function () {
    // this._categories = [this._rocks, this._bullets  ];
},

init: function() {
    // this._generateRocks();
    // this._generateShip();
},

// fireBullet: function(cx, cy, velX, velY, rotation) {
//     this._bullets.push(new Bullet({
//         cx   : cx,
//         cy   : cy,
//         velX : velX,
//         velY : velY,

//         rotation : rotation
//     }));
// },

resetAis : function(){
    this._AIs = [];    
},

generateArena : function(players, grid) {
    if (players.length < 4) {
        // Add 1 AI player
        g_aiCommands.ai1 = {};
        var aiPlayer = new Player({cx: 40*13, cy: 40, width: 36, height: 36,
            keyUp: consts.CONTROLS.UP, keyDown: consts.CONTROLS.DOWN, 
            keyLeft: consts.CONTROLS.LEFT, keyRight: consts.CONTROLS.RIGHT,
            keyPutBomb: consts.CONTROLS.PUT_BOMB,
            commandObject: g_aiCommands.ai1
        });
        
    }
    this._arenas['defaultArena'] = new Arena(players.concat(aiPlayer), grid);
    this._AIs.push(new AI(this._arenas['defaultArena'], aiPlayer, g_aiCommands.ai1));
},

addAi : function(Ai){
    this._AIs.push(Ai);
},

setDefaultArena : function(arena){
  this._arenas['defaultArena'] = arena;
},

// generateShip : function(descr) {
//     this._ships.push(new Ship(descr));
// },

// killNearestShip : function(xPos, yPos) {
//     var theShip = this._findNearestShip(xPos, yPos).theShip;
//     if (theShip) {
//         theShip.kill();
//     }
// },

// yoinkNearestShip : function(xPos, yPos) {
//     var theShip = this._findNearestShip(xPos, yPos).theShip;
//     if (theShip) {
//         theShip.setPos(xPos, yPos);
//     }
// },

// resetShips: function() {
//     this._forEachOf(this._ships, Ship.prototype.reset);
// },

// haltShips: function() {
//     this._forEachOf(this._ships, Ship.prototype.halt);
// },	

// toggleRocks: function() {
//     this._bShowRocks = !this._bShowRocks;
// },

update: function(du) {

    // for (var c = 0; c < this._categories.length; ++c) {

    //     var aCategory = this._categories[c];
    //     var i = 0;

    //     while (i < aCategory.length) {

    //         var status = aCategory[i].update(du);

    //         if (status === this.KILL_ME_NOW) {
    //             // remove the dead guy, and shuffle the others down to
    //             // prevent a confusing gap from appearing in the array
    //             aCategory.splice(i,1);
    //         }
    //         else {
    //             ++i;
    //         }
    //     }
    // }
    
    // if (this._rocks.length === 0) this._generateRocks();
    var self = this;
    Object.keys(this._arenas).forEach(function(arenaId) {
        // Check if user is in this arena
        // Only one arena if multiplayer is not implemented.
        self._arenas[arenaId].update(du);
    });
    this._AIs.forEach(function(ai) {
        ai.update(du);
    });
},

render: function(ctx) {
    var self = this;
    Object.keys(this._arenas).forEach(function(arenaId) {
        // Check if user is in this arena
        // Only one arena if multiplayer is not implemented.
        self._arenas[arenaId].render(ctx);
    });
    this._AIs.forEach(function(ai) {
        ai.render(ctx);
    });
}

}

// Some deferred setup which needs the object to have been created first
entityManager.deferredSetup();

