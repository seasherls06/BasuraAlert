import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

const C = { ink: '#101915', muted: '#5C6E64', leaf: '#1B6B45', chip: '#DCEEE0', border: '#DCEBE1', err: '#B23A2E' };
const norm = (v) => v.trim().toLowerCase().replace(/[\s-]/g, '');
const DEMO_CODE = '123456';

export default function ForgotPassword({ accounts, onReset, onBack, toast }) {
  const [step, setStep] = useState(1);
  const [contact, setContact] = useState('');
  const [found, setFound] = useState(null);
  const [code, setCode] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [err, setErr] = useState('');

  const sendCode = () => {
    const acc = accounts.find((a) => norm(a.email) === norm(contact) || norm(a.phone) === norm(contact));
    if (!acc) return setErr('No account found with that email or mobile number.');
    setFound(acc); setErr(''); setStep(2);
    toast('Verification code sent (demo code: ' + DEMO_CODE + ')');
  };
  const verify = () => {
    if (code.trim() !== DEMO_CODE) return setErr('Incorrect code. Try again.');
    setErr(''); setStep(3);
  };
  const save = () => {
    if (pw.length < 6) return setErr('Password must be at least 6 characters.');
    if (pw !== pw2) return setErr('Passwords do not match.');
    onReset(found.email, pw);
  };

  const titles = ['Forgot password?', 'Enter the code', 'Set a new password'];
  const subs = [
    "Enter the email or mobile number linked to your account and we'll send a verification code.",
    'We sent a 6-digit code to ' + (found ? found.email : '') + '. Enter it below.',
    'Choose a new password for your BasuraAlert account.',
  ];

  return (
    <View style={s.wrap}>
      <TouchableOpacity onPress={step === 1 ? onBack : () => { setErr(''); setStep(step - 1); }}>
        <Text style={s.back}>‹ {step === 1 ? 'Back to login' : 'Back'}</Text>
      </TouchableOpacity>
      <View style={s.iconCircle}><Text style={{ fontSize: 26 }}>{['🔑', '✉️', '🔒'][step - 1]}</Text></View>
      <Text style={s.title}>{titles[step - 1]}</Text>
      <Text style={s.sub}>{subs[step - 1]}</Text>

      {step === 1 && (<>
        <Text style={s.label}>Email or Mobile Number</Text>
        <TextInput style={s.input} placeholder="0917-000-0000 or resident@email.ph" placeholderTextColor="#8FA398" autoCapitalize="none" value={contact} onChangeText={setContact} />
      </>)}
      {step === 2 && (<>
        <Text style={s.label}>Verification code</Text>
        <TextInput style={s.input} placeholder="6-digit code" placeholderTextColor="#8FA398" keyboardType="number-pad" maxLength={6} value={code} onChangeText={setCode} />
        <TouchableOpacity onPress={() => toast('Code resent (demo code: ' + DEMO_CODE + ')')}><Text style={s.resend}>Resend code</Text></TouchableOpacity>
      </>)}
      {step === 3 && (<>
        <Text style={s.label}>New password</Text>
        <TextInput style={s.input} placeholder="At least 6 characters" placeholderTextColor="#8FA398" secureTextEntry value={pw} onChangeText={setPw} />
        <Text style={s.label}>Confirm new password</Text>
        <TextInput style={s.input} placeholder="Re-enter password" placeholderTextColor="#8FA398" secureTextEntry value={pw2} onChangeText={setPw2} />
      </>)}

      {err ? <Text style={s.err}>{err}</Text> : null}

      <TouchableOpacity style={s.btn} activeOpacity={0.85} onPress={[sendCode, verify, save][step - 1]}>
        <Text style={s.btnText}>{['Send code', 'Verify code', 'Save new password'][step - 1]}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onBack}><Text style={s.link}>Return to Portal Access</Text></TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, padding: 22 },
  back: { fontSize: 13, fontWeight: '700', color: C.leaf, marginBottom: 24 },
  iconCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: C.chip, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '800', color: C.ink, marginBottom: 8 },
  sub: { fontSize: 13, color: C.muted, lineHeight: 19, marginBottom: 22 },
  label: { fontSize: 11.5, fontWeight: '700', color: C.ink, marginBottom: 7 },
  input: { backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: C.border, paddingHorizontal: 12, paddingVertical: 13, fontSize: 13, color: C.ink, marginBottom: 14 },
  resend: { fontSize: 12, fontWeight: '700', color: C.leaf, marginBottom: 14 },
  err: { fontSize: 12, color: C.err, fontWeight: '600', marginBottom: 12 },
  btn: { backgroundColor: C.leaf, borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginBottom: 18 },
  btnText: { color: '#fff', fontSize: 14.5, fontWeight: '700' },
  link: { textAlign: 'center', fontSize: 12.5, fontWeight: '700', color: C.leaf },
});
