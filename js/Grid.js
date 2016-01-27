/* global util, g_canvas, Bomb, entityManager, Powerups, g_sprites, g_sounds, consts */

function Grid() {    
    var possibleLevels = [
        [
            'XXXXXXXXXXXXXXX',
            'XSS........SSSX',
            'XSX.XXXXXXX.XSX',
            'XS..X.....X...X',
            'X.X.X.X.X.X.X.X',
            'X.............X',
            'X.X.X.X.X.X.X.X',
            'X.............X',
            'X.X.X.X.X.X.X.X',
            'X.............X',
            'X.X.X.X.X.X.X.X',
            'X...X.....X..SX',
            'XSX.XXXXXXX.XSX',
            'XSSS........SSX',
            'XXXXXXXXXXXXXXX'
        ],
        [
            'XXXXXXXXXXXXXXX',
            'XSS........SSSX',
            'XSX.X.X.X.X.XSX',
            'XS............X',
            'X.X.X.X.X.X.X.X',
            'X.............X',
            'X.X.X.X.X.X.X.X',
            'X.............X',
            'X.X.X.X.X.X.X.X',
            'X.............X',
            'X.X.X.X.X.X.X.X',
            'X............SX',
            'XSX.X.X.X.X.XSX',
            'XSSS........SSX',
            'XXXXXXXXXXXXXXX'
        ],
        [
            'XXXXXXXXXXXXXXX',
            'XSS........SSSX',
            'XSX.X.X.X.X.XSX',
            'XSX.X.....X.X.X',
            'X.X.X.X.X.X.X.X',
            'X...X.....X...X',
            'X.X.X.XXX.X.X.X',
            'X......X......X',
            'X.X.X.XXX.X.X.X',
            'X...X.....X...X',
            'X.X.X.X.X.X.X.X',
            'X.X.X.....X.XSX',
            'XSX.X.X.X.X.XSX',
            'XSSS........SSX',
            'XXXXXXXXXXXXXXX'
        ]
    ];
    this.defaultBlocks = possibleLevels[Math.floor(Math.random() * possibleLevels.length)];
    
    this.blocks = this.generateBlocks();
    this.initializeExplosionLayer();
    this.initializeBombLayer();
    this.initializePowerupLayer();
    

}

Grid.DETONATE_BOMB = 'DETONATE_BOMB';

// 15x15 grid
Grid.prototype.widthInBlocks = 15;
Grid.prototype.heightInBlocks = 15;
Grid.prototype.blockWidth = g_canvas.width / Grid.prototype.widthInBlocks;
Grid.prototype.blockHeight = g_canvas.height / Grid.prototype.heightInBlocks;

Grid.prototype.generateBlocks = function() {
    var self = this;
    var blocks = this.defaultBlocks.map(function(row) {
        return row.split('').map(function(block) {
            switch (block) {
                case self.INDESTRUCTIBLE_BLOCK:
                    return {type: self.INDESTRUCTIBLE_BLOCK, isSolid: true};
                case self.NOTHING:
                    var isDestructible = Math.random() < 0.8;
                    if (isDestructible) {
                        var rotation = Math.floor(Math.random() * 4) * Math.PI / 2;
                        return {
                            type: self.DESTRUCTIBLE_BLOCK, 
                            isSolid: true, 
                            rotation: rotation};
                    } else {
                        return {type: self.NOTHING};
                    }
                case self.NOSPAWN:
                    return {type: self.NOSPAWN};
                default:
                    return {type: self.NOTHING};
            }
        });
    });
    return blocks;
};

Grid.prototype.initializeExplosionLayer = function() {
    this.explosionLayer = this.blocks.map(function(row) {
        return row.map(function() { return []; });
    });
};

Grid.prototype.initializeBombLayer = function() {
    this.bombLayer = this.blocks.map(function(row) {
        return row.map(function() { return {}; });
    });
};


