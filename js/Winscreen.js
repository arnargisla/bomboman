"use strict";

/* jshint browser: true, devel: true, globalstrict: true*/

/* global g_mouseX, g_mouseY, g_mouseIsDown, g_canvas,
   eatKey, g_sprites, g_numberOfHumans, g_numberOfAis, eatClick,
   Button, main */


var Winscreen = {};

Winscreen.newGameButton = new Button(150, 431, 300, 45, true);

Winscreen.noWinner = 'NO_WINNER';
Winscreen.setWinner = function(winner) {
    this.winner = winner;
};

Winscreen.update = function(du){
    
    if(Winscreen.winner !== Winscreen.noWinner){
        var player = Winscreen.winner;
        player.scale = player.scale || 1;
        player.scale = player.scale * 1.005;
        player.scale = Math.min(player.scale, 3);
        player.rotation = player.rotation || 0;
        player.rotation = player.rotation + Math.PI / 25;
        player.rotation = Math.min(player.rotation, Math.PI * 10);
        
        var xgoal = g_canvas.width / 2 - player.width / 2;
        var ygoal = 200;
        
        if(player.cx < (xgoal - 2.5)) {
            player.cx += 2.5;
        }else if (player.cx > (xgoal + 2.5)){
            player.cx -= 2.5;
        }
        
        if(player.cy < (ygoal - 2.5)) {
            player.cy += 2.5;
        }else if (player.cy > (ygoal + 2.5)){
            player.cy -= 2.5;
        }
        
        player.updateParticles(du);
    }
    
    if(this.newGameButton.isBeingClicked()){
        main.gameState = "menu";
    }
    
    if(eatKey('L'.charCodeAt(0))){
        main.gameState = "menu";
    }
}

Winscreen.render = function(ctx){
    g_sprites["frame"].drawCentredAt(ctx, g_canvas.width / 2 , g_canvas.height / 2);
    
    ctx.save();
    ctx.fillStyle = "white";
    ctx.fillRect(g_canvas.width / 2 - 150, 50, 300, 400);
    ctx.strokeRect(g_canvas.width / 2 - 150, 50, 300, 400);
    g_sprites["frame"].drawCentredAt(ctx, g_canvas.width / 2 , g_canvas.height / 2);
    if(Winscreen.winner !== Winscreen.noWinner){
        ctx.save();
        var player = Winscreen.winner;
        ctx.translate(player.cx + player.width / 2, player.cy + player.height / 2);
        ctx.rotate(player.rotation);
        ctx.scale(player.scale, player.scale);
        ctx.translate(-(player.cx + player.width / 2), -(player.cy + player.height / 2));
        Winscreen.winner.render(ctx);
        ctx.restore();
    }
    ctx.font = "20px Freshman";
    ctx.fillStyle = "rgb(201, 34, 43)";
    
    ctx.fillText("Gratz for winning!" , g_canvas.width / 2 - 100, 100, 200);
        
    //ctx.fillText(g_numberOfHumans, 252, 312, 500);
    
    Winscreen.newGameButton.render(ctx);
    
    ctx.fillStyle = "white";
    ctx.fillText("New Game?" , g_canvas.width / 2 - 53, 460, 500);
        
    ctx.restore();
}
