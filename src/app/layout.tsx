import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/shared/Providers";

export const metadata: Metadata = {
  title: "MessBoard - Mass Management System",
  description: "Manage shared dining and expenses",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('mms-theme')||'light';if(t==='dark')document.documentElement.classList.add('dark')})()`,
          }}
        />
      </head>
      <body className="bg-[hsl(var(--mms-bg-page))] text-[hsl(var(--mms-text-primary))] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
