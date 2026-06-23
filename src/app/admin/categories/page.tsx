import { supabaseAdmin } from "@/lib/supabase-admin";
import { createCategory, updateCategory } from "@/lib/actions";
import DeleteCategoryButton from "@/components/DeleteCategoryButton";
import {
  Box, Button, Chip, Container, Divider, MenuItem,
  TextField, Typography,
} from "@mui/material";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface Category {
  id: string;
  slug: string;
  name: string;
  domain: string;
  parent_id: string | null;
}

function buildTree(categories: Category[]) {
  const map = new Map(categories.map((c) => [c.id, { ...c, children: [] as any[] }]));
  const roots: any[] = [];
  for (const node of map.values()) {
    if (node.parent_id && map.has(node.parent_id)) {
      map.get(node.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

function CategoryNode({ node, allCategories, depth = 0 }: { node: any; allCategories: Category[]; depth?: number }) {
  const updateAction = updateCategory.bind(null, node.id);

  const isRoot = depth === 0;

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          py: isRoot ? 2 : 1.5,
          pl: isRoot ? 1.5 : depth * 3,
          ...(isRoot && {
            bgcolor: "grey.100",
            borderLeft: "3px solid",
            borderColor: "primary.main",
            borderRadius: 1,
            mb: 0.5,
          }),
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              variant={isRoot ? "subtitle1" : "body1"}
              sx={{ fontWeight: isRoot ? 700 : 400, letterSpacing: isRoot ? 0.3 : 0 }}
            >
              {node.name}
            </Typography>
            <Chip label={node.domain} size="small" variant="outlined" sx={{ fontSize: 10 }} />
            <Typography variant="caption" color="text.secondary">
              {node.slug}
            </Typography>
          </Box>
        </Box>

        {/* 수정 인라인 폼 */}
        <Box component="form" action={updateAction} sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <TextField name="name" defaultValue={node.name} size="small" sx={{ width: 140 }} />
          <TextField name="domain" select defaultValue={node.domain} size="small" sx={{ width: 110 }}>
            <MenuItem value="computer">computer</MenuItem>
            <MenuItem value="language">language</MenuItem>
          </TextField>
          <TextField name="parentId" select defaultValue={node.parent_id ?? ""} size="small" sx={{ width: 140 }}>
            <MenuItem value="">— 최상위 —</MenuItem>
            {allCategories
              .filter((c) => c.id !== node.id)
              .map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
              ))}
          </TextField>
          <Button type="submit" size="small" variant="outlined">저장</Button>
        </Box>

        <DeleteCategoryButton id={node.id} name={node.name} />
      </Box>

      {node.children.map((child: any) => (
        <CategoryNode key={child.id} node={child} allCategories={allCategories} depth={depth + 1} />
      ))}
    </Box>
  );
}

export default async function CategoriesPage() {
  const { data: categories } = await supabaseAdmin
    .from("categories")
    .select("id, slug, name, domain, parent_id")
    .order("name");

  const all = (categories ?? []) as Category[];
  const tree = buildTree(all);

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>카테고리 관리</Typography>
        <Link href="/admin" style={{ textDecoration: "none" }}>
          <Button variant="outlined">← Admin</Button>
        </Link>
      </Box>

      {/* 새 카테고리 추가 */}
      <Box component="form" action={createCategory} sx={{ display: "flex", gap: 2, mb: 4, alignItems: "flex-start" }}>
        <TextField name="name" label="이름" size="small" required sx={{ width: 180 }} />
        <TextField name="domain" select label="도메인" size="small" defaultValue="computer" sx={{ width: 120 }}>
          <MenuItem value="computer">computer</MenuItem>
          <MenuItem value="language">language</MenuItem>
        </TextField>
        <TextField name="parentId" select label="상위 카테고리" size="small" defaultValue="" sx={{ width: 180 }}>
          <MenuItem value="">— 최상위 —</MenuItem>
          {all.map((c) => (
            <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
          ))}
        </TextField>
        <Button type="submit" variant="contained" size="medium">+ 추가</Button>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* 카테고리 트리 */}
      {tree.length === 0 ? (
        <Typography color="text.secondary">카테고리가 없습니다.</Typography>
      ) : (
        tree.map((node) => (
          <Box key={node.id}>
            <CategoryNode node={node} allCategories={all} />
            <Divider />
          </Box>
        ))
      )}
    </Container>
  );
}
