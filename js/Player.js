/* global util, keys, Entity, spatialManager, entityManager, eatKey, NOMINAL_UPDATE_INTERVAL, consts, g_sprites, g_sounds, AudioSystem */

function Player(descr) {
    
    // Common inherited setup logic from Entity
    this.setup(descr);
    
    this.initializeParticles();
    this.KEY_UP = descr.keyUp;
    this.KEY_DOWN = descr.keyDown;
    this.KEY_LEFT = descr.keyLeft;
    this.KEY_RIGHT = descr.keyRight;
    
    this.KEY_PUT_BOMB = descr.keyPutBomb;
    this.commands = descr.commandObject;
    this.initializeResetValues();
    
    var r = Math.floor(Math.random() * 155) + 100;
    var g = Math.floor(Math.random() * 155) + 100;
    var b = Math.floor(Math.random() * 155) + 100;
    this.color = {
        r: r,
        g: g,
        b: b
    }
}

Player.prototype = new Entity();

Player.prototype.maxSpeed = 5;
Player.prototype.reset_livesRemaining = Player.prototype.livesRemaining = 3;
Player.prototype.reset_speed = Player.prototype.speed = 2.5;
Player.prototype.reset_bombPower = Player.prototype.bombPower = 1;
Player.prototype.reset_bombsAvailable = Player.prototype.bombsAvailable = 1;
Player.prototype.reset_safetyPeriodRemaining = Player.prototype.safetyPeriodRemaining = 0;
Player.prototype.reset_hasKickBombAbility = Player.prototype.hasKickBombAbility = false;
Player.prototype.reset_hasPlasmaBombs = Player.prototype.hasPlasmaBombs = false;
Player.prototype.defaultSafetyDuration = 3000 / NOMINAL_UPDATE_INTERVAL;

Player.prototype.KEY_UP = 'W'.charCodeAt(0);
Player.prototype.KEY_DOWN = 'S'.charCodeAt(0);
Player.prototype.KEY_LEFT = 'A'.charCodeAt(0);
Player.prototype.KEY_RIGHT = 'D'.charCodeAt(0);

Player.prototype.KEY_PUT_BOMB = ' '.charCodeAt(0);

Player.prototype.reset = function() {
    this.livesRemaining = this.reset_livesRemaining;
    this.speed = this.reset_speed;
    this.bombPower = this.reset_bombPower;
    this.bombsAvailable = this.reset_bombsAvailable;
    this.hasKickBombAbility = this.reset_hasKickBombAbility;
    this.hasPlasmaBombs = this.reset_hasPlasmaBombs;
    this.safetyPeriodRemaining = this.defaultSafetyDuration;
    this.cx = this.reset_cx;
    this.cy = this.reset_cy;
    this._isDeadNow = false;
};

Player.prototype.initializeResetValues = function() {
    this.reset_cx = this.cx;
    this.reset_cy = this.cy;
};

Player.prototype.registerToArena = function(arena) {
    this.arena = arena;
};

Player.prototype.maybeLayDownBomb = function() {
    if(this.bombsAvailable <= 0){
        return;
    }
    if (eatKey(this.KEY_PUT_BOMB, this.commands)) {
        var bombPlaced = this.arena.layDownBomb(this.cx+this.width/2, 
                                this.cy+this.height/2,
                                this.bombPower,
                                this.hasPlasmaBombs ? consts.BOMBS.TYPES.PLASMA 
                                                    : consts.BOMBS.TYPES.REGULAR,
                                this);
        if (bombPlaced) {
            this.bombsAvailable--;
            AudioSystem.playSound(g_sounds.dropbomb);
        }
    }
};



Player.prototype.initializeParticles = function(){
    this.particles = [];
    for(var i=0; i<50; i++){
        this.particles.push(this.createParticle());
    }
};
Player.prototype.createParticle = function(){
    var cx = this.cx+this.height/2+(Math.random()-0.5)*this.height;
    var cy = this.cy+this.height/2+(Math.random()-0.5)*this.height;
    var r = 2+Math.random()*3;
    var alpha = 0.1 + Math.random()*0.5;
    return {
        cx: cx,
        cy: cy,
        r: r,
        alpha: alpha
    };
};

Player.prototype.updateParticles = function(du){
    this.particles.pop();
    this.particles.unshift(this.createParticle());
};

