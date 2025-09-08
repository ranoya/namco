//  Copyright (c) 2011 David Caldwell,  All Rights Reserved. -*- c -*-

precision highp float;

uniform sampler2D first_pass;

uniform bool graphics_mode;
uniform bool hires_mode;
uniform bool mixed_mode;

bool is_set(vec4 color) {
    return color.r != 0.0 || color.g != 0.0 || color.b != 0.0;
}

void main(void) {
    lowp vec4 me    = texture2D(first_pass, vec2(gl_FragCoord.x       / 512.0, gl_FragCoord.y / 256.0));

    if (graphics_mode && (hires_mode || mixed_mode && 192.0 - gl_FragCoord.y >= 160.0)) {
        // Hires mode and the lores text mode area
        lowp vec4 left  = texture2D(first_pass, vec2((gl_FragCoord.x-1.0) / 512.0, gl_FragCoord.y / 256.0));
        lowp vec4 right = texture2D(first_pass, vec2((gl_FragCoord.x+1.0) / 512.0, gl_FragCoord.y / 256.0));

        if (is_set(me) && (gl_FragCoord.x >= 1.0 && is_set(left) ||
                           gl_FragCoord.x <= 278.0 && is_set(right)))
            gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
        else if (!is_set(me) && gl_FragCoord.x >= 1.0 && gl_FragCoord.x <= 278.0 && is_set(left) && left == right)
            gl_FragColor = left;
        else
            gl_FragColor = me;
    } else if (!graphics_mode) {
        // Text mode -- force to black and white.
        gl_FragColor = is_set(me) ? vec4(1.0, 1.0, 1.0, 1.0) : vec4(0.0, 0.0, 0.0, 1.0);
    } else {
        // lores
        gl_FragColor = me;
    }
}