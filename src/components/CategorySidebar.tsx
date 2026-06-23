"use client";

import { useState } from "react";
import { Box, Typography } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import type { Category } from "@/lib/posts";

interface Props {
  categories: Category[];
  selectedSlug: string | null;
  reviewMode: boolean;
  reviewDueCount: number;
}

function CategoryNode({
  category,
  categories,
  selectedSlug,
  depth,
  onSelect,
  openIds,
  toggleOpen,
}: {
  category: Category;
  categories: Category[];
  selectedSlug: string | null;
  depth: number;
  onSelect: (slug: string) => void;
  openIds: Set<string>;
  toggleOpen: (id: string) => void;
}) {
  const children = categories.filter((c) => c.parent_id === category.id);
  const isLeaf = children.length === 0;
  const isSelected = isLeaf && selectedSlug === category.slug;
  const isOpen = openIds.has(category.id);

  function handleClick() {
    if (isLeaf) {
      onSelect(category.slug);
    } else {
      toggleOpen(category.id);
    }
  }

  return (
    <Box>
      <Box
        onClick={handleClick}
        sx={{
          pl: depth * 2,
          py: 0.4,
          cursor: "pointer",
          borderRadius: 1,
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          bgcolor: isSelected ? "action.selected" : "transparent",
          "&:hover": { bgcolor: isSelected ? "action.selected" : "action.hover" },
        }}
      >
        {!isLeaf && (
          <Typography
            component="span"
            sx={{
              fontSize: 10,
              color: "text.disabled",
              lineHeight: 1,
              display: "inline-block",
              transition: "transform 0.15s",
              transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)",
            }}
          >
            ▼
          </Typography>
        )}
        <Typography
          variant="body2"
          sx={{
            fontWeight: isSelected ? 600 : 400,
            color: isSelected
              ? "primary.main"
              : isLeaf
              ? "text.primary"
              : "text.secondary",
          }}
        >
          {category.name}
        </Typography>
      </Box>

      {!isLeaf && isOpen &&
        children.map((child) => (
          <CategoryNode
            key={child.id}
            category={child}
            categories={categories}
            selectedSlug={selectedSlug}
            depth={depth + 1}
            onSelect={onSelect}
            openIds={openIds}
            toggleOpen={toggleOpen}
          />
        ))}
    </Box>
  );
}

export default function CategorySidebar({ categories, selectedSlug, reviewMode, reviewDueCount }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  // 부모 카테고리 ID 집합 — 초기 상태에서 모두 열림
  const [openIds, setOpenIds] = useState<Set<string>>(() => {
    const parentIds = new Set(
      categories
        .filter((c) => categories.some((other) => other.parent_id === c.id))
        .map((c) => c.id)
    );
    return parentIds;
  });

  const roots = categories.filter((c) => c.parent_id === null);
  const isAllSelected = !reviewMode && selectedSlug === null;

  function toggleOpen(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const handleSelect = (slug: string) => {
    router.push(`${pathname}?category=${slug}`);
  };

  const handleAll = () => {
    router.push(pathname);
  };

  const handleReview = () => {
    router.push(`${pathname}?review=due`);
  };

  return (
    <Box sx={{ width: 200, flexShrink: 0 }}>
      <Box
        onClick={handleReview}
        sx={{
          py: 0.4, px: 1, cursor: "pointer", borderRadius: 1, mb: 0.5,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          bgcolor: reviewMode ? "warning.light" : "transparent",
          "&:hover": { bgcolor: reviewMode ? "warning.light" : "action.hover" },
        }}
      >
        <Typography
          variant="body2"
          sx={{ fontWeight: reviewMode ? 600 : 400, color: reviewMode ? "warning.dark" : "text.primary" }}
        >
          복습 시기
        </Typography>
        {reviewDueCount > 0 && (
          <Typography
            variant="caption"
            sx={{
              bgcolor: reviewMode ? "warning.main" : "action.disabledBackground",
              color: reviewMode ? "warning.contrastText" : "text.secondary",
              borderRadius: "10px", px: 0.8, py: 0.1, fontWeight: 600, lineHeight: 1.6,
            }}
          >
            {reviewDueCount}
          </Typography>
        )}
      </Box>

      <Box
        onClick={handleAll}
        sx={{
          py: 0.4, px: 1, cursor: "pointer", borderRadius: 1, mb: 0.5,
          bgcolor: isAllSelected ? "action.selected" : "transparent",
          "&:hover": { bgcolor: isAllSelected ? "action.selected" : "action.hover" },
        }}
      >
        <Typography
          variant="body2"
          sx={{ fontWeight: isAllSelected ? 600 : 400, color: isAllSelected ? "primary.main" : "text.primary" }}
        >
          전체
        </Typography>
      </Box>

      {roots.map((cat) => (
        <CategoryNode
          key={cat.id}
          category={cat}
          categories={categories}
          selectedSlug={reviewMode ? null : selectedSlug}
          depth={1}
          onSelect={handleSelect}
          openIds={openIds}
          toggleOpen={toggleOpen}
        />
      ))}
    </Box>
  );
}
