//  Copyright (c) 2011 David Caldwell,  All Rights Reserved.

function merge_into(to /*, from, [from, ...]*/) {
  for (var a = 1; a < arguments.length; a++)
    for (var i in arguments[a]) to[i] = arguments[a][i];
  return to;
}

function _cpu6502a() {
  var reg, build, opcode, opsrc;

  var run = function () {
    build();
  };

  build = function () {};

  return { reset: reset, run: run };
}

function cpu6502() {
  var C = 1,
    Z = 2,
    I = 4,
    D = 8,
    B = 16,
    V = 64,
    N = 128; // Status bits
  var vec = { nmi: 0xfffa, reset: 0xfffc, brk: 0xfffe };
  var reg;
  var memmap; // = [{ start:0x0000, end:0xefff, ram:[] },
  // { start:0xf000, end:0xffff, read:read_dev, write:write_dev }]
  var memmap_cache;

  var mem8, mem16, opcode, build, reset; // predeclarations
  var init = function (memmap_in) {
    memmap = memmap_in;
    memmap_cache = Array(0x10000);
    for (var a = 0; a < 0x10000; a++)
      for (var m = 0; m < memmap.length; m++)
        if (memmap[m].start <= a && a <= memmap[m].end) {
          memmap_cache[a] = memmap[m];
          break;
        }
    build();
    reset();
  };
  var cycle = 0;
  var reset = function () {
    reg = {
      PC: mem16(vec.reset),
      A: 0,
      X: 0,
      Y: 0,
      SP: 0,
      s: { N: 0, Z: 0, C: 0, I: 1, D: 0, V: 0 },
    };
    cycle = 0;
  };
  var mem_trace = false;
  var trace_out;
  var count = [];
  for (var i = 0; i < 256; i++) count[i] = 0;
  var trace, _trace;
  var run = function (cycles) {
    while (cycles > 0) {
      trace =
        _trace ||
        //0xfbc1 <= reg.PC && reg.PC <= 0xfbd8 || // BASCALC
        //0xfc42 <= reg.PC && reg.PC <= 0xfc60 || // HOME/CLEOP1
        //0xfc9e <= reg.PC && reg.PC <= 0xfca7 || // CLEOLZ
        0;
      if (trace) {
        trace_out += sprintf(
          "PC:%04x A:%02x X:%02x Y:%02x SP:%02x SR[%s%s%s%s%s%s%s] [%-10d]",
          reg.PC,
          reg.A,
          reg.X,
          reg.Y,
          reg.SP,
          reg.s.N ? "N" : "n",
          reg.s.V ? "V" : "v",
          reg.s.B ? "B" : "b",
          reg.s.D ? "D" : "d",
          reg.s.I ? "I" : "i",
          reg.s.Z ? "Z" : "z",
          reg.s.C ? "C" : "c",
          cycle
        );
        trace_out += sprintf("  stack:");
        for (var i = 0; i < 5; i++)
          trace_out += sprintf(
            " %02x",
            mem8(((reg.SP + i + 1) & 0xff) + 0x100)
          );
      }
      var op = mem8(reg.PC++);
      var opname = opcode[op].name;
      count[op]++;
      if (trace)
        trace_out += sprintf(
          "  opcode: %02x %2s %2s  %s %-8s\n",
          op,
          opcode[op].oper && opcode[op].oper.length > 1
            ? sprintf("%02x", oper8_peek(0))
            : "",
          opcode[op].oper && opcode[op].oper.length > 2
            ? sprintf("%02x", oper8_peek(1))
            : "",
          opcode[op].name,
          opcode[op].oper ? opcode[op].oper.trace() : ""
        );
      if ((mem_trace = trace))
        trace_out += sprintf("   %04x %s %02x\n", reg.PC - 1, "=>", op);
      var oper = opcode[op].oper && opcode[op].oper.fetch();
      opcode[op].insn(oper);
      mem_trace = false;
      cycles -= opcode[op].cycles;
      cycle += opcode[op].cycles;
    }
    return cycles;
  };

  var device_trace = function (s) {
    trace_out += s;
  };
  var mem8 = function (a, v) {
    var r,
      mm = memmap_cache[a];
    if (!mm)
      // Will happen if there's a hole in the memory map.
      return 0xdc;
    if (mm.ram)
      if (v != undefined) r = mm.ram[a - mm.start] = v;
      else r = mm.ram[a - mm.start];
    else if (mm.rom) r = mm.rom[a - mm.start];
    else r = mm.io && mm.io(cycle, a, v, mem_trace ? device_trace : undefined);
    if (mem_trace)
      trace_out += sprintf(
        "   %04x %s %02x\n",
        a,
        v == undefined ? "=>" : "<=",
        v == undefined ? (r == undefined ? 0xdc : r) : v
      );
    return r == undefined ? 0xdc : r; // undefined memory
  };
  var mem16 = function (a) {
    return mem8(a) | (mem8(a + 1) << 8);
  }; // should be | mem[a & 0xff00 | (a+1) & 0x00ff] to account for bug in 6502
  var oper8 = function () {
    return mem8(reg.PC++);
  };
  var oper16 = function () {
    return oper8() | (oper8() << 8);
  };
  var oper8_peek = function (o) {
    return mem8(reg.PC + (o || 0));
  };
  var oper16_peek = function () {
    return oper8_peek(0) | (oper8_peek(1) << 8);
  };
  var zero_page8 = function (a) {
    return mem8(a & 0xff);
  };
  var zero_page16 = function (a) {
    return zero_page8(a) | (zero_page8(a + 1) << 8);
  };
  var status = function (f, v) {
    if (f & C) reg.s.C = v > 0xff || v < 0;
    if (f & Z) reg.s.Z = (v & 0xff) == 0;
    if (f & N) reg.s.N = v & 0x80;
    return v & 0xff;
  };
  var signed = function (v) {
    return v > 127 ? v - 256 : v;
  };
  var adc_bin = function (oper) {
    var sv = signed(reg.A) + signed(oper) + !!reg.s.C;
    var uv = reg.A + oper + !!reg.s.C;
    reg.s.V = sv < -128 || sv > 127;
    reg.s.C = uv > 0xff;
    reg.A = status(Z | N, uv);
  };
  var sbc_bin = function (oper) {
    var sv = signed(reg.A) - signed(oper) - !reg.s.C;
    var uv = reg.A - oper - !reg.s.C;
    reg.s.V = sv < -128 || sv > 127;
    reg.s.C = uv >= 0;
    reg.A = status(Z | N, uv);
  };
  var push8 = function (v) {
    mem8(0x100 + reg.SP--, v & 0xff);
    reg.SP &= 0xff;
    return v;
  };
  var push16 = function (v) {
    push8(v >> 8);
    push8(v);
    return v;
  };
  var pop8 = function () {
    reg.SP = (reg.SP + 1) & 0xff;
    return mem8(0x100 + reg.SP);
  };
  var pop16 = function () {
    return pop8() | (pop8() << 8);
  };
  var interrupt = function () {
    printf("Implement me!\n");
  };

  var php = function () {
    push8(
      (reg.s.C ? C : 0) |
        (reg.s.Z ? Z : 0) |
        (reg.s.I ? I : 0) |
        (reg.s.D ? D : 0) |
        (reg.s.B ? B : 0) |
        (reg.s.V ? V : 0) |
        (reg.s.N ? N : 0)
    );
  };
  var plp = function () {
    var v = pop8();
    reg.s.C = v & C;
    reg.s.Z = v & Z;
    reg.s.I = v & I;
    reg.s.D = v & D;
    reg.s.B = v & B;
    reg.s.V = v & V;
    reg.s.N = v & N;
  };

  var binary_from_bcd = function (bcd) {
    return ((bcd >> 4) & 0xf) * 10 + (bcd & 0xf);
  };
  var bcd_from_binary = function (bin) {
    bin = (bin + 100) % 100;
    return (Math.floor(bin / 10) << 4) | bin % 10;
  };
  var adc_bcd = function (oper) {
    var v = binary_from_bcd(reg.A) + binary_from_bcd(oper) + !!reg.s.C;
    reg.s.C = v > 99;
    reg.A = status(Z, bcd_from_binary(v));
  };
  var sbc_bcd = function (oper) {
    var v = binary_from_bcd(reg.A) - binary_from_bcd(oper) - !reg.s.C;
    reg.s.C = v >= 0;
    reg.A = status(Z, bcd_from_binary(v));
  };

  var read_oper = {
    //accumulator: function() { return reg.A }                            , // accumulator
    immediate: {
      fetch: function () {
        return oper8();
      },
      length: 2,
      trace: function () {
        return sprintf("#%02x", oper8_peek());
      },
    }, // #immediate
    branch: {
      fetch: function () {
        return oper8();
      },
      length: 2,
      trace: function () {
        return sprintf("$%04x", signed(oper8_peek()) + reg.PC + 1);
      },
    },
    zeropage: {
      fetch: function () {
        return zero_page8(oper8());
      },
      length: 2,
      trace: function () {
        return sprintf("$%02x", oper8_peek());
      },
    }, // zeropage
    zeropage_x: {
      fetch: function () {
        return zero_page8(oper8() + reg.X);
      },
      length: 2,
      trace: function () {
        return sprintf("$%02x,X", oper8_peek());
      },
    }, // zeropage,X
    zeropage_y: {
      fetch: function () {
        return zero_page8(oper8() + reg.Y);
      },
      length: 2,
      trace: function () {
        return sprintf("$%02x,Y", oper8_peek());
      },
    }, // zeropage,Y
    absolute: {
      fetch: function () {
        return mem8(oper16());
      },
      length: 3,
      trace: function () {
        return sprintf("$%04x", oper16_peek());
      },
    }, // absolute
    absolute_x: {
      fetch: function () {
        return mem8(oper16() + reg.X);
      },
      length: 3,
      trace: function () {
        return sprintf("$%04x,X", oper16_peek());
      },
    }, // absolute,X
    absolute_y: {
      fetch: function () {
        return mem8(oper16() + reg.Y);
      },
      length: 3,
      trace: function () {
        return sprintf("$%04x,Y", oper16_peek());
      },
    }, // absolute,Y
    indirect_x: {
      fetch: function () {
        return mem8(zero_page16(oper8() + reg.X));
      },
      length: 2,
      trace: function () {
        return sprintf("($%02x,X)", oper8_peek());
      },
    }, // (indirect,X)
    indirect_y: {
      fetch: function () {
        return mem8(zero_page16(oper8()) + reg.Y);
      },
      length: 2,
      trace: function () {
        return sprintf("($%02x),Y", oper8_peek());
      },
    }, // (indirect),Y
  };
  var write_oper = {
    zeropage: {
      fetch: function () {
        return oper8() & 0xff;
      },
      length: 2,
      trace: function () {
        return sprintf("$%02x", oper8_peek());
      },
    }, // zeropage
    zeropage_x: {
      fetch: function () {
        return (oper8() + reg.X) & 0xff;
      },
      length: 2,
      trace: function () {
        return sprintf("$%02x,X", oper8_peek());
      },
    }, // zeropage,X
    zeropage_y: {
      fetch: function () {
        return (oper8() + reg.Y) & 0xff;
      },
      length: 2,
      trace: function () {
        return sprintf("$%02x,Y", oper8_peek());
      },
    }, // zeropage,Y
    absolute: {
      fetch: function () {
        return oper16();
      },
      length: 3,
      trace: function () {
        return sprintf("$%04x", oper16_peek());
      },
    }, // absolute
    absolute_x: {
      fetch: function () {
        return oper16() + reg.X;
      },
      length: 3,
      trace: function () {
        return sprintf("$%04x,X", oper16_peek());
      },
    }, // absolute,X
    absolute_y: {
      fetch: function () {
        return oper16() + reg.Y;
      },
      length: 3,
      trace: function () {
        return sprintf("$%04x,Y", oper16_peek());
      },
    }, // absolute,Y
    indirect16: {
      fetch: function () {
        return mem16(oper16());
      },
      length: 3,
      trace: function () {
        return sprintf("($%04x)", oper16_peek());
      },
    }, // (indirect)
    indirect_x: {
      fetch: function () {
        return zero_page16(oper8() + reg.X);
      },
      length: 2,
      trace: function () {
        return sprintf("($%02x,X)", oper8_peek());
      },
    }, // (indirect,X)
    indirect_y: {
      fetch: function () {
        return zero_page16(oper8()) + reg.Y;
      },
      length: 2,
      trace: function () {
        return sprintf("($%02x),Y", oper8_peek());
      },
    }, // (indirect),Y
  };

  var accum_oper = function (code) {
    return {
      2: { cycles: 2, oper: read_oper.immediate },
      1: { cycles: 3, oper: read_oper.zeropage },
      5: { cycles: 4, oper: read_oper.zeropage_x },
      3: { cycles: 4, oper: read_oper.absolute },
      7: { cycles: 4, oper: read_oper.absolute_x },
      6: { cycles: 4, oper: read_oper.absolute_y },
      0: { cycles: 6, oper: read_oper.indirect_x },
      4: { cycles: 5, oper: read_oper.indirect_y },
    }[(code >> 2) & 7];
  };
  var ldx_oper = function (code) {
    return {
      0: { cycles: 2, oper: read_oper.immediate },
      1: { cycles: 3, oper: read_oper.zeropage },
      5: { cycles: 4, oper: read_oper.zeropage_y },
      3: { cycles: 5, oper: read_oper.absolute },
      7: { cycles: 6, oper: read_oper.absolute_y },
    }[(code >> 2) & 7];
  };
  var ldy_oper = function (code) {
    return {
      0: { cycles: 2, oper: read_oper.immediate },
      1: { cycles: 3, oper: read_oper.zeropage },
      5: { cycles: 4, oper: read_oper.zeropage_x },
      3: { cycles: 5, oper: read_oper.absolute },
      7: { cycles: 6, oper: read_oper.absolute_x },
    }[(code >> 2) & 7];
  };
  var mem_write_oper = function (code) {
    return {
      //2: { cycles:2, oper:write_oper.accumulator  }, // Have to do this externally since we can't make mem() write to the accumulator (easily)
      1: { cycles: 5, oper: write_oper.zeropage },
      5: { cycles: 6, oper: write_oper.zeropage_x },
      3: { cycles: 6, oper: write_oper.absolute },
      7: { cycles: 7, oper: write_oper.absolute_x },
    }[(code >> 2) & 7];
  };
  var bit_oper = function (code) {
    return code == 0x24
      ? { cycles: 3, oper: read_oper.zeropage }
      : code == 0x2c
      ? { cycles: 4, oper: read_oper.absolute }
      : undefined;
  };
  var cpxy_oper = function (code) {
    return {
      0: { cycles: 2, oper: read_oper.immediate },
      1: { cycles: 3, oper: read_oper.zeropage },
      3: { cycles: 4, oper: read_oper.absolute },
    }[(code >> 2) & 7];
  };
  var inc_dec_oper = function (code) {
    return {
      1: { cycles: 5, oper: write_oper.zeropage },
      5: { cycles: 6, oper: write_oper.zeropage_x },
      3: { cycles: 6, oper: write_oper.absolute },
      7: { cycles: 7, oper: write_oper.absolute_x },
    }[(code >> 2) & 7];
  };
  var jmp_oper = function (code) {
    return code == 0x4c
      ? { cycles: 3, oper: write_oper.absolute }
      : code == 0x6c
      ? { cycles: 5, oper: write_oper.indirect16 }
      : undefined;
  };
  var sta_oper = function (code) {
    return {
      1: { cycles: 3, oper: write_oper.zeropage },
      5: { cycles: 4, oper: write_oper.zeropage_x },
      3: { cycles: 4, oper: write_oper.absolute },
      7: { cycles: 5, oper: write_oper.absolute_x },
      6: { cycles: 5, oper: write_oper.absolute_y },
      0: { cycles: 6, oper: write_oper.indirect_x },
      4: { cycles: 6, oper: write_oper.indirect_y },
    }[(code >> 2) & 7];
  };
  var stx_oper = function (code) {
    return {
      1: { cycles: 3, oper: write_oper.zeropage },
      5: { cycles: 4, oper: write_oper.zeropage_y },
      3: { cycles: 4, oper: write_oper.absolute },
    }[(code >> 2) & 7];
  };
  var sty_oper = function (code) {
    return {
      1: { cycles: 3, oper: write_oper.zeropage },
      5: { cycles: 4, oper: write_oper.zeropage_x },
      3: { cycles: 4, oper: write_oper.absolute },
    }[(code >> 2) & 7];
  };
  var opsrc;
  var build = function () {
    opcode = [];
    for (var o = 0; o < 256; o++)
      for (var s in opsrc)
        if ((o & opsrc[s].mask) == opsrc[s].code) {
          if (opsrc[s].build) {
            var co = opsrc[s].build.apply(this, [o]);
            if (co)
              opcode[o] = {
                cycles: co.cycles,
                oper: co.oper,
                insn: opsrc[s].insn,
                name: opsrc[s].name,
              };
          } else opcode[o] = opsrc[s];
        }

    for (
      var o = 0;
      o < 256;
      o++ // Undefined instructions become NOPs.
    )
      if (opcode[o] == undefined)
        opcode[o] = {
          insn: "death",
          name: "illegal instruciton",
          insn: function () {
            throw "illegal instruction";
          },
        };
    //opcode[o] = opcode[0xea/*NOP*/];
  };

  var branch = function (oper) {
    // branches are signed
    reg.PC += signed(oper);
  };

  var opsrc = [
    {
      name: "adc",
      code: 0x61,
      mask: 0xe3,
      build: accum_oper,
      insn: function (oper) {
        if (!reg.s.D) {
          adc_bin(oper);
        } /*BCD*/ else {
          adc_bcd(oper);
        }
      },
    },
    {
      name: "and",
      code: 0x21,
      mask: 0xe3,
      build: accum_oper,
      insn: function (oper) {
        status(N | Z, (reg.A &= oper));
      },
    },
    {
      name: "asl",
      code: 0x0a,
      mask: 0xff,
      cycles: 2,
      insn: function (oper) {
        reg.A = status(N | Z | C, reg.A << 1);
      },
    },
    {
      name: "asl",
      code: 0x02,
      mask: 0xe3,
      build: mem_write_oper,
      insn: function (oper) {
        var v = status(N | Z | C, mem8(oper) << 1);
        mem8(oper, v);
      },
    },
    {
      name: "bcc",
      code: 0x90,
      mask: 0xff,
      cycles: 2,
      oper: read_oper.branch,
      insn: function (oper) {
        if (!reg.s.C) branch(oper);
      },
    },
    {
      name: "bcs",
      code: 0xb0,
      mask: 0xff,
      cycles: 2,
      oper: read_oper.branch,
      insn: function (oper) {
        if (reg.s.C) branch(oper);
      },
    },
    {
      name: "beq",
      code: 0xf0,
      mask: 0xff,
      cycles: 2,
      oper: read_oper.branch,
      insn: function (oper) {
        if (reg.s.Z) branch(oper);
      },
    },
    {
      name: "bit",
      code: 0x24,
      mask: 0xf7,
      build: bit_oper,
      insn: function (oper) {
        status(Z, oper & reg.A);
        reg.s.N = oper & 0x80;
        reg.s.V = oper & 0x40;
      },
    },
    {
      name: "bmi",
      code: 0x30,
      mask: 0xff,
      cycles: 2,
      oper: read_oper.branch,
      insn: function (oper) {
        if (reg.s.N) branch(oper);
      },
    },
    {
      name: "bne",
      code: 0xd0,
      mask: 0xff,
      cycles: 2,
      oper: read_oper.branch,
      insn: function (oper) {
        if (!reg.s.Z) branch(oper);
      },
    },
    {
      name: "bpl",
      code: 0x10,
      mask: 0xff,
      cycles: 2,
      oper: read_oper.branch,
      insn: function (oper) {
        if (!reg.s.N) branch(oper);
      },
    },
    {
      name: "brk",
      code: 0x00,
      mask: 0xff,
      cycles: 7,
      insn: function (oper) {
        reg.s.I = 1;
        push16(reg.PC + 1);
        php();
        reg.PC = mem16(vec.brk);
      },
    },
    {
      name: "bvc",
      code: 0x50,
      mask: 0xff,
      cycles: 2,
      oper: read_oper.branch,
      insn: function (oper) {
        if (!reg.s.V) branch(oper);
      },
    },
    {
      name: "bvs",
      code: 0x70,
      mask: 0xff,
      cycles: 2,
      oper: read_oper.branch,
      insn: function (oper) {
        if (reg.s.V) branch(oper);
      },
    },
    {
      name: "clc",
      code: 0x18,
      mask: 0xff,
      cycles: 2,
      insn: function (oper) {
        reg.s.C = 0;
      },
    },
    {
      name: "cld",
      code: 0xd8,
      mask: 0xff,
      cycles: 2,
      insn: function (oper) {
        reg.s.D = 0;
      },
    },
    {
      name: "cli",
      code: 0x58,
      mask: 0xff,
      cycles: 2,
      insn: function (oper) {
        reg.s.I = 0;
      },
    },
    {
      name: "clv",
      code: 0xb8,
      mask: 0xff,
      cycles: 2,
      insn: function (oper) {
        reg.s.V = 0;
      },
    },
    {
      name: "cmp",
      code: 0xc1,
      mask: 0xe3,
      build: accum_oper,
      insn: function (oper) {
        status(N | Z, reg.A - oper);
        reg.s.C = oper <= reg.A;
      },
    },
    {
      name: "cpx",
      code: 0xe0,
      mask: 0xe3,
      build: cpxy_oper,
      insn: function (oper) {
        status(N | Z, reg.X - oper);
        reg.s.C = oper <= reg.X;
      },
    },
    {
      name: "cpy",
      code: 0xc0,
      mask: 0xe3,
      build: cpxy_oper,
      insn: function (oper) {
        status(N | Z, reg.Y - oper);
        reg.s.C = oper <= reg.Y;
      },
    },
    {
      name: "dec",
      code: 0xc2,
      mask: 0xe3,
      build: inc_dec_oper,
      insn: function (oper) {
        mem8(oper, status(N | Z, mem8(oper) - 1));
      },
    },
    {
      name: "dex",
      code: 0xca,
      mask: 0xff,
      cycles: 2,
      insn: function (oper) {
        reg.X = status(N | Z, reg.X - 1);
      },
    },
    {
      name: "dey",
      code: 0x88,
      mask: 0xff,
      cycles: 2,
      insn: function (oper) {
        reg.Y = status(N | Z, reg.Y - 1);
      },
    },
    {
      name: "eor",
      code: 0x41,
      mask: 0xe3,
      build: accum_oper,
      insn: function (oper) {
        status(N | Z, (reg.A ^= oper));
      },
    },
    {
      name: "inc",
      code: 0xe2,
      mask: 0xe3,
      build: inc_dec_oper,
      insn: function (oper) {
        mem8(oper, status(N | Z, mem8(oper) + 1));
      },
    },
    {
      name: "inx",
      code: 0xe8,
      mask: 0xff,
      cycles: 2,
      insn: function (oper) {
        reg.X = status(N | Z, reg.X + 1);
      },
    },
    {
      name: "iny",
      code: 0xc8,
      mask: 0xff,
      cycles: 2,
      insn: function (oper) {
        reg.Y = status(N | Z, reg.Y + 1);
      },
    },
    {
      name: "jmp",
      code: 0x4c,
      mask: 0xdf,
      build: jmp_oper,
      insn: function (oper) {
        reg.PC = oper;
      },
    },
    {
      name: "jsr",
      code: 0x20,
      mask: 0xff,
      cycles: 6,
      oper: write_oper.absolute,
      insn: function (oper) {
        push16(reg.PC - 1);
        reg.PC = oper;
      },
    },
    {
      name: "lda",
      code: 0xa1,
      mask: 0xe3,
      build: accum_oper,
      insn: function (oper) {
        status(N | Z, (reg.A = oper));
      },
    },
    {
      name: "ldx",
      code: 0xa2,
      mask: 0xe3,
      build: ldx_oper,
      insn: function (oper) {
        status(N | Z, (reg.X = oper));
      },
    },
    {
      name: "ldy",
      code: 0xa0,
      mask: 0xe3,
      build: ldy_oper,
      insn: function (oper) {
        status(N | Z, (reg.Y = oper));
      },
    },
    {
      name: "lsr",
      code: 0x4a,
      mask: 0xff,
      cycles: 2,
      insn: function (oper) {
        var v = status(Z | N, reg.A >> 1);
        reg.s.C = reg.A & 1;
        reg.A = v;
      },
    },
    {
      name: "lsr",
      code: 0x42,
      mask: 0xe3,
      build: mem_write_oper,
      insn: function (oper) {
        var v = mem8(oper);
        mem8(oper, status(Z | N, v >> 1));
        reg.s.C = v & 1;
      },
    },
    {
      name: "nop",
      code: 0xea,
      mask: 0xff,
      cycles: 2,
      insn: function (oper) {},
    },
    {
      name: "ora",
      code: 0x01,
      mask: 0xe3,
      build: accum_oper,
      insn: function (oper) {
        status(N | Z, (reg.A |= oper));
      },
    },
    {
      name: "pha",
      code: 0x48,
      mask: 0xff,
      cycles: 3,
      insn: function (oper) {
        push8(reg.A);
      },
    },
    {
      name: "php",
      code: 0x08,
      mask: 0xff,
      cycles: 3,
      insn: function (oper) {
        php();
      },
    },
    {
      name: "pla",
      code: 0x68,
      mask: 0xff,
      cycles: 4,
      insn: function (oper) {
        status(N | Z, (reg.A = pop8()));
      },
    },
    {
      name: "plp",
      code: 0x28,
      mask: 0xff,
      cycles: 4,
      insn: function (oper) {
        plp();
      },
    },
    {
      name: "rol",
      code: 0x2a,
      mask: 0xff,
      cycles: 2,
      insn: function (oper) {
        reg.A = status(Z | N | C, (reg.A << 1) | (reg.s.C ? 1 : 0));
      },
    },
    {
      name: "rol",
      code: 0x22,
      mask: 0xe3,
      build: mem_write_oper,
      insn: function (oper) {
        var v = status(Z | N | C, (mem8(oper) << 1) | (reg.s.C ? 1 : 0));
        mem8(oper, v);
      },
    },
    {
      name: "ror",
      code: 0x6a,
      mask: 0xff,
      cycles: 2,
      insn: function (oper) {
        var v = status(Z | N, (reg.A >> 1) | (reg.s.C ? 0x80 : 0));
        reg.s.C = reg.A & 1;
        reg.A = v;
      },
    },
    {
      name: "ror",
      code: 0x62,
      mask: 0xe3,
      build: mem_write_oper,
      insn: function (oper) {
        var v = mem8(oper);
        mem8(oper, status(Z | N, (v >> 1) | (reg.s.C ? 0x80 : 0)));
        reg.s.C = v & 1;
      },
    },
    {
      name: "rti",
      code: 0x40,
      mask: 0xff,
      cycles: 6,
      insn: function (oper) {
        plp();
        reg.PC = pop16();
      },
    },
    {
      name: "rts",
      code: 0x60,
      mask: 0xff,
      cycles: 6,
      insn: function (oper) {
        reg.PC = pop16() + 1;
      },
    },
    {
      name: "sbc",
      code: 0xe1,
      mask: 0xe3,
      build: accum_oper,
      insn: function (oper) {
        if (!reg.s.D) {
          sbc_bin(oper);
        } /*BCD*/ else {
          sbc_bcd(oper);
        }
      },
    },
    {
      name: "sec",
      code: 0x38,
      mask: 0xff,
      cycles: 2,
      insn: function (oper) {
        reg.s.C = 1;
      },
    },
    {
      name: "sed",
      code: 0xf8,
      mask: 0xff,
      cycles: 2,
      insn: function (oper) {
        reg.s.D = 1;
      },
    },
    {
      name: "sei",
      code: 0x78,
      mask: 0xff,
      cycles: 2,
      insn: function (oper) {
        reg.s.I = 1;
      },
    },
    {
      name: "sta",
      code: 0x81,
      mask: 0xe3,
      build: sta_oper,
      insn: function (oper) {
        mem8(oper, reg.A);
      },
    },
    {
      name: "stx",
      code: 0x82,
      mask: 0xe3,
      build: stx_oper,
      insn: function (oper) {
        mem8(oper, reg.X);
      },
    },
    {
      name: "sty",
      code: 0x80,
      mask: 0xe3,
      build: sty_oper,
      insn: function (oper) {
        mem8(oper, reg.Y);
      },
    },
    {
      name: "tax",
      code: 0xaa,
      mask: 0xff,
      cycles: 2,
      insn: function (oper) {
        status(N | Z, (reg.X = reg.A));
      },
    },
    {
      name: "tay",
      code: 0xa8,
      mask: 0xff,
      cycles: 2,
      insn: function (oper) {
        status(N | Z, (reg.Y = reg.A));
      },
    },
    {
      name: "tsx",
      code: 0xba,
      mask: 0xff,
      cycles: 2,
      insn: function (oper) {
        status(N | Z, (reg.X = reg.SP));
      },
    },
    {
      name: "txa",
      code: 0x8a,
      mask: 0xff,
      cycles: 2,
      insn: function (oper) {
        status(N | Z, (reg.A = reg.X));
      },
    },
    {
      name: "txs",
      code: 0x9a,
      mask: 0xff,
      cycles: 2,
      insn: function (oper) {
        reg.SP = reg.X;
      },
    },
    {
      name: "tya",
      code: 0x98,
      mask: 0xff,
      cycles: 2,
      insn: function (oper) {
        status(N | Z, (reg.A = reg.Y));
      },
    },
  ];
  init.apply(undefined, arguments);
  return {
    run: run,
    reset: reset,
    reg: function () {
      return reg;
    },
    last_trace: function () {
      var t = trace_out;
      trace_out = "";
      return t == "" ? undefined : t;
    },
    set_trace: function (t) {
      _trace = t;
      trace_out = "";
    },
    stats: function () {
      var s = "";
      for (var i = 0; i < 256; i++) {
        if (!count[i]) continue;
        s += sprintf("%02x %s: %10d\n", i, opcode[i].name, count[i]);
      }
      return s;
    },
  };
}
