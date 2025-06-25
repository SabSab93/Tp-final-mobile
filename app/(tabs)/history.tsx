// app/(tabs)/history.tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// URL de base configurée dans .env
const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'https://back-dev-8z4a.onrender.com';

type BatteryEntry = {
  id: string;
  level: number;
  recordedAt: string;
};

export default function History() {
  const [history, setHistory] = useState<BatteryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) throw new Error('Utilisateur non authentifié');

        const res = await fetch(`${API_URL}/api/batteries`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          throw new Error(json.message || `Erreur ${res.status}`);
        }

        const data: BatteryEntry[] = await res.json();
        setHistory(data);
      } catch (err: any) {
        Alert.alert('Erreur', err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (history.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Aucun historique de batterie.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.entry}>
            <Text style={styles.text}>Niveau : {item.level}%</Text>
            <Text style={styles.text}>
              Date : {new Date(item.recordedAt).toLocaleString()}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 16,
  },
  loaderContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  entry: {
    marginBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#555',
    paddingBottom: 8,
  },
  text: {
    color: '#fff',
    fontSize: 16,
  },
  emptyText: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
  },
});
