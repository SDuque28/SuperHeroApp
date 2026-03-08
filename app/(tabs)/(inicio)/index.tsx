/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║              HEROVERSE — INICIO (HOME) TAB               ║
 * ║          Comic Book Aesthetic · React Native             ║
 * ║  Created by Santiago Duque Robledo & Cesar Arias Posada  ║
 * ╚══════════════════════════════════════════════════════════╝
 *
 * DROP-IN REPLACEMENT for your app/(tabs)/index.tsx
 *
 * Dependencies (run these if not already installed):
 *   npx expo install expo-linear-gradient
 *   npx expo install expo-font @expo-google-fonts/bangers @expo-google-fonts/oswald
 *   npx expo install react-native-reanimated   ← already in most Expo projects
 *
 * Usage:
 *   Replace the contents of app/(tabs)/index.tsx with this file.
 *   The component is self-contained; all styles live at the bottom.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  StatusBar,
  Image,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Bangers_400Regular } from '@expo-google-fonts/bangers';
import { Oswald_400Regular, Oswald_700Bold } from '@expo-google-fonts/oswald';
import HalftoneOverlay from "@/src/components/HalftoneOverlay/HalftoneOverlay";
import ComicButton from '@/src/components/ComicButton/ComicButton';
import StatBar from '@/src/components/StatBar/StatBar';

// ─── Superhero API ──────────────────────────────────────────────────────────
const API_KEY = 'ddc92e6ed8ef5366368a9cff47b3dd8c'; // Replace with your key from superheroapi.com
const API_BASE = `https://superheroapi.com/api/${API_KEY}`;

// ─── Types ──────────────────────────────────────────────────────────────────
interface Hero {
  id: string;
  name: string;
  image: { url: string };
  biography: { publisher: string; 'full-name': string };
  powerstats: {
    intelligence: string;
    strength: string;
    speed: string;
    durability: string;
    power: string;
    combat: string;
  };
}

const { width: SCREEN_W } = Dimensions.get('window');

