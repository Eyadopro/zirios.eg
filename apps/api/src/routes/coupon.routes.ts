import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { asyncHandler, AppError } from "../middleware/error.js";

const router = Router();

// ── GET /coupons/:code/validate ───────────────────────────────────────────
// Frontend expects: { coupon: { percentOff?, amountOff? } }
router.get(
  "/:code/validate",
  asyncHandler(async (req: Request, res: Response) => {
    const coupon = await prisma.coupon.findUnique({
      where: { code: req.params.code.toUpperCase() },
    });

    if (!coupon || !coupon.isActive) {
      throw new AppError("Invalid or expired coupon", 404);
    }

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      throw new AppError("Coupon expired", 410);
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      throw new AppError("Coupon usage limit reached", 410);
    }

    res.json({
      coupon: {
        percentOff: coupon.percentOff,
        amountOff: coupon.amountOff,
      },
    });
  }),
);

export default router;
