import { Router, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAdmin } from "../lib/auth.js";
import { asyncHandler } from "../middleware/error.js";

const router = Router();

// All admin routes require ADMIN or SUPERADMIN role
router.use(requireAdmin);

// ── GET /admin/analytics ─────────────────────────────────────────────────
// Frontend expects: { totalRevenue, monthlyRevenue, totalOrders, totalCustomers }
router.get(
  "/analytics",
  asyncHandler(async (_req: Request, res: Response) => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalRevenue, monthlyRevenue, totalOrders, totalCustomers] =
      await Promise.all([
        // Total revenue (sum of order totals)
        prisma.order.aggregate({ _sum: { total: true } }).then((r) => r._sum.total || 0),
        // Monthly revenue
        prisma.order
          .aggregate({ _sum: { total: true }, where: { createdAt: { gte: monthStart } } })
          .then((r) => r._sum.total || 0),
        // Total orders
        prisma.order.count(),
        // Total customers
        prisma.user.count({ where: { role: "CUSTOMER" } }),
      ]);

    res.json({
      totalRevenue,
      monthlyRevenue,
      totalOrders,
      totalCustomers,
    });
  }),
);

// ── GET /admin/inventory ─────────────────────────────────────────────────
// Frontend expects: { variants: [...] }
router.get(
  "/inventory",
  asyncHandler(async (_req: Request, res: Response) => {
    const variants = await prisma.variant.findMany({
      include: {
        product: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { stock: "asc" },
    });

    res.json({ variants });
  }),
);

// ── PATCH /admin/inventory/:id/stock ────────────────────────────────────
router.patch(
  "/inventory/:id/stock",
  asyncHandler(async (req: Request, res: Response) => {
    const { stock } = z.object({ stock: z.number().int().min(0) }).parse(req.body);

    const variant = await prisma.variant.update({
      where: { id: req.params.id },
      data: { stock },
      include: {
        product: { select: { id: true, name: true, slug: true } },
      },
    });

    res.json(variant);
  }),
);

export default router;
