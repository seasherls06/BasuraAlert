import { createContext, useContext, useReducer, useEffect } from 'react';

export const BRGYS = ['Brgy. San Antonio, Pasig City', 'Brgy. Malamig, Mandaluyong City', 'Brgy. Kapitolyo, Pasig City'];
const KEY = 'basuraalert-state-v1';

const initial = {
  screen: 'splash', // splash -> loading -> login | forgot | loadingDash -> dashboard
  user: null,
  brgyIdx: 0,
  accounts: [
    { role: 'resident', name: 'Dela Cruz Household', email: 'resident@email.ph', phone: '0917-000-0000', password: 'resident123' },
    { role: 'officer', name: 'Kgd. Reyes (Sanitation)', email: 'officer@barangay.gov', phone: '0918-111-2222', password: 'officer123' },
  ],
  reports: [{ id: 1, by: 'Dela Cruz Household', type: 'General', place: 'Purok Sampaguita', note: 'Not collected since Tuesday', status: 'Open' }],
  updates: [['Schedule change', 'Recyclables pickup moved to Saturday, 7:00 AM.'], ['Truck delayed', 'Zone 3 general waste pickup is running 1 hour late.']],
  reminders: { night: true, morning: true, changes: true },
};

function reducer(s, a) {
  switch (a.type) {
    case 'NAV': return { ...s, screen: a.screen };
    case 'LOGIN': return { ...s, user: a.user, screen: 'loadingDash' };
    case 'LOGOUT': return { ...s, user: null, screen: 'login' };
    case 'RESET_PASSWORD': return { ...s, screen: 'login', accounts: s.accounts.map((x) => (x.email === a.email ? { ...x, password: a.password } : x)) };
    case 'NEXT_BARANGAY': return { ...s, brgyIdx: (s.brgyIdx + 1) % BRGYS.length };
    case 'ADD_REPORT': return { ...s, reports: [a.report, ...s.reports] };
    case 'RESOLVE_REPORT': return { ...s, reports: s.reports.map((r) => (r.id === a.id ? { ...r, status: 'Resolved' } : r)) };
    case 'ADD_UPDATE': return { ...s, updates: [[a.title, a.message], ...s.updates] };
    case 'SET_REMINDER': return { ...s, reminders: { ...s.reminders, [a.key]: a.value } };
    default: return s;
  }
}

// Reports, updates, reminders and barangay survive a page refresh on web (localStorage).
function load() {
  try {
    if (typeof localStorage === 'undefined') return initial;
    const raw = localStorage.getItem(KEY);
    return raw ? { ...initial, ...JSON.parse(raw) } : initial;
  } catch (e) { return initial; }
}

const Ctx = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);
  useEffect(() => {
    try {
      if (typeof localStorage === 'undefined') return;
      const { reports, updates, reminders, brgyIdx } = state;
      localStorage.setItem(KEY, JSON.stringify({ reports, updates, reminders, brgyIdx }));
    } catch (e) {}
  }, [state.reports, state.updates, state.reminders, state.brgyIdx]);
  return <Ctx.Provider value={{ state, dispatch }}>{children}</Ctx.Provider>;
}

export const useApp = () => useContext(Ctx);
