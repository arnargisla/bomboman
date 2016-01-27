/* global Grid, util, g_canvas, entityManager, g_sounds, AudioSystem, Winscreen */

// 15x15 grid.
function Arena(players, grid) {
    this.grid = grid || this.generateGrid();
    this.players = players;
    this.originalPlayers = util.shallowCopyArray(players);
    this.registerPlayersToArena();
}

Arena.prototype.registerPlayersToArena = function() {
    var self = this;
    this.players.forEach(function(player) {
        player.registerToArena(self);
    });
    this.playersAlive = this.players.length;
};

Arena.prototype.generateGrid = function() {
    return new Grid();
};

Arena.prototype.getOpponentsOf = function(player) {
    return this.players.filter(function(maybeOpponent) {
        return maybeOpponent !== player;
    });
};

Arena.prototype.getGrid = function() {
    return this.grid;
};

Arena.prototype.layDownBomb = function(x, y, bombPower, bombType, player) {
    return this.grid.tryToAddBomb(x, y, bombPower, bombType, player);
};

Arena.prototype.isCollidingWithStaticObject = function(entity) {
    var pos = entity.getPos();
    var dim = entity.getDimensions();
    return this.grid.collidesWithBox(pos.posX, pos.posY, dim.width, dim.height);
};

Arena.prototype.isTileBlockedAt = function(rawX, rawY) {
    return this.grid.isSolid(rawX, rawY);
};

Arena.prototype.rawToGridCoords = function(x, y) {
    return this.grid.rawToGridCoords(x, y);
};

Arena.prototype.isTileBlockedAtRawCoords = function(x, y) {
    var gridcoords = this.rawToGridCoords(x, y);
    return this.isTileBlockedAt(gridcoords.x, gridcoords.y);
};

Arena.prototype.isPlayerInExplosion = function(player) {
    return this.grid.isPlayerInExplosion(player);
};

Arena.prototype.isPlayerInBomb = function(player) {
    // var coords = this.rawToGridCoords(player.cx+player.width/2, player.cy+player.height/2);
    // return this.grid.tileHasLivingBomb(coords.x, coords.y);
    var result = { isPlayerInBomb: false };
    var upperLeft = this.rawToGridCoords(player.cx, player.cy);
    var upperRight = this.rawToGridCoords(player.cx+player.width, player.cy);
    var bottomLeft = this.rawToGridCoords(player.cx, player.cy+player.height);
    var bottomRight = this.rawToGridCoords(player.cx+player.width, player.cy+player.height);
    if (this.grid.tileHasLivingBomb(upperLeft.x, upperLeft.y)) {
        result.isPlayerInBomb = true;
        result.coords = upperLeft;
    } else if (this.grid.tileHasLivingBomb(upperRight.x, upperRight.y)) {
        result.isPlayerInBomb = true;
        result.coords = upperRight;
    } else if (this.grid.tileHasLivingBomb(bottomLeft.x, bottomLeft.y)) {
        result.isPlayerInBomb = true;
        result.coords = bottomLeft;
    } else if (this.grid.tileHasLivingBomb(bottomRight.x, bottomRight.y)) {
        result.isPlayerInBomb = true;
        result.coords = bottomRight;
    }
    return result;
    // return (
    //     this.grid.tileHasLivingBomb(upperLeft.x, upperLeft.y)
    //  || this.grid.tileHasLivingBomb(upperRight.x, upperRight.y)
    //  || this.grid.tileHasLivingBomb(bottomLeft.x, bottomLeft.y)
    //  || this.grid.tileHasLivingBomb(bottomRight.x, bottomRight.y)
    // );
};

Arena.prototype.tileHasLivingBomb = function(tileX, tileY) {
    return this.grid.tileHasLivingBomb(tileX, tileY);
};

Arena.prototype.kickBombAt = function(tileX, tileY, direction) {
    this.grid.kickBombAt(tileX, tileY, direction);  
};

Arena.prototype.getTileWidth = function() {
    return this.grid.blockWidth;
};

Arena.prototype.getTileHeight = function() {
    return this.grid.blockHeight;
};

Arena.prototype.grabUpgrades = function(player){
    this.grid.grabUpgrades(player);
    //AudioSystem.playSound(g_sounds.pickup);
};

Arena.prototype.renderBackground = function(ctx) {
    // Floor
    util.fillBox(ctx, 0, 0, g_canvas.width, g_canvas.height, 'green');
};

Arena.prototype.removePlayer = function(player){
    for (var i = this.players.length - 1; i >= 0; i--) {
        if (this.players[i] === player) {
            this.players.splice(i, 1);
        }
    }
};

Arena.prototype.isPlayerAt = function(tileX, tileY, playerToIgnore) {
    for (var i = 0; i < this.players.length; i++) {
        var player = this.players[i];
        if (player !== playerToIgnore) {
            var playerPos = player.getPos();
            var playerTilePos = {
                x: Math.floor((playerPos.posX + player.width / 2) / this.grid.blockWidth),
                y: Math.floor((playerPos.posY + player.height / 2) / this.grid.blockHeight)
            };
            if (tileX === playerTilePos.x && tileY === playerTilePos.y) {
                return true;
            }
        }
    }
    return false;
};

Arena.prototype.resetGameIfDone = function() {
    if (this.playersAlive === 1) {
        // Sole winner
        Winscreen.setWinner(this.players[0]);
    } else if (this.playersAlive === 0) {
        // Stalemate
        Winscreen.setWinner(Winscreen.noWinner);
    } else {
        return;
    }
    this.resetGame();
};

Arena.prototype.resetGame = function() {
    main.goToWinScreen();
    
    AudioSystem.playSound(g_sounds.gamestart);
};

Arena.prototype.update = function(du) {
    var self = this;
    this.players.forEach(function(player) {
        var result = player.update(du); 
        if(result === entityManager.KILL_ME_NOW){
            self.playersAlive--;
            self.removePlayer(player);
        }
    });
    
    this.grid.update(du);
    
    // TODO: Make not reset instantly
    this.resetGameIfDone();
};

Arena.prototype.render = function(ctx) {
    this.renderBackground(ctx);
    this.grid.render(ctx);
    this.players.forEach(function(player) {
        player.render(ctx);
    });
};