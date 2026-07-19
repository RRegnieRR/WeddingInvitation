import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const invitations = sqliteTable("invitations", {
  id: text("id").primaryKey(),
  externalId: text("external_id").notNull().unique(),
  codeHash: text("code_hash").notNull().unique(),
  displayName: text("display_name").notNull(),
  invitationType: text("invitation_type").notNull().default("family"),
  maxAdults: integer("max_adults").notNull().default(1),
  maxChildren: integer("max_children").notNull().default(0),
});

export const rsvps = sqliteTable("rsvps", {
  invitationId: text("invitation_id").primaryKey(),
  attendance: integer("attendance", { mode: "boolean" }).notNull(),
  adultCount: integer("adult_count").notNull().default(0),
  childCount: integer("child_count").notNull().default(0),
  guests: text("guests").notNull().default("[]"),
  message: text("message").notNull().default(""),
  updatedAt: text("updated_at").notNull(),
});

export const giftPreferences = sqliteTable("gift_preferences", {
  invitationId: text("invitation_id")
    .primaryKey()
    .references(() => invitations.id, { onDelete: "cascade" }),
  preference: text("preference", { enum: ["money", "gift", "both"] }).notNull(),
  giftNote: text("gift_note").notNull().default(""),
  updatedAt: text("updated_at").notNull(),
});
