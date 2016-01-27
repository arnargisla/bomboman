/* global consts, util, NOMINAL_UPDATE_INTERVAL */

/** The AI has a `player` in the `arena` which 
 *  it can control through `commandObject`
 *  
 *  Behaviour:
 *   If the AI thinks it can reach a PowerUp before a Player it should
 *   attempt to do so, looking out for bombs along the way.
 *  
 */
function AI(arena, player, commandObject) {
    this.arena = arena;
    this.player = player;
    this.player.isAI = true;
    this.commandObject = commandObject;
    this.grid = arena.getGrid();
    var names = ["Robotron", "HAL", "Pat", "Sungod", "Lord savior", 
                "Jesus H Christ", "Amlóði", "Terminator"];
    this.name = names[Math.floor(Math.random()*names.length)];
    
}

AI.prototype.hasBeenInPlayerFor = 0;

AI.prototype.canWalkTo = function(targetTileX, targetTileY) {
    return this.arena.getGrid().isSolid(targetTileX, targetTileY);
};

AI.prototype.resetCommands = function() {
    this.commandObject[consts.CONTROLS.UP] = false;
    this.commandObject[consts.CONTROLS.LEFT] = false;
    this.commandObject[consts.CONTROLS.RIGHT] = false;
    this.commandObject[consts.CONTROLS.DOWN] = false;
    this.commandObject[consts.CONTROLS.PUT_BOMB] = false;
};

AI.prototype.calculateFutureExplosions = function() {
    var self = this;
    return [].concat.apply([], this.grid
        .getAllLivingBombs()
        .map(function (livingBomb) {
            return self.grid.calculateFutureExplosionsAroundBomb(livingBomb).concat(livingBomb.coords);
        }));
};

// AI.prototype.hasEnoughSpeedToPassFutureExplosion = function(explosionTile) {
//     var tileWidth = 40;
//     var duNeeded = tileWidth / this.player.speed;
//     return duNeeded > explosionTile.timeUntilExplosion;
// };

AI.prototype.resetWeightMatrix = function() {
    if (this.weightMatrix) {
        for (var i = 0; i < this.weightMatrix.length; i++) {
            for (var j = 0; j < this.weightMatrix[i].length; j++) {
                this.weightMatrix[i][j] = 0;
            }
        }
    } else {
        this.weights = [];
        for (var i = 0; i < this.grid.heightInBlocks; i++) {
            this.weights.push(
                Array.apply(null, Array(this.grid.widthInBlocks))
                     .map(Number.prototype.valueOf,0)
            );
        }
    }
};

AI.prototype.calculateDestructionOfBombAt = function(gridCoords) {
    var self = this;
    var grid = this.grid;
    var bombPower = this.player.bombPower;
    
    var searchStopper;
    if (this.player.hasPlasmaBombs) {
        searchStopper = function(coords) {
            return false;  
        };
    } else {
        searchStopper = function(coords) {
            return grid.isDestructibleBlock(coords.x, coords.y);
        };
    }
    
    var upNodes = grid.searchForNodes(bombPower, 
        gridCoords.x, gridCoords.y-1,
        function(coords) { coords.y--; }, searchStopper);
    var downNodes = grid.searchForNodes(bombPower, 
        gridCoords.x, gridCoords.y+1,
        function(coords) { coords.y++; }, searchStopper);
    var leftNodes = grid.searchForNodes(bombPower, 
        gridCoords.x-1, gridCoords.y,
        function(coords) { coords.x--; }, searchStopper);
    var rightNodes = grid.searchForNodes(bombPower, 
        gridCoords.x+1, gridCoords.y,
        function(coords) { coords.x++; }, searchStopper);
        
    var allNodes = upNodes.concat(downNodes, leftNodes, rightNodes, gridCoords);
    
    var destructionOfBomb = allNodes.reduce(function(destructionCount, node) {
        if (grid.isDestructibleBlock(node.x, node.y)) {
            destructionCount.tilesDestroyed += 1;
        }
        if (self.arena.isPlayerAt(node.x, node.y, self.player)) {
            destructionCount.playersInLineOfFire += 1;
        }
        return destructionCount;
    }, {
        tilesDestroyed: 0,
        playersInLineOfFire: 0
    });
    return destructionOfBomb;
};

