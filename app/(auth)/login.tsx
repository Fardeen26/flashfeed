import { COLORS } from "@/constants/theme";
import { styles } from "@/styles/auth.styles";
import { useSSO } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { View, Text, Image, TouchableOpacity } from "react-native";

export default function Login() {
    const { startSSOFlow } = useSSO();
    const router = useRouter();

    const handleGoogleSignIn = async () => {
        try {
            const { createdSessionId, setActive } = await startSSOFlow({ strategy: "oauth_google" });

            if (setActive && createdSessionId) {
                setActive({ session: createdSessionId });
                router.replace("/(tabs)");
            }
        } catch (error) {
            console.error("OAuth error:", error);
        }
    };

    return (
        <View style={styles.container}>
            {/* BRAND SECTION */}
            <View style={styles.brandSection}>
                <View style={styles.logoContainer}>
                    <Ionicons name="leaf" size={32} color={COLORS.primary} />
                </View>
                <Text style={styles.appName}>spotlight</Text>
                <Text style={styles.tagline}>don&apos;t miss anything</Text>
            </View>

            {/* ILLUSTRATION */}
            <View style={styles.illustrationContainer}>
                <Image
                    source={require("../../assets/images/auth-bg-2.png")}
                    style={styles.illustration}
                    resizeMode="cover"
                />
            </View>

            {/* LOGIN SECTION */}
            <View style={styles.loginSection}>
                <TouchableOpacity
                    style={styles.googleButton}
                    onPress={handleGoogleSignIn}
                    activeOpacity={0.9}
                >
                    <View style={styles.googleIconContainer}>
                        <Ionicons name="logo-google" size={20} color={COLORS.surface} />
                    </View>
                    <Text style={styles.googleButtonText}>Continue with Google</Text>
                </TouchableOpacity>
                <Text style={styles.termsText}>
                    By continuing, you agree to our Terms and Privacy Policy
                </Text>
            </View>
        </View>
    );
}