// consts.js
//
// A module of generic constants

"use strict";


var consts = {

    FULL_CIRCLE: Math.PI * 2,
    RADIANS_PER_DEGREE: Math.PI / 180.0,
    EPSILON: 1e-7,
    DIRECTIONS: {
        NORTH: 'NORTH',
        EAST: 'EAST',
        SOUTH: 'SOUTH',
        WEST: 'WEST'
    },
    TILESETS: {
        EXPLOSIONS: {
            END: {x: 0, y: 0},
            MIDDLE: {x: 0, y: 40},
            CENTRE: {x: 0, y: 80},
        }
    },
    BOMBS: {
        TYPES: {
            PLASMA: 'PLASMA',
            REGULAR: 'REGULAR'
        }
    },
    CONTROLS: {
        LEFT: 'LEFT',
        RIGHT: 'RIGHT',
        UP: 'UP',
        DOWN: 'DOWN',
        PUT_BOMB: 'PUT_BOMB'
    },
    AI_TASKS: {
        GO_TO_BOMB_SPOT: 'GO_TO_BOMB_SPOT',
        GO_TO_POWERUP: 'GO_TO_POWERUP',
        GO_TO_COVER: 'GO_TO_COVER',
        NO_TASK: 'NO_TASK'
    }
};