// ═══════════════════════════════════════════════════════════════════════════════
// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
export default function InicioScreen() {
  const [fontsLoaded] = useFonts({ Bangers_400Regular, Oswald_400Regular, Oswald_700Bold });
  const [randomHero, setRandomHero] = useState<Hero | null>(null);

  const fetchRandomHero = useCallback(async () => {
    const randomId = Math.floor(Math.random() * 731) + 1;
    try {
      // Make multiple calls for different sections
      const [bioRes, imageRes, statsRes] = await Promise.all([
        axios.get(`${API_BASE}/${randomId}/biography`),
        axios.get(`${API_BASE}/${randomId}/image`),
        axios.get(`${API_BASE}/${randomId}/powerstats`)
      ]);
      
      // Combine the data
      const combinedHero = {
        id: randomId.toString(),
        name: bioRes.data.name || `Hero ${randomId}`,
        biography: bioRes.data,
        image: imageRes.data,
        powerstats: statsRes.data
      };
      
      if (bioRes.data.response !== 'error') setRandomHero(combinedHero);
    } catch (e) {
      console.warn('Random hero fetch failed:', e);
    }
  }, []);


  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={"#FFD600"} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={'#1A1028'} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ══════════════════════════════════════════
            SECTION 1 — HERO BANNER
        ══════════════════════════════════════════ */}
        <LinearGradient
          colors={['#1A1028', '#1A0040', '#110030']}
          style={styles.heroBanner}
        >
          {/* Halftone overlay */}
          <HalftoneOverlay dotColor="rgba(255,214,0,0.07)" size={10} />

          {/* Action-line radial burst (simulated with a View) */}
          <View style={styles.actionLinesOverlay} pointerEvents="none" />

          {/* Eye-brow label */}
          <View style={styles.eyebrowWrap}>
            <View style={styles.eyebrow}>
              <Text style={styles.eyebrowText}>THE ULTIMATE HERO DATABASE</Text>
            </View>
          </View>

          {/* Main headline */}
          <View style={styles.headlineWrap}>
            <Text style={styles.headlineKnow}>KNOW YOUR</Text>
            <Text style={styles.headlineHeroes}>HEROES.</Text>
          </View>

          {/* Subheadline */}
          <Text style={styles.subHeadline}>
            Search stats, explore powers, and discover origin stories for every hero you ever loved.
          </Text>

          {/* CTA Buttons */}
          <View style={styles.heroCtas}>
            <ComicButton
              label="RANDOM HERO"
              onPress={fetchRandomHero}
              bg={'#E8173D'}
              color="#fff"
              shadowColor={'#1A1028'}
            />
          </View>
        </LinearGradient>

        {/* ══════════════════════════════════════════
            SECTION 2 — RANDOM HERO RESULT
        ══════════════════════════════════════════ */}
        {randomHero &&  (
          <View style={styles.randomHeroSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionLabelLine} />
              <Text style={styles.sectionLabel}>RANDOM HERO</Text>
            </View>
            <View style={styles.randomHeroCard}>
              {/* Accent strip */}
              <View style={[styles.randomHeroStripe, { backgroundColor: '#E8173D' }]} />
              <Image
                source={{ 
                  uri: randomHero.image.url, 
                  headers: {
                    'User-Agent': 'Mozilla/5.0',
                    'Referer': 'https://superheroapi.com/'
                  }
                }}
                style={styles.randomHeroImage}
                resizeMode="cover"
                onError={(e) => {
                  console.log('Image failed to load:', randomHero.image.url, e.nativeEvent.error);
                  // You could set a fallback image here if needed
                }}
              />
              <View style={styles.randomHeroBody}>
                <Text style={styles.randomHeroName}>{randomHero.name.toUpperCase()}</Text>
                <Text style={styles.randomHeroPublisher}>
                  {randomHero.biography.publisher || 'Unknown Publisher'}
                </Text>
                <View style={styles.randomHeroStats}>
                  {Object.entries(randomHero.powerstats)
                    .filter(([, v]) => v !== 'null')
                    .slice(0, 4)
                    .map(([key, val]) => (
                      <StatBar
                        key={key}
                        label={key.toUpperCase().slice(0, 3)}
                        value={Number(val)}
                        color={'#E8173D'}
                      />
                    ))}
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── STYLES ──────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  // Root
  root: { flex: 1, backgroundColor: '#1A1028' },
  scroll: { flex: 1},
  scrollContent: { paddingBottom: 0 },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#1A1028',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── HERO BANNER ─────────────────────────────────────────────────────────────
  heroBanner: {
    paddingTop: 40,
    paddingBottom: 50,
    paddingHorizontal: 24,
    overflow: 'hidden',
  },
  actionLinesOverlay: {
    ...StyleSheet.absoluteFillObject,
    // Simulated radial lines via a very subtle overlay
    opacity: 0.04,
    backgroundColor: '#FFD600',
  },
  eyebrowWrap: { alignItems: 'flex-start', marginBottom: 20 },
  eyebrow: {
    backgroundColor: '#1A1028',
    borderWidth: 2,
    borderColor: '#FFD600',
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  eyebrowText: {
    fontFamily: 'Oswald_700Bold',
    fontSize: 11,
    letterSpacing: 3,
    color: '#FFD600',
    textTransform: 'uppercase',
  },
  pulsingBadge: {
    backgroundColor: '#E8173D',
    borderWidth: 3,
    borderColor: '#1A1028',
    paddingHorizontal: 10,
    paddingVertical: 5,
    shadowColor: '#1A1028',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  pulsingBadgeText: {
    fontFamily: 'Bangers_400Regular',
    fontSize: 13,
    letterSpacing: 2,
    color: '#fff',
  },
  headlineWrap: { marginBottom: 14 },
  headlineKnow: {
    fontFamily: 'Bangers_400Regular',
    fontSize: 52,
    letterSpacing: 3,
    color: '#fff',
    lineHeight: 52 * 1.0,
    // Simulated text stroke via text shadow layering
    textShadowColor: '#1A1028',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  headlineHeroes: {
    fontFamily: 'Bangers_400Regular',
    fontSize: 52 * 1.3,
    letterSpacing: 3,
    color: '#FFD600',
    lineHeight: 52 * 1.2,
    textShadowColor: '#1A1028',
    textShadowOffset: { width: 4, height: 4 },
    textShadowRadius: 0,
  },
  subHeadline: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 22,
    marginBottom: 28,
    maxWidth: SCREEN_W * 0.8,
  },
  heroCtas: {
    flexDirection: 'row',
    gap: 14,
    flexWrap: 'wrap',
    marginBottom: 24,
  },

  // ── RANDOM HERO SECTION ──────────────────────────────────────────────────────
  randomHeroSection: {
    backgroundColor: '#FFF3D6',
    borderBottomWidth: 5,
    borderBottomColor: '#1A1028',
    padding: 24,
  },
  randomHeroCard: {
    backgroundColor: '#0A0A2E',
    borderWidth: 3,
    borderColor: '#1A1028',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#1A1028',
    shadowOffset: { width: 7, height: 7 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
    flexDirection: 'row',
  },
  randomHeroStripe: {
    width: 6,
    alignSelf: 'stretch',
  },
  randomHeroImage: {
    width: 130,
    height: 180,
  },
  randomHeroBody: {
    flex: 1,
    padding: 16,
  },
  randomHeroName: {
    fontFamily: 'Bangers_400Regular',
    fontSize: 22,
    letterSpacing: 2,
    color: '#FFD600',
    textShadowColor: '#1A1028',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
    marginBottom: 2,
  },
  randomHeroPublisher: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 10,
    letterSpacing: 2,
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  randomHeroStats: { gap: 6 },

  // ── SECTION COMMON ───────────────────────────────────────────────────────────
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  sectionLabelLine: {
    width: 30,
    height: 3,
    backgroundColor: '#E8173D',
  },
  sectionLabel: {
    fontFamily: 'Oswald_700Bold',
    fontSize: 11,
    letterSpacing: 4,
    color: '#E8173D',
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontFamily: 'Bangers_400Regular',
    fontSize: 32,
    letterSpacing: 2,
    color: '#1A1028',
    paddingHorizontal: 24,
    marginBottom: 6,
    textShadowColor: '#FFD600',
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 0,
  },
  sectionSub: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 13,
    color: '#666',
    paddingHorizontal: 24,
    marginBottom: 20,
    lineHeight: 20,
  },
  loadingRow: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 14,
  },
  loadingText: {
    fontFamily: 'Bangers_400Regular',
    fontSize: 20,
    letterSpacing: 3,
    color: '#1A1028',
  },
});