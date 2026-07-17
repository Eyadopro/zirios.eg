import { Request, Response, NextFunction } from "express";

// ── AppError ───────────────────────────────────────────────────────────────
// Thrown in routes when we want a specific status code.
// All other (unexpected) errors are caught as 500s.

export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.name = "AppError";
  }
}

// ── asyncHandler ────────────────────────────────────────────────────────────
// Wraps an async route handler so rejected promises forward to next(err)
// instead of crashing the process.

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
  return (req: Request, res: Response, next: NextFunction) =>
    fn(req, res, next).catch(next);
}

// ── errorHandler ───────────────────────────────────────────────────────────
// The frontend always reads `err.error` from JSON bodies, so every error
// response must be shaped `{ error: "..." }`.

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  console.error("[unhandled]", err);
  res.status(500).json({ error: "Internal server error" });
}
