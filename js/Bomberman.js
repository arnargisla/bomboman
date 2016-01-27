"use strict";
/* global entityManager, Player, keyCode, eatKey, AudioSystem, keys,
   imagesPreload, spatialManager, Sprite, main, g_sprites, g_sounds,
   createInitialArena, g_numberOfHumans, g_numberOfAis */
/* jshint browser: true, devel: true, globalstrict: true */

var g_canvas = document.getElementById("myCanvas");
var g_ctx = g_canvas.getContext("2d");

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/


// =============
// GATHER INPUTS
// =============

function gatherInputs() {
    // Nothing to do here!
    // The event handlers do everything we need for now.
}


// =================
// UPDATE SIMULATION
// =================

// We take a very layered approach here...
//
// The primary `update` routine handles generic stuff such as
// pausing, single-step, and time-handling.
//
// It then delegates the game-specific logic to `updateSimulation`


// GAME-SPECIFIC UPDATE LOGIC

function updateSimulation(du) {
    
    processDiagnostics();
    
    entityManager.update(du);
}

// GAME-SPECIFIC DIAGNOSTICS

var g_allowMixedActions = true;
var g_useGravity = false;
var g_useAveVel = true;
var g_renderSpatialDebug = false;


var KEY_SOUND   = keyCode('M');
var KEY_GRAVITY = keyCode('G');
var KEY_AVE_VEL = keyCode('V');
var KEY_SPATIAL = keyCode('X');

var KEY_HALT  = keyCode('H');
var KEY_RESET = keyCode('R');

var KEY_0 = keyCode('0');

var KEY_1 = keyCode('1');
var KEY_2 = keyCode('2');





function processDiagnostics() {

    if (eatKey(KEY_SOUND))
        AudioSystem.toggleMute();

    // if (eatKey(KEY_GRAVITY)) g_useGravity = !g_useGravity;

    // if (eatKey(KEY_AVE_VEL)) g_useAveVel = !g_useAveVel;

    if (eatKey(KEY_SPATIAL)) g_renderSpatialDebug = !g_renderSpatialDebug;

    // if (eatKey(KEY_HALT)) entityManager.haltShips();

    // if (eatKey(KEY_RESET)) entityManager.resetShips();

    // if (eatKey(KEY_0)) entityManager.toggleRocks();

    // if (eatKey(KEY_1)) entityManager.generateShip({
    //     cx : g_mouseX,
    //     cy : g_mouseY,
        
    //     sprite : g_sprites.ship});

    // if (eatKey(KEY_2)) entityManager.generateShip({
    //     cx : g_mouseX,
    //     cy : g_mouseY,
        
    //     sprite : g_sprites.ship2
    //     });

    // if (eatKey(KEY_K)) entityManager.killNearestShip(
    //     g_mouseX, g_mouseY);
}


// =================
// RENDER SIMULATION
// =================

// We take a very layered approach here...
//
// The primary `render` routine handles generic stuff such as
// the diagnostic toggles (including screen-clearing).
//
// It then delegates the game-specific logic to `gameRender`


// GAME-SPECIFIC RENDERING

function renderSimulation(ctx) {
    
    ctx.save();
    // ctx.imageSmoothingEnabled = false;
    
    entityManager.render(ctx);

    if (g_renderSpatialDebug) spatialManager.render(ctx);
    ctx.restore();
    
}


// =============
// PRELOAD STUFF
// =============

var g_images = {};

