import ClearkAndConvexProvider from "@/providers/ClearkAndConvexProvider";
import { Stack } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <ClearkAndConvexProvider>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
          <Stack screenOptions={{ headerShown: false }}></Stack>
        </SafeAreaView>
      </SafeAreaProvider>
    </ClearkAndConvexProvider>
  )
}