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
import { useRouter } from 'expo-router'; // ← Para navegar entre tabs
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
const API_KEY = 'ddc92e6ed8ef5366368a9cff47b3dd8c';
const API_BASE = `https://superheroapi.com/api/${API_KEY}`;

// ─── Tipos de datos ─────────────────────────────────────────────────────────
/**
 * Tipo Hero: estructura de datos que devuelve la Superhero API
 * para cada héroe con sus estadísticas y biografía.
 */
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

// ─── TEMA / COLORES GLOBALES ─────────────────────────────────────────────────
/**
 * COMIC: objeto de constantes de diseño.
 * Centralizar colores y tamaños aquí es una BUENA PRÁCTICA
 * porque evita repetir magic numbers y facilita cambios globales.
 */
export const COMIC = {
  red: '#E8173D',
  yellow: '#FFD600',
  blue: '#0057FF',
  ink: '#1A1028',
  paper: '#FFF9EE',
  paper2: '#FFF3D6',
  darkBg: '#0A0A2E',
  darkBg2: '#1A0040',
  heroTitle: 52,
  sectionTitle: 32,
  cardTitle: 18,
  body: 14,
  label: 11,
  radius: 4,
  radiusCard: 8,
  borderWidth: 3,
  borderWidthThick: 5,
};

// ─── COMPONENTE: HalftoneOverlay ────────────────────────────────────────────
/**
 * Simula el patrón de puntos Ben-Day característico de los cómics.
 * Es un overlay puramente decorativo (pointerEvents="none" para no
 * bloquear toques).
 */
const HalftoneOverlay: React.FC<{ color?: string; dotColor?: string; size?: number }> = ({
  color = 'transparent',
  dotColor = 'rgba(0,0,0,0.06)',
  size = 8,
}) => {
  const cols = Math.ceil(SCREEN_W / size) + 2;
  const rows = 14;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: rows }).map((_, r) => (
        <View key={r} style={{ flexDirection: 'row' }}>
          {Array.from({ length: cols }).map((_, c) => (
            <View
              key={c}
              style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}
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

// ─── COMPONENTE: BurstLabel (POW!, ZAP!) ────────────────────────────────────
/**
 * Etiqueta estilo onomatopeya de cómic.
 * Acepta texto, color de fondo, color de texto y rotación.
 */
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
      style={{ fontFamily: 'Bangers_400Regular', fontSize: 14, letterSpacing: 2, color }}
    >
      {text}
    </Text>
  </View>
);

// ─── COMPONENTE: ComicButton ────────────────────────────────────────────────
/**
 * Botón con estética de cómic: sombra offset, borde ink, animación al presionar.
 * Usa useSharedValue + useAnimatedStyle de Reanimated para la animación
 * de "hundimiento" cuando se toca → buena práctica de UX en mobile.
 */
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
    transform: [
      { scale: scale.value },
      { translateX: offsetX.value },
      { translateY: offsetY.value },
    ],
  }));

  // Al presionar: escala abajo + mueve 3px (simula que se hunde la sombra)
  const handlePressIn = () => {
    scale.value = withSpring(0.94, { damping: 10 });
    offsetX.value = withTiming(3, { duration: 80 });
    offsetY.value = withTiming(3, { duration: 80 });
  };

  // Al soltar: regresa a posición original
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
      {/* Capa de sombra ink (siempre fija, no se anima) */}
      <View
        style={{
          backgroundColor: shadowColor,
          borderRadius: COMIC.radius,
          position: 'absolute',
          top: 5,
          left: 5,
          right: -5,
          bottom: -5,
        }}
      />
      {/* Capa principal que sí se anima */}
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

// ─── COMPONENTE: ActionPanel ─────────────────────────────────────────────────
/**
 * Panel de acción rápida. Cada panel es un acceso directo a una sección.
 * Se usa flex:1 para que dos paneles ocupen el mismo ancho en una fila.
 */
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

// ─── COMPONENTE: StatBar ─────────────────────────────────────────────────────
/**
 * Barra de estadística animada. Usa withTiming para una animación
 * de 800ms al montar → mejor experiencia que mostrar el valor estático.
 */
