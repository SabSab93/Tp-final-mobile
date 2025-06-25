import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Battery from 'expo-battery';
import { useState } from 'react';
import { Alert, Button, StyleSheet, Text, View } from 'react-native';

export default function BatteryScreen() {
  const [level, setLevel] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchAndSend = async () => {
    try {
      setLoading(true);
      // 1. Lire le niveau de batterie (0–1)
      const raw = await Battery.getBatteryLevelAsync();
      const pct = Math.round(raw * 100);
      setLevel(pct);

      // 2. Récupérer le token stocké lors du login
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Token manquant – connectez‑vous d\'abord');

      // 3. Envoyer à l\'API
      const res = await fetch('https://back-dev-8z4a.onrender.com/batteries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ data: { level: pct } }),
      });

      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.message || 'Erreur API');
      }

      Alert.alert('Succès', `Niveau ${pct}% enregistré !`);
    } catch (err: any) {
      Alert.alert('Erreur', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Niveau de batterie actuel :</Text>
      <Text style={styles.level}>{level !== null ? `${level}%` : '—'}</Text>
      <Button title={loading ? '...' : 'Actualiser & envoyer'} onPress={fetchAndSend} disabled={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  title: { fontSize: 18 },
  level: { fontSize: 32, fontWeight: '700' },
});