Grid.prototype.initializePowerupLayer = function() {
    this.powerupLayer = this.blocks.map(function(row) {
        return row.map(function() { return {}; });
    });
};

// x, y are in raw coordinates
// 
Grid.prototype.tryToAddBomb = function(x, y, bombPower, bombType, player) {
    var gridCoords = this.rawToGridCoords(x, y);
    // gridCoords = { x: x, y: y}
    if (!this.isSolid(gridCoords.x, gridCoords.y)) {
        this.bombLayer[gridCoords.y][gridCoords.x] = 
            {
                bomb: new Bomb(bombPower, bombType, player),
                coords: gridCoords
            }; 
            
        return true;
    }
    return false;
};

Grid.prototype.rawToGridCoords = function(x, y) {
    return {x: Math.floor(x / this.blockWidth),
            y: Math.floor(y / this.blockHeight)};
};

Grid.prototype.BOMB_BLOCK = 'BOMB_BLOCK';
Grid.prototype.INDESTRUCTIBLE_BLOCK = 'X';
Grid.prototype.DESTRUCTIBLE_BLOCK = 'O';
Grid.prototype.NOTHING = '.';
Grid.prototype.NOSPAWN = 'S';

// x and y in grid coordinates
Grid.prototype.isSolid = function(x, y){
    // check for solid tiles in the grid.
    if(this.blocks[y][x].isSolid){
        return true;
    }
    
    if(this.bombLayer[y][x].bomb && !this.bombLayer[y][x].bomb.hasDetonated){
        return true;
    }
    // else nothing is in the way.
    return false;
};

Grid.prototype.isBlockLayerSolid = function(x, y) {
    return !!this.blocks[y][x].isSolid;
};

// x and y in grid coordinates
Grid.prototype.isDestructibleBlock = function(x, y){
    // check for solid tiles in the grid.
    if(this.blocks[y][x].type === this.DESTRUCTIBLE_BLOCK){
        return true;
    }
    return false;
}

Grid.prototype.collidesWithBox = function(posX, posY, width, height) {
    
    // Mögulega villa hér
    
    if (this.blocks[Math.floor(posY / this.blockHeight)][Math.floor(posX / this.blockWidth)].isSolid // top left collides
     || this.blocks[Math.floor(posY / this.blockHeight)][Math.floor((posX+width) / this.blockWidth)].isSolid // top right collides
     || this.blocks[Math.floor((posY+height) / this.blockHeight)][Math.floor(posX / this.blockWidth)].isSolid // bottom left collides
     || this.blocks[Math.floor((posY+height) / this.blockHeight)][Math.floor((posX+width) / this.blockWidth)].isSolid) { // bottom right collides
        return true;
    } else {
        return false;
    }
};

// Kicks bomb at (tileX, tileY) into `direction`
Grid.prototype.kickBombAt = function(tileX, tileY, direction) {
    if (!this.tileHasLivingBomb(tileX, tileY) || !direction) {
        return;
    }
    this.bombLayer[tileY][tileX].wasKicked = true;
    this.bombLayer[tileY][tileX].kickDirection = direction;
};

