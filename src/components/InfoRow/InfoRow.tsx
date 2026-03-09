import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function InfoRow({
  label,
  value,
  accent = "#FFD600",
}: {
  label: string;
  value?: string;
  accent?: string;
}) {
  if (!value || value === "-" || value === "null" || value.trim() === "")
    return null;
  return (
    <View style={iStyles.row}>
      <Text style={[iStyles.label, { color: accent }]}>{label}</Text>
      <Text style={iStyles.value} numberOfLines={4}>
        {value}
      </Text>
    </View>
  );
}

const iStyles = StyleSheet.create({
  row: { flexDirection: "row", marginBottom: 9, gap: 10 },
  label: {
    fontFamily: "Oswald_700Bold",
    fontSize: 9,
    letterSpacing: 2,
    textTransform: "uppercase",
    width: 85,
    paddingTop: 2,
  },
  value: {
    flex: 1,
    fontFamily: "Oswald_400Regular",
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    lineHeight: 18,
  },
});