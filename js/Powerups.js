/* global util AudioSystem g_sounds*/
'use strict';

var Powerups = {
    powerups: [
        {
            name: 'INCREASE_BOMB_CAPACITY',
            powerup: function(player) {
                player.giveBomb();
                console.log("Player got bomb capacity powerup!");
                AudioSystem.playSound(g_sounds.pickup);
            },
            probability: 10,
            color: "blue",
            sprite: "bombbag"
        },
        {
            name: 'INCREASE_BOMB_POWER',
            powerup: function(player) {
                player.increaseBombPower();
                console.log("Player got bomb power powerup!");
                AudioSystem.playSound(g_sounds.pickup);
            },
            probability: 10,
            color: "pink",
            sprite: "bycep"
        },
        {
            name: 'INCREASE_PLAYER_SPEED',
            powerup: function(player) {
                player.increaseSpeed();
                console.log("Player got speed powerup!");
                AudioSystem.playSound(g_sounds.pickup);
            },
            probability: 10,
            color: "#0ff",
            sprite: "shoes"
        },
        {
            name: 'BOMB_KICK',
            powerup: function(player) {
                player.giveKickBombAbility();
                console.log("Player got kicking powerup!");
                AudioSystem.playSound(g_sounds.pickup);
            },
            probability: 5,
            color: "#5ff",
            sprite: "kickpowerup"
        },
        {
            name: 'PLASMA_BOMB',
            powerup: function(player) {
                player.givePlasmaBombs();
                console.log("Player got plasma bomb powerup!");
                AudioSystem.playSound(g_sounds.pickup);
            },
            probability: 5,
            color: "#5ff",
            sprite: "skull"
        }
    ],
    randomPowerUp: function() {
        var powerUps = this.powerups;
        var rand = util.randRange(0, this.totalProb);
        var cumulativeProb = 0;
        for (var i = 0; i < powerUps.length; i++) {
            cumulativeProb += this.powerups[i].probability;
            if (cumulativeProb > rand) {
                return powerUps[i];
            }
        }
    }
};


(function() {
    Powerups.totalProb = Powerups.powerups.reduce(function(acc, curr) {
        return acc + curr.probability;
    }, 0);
})();


// function tester() {
//     var probabilities = Powerups.powerups.reduce(function(acc, curr) {
//         acc[curr.name] = 0;
//         return acc;
//     }, {});
//     var iter = 10000;
//     for (var i = 0; i < iter; i++) {
//         var randPowerup = Powerups.randomPowerUp();
//         probabilities[randPowerup.name] += 1;
//     }
//     Object.keys(probabilities).forEach(function(prob) {
//         probabilities[prob] /= iter;
//     });
//     console.log(probabilities);
// }