Grid.prototype.calculateFutureExplosionsAroundBomb = function(bombInfo, shouldPlaySound) {
    shouldPlaySound = shouldPlaySound || false;
    var self = this;
    var searchStopper;
    var bombType = bombInfo.bomb.getType();
    if (bombType === consts.BOMBS.TYPES.PLASMA) {
        if (shouldPlaySound) {
            g_sounds.plasma.currentTime = 0;
            g_sounds.plasma.play();
        }
        searchStopper = function(coords) {
            return false;  
        };
    } else {
        // bombInfo.bomb.getType() === consts.BOMBS.TYPES.REGULAR
        if (shouldPlaySound) {
            g_sounds.explosion.currentTime = 0;
            g_sounds.explosion.play();
        }
        searchStopper = function(coords) {
            return self.isDestructibleBlock(coords.x, coords.y);
        };
    }
    
    var bombPower = bombInfo.bomb.getBombPower();
    var gridCoords = bombInfo.coords;
    
    // Check up from bomb origin
    var upNodes = this.searchForNodes(bombPower, 
        gridCoords.x, gridCoords.y-1,
        function(coords) { coords.y--; }, searchStopper);
    var downNodes = this.searchForNodes(bombPower, 
        gridCoords.x, gridCoords.y+1,
        function(coords) { coords.y++; }, searchStopper);
    var leftNodes = this.searchForNodes(bombPower, 
        gridCoords.x-1, gridCoords.y,
        function(coords) { coords.x--; }, searchStopper);
    var rightNodes = this.searchForNodes(bombPower, 
        gridCoords.x+1, gridCoords.y,
        function(coords) { coords.x++; }, searchStopper);
        
    upNodes = upNodes.map(function(node){node.direction = consts.DIRECTIONS.NORTH; return node;});
    downNodes = downNodes.map(function(node){node.direction = consts.DIRECTIONS.SOUTH; return node;});
    leftNodes = leftNodes.map(function(node){node.direction = consts.DIRECTIONS.WEST; return node;});
    rightNodes = rightNodes.map(function(node){node.direction = consts.DIRECTIONS.EAST; return node;});
    
    return upNodes.concat(downNodes, leftNodes, rightNodes);
};

Grid.prototype.detonateBomb = function(bombInfo) {
    var self = this;
    bombInfo.bomb.manuallyDetonate();
    var bombPower = bombInfo.bomb.getBombPower();
    var gridCoords = bombInfo.coords;
    
    var searchStopper;
    var bombType = bombInfo.bomb.getType();
    if (bombType === consts.BOMBS.TYPES.PLASMA) {
        g_sounds.plasma.currentTime = 0;
        g_sounds.plasma.play();
        searchStopper = function(coords) {
            return false;  
        };
    } else {
        // bombInfo.bomb.getType() === consts.BOMBS.TYPES.REGULAR
        g_sounds.explosion.currentTime = 0;
        g_sounds.explosion.play();
        searchStopper = function(coords) {
            return self.isDestructibleBlock(coords.x, coords.y);
        };
    }
    
    
    // Check up from bomb origin
    var upNodes = this.searchForNodes(bombPower, 
        gridCoords.x, gridCoords.y-1,
        function(coords) { coords.y--; }, searchStopper);
    var downNodes = this.searchForNodes(bombPower, 
        gridCoords.x, gridCoords.y+1,
        function(coords) { coords.y++; }, searchStopper);
    var leftNodes = this.searchForNodes(bombPower, 
        gridCoords.x-1, gridCoords.y,
        function(coords) { coords.x--; }, searchStopper);
    var rightNodes = this.searchForNodes(bombPower, 
        gridCoords.x+1, gridCoords.y,
        function(coords) { coords.x++; }, searchStopper);
        
    upNodes = upNodes.map(function(node){node.direction = consts.DIRECTIONS.NORTH; return node;});
    downNodes = downNodes.map(function(node){node.direction = consts.DIRECTIONS.SOUTH; return node;});
    leftNodes = leftNodes.map(function(node){node.direction = consts.DIRECTIONS.WEST; return node;});
    rightNodes = rightNodes.map(function(node){node.direction = consts.DIRECTIONS.EAST; return node;});
    
    var allNodes = upNodes.concat(downNodes, leftNodes, rightNodes);
    self.explosionLayer[gridCoords.y][gridCoords.x].push({
        lifetime: bombInfo.bomb.detonationThreshold,
        fromBombOfType: bombType,
        isCentre: true,
        isEnd: false
    });
    allNodes.forEach(function(node) {
        self.explosionLayer[node.y][node.x].push({
            lifetime: bombInfo.bomb.detonationThreshold,
            fromBombOfType: bombType,
            direction: node.direction,
            isEnd: node.isEnd
        });
        if (self.bombLayer[node.y][node.x].bomb) {
            self.detonateBomb(self.bombLayer[node.y][node.x]);
        }
    });
};

