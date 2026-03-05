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

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { useFonts, Bangers_400Regular } from '@expo-google-fonts/bangers';
import { Oswald_400Regular, Oswald_700Bold } from '@expo-google-fonts/oswald';

// ─── Superhero API ──────────────────────────────────────────────────────────
const API_KEY = 'ddc92e6ed8ef5366368a9cff47b3dd8c'; // Replace with your key from superheroapi.com
const API_BASE = `https://superheroapi.com/api/${API_KEY}`;

// Curated featured hero IDs (spectacular visual variety)
const FEATURED_IDS = [70, 195, 332, 387, 583, 720]; // Batman, Captain America, Ironman, Thor, Spider-Man, Wonder Woman

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

// ─── THEME ───────────────────────────────────────────────────────────────────
export const COMIC = {
  // Core palette – mirrors the landing page exactly
  red: '#E8173D',
  yellow: '#FFD600',
  blue: '#0057FF',
  ink: '#1A1028',
  paper: '#FFF9EE',
  paper2: '#FFF3D6',
  darkBg: '#0A0A2E',
  darkBg2: '#1A0040',

  // Typography sizes
  heroTitle: 52,
  sectionTitle: 32,
  cardTitle: 18,
  body: 14,
  label: 11,

  // Comic border radius (mostly sharp)
  radius: 4,
  radiusCard: 8,

  // Ink borders
  borderWidth: 3,
  borderWidthThick: 5,
};

