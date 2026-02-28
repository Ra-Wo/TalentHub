import type { Metadata } from "next";
import { Geist_Mono, Manrope } from "next/font/google";
import { ThemeProvider } from "@/context/theme-provider";
import "../styles/globals.css";
import { SupabaseProvider } from "@/context/supabase-provider";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TalentHub",
  description: "A hiring OS that keeps teams aligned and decisive.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <body
        className={`${manrope.className} ${manrope.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
          enableSystem
        >
          <SupabaseProvider>{children}</SupabaseProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
