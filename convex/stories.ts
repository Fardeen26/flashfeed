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