Grid.prototype.searchForNodes = function(iterations, startX, startY, updateCoords, searchStopper) {
    var coords = {x: startX, y: startY};
    var nodes = [];
    while (iterations > 0 && (!(this.isBlockLayerSolid(coords.x, coords.y) 
                                || this.tileHasBomb(coords.x, coords.y))
                             || this.tileHasLivingBomb(coords.x, coords.y)
                             || this.isDestructibleBlock(coords.x, coords.y))) {
        iterations--;
        if (searchStopper(coords)) {
            iterations = 0;
        }
        var newNode = {x: coords.x, y: coords.y};
        if(iterations === 0) {
            newNode.isEnd = true;
        }
        nodes.push(newNode);
        updateCoords(coords);
    }
    return nodes;
};

Grid.prototype.tileHasLivingBomb = function(x, y){
    var bomb = this.bombLayer[y][x].bomb;
    if(bomb && !bomb.hasDetonated){
        return true;
    }
    return false;
};

Grid.prototype.tileHasBomb = function(x, y) {
    return !!this.bombLayer[y][x].bomb;
};

Grid.prototype.tileHasExplosion = function(x, y) {
    return this.explosionLayer[y][x].length > 0;
};

Grid.prototype.update = function(du){
    
    this.updateBombLayer(du);
    
    this.updateExplosionLayer(du);
};

Grid.prototype.generatePowerUp = function(x, y){
    if(Math.random() < 0.3) return;
    this.powerupLayer[y][x] = Powerups.randomPowerUp();
};

Grid.prototype.grabUpgrades = function(player){
    var gridCoords = this.rawToGridCoords(player.cx+player.width/2, player.cy+player.height/2);
    var x = gridCoords.x;
    var y = gridCoords.y;
    if(this.tileHasPowerup(x, y)){
        this.powerupLayer[y][x].powerup(player);
        this.powerupLayer[y][x] = {};
    }
};

Grid.prototype.tileHasPowerup = function(x, y){
    return !!this.powerupLayer[y][x].powerup;
};

Grid.prototype.getAllLivingBombs = function() {
    var livingBombs = [];
    for (var y = 0; y < this.bombLayer.length; y++) {
        var row = this.bombLayer[y];
        for (var x = 0; x < row.length; x++) {
            if (this.tileHasLivingBomb(x, y)) {
                livingBombs.push(row[x]);
            }
        }
    }
    return livingBombs;
};

Grid.prototype.updateExplosionLayer = function(du){
    var self = this;
    for (var i = this.explosionLayer.length - 1; i >= 0; i--) {
        var row = this.explosionLayer[i];
        for (var j = row.length - 1; j >= 0; j--) {
            for (var k = row[j].length - 1; k >= 0; k--) {
                var explosionNode = row[j][k];
                if (explosionNode.lifetime) {
                    if (explosionNode.lifetime <= 0) {
                        if (self.isDestructibleBlock(j, i)) {
                            self.blocks[i][j] = self.NOTHING;
                            self.generatePowerUp(j, i);
                        }
                        self.explosionLayer[i][j].splice(k, 1);
                    } else {
                        explosionNode.lifetime -= du;
                    }
                }
            }
        }
    }
};

