export interface TroubleshootNode {
  id: string;
  text: string;
  detail?: string;
  type: 'question' | 'action' | 'result';
  yesNext?: string;
  noNext?: string;
  next?: string;
}

export interface TroubleshootGuide {
  id: string;
  title: string;
  category: string;
  icon: string;
  description: string;
  nodes: Record<string, TroubleshootNode>;
  startNode: string;
}

export const TROUBLESHOOT_CATEGORIES = [
  { id: 'valves', title: 'Valves', icon: 'pipe-valve', description: 'Suction & discharge valve issues' },
  { id: 'packing', title: 'Packing', icon: 'circle-outline', description: 'Piston rod packing leaks & wear' },
  { id: 'bearings', title: 'Bearings', icon: 'cog', description: 'Main, crank & crosshead bearings' },
  { id: 'capacity', title: 'Capacity', icon: 'speedometer', description: 'Low capacity & loading issues' },
  { id: 'vibration', title: 'Vibration', icon: 'vibrate', description: 'Excessive vibration & knock' },
  { id: 'lubrication', title: 'Lubrication', icon: 'oil', description: 'Oil system & lubrication problems' },
  { id: 'cooling', title: 'Cooling', icon: 'coolant-temperature', description: 'Cooling system & temperature issues' },
];

export const TROUBLESHOOT_GUIDES: TroubleshootGuide[] = [
  {
    id: 'valve-failure',
    title: 'Valve Failure Diagnosis',
    category: 'valves',
    icon: 'pipe-valve',
    description: 'Diagnose suction and discharge valve issues on reciprocating compressors',
    startNode: 'start',
    nodes: {
      'start': {
        id: 'start',
        text: 'Is the compressor showing elevated discharge temperature on one or more cylinders?',
        detail: 'Check discharge temperature readings against baseline. Normal deviation is +/- 10°F from baseline.',
        type: 'question',
        yesNext: 'high-temp',
        noNext: 'pressure-check',
      },
      'high-temp': {
        id: 'high-temp',
        text: 'Is the elevated temperature on the discharge side only?',
        detail: 'Compare suction vs discharge temps. If both are elevated, the issue may be upstream.',
        type: 'question',
        yesNext: 'discharge-valve-issue',
        noNext: 'suction-check',
      },
      'pressure-check': {
        id: 'pressure-check',
        text: 'Are you seeing abnormal pressure readings or pressure pulsation?',
        detail: 'Check suction and discharge pressure gauges. Listen for irregular sounds.',
        type: 'question',
        yesNext: 'valve-leak',
        noNext: 'performance-check',
      },
      'suction-check': {
        id: 'suction-check',
        text: 'Is suction temperature also elevated?',
        detail: 'Elevated suction temp may indicate valve recirculation or upstream heat source.',
        type: 'question',
        yesNext: 'suction-valve-issue',
        noNext: 'discharge-valve-issue',
      },
      'discharge-valve-issue': {
        id: 'discharge-valve-issue',
        text: 'Likely discharge valve failure',
        detail: 'Recommended actions:\n1. Shut down and lock out compressor\n2. Remove and inspect discharge valve(s)\n3. Check for broken plates, springs, or seats\n4. Check valve lift and sealing\n5. Replace valve or components as needed\n6. Check for liquid carryover that may have caused damage',
        type: 'result',
      },
      'suction-valve-issue': {
        id: 'suction-valve-issue',
        text: 'Likely suction valve failure or recirculation',
        detail: 'Recommended actions:\n1. Shut down and lock out compressor\n2. Remove and inspect suction valve(s)\n3. Check for broken plates or stuck valve elements\n4. Verify valve orientation is correct\n5. Check for debris or liquid damage\n6. Inspect valve seat for erosion',
        type: 'result',
      },
      'valve-leak': {
        id: 'valve-leak',
        text: 'Possible valve leak detected',
        detail: 'Recommended actions:\n1. Perform a cylinder leak-down test\n2. Listen for blowby at valve covers\n3. Check valve cover temperatures by hand (carefully)\n4. Warmer-than-normal covers indicate leaking valves\n5. Plan shutdown for valve inspection',
        type: 'result',
      },
      'performance-check': {
        id: 'performance-check',
        text: 'Is the compressor failing to build pressure or maintain capacity?',
        type: 'question',
        yesNext: 'capacity-issue',
        noNext: 'no-valve-issue',
      },
      'capacity-issue': {
        id: 'capacity-issue',
        text: 'Valve-related capacity loss',
        detail: 'Recommended actions:\n1. Check all valve cover temperatures for hot spots\n2. Perform PV card analysis if available\n3. Inspect valves on hottest cylinder first\n4. Check clearance pocket settings\n5. Verify unloader operation',
        type: 'result',
      },
      'no-valve-issue': {
        id: 'no-valve-issue',
        text: 'Valves appear to be operating normally',
        detail: 'If compressor issues persist, check other systems:\n- Packing and rings\n- Bearings\n- Lubrication system\n- Control system\n- Foundation and alignment',
        type: 'result',
      },
    },
  },
  {
    id: 'packing-leak',
    title: 'Packing Leak Diagnosis',
    category: 'packing',
    icon: 'circle-outline',
    description: 'Diagnose piston rod packing leaks and excessive wear',
    startNode: 'start',
    nodes: {
      'start': {
        id: 'start',
        text: 'Is there visible gas leaking from the packing case vent?',
        detail: 'Check packing case vent line. Some leakage is normal — compare against baseline flow rate.',
        type: 'question',
        yesNext: 'leak-rate',
        noNext: 'rod-drop',
      },
      'leak-rate': {
        id: 'leak-rate',
        text: 'Is the leak rate significantly above the normal baseline?',
        detail: 'Normal packing leak varies by size and pressure. Typical: < 1 CFM for new packing. Measure with flow meter if available.',
        type: 'question',
        yesNext: 'packing-worn',
        noNext: 'monitor',
      },
      'rod-drop': {
        id: 'rod-drop',
        text: 'Is the rod drop (rider band wear) within acceptable limits?',
        detail: 'Check rod drop readings. Typical alarm at 15-20 mils. Compare to baseline.',
        type: 'question',
        yesNext: 'check-oil',
        noNext: 'rider-band-wear',
      },
      'packing-worn': {
        id: 'packing-worn',
        text: 'Packing replacement needed',
        detail: 'Recommended actions:\n1. Schedule shutdown for packing replacement\n2. Order correct packing set for cylinder size and pressure\n3. Inspect rod for scoring or damage during replacement\n4. Measure rod runout\n5. Check packing case bore for wear\n6. Ensure proper ring orientation during assembly',
        type: 'result',
      },
      'monitor': {
        id: 'monitor',
        text: 'Continue monitoring',
        detail: 'Packing leak is within acceptable range.\n1. Continue regular monitoring\n2. Track trend over time\n3. Schedule replacement at next planned outage if trending upward\n4. Check lubrication rates to packing',
        type: 'result',
      },
      'rider-band-wear': {
        id: 'rider-band-wear',
        text: 'Excessive rider band wear detected',
        detail: 'Recommended actions:\n1. Plan shutdown for rider band replacement\n2. Inspect cylinder bore for damage\n3. Check piston alignment and rod runout\n4. Verify crosshead pin and bushing condition\n5. Check lubrication adequacy\n6. Consider upgrading rider band material',
        type: 'result',
      },
      'check-oil': {
        id: 'check-oil',
        text: 'Is the packing lubrication system working correctly?',
        detail: 'Check force-feed lubricator rates and line pressures. Verify oil is reaching packing.',
        type: 'question',
        yesNext: 'packing-ok',
        noNext: 'lube-issue',
      },
      'packing-ok': {
        id: 'packing-ok',
        text: 'Packing appears to be in good condition',
        detail: 'Continue regular monitoring schedule.\nTrack rod drop trends.\nSchedule replacement at next planned outage based on hours or condition.',
        type: 'result',
      },
      'lube-issue': {
        id: 'lube-issue',
        text: 'Fix lubrication to packing',
        detail: 'Recommended actions:\n1. Check lubricator pump operation\n2. Verify tubing and fittings for blockages\n3. Check correct oil type and viscosity\n4. Adjust feed rates per manufacturer specs\n5. Bleed air from lube lines\n6. Insufficient lube will accelerate packing and rod wear',
        type: 'result',
      },
    },
  },
  {
    id: 'vibration-diagnosis',
    title: 'Vibration Diagnosis',
    category: 'vibration',
    icon: 'vibrate',
    description: 'Diagnose excessive vibration and knocking in reciprocating compressors',
    startNode: 'start',
    nodes: {
      'start': {
        id: 'start',
        text: 'Is the vibration a sudden change or has it been gradually increasing?',
        detail: 'Sudden changes suggest a component failure. Gradual increase suggests wear.',
        type: 'question',
        yesNext: 'sudden',
        noNext: 'gradual',
      },
      'sudden': {
        id: 'sudden',
        text: 'Is there an audible knock or impact noise?',
        detail: 'Use a mechanics stethoscope or screwdriver on the frame to isolate the source.',
        type: 'question',
        yesNext: 'knock-source',
        noNext: 'loose-check',
      },
      'gradual': {
        id: 'gradual',
        text: 'Has vibration been trending upward over weeks/months?',
        type: 'question',
        yesNext: 'wear-related',
        noNext: 'operational',
      },
      'knock-source': {
        id: 'knock-source',
        text: 'Mechanical knock detected — immediate action needed',
        detail: 'SHUT DOWN IMMEDIATELY if knock is severe.\n\nPossible causes:\n1. Loose crosshead pin or bushing\n2. Broken valve components\n3. Liquid in cylinder (hydraulic lock risk)\n4. Loose piston or piston nut\n5. Main or crank bearing failure\n\nInspect in order of severity. Check oil filter for metal debris.',
        type: 'result',
      },
      'loose-check': {
        id: 'loose-check',
        text: 'Sudden vibration without knock',
        detail: 'Check for:\n1. Loose foundation bolts\n2. Broken or loose piping support\n3. Failed vibration isolator/mount\n4. Coupling misalignment (if recent maintenance)\n5. Unloader malfunction causing uneven loading\n6. Shifted cylinder or crosshead alignment',
        type: 'result',
      },
      'wear-related': {
        id: 'wear-related',
        text: 'Gradual vibration increase — likely wear-related',
        detail: 'Plan inspection for:\n1. Crosshead pin and bushing clearances\n2. Main and crank bearing clearances\n3. Wrist pin bushing\n4. Rod drop / rider band wear\n5. Foundation grout condition\n6. Schedule vibration analysis survey',
        type: 'result',
      },
      'operational': {
        id: 'operational',
        text: 'Check operational conditions',
        detail: 'Vibration may be related to:\n1. Changed gas composition or conditions\n2. Operating near a natural frequency\n3. Pulsation dampener issues\n4. Unbalanced loading across stages\n5. Speed changes\n\nPerform vibration analysis to identify dominant frequencies.',
        type: 'result',
      },
    },
  },
  {
    id: 'lubrication-issues',
    title: 'Lubrication System Diagnosis',
    category: 'lubrication',
    icon: 'oil',
    description: 'Diagnose oil system and lubrication problems',
    startNode: 'start',
    nodes: {
      'start': {
        id: 'start',
        text: 'Is the frame oil pressure within normal range?',
        detail: 'Check frame oil pressure gauge. Typical range: 40-65 PSI (varies by manufacturer). Check against nameplate or manual.',
        type: 'question',
        yesNext: 'cylinder-lube',
        noNext: 'low-pressure',
      },
      'low-pressure': {
        id: 'low-pressure',
        text: 'Is pressure low or has it dropped suddenly?',
        detail: 'Sudden drop = urgent. Gradual decline may indicate pump wear or filter restriction.',
        type: 'question',
        yesNext: 'urgent-lube',
        noNext: 'gradual-lube',
      },
      'cylinder-lube': {
        id: 'cylinder-lube',
        text: 'Are cylinder and packing lubrication rates correct?',
        detail: 'Check force-feed lubricator sight glasses. Verify pump cycles and drops per minute.',
        type: 'question',
        yesNext: 'oil-quality',
        noNext: 'cylinder-lube-fix',
      },
      'urgent-lube': {
        id: 'urgent-lube',
        text: 'URGENT: Low frame oil pressure',
        detail: 'SHUT DOWN if pressure drops below minimum.\n\n1. Check oil level in sump\n2. Inspect oil pump operation\n3. Check relief valve setting\n4. Inspect oil filter DP (differential pressure)\n5. Check for oil leaks at bearings/seals\n6. Sample oil for contamination\n7. Do NOT restart until cause is found',
        type: 'result',
      },
      'gradual-lube': {
        id: 'gradual-lube',
        text: 'Gradual oil pressure decline',
        detail: 'Plan investigation:\n1. Replace oil filters\n2. Check oil pump wear\n3. Verify relief valve calibration\n4. Check bearing clearances (increased clearance = lower pressure)\n5. Verify oil cooler operation\n6. Sample oil for analysis',
        type: 'result',
      },
      'cylinder-lube-fix': {
        id: 'cylinder-lube-fix',
        text: 'Fix cylinder/packing lubrication',
        detail: 'Actions:\n1. Check lubricator pump operation and plunger condition\n2. Verify no-flow shutdown switches working\n3. Clear blocked distribution tubing\n4. Adjust feed rates per manufacturer specs\n5. Verify correct oil grade\n6. Replace divider blocks if not cycling properly',
        type: 'result',
      },
      'oil-quality': {
        id: 'oil-quality',
        text: 'Has the oil been sampled and analyzed recently?',
        detail: 'Regular oil analysis catches problems early. Sample every 3-6 months or per manufacturer schedule.',
        type: 'question',
        yesNext: 'lube-ok',
        noNext: 'sample-oil',
      },
      'lube-ok': {
        id: 'lube-ok',
        text: 'Lubrication system operating normally',
        detail: 'Continue regular monitoring:\n- Frame oil pressure and temperature\n- Oil filter DP\n- Cylinder lube pump rates\n- Oil analysis every 3-6 months\n- Check oil level daily',
        type: 'result',
      },
      'sample-oil': {
        id: 'sample-oil',
        text: 'Schedule oil sampling and analysis',
        detail: 'Take oil sample from:\n1. Frame oil sump\n2. Cylinder drain\n\nTest for:\n- Viscosity\n- Water content\n- Particle count / wear metals\n- TBN/TAN\n- Oxidation\n\nCompare results to baseline and oil manufacturer specs.',
        type: 'result',
      },
    },
  },
];
