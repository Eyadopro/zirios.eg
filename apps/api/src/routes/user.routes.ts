import { Router, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../lib/auth.js";
import { asyncHandler, AppError } from "../middleware/error.js";

const router = Router();

// All routes require auth
router.use(requireAuth);

// ── GET /users/me ──────────────────────────────────────────────────────────
router.get(
  "/me",
  asyncHandler(async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    if (!user) throw new AppError("User not found", 404);
    res.json(user);
  }),
);

// ── GET /users/me/addresses ───────────────────────────────────────────────
router.get(
  "/me/addresses",
  asyncHandler(async (req: Request, res: Response) => {
    const addresses = await prisma.address.findMany({
      where: { userId: req.userId },
      orderBy: [{ isDefault: "desc" }],
    });
    res.json(addresses);
  }),
);

const addressSchema = z.object({
  label: z.string().optional().default("Home"),
  line1: z.string(),
  line2: z.string().nullable().optional(),
  city: z.string(),
  state: z.string().nullable().optional(),
  postal: z.string(),
  country: z.string(),
  phone: z.string(),
  isDefault: z.boolean().optional().default(false),
});

// ── POST /users/me/addresses ──────────────────────────────────────────────
router.post(
  "/me/addresses",
  asyncHandler(async (req: Request, res: Response) => {
    const body = addressSchema.parse(req.body);

    // If setting as default, unset all other defaults first
    if (body.isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: { ...body, userId: req.userId! },
    });

    res.status(201).json(address);
  }),
);

// ── DELETE /users/me/addresses/:id ──────────────────────────────────────────
router.delete(
  "/me/addresses/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const address = await prisma.address.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!address) throw new AppError("Address not found", 404);

    await prisma.address.delete({ where: { id: address.id } });
    res.json({ ok: true });
  }),
);

export default router;
