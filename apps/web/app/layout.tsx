import type { Metadata } from "next";
import "../styles/globals.css";
import { AppShell } from "../components/layout/AppShell";

export const metadata: Metadata = {
  title: "ZIRIOS — Style. Perform. Conquer.",
  description:
    "ZIRIOS is a futuristic streetwear house engineered at the intersection of performance, luxury, and machine precision.",
  metadataBase: new URL("https://zirios.com"),
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "ZIRIOS",
    description: "Futuristic streetwear, engineered.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
