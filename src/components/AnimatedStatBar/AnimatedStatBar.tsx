import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated,{ Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

export default function AnimatedStatBar({
  label,
  value,
  delay = 0,
}: {
  label: string;
  value: number;
  delay?: number;
}) {
  const barWidth = useSharedValue(0);

  useEffect(() => {
    const t = setTimeout(() => {
      barWidth.value = withTiming(value / 100, {
        duration: 900,
        easing: Easing.out(Easing.cubic),
      });
    }, delay);
    return () => clearTimeout(t);
  }, [value, delay, barWidth]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${barWidth.value * 100}%`,
  }));

  const barColor =
    value >= 80
      ? "#00C853"
      : value >= 50
        ? "#FFD600"
        : value >= 25
          ? "#E8173D"
          : "#444";

  return (
    <View style={sStyles.row}>
      <Text style={sStyles.label}>{label}</Text>
      <View style={sStyles.barBg}>
        <Animated.View style={[sStyles.barFill, { backgroundColor: barColor }, barStyle]}>
          <View style={sStyles.shine} />
        </Animated.View>
      </View>
      <Text style={[sStyles.value, { color: barColor }]}>{value || "—"}</Text>
    </View>
  );
}

const sStyles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", marginBottom: 10, gap: 8 },
  label: {
    fontFamily: "Oswald_700Bold",
    fontSize: 10,
    letterSpacing: 1.5,
    color: "rgba(255,255,255,0.55)",
    width: 75,
    textTransform: "uppercase",
  },
  barBg: {
    flex: 1,
    height: 9,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 5,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  barFill: {
    height: "100%",
    borderRadius: 5,
    overflow: "hidden",
    position: "relative",
  },
  shine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "45%",
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 5,
  },
  value: {
    fontFamily: "Bangers_400Regular",
    fontSize: 16,
    letterSpacing: 1,
    width: 32,
    textAlign: "right",
  },
});