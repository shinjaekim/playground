import type { Metadata } from "next";
import ThemeRegistry from "@/components/ThemeRegistry";
import Navbar from "@/components/Navbar";
import { getReviewDueCount } from "@/lib/posts";

export const metadata: Metadata = {
  title: "playground",
  description: "개인 웹개발 학습 + 언어공부 놀이터",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const reviewDueCount = await getReviewDueCount();

  return (
    <html lang="ko">
      <body>
        <ThemeRegistry>
          <Navbar reviewDueCount={reviewDueCount} />
          {children}
        </ThemeRegistry>
      </body>
    </html>
  );
}