AI.prototype.findBestBombPlacement = function() {
    // Criteria:
    //  * Nearby CHECK
    //    -- Manhattan distance
    //  * Can place and hide
    //    -- Find nearest hiding spot, Dijkstra from bomb placement probably
    //       overkill...
    //  * Does blow up tiles CHECK
    //    -- Just count the surrounding tiles... depends on bomb type
    //  * Can potentially attack enemy CHECK
    //    -- Check if enemy will be in bomb radius
    
    var self = this;
    // Original weights:
    this.resetWeightMatrix();
    
    var weightMatrix = this.weights;
    var maxDistance = this.reachableNodes.reduce(function(currMaxDist, curr) {
        return curr.distance > currMaxDist ? curr.distance : currMaxDist;
    }, 0);
    
    // Criteria weights
    var distanceWeight = 0.8 + util.randRange(-0.1, 0.1);
    var potentialTileDestructionWeight = 1 + util.randRange(-0.1, 0.1);
    var aggressionWeight = 2 + util.randRange(-0.4, 0.4);
    
    this.reachableNodes.forEach(function(node) {
        // Nearby criteria
        // Normalized between 0..1 - 0 furthest away, 1 closest
        if (maxDistance !== 0) {
            weightMatrix[node.y][node.x] += distanceWeight * (maxDistance - node.distance) / maxDistance;
        } else {
            weightMatrix[node.y][node.x] += distanceWeight * 1;
        }
        
        var destructionOfBomb = self.calculateDestructionOfBombAt(node);
        // Does blow up tiles
        //  Check if player has plasma bomb... lets ignore that to begin with
        weightMatrix[node.y][node.x] += potentialTileDestructionWeight * destructionOfBomb.tilesDestroyed;
    
        // Can potentially attack enemy
        weightMatrix[node.y][node.x] += aggressionWeight * destructionOfBomb.playersInLineOfFire;
    });
    
    var highestWeight = -1;
    var bestBombPlacement;
    this.reachableNodes.forEach(function(node) {
        if (weightMatrix[node.y][node.x] > highestWeight) {
            highestWeight = weightMatrix[node.y][node.x];
            bestBombPlacement = node;
        } 
    });
    return bestBombPlacement;
};

// returns the nearest powerup that is reachable by this player 
//  before all other players
AI.prototype.canGetToPowerupBeforeOthers = function() {
    var self = this;
    var nearestPowerup = this.reachableNodes.reduce(function(nearbyPowerup, node) {
        if (nearbyPowerup.distance > node.distance && self.grid.tileHasPowerup(node.x, node.y)) {
            nearbyPowerup = node;
        }
        return nearbyPowerup;
    }, {
        distance: Infinity
    });
    
    if (nearestPowerup.distance === Infinity) {
        return false;
    }
    
    var opponents = this.arena.getOpponentsOf(this.player);
    var opponentShortestDistanceToPowerup = Infinity;
    var bestCandidate;
    opponents.forEach(function(opponent) {
        var startRaw = opponent.getPos();
        var startGridCoords = self.arena.rawToGridCoords(startRaw.posX + opponent.width/2, 
            startRaw.posY + opponent.height/2);
        var pathToPowerup = aStarSearch(startGridCoords, nearestPowerup, self.grid);
        
        // Check if there is a path from the opponent to the powerup
        if (pathToPowerup && opponentShortestDistanceToPowerup > pathToPowerup.length) {
            opponentShortestDistanceToPowerup = pathToPowerup.length;
            bestCandidate = opponent;
        }
    });
    
    // Check if no one else can reach the powerup
    if (opponentShortestDistanceToPowerup === Infinity) {
        return nearestPowerup;
    }
    
    // Returns true if our distance to the powerup is less than others
    // False otherwise
    
    // We think we can react quicker than the opponent
    var reactionConfidence = 1;
    if ((opponentShortestDistanceToPowerup+reactionConfidence) / bestCandidate.speed 
        > nearestPowerup.distance / this.player.speed) {
        return nearestPowerup;
    }
};

