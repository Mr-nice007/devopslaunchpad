/**
 * PRD 03: Personalized dashboard — courses, modules, lessons, enrollments, progress.
 */
import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  uniqueIndex,
  primaryKey,
} from "drizzle-orm/pg-core";
import { usersTable } from "./auth-schema";

export const coursesTable = pgTable("courses", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const courseModulesTable = pgTable(
  "course_modules",
  {
    id: text("id").primaryKey(),
    courseId: text("course_id")
      .notNull()
      .references(() => coursesTable.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    position: integer("position").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    uniqueIndex("course_modules_course_position").on(t.courseId, t.position),
  ]
);

export const lessonsTable = pgTable(
  "lessons",
  {
    id: text("id").primaryKey(),
    moduleId: text("module_id")
      .notNull()
      .references(() => courseModulesTable.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    position: integer("position").notNull(),
    isFreePreview: boolean("is_free_preview").notNull().default(false),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => [uniqueIndex("lessons_module_position").on(t.moduleId, t.position)]
);

export const enrollmentStatusEnum = ["active", "trialing", "canceled", "expired", "gifted"] as const;
export type EnrollmentStatus = (typeof enrollmentStatusEnum)[number];

export const enrollmentsTable = pgTable(
  "enrollments",
  {
    userId: text("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    courseId: text("course_id")
      .notNull()
      .references(() => coursesTable.id, { onDelete: "cascade" }),
    status: text("status").notNull(), // active | trialing | canceled | expired | gifted
    source: text("source"), // subscription | one_time
    expiresAt: timestamp("expires_at", { mode: "date" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.courseId] }),
    uniqueIndex("enrollments_user_course").on(t.userId, t.courseId),
  ]
);

export const userLessonProgressTable = pgTable(
  "user_lesson_progress",
  {
    userId: text("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    lessonId: text("lesson_id")
      .notNull()
      .references(() => lessonsTable.id, { onDelete: "cascade" }),
    completedAt: timestamp("completed_at", { mode: "date" }),
    lastViewedAt: timestamp("last_viewed_at", { mode: "date" })
      .defaultNow()
      .notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.lessonId] }),
    uniqueIndex("user_lesson_progress_user_lesson").on(t.userId, t.lessonId),
  ]
);

export type InsertCourse = typeof coursesTable.$inferInsert;
export type SelectCourse = typeof coursesTable.$inferSelect;
export type InsertCourseModule = typeof courseModulesTable.$inferInsert;
export type SelectCourseModule = typeof courseModulesTable.$inferSelect;
export type InsertLesson = typeof lessonsTable.$inferInsert;
export type SelectLesson = typeof lessonsTable.$inferSelect;
export type InsertEnrollment = typeof enrollmentsTable.$inferInsert;
export type SelectEnrollment = typeof enrollmentsTable.$inferSelect;
export type InsertUserLessonProgress = typeof userLessonProgressTable.$inferInsert;
export type SelectUserLessonProgress = typeof userLessonProgressTable.$inferSelect;
