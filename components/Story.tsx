import { styles } from "@/styles/feed.styles";
import { Image as RNImage, Text, TouchableOpacity, View } from "react-native";
import { UserWithStories } from "./Stories";


export default function Story({ story }: { story: UserWithStories }) {
    return (
        <TouchableOpacity style={styles.storyWrapper}>
            <View style={[styles.storyRing, !story.stories.length && styles.noStory]}>
                <RNImage source={{ uri: story.user.image }} style={styles.storyAvatar} />
            </View>
            <Text style={styles.storyUsername}>{story.user.username}</Text>
        </TouchableOpacity>
    );
}