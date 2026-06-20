import type { Metadata } from "next";
import ThemeRegistry from "@/components/ThemeRegistry";

export const metadata: Metadata = {
  title: "playground",
  description: "개인 웹개발 학습 + 언어공부 놀이터",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
