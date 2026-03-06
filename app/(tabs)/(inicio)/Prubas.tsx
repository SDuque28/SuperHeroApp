import { Image, Text, View, StyleSheet } from "react-native";

export default function Index() {
  return (
    <View style={styles.contedor}>
      <Text>Inicio y algo mas</Text>
      <View>
        <Image
            source={require("@/assets/images/Logo.png")}
            style={styles.image}
        />
      </View>
      
    </View>
  );
}

const styles = StyleSheet.create({
    image: {
        width: 300,
        height: 300,
    },
    contedor: {
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
        backgroundColor: "#000000",
    }

})