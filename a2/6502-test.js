//  Copyright (c) 2011 David Caldwell,  All Rights Reserved.

function test_6502() {
  var vector = [
    {
      name: "adc imm",
      init: { A: 1, D: 0, C: 0 },
      op: [0x69, 0x02],
      test: { A: 3, SR: "nzcv" },
    },
    {
      name: "adc imm+C",
      init: { A: 1, D: 0, C: 1 },
      op: [0x69, 0x02],
      test: { A: 4, SR: "nzcv" },
    },
    {
      name: "adc imm:C",
      init: { A: 0xf0, D: 0, C: 0 },
      op: [0x69, 0x20],
      test: { A: 0x10, SR: "nzCv" },
    },
    {
      name: "adc imm+C:Z",
      init: { A: 0xf0, D: 0, C: 1 },
      op: [0x69, 0x0f],
      test: { A: 0x00, SR: "nZCv" },
    },
    {
      name: "adc imm:V",
      init: { A: 0x60, D: 0, C: 1 },
      op: [0x69, 0x40],
      test: { A: 0xa1, SR: "NzcV" },
    },
    {
      name: "adc imm:V.2",
      init: { A: 0x40, D: 0, C: 1 },
      op: [0x69, 0x60],
      test: { A: 0xa1, SR: "NzcV" },
    },
    {
      name: "adc imm:V.3",
      init: { A: 0xf0, D: 0, C: 0 },
      op: [0x69, 0x60],
      test: { A: 0x50, SR: "nzCv" },
    },
    {
      name: "adc imm:V.4",
      init: { A: 0x60, D: 0, C: 0 },
      op: [0x69, 0xf0],
      test: { A: 0x50, SR: "nzCv" },
    },

    {
      name: "adc imm+D",
      init: { A: 0x01, D: 1, C: 0 },
      op: [0x69, 0x02],
      test: { A: 0x03, SR: "zc" },
    }, // Does Dec mode set oVerflow or
    {
      name: "adc imm+D+10",
      init: { A: 0x04, D: 1, C: 0 },
      op: [0x69, 0x08],
      test: { A: 0x12, SR: "zc" },
    }, // Negative??
    {
      name: "adc imm+D",
      init: { A: 0x01, D: 1, C: 0 },
      op: [0x69, 0x0a],
      test: { A: 0x11, SR: "zc" },
    }, // My implementation does not.
    {
      name: "adc imm+D+C",
      init: { A: 0x01, D: 1, C: 1 },
      op: [0x69, 0x02],
      test: { A: 0x04, SR: "zc" },
    }, // The Apple 2 doesn't appear to
    {
      name: "adc imm+D:C",
      init: { A: 0x90, D: 1, C: 0 },
      op: [0x69, 0x20],
      test: { A: 0x10, SR: "zC" },
    }, // use Decimal mode anyway.
    {
      name: "adc imm+D+C:Z",
      init: { A: 0x90, D: 1, C: 1 },
      op: [0x69, 0x09],
      test: { A: 0x00, SR: "ZC" },
    },
    //{ name: "adc imm+D:V",       init: { A:0x60, D:1, C:1 }, op:[0x69, 0x40], test: { A:0x01, SR:"NzcV" } }, // Does Dec mode set oVerflow??

    {
      name: "adc zp",
      init: { A: 1, D: 0, C: 0, 0x50: [0x02] },
      op: [0x65, 0x50],
      test: { A: 3, SR: "nzcv" },
    },
    {
      name: "adc zp+C",
      init: { A: 1, D: 0, C: 1, 0x50: [0x02] },
      op: [0x65, 0x50],
      test: { A: 4, SR: "nzcv" },
    },
    {
      name: "adc zp:C",
      init: { A: 0xf0, D: 0, C: 0, 0x50: [0x20] },
      op: [0x65, 0x50],
      test: { A: 0x10, SR: "nzCv" },
    },
    {
      name: "adc zp+C:Z",
      init: { A: 0xf0, D: 0, C: 1, 0x50: [0x0f] },
      op: [0x65, 0x50],
      test: { A: 0x00, SR: "nZCv" },
    },
    {
      name: "adc zp:V",
      init: { A: 0x60, D: 0, C: 1, 0x50: [0x40] },
      op: [0x65, 0x50],
      test: { A: 0xa1, SR: "NzcV" },
    },

    {
      name: "adc zp,x",
      init: { A: 1, D: 0, C: 0, X: 0x01, 0x51: [0x02] },
      op: [0x75, 0x50],
      test: { A: 3, SR: "nzcv" },
    },
    {
      name: "adc zp,x+C",
      init: { A: 1, D: 0, C: 1, X: 0x80, 0x20: [0x02] },
      op: [0x75, 0xa0],
      test: { A: 4, SR: "nzcv" },
    },
    {
      name: "adc zp,x:C",
      init: { A: 0xf0, D: 0, C: 0, X: 0x00, 0x50: [0x20] },
      op: [0x75, 0x50],
      test: { A: 0x10, SR: "nzCv" },
    },
    {
      name: "adc zp,x+C:Z",
      init: { A: 0xf0, D: 0, C: 1, X: 0xff, 0x4f: [0x0f] },
      op: [0x75, 0x50],
      test: { A: 0x00, SR: "nZCv" },
    },
    {
      name: "adc zp,x:V",
      init: { A: 0x60, D: 0, C: 1, X: 0x10, 0x60: [0x40] },
      op: [0x75, 0x50],
      test: { A: 0xa1, SR: "NzcV" },
    },

    {
      name: "adc abs",
      init: { A: 1, D: 0, C: 0, 0x1234: [0x02] },
      op: [0x6d, 0x34, 0x12],
      test: { A: 3, SR: "nzcv" },
    },
    {
      name: "adc abs+C",
      init: { A: 1, D: 0, C: 1, 0x0050: [0x02] },
      op: [0x6d, 0x50, 0x00],
      test: { A: 4, SR: "nzcv" },
    },
    {
      name: "adc abs:C",
      init: { A: 0xf0, D: 0, C: 0, 0x55aa: [0x20] },
      op: [0x6d, 0xaa, 0x55],
      test: { A: 0x10, SR: "nzCv" },
    },
    {
      name: "adc abs+C:Z",
      init: { A: 0xf0, D: 0, C: 1, 0xaa55: [0x0f] },
      op: [0x6d, 0x55, 0xaa],
      test: { A: 0x00, SR: "nZCv" },
    },
    {
      name: "adc abs:V",
      init: { A: 0x60, D: 0, C: 1, 0x3254: [0x40] },
      op: [0x6d, 0x54, 0x32],
      test: { A: 0xa1, SR: "NzcV" },
    },

    {
      name: "adc abs,x",
      init: { A: 1, D: 0, C: 0, X: 0x01, 0x1235: [0x02] },
      op: [0x7d, 0x34, 0x12],
      test: { A: 3, SR: "nzcv" },
    },
    {
      name: "adc abs,x+C",
      init: { A: 1, D: 0, C: 1, X: 0x80, 0x0120: [0x02] },
      op: [0x7d, 0xa0, 0x00],
      test: { A: 4, SR: "nzcv" },
    },
    {
      name: "adc abs,x:C",
      init: { A: 0xf0, D: 0, C: 0, X: 0x00, 0x55aa: [0x20] },
      op: [0x7d, 0xaa, 0x55],
      test: { A: 0x10, SR: "nzCv" },
    },
    {
      name: "adc abs,x+C:Z",
      init: { A: 0xf0, D: 0, C: 1, X: 0xff, 0xab54: [0x0f] },
      op: [0x7d, 0x55, 0xaa],
      test: { A: 0x00, SR: "nZCv" },
    },
    {
      name: "adc abs,x:V",
      init: { A: 0x60, D: 0, C: 1, X: 0x10, 0x3264: [0x40] },
      op: [0x7d, 0x54, 0x32],
      test: { A: 0xa1, SR: "NzcV" },
    },

    {
      name: "adc abs,y",
      init: { A: 1, D: 0, C: 0, Y: 0x01, 0x1235: [0x02] },
      op: [0x79, 0x34, 0x12],
      test: { A: 3, SR: "nzcv" },
    },
    {
      name: "adc abs,y+C",
      init: { A: 1, D: 0, C: 1, Y: 0x80, 0x0120: [0x02] },
      op: [0x79, 0xa0, 0x00],
      test: { A: 4, SR: "nzcv" },
    },
    {
      name: "adc abs,y:C",
      init: { A: 0xf0, D: 0, C: 0, Y: 0x00, 0x55aa: [0x20] },
      op: [0x79, 0xaa, 0x55],
      test: { A: 0x10, SR: "nzCv" },
    },
    {
      name: "adc abs,y+C:Z",
      init: { A: 0xf0, D: 0, C: 1, Y: 0xff, 0xab54: [0x0f] },
      op: [0x79, 0x55, 0xaa],
      test: { A: 0x00, SR: "nZCv" },
    },
    {
      name: "adc abs,y:V",
      init: { A: 0x60, D: 0, C: 1, Y: 0x10, 0x3264: [0x40] },
      op: [0x79, 0x54, 0x32],
      test: { A: 0xa1, SR: "NzcV" },
    },

    {
      name: "adc (ind,x)",
      init: { A: 1, D: 0, C: 0, X: 0x01, 0x35: [0x12, 0x10], 0x1012: [0x02] },
      op: [0x61, 0x34],
      test: { A: 3, SR: "nzcv" },
    },
    {
      name: "adc (ind,x)+C",
      init: { A: 1, D: 0, C: 1, X: 0x80, 0x20: [0x34, 0x20], 0x2034: [0x02] },
      op: [0x61, 0xa0],
      test: { A: 4, SR: "nzcv" },
    },
    {
      name: "adc (ind,x):C",
      init: {
        A: 0xf0,
        D: 0,
        C: 0,
        X: 0x00,
        0xaa: [0x56, 0x30],
        0x3056: [0x20],
      },
      op: [0x61, 0xaa],
      test: { A: 0x10, SR: "nzCv" },
    },
    {
      name: "adc (ind,x)+C:Z",
      init: {
        A: 0xf0,
        D: 0,
        C: 1,
        X: 0xff,
        0x54: [0x78, 0x40],
        0x4078: [0x0f],
      },
      op: [0x61, 0x55],
      test: { A: 0x00, SR: "nZCv" },
    },
    {
      name: "adc (ind,x):V",
      init: {
        A: 0x60,
        D: 0,
        C: 1,
        X: 0x10,
        0x64: [0x9a, 0x50],
        0x509a: [0x40],
      },
      op: [0x61, 0x54],
      test: { A: 0xa1, SR: "NzcV" },
    },

    {
      name: "adc (ind),y",
      init: { A: 1, D: 0, C: 0, Y: 0x01, 0x34: [0x12, 0x10], 0x1013: [0x02] },
      op: [0x71, 0x34],
      test: { A: 3, SR: "nzcv" },
    },
    {
      name: "adc (ind),y+C",
      init: { A: 1, D: 0, C: 1, Y: 0x80, 0x50: [0x34, 0x20], 0x20b4: [0x02] },
      op: [0x71, 0x50],
      test: { A: 4, SR: "nzcv" },
    },
    {
      name: "adc (ind),y:C",
      init: {
        A: 0xf0,
        D: 0,
        C: 0,
        Y: 0x00,
        0xaa: [0x56, 0x30],
        0x3056: [0x20],
      },
      op: [0x71, 0xaa],
      test: { A: 0x10, SR: "nzCv" },
    },
    {
      name: "adc (ind),y+C:Z",
      init: {
        A: 0xf0,
        D: 0,
        C: 1,
        Y: 0xff,
        0x55: [0x78, 0x40],
        0x4177: [0x0f],
      },
      op: [0x71, 0x55],
      test: { A: 0x00, SR: "nZCv" },
    },
    {
      name: "adc (ind),y:V",
      init: {
        A: 0x60,
        D: 0,
        C: 1,
        Y: 0x10,
        0x54: [0x9a, 0x50],
        0x50aa: [0x40],
      },
      op: [0x71, 0x54],
      test: { A: 0xa1, SR: "NzcV" },
    },

    {
      name: "and imm",
      init: { A: 0xf0 },
      op: [0x29, 0x42],
      test: { A: 0x40, SR: "nz" },
    },
    {
      name: "and imm+C",
      init: { A: 0x0f },
      op: [0x29, 0x5a],
      test: { A: 0x0a, SR: "nz" },
    },
    {
      name: "and imm:Z",
      init: { A: 0xf0 },
      op: [0x29, 0x0f],
      test: { A: 0x00, SR: "nZ" },
    },
    {
      name: "and imm:N",
      init: { A: 0xdd },
      op: [0x29, 0xc0],
      test: { A: 0xc0, SR: "Nz" },
    },

    {
      name: "and zp",
      init: { A: 0xf0, 0x50: [0x42] },
      op: [0x25, 0x50],
      test: { A: 0x40, SR: "nz" },
    },
    {
      name: "and zp+C",
      init: { A: 0x0f, 0x50: [0x5a], C: 1 },
      op: [0x25, 0x50],
      test: { A: 0x0a, SR: "nz" },
    },
    {
      name: "and zp.2",
      init: { A: 0xf0, 0x50: [0x20] },
      op: [0x25, 0x50],
      test: { A: 0x20, SR: "nz" },
    },
    {
      name: "and zp:Z",
      init: { A: 0xf0, 0x50: [0x0f] },
      op: [0x25, 0x50],
      test: { A: 0x00, SR: "nZ" },
    },
    {
      name: "and zp:N",
      init: { A: 0xdd, 0x50: [0xc0] },
      op: [0x25, 0x50],
      test: { A: 0xc0, SR: "Nz" },
    },

    {
      name: "and zp,x",
      init: { A: 0xf0, X: 0x01, 0x51: [0x42] },
      op: [0x35, 0x50],
      test: { A: 0x40, SR: "nz" },
    },
    {
      name: "and zp,x+C",
      init: { A: 0x0f, X: 0x80, 0x20: [0x5a], C: 1 },
      op: [0x35, 0xa0],
      test: { A: 0x0a, SR: "nz" },
    },
    {
      name: "and zp,x.2",
      init: { A: 0xf0, X: 0x00, 0x50: [0x20] },
      op: [0x35, 0x50],
      test: { A: 0x20, SR: "nz" },
    },
    {
      name: "and zp,x:Z",
      init: { A: 0xf0, X: 0xff, 0x4f: [0x0f] },
      op: [0x35, 0x50],
      test: { A: 0x00, SR: "nZ" },
    },
    {
      name: "and zp,x:N",
      init: { A: 0xdd, X: 0x10, 0x60: [0xc0] },
      op: [0x35, 0x50],
      test: { A: 0xc0, SR: "Nz" },
    },

    {
      name: "and abs",
      init: { A: 0xf0, 0x1234: [0x42] },
      op: [0x2d, 0x34, 0x12],
      test: { A: 0x40, SR: "nz" },
    },
    {
      name: "and abs+C",
      init: { A: 0x0f, 0x0050: [0x5a], C: 1 },
      op: [0x2d, 0x50, 0x00],
      test: { A: 0x0a, SR: "nz" },
    },
    {
      name: "and abs.2",
      init: { A: 0xf0, 0x55aa: [0x20] },
      op: [0x2d, 0xaa, 0x55],
      test: { A: 0x20, SR: "nz" },
    },
    {
      name: "and abs:Z",
      init: { A: 0xf0, 0xaa55: [0x0f] },
      op: [0x2d, 0x55, 0xaa],
      test: { A: 0x00, SR: "nZ" },
    },
    {
      name: "and abs:N",
      init: { A: 0xdd, 0x3254: [0xc0] },
      op: [0x2d, 0x54, 0x32],
      test: { A: 0xc0, SR: "Nz" },
    },

    {
      name: "and abs,x",
      init: { A: 0xf0, X: 0x01, 0x1235: [0x42] },
      op: [0x3d, 0x34, 0x12],
      test: { A: 0x40, SR: "nz" },
    },
    {
      name: "and abs,x+C",
      init: { A: 0x0f, X: 0x80, 0x0120: [0x5a], C: 1 },
      op: [0x3d, 0xa0, 0x00],
      test: { A: 0x0a, SR: "nz" },
    },
    {
      name: "and abs,x.2",
      init: { A: 0xf0, X: 0x00, 0x55aa: [0x20] },
      op: [0x3d, 0xaa, 0x55],
      test: { A: 0x20, SR: "nz" },
    },
    {
      name: "and abs,x:Z",
      init: { A: 0xf0, X: 0xff, 0xab54: [0x0f] },
      op: [0x3d, 0x55, 0xaa],
      test: { A: 0x00, SR: "nZ" },
    },
    {
      name: "and abs,x:N",
      init: { A: 0xdd, X: 0x10, 0x3264: [0xc0] },
      op: [0x3d, 0x54, 0x32],
      test: { A: 0xc0, SR: "Nz" },
    },

    {
      name: "and abs,y",
      init: { A: 0xf0, Y: 0x01, 0x1235: [0x42] },
      op: [0x39, 0x34, 0x12],
      test: { A: 0x40, SR: "nz" },
    },
    {
      name: "and abs,y+C",
      init: { A: 0x0f, Y: 0x80, 0x0120: [0x5a], C: 1 },
      op: [0x39, 0xa0, 0x00],
      test: { A: 0x0a, SR: "nz" },
    },
    {
      name: "and abs,y.2",
      init: { A: 0xf0, Y: 0x00, 0x55aa: [0x20] },
      op: [0x39, 0xaa, 0x55],
      test: { A: 0x20, SR: "nz" },
    },
    {
      name: "and abs,y:Z",
      init: { A: 0xf0, Y: 0xff, 0xab54: [0x0f] },
      op: [0x39, 0x55, 0xaa],
      test: { A: 0x00, SR: "nZ" },
    },
    {
      name: "and abs,y:N",
      init: { A: 0xdd, Y: 0x10, 0x3264: [0xc0] },
      op: [0x39, 0x54, 0x32],
      test: { A: 0xc0, SR: "Nz" },
    },

    {
      name: "and (ind,x)",
      init: { A: 0xf0, X: 0x01, 0x35: [0x12, 0x10], 0x1012: [0x42] },
      op: [0x21, 0x34],
      test: { A: 0x40, SR: "nz" },
    },
    {
      name: "and (ind,x)+C",
      init: { A: 0x0f, X: 0x80, 0x20: [0x34, 0x20], 0x2034: [0x5a], C: 1 },
      op: [0x21, 0xa0],
      test: { A: 0x0a, SR: "nz" },
    },
    {
      name: "and (ind,x).2",
      init: { A: 0xf0, X: 0x00, 0xaa: [0x56, 0x30], 0x3056: [0x20] },
      op: [0x21, 0xaa],
      test: { A: 0x20, SR: "nz" },
    },
    {
      name: "and (ind,x):Z",
      init: { A: 0xf0, X: 0xff, 0x54: [0x78, 0x40], 0x4078: [0x0f] },
      op: [0x21, 0x55],
      test: { A: 0x00, SR: "nZ" },
    },
    {
      name: "and (ind,x):N",
      init: { A: 0xdd, X: 0x10, 0x64: [0x9a, 0x50], 0x509a: [0xc0] },
      op: [0x21, 0x54],
      test: { A: 0xc0, SR: "Nz" },
    },

    {
      name: "and (ind),y",
      init: { A: 0xf0, Y: 0x01, 0x34: [0x12, 0x10], 0x1013: [0x42] },
      op: [0x31, 0x34],
      test: { A: 0x40, SR: "nz" },
    },
    {
      name: "and (ind),y+C",
      init: { A: 0x0f, Y: 0x80, 0x50: [0x34, 0x20], 0x20b4: [0x5a], C: 1 },
      op: [0x31, 0x50],
      test: { A: 0x0a, SR: "nz" },
    },
    {
      name: "and (ind),y.2",
      init: { A: 0xf0, Y: 0x00, 0xaa: [0x56, 0x30], 0x3056: [0x20] },
      op: [0x31, 0xaa],
      test: { A: 0x20, SR: "nz" },
    },
    {
      name: "and (ind),y:Z",
      init: { A: 0xf0, Y: 0xff, 0x55: [0x78, 0x40], 0x4177: [0x0f] },
      op: [0x31, 0x55],
      test: { A: 0x00, SR: "nZ" },
    },
    {
      name: "and (ind),y:N",
      init: { A: 0xdd, Y: 0x10, 0x54: [0x9a, 0x50], 0x50aa: [0xc0] },
      op: [0x31, 0x54],
      test: { A: 0xc0, SR: "Nz" },
    },

    {
      name: "asl imm",
      init: { A: 0x05, C: 0 },
      op: [0x0a],
      test: { A: 0x0a, SR: "nzc" },
    },
    {
      name: "asl imm:N",
      init: { A: 0x55, C: 0 },
      op: [0x0a],
      test: { A: 0xaa, SR: "Nzc" },
    },
    {
      name: "asl imm:Z",
      init: { A: 0x00, C: 0 },
      op: [0x0a],
      test: { A: 0x00, SR: "nZc" },
    },
    {
      name: "asl imm:C",
      init: { A: 0xaa, C: 0 },
      op: [0x0a],
      test: { A: 0x54, SR: "nzC" },
    },
    {
      name: "asl imm+C",
      init: { A: 0x00, C: 1 },
      op: [0x0a],
      test: { A: 0x00, SR: "nZc" },
    },
    {
      name: "asl imm+C:C",
      init: { A: 0x80, C: 1 },
      op: [0x0a],
      test: { A: 0x00, SR: "nZC" },
    },

    {
      name: "asl zp",
      init: { 0x12: [0x05], C: 0 },
      op: [0x06, 0x12],
      test: { 0x12: [0x0a], SR: "nzc" },
    },
    {
      name: "asl zp:N",
      init: { 0x34: [0x55], C: 0 },
      op: [0x06, 0x34],
      test: { 0x34: [0xaa], SR: "Nzc" },
    },
    {
      name: "asl zp:Z",
      init: { 0x56: [0x00], C: 0 },
      op: [0x06, 0x56],
      test: { 0x56: [0x00], SR: "nZc" },
    },
    {
      name: "asl zp:C",
      init: { 0x78: [0xaa], C: 0 },
      op: [0x06, 0x78],
      test: { 0x78: [0x54], SR: "nzC" },
    },
    {
      name: "asl zp+C",
      init: { 0xab: [0x00], C: 1 },
      op: [0x06, 0xab],
      test: { 0xab: [0x00], SR: "nZc" },
    },
    {
      name: "asl imm+C:C",
      init: { 0xcd: [0x80], C: 1 },
      op: [0x06, 0xcd],
      test: { 0xcd: [0x00], SR: "nZC" },
    },

    {
      name: "asl zp,x",
      init: { X: 0xfd, 0x0f: [0x05], C: 0 },
      op: [0x16, 0x12],
      test: { 0x0f: [0x0a], SR: "nzc" },
    },
    {
      name: "asl zp,x:N",
      init: { X: 0xec, 0x20: [0x55], C: 0 },
      op: [0x16, 0x34],
      test: { 0x20: [0xaa], SR: "Nzc" },
    },
    {
      name: "asl zp,x:Z",
      init: { X: 0xba, 0x10: [0x00], C: 0 },
      op: [0x16, 0x56],
      test: { 0x10: [0x00], SR: "nZc" },
    },
    {
      name: "asl zp,x:C",
      init: { X: 0x54, 0xcc: [0xaa], C: 0 },
      op: [0x16, 0x78],
      test: { 0xcc: [0x54], SR: "nzC" },
    },
    {
      name: "asl zp,x+C",
      init: { X: 0x21, 0xcc: [0x00], C: 1 },
      op: [0x16, 0xab],
      test: { 0xcc: [0x00], SR: "nZc" },
    },
    {
      name: "asl imm+C:C",
      init: { X: 0x01, 0xdf: [0x80], C: 1 },
      op: [0x16, 0xde],
      test: { 0xdf: [0x00], SR: "nZC" },
    },

    {
      name: "asl zp",
      init: { 0x0112: [0x05], C: 0 },
      op: [0x0e, 0x12, 0x01],
      test: { 0x0112: [0x0a], SR: "nzc" },
    },
    {
      name: "asl zp:N",
      init: { 0x9234: [0x55], C: 0 },
      op: [0x0e, 0x34, 0x92],
      test: { 0x9234: [0xaa], SR: "Nzc" },
    },
    {
      name: "asl zp:Z",
      init: { 0x8356: [0x00], C: 0 },
      op: [0x0e, 0x56, 0x83],
      test: { 0x8356: [0x00], SR: "nZc" },
    },
    {
      name: "asl zp:C",
      init: { 0x7478: [0xaa], C: 0 },
      op: [0x0e, 0x78, 0x74],
      test: { 0x7478: [0x54], SR: "nzC" },
    },
    {
      name: "asl zp+C",
      init: { 0x65ab: [0x00], C: 1 },
      op: [0x0e, 0xab, 0x65],
      test: { 0x65ab: [0x00], SR: "nZc" },
    },
    {
      name: "asl imm+C:C",
      init: { 0x56cd: [0x80], C: 1 },
      op: [0x0e, 0xcd, 0x56],
      test: { 0x56cd: [0x00], SR: "nZC" },
    },

    {
      name: "asl zp,x",
      init: { X: 0xfd, 0x020f: [0x05], C: 0 },
      op: [0x1e, 0x12, 0x01],
      test: { 0x020f: [0x0a], SR: "nzc" },
    },
    {
      name: "asl zp,x:N",
      init: { X: 0xec, 0x9320: [0x55], C: 0 },
      op: [0x1e, 0x34, 0x92],
      test: { 0x9320: [0xaa], SR: "Nzc" },
    },
    {
      name: "asl zp,x:Z",
      init: { X: 0xba, 0x8410: [0x00], C: 0 },
      op: [0x1e, 0x56, 0x83],
      test: { 0x8410: [0x00], SR: "nZc" },
    },
    {
      name: "asl zp,x:C",
      init: { X: 0x54, 0x74cc: [0xaa], C: 0 },
      op: [0x1e, 0x78, 0x74],
      test: { 0x74cc: [0x54], SR: "nzC" },
    },
    {
      name: "asl zp,x+C",
      init: { X: 0x21, 0x65cc: [0x00], C: 1 },
      op: [0x1e, 0xab, 0x65],
      test: { 0x65cc: [0x00], SR: "nZc" },
    },
    {
      name: "asl imm+C:C",
      init: { X: 0x01, 0x56df: [0x80], C: 1 },
      op: [0x1e, 0xde, 0x56],
      test: { 0x56df: [0x00], SR: "nZC" },
    },

    {
      name: "bcc++C",
      init: { PC: 0x1000, C: 1 },
      op: [0x90, 0x10],
      test: { PC: 0x1002 },
    },
    {
      name: "bcc-+C",
      init: { PC: 0x1000, C: 1 },
      op: [0x90, 0xf0],
      test: { PC: 0x1002 },
    },
    {
      name: "bcc+",
      init: { PC: 0x1000, C: 0 },
      op: [0x90, 0x10],
      test: { PC: 0x1012 },
    },
    {
      name: "bcc-",
      init: { PC: 0x1000, C: 0 },
      op: [0x90, 0xf0],
      test: { PC: 0x0ff2 },
    },

    {
      name: "bcs++C",
      init: { PC: 0x1000, C: 1 },
      op: [0xb0, 0x10],
      test: { PC: 0x1012 },
    },
    {
      name: "bcs-+C",
      init: { PC: 0x1000, C: 1 },
      op: [0xb0, 0xf0],
      test: { PC: 0x0ff2 },
    },
    {
      name: "bcs+",
      init: { PC: 0x1000, C: 0 },
      op: [0xb0, 0x10],
      test: { PC: 0x1002 },
    },
    {
      name: "bcs-",
      init: { PC: 0x1000, C: 0 },
      op: [0xb0, 0xf0],
      test: { PC: 0x1002 },
    },

    {
      name: "beq++Z",
      init: { PC: 0x1000, Z: 1 },
      op: [0xf0, 0x10],
      test: { PC: 0x1012 },
    },
    {
      name: "beq-+Z",
      init: { PC: 0x1000, Z: 1 },
      op: [0xf0, 0xf0],
      test: { PC: 0x0ff2 },
    },
    {
      name: "beq+",
      init: { PC: 0x1000, Z: 0 },
      op: [0xf0, 0x10],
      test: { PC: 0x1002 },
    },
    {
      name: "beq-",
      init: { PC: 0x1000, Z: 0 },
      op: [0xf0, 0xf0],
      test: { PC: 0x1002 },
    },

    {
      name: "bne++C",
      init: { PC: 0x1000, Z: 1 },
      op: [0xd0, 0x10],
      test: { PC: 0x1002 },
    },
    {
      name: "bne-+C",
      init: { PC: 0x1000, Z: 1 },
      op: [0xd0, 0xf0],
      test: { PC: 0x1002 },
    },
    {
      name: "bne+",
      init: { PC: 0x1000, Z: 0 },
      op: [0xd0, 0x10],
      test: { PC: 0x1012 },
    },
    {
      name: "bne-",
      init: { PC: 0x1000, Z: 0 },
      op: [0xd0, 0xf0],
      test: { PC: 0x0ff2 },
    },

    {
      name: "bmi++C",
      init: { PC: 0x1000, N: 1 },
      op: [0x30, 0x10],
      test: { PC: 0x1012 },
    },
    {
      name: "bmi-+C",
      init: { PC: 0x1000, N: 1 },
      op: [0x30, 0xf0],
      test: { PC: 0x0ff2 },
    },
    {
      name: "bmi+",
      init: { PC: 0x1000, N: 0 },
      op: [0x30, 0x10],
      test: { PC: 0x1002 },
    },
    {
      name: "bmi-",
      init: { PC: 0x1000, N: 0 },
      op: [0x30, 0xf0],
      test: { PC: 0x1002 },
    },

    {
      name: "bpl++C",
      init: { PC: 0x1000, N: 1 },
      op: [0x10, 0x10],
      test: { PC: 0x1002 },
    },
    {
      name: "bpl-+C",
      init: { PC: 0x1000, N: 1 },
      op: [0x10, 0xf0],
      test: { PC: 0x1002 },
    },
    {
      name: "bpl+",
      init: { PC: 0x1000, N: 0 },
      op: [0x10, 0x10],
      test: { PC: 0x1012 },
    },
    {
      name: "bpl-",
      init: { PC: 0x1000, N: 0 },
      op: [0x10, 0xf0],
      test: { PC: 0x0ff2 },
    },

    {
      name: "bit zp",
      init: { A: 0x0f, 0x24: [0x17] },
      op: [0x24, 0x24],
      test: { A: 0x0f, 0x24: [0x17], SR: "nvz" },
    },
    {
      name: "bit zp:N",
      init: { A: 0x20, 0x35: [0xaa] },
      op: [0x24, 0x35],
      test: { A: 0x20, 0x35: [0xaa], SR: "Nvz" },
    },
    {
      name: "bit zp:V",
      init: { A: 0x0f, 0x46: [0x55] },
      op: [0x24, 0x46],
      test: { A: 0x0f, 0x46: [0x55], SR: "nVz" },
    },
    {
      name: "bit zp:NV",
      init: { A: 0x77, 0x57: [0xcc] },
      op: [0x24, 0x57],
      test: { A: 0x77, 0x57: [0xcc], SR: "NVz" },
    },
    {
      name: "bit zp:Z",
      init: { A: 0xc0, 0xab: [0x17] },
      op: [0x24, 0xab],
      test: { A: 0xc0, 0xab: [0x17], SR: "nvZ" },
    },
    {
      name: "bit zp:ZN",
      init: { A: 0x55, 0x35: [0xaa] },
      op: [0x24, 0x35],
      test: { A: 0x55, 0x35: [0xaa], SR: "NvZ" },
    },
    {
      name: "bit zp:ZV",
      init: { A: 0xaa, 0x46: [0x55] },
      op: [0x24, 0x46],
      test: { A: 0xaa, 0x46: [0x55], SR: "nVZ" },
    },
    {
      name: "bit zp:ZNV",
      init: { A: 0x11, 0x57: [0xcc] },
      op: [0x24, 0x57],
      test: { A: 0x11, 0x57: [0xcc], SR: "NVZ" },
    },

    {
      name: "bit abs",
      init: { A: 0x0f, 0xab24: [0x17] },
      op: [0x2c, 0x24, 0xab],
      test: { A: 0x0f, 0xab24: [0x17], SR: "nvz" },
    },
    {
      name: "bit abs:N",
      init: { A: 0x20, 0xcd35: [0xaa] },
      op: [0x2c, 0x35, 0xcd],
      test: { A: 0x20, 0xcd35: [0xaa], SR: "Nvz" },
    },
    {
      name: "bit abs:V",
      init: { A: 0x0f, 0xef46: [0x55] },
      op: [0x2c, 0x46, 0xef],
      test: { A: 0x0f, 0xef46: [0x55], SR: "nVz" },
    },
    {
      name: "bit abs:NV",
      init: { A: 0x77, 0x0157: [0xcc] },
      op: [0x2c, 0x57, 0x01],
      test: { A: 0x77, 0x0157: [0xcc], SR: "NVz" },
    },
    {
      name: "bit abs:Z",
      init: { A: 0xc0, 0xab24: [0x17] },
      op: [0x2c, 0x24, 0xab],
      test: { A: 0xc0, 0xab24: [0x17], SR: "nvZ" },
    },
    {
      name: "bit abs:ZN",
      init: { A: 0x55, 0xcd35: [0xaa] },
      op: [0x2c, 0x35, 0xcd],
      test: { A: 0x55, 0xcd35: [0xaa], SR: "NvZ" },
    },
    {
      name: "bit abs:ZV",
      init: { A: 0xaa, 0xef46: [0x55] },
      op: [0x2c, 0x46, 0xef],
      test: { A: 0xaa, 0xef46: [0x55], SR: "nVZ" },
    },
    {
      name: "bit abs:ZNV",
      init: { A: 0x11, 0x0157: [0xcc] },
      op: [0x2c, 0x57, 0x01],
      test: { A: 0x11, 0x0157: [0xcc], SR: "NVZ" },
    },

    // Skipping BRK test for now.

    {
      name: "bvc++C",
      init: { PC: 0x1000, V: 1 },
      op: [0x50, 0x10],
      test: { PC: 0x1002 },
    },
    {
      name: "bvc-+C",
      init: { PC: 0x1000, V: 1 },
      op: [0x50, 0xf0],
      test: { PC: 0x1002 },
    },
    {
      name: "bvc+",
      init: { PC: 0x1000, V: 0 },
      op: [0x50, 0x10],
      test: { PC: 0x1012 },
    },
    {
      name: "bvc-",
      init: { PC: 0x1000, V: 0 },
      op: [0x50, 0xf0],
      test: { PC: 0x0ff2 },
    },

    {
      name: "bvs++C",
      init: { PC: 0x1000, V: 1 },
      op: [0x70, 0x10],
      test: { PC: 0x1012 },
    },
    {
      name: "bvs-+C",
      init: { PC: 0x1000, V: 1 },
      op: [0x70, 0xf0],
      test: { PC: 0x0ff2 },
    },
    {
      name: "bvs+",
      init: { PC: 0x1000, V: 0 },
      op: [0x70, 0x10],
      test: { PC: 0x1002 },
    },
    {
      name: "bvs-",
      init: { PC: 0x1000, V: 0 },
      op: [0x70, 0xf0],
      test: { PC: 0x1002 },
    },

    { name: "clc", init: { C: 0 }, op: [0x18], test: { SR: "c" } },
    { name: "clc+C", init: { C: 1 }, op: [0x18], test: { SR: "c" } },

    { name: "cld", init: { D: 0 }, op: [0xd8], test: { SR: "d" } },
    { name: "cld+D", init: { D: 1 }, op: [0xd8], test: { SR: "d" } },

    { name: "cli", init: { I: 0 }, op: [0x58], test: { SR: "i" } },
    { name: "cli+I", init: { I: 1 }, op: [0x58], test: { SR: "i" } },

    { name: "clv", init: { V: 0 }, op: [0xb8], test: { SR: "v" } },
    { name: "clv+V", init: { V: 1 }, op: [0xb8], test: { SR: "v" } },

    {
      name: "cmp imm<",
      init: { A: 0x44 },
      op: [0xc9, 0xff],
      test: { A: 0x44, SR: "nzc" },
    },
    {
      name: "cmp imm>",
      init: { A: 0x79 },
      op: [0xc9, 0x3f],
      test: { A: 0x79, SR: "nzC" },
    },
    {
      name: "cmp imm=",
      init: { A: 0x55 },
      op: [0xc9, 0x55],
      test: { A: 0x55, SR: "nZC" },
    },
    {
      name: "cmp imm<:N",
      init: { A: 0x44 },
      op: [0xc9, 0x50],
      test: { A: 0x44, SR: "Nzc" },
    },
    {
      name: "cmp imm>:N",
      init: { A: 0xee },
      op: [0xc9, 0x33],
      test: { A: 0xee, SR: "NzC" },
    },

    {
      name: "cmp zp<",
      init: { A: 0x44, 0x50: [0xff] },
      op: [0xc5, 0x50],
      test: { A: 0x44, SR: "nzc" },
    },
    {
      name: "cmp zp>",
      init: { A: 0x79, 0x50: [0x3f] },
      op: [0xc5, 0x50],
      test: { A: 0x79, SR: "nzC" },
    },
    {
      name: "cmp zp=",
      init: { A: 0x55, 0x50: [0x55] },
      op: [0xc5, 0x50],
      test: { A: 0x55, SR: "nZC" },
    },
    {
      name: "cmp zp<:N",
      init: { A: 0x44, 0x50: [0x50] },
      op: [0xc5, 0x50],
      test: { A: 0x44, SR: "Nzc" },
    },
    {
      name: "cmp zp>:N",
      init: { A: 0xee, 0x50: [0x33] },
      op: [0xc5, 0x50],
      test: { A: 0xee, SR: "NzC" },
    },

    {
      name: "cmp zp<",
      init: { A: 0x44, X: 0x01, 0x51: [0xff] },
      op: [0xd5, 0x50],
      test: { A: 0x44, SR: "nzc" },
    },
    {
      name: "cmp zp>",
      init: { A: 0x79, X: 0x80, 0x20: [0x3f] },
      op: [0xd5, 0xa0],
      test: { A: 0x79, SR: "nzC" },
    },
    {
      name: "cmp zp=",
      init: { A: 0x55, X: 0x00, 0x50: [0x55] },
      op: [0xd5, 0x50],
      test: { A: 0x55, SR: "nZC" },
    },
    {
      name: "cmp zp<:N",
      init: { A: 0x44, X: 0xff, 0x4f: [0x50] },
      op: [0xd5, 0x50],
      test: { A: 0x44, SR: "Nzc" },
    },
    {
      name: "cmp zp>:N",
      init: { A: 0xee, X: 0x10, 0x60: [0x33] },
      op: [0xd5, 0x50],
      test: { A: 0xee, SR: "NzC" },
    },

    {
      name: "cmp abs<",
      init: { A: 0x44, 0x1234: [0xff] },
      op: [0xcd, 0x34, 0x12],
      test: { A: 0x44, SR: "nzc" },
    },
    {
      name: "cmp abs>",
      init: { A: 0x79, 0x0050: [0x3f] },
      op: [0xcd, 0x50, 0x00],
      test: { A: 0x79, SR: "nzC" },
    },
    {
      name: "cmp abs=",
      init: { A: 0x55, 0x55aa: [0x55] },
      op: [0xcd, 0xaa, 0x55],
      test: { A: 0x55, SR: "nZC" },
    },
    {
      name: "cmp abs<:N",
      init: { A: 0x44, 0xaa55: [0x50] },
      op: [0xcd, 0x55, 0xaa],
      test: { A: 0x44, SR: "Nzc" },
    },
    {
      name: "cmp abs>:N",
      init: { A: 0xee, 0x3254: [0x33] },
      op: [0xcd, 0x54, 0x32],
      test: { A: 0xee, SR: "NzC" },
    },

    {
      name: "cmp abs<",
      init: { A: 0x44, X: 0x01, 0x1235: [0xff] },
      op: [0xdd, 0x34, 0x12],
      test: { A: 0x44, SR: "nzc" },
    },
    {
      name: "cmp abs>",
      init: { A: 0x79, X: 0x80, 0x0120: [0x3f] },
      op: [0xdd, 0xa0, 0x00],
      test: { A: 0x79, SR: "nzC" },
    },
    {
      name: "cmp abs=",
      init: { A: 0x55, X: 0x00, 0x55aa: [0x55] },
      op: [0xdd, 0xaa, 0x55],
      test: { A: 0x55, SR: "nZC" },
    },
    {
      name: "cmp abs<:N",
      init: { A: 0x44, X: 0xff, 0xab54: [0x50] },
      op: [0xdd, 0x55, 0xaa],
      test: { A: 0x44, SR: "Nzc" },
    },
    {
      name: "cmp abs>:N",
      init: { A: 0xee, X: 0x10, 0x3264: [0x33] },
      op: [0xdd, 0x54, 0x32],
      test: { A: 0xee, SR: "NzC" },
    },

    {
      name: "cmp abs<",
      init: { A: 0x44, Y: 0x01, 0x1235: [0xff] },
      op: [0xd9, 0x34, 0x12],
      test: { A: 0x44, SR: "nzc" },
    },
    {
      name: "cmp abs>",
      init: { A: 0x79, Y: 0x80, 0x0120: [0x3f] },
      op: [0xd9, 0xa0, 0x00],
      test: { A: 0x79, SR: "nzC" },
    },
    {
      name: "cmp abs=",
      init: { A: 0x55, Y: 0x00, 0x55aa: [0x55] },
      op: [0xd9, 0xaa, 0x55],
      test: { A: 0x55, SR: "nZC" },
    },
    {
      name: "cmp abs<:N",
      init: { A: 0x44, Y: 0xff, 0xab54: [0x50] },
      op: [0xd9, 0x55, 0xaa],
      test: { A: 0x44, SR: "Nzc" },
    },
    {
      name: "cmp abs>:N",
      init: { A: 0xee, Y: 0x10, 0x3264: [0x33] },
      op: [0xd9, 0x54, 0x32],
      test: { A: 0xee, SR: "NzC" },
    },

    {
      name: "cmp (ind,x)<",
      init: { A: 0x44, X: 0x01, 0x35: [0x12, 0x10], 0x1012: [0xff] },
      op: [0xc1, 0x34],
      test: { A: 0x44, SR: "nzc" },
    },
    {
      name: "cmp (ind,x)>",
      init: { A: 0x79, X: 0x80, 0x20: [0x34, 0x20], 0x2034: [0x3f] },
      op: [0xc1, 0xa0],
      test: { A: 0x79, SR: "nzC" },
    },
    {
      name: "cmp (ind,x)=",
      init: { A: 0x55, X: 0x00, 0xaa: [0x56, 0x30], 0x3056: [0x55] },
      op: [0xc1, 0xaa],
      test: { A: 0x55, SR: "nZC" },
    },
    {
      name: "cmp (ind,x)<:N",
      init: { A: 0x44, X: 0xff, 0x54: [0x78, 0x40], 0x4078: [0x50] },
      op: [0xc1, 0x55],
      test: { A: 0x44, SR: "Nzc" },
    },
    {
      name: "cmp (ind,x)>:N",
      init: { A: 0xee, X: 0x10, 0x64: [0x9a, 0x50], 0x509a: [0x33] },
      op: [0xc1, 0x54],
      test: { A: 0xee, SR: "NzC" },
    },

    {
      name: "cmp (ind),y<",
      init: { A: 0x44, Y: 0x01, 0x34: [0x12, 0x10], 0x1013: [0xff] },
      op: [0xd1, 0x34],
      test: { A: 0x44, SR: "nzc" },
    },
    {
      name: "cmp (ind),y>",
      init: { A: 0x79, Y: 0x80, 0x50: [0x34, 0x20], 0x20b4: [0x3f] },
      op: [0xd1, 0x50],
      test: { A: 0x79, SR: "nzC" },
    },
    {
      name: "cmp (ind),y=",
      init: { A: 0x55, Y: 0x00, 0xaa: [0x56, 0x30], 0x3056: [0x55] },
      op: [0xd1, 0xaa],
      test: { A: 0x55, SR: "nZC" },
    },
    {
      name: "cmp (ind),y<:N",
      init: { A: 0x44, Y: 0xff, 0x55: [0x78, 0x40], 0x4177: [0x50] },
      op: [0xd1, 0x55],
      test: { A: 0x44, SR: "Nzc" },
    },
    {
      name: "cmp (ind),y>:N",
      init: { A: 0xee, Y: 0x10, 0x54: [0x9a, 0x50], 0x50aa: [0x33] },
      op: [0xd1, 0x54],
      test: { A: 0xee, SR: "NzC" },
    },

    {
      name: "eor imm.1",
      init: { A: 0x44 },
      op: [0x49, 0xff],
      test: { A: 0xbb, SR: "Nz" },
    },
    {
      name: "eor imm.2",
      init: { A: 0x79 },
      op: [0x49, 0x3f],
      test: { A: 0x46, SR: "nz" },
    },
    {
      name: "eor imm.3",
      init: { A: 0x55 },
      op: [0x49, 0x55],
      test: { A: 0x00, SR: "nZ" },
    },
    {
      name: "eor imm.4",
      init: { A: 0x44 },
      op: [0x49, 0x50],
      test: { A: 0x14, SR: "nz" },
    },
    {
      name: "eor imm.5",
      init: { A: 0xee },
      op: [0x49, 0x33],
      test: { A: 0xdd, SR: "Nz" },
    },

    {
      name: "eor zp.1",
      init: { A: 0x44, 0x50: [0xff] },
      op: [0x45, 0x50],
      test: { A: 0xbb, SR: "Nz" },
    },
    {
      name: "eor zp.2",
      init: { A: 0x79, 0x50: [0x3f] },
      op: [0x45, 0x50],
      test: { A: 0x46, SR: "nz" },
    },
    {
      name: "eor zp.3",
      init: { A: 0x55, 0x50: [0x55] },
      op: [0x45, 0x50],
      test: { A: 0x00, SR: "nZ" },
    },
    {
      name: "eor zp.4",
      init: { A: 0x44, 0x50: [0x50] },
      op: [0x45, 0x50],
      test: { A: 0x14, SR: "nz" },
    },
    {
      name: "eor zp.5",
      init: { A: 0xee, 0x50: [0x33] },
      op: [0x45, 0x50],
      test: { A: 0xdd, SR: "Nz" },
    },

    {
      name: "eor zp.1",
      init: { A: 0x44, X: 0x01, 0x51: [0xff] },
      op: [0x55, 0x50],
      test: { A: 0xbb, SR: "Nz" },
    },
    {
      name: "eor zp.2",
      init: { A: 0x79, X: 0x80, 0x20: [0x3f] },
      op: [0x55, 0xa0],
      test: { A: 0x46, SR: "nz" },
    },
    {
      name: "eor zp.3",
      init: { A: 0x55, X: 0x00, 0x50: [0x55] },
      op: [0x55, 0x50],
      test: { A: 0x00, SR: "nZ" },
    },
    {
      name: "eor zp.4",
      init: { A: 0x44, X: 0xff, 0x4f: [0x50] },
      op: [0x55, 0x50],
      test: { A: 0x14, SR: "nz" },
    },
    {
      name: "eor zp.5",
      init: { A: 0xee, X: 0x10, 0x60: [0x33] },
      op: [0x55, 0x50],
      test: { A: 0xdd, SR: "Nz" },
    },

    {
      name: "eor abs.1",
      init: { A: 0x44, 0x1234: [0xff] },
      op: [0x4d, 0x34, 0x12],
      test: { A: 0xbb, SR: "Nz" },
    },
    {
      name: "eor abs.2",
      init: { A: 0x79, 0x0050: [0x3f] },
      op: [0x4d, 0x50, 0x00],
      test: { A: 0x46, SR: "nz" },
    },
    {
      name: "eor abs.3",
      init: { A: 0x55, 0x55aa: [0x55] },
      op: [0x4d, 0xaa, 0x55],
      test: { A: 0x00, SR: "nZ" },
    },
    {
      name: "eor abs.4",
      init: { A: 0x44, 0xaa55: [0x50] },
      op: [0x4d, 0x55, 0xaa],
      test: { A: 0x14, SR: "nz" },
    },
    {
      name: "eor abs.5",
      init: { A: 0xee, 0x3254: [0x33] },
      op: [0x4d, 0x54, 0x32],
      test: { A: 0xdd, SR: "Nz" },
    },

    {
      name: "eor abs.1",
      init: { A: 0x44, X: 0x01, 0x1235: [0xff] },
      op: [0x5d, 0x34, 0x12],
      test: { A: 0xbb, SR: "Nz" },
    },
    {
      name: "eor abs.2",
      init: { A: 0x79, X: 0x80, 0x0120: [0x3f] },
      op: [0x5d, 0xa0, 0x00],
      test: { A: 0x46, SR: "nz" },
    },
    {
      name: "eor abs.3",
      init: { A: 0x55, X: 0x00, 0x55aa: [0x55] },
      op: [0x5d, 0xaa, 0x55],
      test: { A: 0x00, SR: "nZ" },
    },
    {
      name: "eor abs.4",
      init: { A: 0x44, X: 0xff, 0xab54: [0x50] },
      op: [0x5d, 0x55, 0xaa],
      test: { A: 0x14, SR: "nz" },
    },
    {
      name: "eor abs.5",
      init: { A: 0xee, X: 0x10, 0x3264: [0x33] },
      op: [0x5d, 0x54, 0x32],
      test: { A: 0xdd, SR: "Nz" },
    },

    {
      name: "eor abs.1",
      init: { A: 0x44, Y: 0x01, 0x1235: [0xff] },
      op: [0x59, 0x34, 0x12],
      test: { A: 0xbb, SR: "Nz" },
    },
    {
      name: "eor abs.2",
      init: { A: 0x79, Y: 0x80, 0x0120: [0x3f] },
      op: [0x59, 0xa0, 0x00],
      test: { A: 0x46, SR: "nz" },
    },
    {
      name: "eor abs.3",
      init: { A: 0x55, Y: 0x00, 0x55aa: [0x55] },
      op: [0x59, 0xaa, 0x55],
      test: { A: 0x00, SR: "nZ" },
    },
    {
      name: "eor abs.4",
      init: { A: 0x44, Y: 0xff, 0xab54: [0x50] },
      op: [0x59, 0x55, 0xaa],
      test: { A: 0x14, SR: "nz" },
    },
    {
      name: "eor abs.5",
      init: { A: 0xee, Y: 0x10, 0x3264: [0x33] },
      op: [0x59, 0x54, 0x32],
      test: { A: 0xdd, SR: "Nz" },
    },

    {
      name: "eor (ind,x).1",
      init: { A: 0x44, X: 0x01, 0x35: [0x12, 0x10], 0x1012: [0xff] },
      op: [0x41, 0x34],
      test: { A: 0xbb, SR: "Nz" },
    },
    {
      name: "eor (ind,x).2",
      init: { A: 0x79, X: 0x80, 0x20: [0x34, 0x20], 0x2034: [0x3f] },
      op: [0x41, 0xa0],
      test: { A: 0x46, SR: "nz" },
    },
    {
      name: "eor (ind,x).3",
      init: { A: 0x55, X: 0x00, 0xaa: [0x56, 0x30], 0x3056: [0x55] },
      op: [0x41, 0xaa],
      test: { A: 0x00, SR: "nZ" },
    },
    {
      name: "eor (ind,x).4",
      init: { A: 0x44, X: 0xff, 0x54: [0x78, 0x40], 0x4078: [0x50] },
      op: [0x41, 0x55],
      test: { A: 0x14, SR: "nz" },
    },
    {
      name: "eor (ind,x).5",
      init: { A: 0xee, X: 0x10, 0x64: [0x9a, 0x50], 0x509a: [0x33] },
      op: [0x41, 0x54],
      test: { A: 0xdd, SR: "Nz" },
    },

    {
      name: "eor (ind),y.1",
      init: { A: 0x44, Y: 0x01, 0x34: [0x12, 0x10], 0x1013: [0xff] },
      op: [0x51, 0x34],
      test: { A: 0xbb, SR: "Nz" },
    },
    {
      name: "eor (ind),y.2",
      init: { A: 0x79, Y: 0x80, 0x50: [0x34, 0x20], 0x20b4: [0x3f] },
      op: [0x51, 0x50],
      test: { A: 0x46, SR: "nz" },
    },
    {
      name: "eor (ind),y.3",
      init: { A: 0x55, Y: 0x00, 0xaa: [0x56, 0x30], 0x3056: [0x55] },
      op: [0x51, 0xaa],
      test: { A: 0x00, SR: "nZ" },
    },
    {
      name: "eor (ind),y.4",
      init: { A: 0x44, Y: 0xff, 0x55: [0x78, 0x40], 0x4177: [0x50] },
      op: [0x51, 0x55],
      test: { A: 0x14, SR: "nz" },
    },
    {
      name: "eor (ind),y.5",
      init: { A: 0xee, Y: 0x10, 0x54: [0x9a, 0x50], 0x50aa: [0x33] },
      op: [0x51, 0x54],
      test: { A: 0xdd, SR: "Nz" },
    },

    {
      name: "jmp abs",
      init: { PC: 0x0100 },
      op: [0x4c, 0xed, 0xfd],
      test: { PC: 0xfded },
    },
    {
      name: "jmp ind",
      init: { PC: 0x0100, 0x1234: [0xed, 0xfd] },
      op: [0x6c, 0x34, 0x12],
      test: { PC: 0xfded },
    },

    {
      name: "jsr",
      init: { SP: 0xff, PC: 0x0100 },
      op: [0x20, 0xed, 0xfd],
      test: { SP: 0xfd, PC: 0xfded, 0x1fe: [0x02, 0x01] },
    },

    {
      name: "php+C",
      init: { SP: 0x80, N: 0, V: 0, B: 0, D: 0, I: 0, Z: 0, C: 1 },
      op: [0x08],
      test: { 0x0180: [0x01], SP: 0x7f },
    },
    {
      name: "php+Z",
      init: { SP: 0x80, N: 0, V: 0, B: 0, D: 0, I: 0, Z: 1, C: 0 },
      op: [0x08],
      test: { 0x0180: [0x02], SP: 0x7f },
    },
    {
      name: "php+I",
      init: { SP: 0x80, N: 0, V: 0, B: 0, D: 0, I: 1, Z: 0, C: 0 },
      op: [0x08],
      test: { 0x0180: [0x04], SP: 0x7f },
    },
    {
      name: "php+D",
      init: { SP: 0x80, N: 0, V: 0, B: 0, D: 1, I: 0, Z: 0, C: 0 },
      op: [0x08],
      test: { 0x0180: [0x08], SP: 0x7f },
    },
    {
      name: "php+B",
      init: { SP: 0x80, N: 0, V: 0, B: 1, D: 0, I: 0, Z: 0, C: 0 },
      op: [0x08],
      test: { 0x0180: [0x10], SP: 0x7f },
    },
    {
      name: "php+V",
      init: { SP: 0x80, N: 0, V: 1, B: 0, D: 0, I: 0, Z: 0, C: 0 },
      op: [0x08],
      test: { 0x0180: [0x40], SP: 0x7f },
    },
    {
      name: "php+N",
      init: { SP: 0x80, N: 1, V: 0, B: 0, D: 0, I: 0, Z: 0, C: 0 },
      op: [0x08],
      test: { 0x0180: [0x80], SP: 0x7f },
    },

    {
      name: "plp+C",
      init: { SP: 0x7f, 0x0180: [0x01] },
      op: [0x28],
      test: { SP: 0x80, SR: "nvbdizC" },
    },
    {
      name: "plp+Z",
      init: { SP: 0x7f, 0x0180: [0x02] },
      op: [0x28],
      test: { SP: 0x80, SR: "nvbdiZc" },
    },
    {
      name: "plp+I",
      init: { SP: 0x7f, 0x0180: [0x04] },
      op: [0x28],
      test: { SP: 0x80, SR: "nvbdIzc" },
    },
    {
      name: "plp+D",
      init: { SP: 0x7f, 0x0180: [0x08] },
      op: [0x28],
      test: { SP: 0x80, SR: "nvbDizc" },
    },
    {
      name: "plp+B",
      init: { SP: 0x7f, 0x0180: [0x10] },
      op: [0x28],
      test: { SP: 0x80, SR: "nvBdizc" },
    },
    {
      name: "plp+V",
      init: { SP: 0x7f, 0x0180: [0x40] },
      op: [0x28],
      test: { SP: 0x80, SR: "nVbdizc" },
    },
    {
      name: "plp+N",
      init: { SP: 0x7f, 0x0180: [0x80] },
      op: [0x28],
      test: { SP: 0x80, SR: "Nvbdizc" },
    },

    {
      name: "rol A",
      init: { A: 0x01, C: 0 },
      op: [0x2a],
      test: { A: 0x02, SR: "nzc" },
    },
    {
      name: "rol A+C",
      init: { A: 0x01, C: 1 },
      op: [0x2a],
      test: { A: 0x03, SR: "nzc" },
    },
    {
      name: "rol A:Z",
      init: { A: 0x00, C: 0 },
      op: [0x2a],
      test: { A: 0x00, SR: "nZc" },
    },
    {
      name: "rol A:N",
      init: { A: 0x40, C: 0 },
      op: [0x2a],
      test: { A: 0x80, SR: "Nzc" },
    },
    {
      name: "rol A:C",
      init: { A: 0x81, C: 0 },
      op: [0x2a],
      test: { A: 0x02, SR: "nzC" },
    },
    {
      name: "rol A+C:C",
      init: { A: 0x80, C: 1 },
      op: [0x2a],
      test: { A: 0x01, SR: "nzC" },
    },
    {
      name: "rol A+C:CN",
      init: { A: 0xf0, C: 1 },
      op: [0x2a],
      test: { A: 0xe1, SR: "NzC" },
    },
    {
      name: "rol A:CZ",
      init: { A: 0x80, C: 0 },
      op: [0x2a],
      test: { A: 0x00, SR: "nZC" },
    },

    {
      name: "rol zp",
      init: { 0x10: [0x01], C: 0 },
      op: [0x26, 0x10],
      test: { 0x10: [0x02], SR: "nzc" },
    },
    {
      name: "rol zp+C",
      init: { 0x29: [0x01], C: 1 },
      op: [0x26, 0x29],
      test: { 0x29: [0x03], SR: "nzc" },
    },
    {
      name: "rol zp:Z",
      init: { 0x38: [0x00], C: 0 },
      op: [0x26, 0x38],
      test: { 0x38: [0x00], SR: "nZc" },
    },
    {
      name: "rol zp:N",
      init: { 0x47: [0x40], C: 0 },
      op: [0x26, 0x47],
      test: { 0x47: [0x80], SR: "Nzc" },
    },
    {
      name: "rol zp:C",
      init: { 0x56: [0x81], C: 0 },
      op: [0x26, 0x56],
      test: { 0x56: [0x02], SR: "nzC" },
    },
    {
      name: "rol zp+C:C",
      init: { 0xfa: [0x80], C: 1 },
      op: [0x26, 0xfa],
      test: { 0xfa: [0x01], SR: "nzC" },
    },
    {
      name: "rol zp+C:CN",
      init: { 0xdb: [0xf0], C: 1 },
      op: [0x26, 0xdb],
      test: { 0xdb: [0xe1], SR: "NzC" },
    },
    {
      name: "rol zp:CZ",
      init: { 0xec: [0x80], C: 0 },
      op: [0x26, 0xec],
      test: { 0xec: [0x00], SR: "nZC" },
    },

    {
      name: "rol zp,x",
      init: { 0x22: [0x01], C: 0, X: 0x12 },
      op: [0x36, 0x10],
      test: { 0x22: [0x02], SR: "nzc" },
    },
    {
      name: "rol zp,x+C",
      init: { 0x4c: [0x01], C: 1, X: 0x23 },
      op: [0x36, 0x29],
      test: { 0x4c: [0x03], SR: "nzc" },
    },
    {
      name: "rol zp,x:Z",
      init: { 0x6c: [0x00], C: 0, X: 0x34 },
      op: [0x36, 0x38],
      test: { 0x6c: [0x00], SR: "nZc" },
    },
    {
      name: "rol zp,x:N",
      init: { 0x8c: [0x40], C: 0, X: 0x45 },
      op: [0x36, 0x47],
      test: { 0x8c: [0x80], SR: "Nzc" },
    },
    {
      name: "rol zp,x:C",
      init: { 0xac: [0x81], C: 0, X: 0x56 },
      op: [0x36, 0x56],
      test: { 0xac: [0x02], SR: "nzC" },
    },
    {
      name: "rol zp,x+C:C",
      init: { 0x61: [0x80], C: 1, X: 0x67 },
      op: [0x36, 0xfa],
      test: { 0x61: [0x01], SR: "nzC" },
    },
    {
      name: "rol zp,x+C:CN",
      init: { 0x53: [0xf0], C: 1, X: 0x78 },
      op: [0x36, 0xdb],
      test: { 0x53: [0xe1], SR: "NzC" },
    },
    {
      name: "rol zp,x:CZ",
      init: { 0xea: [0x80], C: 0, X: 0xfe },
      op: [0x36, 0xec],
      test: { 0xea: [0x00], SR: "nZC" },
    },

    {
      name: "rol abs",
      init: { 0x1110: [0x01], C: 0 },
      op: [0x2e, 0x10, 0x11],
      test: { 0x1110: [0x02], SR: "nzc" },
    },
    {
      name: "rol abs+C",
      init: { 0x2229: [0x01], C: 1 },
      op: [0x2e, 0x29, 0x22],
      test: { 0x2229: [0x03], SR: "nzc" },
    },
    {
      name: "rol abs:Z",
      init: { 0x3338: [0x00], C: 0 },
      op: [0x2e, 0x38, 0x33],
      test: { 0x3338: [0x00], SR: "nZc" },
    },
    {
      name: "rol abs:N",
      init: { 0x4447: [0x40], C: 0 },
      op: [0x2e, 0x47, 0x44],
      test: { 0x4447: [0x80], SR: "Nzc" },
    },
    {
      name: "rol abs:C",
      init: { 0x9956: [0x81], C: 0 },
      op: [0x2e, 0x56, 0x99],
      test: { 0x9956: [0x02], SR: "nzC" },
    },
    {
      name: "rol abs+C:C",
      init: { 0x88fa: [0x80], C: 1 },
      op: [0x2e, 0xfa, 0x88],
      test: { 0x88fa: [0x01], SR: "nzC" },
    },
    {
      name: "rol abs+C:CN",
      init: { 0x77db: [0xf0], C: 1 },
      op: [0x2e, 0xdb, 0x77],
      test: { 0x77db: [0xe1], SR: "NzC" },
    },
    {
      name: "rol abs:CZ",
      init: { 0xddec: [0x80], C: 0 },
      op: [0x2e, 0xec, 0xdd],
      test: { 0xddec: [0x00], SR: "nZC" },
    },

    {
      name: "rol abs,x",
      init: { 0x1122: [0x01], C: 0, X: 0x12 },
      op: [0x3e, 0x10, 0x11],
      test: { 0x1122: [0x02], SR: "nzc" },
    },
    {
      name: "rol abs,x+C",
      init: { 0x224c: [0x01], C: 1, X: 0x23 },
      op: [0x3e, 0x29, 0x22],
      test: { 0x224c: [0x03], SR: "nzc" },
    },
    {
      name: "rol abs,x:Z",
      init: { 0x336c: [0x00], C: 0, X: 0x34 },
      op: [0x3e, 0x38, 0x33],
      test: { 0x336c: [0x00], SR: "nZc" },
    },
    {
      name: "rol abs,x:N",
      init: { 0x448c: [0x40], C: 0, X: 0x45 },
      op: [0x3e, 0x47, 0x44],
      test: { 0x448c: [0x80], SR: "Nzc" },
    },
    {
      name: "rol abs,x:C",
      init: { 0x99ac: [0x81], C: 0, X: 0x56 },
      op: [0x3e, 0x56, 0x99],
      test: { 0x99ac: [0x02], SR: "nzC" },
    },
    {
      name: "rol abs,x+C:C",
      init: { 0x8961: [0x80], C: 1, X: 0x67 },
      op: [0x3e, 0xfa, 0x88],
      test: { 0x8961: [0x01], SR: "nzC" },
    },
    {
      name: "rol abs,x+C:CN",
      init: { 0x7853: [0xf0], C: 1, X: 0x78 },
      op: [0x3e, 0xdb, 0x77],
      test: { 0x7853: [0xe1], SR: "NzC" },
    },
    {
      name: "rol abs,x:CZ",
      init: { 0xdeea: [0x80], C: 0, X: 0xfe },
      op: [0x3e, 0xec, 0xdd],
      test: { 0xdeea: [0x00], SR: "nZC" },
    },

    {
      name: "ror A",
      init: { A: 0x10, C: 0 },
      op: [0x6a],
      test: { A: 0x08, SR: "nzc" },
    },
    {
      name: "ror A+C:N",
      init: { A: 0x10, C: 1 },
      op: [0x6a],
      test: { A: 0x88, SR: "Nzc" },
    },
    {
      name: "ror A:Z",
      init: { A: 0x00, C: 0 },
      op: [0x6a],
      test: { A: 0x00, SR: "nZc" },
    },
    {
      name: "ror A:C",
      init: { A: 0x81, C: 0 },
      op: [0x6a],
      test: { A: 0x40, SR: "nzC" },
    },
    {
      name: "ror A+C:CN",
      init: { A: 0x01, C: 1 },
      op: [0x6a],
      test: { A: 0x80, SR: "NzC" },
    },
    {
      name: "ror A:CZ",
      init: { A: 0x01, C: 0 },
      op: [0x6a],
      test: { A: 0x00, SR: "nZC" },
    },

    {
      name: "ror zp",
      init: { 0x10: [0x10], C: 0 },
      op: [0x66, 0x10],
      test: { 0x10: [0x08], SR: "nzc" },
    },
    {
      name: "ror zp+C:N",
      init: { 0x29: [0x10], C: 1 },
      op: [0x66, 0x29],
      test: { 0x29: [0x88], SR: "Nzc" },
    },
    {
      name: "ror zp:Z",
      init: { 0x38: [0x00], C: 0 },
      op: [0x66, 0x38],
      test: { 0x38: [0x00], SR: "nZc" },
    },
    {
      name: "ror zp:C",
      init: { 0x56: [0x81], C: 0 },
      op: [0x66, 0x56],
      test: { 0x56: [0x40], SR: "nzC" },
    },
    {
      name: "ror zp+C:CN",
      init: { 0xdb: [0x01], C: 1 },
      op: [0x66, 0xdb],
      test: { 0xdb: [0x80], SR: "NzC" },
    },
    {
      name: "ror zp:CZ",
      init: { 0xec: [0x01], C: 0 },
      op: [0x66, 0xec],
      test: { 0xec: [0x00], SR: "nZC" },
    },

    {
      name: "ror zp,x",
      init: { 0x22: [0x10], C: 0, X: 0x12 },
      op: [0x76, 0x10],
      test: { 0x22: [0x08], SR: "nzc" },
    },
    {
      name: "ror zp,x+C:N",
      init: { 0x4c: [0x10], C: 1, X: 0x23 },
      op: [0x76, 0x29],
      test: { 0x4c: [0x88], SR: "Nzc" },
    },
    {
      name: "ror zp,x:Z",
      init: { 0x6c: [0x00], C: 0, X: 0x34 },
      op: [0x76, 0x38],
      test: { 0x6c: [0x00], SR: "nZc" },
    },
    {
      name: "ror zp,x:C",
      init: { 0xac: [0x81], C: 0, X: 0x56 },
      op: [0x76, 0x56],
      test: { 0xac: [0x40], SR: "nzC" },
    },
    {
      name: "ror zp,x+C:CN",
      init: { 0x53: [0x01], C: 1, X: 0x78 },
      op: [0x76, 0xdb],
      test: { 0x53: [0x80], SR: "NzC" },
    },
    {
      name: "ror zp,x:CZ",
      init: { 0xea: [0x01], C: 0, X: 0xfe },
      op: [0x76, 0xec],
      test: { 0xea: [0x00], SR: "nZC" },
    },

    {
      name: "ror abs",
      init: { 0x1110: [0x10], C: 0 },
      op: [0x6e, 0x10, 0x11],
      test: { 0x1110: [0x08], SR: "nzc" },
    },
    {
      name: "ror abs+C:N",
      init: { 0x2229: [0x10], C: 1 },
      op: [0x6e, 0x29, 0x22],
      test: { 0x2229: [0x88], SR: "Nzc" },
    },
    {
      name: "ror abs:Z",
      init: { 0x3338: [0x00], C: 0 },
      op: [0x6e, 0x38, 0x33],
      test: { 0x3338: [0x00], SR: "nZc" },
    },
    {
      name: "ror abs:C",
      init: { 0x9956: [0x81], C: 0 },
      op: [0x6e, 0x56, 0x99],
      test: { 0x9956: [0x40], SR: "nzC" },
    },
    {
      name: "ror abs+C:CN",
      init: { 0x77db: [0x01], C: 1 },
      op: [0x6e, 0xdb, 0x77],
      test: { 0x77db: [0x80], SR: "NzC" },
    },
    {
      name: "ror abs:CZ",
      init: { 0xddec: [0x01], C: 0 },
      op: [0x6e, 0xec, 0xdd],
      test: { 0xddec: [0x00], SR: "nZC" },
    },

    {
      name: "ror abs,x",
      init: { 0x1122: [0x10], C: 0, X: 0x12 },
      op: [0x7e, 0x10, 0x11],
      test: { 0x1122: [0x08], SR: "nzc" },
    },
    {
      name: "ror abs,x+C:N",
      init: { 0x224c: [0x10], C: 1, X: 0x23 },
      op: [0x7e, 0x29, 0x22],
      test: { 0x224c: [0x88], SR: "Nzc" },
    },
    {
      name: "ror abs,x:Z",
      init: { 0x336c: [0x00], C: 0, X: 0x34 },
      op: [0x7e, 0x38, 0x33],
      test: { 0x336c: [0x00], SR: "nZc" },
    },
    {
      name: "ror abs,x:C",
      init: { 0x99ac: [0x81], C: 0, X: 0x56 },
      op: [0x7e, 0x56, 0x99],
      test: { 0x99ac: [0x40], SR: "nzC" },
    },
    {
      name: "ror abs,x+C:CN",
      init: { 0x7853: [0x01], C: 1, X: 0x78 },
      op: [0x7e, 0xdb, 0x77],
      test: { 0x7853: [0x80], SR: "NzC" },
    },
    {
      name: "ror abs,x:CZ",
      init: { 0xdeea: [0x01], C: 0, X: 0xfe },
      op: [0x7e, 0xec, 0xdd],
      test: { 0xdeea: [0x00], SR: "nZC" },
    },
  ];

  var rand8 = function () {
    return Math.floor(Math.random() * 256) & 0xff;
  };
  var rand1 = function () {
    return Math.floor(Math.random() * 2) & 0x1;
  };

  for (var v in vector) {
    printf("%s: ", vector[v].name);

    var ram = [];
    for (var i = 0; i < 0x10000; i++) ram[i] = rand8();

    var cpu = new cpu6502([{ start: 0x0000, end: 0xffff, ram: ram }]);

    var oreg = { s: {} };
    for (var r in { A: 0, X: 0, Y: 0, SP: 0 }) oreg[r] = cpu.reg()[r] = rand8();
    cpu.reg().PC = (rand8() << 8) | rand8();
    oreg.PC = cpu.reg().PC + vector[v].op.length;
    for (var s in { C: 0, Z: 0, I: 0, D: 0, B: 0, V: 0, N: 0 })
      oreg.s[s] = cpu.reg().s[s] = rand1();

    try {
      for (var i in vector[v].init) {
        if (i.match(/^\d+$/)) {
          for (var m = 0; m < vector[v].init[i].length; m++)
            ram[parseInt(i) + m] = vector[v].init[i][m];
        } else if (i.match(/^(?:A|X|Y|PC|SP)$/)) {
          oreg[i] = cpu.reg()[i] = vector[v].init[i];
        } else if (i.match(/^[CZIDBVN]$/)) {
          oreg.s[i] = cpu.reg().s[i] = vector[v].init[i];
        } else {
          throw "Bad initialization vector: " + i;
        }
      }

      for (var op = 0; op < vector[v].op.length; op++)
        ram[cpu.reg().PC + op] = vector[v].op[op];

      cpu.set_trace(1);
      cpu.run(1);

      var compare = function (what, where, got, expected) {
        if (got != expected)
          throw sprintf(
            "Mismatched %s%s: got %02x, expected: %02x",
            what,
            where,
            got,
            expected
          );
      };

      for (var i in vector[v].test) {
        if (i.match(/^\d+$/)) {
          for (var m = 0; m < vector[v].test[i].length; m++)
            compare(
              "memory @",
              sprintf("%04x", m),
              ram[parseInt(i) + m],
              vector[v].test[i][m]
            );
        } else if (i.match(/^(?:A|X|Y|PC|SP)$/)) {
          compare("register ", i, cpu.reg()[i], vector[v].test[i]);
          delete oreg[i];
        } else if (i == "SR") {
          var sr = vector[v].test.SR.split("");
          for (var b in sr) {
            if (sr[b].toLowerCase() == sr[b]) {
              compare(
                "SR.",
                sr[b].toUpperCase(),
                cpu.reg().s[sr[b].toUpperCase()] ? 1 : 0,
                0
              );
            } else {
              compare(
                "SR.",
                sr[b].toUpperCase(),
                cpu.reg().s[sr[b].toUpperCase()] ? 1 : 0,
                1
              );
            }
            delete oreg.s[sr[b].toUpperCase()];
          }
        } else throw "Bad test vector: " + i;
      }

      for (var r in oreg)
        if (r != "s") compare("untouched register ", r, cpu.reg()[r], oreg[r]);
        else
          for (var s in oreg.s)
            compare(
              "untouched SR.",
              s,
              cpu.reg().s[s] ? 1 : 0,
              oreg.s[s] ? 1 : 0
            );

      printf("Passed.\n");
      continue;
    } catch (e) {
      printf("Failed: %s\nTrace:\n%s", e, cpu.last_trace());
    }
  }
}
