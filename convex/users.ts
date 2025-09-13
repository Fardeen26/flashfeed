import { ConvexError, v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { mutation, MutationCtx, query, QueryCtx } from "./_generated/server";

export const createUser = mutation({
    args: {
        username: v.string(),
        fullname: v.string(),
        email: v.string(),
        bio: v.optional(v.string()),
        image: v.optional(v.string()),
        clerkId: v.string(),
    },
    handler: async (ctx, args) => {
        const existingUser = await ctx.db.query("users").withIndex("by_clerkId", q => q.eq("clerkId", args.clerkId)).first();
        if (existingUser) return;

        const newUserId = await ctx.db.insert("users", {
            username: args.username,
            fullname: args.fullname,
            email: args.email,
            bio: args.bio,
            image: args.image,
            clerkId: args.clerkId,
            followers: 0,
            following: 0,
            posts: 0,
        });
        return newUserId;
    },
});

export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthorized");

    const currentUser = await ctx.db.query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
        .first();

    if (!currentUser) throw new ConvexError("User not found");

    return currentUser;
}

export const getUserByClerkId = query({
    args: { clerkId: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
            .unique();

        return user;
    },
});

export const updateProfile = mutation({
    args: {
        fullname: v.string(),
        bio: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const currentUser = await getCurrentUser(ctx);

        await ctx.db.patch(currentUser._id, {
            fullname: args.fullname,
            bio: args.bio,
        });
    },
});

export const getUserProfile = query({
    args: { id: v.id("users") },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.id);
        if (!user) throw new ConvexError("User not found");

        return user;
    },
});

export const isFollowing = query({
    args: { followingId: v.id("users") },
    handler: async (ctx, args) => {
        const currentUser = await getCurrentUser(ctx);

        const follow = await ctx.db
            .query("follows")
            .withIndex("by_both", (q) =>
                q.eq("followerId", currentUser._id).eq("followingId", args.followingId)
            )
            .first();

        return !!follow;
    },
});

export const toggleFollow = mutation({
    args: { followingId: v.id("users") },
    handler: async (ctx, args) => {
        const currentUser = await getCurrentUser(ctx);

        const existing = await ctx.db
            .query("follows")
            .withIndex("by_both", (q) =>
                q.eq("followerId", currentUser._id).eq("followingId", args.followingId)
            )
            .first();

        if (existing) {
            // unfollow
            await ctx.db.delete(existing._id);
            await updateFollowCounts(ctx, currentUser._id, args.followingId, false);
        } else {
            // follow
            await ctx.db.insert("follows", {
                followerId: currentUser._id,
                followingId: args.followingId,
            });
            await updateFollowCounts(ctx, currentUser._id, args.followingId, true);

            // create a notification
            await ctx.db.insert("notifications", {
                receiverId: args.followingId,
                senderId: currentUser._id,
                type: "follow",
            });
        }
    },
});

async function updateFollowCounts(
    ctx: MutationCtx,
    followerId: Id<"users">,
    followingId: Id<"users">,
    isFollow: boolean
) {
    const follower = await ctx.db.get(followerId);
    const following = await ctx.db.get(followingId);

    if (follower && following) {
        await ctx.db.patch(followerId, {
            following: follower.following + (isFollow ? 1 : -1),
        });
        await ctx.db.patch(followingId, {
            followers: following.followers + (isFollow ? 1 : -1),
        });
    }
}