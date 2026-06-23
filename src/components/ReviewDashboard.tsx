"use client";

import { useState, useMemo } from "react";
import { Box, Button, Chip, Container, Divider, Typography } from "@mui/material";
import Link from "next/link";
import type { PostMeta, Category } from "@/lib/posts";
import { getReviewStatus } from "@/lib/posts";

const REVIEW_INTERVALS = [1, 3, 7, 14, 30, 60];

function getStageIndex(reviewCount: number): number {
  return Math.min(reviewCount, REVIEW_INTERVALS.length - 1);
}

interface Props {
  posts: PostMeta[];
  categories: Category[];
}

export default function ReviewDashboard({ posts, categories }: Props) {
  const [selectedStage, setSelectedStage] = useState(0);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories]
  );

  const stageCounts = useMemo(() => {
    const now = new Date();
    return REVIEW_INTERVALS.map((_, i) =>
      posts.filter(
        (p) =>
          getStageIndex(p.review_count) === i &&
          p.next_review_at !== null &&
          new Date(p.next_review_at) <= now
      ).length
    );
  }, [posts]);

  const stagePosts = useMemo(() => {
    const now = new Date();
    return posts.filter(
      (p) =>
        getStageIndex(p.review_count) === selectedStage &&
        p.next_review_at !== null &&
        new Date(p.next_review_at) <= now
    );
  }, [posts, selectedStage]);

  const stageCategories = useMemo(() => {
    const ids = new Set(stagePosts.map((p) => p.category_id).filter(Boolean) as string[]);
    return categories.filter((c) => ids.has(c.id));
  }, [stagePosts, categories]);

  const filteredPosts = useMemo(
    () =>
      selectedCategoryId
        ? stagePosts.filter((p) => p.category_id === selectedCategoryId)
        : stagePosts,
    [stagePosts, selectedCategoryId]
  );

  function handleStageChange(index: number) {
    setSelectedStage(index);
    setSelectedCategoryId(null);
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
        복습 목록
      </Typography>

      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 4 }}>
        {REVIEW_INTERVALS.map((days, i) => (
          <Button
            key={days}
            variant={selectedStage === i ? "contained" : "outlined"}
            size="small"
            onClick={() => handleStageChange(i)}
            sx={{ gap: 0.75 }}
          >
            {days}일
            <Box
              component="span"
              sx={{
                fontSize: 11,
                lineHeight: 1,
                px: 0.75,
                py: 0.25,
                borderRadius: 10,
                bgcolor: selectedStage === i ? "rgba(255,255,255,0.2)" : "action.selected",
              }}
            >
              {stageCounts[i]}
            </Box>
          </Button>
        ))}
      </Box>

      {stageCategories.length > 0 && (
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 3 }}>
          <Chip
            label="전체"
            clickable
            onClick={() => setSelectedCategoryId(null)}
            color={selectedCategoryId === null ? "primary" : "default"}
            variant={selectedCategoryId === null ? "filled" : "outlined"}
          />
          {stageCategories.map((cat) => (
            <Chip
              key={cat.id}
              label={cat.name}
              clickable
              onClick={() => setSelectedCategoryId(cat.id)}
              color={selectedCategoryId === cat.id ? "primary" : "default"}
              variant={selectedCategoryId === cat.id ? "filled" : "outlined"}
            />
          ))}
        </Box>
      )}

      {filteredPosts.length === 0 ? (
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          해당 단계의 글이 없습니다.
        </Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          {filteredPosts.map((post, i) => {
            const status = getReviewStatus(post.next_review_at);
            const cat = post.category_id ? categoryMap.get(post.category_id) : null;
            return (
              <Box key={post.slug}>
                <Link
                  href={`/posts/${post.slug}`}
                  style={{ display: "block", textDecoration: "none", color: "inherit" }}
                >
                  <Box sx={{ py: 3, "&:hover h6": { color: "primary.main" } }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        {post.date}
                        {cat && <> · {cat.name}</>}
                      </Typography>
                      {status === "due" && (
                        <Chip label="복습 시기" size="small" color="warning" sx={{ height: 18, fontSize: 11 }} />
                      )}
                      {status === "upcoming" && (
                        <Chip label="곧 복습" size="small" sx={{ height: 18, fontSize: 11 }} />
                      )}
                    </Box>
                    <Typography variant="h6" sx={{ mt: 0, mb: 1, transition: "color 0.15s" }}>
                      {post.title}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                      {post.tags.map((tag) => (
                        <Chip key={tag.id} label={tag.name} size="small" />
                      ))}
                    </Box>
                  </Box>
                </Link>
                {i < filteredPosts.length - 1 && <Divider />}
              </Box>
            );
          })}
        </Box>
      )}
    </Container>
  );
}