AI.prototype.findCover = function() {
    var self = this;
    var futureExplosions = this.calculateFutureExplosions()
        .map(function (explosion) {
           return explosion.x + explosion.y * self.grid.widthInBlocks;
        });
    var closestCover;
    var closestCoverDistance = Infinity;
    for (var i = 0; i < this.reachableNodes.length; i++) {
        var reachableNode = this.reachableNodes[i];
        if (reachableNode.distance < closestCoverDistance
            && futureExplosions.indexOf(reachableNode.value) === -1) {
                closestCover = reachableNode;
                closestCoverDistance = reachableNode.distance;
            }
    }
    if (closestCoverDistance === Infinity) {
        return false;   
    } else {
        return closestCover;
    }
    
};

AI.prototype.currentPath = [];

// How far along the path the AI is
AI.prototype.currentPathLocation = 0;

AI.prototype.followCurrentPath = function() {
    if (!this.currentPath || this.currentPathLocation > (this.currentPath.length - 2)) {
        return;
    }
    
    var currPos = this.player.getPos();
    var dim = this.player.getDimensions();
    var gridCoords = this.arena.rawToGridCoords(currPos.posX + dim.width/2, currPos.posY + dim.height/2);
    
    var currentTile = this.currentPath[this.currentPathLocation];
    var nextTile = this.currentPath[this.currentPathLocation + 1];
    
    if (gridCoords.x === nextTile.x && gridCoords.y === nextTile.y) {
        this.currentPathLocation++;
    }
    if (this.grid.tileHasExplosion(nextTile.x, nextTile.y)) {
        return;
    }
    if (this.grid.tileHasLivingBomb(nextTile.x, nextTile.y)) {
        this.currentTask = consts.AI_TASKS.NO_TASK;
        this.currentPathLocation = this.currentPath.length - 1;
        return;
    }
    
    if (nextTile.x < currentTile.x ) {
        this.commandObject[consts.CONTROLS.LEFT] = true;
    } else if (nextTile.x > currentTile.x) {
        this.commandObject[consts.CONTROLS.RIGHT] = true;
    } else if (nextTile.y < currentTile.y) {
        this.commandObject[consts.CONTROLS.UP] = true;
    } else if (nextTile.y > currentTile.y) {
        this.commandObject[consts.CONTROLS.DOWN] = true;
    }
};

AI.prototype.say = function(s){
    console.log(this.name + ": I'm " + s)
}

