import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const createStory = mutation({
    args: {
        storageId: v.id("_storage")
    },

    handler: async (ctx, args) => {
        const currentUser = await getCurrentUser(ctx);

        const imageUrl = await ctx.storage.getUrl(args.storageId);
        if (!imageUrl) throw new Error("Image not found");

        const now = new Date();
        const timestamp = now.getTime();
        const expiresAt = timestamp + (24 * 60 * 60 * 1000);

        const storyId = await ctx.db.insert("stories", {
            userId: currentUser._id,
            imageUrl: imageUrl as string,
            storageId: args.storageId,
            expiresAt: expiresAt,
        })

        return storyId;
    }
})

export const fetchStories = query({
    handler: async (ctx) => {
        const currentUser = await getCurrentUser(ctx);
        const now = Date.now();

        const follows = await ctx.db
            .query("follows")
            .withIndex("by_follower", (q) => q.eq("followerId", currentUser._id))
            .collect();
        const followingIds = follows.map(follow => follow.followingId);
        if (followingIds.length === 0) {
            return [];
        }
        const allStories = await Promise.all(
            followingIds.map(async (userId) => {
                const userStories = await ctx.db
                    .query("stories")
                    .withIndex("by_user", (q) => q.eq("userId", userId))
                    .filter((q) => q.gt(q.field("expiresAt"), now))
                    .collect();
                const user = await ctx.db.get(userId);
                if (!user) return null;
                return {
                    user: {
                        _id: user._id,
                        username: user.username,
                        fullname: user.fullname,
                        image: user.image,
                    },
                    stories: userStories.map(story => ({
                        _id: story._id,
                        imageUrl: story.imageUrl,
                        storageId: story.storageId,
                        expiresAt: story.expiresAt,
                        createdAt: story._creationTime,
                    }))
                };
            })
        );
        const storiesByUser = allStories
            .filter((result): result is NonNullable<typeof result> =>
                result !== null && result.stories.length > 0
            )
            .sort((a, b) => {
                const aLatestStory = Math.max(...a.stories.map(s => s.createdAt));
                const bLatestStory = Math.max(...b.stories.map(s => s.createdAt));
                return bLatestStory - aLatestStory;
            });
        return storiesByUser;
    }
})

export const markStoryAsViewed = mutation({
    args: {
        storyId: v.id("stories")
    },
    handler: async (ctx, args) => {
        const currentUser = await getCurrentUser(ctx);

        const existingView = await ctx.db
            .query("storyViews")
            .withIndex("by_user_and_story", (q) =>
                q.eq("userId", currentUser._id).eq("storyId", args.storyId)
            )
            .first();

        if (!existingView) {
            await ctx.db.insert("storyViews", {
                userId: currentUser._id,
                storyId: args.storyId,
                viewedAt: Date.now()
            });
        }
    }
});

export const hasViewedAllStories = query({
    args: {
        targetUserId: v.id("users")
    },

    handler: async (ctx, args) => {
        const currentUser = await getCurrentUser(ctx);
        const now = Date.now();

        const targetUserStories = await ctx.db
            .query("stories")
            .withIndex("by_user", (q) => q.eq("userId", args.targetUserId))
            .filter((q) => q.gt(q.field("expiresAt"), now))
            .collect();

        if (targetUserStories.length === 0) return true;

        const viewedStories = await ctx.db
            .query("storyViews")
            .withIndex("by_user", (q) => q.eq("userId", currentUser._id))
            .collect();

        const viewedStoryIds = new Set(viewedStories.map(v => v.storyId));

        return targetUserStories.every(story => viewedStoryIds.has(story._id));
    }
});

