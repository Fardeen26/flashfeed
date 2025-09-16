
import { api } from "@/convex/_generated/api";
import { styles } from "@/styles/feed.styles";
import { useQuery } from "convex/react";
import { ScrollView } from "react-native";
import Story from "./Story";

export type StoryData = {
    _id: string;
    imageUrl?: string;
    storageId: string;
    expiresAt: number;
    createdAt: number;
};

export type UserData = {
    _id: string;
    username: string;
    fullname: string;
    image?: string;
};

export type UserWithStories = {
    user: UserData;
    stories: StoryData[];
};


const StoriesSection = () => {
    const stories = useQuery(api.stories.fetchStories, {});

    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.storiesContainer}>
            {stories && stories.map((story: UserWithStories) => (
                <Story key={story.user._id} story={story} />
            ))}
        </ScrollView>
    );
};

export default StoriesSection;