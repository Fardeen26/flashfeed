import { useAuth } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";
import { Text } from "react-native";

export default function Index() {
    const { isLoaded, isSignedIn } = useAuth()

    if (!isLoaded) {
        return <Text>Loading...</Text>
    }

    if (isLoaded && !isSignedIn) {
        console.log("is signed in or not", isSignedIn)
        return <Redirect href={'/(auth)/login'} />
    }

    return <Redirect href="/(tabs)" />
}