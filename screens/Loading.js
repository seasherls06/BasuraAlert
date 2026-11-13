import { useEffect, useRef, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

export default function Loading({ title, steps, onDone, ms = 2200 }) {
  const [p, setP] = useState(0);
  const done = useRef(onDone); done.current = onDone;

  useEffect(() => {
    const t0 = Date.now();
    const id = setInterval(() => {
      const v = Math.min(100, ((Date.now() - t0) / ms) * 100);
      setP(v);
      if (v >= 100) { clearInterval(id); setTimeout(() => done.current(), 250); }
    }, 40);
    return () => clearInterval(id);
  }, []);

  const step = steps[Math.min(steps.length - 1, Math.floor((p / 100) * steps.length))];
  return (
    <View style={s.wrap}>
      <ActivityIndicator size="large" color="#1B6B45" />
      <Text style={s.title}>{title}</Text>
      <Text style={s.step}>{step}</Text>
      <View style={s.track}><View style={[s.fill, { width: p + '%' }]} /></View>
      <Text style={s.pct}>{Math.round(p)}%</Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 36, backgroundColor: '#EAF6EC' },
  title: { fontSize: 20, fontWeight: '800', color: '#101915', marginTop: 22 },
  step: { fontSize: 13, color: '#5C6E64', marginTop: 6, marginBottom: 22, textAlign: 'center' },
  track: { width: '100%', height: 8, borderRadius: 4, backgroundColor: '#DCEEE0', overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: '#1B6B45', borderRadius: 4 },
  pct: { fontSize: 12, fontWeight: '700', color: '#1B6B45', marginTop: 10 },
});