function requestPreloads() {

    var requiredImages = {
        //skull: "images/virus4.png",
        skull: "images/plasma7.png",
        //man: "images/bomberrobotscaled.png",
        man: "images/man3lives.png",
        //man2: "images/bomberrobotscaled2lives.png",
        man2: "images/man2lives.png",
        //man1: "images/bomberrobotscaled1lives.png",
        man1: "images/man1lives.png",
        //man0: "images/bomberrobotscaled0lives.png",
        man0: "images/man0lives.png",
        //bomb: "images/bomb.gif",
        bomb: "images/dabomb3.png",
        //brickwall: "images/brickwall.png",
        brickwall: "images/metalbox9.png",
        //rockswall: "images/rockswall.png",
        rockswall: "images/box4.png",
        //floor: "images/grasstile.jpg",
        floor: "images/test6.png",
        //shoes: "images/shoes.png",
        shoes: "images/speed5.png",
        //bycep: "images/bycep.png",
        bycep: "images/strength1.png",
        //bombbag: "images/bombbag.png",
        bombbag: "images/bombbag2.png",
        //kickpowerup: "images/kickpowerup_transp.png",
        kickpowerup: "images/kickpowerup3.png",
        explosion: "images/explosion_tiles.png",
        menu: "images/bomboman_front.jpg",
        plasmaExplosion: "images/explosion_plasma_tiles.png",
        frame: "images/frame.png"
    };
    
    
    imagesPreload(requiredImages, g_images, preloadDone);

    g_sounds.explosion = new Audio("sounds/explosion.wav");
    g_sounds.plasma = new Audio("sounds/plasma2.mp3");
    g_sounds.plasma.volume = 0.3;
    g_sounds.dropbomb = new Audio("sounds/dropbomb.mp3");
    g_sounds.gamestart = new Audio("sounds/gamestart.mp3");
    g_sounds.pickup = new Audio("sounds/pickup.mp3");
    g_sounds.pickup.volume = 0.09;
    g_sounds.backgroundmusic = new Audio("sounds/backgroundmusic.mp3");
    g_sounds.walk = new Audio("sounds/walk.mp3");
    g_sounds.hit = new Audio("sounds/hit4.mp3");
    g_sounds.hit.volume = 0.25;
    
    
}


function preloadDone() {

    g_sprites.menu  = new Sprite(g_images.menu);
    g_sprites.menu.scale = 1;

    g_sprites.frame  = new Sprite(g_images.frame);
    g_sprites.frame.scale = 1;
    
    g_sprites.skull  = new Sprite(g_images.skull);
    g_sprites.skull.scale = 1;
    
    g_sprites.man  = new Sprite(g_images.man);
    g_sprites.man.scale = 1.0;
    
    g_sprites.man2  = new Sprite(g_images.man2);
    g_sprites.man2.scale = 1.0;
    
    g_sprites.man1  = new Sprite(g_images.man1);
    g_sprites.man1.scale = 1.0;
    
    g_sprites.man0  = new Sprite(g_images.man0);
    g_sprites.man0.scale = 1.0;
    
    g_sprites.bomb  = new Sprite(g_images.bomb);
    g_sprites.bomb.scale = 1.0;
    
    g_sprites.brickwall  = new Sprite(g_images.brickwall);
    //g_sprites.brickwall.scale = 0.235;
    g_sprites.brickwall.scale = 1;
    
    g_sprites.rockswall  = new Sprite(g_images.rockswall);
    g_sprites.rockswall.scale = 0.325;
    
    g_sprites.floor  = new Sprite(g_images.floor);
    g_sprites.floor.scale = 0.625;
    
    g_sprites.shoes  = new Sprite(g_images.shoes);
    //g_sprites.shoes.scale = 0.825;
    g_sprites.shoes.scale = 1;
    
    g_sprites.bycep  = new Sprite(g_images.bycep);
    //g_sprites.bycep.scale = 0.285;
    g_sprites.bycep.scale = 1;
    
    g_sprites.bombbag  = new Sprite(g_images.bombbag);
    //g_sprites.bombbag.scale = 0.255;
    g_sprites.bombbag.scale = 1;
    
    g_sprites.kickpowerup  = new Sprite(g_images.kickpowerup);
    g_sprites.kickpowerup.scale = 1;
    
    g_sprites.explosion  = new Sprite(g_images.explosion, 40, 40);
    g_sprites.explosion.scale = 1;
    g_sprites.explosion.clipWidth = 40;
    g_sprites.explosion.clipHeight = 40;
    
    g_sprites.plasmaExplosion  = new Sprite(g_images.plasmaExplosion, 40, 40);
    g_sprites.plasmaExplosion.scale = 1;
    g_sprites.plasmaExplosion.clipWidth = 40;
    g_sprites.plasmaExplosion.clipHeight = 40;
    
    g_sprites.explosion_centre  = new Sprite(g_images.explosion, 40, 40, 0, 80);
    g_sprites.explosion_centre.scale = 1;


    main.init();
}

// Kick it off
requestPreloads();