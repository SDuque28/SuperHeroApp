import { Stack } from "expo-router";

export default function HomeLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                headerTitle: "Search"
            }}
        >
            <Stack.Screen name="search" />
        </Stack>
    );
}