export const fetchStoriesWithViewStatus = query({
    handler: async (ctx) => {
        const currentUser = await getCurrentUser(ctx);
        const now = Date.now();

        const follows = await ctx.db
            .query("follows")
            .withIndex("by_follower", (q) => q.eq("followerId", currentUser._id))
            .collect();
        const followingIds = follows.map(follow => follow.followingId);
        if (followingIds.length === 0) {
            return [];
        }

        const allStories = await Promise.all(
            followingIds.map(async (userId) => {
                const userStories = await ctx.db
                    .query("stories")
                    .withIndex("by_user", (q) => q.eq("userId", userId))
                    .filter((q) => q.gt(q.field("expiresAt"), now))
                    .collect();
                const user = await ctx.db.get(userId);
                if (!user) return null;

                const viewedStories = await ctx.db
                    .query("storyViews")
                    .withIndex("by_user", (q) => q.eq("userId", currentUser._id))
                    .collect();

                const viewedStoryIds = new Set(viewedStories.map(v => v.storyId));
                const hasViewedAll = userStories.length > 0 && userStories.every(story => viewedStoryIds.has(story._id));

                return {
                    user: {
                        _id: user._id,
                        username: user.username,
                        fullname: user.fullname,
                        image: user.image,
                    },
                    stories: userStories.map(story => ({
                        _id: story._id,
                        imageUrl: story.imageUrl,
                        storageId: story.storageId,
                        expiresAt: story.expiresAt,
                        createdAt: story._creationTime,
                    })),
                    hasViewedAll: hasViewedAll
                };
            })
        );

        const storiesByUser = allStories
            .filter((result): result is NonNullable<typeof result> =>
                result !== null && result.stories.length > 0
            )
            .sort((a, b) => {
                const aLatestStory = Math.max(...a.stories.map(s => s.createdAt));
                const bLatestStory = Math.max(...b.stories.map(s => s.createdAt));
                return bLatestStory - aLatestStory;
            });
        return storiesByUser;
    }
});


export const fetchCurrentUserStories = query({
    handler: async (ctx, args) => {
        const currentUser = await getCurrentUser(ctx);
        const now = Date.now();

        const userStories = await ctx.db.query("stories").withIndex("by_user", (q) => q.eq("userId", currentUser._id)).filter((q) => q.gt(q.field("expiresAt"), now)).collect();

        return userStories;
    }
})

export const fetchCurrentUserStoriesWithViewStatus = query({
    handler: async (ctx) => {
        const currentUser = await getCurrentUser(ctx);
        const now = Date.now();

        const userStories = await ctx.db
            .query("stories")
            .withIndex("by_user", (q) => q.eq("userId", currentUser._id))
            .filter((q) => q.gt(q.field("expiresAt"), now))
            .collect();

        if (userStories.length === 0) {
            return {
                user: {
                    _id: currentUser._id,
                    username: currentUser.username,
                    fullname: currentUser.fullname,
                    image: currentUser.image,
                },
                stories: [],
                hasViewedAll: false
            };
        }

        const viewedStories = await ctx.db
            .query("storyViews")
            .withIndex("by_user", (q) => q.eq("userId", currentUser._id))
            .collect();

        const viewedStoryIds = new Set(viewedStories.map(v => v.storyId));
        const hasViewedAll = userStories.every(story => viewedStoryIds.has(story._id));

        return {
            user: {
                _id: currentUser._id,
                username: currentUser.username,
                fullname: currentUser.fullname,
                image: currentUser.image,
            },
            stories: userStories.map(story => ({
                _id: story._id,
                imageUrl: story.imageUrl,
                storageId: story.storageId,
                expiresAt: story.expiresAt,
                createdAt: story._creationTime,
            })),
            hasViewedAll: hasViewedAll
        };
    }
})

export const fetchIndividualStoryViews = query({
    args: {
        storyId: v.id("stories")
    },

    handler: async (ctx, args) => {
        const storyViews = await ctx.db.query("storyViews").withIndex("by_story", (q) => q.eq("storyId", args.storyId)).collect();

        const storyViewWithInfo = await Promise.all(
            storyViews.map(async (story) => {
                const userInfo = await ctx.db.query("users").withIndex("by_id", (q) => q.eq("_id", story.userId)).collect();

                return {
                    id: userInfo[0]._id,
                    username: userInfo[0].fullname,
                    userImage: userInfo[0].image,
                }
            })
        )

        return storyViewWithInfo;
    }
})


