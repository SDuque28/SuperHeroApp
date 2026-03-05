import { Stack } from "expo-router";

export default function DataLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                headerTitle: "Data"
            }}
        >
            <Stack.Screen name="data" />
        </Stack>
    );
}