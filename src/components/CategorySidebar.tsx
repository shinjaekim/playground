"use client";

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
}: {
  category: Category;
  categories: Category[];
  selectedSlug: string | null;
  depth: number;
  onSelect: (slug: string) => void;
}) {
  const children = categories.filter((c) => c.parent_id === category.id);
  const isSelected = selectedSlug === category.slug;

  return (
    <Box>
      <Box
        onClick={() => onSelect(category.slug)}
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
        {children.length > 0 && (
          <Typography component="span" sx={{ fontSize: 10, color: "text.secondary", lineHeight: 1 }}>
            ▼
          </Typography>
        )}
        <Typography
          variant="body2"
          sx={{ fontWeight: isSelected ? 600 : 400, color: isSelected ? "primary.main" : "text.primary" }}
        >
          {category.name}
        </Typography>
      </Box>
      {children.map((child) => (
        <CategoryNode
          key={child.id}
          category={child}
          categories={categories}
          selectedSlug={selectedSlug}
          depth={depth + 1}
          onSelect={onSelect}
        />
      ))}
    </Box>
  );
}

export default function CategorySidebar({ categories, selectedSlug, reviewMode, reviewDueCount }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const roots = categories.filter((c) => c.parent_id === null);
  const isAllSelected = !reviewMode && selectedSlug === null;

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
          py: 0.4,
          px: 1,
          cursor: "pointer",
          borderRadius: 1,
          mb: 0.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
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
              borderRadius: "10px",
              px: 0.8,
              py: 0.1,
              fontWeight: 600,
              lineHeight: 1.6,
            }}
          >
            {reviewDueCount}
          </Typography>
        )}
      </Box>
      <Box
        onClick={handleAll}
        sx={{
          py: 0.4,
          px: 1,
          cursor: "pointer",
          borderRadius: 1,
          mb: 0.5,
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
        />
      ))}
    </Box>
  );
}
