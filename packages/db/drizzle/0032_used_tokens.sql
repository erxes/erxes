CREATE TABLE "core_used_tokens" (
	"jti" text PRIMARY KEY NOT NULL,
	"used_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
REVOKE ALL ON core_used_tokens FROM PUBLIC;
