import { View, Text, StyleSheet } from 'react-native'

export default function Section({
  title,
  color,
  children,
}: {
  title: string;
  color: string;
  children: React.ReactNode;
}) {
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
  head: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  bar: { width: 3, height: 18, borderRadius: 2 },
  title: { fontFamily: "Bangers_400Regular", fontSize: 18, letterSpacing: 2 },
});