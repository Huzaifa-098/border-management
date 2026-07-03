
import React, { useEffect } from 'react';
import { StoreProvider, useStore } from './services/mockStore';
import { AppNavigationProvider, useAppNavigation } from './context/AppNavigationContext';
import { Layout } from './components/Layout';
import { ChatBot } from './components/ChatBot';
import { UserSubmission } from './components/UserSubmission';
import { EntryList } from './components/EntryList';
import { DashboardStats } from './components/DashboardStats';
import { AdminManagement } from './components/AdminManagement';
import { UserManagement } from './components/UserManagement';
import { AdminProfile, AdminSettings } from './components/AdminTools';
import { BlacklistManagement } from './components/BlacklistManagement';
import { CCTVMonitoring } from './components/CCTVMonitoring';
import { IncidentManagement } from './components/IncidentManagement';
import { AdminReporting } from './components/AdminReporting';
import { ZoomMeeting } from './components/ZoomMeeting';
import { TripTracking } from './components/TripTracking';
import { QrVerify } from './components/QrVerify';
import { BroadcastManagement } from './components/BroadcastManagement';
import { MilitaryRadio } from './components/MilitaryRadio';
import { PortalLogin, VerificationPage } from './components/Auth';
import { PortalBanner, SectionCard, FilterPills } from './components/ui';
import { FeedbackProvider } from './components/FeedbackProvider';
import { Role } from './types';

const AUTH_VIEWS = ['LOGIN', 'VERIFY'] as const;

