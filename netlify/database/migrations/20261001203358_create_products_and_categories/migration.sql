CREATE TABLE "categories" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL UNIQUE,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" text PRIMARY KEY,
	"slug" text NOT NULL UNIQUE,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"short_description" text NOT NULL,
	"key_features" jsonb DEFAULT '[]' NOT NULL,
	"details" jsonb,
	"main_image" text NOT NULL,
	"gallery_images" jsonb DEFAULT '[]' NOT NULL,
	"amazon_url" text NOT NULL,
	"is_new_deal" boolean DEFAULT false NOT NULL,
	"is_new_arrival" boolean DEFAULT false NOT NULL,
	"is_trending" boolean DEFAULT false NOT NULL,
	"badge" text,
	"created_at" text NOT NULL
);
