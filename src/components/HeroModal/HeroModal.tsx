import AnimatedStatBar from "@/src/components/AnimatedStatBar/AnimatedStatBar";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image
} from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from "react-native-reanimated";

export interface Hero {
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
const ALIGNMENT_LABEL: Record<string, string> = {
  good: "HERO",
  bad: "VILLAIN",
  neutral: "NEUTRAL",
};

export default function HeroModal({
  hero,
  visible,
  onClose,
  onViewFull,
}: {
  hero: Hero | null;
  visible: boolean;
  onClose: () => void;
  onViewFull: (hero: Hero) => void;
}) {
  if (!hero) return null;

  const stats = [
    { label: "Intelligence", value: Number(hero.powerstats.intelligence) || 0 },
    { label: "Strength", value: Number(hero.powerstats.strength) || 0 },
    { label: "Speed", value: Number(hero.powerstats.speed) || 0 },
    { label: "Durability", value: Number(hero.powerstats.durability) || 0 },
    { label: "Power", value: Number(hero.powerstats.power) || 0 },
    { label: "Combat", value: Number(hero.powerstats.combat) || 0 },
  ];

  const top3 = [...stats]
    .filter((s) => s.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);

  const totalScore = stats.reduce((sum, s) => sum + s.value, 0);
  const alignment = (hero.biography.alignment ?? "neutral").toLowerCase();
  const alignColor = ALIGNMENT_COLOR[alignment] ?? "#FFD600";
  const alignLabel = ALIGNMENT_LABEL[alignment] ?? alignment.toUpperCase();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* Backdrop — tap anywhere outside the sheet to close */}
      <Animated.View
        entering={FadeIn.duration(180)}
        exiting={FadeOut.duration(200)}
        style={styles.backdrop}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        {/* Sheet slides up from bottom */}
        <Animated.View
          entering={SlideInDown.springify().damping(22).stiffness(150)}
          exiting={SlideOutDown.duration(200)}
          style={styles.sheet}
        >
          {/* ✕ close */}
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>

          {/* ── HERO ROW: image | info ── */}
          <View style={styles.heroRow}>
            {/* Image */}
            <View style={styles.imageWrap}>
              <Image
                source={{ uri: hero.image.url }}
                style={styles.image}
                resizeMode="cover"
              />
              <LinearGradient
                colors={["transparent", "rgba(10,10,46,0.55)"]}
                style={StyleSheet.absoluteFill}
              />
              {/* Alignment chip bottom of image */}
              <View style={[styles.alignChip, { backgroundColor: alignColor }]}>
                <Text style={styles.alignChipText}>{alignLabel}</Text>
              </View>
            </View>

            {/* Info */}
            <View style={styles.info}>
              <Text
                style={styles.heroName}
                numberOfLines={2}
                adjustsFontSizeToFit
              >
                {hero.name.toUpperCase()}
              </Text>

              {hero.biography["full-name"] !== "-" &&
                hero.biography["full-name"] && (
                  <Text style={styles.fullName} numberOfLines={1}>
                    {hero.biography["full-name"]}
                  </Text>
                )}

              <Text style={styles.publisher} numberOfLines={1}>
                {hero.biography.publisher || "Unknown Publisher"}
              </Text>

              {totalScore > 0 && (
                <View style={styles.scorePill}>
                  <Text style={styles.scoreText}>{totalScore} / 600</Text>
                </View>
              )}
            </View>
          </View>

          {/* ── TOP 3 STATS ── */}
          <View style={styles.statsBlock}>
            <Text style={styles.statsLabel}>TOP STATS</Text>
            {top3.map((s, i) => (
              <AnimatedStatBar
                key={s.label}
                label={s.label}
                value={s.value}
                delay={i * 80}
              />
            ))}
          </View>

          {/* ── CTA ── */}
          <View style={styles.btnWrap}>
            <TouchableOpacity
              onPress={() => onViewFull(hero)}
              activeOpacity={0.85}
              style={styles.viewFullBtn}
            >
              <View style={styles.btnShadow} />
              <View style={styles.btnBody}>
                <Text style={styles.btnText}>VIEW FULL PROFILE</Text>
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(10,10,46,0.75)",
    justifyContent: "center",
    alignContent: "center",
    paddingLeft:20
  },
  sheet: {
    backgroundColor: "#0A0A2E",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 3,
    borderColor: "#FFD600",
    borderBottomWidth: 0,
    overflow: "hidden",
    shadowColor: "#FFD600",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.3,
    shadowRadius: 0,
    elevation: 20,
    maxWidth: "95%",
  },

  closeBtn: {
    position: "absolute",
    top: 12,
    right: 14,
    zIndex: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtnText: {
    fontFamily: "Oswald_700Bold",
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
  },

  // ── Hero row ──
  heroRow: {
    flexDirection: "row",
    padding: 14,
    paddingTop: 18,
    gap: 14,
  },
  imageWrap: {
    width: 100,
    height: 130,
    borderRadius: 6,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#1A1028",
    flexShrink: 0,
    position: "relative",
  },
  image: { width: "100%", height: "100%" },
  alignChip: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 3,
    alignItems: "center",
  },
  alignChipText: {
    fontFamily: "Oswald_700Bold",
    fontSize: 8,
    letterSpacing: 2,
    color: "#1A1028",
  },
  info: { flex: 1, justifyContent: "center", gap: 4 },
  heroName: {
    fontFamily: "Bangers_400Regular",
    fontSize: 28,
    letterSpacing: 2,
    color: "#FFD600",
    textShadowColor: "#1A1028",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
    lineHeight: 30,
  },
  fullName: {
    fontFamily: "Oswald_400Regular",
    fontSize: 11,
    color: "rgba(255,255,255,0.45)",
  },
  publisher: {
    fontFamily: "Oswald_700Bold",
    fontSize: 9,
    letterSpacing: 2,
    color: "#E8173D",
    textTransform: "uppercase",
  },
  scorePill: {
    alignSelf: "flex-start",
    marginTop: 2,
    backgroundColor: "rgba(255,214,0,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,214,0,0.3)",
    borderRadius: 3,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  scoreText: {
    fontFamily: "Oswald_700Bold",
    fontSize: 9,
    letterSpacing: 1,
    color: "rgba(255,214,0,0.7)",
  },

  // ── Stats block ──
  statsBlock: {
    paddingHorizontal: 14,
    paddingBottom: 4,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
    paddingTop: 10,
  },
  statsLabel: {
    fontFamily: "Oswald_700Bold",
    fontSize: 8,
    letterSpacing: 3,
    color: "rgba(255,255,255,0.3)",
    textTransform: "uppercase",
    marginBottom: 8,
  },

  // ── Button ──
  btnWrap: { padding: 14, paddingTop: 8 },
  viewFullBtn: { position: "relative" },
  btnShadow: {
    position: "absolute",
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
    backgroundColor: "#E8173D",
    borderRadius: 4,
  },
  btnBody: {
    backgroundColor: "#FFD600",
    borderWidth: 3,
    borderColor: "#1A1028",
    borderRadius: 4,
    paddingVertical: 12,
    alignItems: "center",
  },
  btnText: {
    fontFamily: "Bangers_400Regular",
    fontSize: 18,
    letterSpacing: 2,
    color: "#1A1028",
  },
});
