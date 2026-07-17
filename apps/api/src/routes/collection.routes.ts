import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { asyncHandler, AppError } from "../middleware/error.js";

const router = Router();

// ── GET /collections/:slug ────────────────────────────────────────────────
// Frontend expects: { id, name, slug, description, heroImage, products: [...], _count: { products } }
router.get(
  "/:slug",
  asyncHandler(async (req: Request, res: Response) => {
    const collection = await prisma.collection.findUnique({
      where: { slug: req.params.slug },
      include: {
        products: {
          include: { media: { select: { url: true } } },
          where: { isPublished: true },
        },
        _count: { select: { products: true } },
      },
    });

    if (!collection) throw new AppError("Collection not found", 404);

    res.json(collection);
  }),
);

export default router;
