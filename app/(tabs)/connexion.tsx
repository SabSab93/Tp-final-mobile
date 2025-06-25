// app/(tabs)/connexion.tsx

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import {
  Alert,
  Button,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// URL de base lue depuis .env (EXPO_PUBLIC_API_URL)
const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'https://back-dev-8z4a.onrender.com';

export default function Connexion() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  const submit = async () => {
    if (!email || !password || (isRegister && (!firstName || !lastName))) {
      return Alert.alert('Erreur', 'Tous les champs sont obligatoires');
    }

    setLoading(true);
    try {
      const endpoint = isRegister
        ? '/api/auth/register'
        : '/api/auth/login';

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: isRegister
            ? { email, password, firstName, lastName }
            : { email, password },
        }),
      });

      const contentType = res.headers.get('content-type') || '';
      const data = contentType.includes('application/json')
        ? await res.json()
        : { message: await res.text() };

      if (!res.ok) {
        throw new Error(data.message || 'Erreur serveur');
      }

      if (data.token) {
        await AsyncStorage.setItem('token', data.token);
      }

      Alert.alert(
        'Succès',
        isRegister ? 'Compte créé !' : 'Connexion réussie !'
      );

      setEmail('');
      setPassword('');
      setFirstName('');
      setLastName('');
    } catch (err: any) {
      Alert.alert('Erreur', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isRegister ? 'Créer un compte' : 'Connexion'}
      </Text>

      {isRegister && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Prénom"
            value={firstName}
            onChangeText={setFirstName}
            placeholderTextColor="#aaa"
          />
          <TextInput
            style={styles.input}
            placeholder="Nom"
            value={lastName}
            onChangeText={setLastName}
            placeholderTextColor="#aaa"
          />
        </>
      )}

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        placeholderTextColor="#aaa"
      />

      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        placeholderTextColor="#aaa"
      />

      <Button
        title={loading ? '…' : isRegister ? 'Créer' : 'Se connecter'}
        onPress={submit}
        disabled={loading}
      />

      <TouchableOpacity
        onPress={() => setIsRegister(!isRegister)}
        style={styles.toggle}
      >
        <Text style={styles.toggleText}>
          {isRegister
            ? 'Déjà un compte ? Se connecter'
            : 'Pas encore de compte ? Créer'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#555',
    borderRadius: 6,
    padding: 10,
    color: '#fff',
    marginBottom: 16,
  },
  toggle: {
    marginTop: 12,
    alignItems: 'center',
  },
  toggleText: {
    color: '#4DA6FF',
  },
});
