import { useLoopedApp } from './useLoopedApp.js';
import { useIsMobile } from './useIsMobile.js';
import Onboarding from './components/Onboarding.jsx';
import NavBar from './components/NavBar.jsx';
import TodayBoard from './components/TodayBoard.jsx';
import Pings from './components/Pings.jsx';
import Friends from './components/Friends.jsx';
import Profile from './components/Profile.jsx';
import EventDetail from './components/EventDetail.jsx';
import Composer from './components/Composer.jsx';
import Toast from './components/Toast.jsx';

export default function App() {
  const app = useLoopedApp();
  const isMobile = useIsMobile();

  return (
    <div style={{ minHeight: '100vh', background: app.bgGradient, color: '#3a2c28', transition: 'background 1.2s ease' }}>
      {app.isOnboarding ? (
        <Onboarding ob={app.onboarding} accent={app.accent} isMobile={isMobile} />
      ) : (
        <>
          <NavBar nav={app.nav} accent={app.accent} isMobile={isMobile} />
          {/* clear the fixed bottom tab bar on mobile */}
          <div style={{ paddingBottom: isMobile ? 72 : 0 }}>
            {app.view === 'today' && <TodayBoard today={app.today} accent={app.accent} isMobile={isMobile} />}
            {app.view === 'pings' && <Pings pings={app.pings} accent={app.accent} />}
            {app.view === 'friends' && <Friends friends={app.friends} accent={app.accent} isMobile={isMobile} />}
            {app.view === 'you' && <Profile profile={{ ...app.profile, goToday: app.nav.goToday }} />}
          </div>
        </>
      )}

      <EventDetail detail={app.detail} isMobile={isMobile} />
      <Composer composer={app.composer} accent={app.accent} isMobile={isMobile} />
      <Toast toast={app.toast} isMobile={isMobile} />
    </div>
  );
}
