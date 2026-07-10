import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ProProjects.co | Premium Written School & College Projects",
  description:
    "Premium written school and college projects, handmade file covers, records, research sheets, and academic presentation files with a polished finish.",
  keywords: [
    "school projects",
    "college projects",
    "written project files",
    "handmade file covers",
    "academic presentation files",
    "ProProjects"
  ],
  openGraph: {
    title: "ProProjects.co | Premium Written Academic Projects",
    description: "Custom academic written work crafted with presentation-grade finish and dependable delivery.",
    url: "https://proprojects.co",
    siteName: "ProProjects.co",
    type: "website"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1E6294"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
