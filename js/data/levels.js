const LEVELS = [
  {
    id: 1,
    name: 'The Living Room',
    icon: '🛋️',
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
    icon: '🍳',
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
    icon: '🚿',
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
  },
  {
    id: 4,
    name: 'The Bedroom',
    icon: '🛏️',
    timeLimit: 40,
    bgColor: 0x2b2b40,
    wallColor: 0xe8d5c4,
    floorColor: 0x6d4c41,
    problems: [
      { id: 'crack2',   type: 'crack',   x: 0.22, y: 0.35, label: 'Ceiling Crack',   taps: 4, tip: 'Hairline ceiling cracks can be fixed with joint compound!' },
      { id: 'outlet2',  type: 'outlet',  x: 0.72, y: 0.58, label: 'Dead Outlet',     taps: 3, tip: 'Check the GFCI reset button in the bathroom first!' },
      { id: 'paint2',   type: 'paint',   x: 0.48, y: 0.44, label: 'Scuffed Wall',    taps: 3, tip: 'Magic eraser works on scuffs before repainting!' },
      { id: 'cabinet2', type: 'cabinet', x: 0.30, y: 0.60, label: 'Stuck Drawer',    taps: 4, tip: 'Rub candle wax on drawer slides for smooth glide!' }
    ]
  },
  {
    id: 5,
    name: 'The Garage',
    icon: '🔧',
    timeLimit: 50,
    bgColor: 0x2c2c2c,
    wallColor: 0xbdbdbd,
    floorColor: 0x546e7a,
    problems: [
      { id: 'crack3',   type: 'crack',   x: 0.20, y: 0.62, label: 'Floor Crack',     taps: 5, tip: 'Fill concrete cracks with polyurethane caulk!' },
      { id: 'pipe2',    type: 'pipe',    x: 0.65, y: 0.40, label: 'Rusty Pipe',      taps: 4, tip: 'Sand rust off pipes, then apply rust-inhibiting primer!' },
      { id: 'outlet3',  type: 'outlet',  x: 0.80, y: 0.55, label: 'Tripped Breaker', taps: 2, tip: 'Label your breaker box so you always know what\'s what!' },
      { id: 'mold2',    type: 'mold',    x: 0.35, y: 0.50, label: 'Oil Stain',       taps: 5, tip: 'Cat litter absorbs fresh oil stains on concrete!' },
      { id: 'cabinet3', type: 'cabinet', x: 0.55, y: 0.68, label: 'Broken Shelf',    taps: 3, tip: 'Use L-brackets for heavy garage shelving!' }
    ]
  },
  {
    id: 6,
    name: 'The Basement',
    icon: '🏚️',
    timeLimit: 45,
    bgColor: 0x1a1a1a,
    wallColor: 0x8d8d8d,
    floorColor: 0x4a4a4a,
    problems: [
      { id: 'mold3',    type: 'mold',    x: 0.18, y: 0.48, label: 'Damp Mold',       taps: 5, tip: 'Fix the moisture source before treating mold!' },
      { id: 'crack4',   type: 'crack',   x: 0.70, y: 0.58, label: 'Foundation Crack',taps: 5, tip: 'Seal foundation cracks from inside with hydraulic cement!' },
      { id: 'pipe3',    type: 'pipe',    x: 0.45, y: 0.38, label: 'Sweating Pipe',   taps: 3, tip: 'Pipe insulation sleeves stop condensation instantly!' },
      { id: 'outlet4',  type: 'outlet',  x: 0.60, y: 0.65, label: 'Faulty Wiring',   taps: 4, tip: 'Always use a voltage tester before touching wires!' },
      { id: 'paint3',   type: 'paint',   x: 0.30, y: 0.55, label: 'Peeling Sealant', taps: 4, tip: 'Use masonry waterproof paint in basements!' }
    ]
  },
  {
    id: 7,
    name: 'The Back Deck',
    icon: '🌿',
    timeLimit: 50,
    bgColor: 0x2d3a1e,
    wallColor: 0xa5d6a7,
    floorColor: 0x5d4037,
    problems: [
      { id: 'crack5',   type: 'crack',   x: 0.25, y: 0.60, label: 'Rotting Board',   taps: 5, tip: 'Replace deck boards one at a time — use composite for longevity!' },
      { id: 'pipe4',    type: 'pipe',    x: 0.68, y: 0.45, label: 'Clogged Gutter',  taps: 4, tip: 'Clean gutters twice a year to prevent water damage!' },
      { id: 'mold4',    type: 'mold',    x: 0.42, y: 0.52, label: 'Algae Growth',    taps: 4, tip: 'Pressure washing removes algae from decks fast!' },
      { id: 'cabinet4', type: 'cabinet', x: 0.78, y: 0.62, label: 'Loose Railing',   taps: 5, tip: 'Safety first — always anchor deck rails into joists!' },
      { id: 'paint4',   type: 'paint',   x: 0.15, y: 0.42, label: 'Faded Stain',     taps: 3, tip: 'Re-stain your deck every 2–3 years to protect the wood!' }
    ]
  }
];