// ─── HALFTONE DOT PATTERN (pure RN, no SVG dep) ──────────────────────────────
// We simulate Ben-Day dots with a repeating grid of tiny View dots.
const HalftoneOverlay: React.FC<{ color?: string; dotColor?: string; size?: number }> = ({
  color = 'transparent',
  dotColor = 'rgba(0,0,0,0.06)',
  size = 8,
}) => {
  const cols = Math.ceil(SCREEN_W / size) + 2;
  const rows = 14; // enough for most containers
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: rows }).map((_, r) => (
        <View key={r} style={{ flexDirection: 'row' }}>
          {Array.from({ length: cols }).map((_, c) => (
            <View
              key={c}
              style={{
                width: size,
                height: size,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <View
                style={{
                  width: size * 0.3,
                  height: size * 0.3,
                  borderRadius: size,
                  backgroundColor: dotColor,
                }}
              />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};

// ─── COMIC BURST LABEL (POW!, ZAP! style) ────────────────────────────────────
const BurstLabel: React.FC<{
  text: string;
  bg?: string;
  color?: string;
  rotate?: number;
  style?: object;
}> = ({ text, bg = COMIC.yellow, color = COMIC.ink, rotate = -8, style }) => (
  <View
    style={[
      {
        backgroundColor: bg,
        borderWidth: COMIC.borderWidth,
        borderColor: COMIC.ink,
        paddingHorizontal: 10,
        paddingVertical: 3,
        transform: [{ rotate: `${rotate}deg` }],
        shadowColor: COMIC.ink,
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 6,
      },
      style,
    ]}
  >
    <Text
      style={{
        fontFamily: 'Bangers_400Regular',
        fontSize: 14,
        letterSpacing: 2,
        color,
      }}
    >
      {text}
    </Text>
  </View>
);

// ─── COMIC BUTTON ────────────────────────────────────────────────────────────
const ComicButton: React.FC<{
  label: string;
  emoji?: string;
  onPress: () => void;
  bg?: string;
  color?: string;
  shadowColor?: string;
  style?: object;
}> = ({
  label,
  emoji,
  onPress,
  bg = COMIC.yellow,
  color = COMIC.ink,
  shadowColor = COMIC.ink,
  style,
}) => {
  const scale = useSharedValue(1);
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateX: offsetX.value }, { translateY: offsetY.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.94, { damping: 10 });
    offsetX.value = withTiming(3, { duration: 80 });
    offsetY.value = withTiming(3, { duration: 80 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 8 });
    offsetX.value = withTiming(0, { duration: 120 });
    offsetY.value = withTiming(0, { duration: 120 });
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      {/* Hard ink shadow offset layer */}
      <View
        style={[
          {
            backgroundColor: shadowColor,
            borderRadius: COMIC.radius,
            position: 'absolute',
            top: 5,
            left: 5,
            right: -5,
            bottom: -5,
          },
        ]}
      />
      <Animated.View
        style={[
          {
            backgroundColor: bg,
            borderWidth: COMIC.borderWidth,
            borderColor: COMIC.ink,
            borderRadius: COMIC.radius,
            paddingVertical: 13,
            paddingHorizontal: 22,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          },
          animStyle,
          style,
        ]}
      >
        {emoji && <Text style={{ fontSize: 18 }}>{emoji}</Text>}
        <Text
          style={{
            fontFamily: 'Bangers_400Regular',
            fontSize: 18,
            letterSpacing: 2,
            color,
          }}
        >
          {label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

// ─── HERO CARD (featured) ────────────────────────────────────────────────────
const HeroCard: React.FC<{ hero: Hero; onPress: () => void; accent: string }> = ({
  hero,
  onPress,
  accent,
}) => {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const stats = hero.powerstats;
  const topStat = Object.entries(stats)
    .filter(([, v]) => v !== 'null')
    .sort(([, a], [, b]) => Number(b) - Number(a))[0];

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.96); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      activeOpacity={1}
    >
      <Animated.View style={[styles.heroCard, { borderColor: COMIC.ink }, animStyle]}>
        {/* Accent top stripe */}
        <View style={[styles.heroCardStripe, { backgroundColor: accent }]} />

        {/* Hard shadow */}
        <View style={[styles.heroCardShadow, { backgroundColor: accent }]} />

        {/* Hero image */}
        <View style={styles.heroCardImageWrap}>
          <Image
            source={{ uri: hero.image.url }}
            style={styles.heroCardImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(10,10,46,0.95)']}
            style={StyleSheet.absoluteFill}
          />
        </View>

        {/* Info */}
        <View style={styles.heroCardInfo}>
          <Text style={styles.heroCardName} numberOfLines={1}>
            {hero.name.toUpperCase()}
          </Text>
          <Text style={styles.heroCardPublisher} numberOfLines={1}>
            {hero.biography.publisher || 'Unknown Publisher'}
          </Text>
          {topStat && (
            <View style={styles.heroCardStatPill}>
              <Text style={styles.heroCardStatText}>
                {topStat[0].toUpperCase()}: {topStat[1]}
              </Text>
            </View>
          )}
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

// ─── QUICK ACTION PANEL ───────────────────────────────────────────────────────
const ActionPanel: React.FC<{
  emoji: string;
  title: string;
  subtitle: string;
  bg: string;
  onPress: () => void;
  burst?: string;
}> = ({ emoji, title, subtitle, bg, onPress, burst }) => {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.95); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      activeOpacity={1}
      style={{ flex: 1 }}
    >
      {/* Ink shadow */}
      <View style={[styles.actionPanelShadow, { backgroundColor: COMIC.ink }]} />
      <Animated.View style={[styles.actionPanel, { backgroundColor: bg }, animStyle]}>
        <HalftoneOverlay dotColor="rgba(255,255,255,0.08)" size={10} />
        <Text style={styles.actionEmoji}>{emoji}</Text>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
        {burst && (
          <BurstLabel
            text={burst}
            bg={COMIC.yellow}
            color={COMIC.ink}
            rotate={10}
            style={styles.actionBurst}
          />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

// ─── STAT BAR ────────────────────────────────────────────────────────────────
const StatBar: React.FC<{ label: string; value: number; color: string }> = ({
  label,
  value,
  color,
}) => {
  const barWidth = useSharedValue(0);
  useEffect(() => {
    barWidth.value = withTiming(value / 100, { duration: 800, easing: Easing.out(Easing.quad) });
  }, [value]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${barWidth.value * 100}%`,
  }));

  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <View style={styles.statBarBg}>
        <Animated.View style={[styles.statBarFill, { backgroundColor: color }, barStyle]} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
};

// ─── PULSING BADGE ───────────────────────────────────────────────────────────
const PulsingBadge: React.FC<{ text: string }> = ({ text }) => {
  const scale = useSharedValue(1);
  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1
    );
  }, []);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={[styles.pulsingBadge, animStyle]}>
      <Text style={styles.pulsingBadgeText}>{text}</Text>
    </Animated.View>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
export default function InicioScreen() {
  const [fontsLoaded] = useFonts({ Bangers_400Regular, Oswald_400Regular, Oswald_700Bold });
  const [featuredHeroes, setFeaturedHeroes] = useState<Hero[]>([]);
  const [loading, setLoading] = useState(true);
  const [randomHero, setRandomHero] = useState<Hero | null>(null);

  // Floating animation for the hero banner graphic
  const floatY = useSharedValue(0);
  useEffect(() => {
    floatY.value = withRepeat(
      withSequence(withTiming(-10, { duration: 2000 }), withTiming(0, { duration: 2000 })),
      -1
    );
  }, []);
  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));

  // Fetch featured heroes
  useEffect(() => {
    const fetchHeroes = async () => {
      try {
        const results = await Promise.all(
          FEATURED_IDS.map((id) =>
            fetch(`${API_BASE}/${id}`).then((r) => r.json())
          )
        );
        setFeaturedHeroes(results.filter((h) => h.response !== 'error'));
      } catch (e) {
        console.warn('Failed to fetch heroes:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchHeroes();
  }, []);

  const fetchRandomHero = useCallback(async () => {
    const randomId = Math.floor(Math.random() * 731) + 1;
    try {
      const res = await fetch(`${API_BASE}/${randomId}`);
      const data = await res.json();
      if (data.response !== 'error') setRandomHero(data);
    } catch (e) {
      console.warn('Random hero fetch failed:', e);
    }
  }, []);

  const CARD_ACCENTS = [COMIC.red, COMIC.blue, COMIC.yellow, COMIC.red, COMIC.blue, COMIC.red];

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COMIC.yellow} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COMIC.ink} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ══════════════════════════════════════════
            SECTION 1 — HERO BANNER
        ══════════════════════════════════════════ */}
        <LinearGradient
          colors={[COMIC.ink, COMIC.darkBg2, '#110030']}
          style={styles.heroBanner}
        >
          {/* Halftone overlay */}
          <HalftoneOverlay dotColor="rgba(255,214,0,0.07)" size={10} />

          {/* Action-line radial burst (simulated with a View) */}
          <View style={styles.actionLinesOverlay} pointerEvents="none" />

          {/* Eye-brow label */}
          <View style={styles.eyebrowWrap}>
            <View style={styles.eyebrow}>
              <Text style={styles.eyebrowText}>⚡ THE ULTIMATE HERO DATABASE</Text>
            </View>
          </View>

          {/* Floating badge */}
          <Animated.View style={[styles.floatingBadge, floatStyle]}>
            <PulsingBadge text="1000+ Heroes" />
          </Animated.View>

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
              label="EXPLORE HEROES"
              emoji="⚡"
              onPress={() => { /* navigate to search tab */ }}
              bg={COMIC.yellow}
              color={COMIC.ink}
              shadowColor={COMIC.red}
            />
            <ComicButton
              label="RANDOM HERO"
              emoji="🎲"
              onPress={fetchRandomHero}
              bg={COMIC.red}
              color="#fff"
              shadowColor={COMIC.ink}
            />
          </View>

          {/* POW burst labels */}
          <View style={styles.powWrap}>
            <BurstLabel text="POW!" bg={COMIC.yellow} color={COMIC.ink} rotate={-12} />
            <BurstLabel text="BOOM!" bg={COMIC.red} color="#fff" rotate={8} />
          </View>
        </LinearGradient>

        {/* ══════════════════════════════════════════
            SECTION 2 — RANDOM HERO RESULT
        ══════════════════════════════════════════ */}
        {randomHero && (
          <View style={styles.randomHeroSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionLabelLine} />
              <Text style={styles.sectionLabel}>🎲 RANDOM HERO</Text>
            </View>
            <View style={styles.randomHeroCard}>
              {/* Accent strip */}
              <View style={[styles.randomHeroStripe, { backgroundColor: COMIC.red }]} />
              <Image
                source={{ uri: randomHero.image.url }}
                style={styles.randomHeroImage}
                resizeMode="cover"
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
                        color={COMIC.red}
                      />
                    ))}
                </View>
                <ComicButton
                  label="SEE FULL PROFILE"
                  onPress={() => { /* navigate to hero detail */ }}
                  bg={COMIC.yellow}
                  color={COMIC.ink}
                  shadowColor={COMIC.ink}
                  style={{ marginTop: 14 }}
                />
              </View>
            </View>
          </View>
        )}

        {/* ══════════════════════════════════════════
            SECTION 3 — FEATURED HEROES
        ══════════════════════════════════════════ */}
        <View style={styles.featuredSection}>
          <HalftoneOverlay dotColor="rgba(0,0,0,0.04)" size={12} />

          <View style={styles.sectionHeader}>
            <View style={styles.sectionLabelLine} />
            <Text style={styles.sectionLabel}>⭐ FEATURED HEROES</Text>
          </View>
          <Text style={styles.sectionTitle}>Earths Mightiest</Text>
          <Text style={styles.sectionSub}>
            Tap any card to explore full stats, powers, and origin stories.
          </Text>

          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="large" color={COMIC.red} />
              <Text style={styles.loadingText}>ASSEMBLING HEROES...</Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.heroCardsScroll}
            >
              {featuredHeroes.map((hero, i) => (
                <HeroCard
                  key={hero.id}
                  hero={hero}
                  accent={CARD_ACCENTS[i % CARD_ACCENTS.length]}
                  onPress={() => { /* navigate to hero detail with hero.id */ }}
                />
              ))}
            </ScrollView>
          )}
        </View>

        {/* ══════════════════════════════════════════
            SECTION 4 — QUICK ACTION PANELS
        ══════════════════════════════════════════ */}
        <View style={styles.actionsSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionLabelLine} />
            <Text style={styles.sectionLabel}>🦸 YOUR POWERS</Text>
          </View>
          <Text style={styles.sectionTitle}>Choose Your Mission</Text>

          <View style={styles.actionsGrid}>
            <ActionPanel
              emoji="🔍"
              title="SEARCH ALL HEROES"
              subtitle="1,000+ characters"
              bg={COMIC.blue}
              burst="NEW"
              onPress={() => { /* navigate to search tab */ }}
            />
            <ActionPanel
              emoji="⚔️"
              title="COMPARE HEROES"
              subtitle="Head-to-head stats"
              bg={COMIC.red}
              onPress={() => { /* navigate to compare */ }}
            />
          </View>

          <View style={[styles.actionsGrid, { marginTop: 14 }]}>
            <ActionPanel
              emoji="🏆"
              title="TOP HEROES"
              subtitle="By power ranking"
              bg="#1A0040"
              onPress={() => { /* navigate to rankings */ }}
            />
            <ActionPanel
              emoji="🎲"
              title="RANDOM HERO"
              subtitle="Discover someone new"
              bg={COMIC.ink}
              burst="GO!"
              onPress={fetchRandomHero}
            />
          </View>
        </View>

        {/* ══════════════════════════════════════════
            SECTION 5 — STATS TICKER
        ══════════════════════════════════════════ */}
        <View style={styles.statsTicker}>
          {[
            { n: '1,000+', l: 'Heroes' },
            { n: '731', l: 'Powers' },
            { n: '2', l: 'Universes' },
            { n: '6', l: 'Stat Types' },
            { n: '∞', l: 'Fun' },
          ].map((item, i) => (
            <View key={i} style={styles.statsTickerItem}>
              <Text style={styles.statsTickerNumber}>{item.n}</Text>
              <Text style={styles.statsTickerLabel}>{item.l}</Text>
            </View>
          ))}
        </View>

        {/* ══════════════════════════════════════════
            SECTION 6 — CREATORS FOOTER CREDIT
        ══════════════════════════════════════════ */}
        <LinearGradient
          colors={[COMIC.ink, '#0A0014']}
          style={styles.footerCredit}
        >
          <HalftoneOverlay dotColor="rgba(255,214,0,0.05)" size={8} />

          {/* Gradient rainbow bar */}
          <View style={styles.footerRainbowBar} />

          <View style={styles.footerLogoWrap}>
            <Text style={styles.footerLogo}>HeroVerse</Text>
          </View>

          <View style={styles.footerDivider} />

          <Text style={styles.footerCreditLabel}>✦ DESIGNED & DEVELOPED BY ✦</Text>
          <Text style={styles.footerCreditNames}>
            Santiago Duque Robledo{'\n'}&amp; Cesar David Arias Posada
          </Text>
          <Text style={styles.footerApiNote}>
            Powered by SuperHero API · superheroapi.com
          </Text>

          <View style={styles.footerBursts}>
            <BurstLabel text="POW!" bg={COMIC.yellow} color={COMIC.ink} rotate={-10} />
            <BurstLabel text="ZAP!" bg={COMIC.red} color="#fff" rotate={12} />
          </View>

          <Text style={styles.footerCopyright}>
            © 2025 HeroVerse · Not affiliated with Marvel or DC Comics
          </Text>
        </LinearGradient>
      </ScrollView>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── STYLES ──────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  // Root
  root: { flex: 1, backgroundColor: COMIC.ink },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 0 },
  loadingContainer: {
    flex: 1,
    backgroundColor: COMIC.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── HERO BANNER ─────────────────────────────────────────────────────────────
  heroBanner: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 50,
    paddingHorizontal: 24,
    borderBottomWidth: COMIC.borderWidthThick,
    borderBottomColor: COMIC.yellow,
    overflow: 'hidden',
  },
  actionLinesOverlay: {
    ...StyleSheet.absoluteFillObject,
    // Simulated radial lines via a very subtle overlay
    opacity: 0.04,
    backgroundColor: COMIC.yellow,
  },
  eyebrowWrap: { alignItems: 'flex-start', marginBottom: 20 },
  eyebrow: {
    backgroundColor: COMIC.ink,
    borderWidth: 2,
    borderColor: COMIC.yellow,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  eyebrowText: {
    fontFamily: 'Oswald_700Bold',
    fontSize: COMIC.label,
    letterSpacing: 3,
    color: COMIC.yellow,
    textTransform: 'uppercase',
  },
  floatingBadge: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 68 : 48,
    right: 24,
  },
  pulsingBadge: {
    backgroundColor: COMIC.red,
    borderWidth: COMIC.borderWidth,
    borderColor: COMIC.ink,
    paddingHorizontal: 10,
    paddingVertical: 5,
    shadowColor: COMIC.ink,
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
    fontSize: COMIC.heroTitle,
    letterSpacing: 3,
    color: '#fff',
    lineHeight: COMIC.heroTitle * 1.0,
    // Simulated text stroke via text shadow layering
    textShadowColor: COMIC.ink,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  headlineHeroes: {
    fontFamily: 'Bangers_400Regular',
    fontSize: COMIC.heroTitle * 1.3,
    letterSpacing: 3,
    color: COMIC.yellow,
    lineHeight: COMIC.heroTitle * 1.2,
    textShadowColor: COMIC.ink,
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
  powWrap: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },

  // ── RANDOM HERO SECTION ──────────────────────────────────────────────────────
  randomHeroSection: {
    backgroundColor: COMIC.paper2,
    borderBottomWidth: COMIC.borderWidthThick,
    borderBottomColor: COMIC.ink,
    padding: 24,
  },
  randomHeroCard: {
    backgroundColor: COMIC.darkBg,
    borderWidth: COMIC.borderWidth,
    borderColor: COMIC.ink,
    borderRadius: COMIC.radiusCard,
    overflow: 'hidden',
    shadowColor: COMIC.ink,
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
    color: COMIC.yellow,
    textShadowColor: COMIC.ink,
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

  // ── STAT BAR ─────────────────────────────────────────────────────────────────
  statRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statLabel: {
    fontFamily: 'Oswald_700Bold',
    fontSize: 9,
    letterSpacing: 1,
    color: 'rgba(255,255,255,0.5)',
    width: 30,
    textTransform: 'uppercase',
  },
  statBarBg: {
    flex: 1,
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  statBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  statValue: {
    fontFamily: 'Oswald_700Bold',
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    width: 26,
    textAlign: 'right',
  },

  // ── FEATURED HEROES ──────────────────────────────────────────────────────────
  featuredSection: {
    backgroundColor: COMIC.paper,
    paddingVertical: 36,
    borderBottomWidth: COMIC.borderWidthThick,
    borderBottomColor: COMIC.ink,
    overflow: 'hidden',
  },
  heroCardsScroll: {
    paddingHorizontal: 24,
    paddingBottom: 8,
    gap: 16,
  },
  heroCard: {
    width: 160,
    borderWidth: COMIC.borderWidth,
    borderRadius: COMIC.radiusCard,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: COMIC.ink,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  heroCardStripe: {
    height: 5,
    width: '100%',
  },
  heroCardShadow: {
    position: 'absolute',
    top: 5,
    left: 5,
    right: -5,
    bottom: -5,
    borderRadius: COMIC.radiusCard,
    zIndex: -1,
    opacity: 0.3,
  },
  heroCardImageWrap: {
    height: 200,
    position: 'relative',
  },
  heroCardImage: {
    width: '100%',
    height: '100%',
  },
  heroCardInfo: {
    padding: 12,
    backgroundColor: COMIC.darkBg,
  },
  heroCardName: {
    fontFamily: 'Bangers_400Regular',
    fontSize: 16,
    letterSpacing: 1.5,
    color: COMIC.yellow,
    marginBottom: 2,
  },
  heroCardPublisher: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 9,
    letterSpacing: 1.5,
    color: 'rgba(255,255,255,0.45)',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  heroCardStatPill: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  heroCardStatText: {
    fontFamily: 'Oswald_700Bold',
    fontSize: 9,
    letterSpacing: 1,
    color: 'rgba(255,255,255,0.7)',
  },

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
    backgroundColor: COMIC.red,
  },
  sectionLabel: {
    fontFamily: 'Oswald_700Bold',
    fontSize: COMIC.label,
    letterSpacing: 4,
    color: COMIC.red,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontFamily: 'Bangers_400Regular',
    fontSize: COMIC.sectionTitle,
    letterSpacing: 2,
    color: COMIC.ink,
    paddingHorizontal: 24,
    marginBottom: 6,
    textShadowColor: COMIC.yellow,
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
    color: COMIC.ink,
  },

  // ── QUICK ACTIONS ────────────────────────────────────────────────────────────
  actionsSection: {
    backgroundColor: COMIC.paper2,
    paddingVertical: 36,
    paddingHorizontal: 24,
    borderBottomWidth: COMIC.borderWidthThick,
    borderBottomColor: COMIC.ink,
    overflow: 'hidden',
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 14,
  },
  actionPanel: {
    borderWidth: COMIC.borderWidth,
    borderColor: COMIC.ink,
    borderRadius: COMIC.radius,
    padding: 18,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: COMIC.ink,
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 7,
    minHeight: 110,
    justifyContent: 'flex-end',
  },
  actionPanelShadow: {
    position: 'absolute',
    top: 5,
    left: 5,
    right: -5,
    bottom: -5,
    borderRadius: COMIC.radius,
  },
  actionEmoji: { fontSize: 28, marginBottom: 4 },
  actionTitle: {
    fontFamily: 'Bangers_400Regular',
    fontSize: 16,
    letterSpacing: 1.5,
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  actionSubtitle: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 10,
    letterSpacing: 1,
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  actionBurst: {
    position: 'absolute',
    top: 10,
    right: 10,
  },

  // ── STATS TICKER ─────────────────────────────────────────────────────────────
  statsTicker: {
    backgroundColor: COMIC.red,
    borderTopWidth: COMIC.borderWidthThick,
    borderBottomWidth: COMIC.borderWidthThick,
    borderColor: COMIC.ink,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    paddingHorizontal: 8,
  },
  statsTickerItem: {
    alignItems: 'center',
    gap: 2,
  },
  statsTickerNumber: {
    fontFamily: 'Bangers_400Regular',
    fontSize: 26,
    letterSpacing: 1,
    color: COMIC.yellow,
    textShadowColor: COMIC.ink,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  statsTickerLabel: {
    fontFamily: 'Oswald_700Bold',
    fontSize: 9,
    letterSpacing: 2,
    color: '#fff',
    textTransform: 'uppercase',
  },

  // ── FOOTER CREDIT ────────────────────────────────────────────────────────────
  footerCredit: {
    paddingTop: 48,
    paddingBottom: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderTopWidth: COMIC.borderWidthThick,
    borderTopColor: COMIC.yellow,
    overflow: 'hidden',
    position: 'relative',
  },
  footerRainbowBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 5,
    // Simulated with a View; can swap for LinearGradient if desired
    backgroundColor: COMIC.yellow,
  },
  footerLogoWrap: { marginBottom: 16 },
  footerLogo: {
    fontFamily: 'Bangers_400Regular',
    fontSize: 40,
    letterSpacing: 4,
    color: COMIC.yellow,
    textShadowColor: COMIC.red,
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 0,
  },
  footerDivider: {
    width: '80%',
    height: 2,
    backgroundColor: 'rgba(255,214,0,0.25)',
    marginBottom: 22,
  },
  footerCreditLabel: {
    fontFamily: 'Oswald_700Bold',
    fontSize: 10,
    letterSpacing: 4,
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  footerCreditNames: {
    fontFamily: 'Bangers_400Regular',
    fontSize: 22,
    letterSpacing: 2,
    color: COMIC.yellow,
    textAlign: 'center',
    lineHeight: 30,
    textShadowColor: COMIC.red,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
    marginBottom: 10,
  },
  footerApiNote: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 10,
    letterSpacing: 1,
    color: 'rgba(255,255,255,0.35)',
    textTransform: 'uppercase',
    marginBottom: 24,
  },
  footerBursts: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  footerCopyright: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 10,
    letterSpacing: 1,
    color: 'rgba(255,255,255,0.2)',
    textAlign: 'center',
  },
});