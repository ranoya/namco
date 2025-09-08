//  Copyright (c) 2011 David Caldwell,  All Rights Reserved.

function apple2_video_canvas(canvas) {
  canvas.width = 280;
  canvas.height = 192;
  var ctx = canvas.getContext("2d");
  ctx.font = "5pt Monaco";
  ctx.textBaseline = "top";
  ctx.textAlign = "left";
  ctx.globalAlpha = 1.0;

  var charset = build_charset(apple_2_plus_charset);

  var flash_period = 1.44 / ((12000 + 2 * 3300000) * 0.0000001); // A 555 timer running in astable mode. Formula from National's data sheet. Ra=12K Rb=3.3M C=.1uF
  flash_period /= 8; // hack--my calculations are incorrect and it runs way too slow.

  var text_line_offset = function (y) {
    return ((y & 7) << 7) | (((y & 0x18) >> 3) * 40);
  };

  var hgr_line_offset = function (y) {
    return ((y & 7) << 10) | text_line_offset(y >> 3);
  };

  // http://mirrors.apple2.org.za/ground.icaen.uiowa.edu/MiscInfo/Emulators/xapple2
  var COLOR = [
    "rgb(  0,   0,   0)", // black
    "rgb(227,  30,  96)", // red
    "rgb( 96,  78, 189)", // dk blue
    "rgb(255,  68, 253)", // purple
    "rgb(  0, 163,  96)", // dk green
    "rgb(156, 156, 156)", // gray
    "rgb( 20, 207, 253)", // med blue
    "rgb(208, 195, 255)", // lt blue
    "rgb( 96, 114,   3)", // brown
    "rgb(255, 106,  60)", // orange
    "rgb(156, 156, 156)", // grey
    "rgb(255, 160, 208)", // pink
    "rgb( 20, 245,  60)", // lt green
    "rgb(208, 221, 141)", // yellow
    "rgb(114, 255, 208)", // aqua
    "rgb(255, 255, 255)", // white
  ];

  var HCOLOR = [
    [0, 0, 0], // black
    [255, 68, 253], // purple
    [20, 245, 60], // green
    [255, 255, 255], // white
    [0, 0, 0], // black
    [20, 207, 253], // blue
    [255, 106, 60], // orange
    [255, 255, 255], // white
  ];

  this.update = function (frame, frames__second, video_mode, ram) {
    var text_start = [0x0400, 0x0800][video_mode.page]; // text or lo-res
    var hgr_start = [0x2000, 0x4000][video_mode.page]; // hi-res

    var flash_state = Math.floor(frame / frames__second / flash_period) & 1;
    var charset_scanline = function (ch, y) {
      var inverse =
        (ch & 0xc0) == 0 || // Inverse
        ((ch & 0xc0) == 0x40 && flash_state); // Flash
      return (
        apple_2_plus_charset[((ch & 0x3f) ^ 0x20) * 8 + y] ^
        (inverse ? 0x7f : 0)
      );
    };

    if (video_mode.graphics) {
      if (video_mode.hires || video_mode.mixed) {
        var screen = ctx.createImageData(280, 192);
        for (var y = !video_mode.hires ? 20 * 8 : 0; y < 24 * 8; y++) {
          var row_addr = hgr_start + hgr_line_offset(y);
          var last_bit = 0;
          var text_addr;
          if (y >> 3 >= 20 && video_mode.mixed)
            text_addr = text_start + text_line_offset(y >> 3);
          for (var xs = 0; xs < 40; xs++) {
            var seg = ram[xs + row_addr];
            var next_byte = xs == 39 ? 0 : ram[xs + row_addr + 1];
            if (text_addr) {
              // Render text from the charset ROM so we get the funky color burst look
              seg = charset_scanline(ram[text_addr + xs], y & 7);
              next_byte =
                xs == 39 ? 0 : charset_scanline(ram[text_addr + xs + 1]);
            }
            var colorset = seg & 0x80 ? 4 : 0;
            var x = xs * 7;
            for (var b = 0; b < 7; b++, x++) {
              if (!(seg & (1 << b))) color = 0;
              else if (
                last_bit ||
                (b < 6 ? seg & (1 << (b + 1)) : next_byte & 1)
              )
                // if we're adjacent on the left or right then we're white.
                color = 3;
              else color = 1 + (x & 1); // Even or odd x coords specify color
              screen.data[(y * 280 + x) * 4 + 0] = HCOLOR[color + colorset][0];
              screen.data[(y * 280 + x) * 4 + 1] = HCOLOR[color + colorset][1];
              screen.data[(y * 280 + x) * 4 + 2] = HCOLOR[color + colorset][2];
              screen.data[(y * 280 + x) * 4 + 3] = 255;
              last_bit = seg & (1 << b);
            }
          }
        }
        ctx.putImageData(screen, 0, 0);
      }
      if (!video_mode.hires) {
        for (var y = 0; y < (video_mode.mixed ? 20 : 24); y++)
          for (var x = 0; x < 40; x++) {
            var c = ram[text_start + text_line_offset(y) + x];
            ctx.fillStyle = COLOR[c & 0xf];
            ctx.fillRect(x * 7, y * 8, 7, 4);
            ctx.fillStyle = COLOR[(c >> 4) & 0xf];
            ctx.fillRect(x * 7, y * 8 + 4, 7, 4);
          }
      }
    } else {
      // Text mode, no colorburst
      for (var y = video_mode.graphics ? 20 : 0; y < 24; y++)
        for (var x = 0; x < 40; x++) {
          var ch = ram[text_start + text_line_offset(y) + x];
          var inverse =
            (ch & 0xc0) == 0 || // Inverse
            ((ch & 0xc0) == 0x40 && flash_state); // Flash
          ctx.drawImage(
            charset,
            (ch & 0x3f) * 7,
            inverse ? 8 : 0,
            7,
            8,
            x * 7,
            y * 8,
            7,
            8
          );
        }
    }
  };
}