AI.prototype.update = function(du) {
    this.resetCommands();
    
    if (this.currentPath.length > 0 && (this.currentPath.length - 1 !== this.currentPathLocation)) {
        // We have not reached the end of our path
        // Continue walking it
        this.followCurrentPath();
        return;
    } else {
        // We have reached the end of our path
        if (this.currentTask === consts.AI_TASKS.GO_TO_BOMB_SPOT && this.player.bombsAvailable > 0) {
            // Our task was to plant a bomb at the end of our path
            // Let's do that
            this.commandObject[consts.CONTROLS.PUT_BOMB] = true;
            this.player.maybeLayDownBomb();
            this.commandObject[consts.CONTROLS.PUT_BOMB] = false;
        }
        // Reset the task
        this.currentTask = consts.AI_TASKS.NO_TASK;
    }
    
    var currPos = this.player.getPos();
    var dim = this.player.getDimensions();
    var gridCoords = this.arena.rawToGridCoords(currPos.posX + dim.width/2, currPos.posY + dim.height/2);
    this.reachableNodes = findReachableNodes(gridCoords, this.grid);
    
    if (this.arena.isPlayerAt(gridCoords.x, gridCoords.y, this.player)) {
        this.hasBeenInPlayerFor += du * NOMINAL_UPDATE_INTERVAL;
        if (this.hasBeenInPlayerFor > 3000) {
            var randomNodeIndex = util.getRandomIntInclusive(0, this.reachableNodes.length);
            var randomNode = this.reachableNodes[randomNodeIndex];
            this.currentTask = consts.GO_TO_COVER;
            this.currentPath = aStarSearch(gridCoords, randomNode, this.grid);
            this.currentPathLocation = 0;
            this.hasBeenInPlayerFor = 0;
            this.say('on way to random node!');
            return;
        }
    } else {
        this.hasBeenInPlayerFor = 0;
    }
    var cover = this.findCover();
    
    var powerUpToGoTo = this.canGetToPowerupBeforeOthers();
    if (cover && !(cover.x === gridCoords.x && cover.y === gridCoords.y)) {
        // set up cover searching task
        this.currentTask = consts.AI_TASKS.GO_TO_COVER;
        var pathToCover = aStarSearch(gridCoords, cover, this.grid);
        this.currentPath = pathToCover;
        this.currentPathLocation = 0;
        this.say('finding cover')
    } else if (powerUpToGoTo) { // true if ai is closest to some powerup
        // Set up powerup seeking task
        var pathToPowerup = aStarSearch(gridCoords, powerUpToGoTo, this.grid);
        this.currentTask = consts.AI_TASKS.GO_TO_POWERUP;
        this.currentPath = pathToPowerup;
        this.currentPathLocation = 0;
        this.say('on the way to a powerup');
    } else {
        // set bomb placement task        
        var bestBombPlacement = this.findBestBombPlacement();
        if (bestBombPlacement) {
            this.currentPath = aStarSearch(gridCoords, bestBombPlacement, this.grid);
            this.currentPathLocation = 0;
            this.currentTask = consts.AI_TASKS.GO_TO_BOMB_SPOT;
            this.say('on the way to plant ze bomb');  
        }else{
            // Do nothing
        }
    }
    /*
    // If we have a path to follow, than follow it and do nothing else
    if (this.currentPathLocation <= (this.currentPath.length-2)) {
        this.followCurrentPath();
        return;
    } else if (this.currentPathLocation === this.currentPath.length - 1) {
        if (this.onWayToPlantBomb) {
            this.commandObject[consts.CONTROLS.PUT_BOMB] = true;
            this.onWayToPlantBomb = false;
        }
    }
    
    var currPos = this.player.getPos();
    var dim = this.player.getDimensions();
    var gridCoords = this.arena.rawToGridCoords(currPos.posX + dim.width/2, currPos.posY + dim.height/2);

    this.reachableNodes = findReachableNodes(gridCoords, this.grid);
    
    var cover = this.findCover();
    var powerUpToGoTo = this.canGetToPowerupBeforeOthers();
    if (cover) {
        this.currentPath = aStarSearch(gridCoords, cover, this.grid);
        this.currentPathLocation = 0;
        this.currentTask = consts.AI_TASKS.FIND_COVER;
    } else if (powerUpToGoTo) {
        // Go to powerup
        console.log('AI closer to powerup');
        var pathToPowerup = aStarSearch(gridCoords, powerUpToGoTo, this.grid);
        this.currentPath = pathToPowerup;
        this.currentPathLocation = 0;
        this.currentTask = consts.AI_TASKS.GO_TO_POWERUP;
    } else if (this.player.bombsAvailable > 0) {
        var bestBombPlacement = this.findBestBombPlacement();
        if (bestBombPlacement) {
            this.onWayToPlantBomb = true;
            this.currentPath = aStarSearch(gridCoords, bestBombPlacement, this.grid);
            this.currentPathLocation = 0;
            this.currentTask = consts.AI_TASKS.GO_TO_BOMB_SPOT;
            console.log('On way to plant ze bomb');  
        }
    }
    
    
    // else {
    //     // Search for cover
    //     var cover = this.findCover();
    //     if (cover) {
    //         // Cover found!
    //         this.currentPath = aStarSearch(gridCoords, cover, this.grid);
    //         this.currentPathLocation = 0;
    //     }
    // }
    /*
    var opponent = this.arena.getOpponentsOf(this.player)[0];
    var goalRaw = opponent.getPos();
    var grid = this.arena.getGrid();
    var goalGridCoords = this.arena.rawToGridCoords(goalRaw.posX + dim.width/2, goalRaw.posY + dim.height/2);
    this.path = aStarSearch({x: gridCoords.x, y: gridCoords.y},
        {x: goalGridCoords.x, y: goalGridCoords.y},
        grid);
    
    if (this.path && this.path.length > 3) {
        var currentTile = this.path[0];
        var nextTile = this.path[1];
        var futureExplosionAtNextTile = this.calculateFutureExplosions(grid)
            .filter(function(futureExplosion) {
                return futureExplosion.x === nextTile.x
                    && futureExplosion.y === nextTile.y; 
            });
        if (grid.tileHasExplosion(nextTile.x, nextTile.y) || (futureExplosionAtNextTile.length > 0
            && !this.hasEnoughSpeedToPassFutureExplosion(futureExplosionAtNextTile[0]))) {
                
        } else {
            if (nextTile.x < currentTile.x ) {
                this.commandObject[consts.CONTROLS.LEFT] = true;
            } else if (nextTile.x > currentTile.x) {
                this.commandObject[consts.CONTROLS.RIGHT] = true;
            } else if (nextTile.y < currentTile.y) {
                this.commandObject[consts.CONTROLS.UP] = true;
            } else if (nextTile.y > currentTile.y) {
                this.commandObject[consts.CONTROLS.DOWN] = true;
            }
        }
    }
    */
    // TODO: Read up on
    // http://gamedev.stackexchange.com/questions/25349/giving-a-bomberman-ai-intelligent-bomb-placement
    
    
    // console.log(this.calculateFutureExplosions(grid));
};

