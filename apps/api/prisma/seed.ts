import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database …");

  // ── Admin user ──────────────────────────────────────────────────────────
  const password = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@zirios.eg" },
    update: {},
    create: {
      name: "ZIRIOS Admin",
      email: "admin@zirios.eg",
      password,
      role: "ADMIN",
    },
  });

  // ── Demo customer ───────────────────────────────────────────────────────
  const customerPw = await bcrypt.hash("customer123", 10);
  await prisma.user.upsert({
    where: { email: "customer@zirios.eg" },
    update: {},
    create: {
      name: "Demo Customer",
      email: "customer@zirios.eg",
      password: customerPw,
      role: "CUSTOMER",
    },
  });

  // ── Category: Streetwear ───────────────────────────────────────────────
  const category = await prisma.category.create({
    data: {
      name: "Streetwear",
      slug: "streetwear",
    },
  });

  // ── Collection: Core 01 ─────────────────────────────────────────────────
  const collection = await prisma.collection.create({
    data: {
      name: "Core 01",
      slug: "core-01",
      description: "The foundation. Essential pieces built to outlast trends.",
    },
  });

  // ── Products ───────────────────────────────────────────────────────────
  const productsData = [
    {
      name: "Phantom Hoodie",
      slug: "phantom-hoodie",
      description:
        "A precision-engineered hoodie crafted from aerospace-grade cotton blend. Featuring integrated thermal regulation and a signature red interior pocket.",
      basePrice: 24000,
      tags: JSON.stringify(["hoodie", "oversized", "black"]),
    },
    {
      name: "Carbon Cargo",
      slug: "carbon-cargo",
      description:
        "Next-generation cargo pants with articulated knee panels and carbon fiber reinforced stitching. Designed for maximum mobility.",
      basePrice: 19500,
      tags: JSON.stringify(["pants", "cargo", "tech"]),
    },
    {
      name: "Voltage Tee",
      slug: "voltage-tee",
      description:
        "Essential crewneck tee in heavyweight organic cotton. Voltage red ZIRIOS logo screened at chest. Pre-shrunk and garment-dyed.",
      basePrice: 9500,
      tags: JSON.stringify(["tee", "essentials", "red"]),
    },
    {
      name: "Aero Runner",
      slug: "aero-runner",
      description:
        "Performance runner engineered for the urban landscape. Knit upper with responsive cushioning and reflective accents.",
      basePrice: 32000,
      tags: JSON.stringify(["shoes", "runner", "performance"]),
    },
  ];

  const colors = ["Black", "White", "Shadow Grey"];
  const sizesBySlug: Record<string, string[]> = {
    "phantom-hoodie": ["S", "M", "L", "XL"],
    "carbon-cargo": ["28", "30", "32", "34"],
    "voltage-tee": ["S", "M", "L", "XL"],
    "aero-runner": ["US 8", "US 9", "US 10", "US 11", "US 12"],
  };

  for (const pd of productsData) {
    const product = await prisma.product.create({
      data: {
        ...pd,
        categoryId: category.id,
        collectionId: collection.id,
      },
    });

    // Media — one placeholder per product
    await prisma.media.create({
      data: {
        url: `/products/${pd.slug}.svg`,
        type: "image",
        alt: pd.name,
        productId: product.id,
      },
    });

    // Variants
    for (const color of colors) {
      for (const size of sizesBySlug[pd.slug] || ["M"]) {
        await prisma.variant.create({
          data: {
            size,
            color,
            priceDelta: color === "White" ? 0 : color === "Shadow Grey" ? 500 : 0,
            stock: 25,
            productId: product.id,
          },
        });
      }
    }
  }

  // ── Coupon ──────────────────────────────────────────────────────────────
  await prisma.coupon.create({
    data: {
      code: "WELCOME10",
      percentOff: 10,
      maxUses: 500,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    },
  });

  // ── Address for admin ──────────────────────────────────────────────────
  await prisma.address.create({
    data: {
      label: "HQ",
      line1: "123 Innovation Blvd",
      city: "Cairo",
      state: null,
      postal: "11511",
      country: "EG",
      phone: "+20 100 000 0000",
      isDefault: true,
      userId: admin.id,
    },
  });

  console.log("✅ Seed complete");
  console.log("   Admin  → admin@zirios.eg / admin123");
  console.log("   User   → customer@zirios.eg / customer123");
  console.log("   Coupon → WELCOME10 (10 % off)");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
