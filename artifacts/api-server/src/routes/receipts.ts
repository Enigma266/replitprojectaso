import { Router } from "express";
import { db } from "@workspace/db";
import { receiptsTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import { CreateReceiptBody } from "@workspace/api-zod";

const router = Router();

router.get("/associations/:associationId/receipts", async (req, res) => {
  try {
    const associationId = parseInt(req.params.associationId);
    const receipts = await db
      .select()
      .from(receiptsTable)
      .where(eq(receiptsTable.associationId, associationId));
    res.json(receipts);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/associations/:associationId/receipts", async (req, res) => {
  try {
    const associationId = parseInt(req.params.associationId);
    const body = CreateReceiptBody.parse(req.body);
    const [created] = await db
      .insert(receiptsTable)
      .values({ ...body, associationId })
      .returning();
    res.status(201).json(created);
  } catch (err) {
    req.log.error(err);
    res.status(400).json({ error: String(err) });
  }
});

router.delete("/associations/:associationId/receipts/:receiptId", async (req, res) => {
  try {
    const associationId = parseInt(req.params.associationId);
    const receiptId = parseInt(req.params.receiptId);
    const [deleted] = await db
      .delete(receiptsTable)
      .where(and(eq(receiptsTable.id, receiptId), eq(receiptsTable.associationId, associationId)))
      .returning();
    if (!deleted) return res.status(404).json({ error: "Receipt not found" });
    res.json({ success: true, message: "تم حذف الوصل بنجاح" });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
