import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";

export default function TabsLayout() {
    return (
        <Tabs screenOptions={{
            tabBarInactiveTintColor: 'gray',
            tabBarActiveTintColor: COLORS.primary,
            headerShown: false,
            tabBarShowLabel: false,
            tabBarStyle: {
                backgroundColor: "black",
                borderTopWidth: 0,
                position: "absolute",
                elevation: 0,
                height: 60,
                paddingBottom: 20,
                paddingTop: 10,
            },
        }}>
            <Tabs.Screen
                name="index"
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home" color={color} size={size} />
                    ),
                    headerShown: false
                }} />

            <Tabs.Screen name="bookmark" options={{
                tabBarIcon: ({ color, size }) => (
                    <Ionicons name="bookmark" color={color} size={size} />
                ),
                headerShown: false
            }} />

            <Tabs.Screen name="create" options={{
                tabBarIcon: ({ color, size }) => (
                    <Ionicons name="add-circle" color={COLORS.primary} size={size} />
                ),
                headerShown: false
            }} />

            <Tabs.Screen name="notifications" options={{
                tabBarIcon: ({ color, size }) => (
                    <Ionicons name="heart" color={color} size={size} />
                ),
                headerShown: false
            }} />

            <Tabs.Screen name="profile" options={{
                tabBarIcon: ({ color, size }) => (
                    <Ionicons name="person-circle" color={color} size={size} />
                ),
                headerShown: false
            }} />

        </Tabs>
    )
}