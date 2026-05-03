import { pgTable, serial, text, integer, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { associationsTable } from "./associations";

export const membersTable = pgTable("members", {
  id: serial("id").primaryKey(),
  associationId: integer("association_id").notNull().references(() => associationsTable.id, { onDelete: "cascade" }),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  nationalId: text("national_id"),
  birthDate: date("birth_date"),
  birthPlace: text("birth_place"),
  fatherName: text("father_name"),
  motherName: text("mother_name"),
  gender: text("gender"),
  nationality: text("nationality").default("جزائرية"),
  position: text("position").notNull().default("member"),
  membershipType: text("membership_type").notNull().default("regular"),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertMemberSchema = createInsertSchema(membersTable).omit({ id: true, createdAt: true });
export type InsertMember = z.infer<typeof insertMemberSchema>;
export type Member = typeof membersTable.$inferSelect;