Player.prototype.renderParticles = function(ctx){
    var self = this;
    ctx.save();
    this.particles.forEach(function(particle) {
        ctx.fillStyle = 
            "rgba(" + self.color.r+ ", " + 
                      self.color.g + ", " + 
                      self.color.b + ", " + 
                      particle.alpha + ")";
        util.fillCircle(ctx, particle.cx, particle.cy, particle.r);
    });
    ctx.restore();
};

Player.prototype.giveKickBombAbility = function() {
    this.hasKickBombAbility = true;  
};

Player.prototype.givePlasmaBombs = function() {
    this.hasPlasmaBombs = true;  
};

Player.prototype.giveBomb = function() {
    this.bombsAvailable++;
};

Player.prototype.increaseBombPower = function() {
    this.bombPower++;
};

Player.prototype.increaseSpeed = function() {
    this.speed = Math.min(this.speed * 1.2, this.maxSpeed);
};

Player.prototype.enableTemporarySafetyPeriod = function() {
    this.safetyPeriodRemaining = this.defaultSafetyDuration;
};

Player.prototype.movePlayer = function(du) {
    var tileHeight = this.arena.getTileHeight();
    var tileWidth = this.arena.getTileWidth();
    
    var horizontalThreshold = tileWidth / 6;
    var verticalThreshold = tileHeight / 6;
    
    var newX = this.cx;
    var newY;
    var oldX = this.cx;
    var oldY = this.cy;
    var playerCenter = {x: this.cx + this.width/2, y: this.cy + this.height/2};
    
    var gridCoords = undefined;
    var isPlayerInBombInfo = this.arena.isPlayerInBomb(this);
    var isPlayerInBomb = isPlayerInBombInfo.isPlayerInBomb;
    var bombCoords = isPlayerInBombInfo.coords;
    if (this.commands[this.KEY_LEFT]) {
        newX -= this.speed * du;
        gridCoords = undefined;
        if (this.arena.isTileBlockedAtRawCoords(newX, this.cy)) {
            gridCoords = this.arena.rawToGridCoords(newX, this.cy);
        } else if (this.arena.isTileBlockedAtRawCoords(newX, this.cy + this.height)) {
            gridCoords = this.arena.rawToGridCoords(newX, this.cy + this.height);
        }
        // Check if new pos is blocked and if the current position has a bomb
        // then treat it as transparent
        if ((!isPlayerInBomb && gridCoords) ||
            (gridCoords && (gridCoords.x !== bombCoords.x || gridCoords.y !== bombCoords.y))) {
            var gridCoordsRawCenter = {x: gridCoords.x * tileWidth + tileWidth / 2,
                                       y: gridCoords.y * tileHeight + tileHeight / 2};
            
            // Check if there is a bomb blocking us and if have the ability to kick it
            if (this.hasKickBombAbility && this.arena.tileHasLivingBomb(gridCoords.x, gridCoords.y)) {
                this.arena.kickBombAt(gridCoords.x, gridCoords.y, consts.DIRECTIONS.WEST);
            }
            // set x to the x of the right edge of the tile that new x is on
            // and use up the amount of du we need to get the player there!
            
            newX = gridCoordsRawCenter.x + tileWidth / 2 + consts.EPSILON;
            
            
            var remainingDu = du - Math.abs(newX - oldX) / this.speed;
            
            
            if (
                !(this.commands[this.KEY_DOWN] || this.commands[this.KEY_UP]) 
                && (playerCenter.y > gridCoordsRawCenter.y + verticalThreshold)) {
                // predict movement down, if the tile diagonally bottom-left is clear
                
                // Check if there is a clear block below the blocking tile
                if (!this.arena.isTileBlockedAt(gridCoords.x, gridCoords.y + 1)) {
                    // Move down for remaining du
                    var maxMovement = (gridCoords.y + 2) * tileHeight - this.height - consts.EPSILON;
                    newY = Math.min(this.cy + this.speed * remainingDu,
                                    maxMovement);
                }
            } else if (
                !(this.commands[this.KEY_DOWN] || this.commands[this.KEY_UP]) 
                && (playerCenter.y < gridCoordsRawCenter.y - verticalThreshold)) {
                // predict movement up, if the tile diagonally upper-left is clear
                
                // Check if there is a clear block above the blocking tile
                if (!this.arena.isTileBlockedAt(gridCoords.x, gridCoords.y - 1)) {
                    // Move up for remaining du
                    var maxMovement = (gridCoords.y - 1) * tileHeight + consts.EPSILON;
                    newY = Math.max(this.cy - this.speed * remainingDu,
                                    maxMovement);
                }
            }
        }
    }
    
    
    if (this.commands[this.KEY_RIGHT]) {
        newX += this.speed * du;
        gridCoords = undefined;
        if (this.arena.isTileBlockedAtRawCoords(newX + this.width, this.cy)) {
            gridCoords = this.arena.rawToGridCoords(newX + this.width, this.cy);
        } else if (this.arena.isTileBlockedAtRawCoords(newX + this.width, this.cy + this.height)) {
            gridCoords = this.arena.rawToGridCoords(newX + this.width, this.cy + this.height);
        }
        // Check if new pos is blocked
        if ((!isPlayerInBomb && gridCoords) ||
            (gridCoords && (gridCoords.x !== bombCoords.x || gridCoords.y !== bombCoords.y))) {
            var gridCoordsRawCenter = {x: gridCoords.x * tileWidth + tileWidth / 2,
                                       y: gridCoords.y * tileHeight + tileHeight / 2};
                                       
            // Check if there is a bomb blocking us and if have the ability to kick it
            if (this.hasKickBombAbility && this.arena.tileHasLivingBomb(gridCoords.x, gridCoords.y)) {
                this.arena.kickBombAt(gridCoords.x, gridCoords.y, consts.DIRECTIONS.EAST);
            }
            // set x to the x of the left edge of the tile that new x is on
            // and use up the amount of du we need to get the player there!
            newX = gridCoordsRawCenter.x - tileWidth / 2 - this.width - consts.EPSILON;
            var remainingDu = du - Math.abs(newX - oldX) / this.speed;
            
            
            if (
                !(this.commands[this.KEY_DOWN] || this.commands[this.KEY_UP]) 
                && (playerCenter.y > gridCoordsRawCenter.y + verticalThreshold)) {
                // predict movement down, if the tile diagonally bottom-left is clear
                
                // Check if there is a clear block below the blocking tile
                if (!this.arena.isTileBlockedAt(gridCoords.x, gridCoords.y + 1)) {
                    // Move down for remaining du
                    var maxMovement = (gridCoords.y + 2) * tileHeight - this.height - consts.EPSILON;
                    newY = Math.min(this.cy + this.speed * remainingDu,
                                    maxMovement);
                }
            } else if (
                !(this.commands[this.KEY_DOWN] || this.commands[this.KEY_UP]) 
                && (playerCenter.y < gridCoordsRawCenter.y - verticalThreshold)) {
                // predict movement up, if the tile diagonally upper-left is clear
                
                // Check if there is a clear block above the blocking tile
                if (!this.arena.isTileBlockedAt(gridCoords.x, gridCoords.y - 1)) {
                    // Move up for remaining du
                    var maxMovement = (gridCoords.y - 1) * tileHeight + consts.EPSILON;
                    newY = Math.max(this.cy - this.speed * remainingDu,
                                    maxMovement);
                }
            }
        }
    }
    
    // this betrays du!!!
    // Why did we have to do this again?
    this.cx = newX || this.cx;
    this.cy = newY || this.cy;
    isPlayerInBombInfo = this.arena.isPlayerInBomb(this);
    isPlayerInBomb = isPlayerInBombInfo.isPlayerInBomb;
    bombCoords = isPlayerInBombInfo.coords
    
    if (this.commands[this.KEY_UP]) {
        newY = this.cy - this.speed * du;
        gridCoords = undefined;
        if (this.arena.isTileBlockedAtRawCoords(this.cx, newY)) {
            gridCoords = this.arena.rawToGridCoords(this.cx, newY);
        } else if (this.arena.isTileBlockedAtRawCoords(this.cx + this.width, newY)) {
            gridCoords = this.arena.rawToGridCoords(this.cx + this.width, newY);
        }
        // Check if new pos is blocked
        if ((!isPlayerInBomb && gridCoords) ||
            (gridCoords && (gridCoords.x !== bombCoords.x || gridCoords.y !== bombCoords.y))) {
            var gridCoordsRawCenter = {x: gridCoords.x * tileWidth + tileWidth / 2,
                                       y: gridCoords.y * tileHeight + tileHeight / 2};
            
            
            // Check if there is a bomb blocking us and if have the ability to kick it
            if (this.hasKickBombAbility && this.arena.tileHasLivingBomb(gridCoords.x, gridCoords.y)) {
                this.arena.kickBombAt(gridCoords.x, gridCoords.y, consts.DIRECTIONS.NORTH);
            }
            // set y to the y of the bottom edge of the tile that new y is on
            // and use up the amount of du we need to get the player there!
            newY = gridCoordsRawCenter.y + tileWidth / 2 + consts.EPSILON;
            remainingDu = du - Math.abs(newY - oldY) / this.speed;
            
            if (
                !(this.commands[this.KEY_LEFT] || this.commands[this.KEY_RIGHT]) 
                && (playerCenter.x > gridCoordsRawCenter.x + horizontalThreshold)) {
                // predict movement right, if the tile diagonally upper-right is clear
                
                // Check if there is a clear block to the right of the blocking tile
                if (!this.arena.isTileBlockedAt(gridCoords.x + 1, gridCoords.y)) {
                    // Move right for remaining du
                    var maxMovement = (gridCoords.x + 2) * tileWidth - this.width - consts.EPSILON;
                    newX = Math.min(this.cx + this.speed * remainingDu,
                                    maxMovement);
                }
            } else if (
                !(this.commands[this.KEY_LEFT] || this.commands[this.KEY_RIGHT]) 
                && (playerCenter.x < gridCoordsRawCenter.x - horizontalThreshold)) {
                // predict movement up, if the tile diagonally upper-left is clear
                
                // Check if there is a clear block to the left of the blocking tile
                if (!this.arena.isTileBlockedAt(gridCoords.x - 1, gridCoords.y)) {
                    // Move up for remaining du
                    var maxMovement = (gridCoords.x - 1) * tileWidth + consts.EPSILON;
                    newX = Math.max(this.cx - this.speed * remainingDu,
                                    maxMovement);
                }
            }
        }
    }
    
    if (this.commands[this.KEY_DOWN]) {
        newY = this.cy + this.speed * du;
        gridCoords = undefined;
        if (this.arena.isTileBlockedAtRawCoords(this.cx, newY + this.height)) {
            gridCoords = this.arena.rawToGridCoords(this.cx, newY + this.height);
        } else if (this.arena.isTileBlockedAtRawCoords(this.cx + this.width, newY + this.height)) {
            gridCoords = this.arena.rawToGridCoords(this.cx + this.width, newY + this.height);
        }
        // Check if new pos is blocked
        if ((!isPlayerInBomb && gridCoords) ||
            (gridCoords && (gridCoords.x !== bombCoords.x || gridCoords.y !== bombCoords.y))) {
            var gridCoordsRawCenter = {x: gridCoords.x * tileWidth + tileWidth / 2,
                                       y: gridCoords.y * tileHeight + tileHeight / 2};
                                       
            // Check if there is a bomb blocking us and if have the ability to kick it
            if (this.hasKickBombAbility && this.arena.tileHasLivingBomb(gridCoords.x, gridCoords.y)) {
                this.arena.kickBombAt(gridCoords.x, gridCoords.y, consts.DIRECTIONS.SOUTH);
            }
            // set y to the y of the upper edge of the tile that new y is on
            // and use up the amount of du we need to get the player there!
            newY = gridCoordsRawCenter.y - tileWidth / 2 - this.width - consts.EPSILON;
            remainingDu = du - Math.abs(newY - oldY) / this.speed;
            
            if (
                !(this.commands[this.KEY_LEFT] || this.commands[this.KEY_RIGHT]) 
                && (playerCenter.x > gridCoordsRawCenter.x + horizontalThreshold)) {
                // predict movement right, if the tile diagonally upper-right is clear
                
                // Check if there is a clear block to the right of the blocking tile
                if (!this.arena.isTileBlockedAt(gridCoords.x + 1, gridCoords.y)) {
                    // Move right for remaining du
                    var maxMovement = (gridCoords.x + 2) * tileWidth - this.width - consts.EPSILON;
                    newX = Math.min(this.cx + this.speed * remainingDu,
                                    maxMovement);
                }
            } else if (
                !(this.commands[this.KEY_LEFT] || this.commands[this.KEY_RIGHT]) 
                && (playerCenter.x < gridCoordsRawCenter.x - horizontalThreshold)) {
                // predict movement up, if the tile diagonally upper-left is clear
                
                // Check if there is a clear block to the left of the blocking tile
                if (!this.arena.isTileBlockedAt(gridCoords.x - 1, gridCoords.y)) {
                    // Move up for remaining du
                    newX = this.cx - this.speed * remainingDu;
                    var maxMovement = (gridCoords.x - 1) * tileWidth + consts.EPSILON;
                    newX = Math.max(this.cx - this.speed * remainingDu,
                                    maxMovement);
                }
            }
        }
    }
    
    if( this.commands[this.KEY_LEFT] ||
        this.commands[this.KEY_UP] ||
        this.commands[this.KEY_DOWN] ||
        this.commands[this.KEY_RIGHT]
        
    ){
        g_sounds.walk.volume = 0.5;
        // console.log('keys are down');
    }else{
        g_sounds.walk.volume = 0;
        // console.log('keys are up');
    }
    
    
    
    
    this.cx = newX || this.cx;
    this.cy = newY || this.cy;
};

