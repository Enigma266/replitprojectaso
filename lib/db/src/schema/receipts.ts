import { pgTable, serial, text, integer, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { associationsTable } from "./associations";

export const receiptsTable = pgTable("receipts", {
  id: serial("id").primaryKey(),
  associationId: integer("association_id").notNull().references(() => associationsTable.id, { onDelete: "cascade" }),
  receiptType: text("receipt_type").notNull(),
  receiptNumber: text("receipt_number"),
  receiptDate: date("receipt_date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertReceiptSchema = createInsertSchema(receiptsTable).omit({ id: true, createdAt: true });
export type InsertReceipt = z.infer<typeof insertReceiptSchema>;
export type Receipt = typeof receiptsTable.$inferSelect;
