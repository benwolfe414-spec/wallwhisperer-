// Level definitions — each level has a room theme and a set of problems to fix
const LEVELS = [
  {
    id: 1,
    name: 'The Living Room',
    timeLimit: 45,
    bgColor: 0x3b2f2f,
    wallColor: 0xd4a574,
    floorColor: 0x8b6914,
    problems: [
      { id: 'crack1',   type: 'crack',   x: 0.18, y: 0.38, label: 'Wall Crack',      taps: 3, tip: 'Use spackling paste to fill wall cracks!' },
      { id: 'pipe1',    type: 'pipe',    x: 0.75, y: 0.55, label: 'Leaking Pipe',    taps: 4, tip: 'Wrap with plumber\'s tape for a quick fix!' },
      { id: 'outlet1',  type: 'outlet',  x: 0.55, y: 0.62, label: 'Loose Outlet',    taps: 2, tip: 'Tighten the faceplate screws first!' },
      { id: 'paint1',   type: 'paint',   x: 0.30, y: 0.50, label: 'Peeling Paint',   taps: 4, tip: 'Sand before repainting for best adhesion!' }
    ]
  },
  {
    id: 2,
    name: 'The Kitchen',
    timeLimit: 40,
    bgColor: 0x2f3b2f,
    wallColor: 0xc8e6c9,
    floorColor: 0x795548,
    problems: [
      { id: 'faucet1',  type: 'pipe',    x: 0.20, y: 0.45, label: 'Dripping Faucet', taps: 5, tip: 'Replace the O-ring to stop a dripping faucet!' },
      { id: 'tile1',    type: 'crack',   x: 0.65, y: 0.68, label: 'Cracked Tile',    taps: 3, tip: 'Use epoxy glue to re-bond cracked tiles!' },
      { id: 'cabinet1', type: 'cabinet', x: 0.45, y: 0.40, label: 'Cabinet Hinge',   taps: 2, tip: 'A loose hinge just needs a tighter screw!' },
      { id: 'mold1',    type: 'mold',    x: 0.80, y: 0.52, label: 'Mold Spot',       taps: 4, tip: 'Bleach solution removes surface mold fast!' }
    ]
  },
  {
    id: 3,
    name: 'The Bathroom',
    timeLimit: 35,
    bgColor: 0x2f2f3b,
    wallColor: 0xb3e5fc,
    floorColor: 0x607d8b,
    problems: [
      { id: 'grout1',   type: 'crack',   x: 0.25, y: 0.55, label: 'Cracked Grout',  taps: 4, tip: 'Re-grout every 5–10 years to prevent water damage!' },
      { id: 'toilet1',  type: 'pipe',    x: 0.70, y: 0.60, label: 'Running Toilet', taps: 5, tip: 'A flapper valve is the #1 cause of running toilets!' },
      { id: 'caulk1',   type: 'mold',    x: 0.50, y: 0.72, label: 'Bad Caulk',      taps: 3, tip: 'Remove old caulk fully before applying new bead!' },
      { id: 'switch1',  type: 'outlet',  x: 0.15, y: 0.42, label: 'Dim Switch',     taps: 2, tip: 'Dimmer switches can wear out — easy swap!' },
      { id: 'mirror1',  type: 'cabinet', x: 0.60, y: 0.32, label: 'Loose Mirror',   taps: 3, tip: 'Use heavy-duty wall anchors for mirrors!' }
    ]
  }
];
