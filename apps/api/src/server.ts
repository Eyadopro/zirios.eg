import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middleware/error.js";

import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import collectionRoutes from "./routes/collection.routes.js";
import userRoutes from "./routes/user.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
import orderRoutes from "./routes/order.routes.js";
import couponRoutes from "./routes/coupon.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import adminRoutes from "./routes/admin.routes.js";

const PORT = Number(process.env.PORT) || 4000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

const app = express();

// ── Middleware ─────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true, // allow cookies (refresh token)
  }),
);
app.use(express.json());
app.use(cookieParser());

// ── Health check ─────────────────────────────────────────────────────────
app.get("/api/v1/health", (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

// ── Routes ─────────────────────────────────────────────────────────────────
const v1 = "/api/v1";

app.use(`${v1}/auth`, authRoutes);
app.use(`${v1}/products`, productRoutes);
app.use(`${v1}/categories`, categoryRoutes);
app.use(`${v1}/collections`, collectionRoutes);
app.use(`${v1}/users`, userRoutes);
app.use(`${v1}/wishlist`, wishlistRoutes);
app.use(`${v1}/orders`, orderRoutes);
app.use(`${v1}/coupons`, couponRoutes);
app.use(`${v1}/payments`, paymentRoutes);
app.use(`${v1}/admin`, adminRoutes);

// ── Error handler (must be last) ───────────────────────────────────────────
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n  ⚡ ZIRIOS API → http://localhost:${PORT}${v1}\n`);
});
