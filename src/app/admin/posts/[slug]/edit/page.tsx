import { supabaseAdmin } from "@/lib/supabase-admin";
import { updatePost } from "@/lib/actions";
import { Box, Button, Container, TextField, Typography } from "@mui/material";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function EditPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data: post } = await supabaseAdmin
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!post) notFound();

  const action = updatePost.bind(null, slug);

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
        글 수정
      </Typography>
      <form action={action}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <TextField name="title" label="제목" required fullWidth defaultValue={post.title} />
          <TextField name="date" label="날짜" type="date" required fullWidth defaultValue={post.date} slotProps={{ inputLabel: { shrink: true } }} />
          <TextField name="tags" label="태그 (쉼표로 구분)" fullWidth defaultValue={post.tags?.join(", ")} />
          <TextField name="links" label="연결된 글 slug (쉼표로 구분)" fullWidth defaultValue={post.links?.join(", ")} />
          <TextField name="content" label="내용 (Markdown)" required fullWidth multiline minRows={16} defaultValue={post.content} slotProps={{ input: { sx: { fontFamily: "monospace", fontSize: 14 } } }} />
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button type="submit" variant="contained" size="large">저장</Button>
            <Link href="/admin" style={{ textDecoration: "none" }}>
              <Button variant="outlined" size="large">취소</Button>
            </Link>
          </Box>
        </Box>
      </form>
    </Container>
  );
}
