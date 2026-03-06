import HalftoneOverlay from "@/src/components/HalftoneOverlay/HalftoneOverlay";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";

export default function Data() {
  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#1A1028", "#0A0014"]}
        style={styles.footerCredit}
      >
        <HalftoneOverlay dotColor="rgba(255,214,0,0.05)" size={8} />

        {/* Gradient rainbow bar */}
        <View style={styles.footerLogoWrap}>
          <Text style={styles.footerLogo}>HeroVerse</Text>
        </View>

        <View style={styles.footerDivider} />

        <Text style={styles.footerCreditLabel}>
          ✦ DESIGNED & DEVELOPED BY ✦
        </Text>
        <Text style={styles.footerCreditNames}>
          Santiago Duque Robledo{"\n"}&amp;{"\n"} Cesar David Arias Posada
        </Text>
        <Text style={styles.footerApiNote}>
          Powered by SuperHero API · superheroapi.com
        </Text>

        <Text style={styles.footerCopyright}>
          © 2025 HeroVerse · Not affiliated with Marvel or DC Comics
        </Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  footerCredit: {
    paddingTop: 48,
    paddingBottom: 40,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    borderTopWidth: 5,
    overflow: "hidden",
    position: "relative",
    flex: 1,
  },
  footerLogoWrap: { marginBottom: 16 },
  footerLogo: {
    fontFamily: "Bangers_400Regular",
    fontSize: 40,
    letterSpacing: 4,
    color: "#FFD600",
    textShadowColor: "#E8173D",
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 0,
  },
  footerDivider: {
    width: "80%",
    height: 2,
    backgroundColor: "rgba(255,214,0,0.25)",
    marginBottom: 22,
  },
  footerCreditLabel: {
    fontFamily: "Oswald_700Bold",
    fontSize: 10,
    letterSpacing: 4,
    color: "rgba(255,255,255,0.4)",
    textTransform: "uppercase",
    marginBottom: 10,
  },
  footerCreditNames: {
    fontFamily: "Bangers_400Regular",
    fontSize: 22,
    letterSpacing: 2,
    color: "#FFD600",
    textAlign: "center",
    lineHeight: 30,
    textShadowColor: "#E8173D",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
    marginBottom: 10,
  },
  footerApiNote: {
    fontFamily: "Oswald_400Regular",
    fontSize: 10,
    letterSpacing: 1,
    color: "rgba(255,255,255,0.35)",
    textTransform: "uppercase",
    marginBottom: 24,
  },
  footerCopyright: {
    fontFamily: "Oswald_400Regular",
    fontSize: 10,
    letterSpacing: 1,
    color: "rgba(255,255,255,0.2)",
    textAlign: "center",
    justifyContent: "space-evenly",
  },
});
