//  Copyright (c) 2011 David Caldwell,  All Rights Reserved.

function apple2_video_webgl(canvas) {
  var gl;
  for (var name in {
    webgl: 0,
    "experimental-webgl": 0,
    "webkit-3d": 0,
    "moz-webgl": 0,
  })
    try {
      gl = canvas.getContext(name);
      if (gl) break;
    } catch (e) {}
  if (!gl) return null; // Not supported in this browser.
  return new apple2_video_webgl_driver(canvas, gl);
}

function apple2_video_webgl_driver(canvas, gl) {
  canvas.width = 280;
  canvas.height = 192;
  gl.viewport(0, 0, canvas.width, canvas.height);

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  var check_err = function (which) {
    var err = gl.getError();
    if (err != gl.NO_ERROR)
      throw sprintf(
        "%s: Got GL error: %x: %s\n",
        which,
        err,
        {
          0x0500: "INVALID_ENUM",
          0x0501: "INVALID_VALUE",
          0x0502: "INVALID_OPERATION",
          0x0505: "OUT_OF_MEMORY",
        }[err]
      );
  };

  var next_texture_unit = 0;
  var powers_of_2 = {
    1: 1,
    2: 1,
    4: 1,
    8: 1,
    16: 1,
    32: 1,
    64: 1,
    128: 1,
    256: 1,
    512: 1,
    1024: 1,
    2048: 1,
    4096: 1,
    8192: 1,
  };

  var new_texture = function (width, height, format, data) {
    if (!powers_of_2[width]) throw "Not a power of two: " + width;
    if (!powers_of_2[height]) throw "Not a power of two: " + height;
    var texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + next_texture_unit);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      format,
      width,
      height,
      0,
      format,
      gl.UNSIGNED_BYTE,
      data || null
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    return {
      texture: texture,
      tex_unit: next_texture_unit++,
      format: format,
      geometry: { width: width, height: height },
    };
  };

  var data_texture = function (length /*power of 2!*/, height) {
    if (!height) height = 1;
    return new_texture(length / height, height, gl.LUMINANCE);
  };
  var set_texture_data = function (texture, data) {
    gl.activeTexture(gl.TEXTURE0 + texture.tex_unit);
    var byte_data = new Uint8Array(
      texture.geometry.width * texture.geometry.height
    );
    byte_data.set(data);
    gl.texSubImage2D(
      gl.TEXTURE_2D,
      0,
      0,
      0,
      texture.geometry.width,
      texture.geometry.height,
      texture.format,
      gl.UNSIGNED_BYTE,
      byte_data
    );
  };

  var text_texture = data_texture(0x400);
  var hires_texture = data_texture(0x2000, 16);
  var charset_texture = data_texture(1024);
  set_texture_data(charset_texture, apple_2_plus_charset);

  var color_table_texture = function () {
    var colors = arguments.length / 3;
    return new_texture(colors, 1, gl.RGB, new Uint8Array(arguments));
  };

  // Color derivations are in the canvas video driver. No need to repeat them here.
  var color_texture = color_table_texture(
    0,
    0,
    0, // black
    227,
    30,
    96, // red
    96,
    78,
    189, // dk blue
    255,
    68,
    253, // purple
    0,
    163,
    96, // dk green
    156,
    156,
    156, // gray
    20,
    207,
    253, // med blue
    208,
    195,
    255, // lt blue
    96,
    114,
    3, // brown
    255,
    106,
    60, // orange
    156,
    156,
    156, // grey
    255,
    160,
    208, // pink
    20,
    245,
    60, // lt green
    208,
    221,
    141, // yellow
    114,
    255,
    208, // aqua
    255,
    255,
    255
  ); // white

  var hcolor_texture = color_table_texture(
    0,
    0,
    0, // black
    255,
    68,
    253, // purple
    20,
    245,
    60, // green
    255,
    255,
    255, // white
    0,
    0,
    0, // black
    20,
    207,
    253, // blue
    255,
    106,
    60, // orange
    255,
    255,
    255
  ); // white

  var first_pass = {
    texture: new_texture(512, 256, gl.RGBA),
    frame_buffer: gl.createFramebuffer(),
  };
  gl.bindFramebuffer(gl.FRAMEBUFFER, first_pass.frame_buffer);
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D,
    first_pass.texture.texture,
    0
  );

  printf(
    "%d out of %d texture units used\n",
    next_texture_unit,
    gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS)
  );
  if (next_texture_unit > gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS))
    return null;

  gl_program(gl, {
    shaders: {
      "apple2-renderer.fs": gl.FRAGMENT_SHADER,
      "boring-matrix-vertex-shader.vs": gl.VERTEX_SHADER,
    },
    uniforms: [
      "p_matrix",
      "mv_matrix",
      "graphics_mode",
      "hires_mode",
      "mixed_mode",
      "flash_state",
    ],
    attributes: ["vertex_position"],
    init: {
      text: text_texture.tex_unit,
      hires: hires_texture.tex_unit,
      charset: charset_texture.tex_unit,
      color_table: color_texture.tex_unit,
      hcolor_table: hcolor_texture.tex_unit,
    },
    callback: function (program, error) {
      if (error) {
        printf("Errors in 1st pass!\n%s\n", error);
        return;
      }
      merge_into(first_pass, program);

      gl.enableVertexAttribArray(first_pass.vertex_position);
      gl.vertexAttribPointer(
        first_pass.vertex_position,
        3,
        gl.FLOAT,
        false,
        0,
        0
      );

      set_uniform_matrix(gl, first_pass.uniform.p_matrix, Matrix.I(4));
      set_uniform_matrix(
        gl,
        first_pass.uniform.mv_matrix,
        makeOrtho(0, 280, 192, 0, -1000, 1000)
      );
    },
  });

  var second_pass;
  gl_program(gl, {
    shaders: {
      "apple2-renderer-2nd-pass.fs": gl.FRAGMENT_SHADER,
      "boring-matrix-vertex-shader.vs": gl.VERTEX_SHADER,
    },
    uniforms: [
      "p_matrix",
      "mv_matrix",
      "graphics_mode",
      "hires_mode",
      "mixed_mode",
    ],
    attributes: ["vertex_position"],
    init: { first_pass: first_pass.texture.tex_unit },
    callback: function (program, error) {
      if (error) {
        printf("Errors in 2nd pass!\n%s\n", error);
        return;
      }
      second_pass = program;

      gl.enableVertexAttribArray(second_pass.vertex_position);
      gl.vertexAttribPointer(
        second_pass.vertex_position,
        3,
        gl.FLOAT,
        false,
        0,
        0
      );

      set_uniform_matrix(gl, second_pass.uniform.p_matrix, Matrix.I(4));
      set_uniform_matrix(
        gl,
        second_pass.uniform.mv_matrix,
        makeOrtho(0, 280, 192, 0, -1000, 1000)
      );
    },
  });

  var flash_period = 1.44 / ((12000 + 2 * 3300000) * 0.0000001); // A 555 timer running in astable mode. Formula from National's data sheet. Ra=12K Rb=3.3M C=.1uF
  flash_period /= 4; // hack--my calculations are incorrect and it runs way too slow.

  var text_line_offset = function (y) {
    return ((y & 7) << 7) | (((y & 0x18) >> 3) * 40);
  };

  var hgr_line_offset = function (y) {
    return ((y & 7) << 10) | text_line_offset(y >> 3);
  };

  var squareVerticesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);
  var vertices = [0, 0, 0, 280, 0, 0, 0, 192, 0, 280, 192, 0];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  this.update = function (frame, frames__second, video_mode, ram) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, first_pass.frame_buffer);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    if (!first_pass || !second_pass) return; // Shaders not initialized yet.

    gl.useProgram(first_pass.program);

    var text_start = [0x0400, 0x0800][video_mode.page]; // text or lo-res
    var hgr_start = [0x2000, 0x4000][video_mode.page]; // hi-res
    var flash_state = Math.floor(frame / frames__second / flash_period) & 1;

    if (video_mode.graphics && video_mode.hires)
      set_texture_data(hires_texture, ram.slice(hgr_start, hgr_start + 0x2000));
    if (!video_mode.graphics || !video_mode.hires || video_mode.mixed)
      set_texture_data(text_texture, ram.slice(text_start, text_start + 0x400));

    gl.uniform1i(first_pass.uniform.graphics_mode, video_mode.graphics);
    gl.uniform1i(first_pass.uniform.hires_mode, video_mode.hires);
    gl.uniform1i(first_pass.uniform.mixed_mode, video_mode.mixed);
    gl.uniform1i(first_pass.uniform.flash_state, flash_state);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    //        check_err("1st pass");

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(second_pass.program);

    gl.uniform1i(second_pass.uniform.graphics_mode, video_mode.graphics);
    gl.uniform1i(second_pass.uniform.hires_mode, video_mode.hires);
    gl.uniform1i(second_pass.uniform.mixed_mode, video_mode.mixed);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    //        check_err("2nd pass");
  };
}

