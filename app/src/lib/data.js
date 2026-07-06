export function fmtName(first, last) {
  if (!first) return 'you';
  return (first + (last ? ' ' + last[0] + '.' : '')).toLowerCase();
}

export function rawFriends() {
  return [
    { id: 'kat', first: 'Kat', last: 'Tran', color: '#e0a878', bio: 'usually up for coffee + thrifting' },
    { id: 'maya', first: 'Maya', last: 'Rosen', color: '#a8c4e0', bio: 'picnics, long walks, iced matcha' },
    { id: 'dev', first: 'Dev', last: 'Shah', color: '#9db8a4', bio: 'gym rat, will spot you' },
    { id: 'priya', first: 'Priya', last: 'Kapoor', color: '#c9a8d8', bio: 'movie nights + late food runs' },
    { id: 'theo', first: 'Theo', last: 'Marín', color: '#d8a8a8', bio: 'pickup soccer, board games' },
    { id: 'sana', first: 'Sana', last: 'Patel', color: '#a8c8c8', bio: 'library grinds, chai breaks' }
  ];
}

export function friends() {
  return rawFriends().map(f => ({ ...f, name: fmtName(f.first, f.last) }));
}

export function friendById(id) {
  return friends().find(f => f.id === id);
}

export function baseActivities(now) {
  const clamp = (h) => Math.max(8.25, Math.min(23.5, h));
  return [
    { id: 'a1', who: 'kat', emoji: '☕', what: 'coffee run', place: 'blue bottle, 3rd st', hour: clamp(now - 3), dur: 1, joined: ['maya', 'theo'], spots: 0, note: 'need caffeine before my 2pm, come yap with me', dist: '0.3 mi · 6 min walk', postedAgo: 'posted 3 hrs ago' },
    { id: 'a2', who: 'maya', emoji: '🧺', what: 'picnic on the quad', place: 'east lawn', hour: clamp(now - 0.2), dur: 2, joined: ['kat', 'theo'], spots: 4, note: 'i have a blanket, snacks, and zero plans. perfect weather for it', dist: '0.4 mi · 8 min walk', postedAgo: 'posted 40 min ago' },
    { id: 'a3', who: 'sana', emoji: '📚', what: 'library grind', place: 'main library, fl 3', hour: clamp(now + 1.5), dur: 3, joined: [], spots: 0, note: 'quiet floor but we can take chai breaks every hour', dist: '0.6 mi · 12 min walk', postedAgo: 'posted 1 hr ago' },
    { id: 'a4', who: 'dev', emoji: '🏋️', what: 'gym sesh', place: 'campus rec center', hour: clamp(now + 3.5), dur: 1.5, joined: [], spots: 2, note: 'push day. i need a spotter and moral support', dist: '0.8 mi · 15 min walk', postedAgo: 'posted 2 hrs ago' },
    { id: 'a5', who: 'priya', emoji: '🎬', what: 'movie night', place: 'dune part three, amc 12', hour: clamp(now + 6), dur: 2.5, joined: ['theo', 'maya', 'kat'], spots: 5, note: 'got a promo code for cheap tickets. no spoilers or you walk home', dist: '1.2 mi · 10 min bus', postedAgo: 'posted yesterday' },
    { id: 'a6', who: 'theo', emoji: '🎳', what: 'bowling before class', place: 'sunset lanes', hour: clamp(now + 0.16), dur: 1.5, joined: ['dev'], spots: 4, note: 'quick game, first one there grabs a lane', dist: '0.2 mi · 4 min walk', postedAgo: 'posted 2 hrs ago' },
    { id: 'a7', who: 'sana', emoji: '🧋', what: 'boba run', place: 'tiger sugar', hour: clamp(now + 2), dur: 1, joined: ['kat', 'priya'], spots: 2, note: 'craving brown sugar milk tea, who\'s coming', dist: '0.3 mi · 5 min walk', postedAgo: 'posted 30 min ago' }
  ];
}

export function weekActivities() {
  return [
    { id: 'w1', who: 'theo', emoji: '⚽', what: 'pickup soccer', place: 'riverside fields', day: 'wed', hour: 17.5, dur: 1.5, joined: ['dev'], spots: 8, note: 'all skill levels, we mostly just run around and vibe', dist: '1.0 mi · 9 min bike', postedAgo: 'posted this morning' },
    { id: 'w2', who: 'kat', emoji: '🛍️', what: 'thrift crawl', place: 'east village, 3 stops', day: 'fri', hour: 14, dur: 3, joined: ['maya'], spots: 3, note: 'hunting for a jacket. i know all the good racks, trust', dist: '2.1 mi · 15 min subway', postedAgo: 'posted yesterday' },
    { id: 'w3', who: 'sana', emoji: '🥞', what: 'brunch before finals week', place: 'sunny side diner', day: 'sat', hour: 11, dur: 1.5, joined: ['priya', 'maya'], spots: 2, note: 'one last good meal before we all disappear into the library', dist: '0.5 mi · 10 min walk', postedAgo: 'posted 2 days ago' }
  ];
}
