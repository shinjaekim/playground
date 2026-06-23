import { supabaseAdmin } from "@/lib/supabase-admin";
import { updatePost, createTagInline } from "@/lib/actions";
import { Box, Button, Container, MenuItem, TextField, Typography } from "@mui/material";
import { notFound } from "next/navigation";
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

export default async function EditPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const [{ data: post }, { data: allTags }, { data: categories }] = await Promise.all([
    supabaseAdmin
      .from("posts")
      .select("slug, title, date, content, category_id, post_tags(tags(id, slug, name))")
      .eq("slug", slug)
      .single(),
    supabaseAdmin.from("tags").select("id, slug, name").order("name"),
    supabaseAdmin.from("categories").select("id, slug, name, parent_id").order("name"),
  ]);

  if (!post) notFound();

  const currentTags = (post.post_tags ?? []).map((pt: any) => pt.tags).filter(Boolean);
  const flatCats = flattenCategories((categories ?? []) as Category[]);
  const action = updatePost.bind(null, slug);

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
        글 수정
      </Typography>
      <form action={action}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <TextField name="title" label="제목" required fullWidth defaultValue={post.title} />
          <TextField
            name="date"
            label="날짜"
            type="date"
            required
            fullWidth
            defaultValue={post.date}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            name="categoryId"
            select
            label="카테고리"
            defaultValue={post.category_id ?? ""}
            fullWidth
          >
            <MenuItem value="">— 미지정 —</MenuItem>
            {flatCats.map(({ category, depth }) => (
              <MenuItem key={category.id} value={category.id} sx={{ pl: 2 + depth * 2 }}>
                {category.name}
              </MenuItem>
            ))}
          </TextField>
          <TagSelector
            allTags={allTags ?? []}
            initialSelected={currentTags}
            createTagInline={createTagInline}
          />
          <MarkdownEditor defaultValue={post.content} />
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