AI.prototype.renderWeights = function(ctx) {
    if(!g_renderAiWeights) return;
    var blockWidth = this.grid.blockWidth;
    var blockHeight = this.grid.blockHeight;
    ctx.save();
    this.weights.forEach(function(row, rowIndex) {
        row.forEach(function(weight, columnIndex) {
            if (weight > 0) {
                ctx.fillText(Math.floor(weight * 100) / 100,
                         columnIndex*blockWidth + blockWidth / 2 - 10,
                         rowIndex*blockHeight + blockHeight / 2);
            }
        });
    });
    ctx.restore();
};

AI.prototype.render = function(ctx) {
    // For debug purposes
    var grid = this.arena.getGrid();
    ctx.save();
    ctx.setLineDash([5, 15]);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    var self = this;
    this.path && Object.keys(this.path).forEach(function(nodeIndex) {
        var node = self.path[nodeIndex];
        ctx.rect(node.x*grid.blockWidth, node.y*grid.blockHeight,
            grid.blockWidth, grid.blockHeight);
        ctx.stroke();
    });
    ctx.restore();
    if (this.weights) {
        this.renderWeights(ctx);
    }

};

// returns the neighbouring nodes to the given node on the given grid.
function findNeighbours(node, grid) {
    var neighbours = [];
    if (!grid.isSolid(node.x+1, node.y)) {
        neighbours.push({x: node.x+1, y: node.y,
            value: node.x+1 + node.y * grid.widthInBlocks
        });
    }
    if (!grid.isSolid(node.x-1, node.y)) {
        neighbours.push({x: node.x-1, y: node.y,
            value: node.x-1 + node.y * grid.widthInBlocks
        });
    }
    if (!grid.isSolid(node.x, node.y+1)) {
        neighbours.push({x: node.x, y: (node.y+1),
            value: node.x + (node.y+1) * grid.widthInBlocks
        });
    }
    if (!grid.isSolid(node.x, node.y-1)) {
        neighbours.push({x: node.x, y: (node.y-1),
            value: node.x + (node.y-1) * grid.widthInBlocks
        });
    }
    return neighbours;
}

