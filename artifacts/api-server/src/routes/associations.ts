import { Router } from "express";
import { db } from "@workspace/db";
import { associationsTable, membersTable } from "@workspace/db/schema";
import { eq, ilike, and, sql, count, gte } from "drizzle-orm";
import {
  ListAssociationsQueryParams,
  CreateAssociationBody,
  UpdateAssociationBody,
  RenewTenureBody,
} from "@workspace/api-zod";

const router = Router();

router.get("/associations", async (req, res) => {
  try {
    const query = ListAssociationsQueryParams.parse(req.query);
    const { search, type, status, wilaya, page, limit } = query;

    const conditions = [eq(associationsTable.isDeleted, false)];
    if (search) conditions.push(ilike(associationsTable.name, `%${search}%`));
    if (type) conditions.push(eq(associationsTable.type, type));
    if (status) conditions.push(eq(associationsTable.status, status));
    if (wilaya) conditions.push(eq(associationsTable.wilaya, wilaya));

    const where = and(...conditions);
    const offset = (page - 1) * limit;

    const [rows, totalResult] = await Promise.all([
      db
        .select({
          id: associationsTable.id,
          name: associationsTable.name,
          registrationNumber: associationsTable.registrationNumber,
          type: associationsTable.type,
          status: associationsTable.status,
          wilaya: associationsTable.wilaya,
          municipality: associationsTable.municipality,
          address: associationsTable.address,
          phone: associationsTable.phone,
          email: associationsTable.email,
          website: associationsTable.website,
          establishmentDate: associationsTable.establishmentDate,
          tenureStartDate: associationsTable.tenureStartDate,
          tenureEndDate: associationsTable.tenureEndDate,
          currentTenure: associationsTable.currentTenure,
          isSportsType: associationsTable.isSportsType,
          tenureExtended: associationsTable.tenureExtended,
          isDeleted: associationsTable.isDeleted,
          createdAt: associationsTable.createdAt,
          memberCount: sql<number>`(SELECT COUNT(*) FROM members WHERE members.association_id = ${associationsTable.id} AND members.status != 'deceased')::int`,
        })
        .from(associationsTable)
        .where(where)
        .limit(limit)
        .offset(offset),
      db.select({ count: count() }).from(associationsTable).where(where),
    ]);

    const total = totalResult[0]?.count ?? 0;
    res.json({
      associations: rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/associations", async (req, res) => {
  try {
    const body = CreateAssociationBody.parse(req.body);
    const isSports = body.type === "sports";
    const [created] = await db
      .insert(associationsTable)
      .values({ ...body, isSportsType: isSports })
      .returning();
    res.status(201).json({ ...created, memberCount: 0 });
  } catch (err) {
    req.log.error(err);
    res.status(400).json({ error: String(err) });
  }
});

router.get("/associations/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [assoc] = await db
      .select({
        id: associationsTable.id,
        name: associationsTable.name,
        registrationNumber: associationsTable.registrationNumber,
        type: associationsTable.type,
        status: associationsTable.status,
        wilaya: associationsTable.wilaya,
        municipality: associationsTable.municipality,
        address: associationsTable.address,
        phone: associationsTable.phone,
        email: associationsTable.email,
        website: associationsTable.website,
        establishmentDate: associationsTable.establishmentDate,
        tenureStartDate: associationsTable.tenureStartDate,
        tenureEndDate: associationsTable.tenureEndDate,
        currentTenure: associationsTable.currentTenure,
        isSportsType: associationsTable.isSportsType,
        tenureExtended: associationsTable.tenureExtended,
        isDeleted: associationsTable.isDeleted,
        createdAt: associationsTable.createdAt,
        memberCount: sql<number>`(SELECT COUNT(*) FROM members WHERE members.association_id = ${associationsTable.id})::int`,
      })
      .from(associationsTable)
      .where(and(eq(associationsTable.id, id), eq(associationsTable.isDeleted, false)));

    if (!assoc) return res.status(404).json({ error: "Association not found" });

    const members = await db
      .select()
      .from(membersTable)
      .where(eq(membersTable.associationId, id));

    const { receiptsTable } = await import("@workspace/db/schema");
    const receipts = await db
      .select()
      .from(receiptsTable)
      .where(eq(receiptsTable.associationId, id));

    res.json({ ...assoc, members, receipts });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/associations/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const body = UpdateAssociationBody.parse(req.body);
    const isSports = body.type === "sports" ? true : body.type ? false : undefined;
    const updateData: Record<string, unknown> = { ...body };
    if (isSports !== undefined) updateData.isSportsType = isSports;

    const [updated] = await db
      .update(associationsTable)
      .set(updateData)
      .where(and(eq(associationsTable.id, id), eq(associationsTable.isDeleted, false)))
      .returning();

    if (!updated) return res.status(404).json({ error: "Association not found" });
    res.json({ ...updated, memberCount: 0 });
  } catch (err) {
    req.log.error(err);
    res.status(400).json({ error: String(err) });
  }
});

router.delete("/associations/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [updated] = await db
      .update(associationsTable)
      .set({ isDeleted: true })
      .where(and(eq(associationsTable.id, id), eq(associationsTable.isDeleted, false)))
      .returning();

    if (!updated) return res.status(404).json({ error: "Association not found" });
    res.json({ success: true, message: "تم حذف الجمعية بنجاح" });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/associations/:id/renew-tenure", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const body = RenewTenureBody.parse(req.body);

    const [assoc] = await db
      .select()
      .from(associationsTable)
      .where(and(eq(associationsTable.id, id), eq(associationsTable.isDeleted, false)));

    if (!assoc) return res.status(404).json({ error: "Association not found" });
    if (assoc.currentTenure >= 10) {
      return res.status(400).json({ error: "تجاوزت الجمعية الحد الأقصى لعدد العهدات (10)" });
    }

    const startDate = new Date(body.tenureStartDate);
    let endDate: Date;
    if (assoc.isSportsType) {
      const years = body.extend ? 1 : 3;
      endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + years);
    } else {
      endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + 4);
    }

    const [updated] = await db
      .update(associationsTable)
      .set({
        tenureStartDate: body.tenureStartDate,
        tenureEndDate: endDate.toISOString().split("T")[0],
        currentTenure: assoc.currentTenure + 1,
        status: "renewal",
        tenureExtended: body.extend ?? false,
      })
      .where(eq(associationsTable.id, id))
      .returning();

    const memberCount = await db
      .select({ count: count() })
      .from(membersTable)
      .where(eq(membersTable.associationId, id));

    res.json({ ...updated, memberCount: memberCount[0]?.count ?? 0 });
  } catch (err) {
    req.log.error(err);
    res.status(400).json({ error: String(err) });
  }
});

export default router;
