import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { styles } from "@/styles/feed.styles";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Image, Modal, Image as RNImage, Text, TouchableOpacity, View } from "react-native";
import { UserWithStories } from "./Stories";

const StoriesModal = ({
    allStories,
    startIndex,
    visible,
    onClose
}: {
    allStories: UserWithStories[];
    startIndex: number;
    visible: boolean;
    onClose: () => void;
}) => {
    const [currentUserIndex, setCurrentUserIndex] = useState(startIndex);
    const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const progressAnimations = useRef<Animated.Value[]>([]);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const currentUser = allStories[currentUserIndex];
    const currentStory = currentUser?.stories[currentStoryIndex];

    const nextStory = useCallback(() => {
        if (!currentUser || !currentStory) return;

        if (currentStoryIndex < currentUser.stories.length - 1) {
            setCurrentStoryIndex(prev => prev + 1);
        } else {
            if (currentUserIndex < allStories.length - 1) {
                setCurrentUserIndex(prev => prev + 1);
                setCurrentStoryIndex(0);
            } else {
                onClose();
            }
        }
    }, [currentUser, currentStory, currentStoryIndex, currentUserIndex, allStories, onClose]);


    useEffect(() => {
        if (currentUser) {
            progressAnimations.current = currentUser.stories.map(() => new Animated.Value(0));
        }
    }, [currentUser]);

    useEffect(() => {
        if (!visible || !isPlaying || !currentStory) return;

        if (progressAnimations.current[currentStoryIndex]) {
            progressAnimations.current[currentStoryIndex].setValue(0);
        }

        if (progressAnimations.current[currentStoryIndex]) {
            Animated.timing(progressAnimations.current[currentStoryIndex], {
                toValue: 1,
                duration: 5000,
                useNativeDriver: false,
            }).start();
        }

        timerRef.current = setTimeout(() => {
            nextStory();
        }, 5000);

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [currentUserIndex, currentStoryIndex, visible, isPlaying, currentStory, nextStory]);

    const previousStory = () => {
        if (currentStoryIndex > 0) {
            setCurrentStoryIndex(prev => prev - 1);
        } else if (currentUserIndex > 0) {
            const prevUser = allStories[currentUserIndex - 1];
            setCurrentUserIndex(prev => prev - 1);
            setCurrentStoryIndex(prevUser.stories.length - 1);
        }
    };

    const handlePress = (event: any) => {
        const { locationX } = event.nativeEvent;
        const screenWidth = Dimensions.get('window').width;

        if (locationX < screenWidth / 2) {
            previousStory();
        } else {
            nextStory();
        }
    };

    const pauseStory = () => {
        setIsPlaying(false);
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
    };

    const resumeStory = () => {
        setIsPlaying(true);
    };

    if (!visible || !currentUser || !currentStory) return null;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={{
                flex: 1,
                backgroundColor: COLORS.background,
            }}>
                <View style={{
                    position: 'absolute',
                    top: 15,
                    left: 10,
                    right: 10,
                    zIndex: 1000,
                    flexDirection: 'row',
                }}>
                    {currentUser.stories.map((_, index) => {
                        const isCurrent = index === currentStoryIndex;
                        const isPast = index < currentStoryIndex;

                        return (
                            <View
                                key={index}
                                style={{
                                    flex: 1,
                                    height: 3,
                                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                                    marginHorizontal: 2,
                                    borderRadius: 1.5,
                                    overflow: 'hidden',
                                }}
                            >
                                <Animated.View
                                    style={{
                                        height: '100%',
                                        backgroundColor: COLORS.white,
                                        width: isPast
                                            ? '100%'
                                            : isCurrent && isPlaying
                                                ? progressAnimations.current[index]?.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: ['0%', '100%'],
                                                }) || '0%'
                                                : '0%',
                                    }}
                                />
                            </View>
                        );
                    })}
                </View>

                <View style={{
                    position: 'absolute',
                    top: 20,
                    left: 0,
                    right: 0,
                    zIndex: 1000,
                    paddingHorizontal: 15,
                    paddingVertical: 10,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}>
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                    }}>
                        <Image
                            source={{ uri: currentUser.user.image || '' }}
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: 16,
                                marginRight: 10,
                            }}
                        />
                        <Text style={{
                            color: COLORS.white,
                            fontSize: 16,
                            fontWeight: '600',
                        }}>
                            {currentUser.user.username}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={onClose}>
                        <Ionicons name="close" size={24} color={COLORS.white} />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={{ flex: 1 }}
                    onPress={handlePress}
                    onPressIn={pauseStory}
                    onPressOut={resumeStory}
                    activeOpacity={1}
                >
                    <Image
                        source={{ uri: currentStory.imageUrl }}
                        style={{
                            width: '100%',
                            height: '100%',
                        }}
                        resizeMode="cover"
                    />
                </TouchableOpacity>

                <View style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    flexDirection: 'row',
                }}>
                    <TouchableOpacity
                        style={{ flex: 1 }}
                        onPress={previousStory}
                        onPressIn={pauseStory}
                        onPressOut={resumeStory}
                    />
                    <TouchableOpacity
                        style={{ flex: 1 }}
                        onPress={nextStory}
                        onPressIn={pauseStory}
                        onPressOut={resumeStory}
                    />
                </View>
            </View>
        </Modal>
    );
};

export default function Story({ story }: { story: UserWithStories }) {
    const [visible, setVisible] = useState(false);

    const allStories = useQuery(api.stories.fetchStories, {});
    const startIndex = allStories?.findIndex(s => s.user._id === story.user._id) || 0;

    const handleOpenStory = () => {
        setVisible(true);
    };

    return (
        <View style={{
            width: "100%",
            height: "100%",
        }}>
            <TouchableOpacity style={styles.storyWrapper} onPress={handleOpenStory}>
                <View style={[styles.storyRing, !story.stories.length && styles.noStory]}>
                    <RNImage source={{ uri: story.user.image }} style={styles.storyAvatar} />
                </View>
                <Text style={styles.storyUsername}>{story.user.username}</Text>
            </TouchableOpacity>

            {allStories && (
                <StoriesModal
                    allStories={allStories}
                    startIndex={startIndex}
                    visible={visible}
                    onClose={() => setVisible(false)}
                />
            )}
        </View>
    );
}