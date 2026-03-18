import "@/app/globals.css";
import Providers from "@/components/Providers";
import { ThemeProvider } from "@/components/theme-provider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // lang is set by [locale]/layout.tsx via Next.js metadata — suppressHydrationWarning
    // silences the mismatch between server-rendered lang="" and the hydrated value,
    // and is also required by next-themes which modifies the class attribute before hydration.
    <html suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <Providers>{children}</Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}