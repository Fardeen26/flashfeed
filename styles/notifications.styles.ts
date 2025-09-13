// styles/notifications.styles.ts
import { COLORS } from "@/constants/theme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: COLORS.surface,
    },
    headerTitle: {
        fontSize: 24,
        fontFamily: "JetBrainsMono-Medium",
        color: COLORS.primary,
    },
    listContainer: {
        padding: 16,
    },
    notificationItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    notificationContent: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        marginRight: 12,
    },
    avatarContainer: {
        position: "relative",
        marginRight: 12,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 2,
        borderColor: COLORS.surface,
    },
    iconBadge: {
        position: "absolute",
        bottom: -4,
        right: -4,
        backgroundColor: COLORS.background,
        borderRadius: 12,
        width: 24,
        height: 24,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: COLORS.surface,
    },
    notificationInfo: {
        flex: 1,
    },
    username: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 2,
    },
    action: {
        color: COLORS.grey,
        fontSize: 14,
        marginBottom: 2,
    },
    timeAgo: {
        color: COLORS.grey,
        fontSize: 12,
    },
    postImage: {
        width: 44,
        height: 44,
        borderRadius: 6,
    },
    centered: {
        justifyContent: "center",
        alignItems: "center",
    },
});