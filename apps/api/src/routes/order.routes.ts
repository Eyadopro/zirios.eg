import { Router, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../lib/auth.js";
import { asyncHandler, AppError } from "../middleware/error.js";

const router = Router();

// All routes require auth
router.use(requireAuth);

// ── GET /orders ────────────────────────────────────────────────────────────
router.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const orders = await prisma.order.findMany({
      where: { userId: req.userId },
      include: {
        items: true,
        address: { select: { id: true, label: true, line1: true, city: true, country: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(orders);
  }),
);

// ── POST /orders ──────────────────────────────────────────────────────────
// Frontend sends: { addressId, couponCode? }
// Reads cart items from localStorage on the client; the backend receives the
// cart via the request body as well. However, the frontend's current checkout
// does NOT send cart items — it relies on server-side state. Since the
// storefront uses a client-side cart store (Zustand) without server sync,
// the frontend should send cart items too. To match the existing frontend
// exactly (which only sends addressId + couponCode), we also accept an
// `items` array in the body for robustness.
router.post(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const bodySchema = z.object({
      addressId: z.string(),
      couponCode: z.string().optional(),
      items: z
        .array(
          z.object({
            variantId: z.string(),
            quantity: z.number().int().min(1),
          }),
        )
        .optional(),
    });
    const body = bodySchema.parse(req.body);

    // Validate address belongs to user
    const address = await prisma.address.findFirst({
      where: { id: body.addressId, userId: req.userId },
    });
    if (!address) throw new AppError("Address not found", 404);

    // Fetch cart items from body or return error
    if (!body.items || body.items.length === 0) {
      throw new AppError("Cart is empty");
    }
    const items = body.items; // narrowed, non-optional

    // Validate coupon if provided
    let coupon: { percentOff: number | null; amountOff: number | null } | null = null;
    if (body.couponCode) {
      const c = await prisma.coupon.findUnique({ where: { code: body.couponCode } });
      if (!c || !c.isActive) throw new AppError("Invalid or expired coupon");
      if (c.expiresAt && c.expiresAt < new Date()) throw new AppError("Coupon expired");
      if (c.maxUses && c.usedCount >= c.maxUses) throw new AppError("Coupon limit reached");
      coupon = { percentOff: c.percentOff, amountOff: c.amountOff };
    }

    // Resolve variants and compute totals
    const variants = await prisma.variant.findMany({
      where: { id: { in: body.items.map((i) => i.variantId) } },
      include: { product: true },
    });

    if (variants.length !== body.items.length) {
      throw new AppError("One or more variants not found");
    }

    // Check stock
    for (const item of body.items) {
      const v = variants.find((v) => v.id === item.variantId)!;
      if (v.stock < item.quantity) {
        throw new AppError(`Insufficient stock for ${v.product.name} (${v.size}/${v.color})`);
      }
    }

    // Calculate totals
    let subtotal = 0;
    for (const item of body.items) {
      const v = variants.find((v) => v.id === item.variantId)!;
      subtotal += (v.product.basePrice + v.priceDelta) * item.quantity;
    }

    const shipping = subtotal >= 10000 ? 0 : 1500; // free shipping ≥ $100
    const discountPercent = coupon?.percentOff || 0;
    const discountAmount = coupon?.amountOff || 0;
    const discount = Math.floor(subtotal * (discountPercent / 100)) + discountAmount;
    const total = subtotal - discount + shipping;

    // Generate order number
    const orderNumber = `ZRS-${Date.now().toString(36).toUpperCase()}`;

    // Create order + items + decrement stock in a transaction
    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          orderNumber,
          status: "AWAITING_PAYMENT",
          subtotal,
          discount,
          shipping,
          total,
          userId: req.userId!,
          addressId: body.addressId,
          couponCode: body.couponCode,
          items: {
            create: items.map((item) => {
              const v = variants.find((v) => v.id === item.variantId)!;
              return {
                variantId: v.id,
                productName: v.product.name,
                size: v.size,
                color: v.color,
                price: v.product.basePrice + v.priceDelta,
                quantity: item.quantity,
              };
            }),
          },
        },
        include: { items: true },
      });

      // Decrement stock
      for (const item of items) {
        await tx.variant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Increment coupon usage
      if (body.couponCode && coupon) {
        await tx.coupon.update({
          where: { code: body.couponCode },
          data: { usedCount: { increment: 1 } },
        });
      }

      return created;
    });

    res.status(201).json({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      total: order.total,
    });
  }),
);

export default router;
