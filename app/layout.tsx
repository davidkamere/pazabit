import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Pazabit · Mesh safety", description: "Community-verified safety reporting over Bluetooth mesh" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // Browser extensions such as Grammarly can add attributes to <body> before React hydrates.
  // Limit the warning suppression to this extension-prone boundary.
  return <html lang="en"><body suppressHydrationWarning>{children}</body></html>;
}
