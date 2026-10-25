import type { Metadata } from "next";
import "@fontsource-variable/bricolage-grotesque/standard.css";
import "@fontsource/gentium-book-plus/400.css";
import "@fontsource/gentium-book-plus/400-italic.css";
import "@fontsource/gentium-book-plus/700.css";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Faithbeat: hymns in Igbo, Yoruba, Hausa and English",
    template: "%s | Faithbeat",
  },
  description:
    "Describe a hymn and Faithbeat writes the lyrics in Igbo, Yoruba, Hausa or English, then sets them for four voices with sheet music you can play, print and rehearse from.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-paper text-ink antialiased">{children}</body>
    </html>
  );
}