const StatBar: React.FC<{ label: string; value: number; color: string }> = ({
  label,
  value,
  color,
}) => {
  const barWidth = useSharedValue(0);

  useEffect(() => {
    barWidth.value = withTiming(value / 100, {
      duration: 800,
      easing: Easing.out(Easing.quad),
    });
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

// ─── COMPONENTE: PulsingBadge ────────────────────────────────────────────────
/**
 * Badge que pulsa infinitamente usando withRepeat + withSequence.
 * withRepeat(-1) = repetición infinita.
 */
const PulsingBadge: React.FC<{ text: string }> = ({ text }) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1 // -1 = infinito
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
// ─── PANTALLA PRINCIPAL: InicioScreen ────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
export default function InicioScreen() {
  const router = useRouter(); // Hook de navegación de Expo Router
  const [fontsLoaded] = useFonts({ Bangers_400Regular, Oswald_400Regular, Oswald_700Bold });

  // Estado para el héroe aleatorio (se muestra cuando el usuario presiona "Random Hero")
  const [randomHero, setRandomHero] = useState<Hero | null>(null);

  // NOTA: featuredHeroes y su loading ya NO están aquí.
  // El carrusel de héroes destacados ahora vive en search/index.tsx

  // ─ Animación flotante del banner ─────────────────────────────────────────
  const floatY = useSharedValue(0);
  useEffect(() => {
    floatY.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 2000 }),
        withTiming(0, { duration: 2000 })
      ),
      -1
    );
  }, []);
  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));

  // ─ Función: héroe aleatorio ───────────────────────────────────────────────
  /**
   * useCallback evita recrear esta función en cada render.
   * Es buena práctica cuando se pasa como prop a un hijo o se usa en useEffect.
   */
  const fetchRandomHero = useCallback(async () => {
    // IDs de la API van del 1 al 731
    const randomId = Math.floor(Math.random() * 731) + 1;
    try {
      const res = await fetch(`${API_BASE}/${randomId}`);
      const data = await res.json();
      if (data.response !== 'error') setRandomHero(data);
    } catch (e) {
      console.warn('Random hero fetch failed:', e);
    }
  }, []);

  // ─ Función: navegar a Búsqueda ────────────────────────────────────────────
  /**
   * Navega a la tab de Búsqueda usando Expo Router.
   * La ruta '/search' corresponde a app/(tabs)/(search)/index.tsx
   * Ajusta la ruta si tu estructura de carpetas es diferente.
   */
  const goToSearch = useCallback(() => {
    router.push('/(tabs)/(search)');
  }, [router]);

  // Mientras las fuentes cargan, mostramos un spinner
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
            SECCIÓN 1 — BANNER PRINCIPAL
            Llama a la acción: los botones llevan a Búsqueda
        ══════════════════════════════════════════ */}
        <LinearGradient
          colors={[COMIC.ink, COMIC.darkBg2, '#110030']}
          style={styles.heroBanner}
        >
          <HalftoneOverlay dotColor="rgba(255,214,0,0.07)" size={10} />
          <View style={styles.actionLinesOverlay} pointerEvents="none" />

          {/* Etiqueta superior */}
          <View style={styles.eyebrowWrap}>
            <View style={styles.eyebrow}>
              <Text style={styles.eyebrowText}>⚡ THE ULTIMATE HERO DATABASE</Text>
            </View>
          </View>

          {/* Badge pulsante en esquina superior derecha */}
          <Animated.View style={[styles.floatingBadge, floatStyle]}>
            <PulsingBadge text="1000+ Heroes" />
          </Animated.View>

          {/* Titular principal */}
          <View style={styles.headlineWrap}>
            <Text style={styles.headlineKnow}>KNOW YOUR</Text>
            <Text style={styles.headlineHeroes}>HEROES.</Text>
          </View>

          {/* Subtítulo */}
          <Text style={styles.subHeadline}>
            Search stats, explore powers, and discover origin stories for every hero you ever loved.
          </Text>

          {/* ── BOTONES CTA ──
              Ambos llevan a la tab de Búsqueda.
              "Explore Heroes" → va directo a buscar.
              "Random Hero"    → busca héroe aleatorio Y muestra resultado aquí.
          */}
          <View style={styles.heroCtas}>
            <ComicButton
              label="EXPLORE HEROES"
              emoji="⚡"
              onPress={goToSearch} // ← Navega a Búsqueda
              bg={COMIC.yellow}
              color={COMIC.ink}
              shadowColor={COMIC.red}
            />
            <ComicButton
              label="RANDOM HERO"
              emoji="🎲"
              onPress={fetchRandomHero} // ← Carga héroe aleatorio (sección 2)
              bg={COMIC.red}
              color="#fff"
              shadowColor={COMIC.ink}
            />
          </View>

          {/* Onomatopeyas decorativas */}
          <View style={styles.powWrap}>
            <BurstLabel text="POW!" bg={COMIC.yellow} color={COMIC.ink} rotate={-12} />
            <BurstLabel text="BOOM!" bg={COMIC.red} color="#fff" rotate={8} />
          </View>
        </LinearGradient>

        {/* ══════════════════════════════════════════
            SECCIÓN 2 — RESULTADO HÉROE ALEATORIO
            Solo aparece después de presionar "Random Hero"
        ══════════════════════════════════════════ */}
        {randomHero && (
          <View style={styles.randomHeroSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionLabelLine} />
              <Text style={styles.sectionLabel}>🎲 RANDOM HERO</Text>
            </View>

            <View style={styles.randomHeroCard}>
              {/* Franja de color lateral */}
              <View style={[styles.randomHeroStripe, { backgroundColor: COMIC.red }]} />

              {/* Imagen del héroe */}
              <Image
                source={{ uri: randomHero.image.url }}
                style={styles.randomHeroImage}
                resizeMode="cover"
              />

              {/* Info y stats */}
              <View style={styles.randomHeroBody}>
                <Text style={styles.randomHeroName}>{randomHero.name.toUpperCase()}</Text>
                <Text style={styles.randomHeroPublisher}>
                  {randomHero.biography.publisher || 'Unknown Publisher'}
                </Text>

                {/* Barras de estadísticas (máximo 4) */}
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

                {/* Botón que lleva a Búsqueda para ver perfil completo */}
                <ComicButton
                  label="SEE FULL PROFILE"
                  onPress={goToSearch} // ← Navega a Búsqueda
                  bg={COMIC.yellow}
                  color={COMIC.ink}
                  shadowColor={COMIC.ink}
                  style={{ marginTop: 14 }}
                />
              </View>
            </View>

            {/* Botón para buscar otro héroe aleatorio */}
            <ComicButton
              label="ANOTHER HERO"
              emoji="🎲"
              bg={COMIC.ink}
              color={COMIC.yellow}
              shadowColor={COMIC.red}
              style={{ marginTop: 16, alignSelf: 'flex-start' }}
              onPress={fetchRandomHero}
            />
          </View>
        )}

        {/* ══════════════════════════════════════════
            SECCIÓN 3 — QUICK ACTION PANELS
            Todos los paneles llevan a la tab Búsqueda
        ══════════════════════════════════════════ */}
        <View style={styles.actionsSection}>
          <HalftoneOverlay dotColor="rgba(0,0,0,0.04)" size={12} />

          <View style={styles.sectionHeader}>
            <View style={styles.sectionLabelLine} />
            <Text style={styles.sectionLabel}>🦸 YOUR POWERS</Text>
          </View>
          <Text style={styles.sectionTitle}>Choose Your Mission</Text>

          {/*
           * Solo 2 paneles: SEARCH y RANDOM HERO.
           * COMPARE HEROES y TOP HEROES se quitaron porque todavía
           * no están implementados en la app — mejor no mostrar
           * acciones que no funcionan aún.
           */}
          <View style={styles.actionsGrid}>
            <ActionPanel
              emoji="🔍"
              title="SEARCH ALL HEROES"
              subtitle="1,000+ characters"
              bg={COMIC.blue}
              burst="NEW"
              onPress={goToSearch} // ← Navega a Búsqueda
            />
            <ActionPanel
              emoji="🎲"
              title="RANDOM HERO"
              subtitle="Discover someone new"
              bg={COMIC.ink}
              burst="GO!"
              onPress={fetchRandomHero} // ← Carga héroe aleatorio arriba
            />
          </View>
        </View>

        {/* ══════════════════════════════════════════
            SECCIÓN 4 — STATS TICKER
            Datos generales de la app
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
            SECCIÓN 5 — FOOTER CRÉDITOS
        ══════════════════════════════════════════ */}
        <LinearGradient colors={[COMIC.ink, '#0A0014']} style={styles.footerCredit}>
          <HalftoneOverlay dotColor="rgba(255,214,0,0.05)" size={8} />
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
// ─── ESTILOS ──────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * BUENA PRÁCTICA: usar StyleSheet.create() en lugar de objetos inline.
 * Razones:
 *  1. Los estilos se validan en tiempo de desarrollo
 *  2. Se optimizan en puente JS→Native (se envían una sola vez)
 *  3. Mejor legibilidad y mantenimiento
 */
