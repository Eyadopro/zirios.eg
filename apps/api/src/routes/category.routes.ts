import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { asyncHandler, AppError } from "../middleware/error.js";

const router = Router();

// ── GET /categories/:slug ────────────────────────────────────────────────
// Frontend expects: { id, name, slug, children: [...], products: [...], _count: { products } }
router.get(
  "/:slug",
  asyncHandler(async (req: Request, res: Response) => {
    const category = await prisma.category.findUnique({
      where: { slug: req.params.slug },
      include: {
        children: { select: { id: true, name: true, slug: true } },
        products: {
          include: { media: { select: { url: true } } },
          where: { isPublished: true },
        },
        _count: { select: { products: true } },
      },
    });

    if (!category) throw new AppError("Category not found", 404);

    res.json(category);
  }),
);

export default router;
