import { getAllPostMeta } from "@/lib/posts";
import { Box, Chip, Container, Divider, Typography } from "@mui/material";
import Link from "next/link";

export default function PostsPage() {
  const posts = getAllPostMeta().sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
        글 목록
      </Typography>
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
                    <Chip key={tag} label={tag} size="small" />
                  ))}
                </Box>
              </Box>
            </Link>
            {i < posts.length - 1 && <Divider />}
          </Box>
        ))}
      </Box>
    </Container>
  );
}
