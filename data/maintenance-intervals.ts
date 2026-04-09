export interface MaintenanceTask {
  id: string;
  name: string;
  intervalDays?: number;
  intervalHours?: number;
  description: string;
  priority: 'critical' | 'high' | 'normal' | 'low';
  category: string;
}

export interface ManufacturerTemplate {
  manufacturer: string;
  models: string[];
  tasks: MaintenanceTask[];
}

export const MAINTENANCE_TEMPLATES: ManufacturerTemplate[] = [
  {
    manufacturer: 'Ariel',
    models: ['JG', 'JGA', 'JGC', 'JGD', 'JGE', 'JGH', 'JGJ', 'JGK', 'JGM', 'JGN', 'JGP', 'JGQ', 'JGR', 'JGT', 'JGZ'],
    tasks: [
      {
        id: 'ariel-oil-check',
        name: 'Frame Oil Level Check',
        intervalDays: 1,
        description: 'Check frame oil level and top off as needed. Inspect sight glass for clarity.',
        priority: 'high',
        category: 'Lubrication',
      },
      {
        id: 'ariel-oil-filter',
        name: 'Frame Oil Filter Change',
        intervalDays: 90,
        description: 'Replace frame oil filter element. Check DP before and after.',
        priority: 'normal',
        category: 'Lubrication',
      },
      {
        id: 'ariel-oil-change',
        name: 'Frame Oil Change',
        intervalHours: 8000,
        description: 'Drain and replace frame oil. Clean strainer. Inspect sump for debris.',
        priority: 'high',
        category: 'Lubrication',
      },
      {
        id: 'ariel-valve-inspection',
        name: 'Valve Inspection',
        intervalHours: 8000,
        description: 'Remove, inspect, and rebuild or replace suction and discharge valves.',
        priority: 'high',
        category: 'Valves',
      },
      {
        id: 'ariel-packing-inspect',
        name: 'Packing Inspection',
        intervalHours: 8000,
        description: 'Inspect piston rod packing. Measure and record leak rates. Replace if needed.',
        priority: 'high',
        category: 'Packing',
      },
      {
        id: 'ariel-rod-drop',
        name: 'Rod Drop Reading',
        intervalDays: 7,
        description: 'Take rod drop proximity probe reading. Record and trend. Alert at 15 mils.',
        priority: 'high',
        category: 'Packing',
      },
      {
        id: 'ariel-cylinder-lube',
        name: 'Cylinder Lubrication Check',
        intervalDays: 1,
        description: 'Verify force-feed lubricator operation. Check sight glasses and pump cycles.',
        priority: 'high',
        category: 'Lubrication',
      },
      {
        id: 'ariel-crosshead-inspect',
        name: 'Crosshead Guide & Pin Inspection',
        intervalHours: 16000,
        description: 'Inspect crosshead guides, pin, and bushing for wear. Measure clearances.',
        priority: 'normal',
        category: 'Bearings',
      },
      {
        id: 'ariel-main-bearing',
        name: 'Main Bearing Inspection',
        intervalHours: 24000,
        description: 'Inspect main bearings. Check clearances. Replace if worn beyond limits.',
        priority: 'critical',
        category: 'Bearings',
      },
      {
        id: 'ariel-alignment',
        name: 'Compressor-Driver Alignment Check',
        intervalDays: 365,
        description: 'Check coupling alignment (angular and offset). Re-align if out of spec.',
        priority: 'normal',
        category: 'Alignment',
      },
      {
        id: 'ariel-vibration',
        name: 'Vibration Survey',
        intervalDays: 90,
        description: 'Perform vibration readings on frame, crosshead, and cylinder. Trend results.',
        priority: 'normal',
        category: 'Monitoring',
      },
      {
        id: 'ariel-foundation',
        name: 'Foundation Bolt Check',
        intervalDays: 180,
        description: 'Check and re-torque foundation and frame bolts. Inspect grout for cracks.',
        priority: 'normal',
        category: 'Foundation',
      },
    ],
  },
  {
    manufacturer: 'Dresser-Rand',
    models: ['ESH', 'HHE', 'HOS', 'HHE-VL'],
    tasks: [
      {
        id: 'dr-oil-check',
        name: 'Frame Oil Level Check',
        intervalDays: 1,
        description: 'Check frame oil level. Inspect for water or contamination.',
        priority: 'high',
        category: 'Lubrication',
      },
      {
        id: 'dr-oil-filter',
        name: 'Oil Filter Replacement',
        intervalDays: 90,
        description: 'Replace oil filter elements. Record DP readings.',
        priority: 'normal',
        category: 'Lubrication',
      },
      {
        id: 'dr-valve-service',
        name: 'Valve Service',
        intervalHours: 8000,
        description: 'Service suction and discharge valves. Inspect plates, springs, seats.',
        priority: 'high',
        category: 'Valves',
      },
      {
        id: 'dr-packing',
        name: 'Packing Replacement',
        intervalHours: 8000,
        description: 'Replace piston rod packing rings. Inspect rod for wear or scoring.',
        priority: 'high',
        category: 'Packing',
      },
      {
        id: 'dr-piston-rings',
        name: 'Piston Ring Inspection',
        intervalHours: 12000,
        description: 'Inspect and measure piston rings and rider bands. Replace as needed.',
        priority: 'high',
        category: 'Cylinders',
      },
      {
        id: 'dr-bearing-inspect',
        name: 'Bearing Inspection',
        intervalHours: 24000,
        description: 'Inspect main, crank, and crosshead bearings. Measure clearances.',
        priority: 'critical',
        category: 'Bearings',
      },
    ],
  },
];

export const TASK_CATEGORIES = [
  'Lubrication',
  'Valves',
  'Packing',
  'Bearings',
  'Cylinders',
  'Alignment',
  'Monitoring',
  'Foundation',
  'Cooling',
  'Controls',
];
