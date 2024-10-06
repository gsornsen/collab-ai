import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getSettings = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      console.log("Not authenticated");
      // Return default settings if not authenticated
      return {
        appearance: { theme: "light" },
        chatgptApiKey: "",
        claudeApiKey: "",
        model: "GPT-4o",
      };
    }

    const userId = identity.subject;

    const settings = await ctx.db
      .query("settings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!settings) {
      // Return default settings if not found
      return {
        appearance: { theme: "light" },
        chatgptApiKey: "",
        claudeApiKey: "",
        model: "GPT-4o",
      };
    }

    // Ensure the model has a default value if it's not set
    return {
      ...settings,
      model: settings.model ?? "GPT-4o",
    };
  },
});

export const updateSettings = mutation({
  args: {
    appearance: v.optional(
      v.object({
        theme: v.string(),
      })
    ),
    chatgptApiKey: v.optional(v.string()),
    claudeApiKey: v.optional(v.string()),
    model: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      console.log("Not authenticated");
      return null; // Return early if not authenticated
    }

    const userId = identity.subject;

    const existingSettings = await ctx.db
      .query("settings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!existingSettings) {
      // Create new settings if not found
      const newSettings = await ctx.db.insert("settings", {
        userId,
        appearance: args.appearance || { theme: "light" },
        chatgptApiKey: args.chatgptApiKey || "",
        claudeApiKey: args.claudeApiKey || "",
        model: args.model || "GPT-4o",
      });
      return newSettings;
    }

    // Update existing settings
    const updatedSettings = await ctx.db.patch(existingSettings._id, {
      ...(args.appearance && { appearance: args.appearance }),
      ...(args.chatgptApiKey !== undefined && { chatgptApiKey: args.chatgptApiKey }),
      ...(args.claudeApiKey !== undefined && { claudeApiKey: args.claudeApiKey }),
      ...(args.model !== undefined && { model: args.model }),
    });

    return updatedSettings;
  },
});
