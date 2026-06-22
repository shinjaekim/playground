import { getPost, getReviewStatus } from "@/lib/posts";
import ReviewButton from "@/components/ReviewButton";
import { Container, Typography, Chip, Box, Button, Paper } from "@mui/material";
import Link from "next/link";

export const revalidate = 60;

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  const status = getReviewStatus(post.next_review_at);

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Link href="/posts" style={{ textDecoration: "none" }}>
        <Button variant="text" sx={{ mb: 3 }}>
          ← 글 목록으로
        </Button>
      </Link>

      <Typography variant="h3" component="h1" gutterBottom>
        {post.title}
      </Typography>

      <Typography variant="body2" color="text.secondary" gutterBottom>
        {post.date}
      </Typography>

      <Box sx={{ mb: 4, display: "flex", gap: 1, flexWrap: "wrap" }}>
        {post.tags.map((tag) => (
          <Chip key={tag.id} label={tag.name} size="small" />
        ))}
      </Box>

      <div dangerouslySetInnerHTML={{ __html: post.contentHtml }} />

      <Paper
        variant="outlined"
        sx={{
          mt: 6,
          p: 2.5,
          borderColor: status === "due" ? "warning.main" : "divider",
          bgcolor: status === "due" ? "warning.50" : "transparent",
        }}
      >
        <ReviewButton
          slug={post.slug}
          reviewCount={post.review_count}
          nextReviewAt={post.next_review_at}
        />
      </Paper>
    </Container>
  );
}
