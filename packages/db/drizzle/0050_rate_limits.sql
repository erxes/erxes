CREATE TABLE "core_rate_limits" (
	"key" text PRIMARY KEY NOT NULL,
	"points" integer DEFAULT 0 NOT NULL,
	"expire" bigint
);
