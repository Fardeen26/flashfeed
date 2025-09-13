import InitialLayout from "@/components/InitialLayout";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import ClearkAndConvexProvider from "@/providers/ClearkAndConvexProvider";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {

  return (
    <ClearkAndConvexProvider>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }} >
          <InitialLayout />
        </SafeAreaView>
      </SafeAreaProvider>
      <StatusBar style="light" />
    </ClearkAndConvexProvider>
  );
}