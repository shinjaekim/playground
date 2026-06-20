import { getPost } from "@/lib/posts";
import { Container, Typography, Chip, Box, Button } from "@mui/material";
import Link from "next/link";

export const revalidate = 60;

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Link href="/graph" style={{ textDecoration: "none" }}>
        <Button variant="text" sx={{ mb: 3 }}>
          ← 그래프로 돌아가기
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
    </Container>
  );
}
