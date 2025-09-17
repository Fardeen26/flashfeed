import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { styles } from "@/styles/feed.styles";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { File } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { fetch } from "expo/fetch";
import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Image, Modal, Image as RNImage, Text, TouchableOpacity, View } from "react-native";
import { UserWithStories } from "./Stories";

const CurrentUserStoriesModal = ({
    currentUserStories,
    currentUser,
    visible,
    onClose,
    onAddStory,
    markStoryAsViewed
}: {
    currentUserStories: any[];
    currentUser: any;
    visible: boolean;
    onClose: () => void;
    onAddStory: () => void;
    markStoryAsViewed: (args: { storyId: Id<"stories"> }) => Promise<null>;
}) => {
    const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const progressAnimations = useRef<Animated.Value[]>([]);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const currentStory = currentUserStories[currentStoryIndex];

    const nextStory = useCallback(() => {
        if (currentStoryIndex < currentUserStories.length - 1) {
            setCurrentStoryIndex(prev => prev + 1);
        } else {
            onClose();
        }
    }, [currentStoryIndex, currentUserStories.length, onClose]);

    useEffect(() => {
        if (currentUserStories.length > 0) {
            progressAnimations.current = currentUserStories.map(() => new Animated.Value(0));
        }
    }, [currentUserStories]);

    useEffect(() => {
        if (!visible || !isPlaying || !currentStory) return;

        if (currentStory._id) {
            markStoryAsViewed({ storyId: currentStory._id as Id<"stories"> }).catch(console.error);
        }

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
    }, [currentStoryIndex, visible, isPlaying, currentStory, nextStory, markStoryAsViewed]);

    const previousStory = () => {
        if (currentStoryIndex > 0) {
            setCurrentStoryIndex(prev => prev - 1);
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

    if (!visible || !currentStory) return null;

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
                    {currentUserStories.map((_, index) => {
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
                            source={{ uri: currentUser?.image || '' }}
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
                            {currentUser?.username}
                        </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TouchableOpacity onPress={onAddStory} style={{ marginRight: 15 }}>
                            <Ionicons name="add" size={24} color={COLORS.white} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>
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

const StoriesModal = ({
    allStories,
    startIndex,
    visible,
    onClose,
    markStoryAsViewed
}: {
    allStories: UserWithStories[];
    startIndex: number;
    visible: boolean;
    onClose: () => void;
    markStoryAsViewed: (args: { storyId: Id<"stories"> }) => Promise<null>;
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

        // Mark story as viewed when it starts playing
        if (currentStory._id) {
            markStoryAsViewed({ storyId: currentStory._id as Id<"stories"> }).catch(console.error);
        }

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
    }, [currentUserIndex, currentStoryIndex, visible, isPlaying, currentStory, nextStory, markStoryAsViewed]);

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
    const [isAddStoryModelVisible, setIsAddStoryModelVisible] = useState(false);
    const [isCurrentUserStoriesVisible, setIsCurrentUserStoriesVisible] = useState(false);

    const allStories = useQuery(api.stories.fetchStoriesWithViewStatus, {});
    const startIndex = allStories?.findIndex(s => s.user._id === story.user._id) || 0;

    const handleOpenStory = () => {
        setVisible(true);
    };

    const { user } = useUser();
    const currentUser = useQuery(api.users.getUserByClerkId, user ? { clerkId: user.id } : "skip");
    const currentUserStoriesData = useQuery(api.stories.fetchCurrentUserStoriesWithViewStatus, {});
    const markStoryAsViewed = useMutation(api.stories.markStoryAsViewed);

    const handleCurrentUserStoryPress = () => {
        if (currentUserStoriesData && currentUserStoriesData.stories.length > 0) {
            setIsCurrentUserStoriesVisible(true);
        } else {
            setIsAddStoryModelVisible(true);
        }
    };

    const handleCurrentUserStorySwipe = () => {
        if (currentUserStoriesData && currentUserStoriesData.stories.length > 0) {
            setIsAddStoryModelVisible(true);
        }
    };

    return (
        <View style={{
            width: "100%",
            height: "100%",
        }}>
            <View style={{
                display: "flex",
                flexDirection: "row",
                gap: 8,
            }}>
                {/* current user story */}
                <TouchableOpacity onPress={handleCurrentUserStoryPress}>
                    <View style={[
                        currentUserStoriesData && currentUserStoriesData.stories.length > 0 ? styles.storyRing : styles.noStory,
                        currentUserStoriesData && currentUserStoriesData.hasViewedAll && styles.viewedStoryRing
                    ]}>
                        <RNImage source={{ uri: currentUser?.image }} style={styles.storyAvatar} />
                    </View>
                    <Text style={styles.storyUsername}>{currentUser?.username.slice(0, 10)}</Text>
                    {currentUserStoriesData && currentUserStoriesData.stories.length > 0 && (
                        <TouchableOpacity
                            style={{
                                position: "absolute",
                                bottom: 20,
                                right: 0,
                                backgroundColor: COLORS.primary,
                                borderRadius: 100,
                                padding: 2,
                            }}
                            onPress={handleCurrentUserStorySwipe}
                        >
                            <Ionicons name="add" size={16} color={COLORS.white} />
                        </TouchableOpacity>
                    )}
                </TouchableOpacity>

                <TouchableOpacity style={styles.storyWrapper} onPress={handleOpenStory}>
                    <View style={[
                        styles.storyRing,
                        !story.stories.length && styles.noStory,
                        story.hasViewedAll && styles.viewedStoryRing
                    ]}>
                        <RNImage source={{ uri: story.user.image }} style={styles.storyAvatar} />
                    </View>
                    <Text style={styles.storyUsername}>{story.user.username.slice(0, 10)}</Text>
                </TouchableOpacity>
            </View>

            {allStories && (
                <StoriesModal
                    allStories={allStories}
                    startIndex={startIndex}
                    visible={visible}
                    onClose={() => setVisible(false)}
                    markStoryAsViewed={markStoryAsViewed}
                />
            )}

            {currentUserStoriesData && (
                <CurrentUserStoriesModal
                    currentUserStories={currentUserStoriesData.stories}
                    currentUser={currentUser}
                    visible={isCurrentUserStoriesVisible}
                    onClose={() => setIsCurrentUserStoriesVisible(false)}
                    onAddStory={() => {
                        setIsCurrentUserStoriesVisible(false);
                        setIsAddStoryModelVisible(true);
                    }}
                    markStoryAsViewed={markStoryAsViewed}
                />
            )}

            <AddStoryModel isAddStoryModelVisible={isAddStoryModelVisible} onClose={() => setIsAddStoryModelVisible(false)} currentUser={currentUser} />
        </View>
    );
}

interface AddStoryModelType {
    isAddStoryModelVisible: boolean;
    onClose: () => void;
    currentUser: any;
}

const AddStoryModel = ({ isAddStoryModelVisible, onClose, currentUser }: AddStoryModelType) => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isPosting, setIsPosting] = useState(false);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: "images",
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) setSelectedImage(result.assets[0].uri);
    }

    const generateUploadUrl = useMutation(api.posts.generateUploadUrl);
    const createStory = useMutation(api.stories.createStory);


    const handleShare = async () => {
        if (!selectedImage) return;

        setIsPosting(true);
        try {
            const uploadUrl = await generateUploadUrl();
            const file = new File(selectedImage);

            const response = await fetch(uploadUrl, {
                method: "POST",
                body: file,
                headers: {
                    "Content-Type": "image/jpeg",
                },
            });

            if (!response.ok) throw new Error("Upload failed");

            const responseData = await response.json();
            const { storageId } = responseData;
            await createStory({ storageId: storageId as Id<"_storage"> });

            setSelectedImage(null);
            onClose();
        } catch (error) {
            console.error("Error sharing story", error);
        } finally {
            setIsPosting(false);
        }
    }

    return (
        <Modal
            visible={isAddStoryModelVisible}
            onRequestClose={onClose}
            animationType="slide"
        >
            {
                !selectedImage && (
                    <View style={styles.container}>
                        <View style={styles.header}>
                            <TouchableOpacity onPress={() => {
                                setSelectedImage(null);
                                onClose();
                            }}>
                                <Ionicons name="arrow-back" size={28} color={COLORS.primary} />
                            </TouchableOpacity>
                            <Text style={styles.headerTitle}>Post a Story</Text>
                            <View style={{ width: 28 }} />
                        </View>

                        <TouchableOpacity style={styles.emptyImageContainer} onPress={pickImage}>
                            <Ionicons name="image-outline" size={48} color={COLORS.grey} />
                            <Text style={styles.emptyImageText}>Tap to select an image</Text>
                        </TouchableOpacity>
                    </View>
                )
            }

            {
                selectedImage && (
                    <View style={styles.container}>
                        <View style={styles.header}>
                            <TouchableOpacity onPress={() => {
                                setSelectedImage(null);
                                onClose();
                            }}>
                                <Ionicons name="arrow-back" size={28} color={COLORS.primary} />
                            </TouchableOpacity>
                            <Text style={styles.headerTitle}>Post a Story</Text>
                            <View style={{ width: 28 }} />
                        </View>

                        <Image
                            source={{ uri: selectedImage }}
                            style={{ width: "100%", height: "100%", borderRadius: 10 }}
                            resizeMode="cover"
                        />

                        <TouchableOpacity style={{
                            position: "absolute",
                            bottom: 10,
                            right: 10,
                            backgroundColor: COLORS.primary,
                            borderRadius: 100,
                            paddingHorizontal: 24,
                            paddingVertical: 8
                        }} onPress={handleShare}>
                            <Text style={{ color: COLORS.white, fontSize: 16 }}>{isPosting ? 'Uploading...' : 'Post Story'}</Text>
                        </TouchableOpacity>
                    </View>
                )
            }
        </Modal>
    )
}