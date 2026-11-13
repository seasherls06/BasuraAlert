import { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import ForgotPassword from './screens/ForgotPassword';
import Dashboard from './screens/Dashboard';
import Splash from './screens/Splash';
import Loading from './screens/Loading';
import { AppProvider, useApp, BRGYS } from './store';

const COLORS = {
  bg: '#EAF6EC',
  surface: '#FFFFFF',
  ink: '#101915',
  muted: '#5C6E64',
  leaf: '#1F7A4C',
  leafDark: '#1B6B45',
  chip: '#DCEEE0',
  chipText: '#1B6B45',
  border: '#DCEBE1',
  legalBg: '#E3F3E6',
};

const FEATURES = [
  { icon: '🔔', badge: 'Automated', title: 'Schedule Reminders', desc: 'Never miss biodegradable and residual pickup hours with automated SMS & push alerts.' },
  { icon: '🚚', badge: 'Live', title: 'Truck Tracking', desc: 'See real-time GPS truck location and barangay compliance approaches you.' },
  { icon: '✅', badge: 'Verified', title: 'Verified Reports', desc: 'Barangay staff confirm and close out every resident-submitted report.' },
];

export default function App() {
  return (
    <AppProvider>
      <Main />
    </AppProvider>
  );
}

function Main() {
  const [tab, setTab] = useState('resident'); // 'resident' | 'officer'
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const { state, dispatch } = useApp();
  const { screen, accounts, brgyIdx } = state;
  const [loginError, setLoginError] = useState('');
  const [notice, setNotice] = useState('');
  const setScreen = (s) => dispatch({ type: 'NAV', screen: s });
  const flash = (m) => { setNotice(m); setTimeout(() => setNotice(''), 3000); };
  useEffect(() => { if (screen === 'login') { setPassword(''); setLoginError(''); } }, [screen]);
  const handleLogin = () => {
    const q = contact.trim().toLowerCase().replace(/[\s-]/g, '');
    if (!q || !password) return setLoginError('Please enter your email/mobile number and password.');
    const acc = accounts.find((a) => a.email === q || a.phone.replace(/-/g, '') === q);
    if (!acc) return setLoginError('No account found with those details.');
    if (acc.role !== tab) return setLoginError('This account is registered as ' + (acc.role === 'officer' ? 'a Barangay Officer' : 'a Citizen / Resident') + '. Switch the tab above.');
    if (acc.password !== password) return setLoginError('Incorrect password. Tap "Forgot?" to reset it.');
    setLoginError(''); dispatch({ type: 'LOGIN', user: acc });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.phoneBody}>
        <View style={styles.notch}><View style={styles.notchPill} /></View>
        <View style={styles.screen}>
          <View style={styles.fakeStatusBar}>
            <Text style={styles.fakeStatusTime}>9:41</Text>
            <View style={styles.fakeStatusRight}>
              <Text style={styles.fakeStatusIcon}>5G</Text>
              <Text style={styles.fakeStatusIcon}>🔋</Text>
            </View>
          </View>
      {notice ? (<View style={styles.toast} pointerEvents="none"><Text style={styles.toastText}>{notice}</Text></View>) : null}
      {screen === 'splash' ? (
        <Splash onDone={() => setScreen('loading')} />
      ) : screen === 'loading' ? (
        <Loading title="Starting BasuraAlert" steps={['Loading collection schedules...', 'Connecting to your barangay...', 'Almost ready...']} onDone={() => setScreen('login')} />
      ) : screen === 'loadingDash' ? (
        <Loading title="Signing you in" ms={1600} steps={['Verifying your account...', 'Syncing reports and alerts...', 'Opening your dashboard...']} onDone={() => setScreen('dashboard')} />
      ) : screen === 'forgot' ? (
        <ForgotPassword accounts={accounts} toast={flash} onBack={() => setScreen('login')} onReset={(email, pw) => { dispatch({ type: 'RESET_PASSWORD', email, password: pw }); flash('Password updated. Log in with your new password.'); }} />
      ) : screen === 'dashboard' ? (
        <Dashboard toast={flash} />
      ) : (
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <View style={styles.logoMark}><Text style={styles.logoEmoji}>🗑️</Text></View>
            <View>
              <Text style={styles.brandName}>BasuraAlert</Text>
              <Text style={styles.brandSub}>Eco-Civic Dispatch</Text>
            </View>
          </View>
          <View style={styles.cloudBadge}>
            <View style={styles.cloudDot} />
            <Text style={styles.cloudBadgeText}>CIVIC CLOUD</Text>
          </View>
        </View>

        {/* Location bar */}
        <View style={styles.locationBar}>
          <View style={styles.locationLeft}>
            <Text style={styles.locationPin}>📍</Text>
            <Text style={styles.locationText}>{BRGYS[brgyIdx]}</Text>
          </View>
          <TouchableOpacity style={styles.changeChip} activeOpacity={0.7} onPress={() => { dispatch({ type: 'NEXT_BARANGAY' }); flash('Barangay changed.'); }}>
            <Text style={styles.changeChipText}>Change ▾</Text>
          </TouchableOpacity>
        </View>

        {/* Hero */}
        <Text style={styles.heroTitle}>Cleaner barangays start with an alert.</Text>
        <Text style={styles.heroSubtitle}>
          Real-time waste collection schedules, live hauler truck tracking,
          and direct barangay sanitation reporting right at your fingertips.
        </Text>

        {/* Section label */}
        <View style={styles.sectionLabelRow}>
          <Text style={styles.sectionLabel}>SANITATION SERVICES</Text>
          <Text style={styles.swipeLabel}>Swipe to view →</Text>
        </View>

        {/* Feature carousel */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featureScroll}
        >
          {FEATURES.map((f) => (
            <View key={f.title} style={styles.featureCard}>
              <View style={styles.featureTopRow}>
                <View style={styles.featureIconCircle}><Text style={styles.featureIcon}>{f.icon}</Text></View>
                <View style={styles.featureBadge}><Text style={styles.featureBadgeText}>{f.badge}</Text></View>
              </View>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Compliance banner */}
        <View style={styles.banner}>
          <View style={styles.bannerTopRow}>
            <Text style={styles.bannerLabel}>🍃 COMMUNITY MILESTONE</Text>
            <View style={styles.excellentBadge}><Text style={styles.excellentBadgeText}>EXCELLENT</Text></View>
          </View>
          <View style={styles.complianceRow}>
            <Text style={styles.complianceLabel}>Barangay Waste Compliance</Text>
            <Text style={styles.compliancePct}>94.8%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: '94.8%' }]} />
          </View>
          <Text style={styles.householdsText}>👥 3,420 households actively segregating this month</Text>
        </View>

        {/* Portal Access */}
        <View style={styles.portalCard}>
          <Text style={styles.portalTitle}>Portal Access</Text>
          <Text style={styles.portalSub}>Sign in to sync your household or access municipal management.</Text>

          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tabBtn, tab === 'resident' && styles.tabBtnActive]}
              onPress={() => setTab('resident')}
            >
              <Text style={[styles.tabLabel, tab === 'resident' && styles.tabLabelActive]}>
                Citizen / Resident
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabBtn, tab === 'officer' && styles.tabBtnActive]}
              onPress={() => setTab('officer')}
            >
              <Text style={[styles.tabLabel, tab === 'officer' && styles.tabLabelActive]}>
                Barangay Officer
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.oauthBtn} activeOpacity={0.8} onPress={() => flash('Google sign-in is a demo only. Please log in with your email or mobile number.')}>
            <Text style={styles.oauthIcon}>G</Text>
            <Text style={styles.oauthLabel}>Continue with Google</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.oauthBtn} activeOpacity={0.8} onPress={() => flash('PhilSys ID sign-in is a demo only. Please log in with your email or mobile number.')}>
            <Text style={styles.oauthIcon}>🪪</Text>
            <Text style={styles.oauthLabel}>Continue with National / PhilSys ID</Text>
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or enter with verified credentials</Text>
            <View style={styles.dividerLine} />
          </View>

          <Text style={styles.fieldLabel}>Email or Mobile Number</Text>
          <View style={styles.inputRow}>
            <Text style={styles.inputIcon}>@</Text>
            <TextInput
              style={styles.inputFlex}
              placeholder="0917-000-0000 or resident@email.ph"
              placeholderTextColor="#8FA398"
              autoCapitalize="none"
              value={contact}
              onChangeText={setContact}
            />
          </View>

          <View style={styles.labelRow}>
            <Text style={styles.fieldLabel}>Password</Text>
            <TouchableOpacity onPress={() => setScreen('forgot')}><Text style={styles.forgotLink}>Forgot?</Text></TouchableOpacity>
          </View>
          <View style={styles.inputRow}>
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput
              style={styles.inputFlex}
              placeholder="Enter your password"
              placeholderTextColor="#8FA398"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          {loginError ? <Text style={styles.loginError}>{loginError}</Text> : null}
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setKeepSignedIn(!keepSignedIn)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, keepSignedIn && styles.checkboxOn]}>
              {keepSignedIn && <Text style={styles.checkMark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>Stay signed in on this household phone</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.85} onPress={handleLogin}>
            <Text style={styles.primaryBtnLabel}>Enter BasuraAlert</Text>
            <Text style={styles.primaryBtnArrow}>→</Text>
          </TouchableOpacity>
          <Text style={styles.footerText}>
            New to the barangay? <Text style={styles.link} onPress={() => flash('Registration is done at your barangay hall. Please contact your barangay hall.')}>Register your household</Text>
          </Text>
        </View>

        {/* Legal notice */}
        <View style={styles.legalCard}>
          <Text style={styles.legalIcon}>🛡️</Text>
          <Text style={styles.legalText}>
            Protected under the Philippine Data Privacy Act of 2012 & compliant with
            RA 9003 (Ecological Solid Waste Management Act).
          </Text>
        </View>

      </ScrollView>
      )}
          <View style={styles.homeIndicator}><View style={styles.homeIndicatorBar} /></View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#15181A', alignItems: 'center', justifyContent: 'center', padding: 24 },
  phoneBody: {
    width: 380,
    height: 780,
    backgroundColor: '#0B0D0C',
    borderRadius: 52,
    padding: 14,
    position: 'relative',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 20 },
    elevation: 10,
  },
  notch: {
    position: 'absolute',
    top: 14,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  toast: { position: 'absolute', top: 46, left: 16, right: 16, zIndex: 30, backgroundColor: '#101915', borderRadius: 12, paddingVertical: 11, paddingHorizontal: 14 },
  toastText: { color: '#fff', fontSize: 12, fontWeight: '600', textAlign: 'center' },
  loginError: { color: '#B23A2E', fontSize: 12, fontWeight: '600', marginBottom: 12 },
  demoBox: { backgroundColor: '#E3F3E6', borderRadius: 10, padding: 10, marginBottom: 14 },
  demoTitle: { fontSize: 9.5, fontWeight: '800', color: '#1B6B45', letterSpacing: 0.5, marginBottom: 3 },
  demoText: { fontSize: 11, color: '#1B6B45' },
  notchPill: {
    width: 120,
    height: 26,
    backgroundColor: '#0B0D0C',
    borderRadius: 16,
  },
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
    borderRadius: 38,
    overflow: 'hidden',
    position: 'relative',
  },
  fakeStatusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 26,
    paddingTop: 16,
    paddingBottom: 4,
  },
  fakeStatusTime: { fontSize: 13, fontWeight: '700', color: COLORS.ink },
  fakeStatusRight: { flexDirection: 'row', gap: 5, alignItems: 'center' },
  fakeStatusIcon: { fontSize: 11, fontWeight: '700', color: COLORS.ink },
  homeIndicator: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  homeIndicatorBar: {
    width: 120,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.ink,
    opacity: 0.3,
  },
  scroll: { padding: 20, paddingBottom: 48 },

  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoMark: {
    width: 42, height: 42, borderRadius: 12,
    backgroundColor: COLORS.leafDark, alignItems: 'center', justifyContent: 'center',
  },
  logoEmoji: { fontSize: 19 },
  brandName: { fontSize: 17, fontWeight: '800', color: COLORS.ink },
  brandSub: { fontSize: 11, color: COLORS.muted, marginTop: 1 },
  cloudBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: COLORS.surface, borderRadius: 14, paddingHorizontal: 9, paddingVertical: 5,
    borderWidth: 1, borderColor: COLORS.border,
  },
  cloudDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.leaf },
  cloudBadgeText: { fontSize: 9, fontWeight: '700', color: COLORS.chipText, letterSpacing: 0.3 },

  locationBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12,
    marginBottom: 20, borderWidth: 1, borderColor: COLORS.border,
  },
  locationLeft: { flexDirection: 'row', alignItems: 'center', gap: 7, flexShrink: 1 },
  locationPin: { fontSize: 13 },
  locationText: { fontSize: 12.5, fontWeight: '600', color: COLORS.ink, flexShrink: 1 },
  changeChip: { backgroundColor: COLORS.chip, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5 },
  changeChipText: { fontSize: 11, fontWeight: '700', color: COLORS.chipText },

  heroTitle: { fontSize: 27, fontWeight: '800', color: COLORS.ink, lineHeight: 33, marginBottom: 10 },
  heroSubtitle: { fontSize: 13.5, color: COLORS.muted, lineHeight: 20, marginBottom: 22 },

  sectionLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionLabel: { fontSize: 10.5, fontWeight: '700', color: COLORS.muted, letterSpacing: 0.6 },
  swipeLabel: { fontSize: 11, fontWeight: '600', color: COLORS.leafDark },

  featureScroll: { gap: 12, paddingRight: 8, marginBottom: 22 },
  featureCard: {
    width: 210, backgroundColor: COLORS.surface, borderRadius: 16, padding: 15,
    borderWidth: 1, borderColor: COLORS.border,
  },
  featureTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  featureIconCircle: {
    width: 34, height: 34, borderRadius: 17, backgroundColor: COLORS.chip,
    alignItems: 'center', justifyContent: 'center',
  },
  featureIcon: { fontSize: 15 },
  featureBadge: { backgroundColor: COLORS.chip, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  featureBadgeText: { fontSize: 9.5, fontWeight: '700', color: COLORS.chipText },
  featureTitle: { fontSize: 14.5, fontWeight: '700', color: COLORS.ink, marginBottom: 5 },
  featureDesc: { fontSize: 11.5, color: COLORS.muted, lineHeight: 16 },

  banner: { backgroundColor: COLORS.leafDark, borderRadius: 18, padding: 18, marginBottom: 20 },
  bannerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  bannerLabel: { fontSize: 11, fontWeight: '700', color: '#CFE7D9', letterSpacing: 0.3 },
  excellentBadge: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10, paddingHorizontal: 9, paddingVertical: 4 },
  excellentBadgeText: { fontSize: 9.5, fontWeight: '800', color: '#fff' },
  complianceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 },
  complianceLabel: { fontSize: 12.5, fontWeight: '600', color: '#DCEFE2', flexShrink: 1 },
  compliancePct: { fontSize: 24, fontWeight: '800', color: '#fff' },
  progressTrack: { height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.22)', marginBottom: 12, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4, backgroundColor: '#fff' },
  householdsText: { fontSize: 11.5, color: '#CFE7D9' },

  portalCard: {
    backgroundColor: COLORS.surface, borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 16,
  },
  portalTitle: { fontSize: 20, fontWeight: '800', color: COLORS.ink, marginBottom: 6 },
  portalSub: { fontSize: 12, color: COLORS.muted, marginBottom: 18, lineHeight: 17 },

  tabRow: { flexDirection: 'row', backgroundColor: COLORS.bg, borderRadius: 12, padding: 4, marginBottom: 18 },
  tabBtn: { flex: 1, paddingVertical: 11, borderRadius: 9, alignItems: 'center' },
  tabBtnActive: { backgroundColor: COLORS.leafDark },
  tabLabel: { fontSize: 12, fontWeight: '700', color: COLORS.muted },
  tabLabelActive: { color: '#fff' },

  oauthBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: COLORS.bg, borderRadius: 10, paddingVertical: 13, marginBottom: 10,
    borderWidth: 1, borderColor: COLORS.border,
  },
  oauthIcon: { fontSize: 14, fontWeight: '800' },
  oauthLabel: { fontSize: 12.5, fontWeight: '600', color: COLORS.ink },

  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: { fontSize: 10.5, fontWeight: '600', color: COLORS.muted },

  fieldLabel: { fontSize: 11.5, fontWeight: '700', color: COLORS.ink, marginBottom: 7 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  forgotLink: { fontSize: 11.5, fontWeight: '700', color: COLORS.leafDark, marginBottom: 7 },

  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.bg, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: 12, marginBottom: 16,
  },
  inputIcon: { fontSize: 14 },
  inputFlex: { flex: 1, paddingVertical: 12, fontSize: 13, color: COLORS.ink },
  eyeIcon: { fontSize: 15 },

  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 18 },
  checkbox: {
    width: 18, height: 18, borderRadius: 5, borderWidth: 1.5, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg,
  },
  checkboxOn: { backgroundColor: COLORS.leaf, borderColor: COLORS.leaf },
  checkMark: { color: '#fff', fontSize: 11, fontWeight: '800' },
  checkboxLabel: { fontSize: 12, color: COLORS.ink },

  primaryBtn: {
    flexDirection: 'row', gap: 8, backgroundColor: COLORS.leafDark, borderRadius: 12, paddingVertical: 15,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  primaryBtnLabel: { fontSize: 14.5, fontWeight: '700', color: '#fff' },
  primaryBtnArrow: { fontSize: 14.5, fontWeight: '700', color: '#fff' },

  footerText: { textAlign: 'center', fontSize: 12, color: COLORS.muted },
  link: { color: COLORS.leafDark, fontWeight: '700' },

  legalCard: {
    flexDirection: 'row', gap: 10, backgroundColor: COLORS.legalBg,
    borderRadius: 14, padding: 14, alignItems: 'flex-start',
  },
  legalIcon: { fontSize: 15 },
  legalText: { flex: 1, fontSize: 11, color: COLORS.chipText, lineHeight: 15.5 },
});
