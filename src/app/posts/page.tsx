import { getAllPostMeta, getCategories, getCategoryDescendantIds } from "@/lib/posts";
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
      const descendantIds = getCategoryDescendantIds(categories, selected.id);
      posts = allPosts.filter((post) =>
        post.tags.some((tag) => tag.category_id && descendantIds.includes(tag.category_id))
      );
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
        글 목록
      </Typography>
      <Box sx={{ display: "flex", gap: 4, alignItems: "flex-start" }}>
        <CategorySidebar categories={categories} selectedSlug={categorySlug ?? null} />
        <Box sx={{ flex: 1 }}>
          {posts.length === 0 ? (
            <Typography color="text.secondary">글이 없습니다.</Typography>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              {posts.map((post, i) => (
                <Box key={post.slug}>
                  <Link href={`/posts/${post.slug}`} style={{ display: "block", textDecoration: "none", color: "inherit" }}>
                    <Box sx={{ py: 3, "&:hover h6": { color: "primary.main" } }}>
                      <Typography variant="caption" color="text.secondary">
                        {post.date}
                      </Typography>
                      <Typography variant="h6" sx={{ mt: 0.5, mb: 1, transition: "color 0.15s" }}>
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
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </Container>
  );
}
