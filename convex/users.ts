import { ConvexError, v } from "convex/values";
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