Grid.prototype.kickedBombSpeed = 5;
Grid.prototype.updateBombLayer = function(du){
    var movingBombs = [];
    var self = this;
    var bombNodeCopy;
    for (var i = this.bombLayer.length - 1; i >= 0; i--) {
        var row = this.bombLayer[i];
        for (var j = row.length - 1; j >= 0; j--) {
            var bombNode = row[j];
            if (bombNode.bomb) {
                var bombState = bombNode.bomb.update(du);
                if (bombState === entityManager.KILL_ME_NOW) {
                    self.bombLayer[i][j] = {};
                } else if (bombState === Grid.DETONATE_BOMB) {
                    this.detonateBomb(bombNode);
                } else if (bombNode.wasKicked && movingBombs.indexOf(bombNode) === -1) {
                    bombNodeCopy = undefined;
                    switch (bombNode.kickDirection) {
                        case consts.DIRECTIONS.NORTH: {
                            bombNode.offsetY = (bombNode.offsetY || 0) - self.kickedBombSpeed * du;
                            if (bombNode.offsetY < 0) {
                                if (self.isSolid(j, i-1)) {
                                    self.bombLayer[i][j].offsetY = 0;
                                } else {
                                    var offsetForNextTile = self.blockWidth + bombNode.offsetY;
                                    bombNodeCopy = util.shallowCopyObject(bombNode);
                                    bombNodeCopy.coords.y -= 1;
                                    bombNodeCopy.offsetY = offsetForNextTile;
                                    self.bombLayer[i-1][j] = bombNodeCopy;
                                    self.bombLayer[i][j] = {};
                                }
                            }
                            break;
                        }
                        case consts.DIRECTIONS.WEST: {
                            bombNode.offsetX = (bombNode.offsetX || 0) - self.kickedBombSpeed * du;
                            if (bombNode.offsetX < 0) {
                                if (self.isSolid(j-1, i)) {
                                    self.bombLayer[i][j].offsetX = 0;
                                } else {
                                    var offsetForNextTile = self.blockWidth + bombNode.offsetX;
                                    bombNodeCopy = util.shallowCopyObject(bombNode);
                                    bombNodeCopy.coords.x -= 1;
                                    bombNodeCopy.offsetX = offsetForNextTile;
                                    self.bombLayer[i][j-1] = bombNodeCopy;
                                    self.bombLayer[i][j] = {};
                                }
                            }
                            break;
                        }
                        case consts.DIRECTIONS.SOUTH: {
                            bombNode.offsetY = (bombNode.offsetY || 0) + self.kickedBombSpeed * du;
                            if (self.isSolid(j, i+1)) {
                                self.bombLayer[i][j].offsetY = 0;
                            }
                            if (bombNode.offsetY > self.blockWidth) {
                                var offsetForNextTile = bombNode.offsetY - self.blockWidth;
                                bombNodeCopy = util.shallowCopyObject(bombNode);
                                bombNodeCopy.coords.y += 1;
                                bombNodeCopy.offsetY = offsetForNextTile;
                                self.bombLayer[i+1][j] = bombNodeCopy;
                                self.bombLayer[i][j] = {};
                            }
                            break;
                        }
                        case consts.DIRECTIONS.EAST: {
                            bombNode.offsetX = (bombNode.offsetX || 0) + self.kickedBombSpeed * du;
                            if (self.isSolid(j+1, i)) {
                                self.bombLayer[i][j].offsetX = 0;
                            }
                            if (bombNode.offsetX > self.blockWidth) {
                                var offsetForNextTile = bombNode.offsetX - self.blockWidth;
                                bombNodeCopy = util.shallowCopyObject(bombNode);
                                bombNodeCopy.coords.x += 1;
                                bombNodeCopy.offsetX = offsetForNextTile;
                                self.bombLayer[i][j+1] = bombNodeCopy;
                                self.bombLayer[i][j] = {};
                            }
                            break;
                        }
                    }
                    if (bombNodeCopy) {
                        movingBombs.push(bombNodeCopy);
                    }
                }
            }
        }
    }
};