Player.prototype.update = function(du) {
    if (this._isDeadNow) {
        return entityManager.KILL_ME_NOW;
    }
    
    if (this.safetyPeriodRemaining > 0) {
        this.safetyPeriodRemaining -= du;
    }

    this.movePlayer(du);
    
    // check for upgrades after moving
    this.arena.grabUpgrades(this);
    
    this.maybeLayDownBomb();
    
    if (this.safetyPeriodRemaining <= 0 && this.arena.isPlayerInExplosion(this)) {
        this.livesRemaining--;
        if (this.livesRemaining < 0) {
            // Lose condition
            this._isDeadNow = true;
        } else {
            this.enableTemporarySafetyPeriod();
        }
    }
    
    this.updateParticles(du);
    
};

Player.prototype.sprite = "man";
Player.prototype.sprite2 = "man2";
Player.prototype.sprite1 = "man1";
Player.prototype.sprite0 = "man0";

Player.prototype.render = function(ctx) {
    
    var radius = this.width/2;
    
    // ctx.save();
    
    // util.fillBox(ctx, this.cx, this.cy, this.width, this.height, 
    //     this.safetyPeriodRemaining > 0 ? 'lightyellow' : 'yellow');
    // ctx.fillStyle = "black";
    // util.fillCircle(ctx, this.cx+radius*2/4, this.cy+radius/2, radius/5);
    // util.fillCircle(ctx, this.cx+radius*6/4, this.cy+radius/2, radius/5);
    // ctx.beginPath();
    // ctx.moveTo(this.cx + radius/2, this.cy+radius);
    // ctx.lineTo(this.cx + 3*radius/2, this.cy+radius);
    // ctx.lineTo(this.cx + radius/2 + radius/4, this.cy + radius + radius/2);
    // ctx.closePath();
    // ctx.fill();
    
    
    // ctx.restore();
    
    ctx.save();
    this.renderParticles(ctx);
    if (this.safetyPeriodRemaining > 0) {
        ctx.globalAlpha = 0.6 + (Math.sin((new Date()).getTime()/100) + 1)/(2*3);
    }
    
    ctx.translate(0, -5);
    
    if (this.livesRemaining > 2) {
        g_sprites[this.sprite].drawCentredAt(ctx, this.cx+radius, this.cy+radius+4);
    } else if (this.livesRemaining === 2) {
        g_sprites[this.sprite2].drawCentredAt(ctx, this.cx+radius, this.cy+radius+4);
    } else if (this.livesRemaining === 1) {                                                                 
        g_sprites[this.sprite1].drawCentredAt(ctx, this.cx+radius, this.cy+radius+4);
    } else if (this.livesRemaining <= 0) {
        g_sprites[this.sprite0].drawCentredAt(ctx, this.cx+radius, this.cy+radius+4);
    }
    
    
    //g_sprites[this.sprite].drawCentredAt(ctx, this.cx+radius, this.cy+radius+4);
    
    
    ctx.restore();
};