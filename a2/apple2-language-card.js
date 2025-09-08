//  Copyright (c) 2012 David Caldwell,  All Rights Reserved.

function apple2_language_card(machine) {
  // Language card Read:
  //   When RAM enabled:   8K RAM from E000-FFFF
  //     + 1 of 2 banks of 4K RAM from D000-DFFF
  //   Otherwise       :  12K ROM from D000-FFFF
  // Writes are similar but controlled by write_protect (independent from RAM enabled!)

  // This is kind of hacky:
  var mem = machine.memmap[machine.memmap.length - 1];
  mem._bank = [[], [], []];

  for (var i = 0; i < 0x1000; i++)
    mem._bank[0][i] = Math.floor(Math.random() * 256);
  for (var i = 0; i < 0x1000; i++)
    mem._bank[1][i] = Math.floor(Math.random() * 256);
  for (var i = 0; i < 0x2000; i++)
    mem._bank[2][i] = Math.floor(Math.random() * 256);

  mem._rom = mem.rom;
  delete mem.rom;

  var ram_enabled, write_protect, ram_bank;

  mem.io = function (cycle, addr, data, trace) {
    var mem_base = addr <= 0xdfff ? 0xd000 : 0xe000;
    if (!write_protect && data != undefined)
      return (mem._bank[addr <= 0xdfff ? ram_bank : 2][addr - mem_base] = data);

    if (!ram_enabled) return mem._rom[addr - mem.start];

    return mem._bank[addr <= 0xdfff ? ram_bank : 2][addr - mem_base];
  };

  var power_on_reset = function () {
    ram_enabled = false;
    write_protect = false;
    ram_bank = 0;
  };
  power_on_reset();

  var last_addr;
  var lang_io_reg = function (cycle, addr, data, trace_in) {
    // Bits: BRcc B => Bank, R=>reserved, cc => command
    ram_bank = addr & 0x8 ? 1 : 0;
    if ((addr & 0x3) == 0x0) {
      ram_enabled = true;
      write_protect = true;
    }
    if ((addr & 0x3) == 0x1) {
      ram_enabled = false;
      if ((last_addr == addr) & 0xb) write_protect = false;
    }
    if ((addr & 0x3) == 0x2) {
      ram_enabled = false;
      write_protect = true;
    }
    if ((addr & 0x3) == 0x3) {
      ram_enabled = true;
      if ((last_addr == addr) & 0xb) write_protect = false;
    }
    last_addr = addr & 0xb;
  };

  return { io: lang_io_reg, rom: [], power_on_reset: power_on_reset };
}
