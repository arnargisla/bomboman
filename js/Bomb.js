/* global util, NOMINAL_UPDATE_INTERVAL, entityManager, Grid, g_sprites, consts */

function Bomb(power, type, owner) {
    this.power = power || this.defaultPower;
    this.type = type || consts.BOMBS.TYPES.REGULAR;
    this.owner = owner; // Player
}

Bomb.prototype.defaultPower = 1;
Bomb.prototype.totalLifeSpan = 4000 / NOMINAL_UPDATE_INTERVAL;
Bomb.prototype.detonationThreshold = 1000 / NOMINAL_UPDATE_INTERVAL;
Bomb.prototype.hasDetonated = false;

Bomb.prototype.manuallyDetonate = function(){
    if(this.hasDetonated) {
        return;
    }
    this.hasDetonated = true;
    this.owner.giveBomb();
    this.totalLifeSpan = this.detonationThreshold;
};

Bomb.prototype.getBombPower = function(){
    return this.power;
};

Bomb.prototype.getType = function() {
    return this.type;
};

Bomb.prototype.update = function(du) {
    this.totalLifeSpan -= du;
    
    if (this.totalLifeSpan <= 0) {
        return entityManager.KILL_ME_NOW;
    } else if (!this.hasDetonated && this.totalLifeSpan < this.detonationThreshold) {
        if(!this.hasDetonated){
            this.hasDetonated = true;
            this.owner.giveBomb();
        }
        return Grid.DETONATE_BOMB;
    }
};

Bomb.prototype.sprite = "bomb";
Bomb.prototype.render = function(ctx, width, height) {
    if (this.hasDetonated) {
        return;
    }
    ctx.save();
    g_sprites[this.sprite].drawCentredAt(ctx, width/2, height/2);
    ctx.restore();
};