"use strict";
/* global entityManager, g_aiCommands, keys, Player, consts, Arena, AI */
/* jshint browser: true, devel: true, globalstrict: true */

// humanPlayers + AIs should be <= 4
function createInitialArena(humanPlayers, AIs) {
    if (humanPlayers + AIs > 4){
        console.log("More than 4 players WTH!!!");
    }
    
        
    var player1 = new Player({cx: 40*1, cy: 40*1, width: 36, height: 36,
        keyUp: 'W'.charCodeAt(0), 
        keyDown: 'S'.charCodeAt(0), 
        keyLeft: 'A'.charCodeAt(0), 
        keyRight: 'D'.charCodeAt(0),
        keyPutBomb: ' '.charCodeAt(0),
        commandObject: keys
    });
    
    var player2 = new Player({cx: 40*13, cy: 40*1, width: 36, height: 36,
        keyUp: 'I'.charCodeAt(0), 
        keyDown: 'K'.charCodeAt(0), 
        keyLeft: 'J'.charCodeAt(0), 
        keyRight: 'L'.charCodeAt(0),
        keyPutBomb: 'O'.charCodeAt(0),
        commandObject: keys 
    });
    
    var player3 = new Player({cx: 40*1, cy: 40*13, width: 36, height: 36,
        keyUp: 38, // up arrow
        keyDown: 40, // down arrow
        keyLeft: 37, // left arrow
        keyRight: 39, // right arrow
        keyPutBomb: 13, // enter
        commandObject: keys 
    });
    
    var player4 = new Player({cx: 40*13, cy: 40*13, width: 36, height: 36,
        keyUp: 38, // up arrow
        keyDown: 40, // down arrow
        keyLeft: 37, // left arrow
        keyRight: 39, // right arrow
        keyPutBomb: 13, // enter
        commandObject: keys 
    });
    
    
    
    
    // Create AI players and command objects
    g_aiCommands.ai1 = {};
    var aiPlayer1 = new Player({cx: 40*1, cy: 40*1, width: 36, height: 36,
        keyUp: consts.CONTROLS.UP, keyDown: consts.CONTROLS.DOWN, 
        keyLeft: consts.CONTROLS.LEFT, keyRight: consts.CONTROLS.RIGHT,
        keyPutBomb: consts.CONTROLS.PUT_BOMB,
        commandObject: g_aiCommands.ai1
    });
    
    g_aiCommands.ai2 = {};
    var aiPlayer2 = new Player({cx: 40*13, cy: 40*1, width: 36, height: 36,
        keyUp: consts.CONTROLS.UP, keyDown: consts.CONTROLS.DOWN, 
        keyLeft: consts.CONTROLS.LEFT, keyRight: consts.CONTROLS.RIGHT,
        keyPutBomb: consts.CONTROLS.PUT_BOMB,
        commandObject: g_aiCommands.ai2
    });
    
    g_aiCommands.ai3 = {};
    var aiPlayer3 = new Player({cx: 40*1, cy: 40*13, width: 36, height: 36,
        keyUp: consts.CONTROLS.UP, keyDown: consts.CONTROLS.DOWN, 
        keyLeft: consts.CONTROLS.LEFT, keyRight: consts.CONTROLS.RIGHT,
        keyPutBomb: consts.CONTROLS.PUT_BOMB,
        commandObject: g_aiCommands.ai3
    });
    
    g_aiCommands.ai4 = {};
    var aiPlayer4 = new Player({cx: 40*13, cy: 40*13, width: 36, height: 36,
        keyUp: consts.CONTROLS.UP, keyDown: consts.CONTROLS.DOWN, 
        keyLeft: consts.CONTROLS.LEFT, keyRight: consts.CONTROLS.RIGHT,
        keyPutBomb: consts.CONTROLS.PUT_BOMB,
        commandObject: g_aiCommands.ai4
    });
    
    var players = []; //
    var ai1added = false;
    var ai2added = false;
    var ai3added = false;
    var ai4added = false;
    
    // Fill in slots 1, 4, 2 and 3 in that order
    // Determine slot 1
    if(humanPlayers > 0){
        players.push(player1);
        humanPlayers--;
    }else if(AIs > 0 ){
        players.push(aiPlayer1);
        AIs--;
        ai1added = true;
    }
    
    // Determine slot 4
    if(humanPlayers > 0){
        players.push(player4);
        humanPlayers--;
    }else if(AIs > 0 ){
        players.push(aiPlayer4);
        AIs--;
        ai4added = true;
    }
    
    // Determine slot 2
    if(humanPlayers > 0){
        players.push(player2);
        humanPlayers--;
    }else if(AIs > 0 ){
        players.push(aiPlayer2);
        AIs--;
        ai2added = true;
    }
    
    // Determine slot 3
    if(humanPlayers > 0){
        players.push(player3);
        humanPlayers--;
    }else if(AIs > 0 ){
        players.push(aiPlayer3);
        AIs--;
        ai3added = true;
    }
    
    
    // Initialize arena
    var arena = new Arena(players);
    
    // create Ais for ai players
    var p1Ai = new AI(arena, aiPlayer1, g_aiCommands.ai1);
    var p2Ai = new AI(arena, aiPlayer2, g_aiCommands.ai2);
    var p3Ai = new AI(arena, aiPlayer3, g_aiCommands.ai3);
    var p4Ai = new AI(arena, aiPlayer4, g_aiCommands.ai4);
    
    // add AIs to the entity manager
    if(ai1added){
        entityManager.addAi(p1Ai);
    }
    if(ai2added){
        entityManager.addAi(p2Ai);
    }
    if(ai3added){
        entityManager.addAi(p3Ai);
    }
    if(ai4added){
        entityManager.addAi(p4Ai);
    }
    
    // Set the newly created arena as the default arena
    entityManager.setDefaultArena(arena);
    
}
