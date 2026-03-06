
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, StatusBar, Image,
  ActivityIndicator,
  Platform,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';

// ─── API ─────────────────────────────────────────────────────────────────────
const API_KEY = 'ddc92e6ed8ef5366368a9cff47b3dd8c';
const API_BASE = `https://superheroapi.com/api/${API_KEY}`;
const FEATURED_IDS = [70, 195, 332, 387, 583, 720];

// ─── TIPOS ───────────────────────────────────────────────────────────────────
/**
 * Tipo Hero con TODOS los campos que devuelve la Superhero API.
 */
interface Hero {
  id: string;
  name: string;
  image: { url: string };
  powerstats: {
    intelligence: string;
    strength: string;
    speed: string;
    durability: string;
    power: string;
    combat: string;
  };
  biography: {
    'full-name': string;
    'alter-egos': string;
    aliases: string[];
    'place-of-birth': string;
    'first-appearance': string;
    publisher: string;
    alignment: string;
  };
  appearance: {
    gender: string;
    race: string;
    height: string[];
    weight: string[];
    'eye-color': string;
    'hair-color': string;
  };
  work: {
    occupation: string;
    base: string;
  };
  connections: {
    'group-affiliation': string;
    relatives: string;
  };
}

const { width: SCREEN_W } = Dimensions.get('window');

// ─── TEMA ────────────────────────────────────────────────────────────────────
const COMIC = {
  red: '#E8173D',
  yellow: '#FFD600',
  blue: '#0057FF',
  green: '#00C853',
  ink: '#1A1028',
  paper: '#FFF9EE',
  paper2: '#FFF3D6',
  darkBg: '#0A0A2E',
  darkBg2: '#1A0040',
  label: 11,
  radius: 4,
  radiusCard: 8,
  borderWidth: 3,
  borderWidthThick: 5,
};

const CARD_ACCENTS = [COMIC.red, COMIC.blue, COMIC.yellow, COMIC.red, COMIC.blue, COMIC.red];

// Color del badge según alineación del héroe
const ALIGNMENT_COLOR: Record<string, string> = {
  good: COMIC.green,
  bad: COMIC.red,
  neutral: COMIC.yellow,
};
const ALIGNMENT_EMOJI: Record<string, string> = {
  good: '😇',
  bad: '😈',
  neutral: '😐',
};

// ─── COMPONENTE: HalftoneOverlay ─────────────────────────────────────────────
const HalftoneOverlay: React.FC<{ dotColor?: string; size?: number }> = ({
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
            <View key={c} style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ width: size * 0.3, height: size * 0.3, borderRadius: size, backgroundColor: dotColor }} />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};

// ─── COMPONENTE: BurstLabel ───────────────────────────────────────────────────
const BurstLabel: React.FC<{
  text: string; bg?: string; color?: string; rotate?: number; style?: object;
}> = ({ text, bg = COMIC.yellow, color = COMIC.ink, rotate = -8, style }) => (
  <View style={[{
    backgroundColor: bg, borderWidth: COMIC.borderWidth, borderColor: COMIC.ink,
    paddingHorizontal: 10, paddingVertical: 3,
    transform: [{ rotate: `${rotate}deg` }],
    shadowColor: COMIC.ink, shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 6,
  }, style]}>
    <Text style={{ fontFamily: 'Bangers_400Regular', fontSize: 14, letterSpacing: 2, color }}>
      {text}
    </Text>
  </View>
);

// ─── COMPONENTE: AnimatedStatBar ─────────────────────────────────────────────
/**
 * Barra de powerstat animada con:
 *  - Color dinámico: verde ≥80, amarillo ≥50, rojo ≥25, gris <25
 *  - Animación de llenado con retraso escalonado (delay)
 *  - Brillo interno para efecto 3D
 *  - Número a la derecha
 */
