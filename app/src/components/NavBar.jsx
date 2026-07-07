const TAB_ICONS = { today: '🏠', friends: '🪐', pings: '🔔', you: '🙂' };

export default function NavBar({ nav, accent, isMobile }) {
  if (isMobile) {
    return (
      <>
        {/* slim top bar */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '16px 18px 8px' }}>
          <div style={{ font: '900 20px Nunito,sans-serif', letterSpacing: '-.02em', cursor: 'pointer' }} onClick={nav.goToday}>looped</div>
          <div onClick={nav.goYou} style={{ marginLeft: 'auto', width: 33, height: 33, borderRadius: '50%', background: '#ffb37e', display: 'grid', placeItems: 'center', font: '800 13px Nunito,sans-serif', color: '#fff', cursor: 'pointer' }}>{nav.yourInitial}</div>
        </div>

        {/* fixed bottom tab bar */}
        <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, height: 64, display: 'flex', alignItems: 'center', background: 'rgba(255,251,246,.88)', backdropFilter: 'blur(14px)', borderTop: '1px solid rgba(58,44,40,.1)', zIndex: 40 }}>
          {nav.tabs.map(tab => (
            <button
              key={tab.key}
              onClick={tab.go}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, border: 'none', background: 'none', cursor: 'pointer', padding: 0, font: (tab.active ? '800' : '700') + ' 10.5px Karla,sans-serif', color: tab.active ? '#3a2c28' : 'rgba(58,44,40,.5)' }}
            >
              <span style={{ fontSize: 20, lineHeight: 1, position: 'relative' }}>
                {TAB_ICONS[tab.key]}
                {tab.dot && <span style={{ position: 'absolute', top: -2, right: -6, width: 7, height: 7, borderRadius: '50%', background: accent }} />}
              </span>
              {tab.label}
            </button>
          ))}
        </div>
      </>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 26, padding: '20px 44px 8px' }}>
      <div style={{ font: '900 24px Nunito,sans-serif', letterSpacing: '-.02em', cursor: 'pointer' }} onClick={nav.goToday}>looped</div>
      <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
        {nav.tabs.map(tab => (
          <button
            key={tab.key}
            onClick={tab.go}
            style={{
              cursor: 'pointer', border: 'none', background: 'none', padding: '4px 2px',
              font: (tab.active ? '700' : '600') + ' 14px Karla,sans-serif',
              color: tab.active ? '#3a2c28' : 'rgba(58,44,40,.55)',
              borderBottom: '2px solid ' + (tab.active ? '#3a2c28' : 'transparent'),
              display: 'flex', alignItems: 'center', gap: 5
            }}
          >
            {tab.label}
            {tab.dot && <span style={{ width: 7, height: 7, borderRadius: '50%', background: accent, display: 'inline-block' }} />}
          </button>
        ))}
      </div>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ font: '600 13px Karla,sans-serif', color: 'rgba(58,44,40,.55)' }}>{nav.clockLine}</div>
        <div onClick={nav.goYou} style={{ width: 34, height: 34, borderRadius: '50%', background: '#ffb37e', display: 'grid', placeItems: 'center', font: '800 13px Nunito,sans-serif', color: '#fff', cursor: 'pointer' }}>{nav.yourInitial}</div>
      </div>
    </div>
  );
}
