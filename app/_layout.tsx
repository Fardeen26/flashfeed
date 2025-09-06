import { Stack } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { ClerkProvider } from '@clerk/clerk-expo'
import { tokenCache } from '@clerk/clerk-expo/token-cache'

const auth_publishable_key = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY
console.log(auth_publishable_key)
export default function RootLayout() {
  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={auth_publishable_key}>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
          <Stack screenOptions={{ headerShown: false }}></Stack>
        </SafeAreaView>
      </SafeAreaProvider>
    </ClerkProvider>
  )
}