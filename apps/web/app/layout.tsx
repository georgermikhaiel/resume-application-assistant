import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Career Application Assistant",
  description: "A fact-backed application workflow for internship and co-op applications.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
