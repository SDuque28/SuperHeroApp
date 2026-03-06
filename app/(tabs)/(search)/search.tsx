import { View, Text } from "react-native";

export default function Search() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: "white", fontSize: 18 }}>
        Búsqueda de superhéroes en construcción...
      </Text>
    </View>
  );
}