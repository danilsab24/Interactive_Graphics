// bgImg is the background image to be modified.
// fgImg is the foreground image.
// fgOpac is the opacity of the foreground image.
// fgPos is the position of the foreground image in pixels. It can be negative and (0,0) means the top-left pixels of the foreground and background are aligned.
function composite( bgImg, fgImg, fgOpac, fgPos )
{
    // width/height of background and foreground
    var bgWidth  = bgImg.width;
    var bgHeight = bgImg.height;
    var fgWidth  = fgImg.width;
    var fgHeight = fgImg.height;

    // raw RGBA arrays 
    var bgData = bgImg.data;
    var fgData = fgImg.data;

    // overlap boundaries (left, right, top, bottom):
    var startX = Math.max(0, fgPos.x);
    var endX   = Math.min(bgWidth, fgPos.x + fgWidth);
    var startY = Math.max(0, fgPos.y);
    var endY   = Math.min(bgHeight, fgPos.y + fgHeight);

    for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
            // Corresponding pixel coordinates in the foreground
            var fx = x - fgPos.x;
            var fy = y - fgPos.y;

            // Compute array indices for bg and fg, each pixel is RGBA => 4 bytes
            var bgIndex = 4 * (y * bgWidth + x);
            var fgIndex = 4 * (fy * fgWidth + fx);

            // Extract background RGBA
            var bgR = bgData[bgIndex + 0];
            var bgG = bgData[bgIndex + 1];
            var bgB = bgData[bgIndex + 2];
            var bgA = bgData[bgIndex + 3] / 255.0; // convert to [0..1]

            // Extract foreground RGBA
            var fgR = fgData[fgIndex + 0];
            var fgG = fgData[fgIndex + 1];
            var fgB = fgData[fgIndex + 2];
            var fgA = (fgData[fgIndex + 3] / 255.0) * fgOpac; // scale alpha by fgOpac
            
            var outA = fgA + bgA * (1 - fgA);
            if (outA > 0) {
                var outR = (fgR * fgA + bgR * bgA * (1 - fgA)) / outA;
                var outG = (fgG * fgA + bgG * bgA * (1 - fgA)) / outA;
                var outB = (fgB * fgA + bgB * bgA * (1 - fgA)) / outA;
                bgData[bgIndex + 0] = Math.round(outR);
                bgData[bgIndex + 1] = Math.round(outG);
                bgData[bgIndex + 2] = Math.round(outB);
                bgData[bgIndex + 3] = Math.round(outA * 255);
            }
        }
    } 
}