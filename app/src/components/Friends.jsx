import { useState } from 'react';
import { fmtTime } from '../lib/time.js';

// ring geometry (px, measured from the center of the stage)
const INNER_R = 104;
const OUTER_R = 182;
const STAGE_H = 420;        // sized to fit the orbit with breathing room
const HALF = STAGE_H / 2;

// lay a list of friends out around a ring, evenly spaced from a start angle
function ring(list, radius, startDeg) {
  const n = list.length || 1;
  return list.map((f, i) => {
    const a = (startDeg + i * (360 / n)) * Math.PI / 180;
    return { ...f, x: Math.cos(a) * radius, y: Math.sin(a) * radius };
  });
}

function activityLine(f) {
  if (f.outNow && f.activity) return 'out now · ' + f.activity.emoji + ' ' + f.activity.what;
  if (f.activity) return 'later · ' + f.activity.emoji + ' ' + f.activity.what + ' · ' + fmtTime(f.activity.hour);
  return 'around today';
}

export default function Friends({ friends, accent }) {
  const [selectedId, setSelectedId] = useState(null);

  const outer = ring(friends.cards.filter(f => f.outNow), OUTER_R, -50);
  const inner = ring(friends.cards.filter(f => !f.outNow), INNER_R, -90);
  const nodes = [...inner, ...outer];
  const selected = friends.cards.find(f => f.id === selectedId) || null;

  return (
    <div style={{ padding: '18px 44px 60px', maxWidth: 880, margin: '0 auto' }}>
      <div style={{ font: '800 32px Nunito,sans-serif' }}>your people</div>
      <div style={{ font: '14px Karla,sans-serif', color: 'rgba(58,44,40,.6)', marginTop: 5 }}>{friends.countLine}</div>

      <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            value={friends.query} onChange={friends.setQuery} onKeyDown={friends.inviteKeyDown}
            inputMode="tel" placeholder="add a friend by phone number…"
            style={{ flex: 1, border: '1px solid rgba(58,44,40,.2)', background: 'rgba(255,255,255,.6)', borderRadius: 999, padding: '12px 18px', font: '600 14px Karla,sans-serif', color: '#3a2c28' }}
          />
          <button onClick={friends.sendInvite} style={{ cursor: 'pointer', border: 'none', background: accent, color: '#fff', font: '800 13.5px Nunito,sans-serif', padding: '12px 20px', borderRadius: 999 }}>invite</button>
        </div>
        {friends.contactsLinked ? (
          <>
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                value={friends.contactQuery} onChange={friends.setContactQuery} onKeyDown={friends.searchKeyDown}
                placeholder="search your contacts by name…"
                style={{ flex: 1, border: '1px solid rgba(58,44,40,.2)', background: 'rgba(255,255,255,.6)', borderRadius: 999, padding: '12px 18px', font: '600 14px Karla,sans-serif', color: '#3a2c28' }}
              />
              <button onClick={friends.searchContacts} style={{ cursor: 'pointer', border: '1.5px solid rgba(58,44,40,.25)', background: 'none', color: '#3a2c28', font: '800 13.5px Nunito,sans-serif', padding: '12px 20px', borderRadius: 999 }}>search</button>
            </div>
            <div style={{ font: '600 12px Karla,sans-serif', color: 'rgba(58,44,40,.5)' }}>📇 contacts linked — search by name is on</div>
          </>
        ) : (
          <button onClick={friends.linkContacts} style={{ cursor: 'pointer', border: '1.5px dashed rgba(58,44,40,.28)', background: 'rgba(255,255,255,.4)', color: '#3a2c28', font: '700 13px Karla,sans-serif', padding: '11px 18px', borderRadius: 999, alignSelf: 'flex-start' }}>📇 link contacts to search friends by name</button>
        )}
      </div>

      {/* orbit stage */}
      <div
        onClick={() => setSelectedId(null)}
        style={{ position: 'relative', height: STAGE_H, marginTop: 16 }}
      >
        {/* ring guides */}
        <svg
          viewBox={`${-HALF} ${-HALF} ${STAGE_H} ${STAGE_H}`} width={STAGE_H} height={STAGE_H}
          style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', maxWidth: '100%', overflow: 'visible', pointerEvents: 'none' }}
        >
          <circle cx="0" cy="0" r={INNER_R} fill="none" stroke="rgba(58,44,40,.3)" strokeWidth="1.5" strokeDasharray="2 6" />
          <circle cx="0" cy="0" r={OUTER_R} fill="none" stroke="rgba(58,44,40,.3)" strokeWidth="1.5" strokeDasharray="2 6" />
        </svg>

        {/* you, at the center */}
        <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, pointerEvents: 'none' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#ffb37e', display: 'grid', placeItems: 'center', font: '800 24px Nunito,sans-serif', color: '#fff', boxShadow: '0 6px 20px rgba(255,138,92,.5), 0 0 0 6px rgba(255,255,255,.4)' }}>{friends.yourInitial}</div>
          <div style={{ font: '800 10px Nunito,sans-serif', letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(58,44,40,.5)' }}>you</div>
        </div>

        {/* friend nodes */}
        {nodes.map(f => {
          const size = f.outNow ? 48 : 42;
          return (
            <button
              key={f.id}
              className={'orbit-node' + (f.id === selectedId ? ' selected' : '')}
              onClick={(e) => { e.stopPropagation(); setSelectedId(f.id === selectedId ? null : f.id); }}
              aria-label={f.name + (f.outNow ? ', out right now' : '')}
              style={{ left: '50%', top: '50%', transform: `translate(calc(-50% + ${f.x}px), calc(-50% + ${f.y}px))` }}
            >
              <span
                className={'orbit-av' + (f.outNow ? ' out' : '')}
                style={{ width: size, height: size, background: f.color, font: '800 ' + (f.outNow ? 17 : 15) + 'px Nunito,sans-serif', opacity: f.outNow ? 1 : 0.86 }}
              >
                {f.initial}
              </span>
              {f.outNow && (
                <span style={{ position: 'absolute', top: -4, right: -4, width: 20, height: 20, borderRadius: '50%', background: '#fff', display: 'grid', placeItems: 'center', fontSize: 11, boxShadow: '0 2px 6px rgba(58,44,40,.25)' }}>{f.activity ? f.activity.emoji : '✨'}</span>
              )}
              <span style={{ position: 'absolute', left: '50%', top: '100%', transform: 'translateX(-50%)', marginTop: 4, font: '700 11px Karla,sans-serif', color: 'rgba(58,44,40,.7)', whiteSpace: 'nowrap' }}>{f.name.split(' ')[0]}</span>
            </button>
          );
        })}

      </div>

      {/* detail sheet — reserved slot below the orbit so it never overlaps a node */}
      <div style={{ minHeight: 88, display: 'flex', justifyContent: 'center' }}>
        {selected && (
          <div
            style={{ width: 380, maxWidth: '100%', boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 13, background: 'rgba(255,251,246,.94)', border: '1px solid rgba(255,255,255,.9)', backdropFilter: 'blur(14px)', borderRadius: 18, padding: '14px 16px', boxShadow: '0 12px 30px -12px rgba(58,44,40,.45)', animation: 'loopSheet .3s ease' }}
          >
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: selected.color, display: 'grid', placeItems: 'center', font: '800 16px Nunito,sans-serif', color: '#fff', flex: 'none' }}>{selected.initial}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ font: '800 15px Nunito,sans-serif' }}>{selected.name}</div>
              <div style={{ font: '700 11.5px Karla,sans-serif', color: selected.outNow ? accent : 'rgba(58,44,40,.55)', marginTop: 1 }}>{activityLine(selected)}</div>
              <div style={{ font: '400 12px/1.4 Karla,sans-serif', color: 'rgba(58,44,40,.6)', marginTop: 3 }}>{selected.bio}</div>
            </div>
            <button onClick={() => setSelectedId(null)} aria-label="close" style={{ marginLeft: 'auto', flex: 'none', border: 'none', cursor: 'pointer', width: 26, height: 26, borderRadius: '50%', background: 'rgba(58,44,40,.09)', color: '#3a2c28', font: '800 12px Nunito,sans-serif' }}>✕</button>
          </div>
        )}
      </div>
    </div>
  );
}
