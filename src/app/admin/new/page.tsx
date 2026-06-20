import { createPost } from "@/lib/actions";
import { Box, Button, Container, TextField, Typography } from "@mui/material";
import Link from "next/link";

export default function NewPostPage() {
  const today = new Date().toISOString().split("T")[0];

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
        새 글 작성
      </Typography>
      <form action={createPost}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <TextField name="title" label="제목" required fullWidth />
          <TextField name="slug" label="Slug (URL)" required fullWidth helperText="영문 소문자, 숫자, 하이픈만 사용 (예: my-first-post)" />
          <TextField name="date" label="날짜" type="date" required fullWidth defaultValue={today} slotProps={{ inputLabel: { shrink: true } }} />
          <TextField name="tags" label="태그 (쉼표로 구분)" fullWidth helperText="예: React, JavaScript, Web" />
          <TextField name="links" label="연결된 글 slug (쉼표로 구분)" fullWidth helperText="예: react-hooks, nextjs-app-router" />
          <TextField name="content" label="내용 (Markdown)" required fullWidth multiline minRows={16} slotProps={{ input: { sx: { fontFamily: "monospace", fontSize: 14 } } }} />
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
