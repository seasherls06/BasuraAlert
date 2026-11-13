import { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Switch, Linking, StyleSheet } from 'react-native';
import { useApp, BRGYS } from '../store';

const C = { ink: '#101915', muted: '#5C6E64', leaf: '#1B6B45', chip: '#DCEEE0', border: '#DCEBE1', amber: '#FBF0E1', amberText: '#9A5B14', err: '#B23A2E' };
const GUIDE = [['🟢', 'General / Biodegradable', 'Food scraps, garden waste. Green bag.'], ['🟡', 'Recyclables', 'Plastic bottles, cans, clean cardboard. Yellow bag.'], ['🔴', 'Hazardous / E-waste', 'Batteries, electronics, used oil. Drop-off only.'], ['⚫', 'Residual', 'Non-recyclable, non-bio. Black bag, sealed.']];
const SCHED = [['Tue & Fri', 'General waste', '6:00 AM'], ['Saturday', 'Recyclables', '7:00 AM'], ['1st Monday', 'E-waste / hazardous', 'Drop-off, 9:00 AM']];
const HOTLINES = [['Barangay Hall', '0281234567'], ['Sanitation Office', '0281239876'], ['Emergency', '911']];
const TYPES = ['General', 'Recyclable', 'Hazardous'];

export default function Dashboard({ toast }) {
  const { state, dispatch } = useApp();
  const { user, reports, updates, reminders: rem } = state;
  const barangay = BRGYS[state.brgyIdx];
  const onLogout = () => dispatch({ type: 'LOGOUT' });
  const officer = user.role === 'officer';
  const tabs = officer ? [['🏠', 'Overview'], ['📋', 'Reports'], ['📢', 'Alerts'], ['👤', 'Profile']] : [['🏠', 'Home'], ['🗓️', 'Schedule'], ['📸', 'Report'], ['👤', 'Profile']];
  const [tab, setTab] = useState(0);
  const [sub, setSub] = useState(null);
  const [type, setType] = useState('General');
  const [place, setPlace] = useState('');
  const [note, setNote] = useState('');
  const [msg, setMsg] = useState('');
  const open = reports.filter((r) => r.status === 'Open').length;
  const mine = reports.filter((r) => r.by === user.name);

  const submit = () => {
    if (!place.trim()) return toast('Please enter your street or purok.');
    dispatch({ type: 'ADD_REPORT', report: { id: Date.now(), by: user.name, type, place: place.trim(), note: note.trim(), status: 'Open' } });
    setPlace(''); setNote(''); toast('Report sent to your barangay.');
  };
  const resolve = (id) => { dispatch({ type: 'RESOLVE_REPORT', id }); toast('Report marked as resolved.'); };
  const pushAlert = () => {
    if (!msg.trim()) return toast('Type an alert message first.');
    dispatch({ type: 'ADD_UPDATE', title: 'Barangay alert', message: msg.trim() }); setMsg(''); toast('Alert sent to all residents.');
  };
  const call = (n) => Linking.openURL('tel:' + n).catch(() => toast('Calling is not available here.'));

  const Head = ({ title, back }) => (
    <View style={{ marginBottom: 14 }}>
      {back ? <TouchableOpacity onPress={() => setSub(null)}><Text style={s.back}>‹ Back</Text></TouchableOpacity> : null}
      <Text style={s.h1}>{title}</Text>
    </View>
  );
  const ReportCard = ({ r }) => (
    <View style={s.card}>
      <View style={s.rowBetween}>
        <Text style={s.cardTitle}>{r.type} · {r.place}</Text>
        <View style={[s.pill, r.status === 'Resolved' && { backgroundColor: C.chip }]}><Text style={[s.pillText, r.status === 'Resolved' && { color: C.leaf }]}>{r.status}</Text></View>
      </View>
      <Text style={s.cardDesc}>{r.note || 'No notes'} — by {r.by}</Text>
      {officer && r.status === 'Open' ? <TouchableOpacity style={s.smallBtn} onPress={() => resolve(r.id)}><Text style={s.smallBtnText}>Mark resolved</Text></TouchableOpacity> : null}
    </View>
  );
  const Updates = () => updates.map(([t, d], i) => (
    <View key={i} style={s.update}><Text style={s.updateTitle}>{t}</Text><Text style={s.updateDesc}>{d}</Text></View>
  ));

  let body;
  if (sub === 'guide') body = (<><Head title="Segregation Guide" back />{GUIDE.map(([i, t, d]) => (<View key={t} style={s.card}><Text style={s.cardTitle}>{i} {t}</Text><Text style={s.cardDesc}>{d}</Text></View>))}</>);
  else if (sub === 'reminders') body = (<><Head title="Reminders" back />{[['night', 'Night before', '8:00 PM reminder'], ['morning', 'Morning of', '5:30 AM reminder'], ['changes', 'Schedule changes', 'Delays or reroutes']].map(([k, t, d]) => (
    <View key={k} style={[s.card, s.rowBetween]}><View><Text style={s.cardTitle}>{t}</Text><Text style={s.cardDesc}>{d}</Text></View>
      <Switch value={rem[k]} onValueChange={(v) => { dispatch({ type: 'SET_REMINDER', key: k, value: v }); toast(t + (v ? ' reminder on' : ' reminder off')); }} trackColor={{ true: C.leaf }} /></View>))}</>);
  else if (sub === 'contact') body = (<><Head title="Contact Barangay" back />{HOTLINES.map(([t, n]) => (
    <View key={t} style={[s.card, s.rowBetween]}><View><Text style={s.cardTitle}>{t}</Text><Text style={s.cardDesc}>{n}</Text></View>
      <TouchableOpacity style={s.smallBtn} onPress={() => call(n)}><Text style={s.smallBtnText}>Call</Text></TouchableOpacity></View>))}</>);
  else if (sub === 'updates') body = (<><Head title="Barangay updates" back /><Updates /></>);
  else if (!officer && tab === 0) body = (<>
    <View style={s.rowBetween}>
      <View><Text style={s.greet}>Good morning,</Text><Text style={s.h1}>{user.name}</Text></View>
      <TouchableOpacity style={s.bell} onPress={() => setSub('updates')}><Text style={{ fontSize: 16 }}>🔔</Text><View style={s.badge}><Text style={s.badgeText}>{updates.length}</Text></View></TouchableOpacity>
    </View>
    <Text style={s.loc}>📍 {barangay}</Text>
    <View style={s.pickup}><Text style={s.pickupLabel}>NEXT PICKUP</Text><Text style={s.pickupBig}>Tomorrow, 6:00 AM</Text><Text style={s.pickupSub}>General waste · Zone 3</Text></View>
    <Text style={s.section}>Quick actions</Text>
    <View style={s.grid}>{[['📸', 'Report Missed Pickup', () => setTab(2)], ['♻️', 'Segregation Guide', () => setSub('guide')], ['🔔', 'Reminders', () => setSub('reminders')], ['📞', 'Contact Barangay', () => setSub('contact')]].map(([i, l, f]) => (
      <TouchableOpacity key={l} style={s.action} activeOpacity={0.8} onPress={f}><Text style={{ fontSize: 22, marginBottom: 6 }}>{i}</Text><Text style={s.actionText}>{l}</Text></TouchableOpacity>))}</View>
    <Text style={s.section}>Barangay updates</Text><Updates />
  </>);
  else if (!officer && tab === 1) body = (<><Head title="Collection Schedule" />{SCHED.map(([d, t, h]) => (<View key={t} style={s.card}><Text style={s.cardTitle}>{t}</Text><Text style={s.cardDesc}>{d} · {h}</Text></View>))}</>);
  else if (!officer && tab === 2) body = (<>
    <Head title="Report Missed Pickup" />
    <Text style={s.label}>Waste type</Text>
    <View style={s.chips}>{TYPES.map((t) => (<TouchableOpacity key={t} style={[s.chip, type === t && s.chipOn]} onPress={() => setType(t)}><Text style={[s.chipText, type === t && { color: '#fff' }]}>{t}</Text></TouchableOpacity>))}</View>
    <Text style={s.label}>Street / Purok</Text>
    <TextInput style={s.input} placeholder="e.g. Purok Sampaguita" placeholderTextColor="#8FA398" value={place} onChangeText={setPlace} />
    <Text style={s.label}>Notes (optional)</Text>
    <TextInput style={[s.input, { height: 70 }]} multiline placeholder="Trash not collected since Tuesday" placeholderTextColor="#8FA398" value={note} onChangeText={setNote} />
    <TouchableOpacity style={s.btn} onPress={submit}><Text style={s.btnText}>Submit report</Text></TouchableOpacity>
    <Text style={s.section}>My reports</Text>
    {mine.length ? mine.map((r) => <ReportCard key={r.id} r={r} />) : <Text style={s.cardDesc}>No reports yet.</Text>}
  </>);
  else if (officer && tab === 0) body = (<>
    <Head title="Officer Overview" />
    <Text style={s.loc}>📍 {barangay}</Text>
    <View style={s.grid}><View style={[s.card, { width: '48%' }]}><Text style={s.big}>{open}</Text><Text style={s.cardDesc}>Open reports</Text></View><View style={[s.card, { width: '48%' }]}><Text style={s.big}>{reports.length - open}</Text><Text style={s.cardDesc}>Resolved</Text></View></View>
    <Text style={s.section}>Collection schedule</Text>
    {SCHED.map(([d, t, h]) => (<View key={t} style={s.card}><Text style={s.cardTitle}>{t}</Text><Text style={s.cardDesc}>{d} · {h}</Text></View>))}
  </>);
  else if (officer && tab === 1) body = (<><Head title="Resident Reports" />{reports.length ? reports.map((r) => <ReportCard key={r.id} r={r} />) : <Text style={s.cardDesc}>No reports.</Text>}</>);
  else if (officer && tab === 2) body = (<>
    <Head title="Push Alert" />
    <Text style={s.label}>Message to all residents</Text>
    <TextInput style={[s.input, { height: 80 }]} multiline placeholder="e.g. Pickup delayed by 1 hour today" placeholderTextColor="#8FA398" value={msg} onChangeText={setMsg} />
    <TouchableOpacity style={s.btn} onPress={pushAlert}><Text style={s.btnText}>Send alert</Text></TouchableOpacity>
    <Text style={s.section}>Sent alerts</Text><Updates />
  </>);
  else body = (<>
    <Head title="Profile" />
    {[['Name', user.name], ['Role', officer ? 'Barangay Officer' : 'Citizen / Resident'], ['Email', user.email], ['Mobile', user.phone], ['Barangay', barangay]].map(([k, v]) => (
      <View key={k} style={[s.card, s.rowBetween]}><Text style={s.cardDesc}>{k}</Text><Text style={s.cardTitle}>{v}</Text></View>))}
    <TouchableOpacity style={s.btn} onPress={onLogout}><Text style={s.btnText}>Log out</Text></TouchableOpacity>
  </>);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={s.scroll}>{body}</ScrollView>
      <View style={s.tabBar}>
        {tabs.map(([i, l], idx) => (
          <TouchableOpacity key={l} style={s.tab} onPress={() => { setTab(idx); setSub(null); }}>
            <Text style={{ fontSize: 17, opacity: tab === idx && !sub ? 1 : 0.5 }}>{i}</Text>
            <Text style={[s.tabText, tab === idx && !sub && s.tabTextOn]}>{l}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  scroll: { padding: 20, paddingBottom: 24 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greet: { fontSize: 12, color: C.muted },
  h1: { fontSize: 20, fontWeight: '800', color: C.ink },
  back: { fontSize: 13, fontWeight: '700', color: C.leaf, marginBottom: 10 },
  bell: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#fff', borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: -4, right: -4, backgroundColor: C.err, borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  loc: { fontSize: 12, fontWeight: '600', color: C.leaf, marginTop: 8, marginBottom: 16 },
  pickup: { backgroundColor: C.leaf, borderRadius: 18, padding: 18, marginBottom: 20 },
  pickupLabel: { fontSize: 10.5, fontWeight: '700', color: '#CFE7D9', letterSpacing: 0.5 },
  pickupBig: { fontSize: 24, fontWeight: '800', color: '#fff', marginTop: 4 },
  pickupSub: { fontSize: 12, color: '#DCEFE2', marginTop: 2 },
  section: { fontSize: 14, fontWeight: '800', color: C.ink, marginBottom: 10, marginTop: 6 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  action: { width: '48%', backgroundColor: '#fff', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: C.border },
  actionText: { fontSize: 12.5, fontWeight: '700', color: C.ink },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: C.border, marginBottom: 10 },
  cardTitle: { fontSize: 13, fontWeight: '700', color: C.ink, flexShrink: 1 },
  cardDesc: { fontSize: 11.5, color: C.muted, marginTop: 2 },
  big: { fontSize: 26, fontWeight: '800', color: C.leaf },
  update: { backgroundColor: C.amber, borderRadius: 12, padding: 12, marginBottom: 10 },
  updateTitle: { fontSize: 12.5, fontWeight: '700', color: C.amberText },
  updateDesc: { fontSize: 11.5, color: C.amberText, marginTop: 2 },
  label: { fontSize: 11.5, fontWeight: '700', color: C.ink, marginBottom: 7 },
  input: { backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: C.border, paddingHorizontal: 12, paddingVertical: 12, fontSize: 13, color: C.ink, marginBottom: 14 },
  chips: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  chip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 16, backgroundColor: C.chip },
  chipOn: { backgroundColor: C.leaf },
  chipText: { fontSize: 12, fontWeight: '700', color: C.leaf },
  btn: { backgroundColor: C.leaf, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 14 },
  btnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  smallBtn: { alignSelf: 'flex-start', backgroundColor: C.chip, borderRadius: 10, paddingVertical: 7, paddingHorizontal: 14, marginTop: 8 },
  smallBtnText: { fontSize: 12, fontWeight: '700', color: C.leaf },
  pill: { backgroundColor: C.amber, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  pillText: { fontSize: 10, fontWeight: '700', color: C.amberText },
  tabBar: { flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: C.border, paddingTop: 8, paddingBottom: 20 },
  tab: { flex: 1, alignItems: 'center' },
  tabText: { fontSize: 10, color: C.muted, marginTop: 2 },
  tabTextOn: { color: C.leaf, fontWeight: '700' },
});