const MainContent: React.FC = () => {
  const { currentRole, currentUser, notifications, admins, systemLogo } = useStore();
  const { view, setView, cityFilter, setCityFilter, userSection } = useAppNavigation();

  useEffect(() => {
    if (!currentUser) {
      setView('LOGIN');
    } else if (AUTH_VIEWS.includes(view as typeof AUTH_VIEWS[number])) {
      setView('DASHBOARD');
    }
  }, [currentRole, currentUser, setView, view]);

  useEffect(() => {
    const unread = notifications.filter(n => !n.read && n.actionUrl);
    if (unread.length > 0) {
      // In a real app, user clicks the notification.
    }
  }, [notifications]);

  if (view === 'LOGIN') {
    return <PortalLogin onSwitchToVerify={() => setView('VERIFY')} />;
  }
  if (view === 'VERIFY') {
    return <VerificationPage onVerified={() => setView('LOGIN')} />;
  }

  if (view === 'ZOOM') {
    return <ZoomMeeting onClose={() => setView('DASHBOARD')} />;
  }
  if (view === 'RADIO') {
    return <MilitaryRadio onClose={() => setView('DASHBOARD')} />;
  }

  return (
    <div className="space-y-6 vivid-animate-in">
      {currentRole === Role.USER && (
        <>
          <PortalBanner
            variant="traveler"
            title={`Welcome, ${(currentUser as any)?.fullName || 'Traveler'}`}
            subtitle="Submit border entry declarations. You only see your own applications and personal data."
            logoUrl={systemLogo}
          />
          <UserSubmission navSection={userSection} />
        </>
      )}

      {currentRole === Role.BORDER_OFFICER && (
        <>
          {view === 'DASHBOARD' && (
            <>
              <PortalBanner
                variant="city"
                title="Border Officer Portal"
                subtitle={`Register passengers & vehicles — data sent to ${(currentUser as any)?.city || 'City'} Admin for review.`}
                logoUrl={systemLogo}
              />
              <SectionCard title="Register New Entry" subtitle="Passenger, vehicle, driver card, or official ID" noPadding>
                <div className="px-6 pb-6">
                  <UserSubmission navSection="selection" />
                </div>
              </SectionCard>
              <SectionCard title="My Submissions" subtitle="Entries you registered" noPadding>
                <div className="px-6 pb-6">
                  <EntryList />
                </div>
              </SectionCard>
            </>
          )}
          {view === 'QR_VERIFY' && <QrVerify onBack={() => setView('DASHBOARD')} />}
          {view === 'INCIDENTS' && <IncidentManagement onBack={() => setView('DASHBOARD')} />}
          {view === 'PROFILE' && <AdminProfile onBack={() => setView('DASHBOARD')} />}
        </>
      )}

      {currentRole === Role.CITY_ADMIN && (
        <>
          {view === 'DASHBOARD' && (
            <>
              <PortalBanner
                variant="city"
                title="City Administration"
                subtitle={
                  (currentUser as any)?.assignedCity
                    ? `Managing ${(currentUser as any).assignedCity} jurisdiction — entries, users & incidents.`
                    : 'Review pending entries and verify traveler documents.'
                }
                logoUrl={systemLogo}
              />

              <DashboardStats onStatClick={stat => {
                if (stat === 'TOTAL_USERS') setView('USER_MANAGEMENT');
              }} />

              <SectionCard
                title="Pending Entries"
                subtitle="Tap a photo or card to review — 5 shown by default"
                color="cyan"
                noPadding
              >
                <div className="p-4">
                  <EntryList cityFilter={cityFilter} previewLimit={5} logoUrl={systemLogo} />
                </div>
              </SectionCard>
            </>
          )}
          {view === 'REPORTING' && <AdminReporting onBack={() => setView('DASHBOARD')} />}
          {view === 'TRIPS' && <TripTracking onBack={() => setView('DASHBOARD')} />}
          {view === 'QR_VERIFY' && <QrVerify onBack={() => setView('DASHBOARD')} />}
          {view === 'USER_MANAGEMENT' && <UserManagement onBack={() => setView('DASHBOARD')} />}
          {view === 'CCTV' && <CCTVMonitoring onBack={() => setView('DASHBOARD')} />}
          {view === 'INCIDENTS' && <IncidentManagement onBack={() => setView('DASHBOARD')} />}
          {view === 'BROADCASTS' && <BroadcastManagement onBack={() => setView('DASHBOARD')} />}
          {view === 'PROFILE' && <AdminProfile onBack={() => setView('DASHBOARD')} />}
          {view === 'SETTINGS' && <AdminSettings onBack={() => setView('DASHBOARD')} />}
        </>
      )}

      {currentRole === Role.SUPER_ADMIN && (
        <>
          {view === 'DASHBOARD' && (
            <>
              <PortalBanner
                variant="super"
                title="National Command Center"
                subtitle="System-wide oversight, regional control, blacklist & final approvals."
                logoUrl={systemLogo}
              />

              <DashboardStats
                onStatClick={stat => {
                  if (stat === 'TOTAL_USERS') setView('USER_MANAGEMENT');
                  if (stat === 'TOTAL_CITY_ADMINS') setView('ADMIN_MANAGEMENT');
                  if (stat === 'BLACKLIST') setView('BLACKLIST_MANAGEMENT');
                }}
              />

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Filter by Region</p>
                <FilterPills
                  options={[
                    { value: 'ALL', label: 'All Regions' },
                    ...Array.from(
                      new Set(admins.filter((a) => a.role === Role.CITY_ADMIN && a.assignedCity).map((a) => a.assignedCity!))
                    ).map((city) => ({ value: city, label: city })),
                  ]}
                  value={cityFilter}
                  onChange={setCityFilter}
                />
              </div>

              <SectionCard
                title="Entries Requiring Approval"
                subtitle={cityFilter !== 'ALL' ? `Region: ${cityFilter}` : 'All jurisdictions — tap photo to review'}
                color="orange"
                noPadding
              >
                <div className="p-4">
                  <EntryList cityFilter={cityFilter} previewLimit={5} logoUrl={systemLogo} />
                </div>
              </SectionCard>
            </>
          )}
          {view === 'REPORTING' && <AdminReporting onBack={() => setView('DASHBOARD')} />}
          {view === 'TRIPS' && <TripTracking onBack={() => setView('DASHBOARD')} />}
          {view === 'QR_VERIFY' && <QrVerify onBack={() => setView('DASHBOARD')} />}
          {view === 'ADMIN_MANAGEMENT' && <AdminManagement onBack={() => setView('DASHBOARD')} />}
          {view === 'USER_MANAGEMENT' && <UserManagement onBack={() => setView('DASHBOARD')} />}
          {view === 'BLACKLIST_MANAGEMENT' && <BlacklistManagement onBack={() => setView('DASHBOARD')} />}
          {view === 'CCTV' && <CCTVMonitoring onBack={() => setView('DASHBOARD')} />}
          {view === 'INCIDENTS' && <IncidentManagement onBack={() => setView('DASHBOARD')} />}
          {view === 'BROADCASTS' && <BroadcastManagement onBack={() => setView('DASHBOARD')} />}
          {view === 'PROFILE' && <AdminProfile onBack={() => setView('DASHBOARD')} />}
          {view === 'SETTINGS' && <AdminSettings onBack={() => setView('DASHBOARD')} />}
        </>
      )}
    </div>
  );
};

const AppShell: React.FC = () => {
  const { currentUser } = useStore();
  const { view } = useAppNavigation();
  const isAuthScreen = !currentUser || AUTH_VIEWS.includes(view as typeof AUTH_VIEWS[number]);
  const isFullScreenOverlay = view === 'ZOOM' || view === 'RADIO';

  if (isAuthScreen || isFullScreenOverlay) {
    return (
      <>
        <MainContent />
        {currentUser && !isAuthScreen && !isFullScreenOverlay && <ChatBot />}
      </>
    );
  }

  return (
    <>
      <Layout>
        <MainContent />
      </Layout>
      <ChatBot />
    </>
  );
};

const App: React.FC = () => {
  return (
    <StoreProvider>
      <FeedbackProvider>
        <AppNavigationProvider>
          <AppShell />
        </AppNavigationProvider>
      </FeedbackProvider>
    </StoreProvider>
  );
};

export default App;
