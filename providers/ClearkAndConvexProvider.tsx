import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";

const auth_publishable_key = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY
const convexClient = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL as string);

export default function ClearkAndConvexProvider({ children }: { children: React.ReactNode }) {
    return (
        <ClerkProvider tokenCache={tokenCache} publishableKey={auth_publishable_key}>
            <ConvexProviderWithClerk client={convexClient} useAuth={useAuth}>
                {children}
            </ConvexProviderWithClerk>
        </ClerkProvider>
    )
}