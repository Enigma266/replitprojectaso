import { Router } from "express";
import { db } from "@workspace/db";
import { membersTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import {
  ListMembersQueryParams,
  CreateMemberBody,
  UpdateMemberBody,
} from "@workspace/api-zod";

const router = Router({ mergeParams: true });

router.get("/associations/:associationId/members", async (req, res) => {
  try {
    const associationId = parseInt(req.params.associationId);
    const query = ListMembersQueryParams.parse(req.query);
    const { position, membershipType, status } = query;

    const conditions = [eq(membersTable.associationId, associationId)];
    if (position) conditions.push(eq(membersTable.position, position));
    if (membershipType) conditions.push(eq(membersTable.membershipType, membershipType));
    if (status) conditions.push(eq(membersTable.status, status));

    const members = await db
      .select()
      .from(membersTable)
      .where(and(...conditions));

    res.json(members);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/associations/:associationId/members", async (req, res) => {
  try {
    const associationId = parseInt(req.params.associationId);

    const body = CreateMemberBody.parse(req.body);

    const [created] = await db
      .insert(membersTable)
      .values({ ...body, associationId })
      .returning();

    res.status(201).json(created);
  } catch (err) {
    req.log.error(err);
    res.status(400).json({ error: String(err) });
  }
});

router.get("/associations/:associationId/members/:memberId", async (req, res) => {
  try {
    const associationId = parseInt(req.params.associationId);
    const memberId = parseInt(req.params.memberId);

    const [member] = await db
      .select()
      .from(membersTable)
      .where(and(eq(membersTable.id, memberId), eq(membersTable.associationId, associationId)));

    if (!member) return res.status(404).json({ error: "Member not found" });
    res.json(member);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/associations/:associationId/members/:memberId", async (req, res) => {
  try {
    const associationId = parseInt(req.params.associationId);
    const memberId = parseInt(req.params.memberId);

    const body = UpdateMemberBody.parse(req.body);

    const [updated] = await db
      .update(membersTable)
      .set(body)
      .where(and(eq(membersTable.id, memberId), eq(membersTable.associationId, associationId)))
      .returning();

    if (!updated) return res.status(404).json({ error: "Member not found" });
    res.json(updated);
  } catch (err) {
    req.log.error(err);
    res.status(400).json({ error: String(err) });
  }
});

router.delete("/associations/:associationId/members/:memberId", async (req, res) => {
  try {
    const associationId = parseInt(req.params.associationId);
    const memberId = parseInt(req.params.memberId);

    const [deleted] = await db
      .delete(membersTable)
      .where(and(eq(membersTable.id, memberId), eq(membersTable.associationId, associationId)))
      .returning();

    if (!deleted) return res.status(404).json({ error: "Member not found" });
    res.json({ success: true, message: "تم حذف العضو بنجاح" });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
