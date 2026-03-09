/**
 * Dependencies (run these if not already installed):
 *   npx expo install expo-linear-gradient
 *   npx expo install expo-font @expo-google-fonts/bangers @expo-google-fonts/oswald
 *   npx expo install react-native-reanimated   ← already in most Expo projects
 *   npm install axios
 */

import ComicButton from "@/src/components/ComicButton/ComicButton";
import HalftoneOverlay from "@/src/components/HalftoneOverlay/HalftoneOverlay";
import { Bangers_400Regular, useFonts } from "@expo-google-fonts/bangers";
import { Oswald_400Regular, Oswald_700Bold } from "@expo-google-fonts/oswald";
import { push } from "expo-router/build/global-state/routing";
import React from "react";
import {
  ActivityIndicator,
  Dimensions,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { width: SCREEN_W } = Dimensions.get("window");

// ═══════════════════════════════════════════════════════════════════════════════
// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
export default function InicioScreen() {
  const [fontsLoaded] = useFonts({
    Bangers_400Regular,
    Oswald_400Regular,
    Oswald_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={"#FFD600"} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={"#1A1028"} />
      <HalftoneOverlay dotColor="rgba(255,214,0,0.07)" size={10} />
      <View style={styles.mainContent}>
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
          Search stats, explore powers, and discover origin stories for every
          hero you ever loved.
        </Text>

        {/* CTA Buttons */}
        <View style={styles.heroCtas}>
          <ComicButton
            label="SEARCH HEROES"
            onPress={push.bind(null, "/search")}
            bg={"#E8173D"}
            color="#fff"
            shadowColor={"#1A1028"}
          />
        </View>
      </View>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── STYLES ──────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  // Root
  root: { flex: 1, backgroundColor: "#1A1028" }, 
  loadingContainer: {
    flex: 1,
    backgroundColor: "#1A1028",
    alignItems: "center",
    justifyContent: "center",
  },
  mainContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  // ── HERO BANNER ─────────────────────────────────────────────────────────────
  eyebrowWrap: { alignItems: "flex-start", marginBottom: 20 },
  eyebrow: {
    backgroundColor: "#1A1028",
    borderWidth: 2,
    borderColor: "#FFD600",
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  eyebrowText: {
    fontFamily: "Oswald_700Bold",
    fontSize: 11,
    letterSpacing: 3,
    color: "#FFD600",
    textTransform: "uppercase",
  },
  headlineWrap: { marginBottom: 14 },
  headlineKnow: {
    fontFamily: "Bangers_400Regular",
    fontSize: 52,
    letterSpacing: 3,
    color: "#fff",
    lineHeight: 52 * 1.0,
  },
  headlineHeroes: {
    fontFamily: "Bangers_400Regular",
    fontSize: 52 * 1.3,
    letterSpacing: 3,
    color: "#FFD600",
    lineHeight: 52 * 1.2,
    alignSelf: "center",
  },
  subHeadline: {
    fontFamily: "Oswald_400Regular",
    fontSize: 15,
    color: "rgba(255,255,255,0.8)",
    lineHeight: 22,
    marginBottom: 28,
    maxWidth: SCREEN_W * 0.8,
    textAlign: "center",
  },
  heroCtas: {
    flexDirection: "row",
    gap: 14,
    flexWrap: "wrap",
    marginBottom: 24,
  },
});
