import { Router, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../lib/auth.js";
import { asyncHandler, AppError } from "../middleware/error.js";

const router = Router();

// ── POST /payments/create-payment-intent ──────────────────────────────────
// Mock implementation — returns a fake clientSecret.
// In production, swap this with the real Stripe SDK:
//   const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
//   const paymentIntent = await stripe.paymentIntents.create({ ... });
router.post(
  "/create-payment-intent",
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const { orderId } = z.object({ orderId: z.string() }).parse(req.body);

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: req.userId },
    });
    if (!order) throw new AppError("Order not found", 404);

    // Generate a mock clientSecret
    const clientSecret = `pi_mock_${order.id.slice(-8)}_secret_${Date.now()}`;

    // Mark order as awaiting payment (it's already set, but just in case)
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "AWAITING_PAYMENT" },
    });

    console.log(
      `[mock payment] order=${order.orderNumber} amount=$${(order.total / 100).toFixed(2)}`,
    );

    res.json({ clientSecret });
  }),
);

export default router;
