import { getAllPostMeta, getPost } from "@/lib/posts";
import { Container, Typography, Chip, Box, Button } from "@mui/material";
import Link from "next/link";

export async function generateStaticParams() {
  return getAllPostMeta().map((p) => ({ slug: p.slug }));
}

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
          <Chip key={tag} label={tag} size="small" />
        ))}
      </Box>

      <div dangerouslySetInnerHTML={{ __html: post.contentHtml }} />

      {post.links.length > 0 && (
        <Box sx={{ mt: 6 }}>
          <Typography variant="h6" gutterBottom>
            연결된 글
          </Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {post.links.map((linkedSlug) => (
              <Link key={linkedSlug} href={`/posts/${linkedSlug}`} style={{ textDecoration: "none" }}>
                <Button variant="outlined" size="small">
                  {linkedSlug}
                </Button>
              </Link>
            ))}
          </Box>
        </Box>
      )}
    </Container>
  );
}
