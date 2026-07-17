import { Request, Response, NextFunction } from "express";
import jwt, { SignOptions } from "jsonwebtoken";
import { prisma } from "./prisma.js";
import { AppError, asyncHandler } from "../middleware/error.js";

// ── Types ─────────────────────────────────────────────────────────────────

interface JwtPayload {
  sub: string; // user id
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: string;
    }
  }
}

// ── Config ─────────────────────────────────────────────────────────────────

const ACCESS_SECRET = () => process.env.JWT_SECRET!;
const REFRESH_SECRET = () => process.env.JWT_REFRESH_SECRET!;
const ACCESS_TTL = () => process.env.JWT_EXPIRES_IN || "15m";
const REFRESH_TTL = () => process.env.JWT_REFRESH_EXPIRES_IN || "7d";
const REFRESH_COOKIE = "zirios_refresh";

// ── JWT helpers ────────────────────────────────────────────────────────────

export function signAccessToken(userId: string, role: string): string {
  return jwt.sign({ sub: userId, role }, ACCESS_SECRET(), {
    expiresIn: ACCESS_TTL(),
  } as SignOptions);
}

export function signRefreshToken(userId: string, role: string): string {
  return jwt.sign({ sub: userId, role }, REFRESH_SECRET(), {
    expiresIn: REFRESH_TTL(),
  } as SignOptions);
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, ACCESS_SECRET()) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, REFRESH_SECRET()) as JwtPayload;
}

/** Set the httpOnly refresh cookie on the response. */
export function setRefreshCookie(res: Response, token: string): void {
  const maxAge = 7 * 24 * 60 * 60; // 7 days
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/api/v1/auth/refresh",
    maxAge,
  });
}

/** Clear the refresh cookie (used on logout). */
export function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE, {
    path: "/api/v1/auth/refresh",
  });
}

// ── Middleware ─────────────────────────────────────────────────────────────

/** Attach `userId` and `userRole` to req from the Authorization header. */
export const requireAuth = asyncHandler(
  async (req, _res, next) => {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw new AppError("Authentication required", 401);
    }

    try {
      const payload = verifyAccessToken(header.slice(7));
      req.userId = payload.sub;
      req.userRole = payload.role;
      next();
    } catch {
      throw new AppError("Invalid or expired token", 401);
    }
  },
);

/** Must be authenticated AND have role ADMIN or SUPERADMIN. */
export const requireAdmin = asyncHandler(
  async (req, _res, next) => {
    // requireAuth must have already run (sets userId/userRole)
    if (!req.userId) {
      throw new AppError("Authentication required", 401);
    }
    if (req.userRole !== "ADMIN" && req.userRole !== "SUPERADMIN") {
      throw new AppError("Forbidden", 403);
    }
    next();
  },
);
