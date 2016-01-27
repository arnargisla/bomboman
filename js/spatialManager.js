/*

spatialManager.js

A module which handles spatial lookup, as required for...
e.g. general collision detection.

*/

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */
/* global util */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/

var spatialManager = {

// "PRIVATE" DATA

_nextSpatialID : 1, // make all valid IDs non-falsey (i.e. don't start at 0)

_entities : [],

// TODO: If multiplayer, split into arenas

// "PRIVATE" METHODS
//
// <none yet>


// PUBLIC METHODS

getNewSpatialID : function() {
    return this._nextSpatialID++;
},

register: function(entity) {
    var spatialID = entity.getSpatialID();
    this._entities[spatialID] = entity;
},

unregister: function(entity) {
    var spatialID = entity.getSpatialID();
    delete this._entities[spatialID];
},

// findEntityInRange: function(posX, posY, radius) {
//     var self = this;
//     var result = false;
//     Object.keys(this._entities).some(function(index) {
//         var entity = self._entities[index];
//         var distanceSq = util.wrappedDistSq(posX, posY,
//                                      entity.cx, entity.cy,
//                                      g_canvas.width, g_canvas.height);
//         var limit = util.square(radius + entity.getRadius());
//         if (distanceSq < limit) {
//             // Entity in range
//              result = entity;
//             return true;
//         }
//     });
//     return result;
// },

// findEntityInBox: function(posX, posY, width, height) {
    
// },

render: function(ctx) {
    var oldStyle = ctx.strokeStyle;
    ctx.strokeStyle = "red";

    this._entities.forEach(function(entity) {
        util.strokeCircle(ctx, entity.cx, entity.cy, entity.getRadius());
    });
    
    ctx.strokeStyle = oldStyle;
}

}
