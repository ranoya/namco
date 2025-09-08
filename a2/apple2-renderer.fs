//  Copyright (c) 2011 David Caldwell,  All Rights Reserved. -*- c -*-

precision highp float;

uniform bool graphics_mode;
uniform bool hires_mode;
uniform bool mixed_mode;
uniform bool flash_state;

uniform sampler2D text;
uniform sampler2D hires;
uniform sampler2D charset;
uniform sampler2D color_table;
uniform sampler2D hcolor_table;

// No bitwise operations in webgl shaders. Grrrrr.
bool testbit(float _byte, float bit) {
    // return _byte & bit;
    return mod(floor(_byte / pow(2.0, bit)), 2.0) == 1.0;
}

float byteify(float zero_to_one) {
    return floor(zero_to_one * 255.0);
}

float text_line_offset(float y) {
    // return (y & 7)<<7 | ((y&0x18)>>3) * 40;
    return mod(y, 8.0) * 128.0 + floor(y / 8.0) * 40.0;
}

float hgr_line_offset(float y) {
    // return (y&7)<<10 | text_line_offset(y>>3);
    return mod(y, 8.0) * 1024.0 + text_line_offset(floor(y / 8.0));
}

bool exclusive_or(bool a, bool b) {
    return a && !b || !a && b;
}

void main(void) {
    mediump vec2 fc = vec2(floor(gl_FragCoord.x), floor(192.0-gl_FragCoord.y));

    if (graphics_mode && hires_mode && (!mixed_mode || fc.y < 160.0)) {
        // Hires
        mediump float address = hgr_line_offset(fc.y) + floor(fc.x / 7.0);
        // The hires screen is now in a 512x16 texture (FF was barfing on a 8192x1 texture). (Tex coords are [0,1])
        highp float seg = byteify(texture2D(hires, vec2(mod(address, 512.0)/512.0, floor(address/512.0)/16.0)).r);

        mediump float colorset = testbit(seg, 7.0) ? 4.0 : 0.0;
        mediump float even     = mod(fc.x, 2.0) == 1.0 ? 1.0 : 0.0;
        gl_FragColor = testbit(seg, mod(fc.x, 7.0)) ? texture2DProj(hcolor_table, vec3(colorset + even + 1.0, 1.0, 8.0)) : vec4(0.0, 0.0, 0.0, 1.0);
    } else {
        // Text or Lores
        mediump vec2 textpos = vec2(floor(fc.x / 7.0),
                                 floor(fc.y / 8.0));
        mediump vec2 charpos = vec2(mod(fc.x, 7.0),
                                 mod(fc.y, 8.0));

        highp float ch = byteify(texture2DProj(text, vec3(text_line_offset(textpos.y) + textpos.x, 0.0, 1023.0)).r);

        if (!graphics_mode || mixed_mode && fc.y >= 160.0) {
            // Text
            bool inverse = ch < 64.0;
            bool flash = ch < 128.0;
            bool invert = inverse || (flash ? flash_state : false);

            ch = mod(ch, 64.0);
            ch = ch >= 32.0 ? ch - 32.0 : ch + 32.0;

            highp float ch_row = byteify(texture2DProj(charset, vec3(ch * 8.0 + charpos.y, 1.0, 1023.0)).r);
            mediump float even     = mod(fc.x, 2.0) == 1.0 ? 1.0 : 0.0;
            gl_FragColor = exclusive_or(invert, testbit(ch_row, charpos.x)) ? texture2DProj(hcolor_table, vec3(even + 1.0, 1.0, 8.0)) : vec4(0.0, 0.0, 0.0, 1.0);
        } else {
            // Lores
            if (charpos.y > 3.0)
                ch = floor(ch / 16.0); // >> 4;
            else
                ch = mod(floor(ch), 16.0); // & 0xf
            gl_FragColor = texture2DProj(color_table, vec3(ch, 0.0, 16.0));
        }
    }
}