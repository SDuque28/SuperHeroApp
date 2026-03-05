import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
        screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: "red",
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
        </Tabs>
    );
}