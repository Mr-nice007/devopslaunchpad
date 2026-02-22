-- PRD 03: Personalized dashboard — courses, modules, lessons, enrollments, progress
CREATE TABLE IF NOT EXISTS "courses" (
  "id" text PRIMARY KEY NOT NULL,
  "title" text NOT NULL,
  "slug" text NOT NULL UNIQUE,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "course_modules" (
  "id" text PRIMARY KEY NOT NULL,
  "course_id" text NOT NULL REFERENCES "courses"("id") ON DELETE CASCADE,
  "title" text NOT NULL,
  "position" integer NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "course_modules_course_position" ON "course_modules" ("course_id","position");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "lessons" (
  "id" text PRIMARY KEY NOT NULL,
  "module_id" text NOT NULL REFERENCES "course_modules"("id") ON DELETE CASCADE,
  "title" text NOT NULL,
  "slug" text NOT NULL,
  "position" integer NOT NULL,
  "is_free_preview" boolean DEFAULT false NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "lessons_module_position" ON "lessons" ("module_id","position");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "enrollments" (
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "course_id" text NOT NULL REFERENCES "courses"("id") ON DELETE CASCADE,
  "status" text NOT NULL,
  "source" text,
  "expires_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  PRIMARY KEY("user_id","course_id")
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "enrollments_user_course" ON "enrollments" ("user_id","course_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_lesson_progress" (
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "lesson_id" text NOT NULL REFERENCES "lessons"("id") ON DELETE CASCADE,
  "completed_at" timestamp,
  "last_viewed_at" timestamp DEFAULT now() NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  PRIMARY KEY("user_id","lesson_id")
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_lesson_progress_user_lesson" ON "user_lesson_progress" ("user_id","lesson_id");
