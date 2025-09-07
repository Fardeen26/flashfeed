import { mutation } from "./_generated/server";
import { v } from "convex/values";

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

        console.log("Creating user...");
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
        console.log("User created successfully");
        return newUserId;
    },
});