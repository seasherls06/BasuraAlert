import { useEffect, useRef } from 'react';
import { View, Text, Image, Animated, StyleSheet } from 'react-native';

export default function Splash({ onDone }) {
  const scale = useRef(new Animated.Value(0.6)).current;
  const fade = useRef(new Animated.Value(0)).current;
  const done = useRef(onDone); done.current = onDone;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: false }),
      Animated.timing(fade, { toValue: 1, duration: 900, useNativeDriver: false }),
    ]).start();
    const id = setTimeout(() => done.current(), 2400);
    return () => clearTimeout(id);
  }, []);

  return (
    <View style={s.wrap}>
      <Animated.View style={{ opacity: fade, transform: [{ scale }], alignItems: 'center' }}>
        <Image source={require('../assets/splash-icon.png')} style={s.logo} />
        <Text style={s.name}>BasuraAlert</Text>
        <Text style={s.tag}>Cleaner barangays start with an alert.</Text>
      </Animated.View>
      <Text style={s.foot}>Eco-Civic Dispatch</Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EAF6EC' },
  logo: { width: 130, height: 130, marginBottom: 18 },
  name: { fontSize: 30, fontWeight: '800', color: '#101915' },
  tag: { fontSize: 13, color: '#5C6E64', marginTop: 6, paddingHorizontal: 30, textAlign: 'center' },
  foot: { position: 'absolute', bottom: 40, fontSize: 11, fontWeight: '700', color: '#1B6B45', letterSpacing: 0.6 },
});
