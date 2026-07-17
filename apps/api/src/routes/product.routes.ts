import { Router, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../lib/auth.js";
import { asyncHandler, AppError } from "../middleware/error.js";

const router = Router({ mergeParams: true });

// ── GET /products/:slug ───────────────────────────────────────────────────
// Returns the full product shape the frontend already expects.
router.get(
  "/:slug",
  asyncHandler(async (req: Request, res: Response) => {
    const product = await prisma.product.findUnique({
      where: { slug: req.params.slug },
      include: {
        media: true,
        variants: true,
        reviews: {
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
        },
        category: { select: { id: true, name: true, slug: true } },
        collection: { select: { id: true, name: true, slug: true } },
      },
    });

    if (!product) throw new AppError("Product not found", 404);

    // Parse tags from JSON string to array
    const json = JSON.parse(JSON.stringify(product));
    json.tags = JSON.parse(json.tags);

    res.json(json);
  }),
);

// ── POST /products/:slug/reviews ────────────────────────────────────────
router.post(
  "/:slug/reviews",
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const product = await prisma.product.findUnique({
      where: { slug: req.params.slug },
    });
    if (!product) throw new AppError("Product not found", 404);

    const schema = z.object({
      rating: z.number().int().min(1).max(5),
      title: z.string().optional(),
      body: z.string().optional(),
    });
    const body = schema.parse(req.body);

    const review = await prisma.review.upsert({
      where: {
        userId_productId: { userId: req.userId!, productId: product.id },
      },
      update: { rating: body.rating, title: body.title, body: body.body },
      create: {
        userId: req.userId!,
        productId: product.id,
        rating: body.rating,
        title: body.title,
        body: body.body,
      },
      include: { user: { select: { name: true } } },
    });

    res.status(201).json(review);
  }),
);

export default router;
