//  Copyright (c) 2011 David Caldwell,  All Rights Reserved.

function apple2_disk_controller_card(machine) {
  var disk_data;
  var write_protect = true;
  var last_phase;
  var half_track = 0;
  var motor_is_on = false;
  var engaged_drive = 0;
  var R = 0,
    W = 1;
  var mode = R;

  var rpm = 300;
  var sec__min = 60;
  var sectors__track = 16;
  var bytes__sector = 256;
  var clocks__track = (machine.clock_hz / rpm) * sec__min;
  var clocks__sector = Math.floor(clocks__track / sectors__track);
  var nibbles__sector = 40 + (3 + 2 * 4 + 3) + 5 + (3 + 0x156 + 1 + 3) + 14;
  var clocks__nibble = clocks__sector / nibbles__sector;

  var dump = function (name, data) {
    var s = "";
    s += sprintf("%s:\n", name);
    for (var i = 0; i < data.length; i += 16) {
      var chunk = Math.min(data.length, i + 16);
      s += sprintf("  ");
      for (var j = i; j < chunk; j++) s += sprintf("%02x ", data[j]);
      if (chunk % 16) s += sprintf("%*s", (16 - (chunk % 16)) * 3, "");
      for (var j = i; j < chunk; j++)
        s += sprintf(
          "%c",
          isgraph(data[j]) ? data[j] : data[j] == 32 ? " " : "."
        );
      s += sprintf("\n");
    }
    return s;
  };

  var even_odd_encode = function (data) {
    // Cheap way to ensure there are no zeros next to each other.
    return [(data >> 1) | 0xaa, data | 0xaa];
  };

  // Rules: must start with a high bit. Must not have more than 2 consecutive 0s. may contain only one set of consecutive 0s. Must contain a set of consecutive 1s (not including high bit).
  // perl -e 'for (0..256) { $b = sprintf("%08b", $_); printf "0x%02x, ", $_, $_ if $b !~ /000/ && $b =~ s/00/00/g <= 1 && $b =~ s/^1// == 1 && $b =~ /11/; }'
  var six_and_two = [
    0x96, 0x97, 0x9a, 0x9b, 0x9d, 0x9e, 0x9f, 0xa6, 0xa7, 0xab, 0xac, 0xad,
    0xae, 0xaf, 0xb2, 0xb3, 0xb4, 0xb5, 0xb6, 0xb7, 0xb9, 0xba, 0xbb, 0xbc,
    0xbd, 0xbe, 0xbf, 0xcb, 0xcd, 0xce, 0xcf, 0xd3, 0xd6, 0xd7, 0xd9, 0xda,
    0xdb, 0xdc, 0xdd, 0xde, 0xdf, 0xe5, 0xe6, 0xe7, 0xe9, 0xea, 0xeb, 0xec,
    0xed, 0xee, 0xef, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7, 0xf9, 0xfa, 0xfb,
    0xfc, 0xfd, 0xfe, 0xff,
  ];
  var six_and_two_encode = function (data) {
    var prenibblize = [];
    for (var d = 0; d < 256; d++) {
      // 76543210 -> __765432, 01
      var lower2 = ((data[d] << 1) & 2) | ((data[d] >> 1) & 1);
      prenibblize[d] = data[d] >> 2;
      if (d < 0x56 * 1) prenibblize[0x100 + 0x56 * 1 - 1 - d] = lower2;
      else if (d < 0x56 * 2)
        prenibblize[0x100 + 0x56 * 2 - 1 - d] |= lower2 << 2;
      else if (d < 0x56 * 3)
        prenibblize[0x100 + 0x56 * 3 - 1 - d] |= lower2 << 4;
    }
    if (trace) trace(dump("prenibblized sector", prenibblize));

    var disk = [];
    var xdisk = [];
    var previous = 0;
    for (var i = 0; i < 0x156; i++) {
      var current = prenibblize[i < 0x56 ? 0x156 - 1 - i : i - 0x56];
      disk[i] = six_and_two[current ^ previous];
      if (trace) xdisk[i] = current ^ previous;
      previous = current;
    }
    disk.push(six_and_two[previous]);
    if (trace) {
      xdisk.push(previous);
      trace(dump("xor sector", xdisk));
    }

    return disk;
  };

  var gap = [];
  for (var g = 0; g < 40; g++) gap[g] = 0xff;

  var address_field = function (volume, track, sector) {
    return [].concat(
      [0xd5, 0xaa, 0x96],
      even_odd_encode(volume),
      even_odd_encode(track),
      even_odd_encode(sector),
      even_odd_encode(volume ^ track ^ sector), // checksum
      [0xde, 0xaa, 0xeb]
    );
  };

  var data_field = function (data) {
    return [].concat(
      [0xd5, 0xaa, 0xad],
      six_and_two_encode(data), // includes checksum
      [0xde, 0xaa, 0xeb]
    );
  };

  var skew_logical_from_physical = [
    0, 7, 14, 6, 13, 5, 12, 4, 11, 3, 10, 2, 9, 1, 8, 15,
  ];

  var nibblize = function (track, sector) {
    var data_start =
      bytes__sector * sectors__track * track +
      bytes__sector * skew_logical_from_physical[sector];
    return [].concat(
      gap.slice(0, 40),
      address_field(0xfe, track, sector),
      gap.slice(0, 5),
      data_field(disk_data.slice(data_start, data_start + bytes__sector)),
      gap.slice(0, 14)
    );
  };

  var nibblized;
  var last_nibble;

  var read_data_latch = function (cycle) {
    if (!motor_is_on || engaged_drive != 0) return cycle & 0x3f; // Trick dos into thinking the disk is spinning so it doesn't delay all the time.

    cycle = cycle % clocks__track;

    var track = half_track >> 1;
    var sector = (cycle / clocks__sector) & 0xf;

    var nibbles;
    if (nibblized && nibblized.track == track && nibblized.sector == sector)
      nibbles = nibblized.data;
    else {
      if (trace)
        trace(
          sprintf(
            "Nibblizing track %d logical sector %d (physical: %d)\n",
            track,
            skew_logical_from_physical[sector],
            sector
          ) +
            dump(
              "original sector",
              disk_data.slice(
                bytes__sector * sectors__track * track +
                  bytes__sector * skew_logical_from_physical[sector],
                bytes__sector * sectors__track * track +
                  bytes__sector * (skew_logical_from_physical[sector] + 1)
              )
            )
        );

      nibbles = nibblize(track, sector);
      nibblized = { track: track, sector: sector, data: nibbles };

      if (trace) trace(dump("nibblized sector", nibbles));
    }

    var sector_clock_start = sector * clocks__sector;
    var sector_clock_offset = cycle % clocks__sector;

    var current_nibble =
      Math.floor(sector_clock_offset / clocks__nibble) % nibbles__sector;
    if (current_nibble == last_nibble) return 0x00;
    last_nibble = current_nibble;
    if (trace)
      trace(
        sprintf(
          "Reading track %d sector %d nibble %d: %02x\n",
          track,
          sector,
          current_nibble,
          nibbles[current_nibble]
        )
      );
    return nibbles[current_nibble] | 0x80;
  };

  var disk_io_reg = function (cycle, addr, data, trace_in) {
    trace = trace_in;
    if (addr < 8) {
      var current_phase = addr >> 1;
      if (trace)
        trace(
          sprintf(
            "Stepper %d %s  (last=%d, diff=%d)\n",
            addr >> 1,
            addr & 1 ? "on" : "off",
            last_phase,
            (current_phase - last_phase) & 3
          )
        );
      if (addr & 1) return; // Only care about Phase Off
      if (((current_phase - last_phase) & 3) == 1)
        if (half_track < 69)
          // positive
          half_track++; // ascending moves inward
        else {
          /* Make the noise! */
        }
      else if (((current_phase - last_phase) & 3) == 3)
        if (half_track > 0)
          // -1 == 0x3 in 2 bit signed :-)
          half_track--;
        else {
          /* Make the noise! */
        }
      last_phase = current_phase;
      return;
    }
    if (addr == 0x8) {
      motor_is_on = false;
      return;
    }
    if (addr == 0x9) {
      motor_is_on = true;
      return;
    }
    if (addr == 0xa) {
      engaged_drive = 0;
      return;
    }
    if (addr == 0xb) {
      engaged_drive = 1;
      return;
    }
    if (addr == 0xc) {
      if (!data) return read_data_latch(cycle);
    }
    if (addr == 0xe) {
      mode = R;
      return write_protect ? 0x80 : 0;
    }
    if (addr == 0xf) {
      mode = W;
      return 0;
    }
  };

  return {
    io: disk_io_reg,
    rom: apple_2_plus_disk_rom,
    insert_disk: function (disk_image) {
      disk_data = disk_image;
    },
  };
}
