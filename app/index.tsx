import { useAuth } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";

export default function Index() {
    const { isSignedIn } = useAuth()

    if (!isSignedIn) {
        return <Redirect href={'/(auth)/login'} />
    }

    return <Redirect href="/(tabs)/profile" />
}