export default function Onboarding({ ob, accent }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
      <div style={{
        width: 520, background: 'rgba(255,255,255,.5)', border: '1px solid rgba(255,255,255,.75)',
        backdropFilter: 'blur(16px)', borderRadius: 24, padding: '44px 48px', animation: 'loopPop .45s ease'
      }}>

        {ob.step1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ font: '900 34px Nunito,sans-serif', letterSpacing: '-.02em' }}>looped</div>
            <div style={{ font: '800 24px/1.25 Nunito,sans-serif' }}>your friends are already out there. tag along. ☀️</div>
            <div style={{ font: '15px/1.55 Karla,sans-serif', color: 'rgba(58,44,40,.65)' }}>let's set you up — this is how friends will find you.</div>
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ font: '700 12.5px Karla,sans-serif', color: 'rgba(58,44,40,.6)' }}>first name</label>
                <input value={ob.obFirst} onChange={ob.setObFirst} placeholder="jane" style={inputStyle} />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ font: '700 12.5px Karla,sans-serif', color: 'rgba(58,44,40,.6)' }}>last name</label>
                <input value={ob.obLast} onChange={ob.setObLast} placeholder="doe" style={inputStyle} />
              </div>
            </div>
            {ob.hasName && (
              <div style={{ font: '600 12.5px Karla,sans-serif', color: 'rgba(58,44,40,.55)', marginTop: -4 }}>
                friends will see you as <b style={{ color: '#3a2c28' }}>{ob.previewName}</b>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 2 }}>
              <label style={{ font: '700 12.5px Karla,sans-serif', color: 'rgba(58,44,40,.6)' }}>phone number</label>
              <input
                value={ob.obPhone} onChange={ob.setObPhone} onKeyDown={ob.nameKeyDown}
                inputMode="tel" placeholder="(555) 123-4567" style={inputStyle}
              />
              <div style={{ font: '12px Karla,sans-serif', color: 'rgba(58,44,40,.5)' }}>friends can add you by number. we'll never post it.</div>
            </div>
            <button onClick={ob.next} style={{ ...primaryBtn(accent), marginTop: 6 }}>let's go</button>
          </div>
        )}

        {ob.step2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ font: '800 24px/1.25 Nunito,sans-serif' }}>your people 💛</div>
            <div style={{ font: '14px Karla,sans-serif', color: 'rgba(58,44,40,.65)' }}>a few friends are already on looped. add them so their days show up on your board.</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
              {ob.friendsList.map(fr => (
                <div key={fr.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,.55)', borderRadius: 14, padding: '10px 14px' }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: fr.color, display: 'grid', placeItems: 'center', font: '800 13px Nunito,sans-serif', color: '#fff', flex: 'none' }}>{fr.initial}</div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ font: '800 14px Nunito,sans-serif' }}>{fr.name}</div>
                    <div style={{ font: '12px Karla,sans-serif', color: 'rgba(58,44,40,.55)' }}>{fr.bio}</div>
                  </div>
                  <button onClick={fr.toggle} style={{ marginLeft: 'auto', cursor: 'pointer', border: 'none', background: fr.btnBg, color: fr.btnColor, font: '800 12px Nunito,sans-serif', padding: '8px 15px', borderRadius: 999 }}>{fr.btnLabel}</button>
                </div>
              ))}
            </div>
            <button onClick={ob.finish} style={{ ...primaryBtn(accent), marginTop: 8 }}>take me to today</button>
          </div>
        )}

        <div style={{ display: 'flex', gap: 7, justifyContent: 'center', marginTop: 26 }}>
          {ob.dots.map((dot, i) => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: dot.bg }} />
          ))}
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  border: '1px solid rgba(58,44,40,.2)', background: 'rgba(255,255,255,.7)', borderRadius: 12,
  padding: '13px 16px', font: '600 15px Karla,sans-serif', color: '#3a2c28'
};

function primaryBtn(accent) {
  return {
    border: 'none', cursor: 'pointer', background: accent, color: '#fff', font: '800 15px Nunito,sans-serif',
    padding: '14px 22px', borderRadius: 999, boxShadow: '0 3px 12px rgba(255,138,92,.4)'
  };
}