function load_shader(gl, type, url, f) {
  loadText(url, function (shader_source, error, status) {
    if (error) return f(undefined, error, status);
    var shader = gl.createShader(type);
    gl.shaderSource(shader, shader_source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
      f(undefined, gl.getShaderInfoLog(shader));
    else f(shader);
  });
}

function load_fragment_shader(gl, url, f) {
  return load_shader(gl, gl.FRAGMENT_SHADER, url, f);
}
function load_vertex_shader(gl, url, f) {
  return load_shader(gl, gl.VERTEX_SHADER, url, f);
}

function gl_program(gl, params) {
  var compiled_shaders = [];
  var load_next_shader = function () {
    for (var name in params.shaders) break;
    if (name) {
      var type = params.shaders[name];
      delete params.shaders[name];
      load_shader(gl, type, name, function (compiled, error, status) {
        if (error) return f(undefined, name + ": " + (error || "unknown"));
        compiled_shaders.push(compiled);
        load_next_shader();
      });
    } else {
      // All shaders compiled. Time to link.
      var program = { program: gl.createProgram(), uniform: {}, attribute: {} };
      for (var s in compiled_shaders)
        gl.attachShader(program.program, compiled_shaders[s]);
      gl.linkProgram(program.program);

      if (!gl.getProgramParameter(program.program, gl.LINK_STATUS))
        return params.callback(undefined, "Shader program failed link stage");

      gl.useProgram(program.program);

      for (var u = 0; u < params.uniforms.length; u++)
        program.uniform[params.uniforms[u]] = gl.getUniformLocation(
          program.program,
          params.uniforms[u]
        );
      for (var a = 0; a < params.attributes.length; a++)
        program.attribute[params.attributes[a]] = gl.getAttribLocation(
          program.program,
          params.attributes[a]
        );
      for (var name in params.init)
        gl.uniform1i(
          gl.getUniformLocation(program.program, name),
          params.init[name]
        );

      params.callback(program);
    }
  };
  load_next_shader();
}

function set_uniform_matrix(gl, uniform, matrix) {
  gl.uniformMatrix4fv(uniform, false, new Float32Array(matrix.flatten()));
}
