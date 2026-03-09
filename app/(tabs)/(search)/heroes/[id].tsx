
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import axios from "axios";

// ─── API ─────────────────────────────────────────────────────────────────────
const API_KEY = "ddc92e6ed8ef5366368a9cff47b3dd8c";
const api = axios.create({ baseURL: `https://superheroapi.com/api/${API_KEY}`, timeout: 10_000 });

// ─── TYPES ───────────────────────────────────────────────────────────────────
interface Hero {
  id: string;
  name: string;
  image: { url: string };
  powerstats: { intelligence: string; strength: string; speed: string; durability: string; power: string; combat: string; };
  biography: { "full-name": string; "alter-egos": string; aliases: string[]; "place-of-birth": string; "first-appearance": string; publisher: string; alignment: string; };
  appearance: { gender: string; race: string; height: string[]; weight: string[]; "eye-color": string; "hair-color": string; };
  work: { occupation: string; base: string };
  connections: { "group-affiliation": string; relatives: string };
}

const SCREEN_W = Dimensions.get("window").width;
const IMG_H    = SCREEN_W * 0.9;

const ALIGN_COLOR: Record<string, string> = { good: "#00C853", bad: "#E8173D", neutral: "#FFD600" };

// ─── STAT BAR ─────────────────────────────────────────────────────────────────
function StatBar({ label, value, delay = 0 }: { label: string; value: number; delay?: number }) {
  const w = useSharedValue(0);

  useEffect(() => {
    const t = setTimeout(() => {
      w.value = withTiming(value / 100, { duration: 800, easing: Easing.out(Easing.quad) });
    }, delay);
    return () => clearTimeout(t);
  }, [value, delay, w]);

  const barAnim = useAnimatedStyle(() => ({ width: `${w.value * 100}%` }));

  const color =
    value >= 80 ? "#00C853" :
    value >= 50 ? "#FFD600" :
    value >= 25 ? "#E8173D" : "#555";

  return (
    <View style={sb.row}>
      <Text style={sb.label}>{label}</Text>
      <View style={sb.track}>
        <Animated.View style={[sb.fill, { backgroundColor: color }, barAnim]}>
          {/* inner shine */}
          <View style={sb.shine} />
        </Animated.View>
      </View>
      <Text style={[sb.num, { color }]}>{value || "—"}</Text>
    </View>
  );
}

const sb = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  label: {
    fontFamily: "Oswald_700Bold", fontSize: 10, letterSpacing: 1,
    color: "rgba(255,255,255,0.5)", textTransform: "uppercase", width: 80,
  },
  track: {
    flex: 1, height: 8, backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 4, overflow: "hidden",
  },
  fill: { height: "100%", borderRadius: 4, overflow: "hidden", position: "relative" },
  shine: {
    position: "absolute", top: 0, left: 0, right: 0, height: "50%",
    backgroundColor: "rgba(255,255,255,0.25)", borderRadius: 4,
  },
  num: { fontFamily: "Bangers_400Regular", fontSize: 16, letterSpacing: 1, width: 30, textAlign: "right" },
});

// ─── INFO ROW ─────────────────────────────────────────────────────────────────
function InfoRow({ label, value, color = "#FFD600" }: { label: string; value?: string; color?: string }) {
  if (!value || value === "-" || value === "null" || value.trim() === "") return null;
  return (
    <View style={ir.row}>
      <Text style={[ir.label, { color }]}>{label}</Text>
      <Text style={ir.value}>{value}</Text>
    </View>
  );
}

const ir = StyleSheet.create({
  row: { flexDirection: "row", gap: 10, marginBottom: 8 },
  label: {
    fontFamily: "Oswald_700Bold", fontSize: 9, letterSpacing: 2,
    textTransform: "uppercase", width: 90, paddingTop: 2,
  },
  value: {
    flex: 1, fontFamily: "Oswald_400Regular", fontSize: 13,
    color: "rgba(255,255,255,0.8)", lineHeight: 18,
  },
});

