import { Student } from './types';

// Define types locally as they are missing from the global types file
export enum FieldStatus {
  ACTIVE = 'Active',
  MAINTENANCE = 'Maintenance'
}

export interface OilField {
  id: string;
  name: string;
  location: string;
  dailyProduction: number;
  targetProduction: number;
  status: FieldStatus;
  pressure: number;
  temperature: number;
}

export interface Vehicle {
  id: string;
  type: string;
  driver: string;
  status: string;
  location: string;
  destination: string;
  capacity: number;
  load: number;
}

export interface InventoryItem {
  id: string;
  warehouse: string;
  type: string;
  quantity: number;
  capacity: number;
  unit: string;
  lastChecked: string;
  status: string;
}

export interface SafetyIncident {
  id: string;
  date: string;
  type: string;
  description: string;
  location: string;
  status: string;
  severity: string;
  reportedBy: string;
}

export interface Alert {
    id: string;
    severity: string;
    message: string;
    timestamp: string;
    module: string;
}

export const MOCK_FIELDS: OilField[] = [
  {
    id: 'F-101',
    name: 'North Sea Alpha',
    location: 'Offshore Block 4',
    dailyProduction: 12500,
    targetProduction: 15000,
    status: FieldStatus.ACTIVE,
    pressure: 2200,
    temperature: 85,
  },
  {
    id: 'F-102',
    name: 'Desert Sands Bravo',
    location: 'Sector 7G',
    dailyProduction: 8900,
    targetProduction: 9000,
    status: FieldStatus.ACTIVE,
    pressure: 1800,
    temperature: 92,
  },
  {
    id: 'F-103',
    name: 'Highland Charlie',
    location: 'Region North',
    dailyProduction: 0,
    targetProduction: 5000,
    status: FieldStatus.MAINTENANCE,
    pressure: 100,
    temperature: 20,
  },
];

export const MOCK_FLEET: Vehicle[] = [
  {
    id: 'V-001',
    type: 'Tanker',
    driver: 'John Smith',
    status: 'En Route',
    location: 'Highway 95',
    destination: 'Refinery A',
    capacity: 30000,
    load: 28000,
  },
  {
    id: 'V-002',
    type: 'Tanker',
    driver: 'Sarah Connor',
    status: 'Loading',
    location: 'Warehouse 1',
    destination: 'Pending',
    capacity: 30000,
    load: 5000,
  },
  {
    id: 'V-003',
    type: 'Maintenance',
    driver: 'Mike Ross',
    status: 'Maintenance',
    location: 'Garage',
    destination: 'N/A',
    capacity: 0,
    load: 0,
  },
  {
    id: 'V-004',
    type: 'Survey',
    driver: 'Elena Fisher',
    status: 'Idle',
    location: 'Sector 7G',
    destination: 'Base Camp',
    capacity: 0,
    load: 0,
  },
];

export const MOCK_INVENTORY: InventoryItem[] = [
  {
    id: 'I-001',
    warehouse: 'Central Storage',
    type: 'Crude',
    quantity: 450000,
    capacity: 500000,
    unit: 'Barrels',
    lastChecked: '2023-10-26',
    status: 'Normal'
  },
  {
    id: 'I-002',
    warehouse: 'Distribution Hub A',
    type: 'Refined',
    quantity: 12000,
    capacity: 100000,
    unit: 'Barrels',
    lastChecked: '2023-10-27',
    status: 'Low'
  },
  {
    id: 'I-003',
    warehouse: 'Maintenance Depot',
    type: 'Equipment',
    quantity: 45,
    capacity: 50,
    unit: 'Units',
    lastChecked: '2023-10-25',
    status: 'Normal'
  },
  {
    id: 'I-004',
    warehouse: 'Coastal Terminal',
    type: 'Diesel',
    quantity: 5000,
    capacity: 80000,
    unit: 'Barrels',
    lastChecked: '2023-10-27',
    status: 'Critical'
  },
];

export const MOCK_SAFETY_INCIDENTS: SafetyIncident[] = [
    {
        id: 'S-2023-089',
        date: '2023-10-25',
        type: 'Equipment Failure',
        description: 'Valve malfunction in Sector 7G leading to minor pressure drop.',
        location: 'Desert Sands Bravo',
        status: 'Investigating',
        severity: 'Medium',
        reportedBy: 'Op. J. Doe'
    },
    {
        id: 'S-2023-090',
        date: '2023-10-27',
        type: 'Near Miss',
        description: 'Vehicle V-001 nearly collided with gate structure due to low visibility.',
        location: 'Highway 95 Checkpoint',
        status: 'Resolved',
        severity: 'Low',
        reportedBy: 'Driver J. Smith'
    }
];

export const MOCK_ALERTS: Alert[] = [
  {
    id: 'A-1',
    severity: 'critical',
    message: 'Pressure spike detected in Field F-101',
    timestamp: '10 mins ago',
    module: 'Production',
  },
  {
    id: 'A-2',
    severity: 'medium',
    message: 'Low stock warning: Distribution Hub A',
    timestamp: '1 hour ago',
    module: 'Inventory',
  },
  {
    id: 'A-3',
    severity: 'low',
    message: 'Vehicle V-003 due for scheduled service',
    timestamp: '2 hours ago',
    module: 'Fleet',
  },
  {
    id: 'A-4',
    severity: 'high',
    message: 'Critical low level: Diesel at Coastal Terminal',
    timestamp: '30 mins ago',
    module: 'Inventory',
  }
];

export const MOCK_STUDENTS: Student[] = [
  {
    id: '1',
    admissionNo: 'ST-001',
    name: 'John Doe',
    class: '10th Grade',
    section: 'A',
    dob: '2008-05-15',
    gender: 'Male',
    guardianPhone: '+1234567890',
    status: 'Active'
  },
  {
    id: '2',
    admissionNo: 'ST-002',
    name: 'Jane Smith',
    class: '10th Grade',
    section: 'B',
    dob: '2008-08-22',
    gender: 'Female',
    guardianPhone: '+1987654321',
    status: 'Active'
  },
  {
    id: '3',
    admissionNo: 'ST-003',
    name: 'Michael Johnson',
    class: '11th Grade',
    section: 'A',
    dob: '2007-11-02',
    gender: 'Male',
    guardianPhone: '+1122334455',
    status: 'Inactive'
  }
];