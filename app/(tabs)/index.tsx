import { Text, TouchableOpacity, View } from "react-native";
import { styles } from '@/styles/index.styles'
import { useAuth } from "@clerk/clerk-expo";
import { router } from "expo-router";

export default function Index() {
  const { signOut } = useAuth();
  return (
    <View
      style={styles.container}
    >
      <Text style={styles.text}>Hello black Niggers</Text>
      <TouchableOpacity onPress={() => {
        signOut();
        router.replace("/(auth)/login");
      }}>
        <Text style={styles.button}>
          SignOut
        </Text>
      </TouchableOpacity>
    </View>
  );
}