const styles = StyleSheet.create({
  // ── RAÍZ ──────────────────────────────────────────────────────────────────
  root: { flex: 1, backgroundColor: COMIC.ink },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 0 },
  loadingContainer: {
    flex: 1,
    backgroundColor: COMIC.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── BANNER HERO ───────────────────────────────────────────────────────────
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
  powWrap: { flexDirection: 'row', gap: 12, marginTop: 8 },

  // ── SECCIÓN HÉROE ALEATORIO ───────────────────────────────────────────────
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
  randomHeroStripe: { width: 6, alignSelf: 'stretch' },
  randomHeroImage: { width: 130, height: 180 },
  randomHeroBody: { flex: 1, padding: 16 },
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

  // ── BARRA DE ESTADÍSTICA ──────────────────────────────────────────────────
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
  statBarFill: { height: '100%', borderRadius: 3 },
  statValue: {
    fontFamily: 'Oswald_700Bold',
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    width: 26,
    textAlign: 'right',
  },

  // ── PANELES DE ACCIÓN RÁPIDA ──────────────────────────────────────────────
  actionsSection: {
    backgroundColor: COMIC.paper2,
    paddingVertical: 36,
    paddingHorizontal: 24,
    borderBottomWidth: COMIC.borderWidthThick,
    borderBottomColor: COMIC.ink,
    overflow: 'hidden',
  },
  actionsGrid: { flexDirection: 'row', gap: 14 },
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
  actionBurst: { position: 'absolute', top: 10, right: 10 },

  // ── STATS TICKER ──────────────────────────────────────────────────────────
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
  statsTickerItem: { alignItems: 'center', gap: 2 },
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

  // ── ENCABEZADO DE SECCIÓN ─────────────────────────────────────────────────
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  sectionLabelLine: { width: 30, height: 3, backgroundColor: COMIC.red },
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

  // ── FOOTER ────────────────────────────────────────────────────────────────
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
  footerBursts: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  footerCopyright: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 10,
    letterSpacing: 1,
    color: 'rgba(255,255,255,0.2)',
    textAlign: 'center',
  },
});
