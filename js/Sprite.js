// ============
// SPRITE STUFF
// ============

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */
/* global g_canvas */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/


// Construct a "sprite" from the given `image`,
//
function Sprite(image, width, height, offsetX, offsetY) {
    this.image = image;

    this.width = width || image.width;
    this.height = height || image.height;
    this.offsetX = offsetX || 0;
    this.offsetY = offsetY || 0;
    this.scale = 1;
}


Sprite.prototype.drawAt = function (ctx, x, y) {
    ctx.drawImage(this.image, x, y);
};

// Sprite.prototype.drawCentredAtWithDimensions = function (ctx, cx, cy, rotation) {
//     if (rotation === undefined) rotation = 0;
    
//     var w = this.width,
//         h = this.height;

//     ctx.save();
//     ctx.translate(cx, cy);
//     ctx.rotate(rotation);
//     // ctx.scale(this.scale, this.scale);
    
//     // drawImage expects "top-left" coords, so we offset our destination
//     // coords accordingly, to draw our sprite centred at the origin
//     ctx.drawImage(this.image, 0, 0, w, h);
    
//     ctx.restore();
// };  

Sprite.prototype.drawCentredAt = function (ctx, cx, cy, rotation) {
    if (rotation === undefined) rotation = 0;
    
    var w = this.width,
        h = this.height;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);
    ctx.scale(this.scale, this.scale);
    
    // drawImage expects "top-left" coords, so we offset our destination
    // coords accordingly, to draw our sprite centred at the origin
    //ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
    ctx.drawImage(this.image, this.offsetX, this.offsetY, this.width, this.height, -w/2, -h/2, this.width, this.height);
    
    ctx.restore();
};

Sprite.prototype.drawClippedCentredAt = function (ctx, cx, cy, clipX, clipY, rotation) {
    if (rotation === undefined) rotation = 0;
    
    var w = this.width,
        h = this.height,
        clipWidth = this.clipWidth,
        clipHeight = this.clipHeight;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);
    ctx.scale(this.scale, this.scale);
    // ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
    ctx.drawImage(this.image, clipX, clipY, clipWidth, clipHeight, -w/2, -h/2, w, h);
    
    ctx.restore();
};

Sprite.prototype.drawWrappedCentredAt = function (ctx, cx, cy, rotation) {
    
    // Get "screen width"
    var sw = g_canvas.width;
    
    // Draw primary instance
    this.drawWrappedVerticalCentredAt(ctx, cx, cy, rotation);
    
    // Left and Right wraps
    this.drawWrappedVerticalCentredAt(ctx, cx - sw, cy, rotation);
    this.drawWrappedVerticalCentredAt(ctx, cx + sw, cy, rotation);
};

Sprite.prototype.drawWrappedVerticalCentredAt = function (ctx, cx, cy, rotation) {

    // Get "screen height"
    var sh = g_canvas.height;
    
    // Draw primary instance
    this.drawCentredAt(ctx, cx, cy, rotation);
    
    // Top and Bottom wraps
    this.drawCentredAt(ctx, cx, cy - sh, rotation);
    this.drawCentredAt(ctx, cx, cy + sh, rotation);
};
