import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, errror] = useFonts({
    'Oswald': require('../assets/fonts/Oswald-VariableFont_wght.ttf')
  });
  useEffect(() => {
    if (loaded || errror) {
      SplashScreen.hideAsync();
    }
  }, [loaded, errror]);
  if (!loaded || errror) {
    return null;
  }
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ 
        title: 'Tabs', 
        headerShown: false, 
        headerTintColor: "red"
        }} />
    </Stack>);
}
