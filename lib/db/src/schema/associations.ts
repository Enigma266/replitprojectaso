import { pgTable, serial, text, boolean, integer, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const associationsTable = pgTable("associations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  registrationNumber: text("registration_number"),
  type: text("type").notNull(),
  status: text("status").notNull().default("establishment"),
  wilaya: text("wilaya").notNull(),
  municipality: text("municipality"),
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  website: text("website"),
  establishmentDate: date("establishment_date").notNull(),
  tenureStartDate: date("tenure_start_date"),
  tenureEndDate: date("tenure_end_date"),
  currentTenure: integer("current_tenure").notNull().default(0),
  isSportsType: boolean("is_sports_type").notNull().default(false),
  tenureExtended: boolean("tenure_extended").notNull().default(false),
  isDeleted: boolean("is_deleted").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAssociationSchema = createInsertSchema(associationsTable).omit({ id: true, createdAt: true });
export type InsertAssociation = z.infer<typeof insertAssociationSchema>;
export type Association = typeof associationsTable.$inferSelect;
