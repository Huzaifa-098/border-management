import React, { createContext, useContext, useState, ReactNode } from 'react';

export type AppView =
  | 'DASHBOARD'
  | 'USER_MANAGEMENT'
  | 'ADMIN_MANAGEMENT'
  | 'BLACKLIST_MANAGEMENT'
  | 'LOGIN'
  | 'VERIFY'
  | 'CITY_ADMIN_LOGIN'
  | 'SUPER_ADMIN_LOGIN'
  | 'PROFILE'
  | 'SETTINGS'
  | 'CCTV'
  | 'INCIDENTS'
  | 'ZOOM'
  | 'RADIO'
  | 'REPORTING'
  | 'TRIPS'
  | 'QR_VERIFY'
  | 'BROADCASTS';

export type UserPortalSection =
  | 'dashboard'
  | 'selection'
  | 'profile'
  | 'settings'
  | 'incident';

interface AppNavigationContextType {
  view: AppView;
  setView: (view: AppView) => void;
  userSection: UserPortalSection;
  setUserSection: (section: UserPortalSection) => void;
  cityFilter: string;
  setCityFilter: (city: string) => void;
}

const AppNavigationContext = createContext<AppNavigationContextType | undefined>(undefined);

export const AppNavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [view, setView] = useState<AppView>('LOGIN');
  const [userSection, setUserSection] = useState<UserPortalSection>('dashboard');
  const [cityFilter, setCityFilter] = useState<string>('ALL');

  return (
    <AppNavigationContext.Provider
      value={{ view, setView, userSection, setUserSection, cityFilter, setCityFilter }}
    >
      {children}
    </AppNavigationContext.Provider>
  );
};

export const useAppNavigation = () => {
  const ctx = useContext(AppNavigationContext);
  if (!ctx) throw new Error('useAppNavigation must be used within AppNavigationProvider');
  return ctx;
};
