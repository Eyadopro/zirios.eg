import { Router, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../lib/auth.js";
import { asyncHandler, AppError } from "../middleware/error.js";

const router = Router();

// All routes require auth
router.use(requireAuth);

// ── GET /wishlist ────────────────────────────────────────────────────────
router.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const items = await prisma.wishlist.findMany({
      where: { userId: req.userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            basePrice: true,
            media: { select: { url: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(items);
  }),
);

// ── POST /wishlist ────────────────────────────────────────────────────────
// Frontend sends: { productId }
router.post(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const { productId } = z.object({ productId: z.string() }).parse(req.body);

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new AppError("Product not found", 404);

    // Idempotent: if already in wishlist, return existing item
    const existing = await prisma.wishlist.findUnique({
      where: { userId_productId: { userId: req.userId!, productId } },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            basePrice: true,
            media: { select: { url: true } },
          },
        },
      },
    });

    if (existing) {
      res.json(existing);
      return;
    }

    const item = await prisma.wishlist.create({
      data: { userId: req.userId!, productId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            basePrice: true,
            media: { select: { url: true } },
          },
        },
      },
    });

    res.status(201).json(item);
  }),
);

// ── DELETE /wishlist/:id ──────────────────────────────────────────────────
router.delete(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const item = await prisma.wishlist.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!item) throw new AppError("Wishlist item not found", 404);

    await prisma.wishlist.delete({ where: { id: item.id } });
    res.json({ ok: true });
  }),
);

export default router;
