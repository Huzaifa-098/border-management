import { Role } from '../types';

export type PortalKey = 'traveler' | 'border_officer' | 'city_admin' | 'super_admin';

export const DEMO_PORTALS: Record<
  PortalKey,
  { role: Role; label: string; subtitle: string; email: string; password: string }
> = {
  traveler: {
    role: Role.USER,
    label: 'Traveler',
    subtitle: 'Submit border entries',
    email: 'ahmed@example.com',
    password: 'password123',
  },
  border_officer: {
    role: Role.BORDER_OFFICER,
    label: 'Border Officer',
    subtitle: 'Register passengers & vehicles',
    email: 'officer.garowe@pbms.so',
    password: 'officer123',
  },
  city_admin: {
    role: Role.CITY_ADMIN,
    label: 'City Admin',
    subtitle: 'Regional oversight',
    email: 'admin.garowe@pbms.so',
    password: 'admin123',
  },
  super_admin: {
    role: Role.SUPER_ADMIN,
    label: 'Super Admin',
    subtitle: 'National command',
    email: 'super@pbms.so',
    password: 'super123',
  },
};
