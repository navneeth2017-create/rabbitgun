import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rabbitgun",
  description: "Private operations dashboard.",
  robots: { index: false, follow: false, nocache: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300..700&family=Instrument+Sans:ital,wght@0,400..700;1,400..600&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <meta name="theme-color" content="#14110e" />
      </head>
      <body>
        <Script
          id="rg-theme"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html:
              '(function(){try{var ok=["ember","dusk","moss","paper","mono","lite"];var t=new URLSearchParams(location.search).get("theme")||localStorage.getItem("rabbitgun.theme");if(t&&ok.indexOf(t)>-1)document.documentElement.dataset.theme=t;}catch(e){}})();',
          }}
        />
        {children}
      </body>
    </html>
  );
}
