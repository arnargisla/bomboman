// ==============
// MOUSE HANDLING
// ==============

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/* global g_canvas*/

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/

var g_mouseX = 0,
    g_mouseY = 0,
    g_mouseIsDown = false;

function handleMouse(evt) {
    var rect = g_canvas.getBoundingClientRect();
    if(evt.type === "mousedown"){
        g_mouseIsDown = true;
    }else{
        g_mouseIsDown = false;
    }
    //g_mouseX = evt.clientX - g_canvas.offsetLeft;
    //g_mouseY = evt.clientY - g_canvas.offsetTop;
    g_mouseX = evt.clientX - rect.left;
    g_mouseY = evt.clientY - rect.top;
    /*
    if(evt.offsetX) {
        g_mouseX = evt.offsetX;
        g_mouseY = evt.offsetY;
    }
    else if(evt.layerX) {
        g_mouseX = evt.layerX;
        g_mouseY = evt.layerY;
    }*/
    
    // If no button is being pressed, then bail
    var button = evt.buttons === undefined ? evt.which : evt.buttons;
    if (!button) return;
    console.log([g_mouseX, g_mouseY]);
}


// Handle "down" and "move" events the same way.
window.addEventListener("mousedown", handleMouse);
window.addEventListener("mousemove", handleMouse);


function eatClick(){
    if(g_mouseIsDown){
        g_mouseIsDown = false;
        return true;
    }
    return false;
}