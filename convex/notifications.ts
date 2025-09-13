import { query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const getNotifications = query({
    handler: async (ctx) => {
        const currentUser = await getCurrentUser(ctx);

        const notifications = await ctx.db
            .query("notifications")
            .withIndex("by_receiver", (q) => q.eq("receiverId", currentUser._id))
            .order("desc")
            .collect();

        const notificationsWithInfo = await Promise.all(
            notifications.map(async (notification) => {
                const sender = (await ctx.db.get(notification.senderId))!;
                let post = null;
                let comment = null;

                if (notification.postId) {
                    post = await ctx.db.get(notification.postId);
                }

                if (notification.type === "comment" && notification.commentId) {
                    comment = await ctx.db.get(notification.commentId);
                }

                return {
                    ...notification,
                    sender: {
                        _id: sender._id,
                        username: sender.username,
                        image: sender.image,
                    },
                    post,
                    comment: comment?.content,
                };
            })
        );

        return notificationsWithInfo;
    },
});