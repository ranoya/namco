//  Copyright (c) 2011 David Caldwell,  All Rights Reserved.

function apple2() {
  var trace = false;

  var ram = [];
  var video_mode = {};

  var power_on_reset = function () {
    for (var i = 0; i < 0xbfff; i++) ram[i] = Math.floor(Math.random() * 256);

    video_mode = {
      page: 0,
      graphics: false,
      hires: false,
      mixed: false,
    };
  };
  power_on_reset();

  var _this = this;
  var key_latch = 0;
  this.keypress = function (key) {
    if (key.length == 1) key_latch = key.toUpperCase().charCodeAt(0);
    // Most keys are straight ascii.
    else if (key == "M")
      key_latch = 0x5d; // Weird special cases form the Apple book (Chapter 1, Page 7, Table 2)
    else if (key == "C-M") key_latch = 0x1d;
    else if (key == "C-^") key_latch = 0x1e;
    else if (key == "C-@") key_latch = 0x00;
    else if (key.match(/^C-.$/)) key_latch = key.charCodeAt(2) & 0x1f;
    // Control keys are straight ascii, too.
    else if (key == "return") key_latch = 0x0d;
    else if (key == "backspace") key_latch = 0x08;
    else if (key == "left") key_latch = 0x08;
    else if (key == "right") key_latch = 0x15;
    else if (key == "escape") key_latch = 0x1b;
    else if (key == "space") key_latch = 0x20;
    else return true;
    key_latch |= 0x80;
    return false;
  };

  this.key_board_data_input = function keyboard_data_input(cycle, addr) {
    return key_latch;
  };
  this.clear_keyboard_strobe = function clear_keyboard_strobe(
    cycle,
    addr,
    data
  ) {
    key_latch &= 0x7f;
  };
  this.cassette_output_toggle = function cassette_output_toggle(
    cycle,
    addr,
    data
  ) {};
  this.speaker_toggle = function speaker_toggle(cycle, addr, data) {
    _this.speaker.toggle(cycle / _this.clock_hz);
  };
  this.utility_strobe = function utility_strobe(cycle, addr, data) {};
  this.set_graphics_modes = function set_graphics_mode(cycle, addr, data) {
    if (addr == 0xc050) {
      video_mode.graphics = true;
      return 0x80; /* Drol wants this for some reason. */
    }
    if (addr == 0xc051) video_mode.graphics = false;
    if (addr == 0xc052) video_mode.mixed = false;
    if (addr == 0xc053) video_mode.mixed = true;
    if (addr == 0xc054) video_mode.page = 0;
    if (addr == 0xc055) video_mode.page = 1;
    if (addr == 0xc056) video_mode.hires = false;
    if (addr == 0xc057) video_mode.hires = true;
  };
  this.set_anunciators = function set_annunciators(cycle, addr, data) {};

  var joystick_state = { trigger_cycle: 0, X: 0, Y: 0, B1: 0, B2: 0 };
  this.joystick = function (data) {
    for (var d in data) if (d in joystick_state) joystick_state[d] = data[d];
  };
  var joystick_one_shot = function (val, trigger_cycle, current_cycle) {
    val = (val + 1) / 2; // [-1,+1] => [0,1]
    // 558 Monostable multivibrator H13, output hooked to D7
    var C = 0.000000022; // .022uF (C5,C6,C7,C8)
    var R = /*R20,R21,R22,R23*/ 100 + 150000 /*pot*/ * val * 0.69; /*fudge!*/
    var pulse_width_seconds = C * R * Math.log(3); // https://secure.wikimedia.org/wikipedia/en/wiki/555_timer_IC#Monostable_mode
    return pulse_width_seconds * _this.clock_hz > current_cycle - trigger_cycle
      ? 0x80
      : 0x00;
  };

  this.game_controller = function game_controller(cycle, addr) {
    if (addr == 0xc060); // cassette_in
    if (addr == 0xc061) return joystick_state.B1 ? 0xff : 0;
    if (addr == 0xc062) return joystick_state.B2 ? 0xff : 0;
    if (addr == 0xc063); // button 3
    if (addr == 0xc064)
      return joystick_one_shot(
        joystick_state.X,
        joystick_state.trigger_cycle,
        cycle
      );
    if (addr == 0xc065)
      return joystick_one_shot(
        joystick_state.Y,
        joystick_state.trigger_cycle,
        cycle
      );
    if (addr == 0xc066); // P2 X
    if (addr == 0xc067); // P2 Y
  };
  this.game_controller_strobe = function game_controller_strobe(
    cycle,
    addr,
    data
  ) {
    joystick_state.trigger_cycle = cycle;
  };

  this.slot = [];

  this.peripheral_card_io = function peripheral_card_io(
    cycle,
    addr,
    data,
    trace
  ) {
    var slot_num = ((addr >> 4) & 0xf) - 8;
    return (
      _this.slot[slot_num] &&
      _this.slot[slot_num].io(cycle, addr & 0x0f, data, trace)
    );
  };

  this.peripheral_card_rom = function peripheral_card_rom(cycle, addr, data) {
    var slot_num = (addr >> 8) & 0xf;
    return _this.slot[slot_num] && _this.slot[slot_num].rom[addr & 0xff];
  };

  this.memmap = [
    { start: 0x0000, end: 0xbfff, ram: ram },

    // Built-in I/O Locations
    { start: 0xc000, end: 0xc00f, io: this.key_board_data_input },
    { start: 0xc010, end: 0xc01f, io: this.clear_keyboard_strobe },
    { start: 0xc020, end: 0xc02f, io: this.cassette_output_toggle },
    { start: 0xc030, end: 0xc03f, io: this.speaker_toggle },
    { start: 0xc040, end: 0xc04f, io: this.utility_strobe },
    { start: 0xc050, end: 0xc057, io: this.set_graphics_modes },
    { start: 0xc058, end: 0xc05f, io: this.set_anunciators },
    { start: 0xc060, end: 0xc06f, io: this.game_controller },
    { start: 0xc070, end: 0xc07f, io: this.game_controller_strobe },

    { start: 0xc080, end: 0xc0ff, io: this.peripheral_card_io },
    { start: 0xc100, end: 0xc7ff, io: this.peripheral_card_rom },

    //{ start:0xc800, end:0xcffe, io:this.peripheral_card_expansion_rom },
    //{ start:0xcfff, end:0xcfff, io:this.peripheral_card_expansion_rom_disable },

    { start: 0xd000, end: 0xffff, rom: apple_2_plus_rom },
  ];
  var cpu = new cpu6502(this.memmap);
  this.clock_hz = 1023000;
  this.frames__second = 30;

  this.power_on_reset = function () {
    power_on_reset();
    for (var s = 0; s < this.slot.length; s++)
      if (this.slot[s] && this.slot[s].power_on_reset)
        this.slot[s].power_on_reset();
    this.reset();
  };
  this.reset = function () {
    cpu.reset();
  };

  this.averager = function (depth) {
    this.times = [];
    this.depth = depth;
    var start;
    this.start = function () {
      start = new Date();
    };
    this.end = function (per) {
      var end = new Date();
      this.times.push({ seconds: (end - start) / 1000, per: per });
      if (this.times.length == this.depth) this.times.shift();
    };
    this.totals = function () {
      var total = 0,
        per = 0;
      for (var i = 0; i < this.times.length; i++) {
        total += this.times[i].seconds;
        per += this.times[i].per;
      }
      return { total: total, per: per, count: this.times.length };
    };
  };

  this.slop = 0;
  this.frame = 0;
  this.cpu_run_time = new this.averager(100);
  this.video_render_time = new this.averager(60);
  this.seconds_to_next_frame = 0;
  this.run = function (seconds_to_run) {
    while (seconds_to_run > 0) {
      var seconds = Math.min(this.seconds_to_next_frame, seconds_to_run);

      this.cpu_run_time.start();
      this.slop = cpu.run(this.clock_hz * seconds + this.slop);
      this.cpu_run_time.end(seconds);

      this.seconds_to_next_frame -= seconds;
      seconds_to_run -= seconds;
      if (this.seconds_to_next_frame <= 0) {
        this.frame++;

        this.video_render_time.start();
        this.screen.update(this.frame, this.frames__second, video_mode, ram);
        this.video_render_time.end(1 /*frame*/);

        this.seconds_to_next_frame += 1 / this.frames__second;
      }
    }
    return cpu.last_trace();
  };
  this.set_trace = function (t) {
    cpu.set_trace((trace = t));
  };

  this.screen = { update: function () {} };

  this.set_screen_driver = function (driver) {
    this.screen = driver;
  };

  this.speaker = { toggle: function (seconds) {}, render: function () {} };
  this.set_speaker_driver = function (driver) {
    if (driver) this.speaker = driver;
  };

  this.stats = function () {
    return cpu.stats();
  };
}
