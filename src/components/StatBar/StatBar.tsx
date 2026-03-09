import { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing,
} from "react-native-reanimated";

export default function StatBar({
  label,
  value,
  delay = 0,
}: {
  label: string;
  value: number;
  delay?: number;
}) {
  const w = useSharedValue(0);

  useEffect(() => {
    const t = setTimeout(() => {
      w.value = withTiming(value / 100, {
        duration: 800,
        easing: Easing.out(Easing.quad),
      });
    }, delay);
    return () => clearTimeout(t);
  }, [value, delay, w]);

  const barAnim = useAnimatedStyle(() => ({ width: `${w.value * 100}%` }));

  const color =
    value >= 80
      ? "#00C853"
      : value >= 50
        ? "#FFD600"
        : value >= 25
          ? "#E8173D"
          : "#555";

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
    fontFamily: "Oswald_700Bold",
    fontSize: 10,
    letterSpacing: 1,
    color: "rgba(255,255,255,0.5)",
    textTransform: "uppercase",
    width: 80,
  },
  track: {
    flex: 1,
    height: 8,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 4,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 4,
    overflow: "hidden",
    position: "relative",
  },
  shine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "50%",
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 4,
  },
  num: {
    fontFamily: "Bangers_400Regular",
    fontSize: 16,
    letterSpacing: 1,
    width: 30,
    textAlign: "right",
  },
});