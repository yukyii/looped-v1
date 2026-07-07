const ARROW_BG = "url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2210%22 height=%226%22 viewBox=%220 0 10 6%22><path d=%22M1 1l4 4 4-4%22 stroke=%22%233a2c28%22 stroke-width=%221.5%22 fill=%22none%22 stroke-linecap=%22round%22/></svg>')";

const selectStyle = {
  appearance: 'none',
  border: '1px solid rgba(58,44,40,.2)',
  background: `#fff ${ARROW_BG} no-repeat right 16px center`,
  borderRadius: 12,
  padding: '12px 42px 12px 14px',
  font: '600 14px Karla,sans-serif',
  color: '#3a2c28'
};

const textInputStyle = {
  border: '1px solid rgba(58,44,40,.2)', background: '#fff', borderRadius: 12,
  padding: '12px 15px', font: '600 14px Karla,sans-serif', color: '#3a2c28'
};

export default function Composer({ composer, accent, isMobile }) {
  if (!composer.open) return null;
  const panelStyle = isMobile
    ? { width: '100%', maxWidth: '100%', maxHeight: '92vh', overflowY: 'auto', boxSizing: 'border-box', background: 'rgba(255,251,246,.97)', borderTop: '1px solid rgba(255,255,255,.9)', backdropFilter: 'blur(20px)', borderRadius: '24px 24px 0 0', padding: '12px 20px 24px', animation: 'loopSheetUp .32s cubic-bezier(.2,.8,.2,1)' }
    : { width: 480, background: 'rgba(255,251,246,.92)', border: '1px solid rgba(255,255,255,.9)', backdropFilter: 'blur(20px)', borderRadius: 22, padding: '30px 32px', animation: 'loopPop .35s ease' };
  return (
    <div onClick={composer.close} style={{ position: 'fixed', inset: 0, background: 'rgba(58,44,40,.25)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center', zIndex: 55 }}>
      <div onClick={(e) => e.stopPropagation()} style={panelStyle}>
        {isMobile && <div style={{ width: 42, height: 5, borderRadius: 999, background: 'rgba(58,44,40,.2)', margin: '2px auto 14px' }} />}
        <div style={{ font: '800 21px Nunito,sans-serif' }}>what are you up to?</div>
        <div style={{ display: 'flex', gap: 6, marginTop: 14, flexWrap: 'nowrap' }}>
          {composer.emojiChips.map((em, i) => (
            <button key={i} onClick={em.pick} style={{ flex: 1, minWidth: 0, cursor: 'pointer', border: '1.5px solid ' + em.border, background: em.bg, fontSize: 16, padding: '7px 0', borderRadius: 10 }}>{em.char}</button>
          ))}
          <input
            value={composer.customEmoji.value}
            onChange={composer.customEmoji.set}
            size={1}
            inputMode="text"
            aria-label="pick your own emoji"
            placeholder="😀"
            style={{
              flex: 1, minWidth: 0, width: 0, boxSizing: 'border-box', textAlign: 'center', cursor: 'pointer',
              border: '1.5px ' + (composer.customEmoji.active ? 'solid ' + accent : 'dashed rgba(255,138,92,.7)'),
              background: composer.customEmoji.active ? 'rgba(255,138,92,.2)' : 'rgba(255,138,92,.08)',
              fontSize: 16, padding: '7px 0', borderRadius: 10, color: '#3a2c28'
            }}
          />
        </div>
        <div style={{ font: '600 11px Karla,sans-serif', color: 'rgba(58,44,40,.5)', marginTop: 7 }}>tap 😀 to use any emoji from your keyboard</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
          <input value={composer.cTitle} onChange={composer.setCTitle} placeholder="grabbing boba, pickup soccer, library grind…" style={textInputStyle} />
          <input value={composer.cPlace} onChange={composer.setCPlace} placeholder="where?" style={textInputStyle} />
          <input value={composer.cNote} onChange={composer.setCNote} placeholder="leave a note for friends (optional)" style={textInputStyle} />
          <select value={composer.cDate} onChange={composer.setCDate} style={selectStyle}>
            {composer.dateOptions.map(dt => <option key={dt.value} value={dt.value}>{dt.label}</option>)}
          </select>
          <div style={{ display: 'flex', gap: 10 }}>
            <select value={composer.cTime} onChange={composer.setCTime} style={{ ...selectStyle, flex: 1 }}>
              {composer.timeOptions.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <select value={composer.cSpots} onChange={composer.setCSpots} style={{ ...selectStyle, flex: 1 }}>
              {composer.spotsOptions.map(sp => <option key={sp.value} value={sp.value}>{sp.label}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={composer.postActivity} style={{ cursor: 'pointer', border: 'none', background: accent, color: '#fff', font: '800 14px Nunito,sans-serif', padding: '13px 22px', borderRadius: 999, boxShadow: '0 3px 12px rgba(255,138,92,.4)' }}>post it</button>
          <button onClick={composer.close} style={{ cursor: 'pointer', border: 'none', background: 'rgba(58,44,40,.08)', color: '#3a2c28', font: '800 14px Nunito,sans-serif', padding: '13px 20px', borderRadius: 999 }}>never mind</button>
        </div>
      </div>
    </div>
  );
}
