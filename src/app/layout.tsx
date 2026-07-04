import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans, Manrope } from "next/font/google";
import "./globals.css";
import "./osite.css";
import AtomDefs from "@/components/AtomDefs";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-dm-sans",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "OxyGen Haïti — l'écosystème de santé numérique haïtien",
  description:
    "OxyGen Haïti : le premier écosystème de santé numérique haïtien. Suivi des maladies chroniques, préparation aux concours de médecine, formation continue. Hors ligne, du français au kreyòl.",
  openGraph: {
    title: "OxyGen Haïti — l'écosystème de santé numérique haïtien",
    description: "Former, suivre et connecter — pensé pour les conditions réelles d'Haïti.",
    type: "website",
    images: ["/logo/png/appicon/oxygen-appicon-512.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${cormorant.variable} ${dmSans.variable} ${manrope.variable}`}>
        <AtomDefs />
        {children}
      </body>
    </html>
  );
}