function distanceFunction(point, target) {
    return Math.abs(point.x - target.x) + Math.abs(point.y - target.y);  
}

// Finds the best path from start node to goal node on the given grid
function aStarSearch(start, goal, grid) {
    var closedNodes = [];
    
    var isNodeVisited = [];
    
    // g: Distance from start to this node
    // f: Distance from this node to goal
    // value: A hash for `isNodeVisited`
    start.g = 0;
    start.f = start.g + distanceFunction(start, goal);
    start.value = start.x + start.y * grid.widthInBlocks;
    var openNodes = [start];
    var currentNode, neighboursOfCurrentNode, neighbourNode,
        i, j, min, max;
    var maxDistance = grid.widthInBlocks + grid.heightInBlocks;
    while (openNodes.length > 0) {
        max = maxDistance;
        min = -1;
        
        // Find the node in openNodes that has the least
        // distance to goal
        for (i = 0; i < openNodes.length; i++) {
            if (openNodes[i].f < max) {
                max = openNodes[i].f;
                min = i;
            }
        }
        
        currentNode = openNodes.splice(min, 1)[0];
        
        // Check if we are at the goal node
        if (currentNode.x === goal.x && currentNode.y === goal.y) {
            // Trace back our steps and form the path
            var result = [];
            while (currentNode.parent) {
                result.push(currentNode);
                currentNode = currentNode.parent;
            }
            return [start].concat(result.reverse());
        } else {
            neighboursOfCurrentNode = findNeighbours(currentNode, grid);
            for (j = 0; j < neighboursOfCurrentNode.length; j++) {
                neighbourNode = neighboursOfCurrentNode[j];
                
                // Have we visited this nose?
                if (!isNodeVisited[neighbourNode.value]) {
                    // We have not visited the node
                    
                    neighbourNode.parent = currentNode;
                    neighbourNode.g = currentNode.g + distanceFunction(neighbourNode, currentNode);
                    neighbourNode.f = neighbourNode.g + distanceFunction(neighbourNode, goal);
                    neighbourNode.value = neighbourNode.x + neighbourNode.y * grid.widthInBlocks;
                    openNodes.push(neighbourNode);
                    
                    // Mark as visited
                    isNodeVisited[neighbourNode.value] = true;
                }
                
                
            }
            closedNodes.push(currentNode);
        }
    }
    return false;
}

// BFS
function findReachableNodes(start, grid) {
    start.value = start.x + start.y * grid.widthInBlocks;
    start.distance = 0;
    var openNodes = [start];
    var closedNodes = [];
    var isNodeVisited = [];
    isNodeVisited[start.value] = true;
    var j, currentNode, neighbours, neighbourNode;
    while (openNodes.length > 0) {
        currentNode = openNodes.splice(0, 1)[0];
        closedNodes.push(currentNode);
        neighbours = findNeighbours(currentNode, grid);
        for (j = 0; j < neighbours.length ; j++) {
            neighbourNode = neighbours[j];
            neighbourNode.value = neighbourNode.x + neighbourNode.y * grid.widthInBlocks;
            if (!isNodeVisited[neighbourNode.value]) {
                neighbourNode.distance = currentNode.distance + 1;
                openNodes.push(neighbourNode);
                isNodeVisited[neighbourNode.value] = true;
            }
        }
    }
    if (grid.tileHasLivingBomb(start.x, start.y)) {
        closedNodes.splice(0, 1);
    }
    return closedNodes;
}