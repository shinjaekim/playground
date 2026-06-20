import { supabaseAdmin } from "@/lib/supabase-admin";
import { createTagAdmin, updateTag, deleteTag } from "@/lib/actions";
import {
  Box, Button, Chip, Container, Divider, MenuItem,
  TextField, Typography,
} from "@mui/material";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function TagsPage() {
  const [{ data: tags }, { data: categories }] = await Promise.all([
    supabaseAdmin
      .from("tags")
      .select("id, slug, name, category_id, categories(name)")
      .order("name"),
    supabaseAdmin.from("categories").select("id, name").order("name"),
  ]);

  const allCategories = categories ?? [];

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>태그 관리</Typography>
        <Link href="/admin" style={{ textDecoration: "none" }}>
          <Button variant="outlined">← Admin</Button>
        </Link>
      </Box>

      {/* 새 태그 추가 */}
      <Box component="form" action={createTagAdmin} sx={{ display: "flex", gap: 2, mb: 4, alignItems: "flex-start" }}>
        <TextField name="name" label="태그 이름" size="small" required sx={{ width: 200 }} />
        <TextField name="categoryId" select label="카테고리" size="small" defaultValue="" sx={{ width: 200 }}>
          <MenuItem value="">— 미지정 —</MenuItem>
          {allCategories.map((c: any) => (
            <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
          ))}
        </TextField>
        <Button type="submit" variant="contained" size="medium">+ 추가</Button>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* 태그 목록 */}
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        {(tags ?? []).map((tag: any, i: number) => {
          const updateAction = updateTag.bind(null, tag.id);
          const deleteAction = deleteTag.bind(null, tag.id);
          const categoryName = tag.categories?.name;

          return (
            <Box key={tag.id}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, py: 1.5 }}>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="body1">{tag.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{tag.slug}</Typography>
                    {categoryName && (
                      <Chip label={categoryName} size="small" variant="outlined" sx={{ fontSize: 10 }} />
                    )}
                  </Box>
                </Box>

                {/* 수정 인라인 폼 */}
                <Box component="form" action={updateAction} sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  <TextField name="name" defaultValue={tag.name} size="small" sx={{ width: 150 }} />
                  <TextField name="categoryId" select defaultValue={tag.category_id ?? ""} size="small" sx={{ width: 160 }}>
                    <MenuItem value="">— 미지정 —</MenuItem>
                    {allCategories.map((c: any) => (
                      <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                    ))}
                  </TextField>
                  <Button type="submit" size="small" variant="outlined">저장</Button>
                </Box>

                <form action={deleteAction}>
                  <Button type="submit" size="small" variant="outlined" color="error">삭제</Button>
                </form>
              </Box>
              {i < (tags?.length ?? 0) - 1 && <Divider />}
            </Box>
          );
        })}
      </Box>
    </Container>
  );
}
