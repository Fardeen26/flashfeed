import InitialLayout from "@/components/InitialLayout";
import { Loader } from "@/components/Loader";
import ClearkAndConvexProvider from "@/providers/ClearkAndConvexProvider";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function RootLayout() {

  const [fontsLoaded] = useFonts({
    JetBrainsMono: require("../assets/fonts/JetBrainsMono-Medium.ttf"),
  });

  if (!fontsLoaded) {
    return <Loader />;
  }

  return (
    <ClearkAndConvexProvider>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
          <InitialLayout />
        </SafeAreaView>
      </SafeAreaProvider>
      <StatusBar style="light" />
    </ClearkAndConvexProvider>
  );
}