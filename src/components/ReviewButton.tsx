"use client";

import { Button, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { markReviewed } from "@/lib/actions";

interface Props {
  slug: string;
  reviewCount: number;
  nextReviewAt: string | null;
}

const REVIEW_INTERVALS = [1, 3, 7, 14, 30, 60];

function formatDate(isoString: string): string {
  const d = new Date(isoString);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

function getDaysUntil(isoString: string): number {
  const diff = new Date(isoString).getTime() - Date.now();
  return Math.ceil(diff / 86400000);
}

export default function ReviewButton({ slug, reviewCount, nextReviewAt }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const isDue = !nextReviewAt || new Date(nextReviewAt) <= new Date();
  const nextIntervalDays = REVIEW_INTERVALS[Math.min(reviewCount + 1, REVIEW_INTERVALS.length - 1)];

  async function handleClick() {
    setLoading(true);
    await markReviewed(slug);
    setDone(true);
    setLoading(false);
    router.refresh();
  }

  return (
    <div>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        복습 횟수: {reviewCount}회
        {nextReviewAt && !done && (
          <>
            {" · "}
            {isDue
              ? "복습 시기입니다"
              : `다음 복습: ${formatDate(nextReviewAt)} (${getDaysUntil(nextReviewAt)}일 후)`}
          </>
        )}
        {done && ` · 다음 복습: ${nextIntervalDays}일 후`}
      </Typography>
      <Button
        variant={isDue && !done ? "contained" : "outlined"}
        color={done ? "success" : "warning"}
        disabled={loading || done}
        onClick={handleClick}
        size="small"
      >
        {done ? "복습 완료!" : loading ? "처리 중..." : "복습 완료"}
      </Button>
    </div>
  );
}
