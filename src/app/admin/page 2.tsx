import { supabaseAdmin } from "@/lib/supabase-admin";
import { deletePost } from "@/lib/actions";
import {
  Box, Button, Chip, Container, Divider, Typography,
} from "@mui/material";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { data: posts } = await supabaseAdmin
    .from("posts")
    .select("slug, title, date, tags, is_deleted")
    .order("date", { ascending: false });

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Admin
        </Typography>
        <Link href="/admin/new" style={{ textDecoration: "none" }}>
          <Button variant="contained">+ 새 글</Button>
        </Link>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column" }}>
        {posts?.map((post, i) => (
          <Box key={post.slug}>
            <Box sx={{ py: 2.5, display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 600,
                      color: post.is_deleted ? "text.disabled" : "text.primary",
                      textDecoration: post.is_deleted ? "line-through" : "none",
                    }}
                  >
                    {post.title}
                  </Typography>
                  {post.is_deleted && (
                    <Chip label="삭제됨" size="small" color="error" variant="outlined" />
                  )}
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {post.date} · {post.slug}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>
                {!post.is_deleted && (
                  <>
                    <Link href={`/admin/posts/${post.slug}/edit`} style={{ textDecoration: "none" }}>
                      <Button size="small" variant="outlined">수정</Button>
                    </Link>
                    <form action={deletePost.bind(null, post.slug)}>
                      <Button size="small" variant="outlined" color="error" type="submit">
                        삭제
                      </Button>
                    </form>
                  </>
                )}
              </Box>
            </Box>
            {i < (posts?.length ?? 0) - 1 && <Divider />}
          </Box>
        ))}
      </Box>
    </Container>
  );
}
