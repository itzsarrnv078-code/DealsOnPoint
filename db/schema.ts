import { pgTable, text, boolean, timestamp, jsonb, serial } from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  shortDescription: text("short_description").notNull(),
  keyFeatures: jsonb("key_features").$type<string[]>().notNull().default([]),
  details: jsonb("details").$type<Record<string, string>>(),
  mainImage: text("main_image").notNull(),
  galleryImages: jsonb("gallery_images").$type<string[]>().notNull().default([]),
  amazonUrl: text("amazon_url").notNull(),
  isNewDeal: boolean("is_new_deal").notNull().default(false),
  isNewArrival: boolean("is_new_arrival").notNull().default(false),
  isTrending: boolean("is_trending").notNull().default(false),
  badge: text("badge"),
  createdAt: text("created_at").notNull(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});