// ─── SECTION ─────────────────────────────────────────────────────────────────
function Section({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <View style={sec.wrap}>
      <View style={sec.head}>
        <View style={[sec.bar, { backgroundColor: color }]} />
        <Text style={[sec.title, { color }]}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

const sec = StyleSheet.create({
  wrap: { marginBottom: 20 },
  head: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  bar:  { width: 3, height: 18, borderRadius: 2 },
  title: { fontFamily: "Bangers_400Regular", fontSize: 18, letterSpacing: 2 },
});

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN
// ═══════════════════════════════════════════════════════════════════════════════
export default function HeroDetailScreen() {
  const { id, heroData } = useLocalSearchParams<{ id: string; heroData?: string }>();
  const [hero, setHero]     = useState<Hero | null>(null);
  const [loading, setLoad]  = useState(true);
  const [error, setError]   = useState("");

  useEffect(() => {
    // Use pre-loaded data if available — no extra network round-trip
    if (heroData) {
      try { setHero(JSON.parse(heroData)); setLoad(false); return; } catch { /* fall through */ }
    }
    (async () => {
      try {
        const { data } = await api.get<Hero & { response?: string }>(`/${id}`);
        if (data.response === "error") setError("Hero not found.");
        else setHero(data);
      } catch { setError("Could not load hero. Check your connection."); }
      finally { setLoad(false); }
    })();
  }, [id, heroData]);

  // ── Loading ──
  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color="#FFD600" />
        <Text style={s.loadingText}>LOADING...</Text>
      </View>
    );
  }

  // ── Error ──
  if (error || !hero) {
    return (
      <View style={s.center}>
        <Text style={{ fontSize: 48 }}>🦹</Text>
        <Text style={s.errorText}>{error || "Something went wrong."}</Text>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backBtnText}>← GO BACK</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Derived values ──
  const stats = [
    { label: "Intelligence", value: Number(hero.powerstats.intelligence) || 0 },
    { label: "Strength",     value: Number(hero.powerstats.strength) || 0 },
    { label: "Speed",        value: Number(hero.powerstats.speed) || 0 },
    { label: "Durability",   value: Number(hero.powerstats.durability) || 0 },
    { label: "Power",        value: Number(hero.powerstats.power) || 0 },
    { label: "Combat",       value: Number(hero.powerstats.combat) || 0 },
  ];
  const total     = stats.reduce((acc, s) => acc + s.value, 0);
  const alignment = (hero.biography.alignment ?? "neutral").toLowerCase();
  const aColor    = ALIGN_COLOR[alignment] ?? "#FFD600";
  const aliases   = hero.biography.aliases?.filter((a) => a !== "-").join(", ");

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A2E" />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── HERO IMAGE HEADER ── */}
        <View style={{ height: IMG_H }}>
          <Image source={{ uri: hero.image.url }} style={StyleSheet.absoluteFill} contentFit="cover" />
          <LinearGradient
            colors={["rgba(10,10,46,0.1)", "rgba(10,10,46,0.97)"]}
            style={StyleSheet.absoluteFill}
          />

          {/* Back button */}
          <TouchableOpacity onPress={() => router.back()} style={s.backButton} activeOpacity={0.8}>
            <Text style={s.backArrow}>‹</Text>
            <Text style={s.backLabel}>BACK</Text>
          </TouchableOpacity>

          {/* Alignment badge */}
          <View style={[s.alignBadge, { backgroundColor: aColor }]}>
            <Text style={s.alignBadgeText}>{alignment.toUpperCase()}</Text>
          </View>

          {/* Name at bottom of image */}
          <View style={s.nameBlock}>
            <Text style={s.heroName}>{hero.name.toUpperCase()}</Text>
            {hero.biography["full-name"] && hero.biography["full-name"] !== "-" && (
              <Text style={s.heroFullName}>{hero.biography["full-name"]}</Text>
            )}
            <Text style={s.heroPublisher}>{hero.biography.publisher || "Unknown Publisher"}</Text>
          </View>
        </View>

        {/* ── BODY ── */}
        <View style={s.body}>

          {/* Power score summary bar */}
          {total > 0 && (
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>POWER SCORE</Text>
              <View style={s.totalTrack}>
                <View style={[s.totalFill, { width: `${(total / 600) * 100}%` }]} />
              </View>
              <Text style={s.totalNum}>{total}/600</Text>
            </View>
          )}

          {/* STATS */}
          <Section title="POWER STATS" color="#FFD600">
            {stats.map((s2, i) => (
              <StatBar key={s2.label} label={s2.label} value={s2.value} delay={i * 80} />
            ))}
          </Section>

          {/* BIOGRAPHY */}
          <Section title="BIOGRAPHY" color="#0057FF">
            <InfoRow label="Full Name"   value={hero.biography["full-name"]}       color="#0057FF" />
            <InfoRow label="Alter Egos"  value={hero.biography["alter-egos"]}      color="#0057FF" />
            <InfoRow label="Aliases"     value={aliases}                            color="#0057FF" />
            <InfoRow label="Born"        value={hero.biography["place-of-birth"]}  color="#0057FF" />
            <InfoRow label="1st Appear." value={hero.biography["first-appearance"]}color="#0057FF" />
            <InfoRow label="Publisher"   value={hero.biography.publisher}           color="#0057FF" />
            <InfoRow label="Alignment"   value={alignment.charAt(0).toUpperCase() + alignment.slice(1)} color={aColor} />
          </Section>

          {/* APPEARANCE */}
          <Section title="APPEARANCE" color="#E8173D">
            <InfoRow label="Gender" value={hero.appearance.gender}                                        color="#E8173D" />
            <InfoRow label="Race"   value={hero.appearance.race}                                          color="#E8173D" />
            <InfoRow label="Height" value={hero.appearance.height?.[1] ?? hero.appearance.height?.[0]}   color="#E8173D" />
            <InfoRow label="Weight" value={hero.appearance.weight?.[1] ?? hero.appearance.weight?.[0]}   color="#E8173D" />
            <InfoRow label="Eyes"   value={hero.appearance["eye-color"]}                                  color="#E8173D" />
            <InfoRow label="Hair"   value={hero.appearance["hair-color"]}                                 color="#E8173D" />
          </Section>

          {/* WORK — only if data exists */}
          {(hero.work?.occupation || hero.work?.base) && (
            <Section title="WORK" color="#00C853">
              <InfoRow label="Occupation" value={hero.work.occupation} color="#00C853" />
              <InfoRow label="Base"       value={hero.work.base}       color="#00C853" />
            </Section>
          )}

          {/* CONNECTIONS — only if data exists */}
          {(hero.connections?.["group-affiliation"] || hero.connections?.relatives) && (
            <Section title="CONNECTIONS" color="#FFD600">
              <InfoRow label="Groups"    value={hero.connections["group-affiliation"]} color="#FFD600" />
              <InfoRow label="Relatives" value={hero.connections.relatives}             color="#FFD600" />
            </Section>
          )}

          {/* Back button at the bottom */}
          <TouchableOpacity onPress={() => router.back()} style={s.bottomBack} activeOpacity={0.8}>
            <Text style={s.bottomBackText}>‹ BACK TO SEARCH</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </View>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0A0A2E" },

  // Loading / error
  center: {
    flex: 1, backgroundColor: "#0A0A2E",
    alignItems: "center", justifyContent: "center", gap: 14, padding: 32,
  },
  loadingText: {
    fontFamily: "Bangers_400Regular", fontSize: 20,
    letterSpacing: 3, color: "#FFD600",
  },
  errorText: {
    fontFamily: "Bangers_400Regular", fontSize: 18,
    letterSpacing: 2, color: "#E8173D", textAlign: "center",
  },
  backBtn: {
    backgroundColor: "#FFD600", borderWidth: 3, borderColor: "#1A1028",
    paddingHorizontal: 24, paddingVertical: 10, borderRadius: 4, marginTop: 8,
  },
  backBtnText: {
    fontFamily: "Bangers_400Regular", fontSize: 16, letterSpacing: 2, color: "#1A1028",
  },

  // Back button (top-left on image)
  backButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 56 : 36,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(10,10,46,0.6)",
    borderWidth: 2,
    borderColor: "#FFD600",
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  backArrow: { fontFamily: "Bangers_400Regular", fontSize: 20, color: "#FFD600", lineHeight: 20 },
  backLabel: { fontFamily: "Oswald_700Bold", fontSize: 11, letterSpacing: 2, color: "#FFD600" },

  // Alignment badge (top-right on image)
  alignBadge: {
    position: "absolute",
    top: Platform.OS === "ios" ? 56 : 36,
    right: 16,
    borderWidth: 2,
    borderColor: "#1A1028",
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    shadowColor: "#1A1028",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  alignBadgeText: {
    fontFamily: "Oswald_700Bold", fontSize: 10, letterSpacing: 2, color: "#1A1028",
  },

  // Name block (bottom of image)
  nameBlock: { position: "absolute", bottom: 20, left: 20, right: 20 },
  heroName: {
    fontFamily: "Bangers_400Regular", fontSize: 52, letterSpacing: 3,
    color: "#FFD600", lineHeight: 52,
    textShadowColor: "#1A1028", textShadowOffset: { width: 4, height: 4 }, textShadowRadius: 0,
  },
  heroFullName: {
    fontFamily: "Oswald_400Regular", fontSize: 13,
    color: "rgba(255,255,255,0.55)", marginTop: 2,
  },
  heroPublisher: {
    fontFamily: "Oswald_700Bold", fontSize: 10, letterSpacing: 2,
    color: "#E8173D", textTransform: "uppercase", marginTop: 3,
  },

  // Body
  body: {
    backgroundColor: "#0A0A2E",
    borderTopWidth: 5,
    borderTopColor: "#FFD600",
    padding: 20,
    paddingTop: 22,
  },

  // Total score bar
  totalRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
    marginBottom: 22,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 6, padding: 10,
  },
  totalLabel: {
    fontFamily: "Oswald_700Bold", fontSize: 8, letterSpacing: 2,
    color: "rgba(255,255,255,0.35)", textTransform: "uppercase", width: 60,
  },
  totalTrack: {
    flex: 1, height: 5, backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 3, overflow: "hidden",
  },
  totalFill: { height: "100%", backgroundColor: "#FFD600", borderRadius: 3 },
  totalNum: {
    fontFamily: "Bangers_400Regular", fontSize: 14, letterSpacing: 1, color: "#FFD600",
  },

  // Bottom back button
  bottomBack: {
    marginTop: 12,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.15)",
    borderRadius: 4,
    paddingVertical: 12,
    alignItems: "center",
  },
  bottomBackText: {
    fontFamily: "Bangers_400Regular", fontSize: 16, letterSpacing: 2,
    color: "rgba(255,255,255,0.4)",
  },
});