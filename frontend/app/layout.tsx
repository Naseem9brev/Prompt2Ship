import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Prompt2Ship",
  description: "Score how AI-assisted your 2026 GitHub commit history looks."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
