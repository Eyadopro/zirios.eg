import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  setRefreshCookie,
  clearRefreshCookie,
} from "../lib/auth.js";
import { asyncHandler, AppError } from "../middleware/error.js";

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// ── POST /auth/register ──────────────────────────────────────────────────
router.post(
  "/register",
  asyncHandler(async (req: Request, res: Response) => {
    const body = registerSchema.parse(req.body);

    const exists = await prisma.user.findUnique({ where: { email: body.email } });
    if (exists) throw new AppError("Email already registered", 409);

    const password = await bcrypt.hash(body.password, 10);
    const user = await prisma.user.create({
      data: { name: body.name, email: body.email, password },
    });

    const accessToken = signAccessToken(user.id, user.role);
    const refreshToken = signRefreshToken(user.id, user.role);
    setRefreshCookie(res, refreshToken);

    res.status(201).json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      accessToken,
    });
  }),
);

// ── POST /auth/login ─────────────────────────────────────────────────────
router.post(
  "/login",
  asyncHandler(async (req: Request, res: Response) => {
    const body = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user) throw new AppError("Invalid email or password", 401);

    const valid = await bcrypt.compare(body.password, user.password);
    if (!valid) throw new AppError("Invalid email or password", 401);

    const accessToken = signAccessToken(user.id, user.role);
    const refreshToken = signRefreshToken(user.id, user.role);
    setRefreshCookie(res, refreshToken);

    res.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      accessToken,
    });
  }),
);

// ── POST /auth/refresh ───────────────────────────────────────────────────
router.post(
  "/refresh",
  asyncHandler(async (req: Request, res: Response) => {
    const token = req.cookies?.zirios_refresh;
    if (!token) throw new AppError("Refresh token missing", 401);

    try {
      const payload = verifyRefreshToken(token);
      const accessToken = signAccessToken(payload.sub, payload.role);
      res.json({ accessToken });
    } catch {
      clearRefreshCookie(res);
      throw new AppError("Invalid or expired refresh token", 401);
    }
  }),
);

// ── POST /auth/logout ─────────────────────────────────────────────────────
router.post("/logout", (_req: Request, res: Response) => {
  clearRefreshCookie(res);
  res.json({ ok: true });
});

export default router;
