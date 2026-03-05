import { Stack } from "expo-router";

export default function HomeLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                headerTitle: "Inicio"
            }}
        >
            <Stack.Screen name="index" />
        </Stack>
    );
}