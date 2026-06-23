import { getAllPostMeta, getCategories, getReviewStatus } from "@/lib/posts";
import CategorySidebar from "@/components/CategorySidebar";
import { Box, Chip, Container, Divider, Typography } from "@mui/material";
import Link from "next/link";

export const revalidate = 60;

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category: categorySlug } = await searchParams;

  const [allPosts, categories] = await Promise.all([
    getAllPostMeta(),
    getCategories(),
  ]);

  let posts = allPosts;
  if (categorySlug) {
    const selected = categories.find((c) => c.slug === categorySlug);
    if (selected) {
      const { getCategoryDescendantIds } = await import("@/lib/posts");
      const descendantIds = getCategoryDescendantIds(categories, selected.id);
      posts = allPosts.filter((p) => p.category_id && descendantIds.includes(p.category_id));
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
        글 목록
      </Typography>
      <Box sx={{ display: "flex", gap: 4, alignItems: "flex-start" }}>
        <CategorySidebar
          categories={categories}
          selectedSlug={categorySlug ?? null}
        />
        <Box sx={{ flex: 1 }}>
          {posts.length === 0 ? (
            <Typography color="text.secondary">글이 없습니다.</Typography>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              {posts.map((post, i) => {
                const status = getReviewStatus(post.next_review_at);
                return (
                  <Box key={post.slug}>
                    <Link href={`/posts/${post.slug}`} style={{ display: "block", textDecoration: "none", color: "inherit" }}>
                      <Box sx={{ py: 3, "&:hover h6": { color: "primary.main" } }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            {post.date}
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
                    {i < posts.length - 1 && <Divider />}
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      </Box>
    </Container>
  );
}
