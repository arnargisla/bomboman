// ========
// MAINLOOP
// ========
/*

The mainloop is one big object with a fairly small public interface
(e.g. init, iter, gameOver), and a bunch of private internal helper methods.

The "private" members are identified as such purely by the naming convention
of having them begin with a leading underscore. A more robust form of privacy,
with genuine name-hiding *is* possible in JavaScript (via closures), but I 
haven't adopted it here.

*/

"use strict";

/* jshint browser: true, devel: true, globalstrict: true*/

/* global g_ctx, gatherInputs, update, render, keys, eatKey, g_prevUpdateDu, 
    AudioSystem, g_sounds, g_sprites, g_canvas, g_mouseX, g_mouseY, 
    g_mouseIsDown, Menu*/

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/


var main = {
    
    // "Frame Time" is a (potentially high-precision) frame-clock for animations
    _frameTime_ms : null,
    _frameTimeDelta_ms : null,

};

// Perform one iteration of the mainloop
main.iter = function (frameTime) {
    
    // Use the given frameTime to update all of our game-clocks
    this._updateClocks(frameTime);
    
    // Perform the iteration core to do all the "real" work
    this._iterCore(this._frameTimeDelta_ms);
    
    // Diagnostics, such as showing current timer values etc.
    this._debugRender(g_ctx);
    
    // Request the next iteration if needed
    if (!this._isGameOver) this._requestNextIteration();
};

main._updateClocks = function (frameTime) {
    
    // First-time initialisation
    if (this._frameTime_ms === null) this._frameTime_ms = frameTime;
    
    // Track frameTime and its delta
    this._frameTimeDelta_ms = frameTime - this._frameTime_ms;
    this._frameTime_ms = frameTime;
};

main.goToWinScreen = function(){
    main.initialized = false;
    main.gameState = "winscreen";
}

main.initialized = false;

main.gameState = "menu";
main._iterCore = function (dt) {
    
    // Handle QUIT
    if (requestedQuit()) {
        this.gameOver();
        return;
    }
    
    
    // If in menu draw it
    
    if (main.gameState === "menu"){
        Menu.update();
        Menu.render(g_ctx);
    } else if(main.gameState === "playing") {
        if(!main.initialized){
            entityManager.init();
            entityManager.resetAis();
            createInitialArena(g_numberOfHumans, g_numberOfAis);
            main.initialized = true;
        }
        gatherInputs();
        update(dt);
        render(g_ctx);
    } else if(main.gameState === "winscreen"){
        Winscreen.update(dt);
        Winscreen.render(g_ctx);
    }
};

main._isGameOver = false;

main.gameOver = function () {
    this._isGameOver = true;
    console.log("gameOver: quitting...");
};

// Simple voluntary quit mechanism
//
var KEY_QUIT = 'Q'.charCodeAt(0);
function requestedQuit() {
    // very annoying feature return keys[KEY_QUIT];
    return false;
}

// Annoying shim for Firefox and Safari
window.requestAnimationFrame = 
    window.requestAnimationFrame ||        // Chrome
    window.mozRequestAnimationFrame ||     // Firefox
    window.webkitRequestAnimationFrame;    // Safari

// This needs to be a "global" function, for the "window" APIs to callback to
function mainIterFrame(frameTime) {
    main.iter(frameTime);
}

main._requestNextIteration = function () {
    window.requestAnimationFrame(mainIterFrame);
};

// Mainloop-level debug-rendering

var TOGGLE_TIMER_SHOW = 'T'.charCodeAt(0);

main._doTimerShow = false;

main._debugRender = function (ctx) {
    
    if (eatKey(TOGGLE_TIMER_SHOW)) this._doTimerShow = !this._doTimerShow;
    
    if (!this._doTimerShow) return;
    
    var y = 350;
    ctx.fillText('FT ' + this._frameTime_ms, 50, y+10);
    ctx.fillText('FD ' + this._frameTimeDelta_ms, 50, y+20);
    ctx.fillText('UU ' + g_prevUpdateDu, 50, y+30); 
    ctx.fillText('FrameSync ON', 50, y+40);
};

main.init = function () {
    
    // Grabbing focus is good, but it sometimes screws up jsfiddle,
    // so it's a risky option during "development"
    //
    //window.focus(true);

    // We'll be working on a black background here,
    // so let's use a fillStyle which works against that...
    //
    g_ctx.fillStyle = "white";
    
    this._requestNextIteration();
    //AudioSystem.playSound(g_sounds.gamestart);
    AudioSystem.setSfxVolume(0.5)
    
    AudioSystem.startBgMusic();
    
    //AudioSystem.initiateWalkSound();
    
};
