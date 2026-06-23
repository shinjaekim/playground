import { createPost, createTagInline } from "@/lib/actions";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { Box, Button, Container, MenuItem, TextField, Typography } from "@mui/material";
import Link from "next/link";
import TagSelector from "@/components/TagSelector";
import MarkdownEditor from "@/components/MarkdownEditor";
import type { Category } from "@/lib/posts";

function flattenCategories(
  categories: Category[],
  parentId: string | null = null,
  depth = 0
): Array<{ category: Category; depth: number }> {
  return categories
    .filter((c) => c.parent_id === parentId)
    .flatMap((c) => [
      { category: c, depth },
      ...flattenCategories(categories, c.id, depth + 1),
    ]);
}

export default async function NewPostPage() {
  const today = new Date().toISOString().split("T")[0];

  const [{ data: allTags }, { data: categories }] = await Promise.all([
    supabaseAdmin.from("tags").select("id, slug, name").order("name"),
    supabaseAdmin.from("categories").select("id, slug, name, parent_id").order("name"),
  ]);

  const flatCats = flattenCategories((categories ?? []) as Category[]);

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
        새 글 작성
      </Typography>
      <form action={createPost}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <TextField name="title" label="제목" required fullWidth />
          <TextField
            name="slug"
            label="Slug (URL)"
            required
            fullWidth
            helperText="영문 소문자, 숫자, 하이픈만 사용 (예: my-first-post)"
          />
          <TextField
            name="date"
            label="날짜"
            type="date"
            required
            fullWidth
            defaultValue={today}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField name="categoryId" select label="카테고리" defaultValue="" fullWidth>
            <MenuItem value="">— 미지정 —</MenuItem>
            {flatCats.map(({ category, depth }) => (
              <MenuItem key={category.id} value={category.id} sx={{ pl: 2 + depth * 2 }}>
                {category.name}
              </MenuItem>
            ))}
          </TextField>
          <TagSelector allTags={allTags ?? []} createTagInline={createTagInline} />
          <MarkdownEditor />
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
