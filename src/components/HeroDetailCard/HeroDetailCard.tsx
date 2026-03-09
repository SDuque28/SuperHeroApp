import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeIn, FadeOut, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import AnimatedStatBar from "@/src/components/AnimatedStatBar/AnimatedStatBar";
import InfoRow from "@/src/components/InfoRow/InfoRow";

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
    "full-name": string;
    "alter-egos": string;
    aliases: string[];
    "place-of-birth": string;
    "first-appearance": string;
    publisher: string;
    alignment: string;
  };
  appearance: {
    gender: string;
    race: string;
    height: string[];
    weight: string[];
    "eye-color": string;
    "hair-color": string;
  };
  work: { occupation: string; base: string };
  connections: { "group-affiliation": string; relatives: string };
}

const ALIGNMENT_COLOR: Record<string, string> = {
  good: "#00C853",
  bad: "#E8173D",
  neutral: "#FFD600",
};

export default function HeroDetailCard({
  hero,
  index,
  onViewFull,
}: {
  hero: Hero;
  index: number;
  onViewFull: (hero: Hero) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const scale = useSharedValue(1);
  const cardAnim = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const stats = [
    { label: "Intelligence", value: Number(hero.powerstats.intelligence) || 0 },
    { label: "Strength",     value: Number(hero.powerstats.strength) || 0 },
    { label: "Speed",        value: Number(hero.powerstats.speed) || 0 },
    { label: "Durability",   value: Number(hero.powerstats.durability) || 0 },
    { label: "Power",        value: Number(hero.powerstats.power) || 0 },
    { label: "Combat",       value: Number(hero.powerstats.combat) || 0 },
  ];
  const topStat = [...stats].sort((a, b) => b.value - a.value)[0];
  const totalScore = stats.reduce((sum, s) => sum + s.value, 0);
  const alignment = (hero.biography.alignment ?? "neutral").toLowerCase();
  const alignColor = ALIGNMENT_COLOR[alignment] ?? "#FFD600";

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
          {/* ── COLLAPSED: always visible ── */}
          <View style={cStyles.topRow}>
            <View style={cStyles.imgWrap}>
              <Image source={{ uri: hero.image.url }} style={cStyles.img} resizeMode="cover" />
              <LinearGradient
                colors={["transparent", "rgba(10,10,46,0.7)"]}
                style={StyleSheet.absoluteFill}
              />
              <View style={[cStyles.alignBadge, { backgroundColor: alignColor }]}>
              </View>
            </View>

            <View style={cStyles.basicInfo}>
              <Text style={cStyles.name} numberOfLines={1}>
                {hero.name.toUpperCase()}
              </Text>
              {hero.biography["full-name"] && hero.biography["full-name"] !== "-" && (
                <Text style={cStyles.fullName} numberOfLines={1}>
                  {hero.biography["full-name"]}
                </Text>
              )}
              <Text style={cStyles.publisher} numberOfLines={1}>
                {hero.biography.publisher || "Unknown Publisher"}
              </Text>
              {topStat.value > 0 && (
                <View style={[cStyles.topStatBadge, { backgroundColor: alignColor }]}>
                  <Text style={cStyles.topStatText}>
                    ⚡ {topStat.label.toUpperCase().slice(0, 5)}: {topStat.value}
                  </Text>
                </View>
              )}
              {totalScore > 0 && (
                <Text style={cStyles.scoreText}>POWER SCORE {totalScore} / 600</Text>
              )}
            </View>

            <Text style={[cStyles.arrow, expanded && cStyles.arrowOpen]}>›</Text>
          </View>

          {/* ── EXPANDED ── */}
          {expanded && (
            <View style={cStyles.expandedBody}>
              {/* Power Stats */}
              <View style={cStyles.block}>
                <View style={cStyles.blockHead}>
                  <View style={[cStyles.accent, { backgroundColor: "#FFD600" }]} />
                  <Text style={[cStyles.blockTitle, { color: "#FFD600" }]}>⚡ POWER STATS</Text>
                </View>
                {stats.map((s, i) => (
                  <AnimatedStatBar key={s.label} label={s.label} value={s.value} delay={i * 90} />
                ))}
                <View style={cStyles.totalScoreRow}>
                  <Text style={cStyles.totalScoreLabel}>TOTAL</Text>
                  <View style={cStyles.totalScoreBar}>
                    <View style={[cStyles.totalScoreFill, { width: `${(totalScore / 600) * 100}%` }]} />
                  </View>
                  <Text style={cStyles.totalScoreNum}>{totalScore}</Text>
                </View>
              </View>

              {/* Biography */}
              <View style={cStyles.block}>
                <View style={cStyles.blockHead}>
                  <View style={[cStyles.accent, { backgroundColor: "#0057FF" }]} />
                  <Text style={[cStyles.blockTitle, { color: "#0057FF" }]}>📖 BIOGRAPHY</Text>
                </View>
                <InfoRow label="Alter Ego"   value={hero.biography["alter-egos"]}      accent={"#0057FF"} />
                <InfoRow label="Born"         value={hero.biography["place-of-birth"]}  accent={"#0057FF"} />
                <InfoRow label="1st Appear."  value={hero.biography["first-appearance"]}accent={"#0057FF"} />
                <InfoRow label="Publisher"    value={hero.biography.publisher}           accent={"#0057FF"} />
                <InfoRow
                  label="Alignment"
                  value={`${alignment.charAt(0).toUpperCase() + alignment.slice(1)}`}
                  accent={alignColor}
                />
              </View>

              {/* Appearance */}
              <View style={cStyles.block}>
                <View style={cStyles.blockHead}>
                  <View style={[cStyles.accent, { backgroundColor: "#FF5252" }]} />
                  <Text style={[cStyles.blockTitle, { color: "#FF5252" }]}>🪞 APPEARANCE</Text>
                </View>
                <InfoRow label="Gender" value={hero.appearance.gender}                                               accent={"#FF5252"} />
                <InfoRow label="Race"   value={hero.appearance.race}                                                 accent={"#FF5252"} />
                <InfoRow label="Height" value={hero.appearance.height?.[1] ?? hero.appearance.height?.[0]}          accent={"#FF5252"} />
                <InfoRow label="Weight" value={hero.appearance.weight?.[1] ?? hero.appearance.weight?.[0]}          accent={"#FF5252"} />
                <InfoRow label="Eyes"   value={hero.appearance["eye-color"]}                                         accent={"#FF5252"} />
                <InfoRow label="Hair"   value={hero.appearance["hair-color"]}                                        accent={"#FF5252"} />
              </View>

              {/* Work */}
              {(hero.work?.occupation || hero.work?.base) && (
                <View style={cStyles.block}>
                  <View style={cStyles.blockHead}>
                    <View style={[cStyles.accent, { backgroundColor: "#00C853" }]} />
                    <Text style={[cStyles.blockTitle, { color: "#00C853" }]}>🏢 WORK</Text>
                  </View>
                  <InfoRow label="Occupation" value={hero.work.occupation} accent={"#00C853"} />
                  <InfoRow label="Base"        value={hero.work.base}       accent={"#00C853"} />
                </View>
              )}

              {/* Connections */}
              {(hero.connections?.["group-affiliation"] || hero.connections?.relatives) && (
                <View style={[cStyles.block, { marginBottom: 0 }]}>
                  <View style={cStyles.blockHead}>
                    <View style={[cStyles.accent, { backgroundColor: "#FFD600" }]} />
                    <Text style={[cStyles.blockTitle, { color: "#FFD600" }]}>🤝 CONNECTIONS</Text>
                  </View>
                  <InfoRow label="Groups"    value={hero.connections["group-affiliation"]} accent={"#FFD600"} />
                  <InfoRow label="Relatives" value={hero.connections.relatives}             accent={"#FFD600"} />
                </View>
              )}

              {/* View Full Profile button */}
              <TouchableOpacity
                onPress={() => onViewFull(hero)}
                style={cStyles.viewFullBtn}
                activeOpacity={0.85}
              >
                <View style={cStyles.viewFullBtnShadow} />
                <View style={cStyles.viewFullBtnBody}>
                  <Text style={cStyles.viewFullBtnText}>⚡ VIEW FULL PROFILE</Text>
                </View>
              </TouchableOpacity>

              {/* Collapse */}
              <TouchableOpacity onPress={() => setExpanded(false)} style={cStyles.collapseBtn}>
                <Text style={cStyles.collapseBtnText}>▲ COLLAPSE</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const cStyles = StyleSheet.create({
  card: {
    backgroundColor: "#0A0A2E",
    borderWidth: 3,
    borderColor: "#1A1028",
    borderRadius: 4,
    overflow: "hidden",
    shadowColor: "#1A1028",
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  topRow: { flexDirection: "row", alignItems: "stretch" },
  imgWrap: { width: 100, height: 130, position: "relative" },
  img: { width: "100%", height: "100%" },
  alignBadge: {
    position: "absolute",
    bottom: 6,
    left: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#1A1028",
  },
  alignEmoji: { fontSize: 13 },
  basicInfo: { flex: 1, padding: 12, justifyContent: "center", gap: 3 },
  name: {
    fontFamily: "Bangers_400Regular",
    fontSize: 20,
    letterSpacing: 2,
    color: "#FFD600",
    textShadowColor: "#1A1028",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  fullName: {
    fontFamily: "Oswald_400Regular",
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
  },
  publisher: {
    fontFamily: "Oswald_700Bold",
    fontSize: 9,
    letterSpacing: 2,
    color: "#E8173D",
    textTransform: "uppercase",
  },
  topStatBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 3,
    marginTop: 5,
  },
  topStatText: {
    fontFamily: "Oswald_700Bold",
    fontSize: 9,
    letterSpacing: 1,
    color: "#1A1028",
  },
  scoreText: {
    fontFamily: "Oswald_400Regular",
    fontSize: 9,
    letterSpacing: 1,
    color: "rgba(255,255,255,0.3)",
    marginTop: 3,
  },
  arrow: {
    fontFamily: "Bangers_400Regular",
    fontSize: 32,
    color: "#FFD600",
    alignSelf: "center",
    paddingHorizontal: 14,
    opacity: 0.6,
  },
  arrowOpen: { transform: [{ rotate: "90deg" }] },
  expandedBody: {
    borderTopWidth: 2,
    borderTopColor: "rgba(255,255,255,0.07)",
    padding: 16,
  },
  block: { marginBottom: 20 },
  blockHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  accent: { width: 3, height: 16, borderRadius: 2 },
  blockTitle: {
    fontFamily: "Bangers_400Regular",
    fontSize: 16,
    letterSpacing: 2,
  },
  totalScoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  totalScoreLabel: {
    fontFamily: "Oswald_700Bold",
    fontSize: 10,
    letterSpacing: 2,
    color: "rgba(255,255,255,0.4)",
    width: 75,
  },
  totalScoreBar: {
    flex: 1,
    height: 5,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 3,
    overflow: "hidden",
  },
  totalScoreFill: {
    height: "100%",
    backgroundColor: "#FFD600",
    borderRadius: 3,
  },
  totalScoreNum: {
    fontFamily: "Bangers_400Regular",
    fontSize: 16,
    color: "#FFD600",
    width: 32,
    textAlign: "right",
  },
  // ── View Full Profile button ──
  viewFullBtn: { position: "relative", marginTop: 16, marginBottom: 6 },
  viewFullBtnShadow: {
    position: "absolute",
    top: 5, left: 5, right: -5, bottom: -5,
    backgroundColor: "#E8173D",
    borderRadius: 4,
  },
  viewFullBtnBody: {
    backgroundColor: "#FFD600",
    borderWidth: 3,
    borderColor: "#1A1028",
    borderRadius: 4,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  viewFullBtnText: {
    fontFamily: "Bangers_400Regular",
    fontSize: 18,
    letterSpacing: 2,
    color: "#1A1028",
  },
  collapseBtn: {
    alignSelf: "center",
    marginTop: 10,
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  collapseBtnText: {
    fontFamily: "Oswald_700Bold",
    fontSize: 10,
    letterSpacing: 2,
    color: "rgba(255,255,255,0.35)",
  },
});