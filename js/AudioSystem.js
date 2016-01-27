/* global g_sounds */


var AudioSystem = (function() {
    var self = {
        isMuted: false,
        toggleMute: function() {
            self.isMuted = !self.isMuted;
            Object.keys(g_sounds).forEach(function(soundName) {
                 g_sounds[soundName].muted = self.isMuted;
            });
        },
        playSound: function(sound) {
            sound.currentTime = 0;
            sound.play();
        },
        startBgMusic: function(){
            g_sounds.backgroundmusic.addEventListener('ended', function() {
                this.currentTime = 0;
                this.play();
                //this.volume = 0.1;
            }, false);
            g_sounds.backgroundmusic.play();
            g_sounds.backgroundmusic.volume = 0.05;
        },
        setSfxVolume: function(value){
            
            g_sounds.explosion.volume = value;
            g_sounds.plasma.volume = value*0.3;
            g_sounds.dropbomb.volume = value;
            g_sounds.gamestart.volume = value;
            g_sounds.pickup.volume = value*0.09;
            g_sounds.hit.volume = value*0.25;
        },
        initiateWalkSound: function(){
            g_sounds.walk.addEventListener('ended', function() {
                this.currentTime = 0;
                this.play();
                //this.volume = 0.1;
            }, false);
            g_sounds.walk.play();
            g_sounds.walk.volume = 0;
        }
    };
    return self;
})();


