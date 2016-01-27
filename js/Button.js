"use strict";

/* jshint browser: true, devel: true, globalstrict: true*/

/* global g_mouseX, g_mouseY, g_mouseIsDown, g_canvas,
   eatKey, g_sprites, g_numberOfHumans, g_numberOfAis, eatClick*/


var Button = function(x, y, w, h, toggleOn, updateFunction){
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    toggleOn = toggleOn || false;
    this.toggleOn = toggleOn;
    this.updateFunction = updateFunction;
}

Button.prototype.isBeingClicked = function(){
    if(this.x <= g_mouseX && g_mouseX <= (this.x + this.w)){
        // within on x axis
        if(this.y <= g_mouseY && g_mouseY <= (this.y + this.h)){
            //within on y and x axis
            if(eatClick()){
                return true;
            }
        }
    }
    return false;
}

Button.prototype.render = function(ctx){
    ctx.save();
    if(this.toggleOn){
        ctx.fillStyle = "grey";
        ctx.fillRect(this.x, this.y, this.w, this.h);
    }
    ctx.strokeRect(this.x, this.y, this.w, this.h);
    ctx.restore();
}

Button.prototype.update = function(){
    
    // Keyboard controls
    if(eatKey('W'.charCodeAt(0))){
        if(g_numberOfHumans < 3 && (g_numberOfHumans + g_numberOfAis) < 4){
            g_numberOfHumans++;
        }
    }
    if(eatKey('S'.charCodeAt(0))){
        if(g_numberOfHumans > 0){
            g_numberOfHumans--;
        }
    }
    if(eatKey('E'.charCodeAt(0))){
        if((g_numberOfHumans + g_numberOfAis) < 4){
            g_numberOfAis++;
        }
    }
    if(eatKey('D'.charCodeAt(0))){
        if(g_numberOfAis > 0){
            g_numberOfAis--;
        }
    }
    
    
    
    if(this.updateFunction) {
        if(this.isBeingClicked()){
            this.updateFunction();
        }
    }
}