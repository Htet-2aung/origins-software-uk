import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { ThemeProvider } from "@/app/components/ThemeProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Origins Ltd. — Digital engineering for ambitious teams",
  description:
    "Origins builds dependable digital products, software systems, infrastructure and AI-enabled workflows for ambitious teams.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://origins-software.com"
  ),
  icons: {
    icon: "/origins-logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
              try {
                const manual = localStorage.getItem('origins-theme-auto') === 'false';
                const saved = localStorage.getItem('origins-theme');
                if (manual && saved) {
                  document.documentElement.setAttribute('data-theme', saved);
                  document.documentElement.setAttribute('data-theme-mode', 'manual');
                  return;
                }
                const hour = new Date().getHours();
                const theme = hour < 5 ? 'midnight'
                  : hour < 9 ? 'forest'
                  : hour < 13 ? 'ocean'
                  : hour < 17 ? 'amber'
                  : hour < 20 ? 'sunset'
                  : 'rose';
                document.documentElement.setAttribute('data-theme', theme);
                document.documentElement.setAttribute('data-theme-mode', 'auto');
              } catch {}
            })();`,
          }}
        />
      </head>
      <body className="min-h-full">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
