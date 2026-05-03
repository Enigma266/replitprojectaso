import { Router } from "express";
import { db } from "@workspace/db";
import { associationsTable, membersTable } from "@workspace/db/schema";
import { eq, sql, and, gte, lte, count } from "drizzle-orm";

const router = Router();

router.get("/stats/dashboard", async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];

    const [
      totalResult,
      activeResult,
      membersResult,
      tenureExpiringResult,
      newThisMonthResult,
      suspendedResult,
      dissolutionResult,
    ] = await Promise.all([
      db.select({ count: count() }).from(associationsTable).where(eq(associationsTable.isDeleted, false)),
      db.select({ count: count() }).from(associationsTable).where(and(eq(associationsTable.isDeleted, false), eq(associationsTable.status, "active"))),
      db.select({ count: count() }).from(membersTable).where(eq(membersTable.status, "active")),
      db.select({ count: count() }).from(associationsTable).where(
        and(
          eq(associationsTable.isDeleted, false),
          sql`${associationsTable.tenureEndDate} IS NOT NULL`,
          lte(associationsTable.tenureEndDate, thirtyDaysFromNow),
          gte(associationsTable.tenureEndDate, today),
        )
      ),
      db.select({ count: count() }).from(associationsTable).where(
        and(eq(associationsTable.isDeleted, false), gte(associationsTable.establishmentDate, startOfMonth))
      ),
      db.select({ count: count() }).from(associationsTable).where(and(eq(associationsTable.isDeleted, false), eq(associationsTable.status, "suspension"))),
      db.select({ count: count() }).from(associationsTable).where(and(eq(associationsTable.isDeleted, false), eq(associationsTable.status, "dissolution"))),
    ]);

    res.json({
      totalAssociations: totalResult[0]?.count ?? 0,
      activeAssociations: activeResult[0]?.count ?? 0,
      totalMembers: membersResult[0]?.count ?? 0,
      tenureExpiringCount: tenureExpiringResult[0]?.count ?? 0,
      newThisMonth: newThisMonthResult[0]?.count ?? 0,
      suspendedCount: suspendedResult[0]?.count ?? 0,
      dissolutionCount: dissolutionResult[0]?.count ?? 0,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/stats/associations-by-type", async (req, res) => {
  try {
    const rows = await db
      .select({ label: associationsTable.type, count: count() })
      .from(associationsTable)
      .where(eq(associationsTable.isDeleted, false))
      .groupBy(associationsTable.type);
    res.json(rows);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/stats/associations-by-status", async (req, res) => {
  try {
    const rows = await db
      .select({ label: associationsTable.status, count: count() })
      .from(associationsTable)
      .where(eq(associationsTable.isDeleted, false))
      .groupBy(associationsTable.status);
    res.json(rows);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/stats/monthly-registrations", async (req, res) => {
  try {
    const rows = await db.execute(sql`
      SELECT 
        TO_CHAR(DATE_TRUNC('month', establishment_date::date), 'YYYY-MM') AS month,
        COUNT(*)::int AS count
      FROM associations
      WHERE is_deleted = false
        AND establishment_date >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', establishment_date::date)
      ORDER BY DATE_TRUNC('month', establishment_date::date)
    `);
    res.json(rows.rows);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/stats/tenure-expiring", async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    const rows = await db
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
      .where(
        and(
          eq(associationsTable.isDeleted, false),
          sql`${associationsTable.tenureEndDate} IS NOT NULL`,
          lte(associationsTable.tenureEndDate, thirtyDaysFromNow),
          gte(associationsTable.tenureEndDate, today),
        )
      );
    res.json(rows);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
