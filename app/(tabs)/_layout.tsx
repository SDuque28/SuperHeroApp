import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { StyleSheet } from "react-native";


export default function TabLayout() {
  return (
    <Tabs
        screenOptions={{
            tabBarStyle: styles.tabBar,
            headerShown: false,
            tabBarActiveTintColor: "red",
            tabBarInactiveTintColor: "white",
        }}
    >
        <Tabs.Screen
            name="(inicio)"
            options={{
                title: "Inicio",
                tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
            }}
        />
        <Tabs.Screen
            name="(search)"
            options={{
                title: "Búsqueda",
                tabBarIcon: ({ color }) => <Ionicons name="search" size={24} color={color} />,
            }}
        />
        <Tabs.Screen
            name="(data)"
            options={{
                title: "Data",
                tabBarIcon: ({ color }) => <Ionicons name="bar-chart" size={24} color={color} />,
            }}
        />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: "#0d0d0e",
    },
})