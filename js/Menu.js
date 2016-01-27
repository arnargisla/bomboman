"use strict";

/* jshint browser: true, devel: true, globalstrict: true*/

/* global g_mouseX, g_mouseY, g_mouseIsDown, g_canvas,
   eatKey, g_sprites, g_numberOfHumans, g_numberOfAis, eatClick*/


var Menu = {};


Menu.startButton = new Button(150, 431, 300, 45);

Menu.controlsX = 212;
Menu.controlsY = 296;
Menu.controlsH = 30;
Menu.controlsW = 30;
Menu.incrementHumansButton = new Button(
    210, 
    294, 
    Menu.controlsW, 
    Menu.controlsH/2, false, 
    function(){
        if(g_numberOfHumans < 3 && (g_numberOfHumans + g_numberOfAis) < 4){
            g_numberOfHumans++;
        }
    });
    
Menu.decrementHumansButton = new Button(
    210, 
    294 + Menu.controlsH/2, 
    Menu.controlsW, 
    Menu.controlsH/2, false, 
    function(){
        if(g_numberOfHumans > 0){
            g_numberOfHumans--;
        }
    });

Menu.incrementAliensButton = new Button(
    210, 
    345, 
    Menu.controlsW, 
    Menu.controlsH/2, false, 
    function(){
        if((g_numberOfHumans + g_numberOfAis) < 4){
            g_numberOfAis++;
        }
    });

Menu.decrementAliensButton = new Button(
    210, 
    345 + Menu.controlsH/2, 
    Menu.controlsW, 
    Menu.controlsH/2, false, 
    function(){
        if(g_numberOfAis > 0){
            g_numberOfAis--;
        }
    });


Menu.renderHumanButtons = function(ctx){
    ctx.save();
    Menu.incrementHumansButton.render(ctx);
    Menu.decrementHumansButton.render(ctx);
    
    ctx.restore();
    
}

Menu.renderAlienButtons = function(ctx){
    ctx.save();
    ctx.font = "20px Arial";
    ctx.fillStyle = "rgb(138, 7, 7)";
    Menu.incrementAliensButton.render(ctx);
    Menu.decrementAliensButton.render(ctx);
    
    ctx.restore();
}

Menu.update = function(ctx){
    if(this.startButton.isBeingClicked()){
        main.gameState = "playing";
    }
    
    if(eatKey('L'.charCodeAt(0))){
        main.gameState = "playing";
    }
    
    Menu.incrementHumansButton.update();
    Menu.decrementHumansButton.update();
    Menu.incrementAliensButton.update();
    Menu.decrementAliensButton.update();
}

Menu.render = function(ctx){
    g_sprites["menu"].drawCentredAt(ctx, g_canvas.width / 2 , g_canvas.height / 2);
    g_sprites["frame"].drawCentredAt(ctx, g_canvas.width / 2 , g_canvas.height / 2);
    //this.startButton.render(ctx);
    //this.renderHumanButtons(ctx);
    //this.renderAlienButtons(ctx);
    
    ctx.save();
    ctx.font = "20px Freshman";
    ctx.fillStyle = "rgb(201, 34, 43)";
    
    ctx.fillText(g_numberOfAis, 252, 365, 500);
        
    ctx.fillText(g_numberOfHumans, 252, 312, 500);
        
    ctx.restore();
}