const AnimatedStatBar: React.FC<{ label: string; value: number; delay?: number }> = ({
  label, value, delay = 0,
}) => {
  const barWidth = useSharedValue(0);

  useEffect(() => {
    const t = setTimeout(() => {
      barWidth.value = withTiming(value / 100, {
        duration: 900,
        easing: Easing.out(Easing.cubic),
      });
    }, delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${barWidth.value * 100}%`,
  }));

  // Color según nivel del stat
  const barColor =
    value >= 80 ? COMIC.green :
    value >= 50 ? COMIC.yellow :
    value >= 25 ? COMIC.red :
    '#444';

  return (
    <View style={sStyles.row}>
      <Text style={sStyles.label}>{label}</Text>
      <View style={sStyles.barBg}>
        <Animated.View style={[sStyles.barFill, { backgroundColor: barColor }, barStyle]}>
          <View style={sStyles.shine} />
        </Animated.View>
      </View>
      <Text style={[sStyles.value, { color: barColor }]}>{value || '—'}</Text>
    </View>
  );
};

const sStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
  label: {
    fontFamily: 'Oswald_700Bold', fontSize: 10, letterSpacing: 1.5,
    color: 'rgba(255,255,255,0.55)', width: 75, textTransform: 'uppercase',
  },
  barBg: {
    flex: 1, height: 9, backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 5, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  barFill: { height: '100%', borderRadius: 5, overflow: 'hidden', position: 'relative' },
  shine: {
    position: 'absolute', top: 0, left: 0, right: 0, height: '45%',
    backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 5,
  },
  value: {
    fontFamily: 'Bangers_400Regular', fontSize: 16, letterSpacing: 1,
    width: 32, textAlign: 'right',
  },
});

// ─── COMPONENTE: InfoRow ──────────────────────────────────────────────────────
/**
 * Fila etiqueta + valor para las secciones de detalle.
 * No se renderiza si el valor está vacío o es '-'/'null'.
 */
const InfoRow: React.FC<{ label: string; value?: string; accent?: string }> = ({
  label, value, accent = COMIC.yellow,
}) => {
  if (!value || value === '-' || value === 'null' || value.trim() === '') return null;
  return (
    <View style={iStyles.row}>
      <Text style={[iStyles.label, { color: accent }]}>{label}</Text>
      <Text style={iStyles.value} numberOfLines={4}>{value}</Text>
    </View>
  );
};

const iStyles = StyleSheet.create({
  row: { flexDirection: 'row', marginBottom: 9, gap: 10 },
  label: {
    fontFamily: 'Oswald_700Bold', fontSize: 9, letterSpacing: 2,
    textTransform: 'uppercase', width: 85, paddingTop: 2,
  },
  value: {
    flex: 1, fontFamily: 'Oswald_400Regular', fontSize: 12,
    color: 'rgba(255,255,255,0.8)', lineHeight: 18,
  },
});

// ─── COMPONENTE: HeroDetailCard ───────────────────────────────────────────────
/**
 * Card "accordion": colapsada muestra lo básico, expandida muestra todo.
 *
 * PATRÓN accordion: muy usado en mobile para no desperdiciar espacio
 * pero mantener toda la info accesible con un toque.
 *
 * Al tocar → setExpanded(!expanded) → se muestra/oculta la sección de detalle.
 */
const HeroDetailCard: React.FC<{ hero: Hero; index: number }> = ({ hero, index }) => {
  const [expanded, setExpanded] = useState(false);
  const scale = useSharedValue(1);
  const cardAnim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  // Parsear los powerstats (la API los devuelve como strings)
  const stats = [
    { label: 'Intelligence', value: Number(hero.powerstats.intelligence) || 0 },
    { label: 'Strength',     value: Number(hero.powerstats.strength)     || 0 },
    { label: 'Speed',        value: Number(hero.powerstats.speed)         || 0 },
    { label: 'Durability',   value: Number(hero.powerstats.durability)   || 0 },
    { label: 'Power',        value: Number(hero.powerstats.power)         || 0 },
    { label: 'Combat',       value: Number(hero.powerstats.combat)       || 0 },
  ];

  // Stat más alto → mostrar en card colapsada
  const topStat = [...stats].sort((a, b) => b.value - a.value)[0];

  // Puntaje total sobre 600 (6 stats × 100)
  const totalScore = stats.reduce((sum, s) => sum + s.value, 0);

  // Alineación: good / bad / neutral
  const alignment = (hero.biography.alignment ?? 'neutral').toLowerCase();
  const alignColor = ALIGNMENT_COLOR[alignment] ?? COMIC.yellow;
  const alignEmoji = ALIGNMENT_EMOJI[alignment] ?? '❓';

  return (
    <Animated.View
      entering={FadeIn.delay(index * 100).duration(350)}
      exiting={FadeOut.duration(200)}
      style={{ marginHorizontal: 20, marginBottom: 14 }}
    >
      <TouchableOpacity
        onPress={() => setExpanded(!expanded)}
        onPressIn={() => { scale.value = withSpring(0.98, { damping: 12 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 8 }); }}
        activeOpacity={1}
      >
        <Animated.View style={[cStyles.card, cardAnim]}>

          {/* ════════════════════════════════════
              PARTE COLAPSADA — siempre visible
          ════════════════════════════════════ */}
          <View style={cStyles.topRow}>

            {/* Imagen */}
            <View style={cStyles.imgWrap}>
              <Image source={{ uri: hero.image.url }} style={cStyles.img} resizeMode="cover" />
              <LinearGradient
                colors={['transparent', 'rgba(10,10,46,0.7)']}
                style={StyleSheet.absoluteFill}
              />
              {/* Badge de alineación */}
              <View style={[cStyles.alignBadge, { backgroundColor: alignColor }]}>
                <Text style={cStyles.alignEmoji}>{alignEmoji}</Text>
              </View>
            </View>

            {/* Info básica */}
            <View style={cStyles.basicInfo}>
              <Text style={cStyles.name} numberOfLines={1}>
                {hero.name.toUpperCase()}
              </Text>
              {hero.biography['full-name'] && hero.biography['full-name'] !== '-' && (
                <Text style={cStyles.fullName} numberOfLines={1}>
                  {hero.biography['full-name']}
                </Text>
              )}
              <Text style={cStyles.publisher} numberOfLines={1}>
                {hero.biography.publisher || 'Unknown Publisher'}
              </Text>

              {/* Stat top */}
              {topStat.value > 0 && (
                <View style={[cStyles.topStatBadge, { backgroundColor: alignColor }]}>
                  <Text style={cStyles.topStatText}>
                    ⚡ {topStat.label.toUpperCase().slice(0, 5)}: {topStat.value}
                  </Text>
                </View>
              )}

              {/* Score total */}
              {totalScore > 0 && (
                <Text style={cStyles.scoreText}>
                  POWER SCORE  {totalScore} / 600
                </Text>
              )}
            </View>

            {/* Flecha indicadora */}
            <Text style={[cStyles.arrow, expanded && cStyles.arrowOpen]}>›</Text>
          </View>

          {/* ════════════════════════════════════
              PARTE EXPANDIDA — solo al tocar
          ════════════════════════════════════ */}
          {expanded && (
            <View style={cStyles.expandedBody}>

              {/* ── POWERSTATS ── */}
              <View style={cStyles.block}>
                <View style={cStyles.blockHead}>
                  <View style={[cStyles.accent, { backgroundColor: COMIC.yellow }]} />
                  <Text style={[cStyles.blockTitle, { color: COMIC.yellow }]}>⚡ POWER STATS</Text>
                </View>
                {stats.map((s, i) => (
                  <AnimatedStatBar
                    key={s.label}
                    label={s.label}
                    value={s.value}
                    delay={i * 90} // barras aparecen una por una
                  />
                ))}
                {/* Barra de power score total */}
                <View style={cStyles.totalScoreRow}>
                  <Text style={cStyles.totalScoreLabel}>TOTAL</Text>
                  <View style={cStyles.totalScoreBar}>
                    <View style={[cStyles.totalScoreFill, { width: `${(totalScore / 600) * 100}%` }]} />
                  </View>
                  <Text style={cStyles.totalScoreNum}>{totalScore}</Text>
                </View>
              </View>

              {/* ── BIOGRAFÍA ── */}
              <View style={cStyles.block}>
                <View style={cStyles.blockHead}>
                  <View style={[cStyles.accent, { backgroundColor: COMIC.blue }]} />
                  <Text style={[cStyles.blockTitle, { color: COMIC.blue }]}>📖 BIOGRAPHY</Text>
                </View>
                <InfoRow label="Alter Ego"   value={hero.biography['alter-egos']}       accent={COMIC.blue} />
                <InfoRow label="Born"        value={hero.biography['place-of-birth']}   accent={COMIC.blue} />
                <InfoRow label="1st Appear." value={hero.biography['first-appearance']} accent={COMIC.blue} />
                <InfoRow label="Publisher"   value={hero.biography.publisher}            accent={COMIC.blue} />
                <InfoRow
                  label="Alignment"
                  value={`${alignEmoji} ${alignment.charAt(0).toUpperCase() + alignment.slice(1)}`}
                  accent={alignColor}
                />
              </View>

              {/* ── APARIENCIA ── */}
              <View style={cStyles.block}>
                <View style={cStyles.blockHead}>
                  <View style={[cStyles.accent, { backgroundColor: COMIC.red }]} />
                  <Text style={[cStyles.blockTitle, { color: COMIC.red }]}>🪞 APPEARANCE</Text>
                </View>
                <InfoRow label="Gender" value={hero.appearance.gender}        accent={COMIC.red} />
                <InfoRow label="Race"   value={hero.appearance.race}          accent={COMIC.red} />
                <InfoRow label="Height" value={hero.appearance.height?.[1] ?? hero.appearance.height?.[0]} accent={COMIC.red} />
                <InfoRow label="Weight" value={hero.appearance.weight?.[1] ?? hero.appearance.weight?.[0]} accent={COMIC.red} />
                <InfoRow label="Eyes"   value={hero.appearance['eye-color']}  accent={COMIC.red} />
                <InfoRow label="Hair"   value={hero.appearance['hair-color']} accent={COMIC.red} />
              </View>

              {/* ── TRABAJO ── */}
              {(hero.work?.occupation || hero.work?.base) && (
                <View style={cStyles.block}>
                  <View style={cStyles.blockHead}>
                    <View style={[cStyles.accent, { backgroundColor: COMIC.green }]} />
                    <Text style={[cStyles.blockTitle, { color: COMIC.green }]}>🏢 WORK</Text>
                  </View>
                  <InfoRow label="Occupation" value={hero.work.occupation} accent={COMIC.green} />
                  <InfoRow label="Base"       value={hero.work.base}       accent={COMIC.green} />
                </View>
              )}

              {/* ── CONEXIONES ── */}
              {(hero.connections?.['group-affiliation'] || hero.connections?.relatives) && (
                <View style={[cStyles.block, { marginBottom: 0 }]}>
                  <View style={cStyles.blockHead}>
                    <View style={[cStyles.accent, { backgroundColor: COMIC.yellow }]} />
                    <Text style={[cStyles.blockTitle, { color: COMIC.yellow }]}>🤝 CONNECTIONS</Text>
                  </View>
                  <InfoRow label="Groups"    value={hero.connections['group-affiliation']} accent={COMIC.yellow} />
                  <InfoRow label="Relatives" value={hero.connections.relatives}            accent={COMIC.yellow} />
                </View>
              )}

              {/* Botón colapsar */}
              <TouchableOpacity onPress={() => setExpanded(false)} style={cStyles.collapseBtn}>
                <Text style={cStyles.collapseBtnText}>▲  COLLAPSE</Text>
              </TouchableOpacity>

            </View>
          )}

        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const cStyles = StyleSheet.create({
  card: {
    backgroundColor: COMIC.darkBg, borderWidth: COMIC.borderWidth, borderColor: COMIC.ink,
    borderRadius: COMIC.radiusCard, overflow: 'hidden',
    shadowColor: COMIC.ink, shadowOffset: { width: 5, height: 5 }, shadowOpacity: 1, shadowRadius: 0, elevation: 8,
  },
  // Parte colapsada
  topRow: { flexDirection: 'row', alignItems: 'stretch' },
  imgWrap: { width: 100, height: 130, position: 'relative' },
  img: { width: '100%', height: '100%' },
  alignBadge: {
    position: 'absolute', bottom: 6, left: 6,
    width: 26, height: 26, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: COMIC.ink,
  },
  alignEmoji: { fontSize: 13 },
  basicInfo: { flex: 1, padding: 12, justifyContent: 'center', gap: 3 },
  name: {
    fontFamily: 'Bangers_400Regular', fontSize: 20, letterSpacing: 2, color: COMIC.yellow,
    textShadowColor: COMIC.ink, textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 0,
  },
  fullName: { fontFamily: 'Oswald_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.5)' },
  publisher: {
    fontFamily: 'Oswald_700Bold', fontSize: 9, letterSpacing: 2,
    color: COMIC.red, textTransform: 'uppercase',
  },
  topStatBadge: {
    alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 3, marginTop: 5,
  },
  topStatText: { fontFamily: 'Oswald_700Bold', fontSize: 9, letterSpacing: 1, color: COMIC.ink },
  scoreText: {
    fontFamily: 'Oswald_400Regular', fontSize: 9, letterSpacing: 1,
    color: 'rgba(255,255,255,0.3)', marginTop: 3,
  },
  arrow: {
    fontFamily: 'Bangers_400Regular', fontSize: 32, color: COMIC.yellow,
    alignSelf: 'center', paddingHorizontal: 14, opacity: 0.6,
  },
  arrowOpen: { transform: [{ rotate: '90deg' }] },

  // Parte expandida
  expandedBody: {
    borderTopWidth: 2, borderTopColor: 'rgba(255,255,255,0.07)',
    padding: 16,
  },
  block: { marginBottom: 20 },
  blockHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  accent: { width: 3, height: 16, borderRadius: 2 },
  blockTitle: { fontFamily: 'Bangers_400Regular', fontSize: 16, letterSpacing: 2 },

  // Barra de score total
  totalScoreRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginTop: 4, paddingTop: 10,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)',
  },
  totalScoreLabel: {
    fontFamily: 'Oswald_700Bold', fontSize: 10, letterSpacing: 2,
    color: 'rgba(255,255,255,0.4)', width: 75,
  },
  totalScoreBar: {
    flex: 1, height: 5, backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 3, overflow: 'hidden',
  },
  totalScoreFill: {
    height: '100%', backgroundColor: COMIC.yellow, borderRadius: 3,
  },
  totalScoreNum: {
    fontFamily: 'Bangers_400Regular', fontSize: 16, color: COMIC.yellow,
    width: 32, textAlign: 'right',
  },

  collapseBtn: {
    alignSelf: 'center', marginTop: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 24, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  collapseBtnText: {
    fontFamily: 'Oswald_700Bold', fontSize: 10, letterSpacing: 2,
    color: 'rgba(255,255,255,0.35)',
  },
});

// ─── COMPONENTE: FeaturedHeroCard ─────────────────────────────────────────────
const FeaturedHeroCard: React.FC<{ hero: Hero; onPress: () => void; accent: string }> = ({
  hero, onPress, accent,
}) => {
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const topStat = Object.entries(hero.powerstats)
    .filter(([, v]) => v !== 'null')
    .sort(([, a], [, b]) => Number(b) - Number(a))[0];

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.96); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      activeOpacity={1}
    >
      <Animated.View style={[fStyles.card, anim]}>
        <View style={[fStyles.stripe, { backgroundColor: accent }]} />
        <View style={fStyles.imgWrap}>
          <Image source={{ uri: hero.image.url }} style={fStyles.img} resizeMode="cover" />
          <LinearGradient colors={['transparent', 'rgba(10,10,46,0.95)']} style={StyleSheet.absoluteFill} />
        </View>
        <View style={fStyles.info}>
          <Text style={fStyles.name} numberOfLines={1}>{hero.name.toUpperCase()}</Text>
          <Text style={fStyles.publisher} numberOfLines={1}>{hero.biography.publisher || 'Unknown'}</Text>
          {topStat && (
            <View style={fStyles.pill}>
              <Text style={fStyles.pillText}>{topStat[0].toUpperCase()}: {topStat[1]}</Text>
            </View>
          )}
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const fStyles = StyleSheet.create({
  card: {
    width: 160, borderWidth: COMIC.borderWidth, borderColor: COMIC.ink,
    borderRadius: COMIC.radiusCard, overflow: 'hidden',
    shadowColor: COMIC.ink, shadowOffset: { width: 6, height: 6 }, shadowOpacity: 1, shadowRadius: 0, elevation: 8,
  },
  stripe: { height: 5 },
  imgWrap: { height: 200 },
  img: { width: '100%', height: '100%' },
  info: { padding: 12, backgroundColor: COMIC.darkBg },
  name: { fontFamily: 'Bangers_400Regular', fontSize: 16, letterSpacing: 1.5, color: COMIC.yellow, marginBottom: 2 },
  publisher: { fontFamily: 'Oswald_400Regular', fontSize: 9, letterSpacing: 1.5, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', marginBottom: 8 },
  pill: { backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start' },
  pillText: { fontFamily: 'Oswald_700Bold', fontSize: 9, letterSpacing: 1, color: 'rgba(255,255,255,0.7)' },
});

// ═══════════════════════════════════════════════════════════════════════════════
// ─── PANTALLA PRINCIPAL ───────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
export default function SearchScreen() {
  // ✅ useFonts() NO se llama aquí. Ya está en (inicio)/index.tsx.

  const [query, setQuery]               = useState('');
  const [results, setResults]           = useState<Hero[]>([]);
  const [searching, setSearching]       = useState(false);
  const [searched, setSearched]         = useState(false);
  const [searchError, setSearchError]   = useState('');
  const [featuredHeroes, setFeatured]   = useState<Hero[]>([]);
  const [featuredLoading, setFeatLoad]  = useState(true);

  const inputRef = useRef<TextInput>(null);
  const inputScale = useSharedValue(1);
  const inputAnim = useAnimatedStyle(() => ({ transform: [{ scale: inputScale.value }] }));

  // Cargar carrusel al montar
  useEffect(() => {
    (async () => {
      try {
        const data = await Promise.all(
          FEATURED_IDS.map((id) => fetch(`${API_BASE}/${id}`).then((r) => r.json()))
        );
        setFeatured(data.filter((h) => h.response !== 'error'));
      } catch (e) {
        console.warn('Error carrusel:', e);
      } finally {
        setFeatLoad(false);
      }
    })();
  }, []);

  // Función de búsqueda
  const handleSearch = useCallback(async (overrideTerm?: string) => {
    const term = (overrideTerm ?? query).trim();
    if (!term) return;
    setSearching(true);
    setSearched(true);
    setSearchError('');
    setResults([]);
    try {
      const res  = await fetch(`${API_BASE}/search/${encodeURIComponent(term)}`);
      const data = await res.json();
      if (data.response === 'success' && data.results?.length > 0) {
        setResults(data.results);
      } else {
        setSearchError(`No heroes found for "${term}"`);
      }
    } catch {
      setSearchError('Connection error. Check your internet.');
    } finally {
      setSearching(false);
    }
  }, [query]);

  // Limpiar búsqueda
  const clearSearch = useCallback(() => {
    setQuery(''); setResults([]); setSearched(false); setSearchError('');
    inputRef.current?.focus();
  }, []);

  // Buscar por chip / carrusel
  const searchChip = useCallback((name: string) => {
    setQuery(name);
    handleSearch(name);
  }, [handleSearch]);

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor={COMIC.ink} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* ══════════════════════════════════════════
            SECCIÓN 1 — HEADER + BÚSQUEDA
        ══════════════════════════════════════════ */}
        <LinearGradient colors={[COMIC.ink, COMIC.darkBg2, '#110030']} style={styles.header}>
          <HalftoneOverlay dotColor="rgba(255,214,0,0.07)" size={10} />

          <View style={styles.titleRow}>
            <Text style={styles.title}>FIND YOUR</Text>
            <Text style={styles.titleAccent}>HERO.</Text>
          </View>
          <Text style={styles.subtitle}>Search by name across 1,000+ characters</Text>

          {/* Input */}
          <Animated.View style={[styles.searchBar, inputAnim]}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="e.g. Batman, Spider-Man, Thor..."
              placeholderTextColor="rgba(255,255,255,0.35)"
              value={query}
              onChangeText={setQuery}
              onFocus={() => { inputScale.value = withSpring(1.01); }}
              onBlur={() => { inputScale.value = withSpring(1); }}
              onSubmitEditing={() => handleSearch()}
              returnKeyType="search"
              autoCapitalize="words"
              autoCorrect={false}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={clearSearch} style={styles.clearBtn}>
                <Text style={styles.clearBtnText}>✕</Text>
              </TouchableOpacity>
            )}
          </Animated.View>

          {/* Botón buscar */}
          <TouchableOpacity
            style={[styles.searchBtn, query.trim().length === 0 && { opacity: 0.5 }]}
            onPress={() => handleSearch()}
            disabled={query.trim().length === 0}
            activeOpacity={0.85}
          >
            <View style={styles.searchBtnShadow} />
            <View style={styles.searchBtnBody}>
              <Text style={styles.searchBtnText}>SEARCH HEROES</Text>
              <BurstLabel text="GO!" bg={COMIC.red} color="#fff" rotate={6} />
            </View>
          </TouchableOpacity>
        </LinearGradient>

        {/* ══════════════════════════════════════════
            SECCIÓN 2 — RESULTADOS
        ══════════════════════════════════════════ */}
        {searched && (
          <View style={styles.resultsSection}>

            {searching && (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="large" color={COMIC.red} />
                <Text style={styles.loadingText}>SCANNING DATABASE...</Text>
              </View>
            )}

            {!searching && searchError !== '' && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🦹</Text>
                <Text style={styles.emptyTitle}>{searchError}</Text>
                <Text style={styles.emptySub}>Try a different name or check the spelling.</Text>
                <TouchableOpacity onPress={clearSearch} style={styles.emptyBtn}>
                  <Text style={styles.emptyBtnText}>TRY AGAIN</Text>
                </TouchableOpacity>
              </View>
            )}

            {!searching && results.length > 0 && (
              <View>
                <View style={styles.resultsHeader}>
                  <View style={styles.labelLine} />
                  <Text style={styles.sectionLabel}>
                    ⚡ {results.length} RESULT{results.length !== 1 ? 'S' : ''} FOUND
                  </Text>
                  <Text style={styles.tapHint}>TAP TO EXPAND ›</Text>
                </View>
                {results.map((hero, i) => (
                  <HeroDetailCard key={hero.id} hero={hero} index={i} />
                ))}
              </View>
            )}
          </View>
        )}

        {/* ══════════════════════════════════════════
            SECCIÓN 3 — CARRUSEL DESTACADOS
        ══════════════════════════════════════════ */}
        {!searched && (
          <View style={styles.featuredSection}>
            <HalftoneOverlay dotColor="rgba(0,0,0,0.04)" size={12} />
            <View style={styles.sectionHeader}>
              <View style={styles.labelLine} />
              <Text style={styles.sectionLabel}>⭐ FEATURED HEROES</Text>
            </View>
            <Text style={styles.sectionTitle}>Earths Mightiest</Text>
            <Text style={styles.sectionSub}>Tap any card to search and see full stats.</Text>

            {featuredLoading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="large" color={COMIC.red} />
                <Text style={styles.loadingText}>ASSEMBLING HEROES...</Text>
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featuredScroll}>
                {featuredHeroes.map((hero, i) => (
                  <FeaturedHeroCard
                    key={hero.id}
                    hero={hero}
                    accent={CARD_ACCENTS[i % CARD_ACCENTS.length]}
                    onPress={() => searchChip(hero.name)}
                  />
                ))}
              </ScrollView>
            )}
          </View>
        )}

        {/* ══════════════════════════════════════════
            SECCIÓN 4 — CHIPS DE BÚSQUEDA RÁPIDA
        ══════════════════════════════════════════ */}
        {!searched && (
          <View style={styles.suggestionsSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.labelLine} />
              <Text style={styles.sectionLabel}>💡 POPULAR SEARCHES</Text>
            </View>
            <View style={styles.chipsRow}>
              {['Batman', 'Spider-Man', 'Superman', 'Wonder Woman', 'Thor', 'Iron Man', 'Flash', 'Joker'].map((name) => (
                <TouchableOpacity key={name} style={styles.chip} onPress={() => searchChip(name)} activeOpacity={0.7}>
                  <Text style={styles.chipText}>{name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── ESTILOS GLOBALES ─────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COMIC.paper },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },

  // Header
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 32, paddingHorizontal: 24,
    borderBottomWidth: COMIC.borderWidthThick, borderBottomColor: COMIC.yellow, overflow: 'hidden',
  },
  titleRow: { marginBottom: 8 },
  title: {
    fontFamily: 'Bangers_400Regular', fontSize: 44, letterSpacing: 3, color: '#fff', lineHeight: 44,
    textShadowColor: COMIC.ink, textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 0,
  },
  titleAccent: {
    fontFamily: 'Bangers_400Regular', fontSize: 56, letterSpacing: 3, color: COMIC.yellow, lineHeight: 56,
    textShadowColor: COMIC.ink, textShadowOffset: { width: 4, height: 4 }, textShadowRadius: 0,
  },
  subtitle: {
    fontFamily: 'Oswald_400Regular', fontSize: 14, color: 'rgba(255,255,255,0.7)',
    marginBottom: 24, letterSpacing: 0.5,
  },

  // Input
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: COMIC.borderWidth, borderColor: COMIC.yellow,
    borderRadius: COMIC.radius, paddingHorizontal: 14, paddingVertical: 10,
    marginBottom: 14, gap: 10,
  },
  searchIcon: { fontSize: 18 },
  input: { flex: 1, fontFamily: 'Oswald_400Regular', fontSize: 16, color: '#fff', letterSpacing: 0.5, padding: 0 },
  clearBtn: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  clearBtnText: { fontFamily: 'Oswald_700Bold', fontSize: 11, color: '#fff' },

  // Botón buscar
  searchBtn: { position: 'relative' },
  searchBtnShadow: { position: 'absolute', top: 5, left: 5, right: -5, bottom: -5, backgroundColor: COMIC.ink, borderRadius: COMIC.radius },
  searchBtnBody: {
    backgroundColor: COMIC.yellow, borderWidth: COMIC.borderWidth, borderColor: COMIC.ink,
    borderRadius: COMIC.radius, paddingVertical: 13, paddingHorizontal: 22,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  searchBtnText: { fontFamily: 'Bangers_400Regular', fontSize: 20, letterSpacing: 2, color: COMIC.ink },

  // Resultados
  resultsSection: { backgroundColor: COMIC.paper, paddingVertical: 16 },
  resultsHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 20, marginBottom: 16, marginTop: 8,
  },
  tapHint: {
    fontFamily: 'Oswald_700Bold', fontSize: 9, letterSpacing: 2,
    color: 'rgba(0,0,0,0.25)', textTransform: 'uppercase', marginLeft: 'auto',
  },

  // Empty
  emptyState: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24 },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontFamily: 'Bangers_400Regular', fontSize: 20, letterSpacing: 2, color: COMIC.ink, textAlign: 'center', marginBottom: 8 },
  emptySub: { fontFamily: 'Oswald_400Regular', fontSize: 13, color: '#888', textAlign: 'center', marginBottom: 24 },
  emptyBtn: { backgroundColor: COMIC.yellow, borderWidth: COMIC.borderWidth, borderColor: COMIC.ink, paddingHorizontal: 24, paddingVertical: 10, borderRadius: COMIC.radius },
  emptyBtnText: { fontFamily: 'Bangers_400Regular', fontSize: 16, letterSpacing: 2, color: COMIC.ink },

  // Featured
  featuredSection: {
    backgroundColor: COMIC.paper, paddingVertical: 36,
    borderBottomWidth: COMIC.borderWidthThick, borderBottomColor: COMIC.ink, overflow: 'hidden',
  },
  featuredScroll: { paddingHorizontal: 24, paddingBottom: 8, gap: 16 },

  // Suggestions
  suggestionsSection: {
    backgroundColor: COMIC.paper2, paddingVertical: 28, paddingBottom: 36,
    borderTopWidth: COMIC.borderWidthThick, borderTopColor: COMIC.ink,
  },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 24, gap: 10, marginTop: 12 },
  chip: {
    backgroundColor: COMIC.ink, borderWidth: COMIC.borderWidth, borderColor: COMIC.ink,
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6,
    shadowColor: COMIC.ink, shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4,
  },
  chipText: { fontFamily: 'Oswald_700Bold', fontSize: 12, letterSpacing: 1, color: COMIC.yellow, textTransform: 'uppercase' },

  // Loading
  loadingRow: { alignItems: 'center', paddingVertical: 40, gap: 14 },
  loadingText: { fontFamily: 'Bangers_400Regular', fontSize: 20, letterSpacing: 3, color: COMIC.ink },

  // Sección común
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 24, marginBottom: 8 },
  labelLine: { width: 30, height: 3, backgroundColor: COMIC.red },
  sectionLabel: { fontFamily: 'Oswald_700Bold', fontSize: COMIC.label, letterSpacing: 4, color: COMIC.red, textTransform: 'uppercase' },
  sectionTitle: {
    fontFamily: 'Bangers_400Regular', fontSize: 32, letterSpacing: 2, color: COMIC.ink,
    paddingHorizontal: 24, marginBottom: 6,
    textShadowColor: COMIC.yellow, textShadowOffset: { width: 3, height: 3 }, textShadowRadius: 0,
  },
  sectionSub: { fontFamily: 'Oswald_400Regular', fontSize: 13, color: '#666', paddingHorizontal: 24, marginBottom: 20, lineHeight: 20 },
});
