import { supabaseAdmin } from "@/lib/supabase-admin";
import { createTagAdmin, updateTag, deleteTag } from "@/lib/actions";
import { Box, Button, Container, Divider, TextField, Typography } from "@mui/material";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function TagsPage() {
  const { data: tags } = await supabaseAdmin
    .from("tags")
    .select("id, slug, name")
    .order("name");

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
        <TextField name="name" label="태그 이름" size="small" required sx={{ width: 240 }} />
        <Button type="submit" variant="contained" size="medium">+ 추가</Button>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* 태그 목록 */}
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        {(tags ?? []).map((tag: any, i: number) => {
          const updateAction = updateTag.bind(null, tag.id);
          const deleteAction = deleteTag.bind(null, tag.id);

          return (
            <Box key={tag.id}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, py: 1.5 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1">{tag.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{tag.slug}</Typography>
                </Box>
                <Box component="form" action={updateAction} sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  <TextField name="name" defaultValue={tag.name} size="small" sx={{ width: 180 }} />
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
