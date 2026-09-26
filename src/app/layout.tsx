import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kotak Komentar & Masukan Privat | My Komentar",
  description: "Kirim pesan, saran, dan komentar secara aman dan privat langsung kepada Admin.",
  keywords: ["komentar", "masukan", "feedback privat", "pesan rahasia"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased min-h-screen flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">
        <main className="flex-1">
          {children}
        </main>
      </body>
    </html>
  );
}