Grid.prototype.isPlayerInExplosion = function(player) {
    var pos = player.getPos();
    var dim = player.getDimensions();
    // Check if center of player is in explosion
    if (this.explosionLayer[Math.floor((pos.posY + dim.height/2) / this.blockHeight)][Math.floor((pos.posX + dim.width/2) / this.blockWidth)].length > 0) {
        AudioSystem.playSound(g_sounds.hit);
        return true;
    } else {
        return false;
    }
    // More punishing check:
    // if (this.explosionLayer[Math.floor(pos.posY / this.blockHeight)][Math.floor(pos.posX / this.blockWidth)].lifetime // top left collides
    //  || this.explosionLayer[Math.floor(pos.posY / this.blockHeight)][Math.floor((pos.posX+dim.width) / this.blockWidth)].lifetime // top right collides
    //  || this.explosionLayer[Math.floor((pos.posY+dim.height) / this.blockHeight)][Math.floor(pos.posX / this.blockWidth)].lifetime // bottom left collides
    //  || this.explosionLayer[Math.floor((pos.posY+dim.height) / this.blockHeight)][Math.floor((pos.posX+dim.width) / this.blockWidth)].lifetime) { // bottom right collides
    //     return true;
    // } else {
    //     return false;
    // }
};

// x, y are in grid coordinates
Grid.prototype.gridToRawCoords = function(x, y){
    var ax = x * this.blockWidth;
    var ay = y * this.blockHeight;
    return { x: ax, y: ay};
};

Grid.prototype.renderBlocks = function(ctx) {
    var self = this;
    this.blocks.forEach(function(row, rowIndex) {
        row.forEach(function(block, blockIndex) {
            switch (block.type) {
                case self.INDESTRUCTIBLE_BLOCK: {
                    util.fillBox(ctx,
                                 blockIndex * self.blockHeight,
                                 rowIndex * self.blockWidth,
                                 self.blockWidth, self.blockHeight,
                                 'black');
                    g_sprites["brickwall"].drawCentredAt(
                            ctx,
                            blockIndex * self.blockHeight + self.blockHeight/2,
                            rowIndex * self.blockWidth + self.blockWidth/2);
                    break;
                }
                case self.DESTRUCTIBLE_BLOCK: {
                    util.fillBox(ctx,
                                 blockIndex * self.blockHeight,
                                 rowIndex * self.blockWidth,
                                 self.blockWidth, self.blockHeight,
                                 'gray');
                    
                    g_sprites["rockswall"].drawCentredAt(
                            ctx,
                            blockIndex * self.blockHeight + self.blockHeight/2,
                            rowIndex * self.blockWidth + self.blockWidth/2,
                            block.rotation);
                    break;
                } 
                default: {
                    util.fillBox(ctx,
                                 blockIndex * self.blockHeight,
                                 rowIndex * self.blockWidth,
                                 self.blockWidth, self.blockHeight,
                                 'gray');
                    g_sprites["floor"].drawCentredAt(
                            ctx,
                            blockIndex * self.blockHeight + self.blockHeight/2,
                            rowIndex * self.blockWidth + self.blockWidth/2);
                }
            }
        });
    });
};



Grid.prototype.renderBombs = function(ctx) {
    
    var self = this;

    function renderBomb(bombNode, x, y) {
        ctx.save();
        
        // var x = bombNode.coords.x;
        // var y = bombNode.coords.y;
        var aCoords = self.gridToRawCoords(x, y);
        
        ctx.translate(aCoords.x + (bombNode.offsetX || 0),
                      aCoords.y + (bombNode.offsetY || 0));
        bombNode.bomb.render(ctx, self.blockWidth, self.blockHeight);

        
        
        ctx.restore();
    }
    
    for (var i = this.bombLayer.length - 1; i >= 0; i--) {
        var row = this.bombLayer[i];
        for (var j = row.length - 1; j >= 0; j--) {
            var bombNode = row[j];
            if(bombNode.bomb){
                renderBomb(bombNode, j, i);
            }
        }
    }
};

Grid.prototype.renderPowerups = function(ctx) {
    var self = this;
    ctx.save();
    ctx.fillStyle = 'cyan';
    this.powerupLayer.forEach(function(row, rowIndex) {
        row.forEach(function(powerupNode, columnIndex) {
            if (powerupNode.powerup) {
                var coords = self.gridToRawCoords(columnIndex, rowIndex);
                var radius = self.blockHeight/2;
                if(powerupNode.sprite){
                    g_sprites[powerupNode.sprite].drawCentredAt(ctx, coords.x+radius, coords.y+radius);
                }else{
                    ctx.fillStyle = powerupNode.color || ctx.fillStyle;
                    util.fillCircle(ctx, coords.x+radius, coords.y+radius, radius);
                }
            }
        });
    });
    ctx.restore();
};

