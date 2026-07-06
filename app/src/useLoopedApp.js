import { useEffect, useRef, useState } from 'react';
import { friends, friendById, baseActivities, weekActivities } from './lib/data.js';
import { nowHour, modeForHour, gradientForMode, fmtTime, dayLabel, clockLine as clockLineFor } from './lib/time.js';

const ACCENT = '#ff8a5c';
const STORAGE_KEY = 'looped_state';
const LEGACY_STORAGE_KEY = 'tether_state';

function initialState() {
  return {
    view: 'today',
    name: '', last: '', phone: '', bio: '',
    onboarded: false,
    obStep: 1,
    obFirst: '', obLast: '', obPhone: '',
    obAdded: ['kat', 'maya', 'dev', 'priya'],
    joins: {},
    gone: {},
    posts: [],
    composerOpen: false,
    cTitle: '', cPlace: '', cNote: '', cDate: '0', cTime: '', cSpots: '0', cEmoji: '',
    toast: '',
    pingsRead: false,
    friendQuery: '', contactQuery: '', contactsLinked: false,
    skyOverride: 'auto',
    detailId: null,
    nowTick: Date.now()
  };
}

export function useLoopedApp() {
  const [state, setStateRaw] = useState(initialState);
  const toastTimer = useRef(null);

  function setState(patch) {
    setStateRaw(prev => ({ ...prev, ...(typeof patch === 'function' ? patch(prev) : patch) }));
  }

  // ---------- load on mount + live clock ----------
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY) || '{}');
      setState({
        name: saved.name || '',
        last: saved.last || '', phone: saved.phone || '', bio: saved.bio || '',
        onboarded: !!saved.onboarded,
        view: saved.onboarded ? 'today' : 'onboarding',
        joins: saved.joins || {},
        posts: saved.posts || [],
        skyOverride: saved.skyOverride || 'auto'
      });
    } catch (e) {
      setState({ view: 'onboarding' });
    }
    const clock = setInterval(() => setState({ nowTick: Date.now() }), 30000);
    return () => clearInterval(clock);
  }, []);

  // ---------- persist ----------
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        name: state.name, last: state.last, phone: state.phone, bio: state.bio,
        onboarded: state.onboarded, joins: state.joins, posts: state.posts, skyOverride: state.skyOverride
      }));
    } catch (e) { /* ignore */ }
  }, [state.name, state.last, state.phone, state.bio, state.onboarded, state.joins, state.posts, state.skyOverride]);

  function toast(msg) {
    setState({ toast: msg });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setState({ toast: '' }), 2600);
  }
  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

  // ---------- time & sky ----------
  const now = nowHour(new Date(state.nowTick));
  const mode = state.skyOverride !== 'auto' ? state.skyOverride : modeForHour(now);
  const bgGradient = gradientForMode(mode);

  function fmtName(first, last) {
    if (!first) return 'you';
    return (first + (last ? ' ' + last[0] + '.' : '')).toLowerCase();
  }

  // ---------- data ----------
  function allToday() {
    const posts = state.posts
      .filter(p => !(p.dayOffset > 0))
      .map(p => ({ ...p, isYours: true, dur: p.dur || 1.5 }));
    return baseActivities(now).concat(posts).filter(a => !state.gone[a.id]);
  }
  function futurePosts() {
    return state.posts
      .filter(p => p.dayOffset > 0 && !state.gone[p.id])
      .map(p => ({ ...p, isYours: true, dur: p.dur || 1.5, day: dayLabel(p.dayOffset) }))
      .sort((a, b) => (a.dayOffset - b.dayOffset) || (a.hour - b.hour));
  }
  function findActivity(id) {
    return allToday().find(a => a.id === id)
      || weekActivities().find(a => a.id === id)
      || futurePosts().find(a => a.id === id);
  }

  // Notifications are generated from event data + timing:
  //  · a friend posts a new event                         → posted ping
  //  · event 24h / 1h out and still has vacancies          → vacancy reminder
  //  · event you're attending starts in ~10 min            → head-out ping
  function buildPings() {
    const out = [];
    const today = allToday();

    today.concat(weekActivities()).forEach(a => {
      if (a.isYours) return;
      const youIn = !!state.joins[a.id];
      const left = a.spots ? a.spots - (a.joined.length + (youIn ? 1 : 0)) : 99;
      const full = a.spots && left <= 0 && !youIn;
      const mins = a.day ? 9999 : (a.hour - now) * 60;
      const f = friendById(a.who);
      const base = { who: a.who, actId: a.id };

      if (youIn && mins <= 10 && mins > -6) {
        out.push({
          ...base, sort: 0, unread: true, going: true,
          text: a.what + ' ' + a.emoji + ' starts in ' + Math.max(1, Math.round(mins)) + ' min — head to ' + a.place + '!',
          when: 'just now'
        });
        return;
      }
      if (youIn) {
        out.push({
          ...base, sort: 4, unread: false, going: true,
          text: 'going to ' + a.what + ' ' + a.emoji + (a.day ? ' on ' + a.day : ''),
          when: (a.day ? a.day + ' ' : 'today ') + fmtTime(a.hour)
        });
        return;
      }
      if (a.spots && left > 0 && mins > 10) {
        const soon = mins <= 60;
        out.push({
          ...base, sort: soon ? 1 : (a.day ? 3 : 2), unread: soon, action: "i'm in",
          text: a.what + ' ' + a.emoji + (a.day ? ' on ' + a.day : '') + (soon ? ' starts within the hour' : '') + ' — ' + left + (left === 1 ? ' spot' : ' spots') + (soon ? ' still open' : ' left, join before it fills'),
          when: (a.day ? a.day + ' ' : 'starts ') + fmtTime(a.hour)
        });
        return;
      }
      out.push({
        ...base, sort: 5, unread: false, action: full ? null : "i'm in",
        text: (f ? f.first.toLowerCase() : a.who) + ' posted ' + a.what + ' ' + a.emoji + (a.day ? ' for ' + a.day : '') + (full ? ' (full)' : ''),
        when: a.postedAgo || 'recently'
      });
    });

    out.sort((x, y) => x.sort - y.sort);
    return out;
  }

  function status(a) {
    if (a.day) return 'open';
    if (now > a.hour + (a.dur || 1.25)) return 'wrapped';
    if (now >= a.hour - 0.25) return 'now';
    return 'open';
  }

  // ================= derived view model =================
  const S = state;
  const name = S.name || 'you';
  const gname = name.toLowerCase();
  const isOnboarding = S.view === 'onboarding';

  const greeting = mode === 'morning' ? 'good morning, ' + gname + ' ☀️'
    : mode === 'sunset' ? 'golden hour, ' + gname + ' 🌅'
    : 'night owl hours, ' + gname + ' 🌙';

  const acts = allToday().map(a => {
    const st = status(a);
    const youIn = !!S.joins[a.id];
    const joinedCount = a.joined.length + (youIn ? 1 : 0);
    const fr = friendById(a.who);
    const whoName = a.isYours ? 'you' : (fr ? fr.name : a.who);
    const wrapped = st === 'wrapped';
    const spotsLeft = a.spots ? a.spots - joinedCount : 0;
    const full = !!a.spots && spotsLeft <= 0 && !youIn;
    let joinText;
    if (wrapped) joinText = joinedCount ? joinedCount + ' went' : 'quiet one';
    else if (youIn) joinText = joinedCount === 1 ? 'going' : 'you + ' + (joinedCount - 1) + ' going';
    else if (full) joinText = 'full · ' + joinedCount + ' going';
    else if (joinedCount === 0) joinText = a.isYours ? 'no one yet' : 'be the first 👀';
    else joinText = joinedCount + ' in' + (a.spots && spotsLeft > 0 ? ' · ' + spotsLeft + ' spots left' : '');
    const statusLine = wrapped ? fmtTime(a.hour) + ' · wrapped'
      : st === 'now' ? 'happening now'
      : fmtTime(a.hour) + (a.hour >= 20 ? ' · tonight' : '');
    return {
      id: a.id, hour: a.hour,
      title: a.what + ' ' + a.emoji,
      whoLine: whoName + ' · 📍 ' + a.place,
      note: a.note || '',
      hasNote: !!a.note && !wrapped,
      isYours: !!a.isYours,
      opacity: wrapped ? .55 : 1,
      pulsing: st === 'now',
      statusLine,
      statusColor: st === 'now' ? '#e0562a' : 'rgba(58,44,40,.5)',
      statusBold: st === 'now',
      showFooter: !wrapped,
      avatars: a.joined.slice(0, 3).map((j, i) => {
        const f = friendById(j);
        return { color: f ? f.color : '#ccc', ml: i === 0 ? '0' : '-6px' };
      }),
      joinText,
      showBtn: !a.isYours && !full,
      btnLabel: youIn ? 'going ✓' : "i'm in",
      btnBg: youIn ? '#3a2c28' : ACCENT,
      btnColor: youIn ? '#ffe9c2' : '#fff',
      open: () => setState({ detailId: a.id }),
      toggleJoin: (e) => {
        e.stopPropagation();
        setState({ joins: { ...S.joins, [a.id]: !youIn } });
        toast(!youIn ? 'going — ' + whoName + ' will be stoked 🎉' : 'no worries, backed out quietly');
      },
      showCancel: !!a.isYours,
      cancel: (e) => {
        e.stopPropagation();
        setState({ gone: { ...S.gone, [a.id]: true }, posts: S.posts.filter(p => p.id !== a.id) });
        toast('called off — friends were told 💛');
      }
    };
  });

  const edges = [[0, 12], [12, 17], [17, 21], [21, 25]];
  const buckets = edges.map(([lo, hi]) => {
    const items = acts.filter(a => a.hour >= lo && a.hour < hi).sort((x, y) => x.hour - y.hour);
    return { items, empty: items.length === 0 };
  });

  const segs = [['8 am', 8, 12], ['noon', 12, 17], ['5 pm', 17, 21], ['9 pm', 21, 25]];
  const axis = segs.map(([label, lo, hi]) => {
    const active = now >= lo && now < hi;
    return {
      label: active ? label + ' ●' : label,
      borderTop: active ? '2px solid rgba(58,44,40,.55)' : '2px dotted rgba(58,44,40,.3)',
      color: active ? '#3a2c28' : 'rgba(58,44,40,.5)'
    };
  });

  const liveActs = acts.filter(a => a.opacity === 1 && !a.isYours);
  const subline = liveActs.length
    ? liveActs.length + (liveActs.length === 1 ? ' friend is' : ' friends are') + ' out doing things — tap in whenever'
    : 'nothing on the board yet — start something';

  const weekItems = futurePosts().concat(weekActivities()).map(a => {
    const fr = a.isYours ? null : friendById(a.who);
    const youIn = !!S.joins[a.id];
    const count = a.joined.length + (youIn ? 1 : 0);
    return {
      id: a.id,
      title: a.what + ' ' + a.emoji,
      meta: (a.isYours ? 'you' : fr.name) + ' · ' + a.day + ' ' + fmtTime(a.hour) + ' · 📍 ' + a.place,
      note: a.note,
      color: a.isYours ? '#ffb37e' : fr.color,
      initial: (a.isYours ? name : fr.first)[0].toUpperCase(),
      goingText: a.isYours ? 'yours' : (youIn ? 'going ✓' : (a.spots ? count + '/' + a.spots + ' going' : count + ' going')),
      open: () => setState({ detailId: a.id })
    };
  });

  const rawPings = buildPings();
  const unread = S.pingsRead ? 0 : rawPings.filter(p => p.unread).length;
  const tabs = [['today', 'today'], ['friends', 'friends'], ['pings', 'pings'], ['you', 'you']];
  const navTabs = tabs.map(([label, v]) => ({
    key: v,
    label,
    dot: v === 'pings' && unread > 0,
    active: S.view === v,
    go: () => setState({ view: v })
  }));

  const pings = rawPings.map((p, i) => {
    const f = friendById(p.who);
    const youIn = p.actId && !!S.joins[p.actId];
    return {
      key: p.actId + ':' + i,
      text: p.text, when: p.when,
      initial: (f ? f.first[0] : p.who[0]).toUpperCase(),
      color: f ? f.color : 'rgba(58,44,40,.25)',
      bg: p.unread && !S.pingsRead ? 'rgba(255,255,255,.65)' : 'rgba(255,255,255,.42)',
      unread: !!p.unread && !S.pingsRead,
      hasAction: !!p.action && !youIn,
      going: !!p.actId && youIn,
      actionLabel: p.action,
      act: () => {
        if (p.actId) {
          setState({ joins: { ...S.joins, [p.actId]: true } });
          toast("going 🎉 it's on your board");
        }
      }
    };
  });

  const friendCards = friends().map(f => ({ ...f, initial: f.first[0].toUpperCase() }));

  // onboarding
  const obFriendsList = friends().slice(0, 4).map(f => {
    const added = S.obAdded.includes(f.id);
    return {
      id: f.id, name: f.name, bio: f.bio, color: f.color, initial: f.first[0].toUpperCase(),
      btnLabel: added ? 'added ✓' : '+ add',
      btnBg: added ? '#3a2c28' : 'rgba(58,44,40,.08)',
      btnColor: added ? '#ffe9c2' : '#3a2c28',
      toggle: () => setState({ obAdded: added ? S.obAdded.filter(x => x !== f.id) : S.obAdded.concat(f.id) })
    };
  });
  const obDots = [1, 2].map(n => ({ bg: n === S.obStep ? '#3a2c28' : 'rgba(58,44,40,.2)' }));

  function obNextFn() {
    if (S.obStep === 1) {
      if (!S.obFirst.trim()) { toast('tell us your first name 🙂'); return; }
      const digits = S.obPhone.replace(/\D/g, '');
      if (digits.length < 7) { toast('add a valid phone number 📱'); return; }
    }
    setState({ obStep: Math.min(2, S.obStep + 1) });
  }

  // composer options
  const emojis = ['☕', '🏋️', '🎬', '🍜', '📚', '🚶', '🎮', '🧺', '🍦'];
  const spotsOptions = [{ value: '0', label: 'open to everyone' }].concat(
    Array.from({ length: 10 }, (_, i) => ({ value: String(i + 1), label: (i + 1) + (i === 0 ? ' spot' : ' spots') }))
  );
  const emojiChips = emojis.map(e => ({
    char: e,
    bg: S.cEmoji === e ? 'rgba(255,138,92,.2)' : 'rgba(255,255,255,.7)',
    border: S.cEmoji === e ? ACCENT : 'rgba(58,44,40,.15)',
    pick: () => setState({ cEmoji: S.cEmoji === e ? '' : e })
  }));
  const dateOptions = [0, 1, 2, 3, 4, 5].map(off => {
    const dd = new Date(); dd.setDate(dd.getDate() + off);
    const wd = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][dd.getDay()];
    const mo = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'][dd.getMonth()];
    const label = off === 0 ? 'today' : off === 1 ? 'tomorrow' : wd + ' ' + mo + ' ' + dd.getDate();
    return { value: String(off), label };
  });
  const cDateOff = parseInt(S.cDate, 10) || 0;
  const timeOptions = [];
  {
    let t = cDateOff === 0 ? Math.ceil(now * 2) / 2 + 0.5 : 8;
    const tEnd = cDateOff === 0 ? 24 : 23.5;
    for (let i = 0; i < 40 && t <= tEnd; i++, t += 0.5) {
      timeOptions.push({ value: String(t), label: fmtTime(t) });
    }
    if (!timeOptions.length) timeOptions.push({ value: '20', label: fmtTime(20) });
  }
  const cTime = timeOptions.some(o => o.value === S.cTime) ? S.cTime : (timeOptions[0] && timeOptions[0].value);

  function postActivity() {
    const what = S.cTitle.trim();
    if (!what) { toast("say what you're up to first 🙂"); return; }
    const dayOffset = Math.min(5, Math.max(0, parseInt(S.cDate, 10) || 0));
    const validTime = timeOptions.some(o => o.value === S.cTime) ? S.cTime : (timeOptions[0] && timeOptions[0].value);
    const post = {
      id: 'p' + Date.now(),
      who: 'you',
      emoji: S.cEmoji || '✨',
      what,
      place: S.cPlace.trim() || 'somewhere good',
      note: S.cNote.trim(),
      dayOffset,
      hour: parseFloat(validTime || '20'),
      dur: 1.5,
      joined: [], spots: parseInt(S.cSpots, 10) || 0,
      postedAgo: 'posted just now',
      dist: 'near you'
    };
    setState({
      posts: S.posts.concat(post),
      composerOpen: false, cTitle: '', cPlace: '', cNote: '', cDate: '0', cTime: '', cEmoji: '', cSpots: '0', view: 'today'
    });
    toast(dayOffset === 0 ? "it's on the board — friends can tap in 🎉" : 'posted for ' + dayLabel(dayOffset) + ' — it\'s in "later this week" 🎉');
  }

  const yourPosts = S.posts.filter(p => !S.gone[p.id]).map(p => ({
    id: p.id,
    title: p.what + ' ' + p.emoji,
    meta: (p.dayOffset > 0 ? dayLabel(p.dayOffset) + ' ' : '') + fmtTime(p.hour) + ' · ' + p.place,
    open: () => setState({ detailId: p.id }),
    cancel: () => {
      setState({ posts: S.posts.filter(x => x.id !== p.id) });
      toast('called off — friends were told 💛');
    }
  }));

  const goingEvents = allToday().concat(weekActivities(), futurePosts())
    .filter(a => !a.isYours && S.joins[a.id] && !S.gone[a.id])
    .map(a => {
      const fr = friendById(a.who);
      return {
        id: a.id,
        title: a.what + ' ' + a.emoji,
        meta: (fr ? fr.name : a.who) + ' · ' + (a.day ? a.day + ' ' : '') + fmtTime(a.hour) + ' · 📍 ' + a.place,
        color: fr ? fr.color : 'rgba(58,44,40,.25)',
        initial: (fr ? fr.first : a.who)[0].toUpperCase(),
        open: () => setState({ detailId: a.id })
      };
    });

  const skies = [['auto', 'auto ✨'], ['morning', 'morning ☀️'], ['sunset', 'sunset 🌅'], ['night', 'night 🌙']];
  const skyChips = skies.map(([v, label]) => {
    const on = S.skyOverride === v;
    return {
      key: v, label,
      bg: on ? 'rgba(255,255,255,.75)' : 'rgba(255,255,255,.4)',
      border: on ? '#3a2c28' : 'rgba(58,44,40,.18)',
      pick: () => setState({ skyOverride: v })
    };
  });

  // ---------- event detail popup (locked to modal style) ----------
  const detailActivity = S.detailId ? findActivity(S.detailId) : null;
  let detail = null;
  if (detailActivity) {
    const a = detailActivity;
    const fr = friendById(a.who);
    const whoName = a.isYours ? 'you' : (fr ? fr.name : a.who);
    const youIn = !!S.joins[a.id];
    const joinedIds = a.joined || [];
    const joinedCount = joinedIds.length + (youIn ? 1 : 0);
    const spotsLeft = a.spots ? a.spots - joinedCount : 0;
    const goingNames = joinedIds.map(j => { const f = friendById(j); return f ? f.name : j; });
    if (youIn) goingNames.push('you');
    const timeRange = (a.day ? a.day + ' · ' : 'today, ') + fmtTime(a.hour) + ' – ' + fmtTime(a.hour + (a.dur || 1.5));
    const full = a.spots && spotsLeft <= 0 && !youIn;
    detail = {
      color: a.isYours ? '#ffb37e' : (fr ? fr.color : '#ccc'),
      initial: (whoName === 'you' ? name : whoName)[0].toUpperCase(),
      who: whoName,
      whoUpper: whoName.toUpperCase(),
      postedAgo: a.postedAgo || 'posted just now',
      title: a.what + ' ' + a.emoji,
      hasNote: !!a.note,
      note: a.note || '',
      place: a.place,
      timeRange,
      avatars: (goingNames.length ? goingNames : ['?']).slice(0, 4).map((n, i) => {
        const f = friends().find(x => x.name === n);
        return {
          color: n === 'you' ? '#ffb37e' : (f ? f.color : 'rgba(58,44,40,.2)'),
          initial: n === '?' ? '·' : n[0].toUpperCase(),
          ml: i === 0 ? '0' : '-8px'
        };
      }),
      goingNames: goingNames.length ? goingNames.join(', ') : 'no one yet — be the first 👀',
      spotsLine: a.spots ? (spotsLeft > 0 ? spotsLeft + (spotsLeft === 1 ? ' spot open' : ' spots open') : 'full house') : 'open to everyone',
      distance: a.dist || 'distance unknown',
      showJoin: !a.isYours,
      isYours: !!a.isYours,
      btnLabel: youIn ? 'going ✓' : (full ? 'ask to join' : "i'll be there!"),
      btnBg: youIn ? '#3a2c28' : (full ? 'rgba(58,44,40,.1)' : ACCENT),
      btnColor: youIn ? '#ffe9c2' : (full ? '#3a2c28' : '#fff'),
      toggleJoin: () => {
        if (full) {
          setState({ detailId: null });
          toast('asked ' + whoName + " to join — they'll decide 🙏");
          return;
        }
        setState({ joins: { ...S.joins, [a.id]: !youIn } });
        toast(!youIn ? 'going — ' + whoName + ' will be stoked 🎉' : 'no worries, backed out quietly');
      },
      cantMake: () => {
        const patch = { detailId: null };
        if (youIn) patch.joins = { ...S.joins, [a.id]: false };
        setState(patch);
        toast("let " + whoName + " know you can't make it 💛");
      },
      cancel: () => {
        setState({ gone: { ...S.gone, [a.id]: true }, posts: S.posts.filter(p => p.id !== a.id), detailId: null });
        toast('called off — friends were told 💛');
      }
    };
  }

  return {
    accent: ACCENT,
    bgGradient,
    isOnboarding,

    onboarding: {
      step1: S.obStep === 1, step2: S.obStep === 2,
      obFirst: S.obFirst, obLast: S.obLast, obPhone: S.obPhone,
      hasName: !!S.obFirst.trim(),
      previewName: fmtName(S.obFirst.trim(), S.obLast.trim()),
      setObFirst: (e) => setState({ obFirst: e.target.value }),
      setObLast: (e) => setState({ obLast: e.target.value }),
      setObPhone: (e) => setState({ obPhone: e.target.value }),
      nameKeyDown: (e) => { if (e.key === 'Enter') obNextFn(); },
      next: obNextFn,
      friendsList: obFriendsList,
      dots: obDots,
      finish: () => {
        const first = S.obFirst.trim() || 'sam';
        setState({ name: first, last: S.obLast.trim(), phone: S.obPhone.trim(), onboarded: true, view: 'today', joins: { a6: true } });
        toast('welcome to looped 💛 here\'s today');
      }
    },

    view: S.view,
    nav: {
      tabs: navTabs,
      clockLine: clockLineFor(now),
      yourInitial: (name[0] || 'y').toUpperCase(),
      goToday: () => setState({ view: 'today' }),
      goYou: () => setState({ view: 'you' })
    },

    today: {
      greeting, subline, axis, buckets, weekItems,
      openComposer: () => setState({ composerOpen: true })
    },

    pings: {
      list: pings,
      markAllRead: () => setState({ pingsRead: true })
    },

    friends: {
      countLine: friends().length + ' friends on looped · ' + liveActs.length + ' out right now',
      query: S.friendQuery,
      setQuery: (e) => setState({ friendQuery: e.target.value }),
      inviteKeyDown: (e) => { if (e.key === 'Enter') doInvite(); },
      sendInvite: () => doInvite(),
      contactsLinked: S.contactsLinked,
      linkContacts: () => { setState({ contactsLinked: true }); toast('contacts linked 📇 search friends by name'); },
      contactQuery: S.contactQuery,
      setContactQuery: (e) => setState({ contactQuery: e.target.value }),
      searchContacts: () => doSearch(),
      searchKeyDown: (e) => { if (e.key === 'Enter') doSearch(); },
      cards: friendCards
    },

    profile: {
      name: fmtName(name, S.last),
      phone: S.phone || 'add your number in settings',
      bio: S.bio,
      setBio: (e) => setState({ bio: e.target.value }),
      statPosted: S.posts.length,
      statJoined: Object.values(S.joins).filter(Boolean).length,
      statFriends: friends().length,
      yourPosts,
      noPosts: yourPosts.length === 0,
      goingEvents,
      noGoing: goingEvents.length === 0,
      openComposerFromYou: () => setState({ composerOpen: true, view: 'today' }),
      skyChips,
      yourInitial: (name[0] || 'y').toUpperCase(),
      resetApp: () => {
        try { localStorage.removeItem(STORAGE_KEY); localStorage.removeItem(LEGACY_STORAGE_KEY); } catch (e) { /* ignore */ }
        setStateRaw(initialState());
      }
    },

    detail: {
      open: !!detail,
      ...detail,
      close: () => setState({ detailId: null })
    },

    composer: {
      open: S.composerOpen,
      close: () => setState({ composerOpen: false }),
      cTitle: S.cTitle, setCTitle: (e) => setState({ cTitle: e.target.value }),
      cPlace: S.cPlace, setCPlace: (e) => setState({ cPlace: e.target.value }),
      cNote: S.cNote, setCNote: (e) => setState({ cNote: e.target.value }),
      cDate: S.cDate, setCDate: (e) => setState({ cDate: e.target.value, cTime: '' }),
      cTime, setCTime: (e) => setState({ cTime: e.target.value }),
      cSpots: S.cSpots, setCSpots: (e) => setState({ cSpots: e.target.value }),
      dateOptions, emojiChips, timeOptions, spotsOptions,
      postActivity
    },

    toast: { shown: !!S.toast, text: S.toast }
  };

  function doInvite() {
    const q = S.friendQuery.trim();
    const digits = q.replace(/\D/g, '');
    if (digits.length < 7) { toast('enter a phone number to invite 📱'); return; }
    toast('invite texted to ' + q + ' ✉️');
    setState({ friendQuery: '' });
  }
  function doSearch() {
    const q = S.contactQuery.trim();
    if (!q) { toast('type a name to search 🙂'); return; }
    toast('searching contacts for "' + q + '"…');
    setState({ contactQuery: '' });
  }
}