function build_charset(charset_rom) {
  var charset = document.createElement("canvas");
  // document.body.appendChild(charset);
  // charset.style.width=(7*64*2)+"px"
  // charset.style.height=(8*2*2)+"px"
  charset.width = 7 * 64;
  charset.height = 8 * 2;
  var cs = charset.getContext("2d");

  for (var ch = 0; ch < 64; ch++) {
    for (var y = 0; y < 8; y++) {
      var l = charset_rom[(ch ^ 0x20) * 8 + y];
      for (var x = 0; x < 7; x++) {
        cs.fillStyle = l & (1 << x) ? "white" : "black"; // Normal
        cs.fillRect(ch * 7 + x, 0 + y, 1, 1);
        cs.fillStyle = l & (1 << x) ? "black" : "white"; // Inverse
        cs.fillRect(ch * 7 + x, 8 + y, 1, 1);
      }
    }
  }
  return charset;
}

// The Apple 2 screen vertical coordinates are screwey
//line addr-hex addr-binary
//  0: 400 01 000 0000 000
//  1: 480 01 001 0000 000
//  2: 500 01 010 0000 000
//  3: 580 01 011 0000 000
//  4: 600 01 100 0000 000
//  5: 680 01 101 0000 000
//  6: 700 01 110 0000 000
//  7: 780 01 111 0000 000
//  8: 428 01 000 0101 000
//  9: 4a8 01 001 0101 000
// 10: 528 01 010 0101 000
// 11: 5a8 01 011 0101 000
// 12: 628 01 100 0101 000
// 13: 6a8 01 101 0101 000
// 14: 728 01 110 0101 000
// 15: 7a8 01 111 0101 000
// 16: 450 01 000 1010 000
// 17: 4d0 01 001 1010 000
// 18: 550 01 010 1010 000
// 19: 5d0 01 011 1010 000
// 20: 650 01 100 1010 000
// 21: 6d0 01 101 1010 000
// 22: 750 01 110 1010 000
// 23: 7d0 01 111 1010 000