Grid.prototype.renderExplosions = function(ctx) {
    var self = this;
    ctx.save();
    ctx.fillStyle = 'orange';
    // var explosionsRendered = {row: [], column: []};
    this.explosionLayer.forEach(function(row, rowIndex) {
        row.forEach(function(explosionNodes, columnIndex) {
            explosionNodes.forEach(function(explosionNode) {
                if (explosionNode.lifetime && explosionNode.lifetime > 0) {
                    var coords = self.gridToRawCoords(columnIndex, rowIndex);
                    var radius = self.blockHeight/2;
                    
                    ctx.save();
                    var rotation = 0;
                    if (explosionNode.direction === consts.DIRECTIONS.SOUTH) {
                        rotation = Math.PI;
                    } else if (explosionNode.direction === consts.DIRECTIONS.EAST) {
                        rotation = 1/2 * Math.PI;
                    } else if (explosionNode.direction === consts.DIRECTIONS.WEST) {
                        rotation = -1/2 * Math.PI;
                    }
                    ctx.fillStyle = "black";
                    ctx.translate(coords.x + radius, coords.y + radius);
                    ctx.rotate(rotation);
                    
                    // if (explosionNode.isEnd) {
                    //     ctx.save();
                    //     ctx.fillStyle = "red";
                    //     ctx.beginPath();
                    //     ctx.arc(0, 0, radius/2, 0, Math.PI*2, true);
                    //     ctx.fillStyle = "rgba(0, 0, 255, 1.0)";
                    //     ctx.fillRect(-radius/2, -radius, radius, radius);
                    //     ctx.closePath();
                    //     ctx.fill();
                    //     ctx.restore();
                    // } else {
                    //     ctx.fillStyle = "rgba(0, 0, 255, 1.0)";
                    //     ctx.fillRect(-radius/2, -radius, radius, radius*2);
                    //     if (explosionNode.isCentre) {
                    //         ctx.fillRect(-radius, -radius/2, radius*2, radius);
                    //     }
                    // }
                    
                    var sprite;
                    if (explosionNode.fromBombOfType === consts.BOMBS.TYPES.PLASMA) {
                        sprite = g_sprites.plasmaExplosion;
                    } else {
                        sprite = g_sprites.explosion;
                    }
                    
                    if (explosionNode.isEnd) {
                        sprite.drawClippedCentredAt(ctx,
                                0, 0,
                                consts.TILESETS.EXPLOSIONS.END.x,
                                consts.TILESETS.EXPLOSIONS.END.y);
                    } else {
                        if (explosionNode.isCentre) {
                            // g_sprites["explosion_centre"].drawCentredAt(ctx, 0, 0); // Er þetta ekki meira kúl?
                            // j'u kannski
                            // J'u kannski segir hann, og commentar 'ut
                            // haha, mig langadi bara ad setja plasma sry
                            sprite.drawClippedCentredAt(ctx,
                                0, 0,
                                consts.TILESETS.EXPLOSIONS.CENTRE.x,
                                consts.TILESETS.EXPLOSIONS.CENTRE.y);
                        } else {
                            sprite.drawClippedCentredAt(ctx,
                                0, 0,
                                consts.TILESETS.EXPLOSIONS.MIDDLE.x,
                                consts.TILESETS.EXPLOSIONS.MIDDLE.y);
                        }
                    }
                    
                    ctx.restore();
                }
            });
        });
    });
    ctx.restore();
};

Grid.prototype.render = function(ctx) {
    this.renderBlocks(ctx);
    this.renderBombs(ctx);
    this.renderPowerups(ctx);
    this.renderExplosions(ctx);
};