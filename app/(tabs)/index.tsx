import { Text, TouchableOpacity, View } from "react-native";
import { styles } from '@/styles/index.styles'

export default function Index() {
  return (
    <View
      style={styles.container}
    >
      <Text style={styles.text}>Hello black Niggers</Text>
      <TouchableOpacity onPress={() => alert("Niggas killed successfully")}>
        <Text style={styles.button}>
          Kill Niggas
        </Text>
      </TouchableOpacity>
    </View>
  );
}