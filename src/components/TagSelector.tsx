"use client";

import { useState, useTransition } from "react";
import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
} from "@mui/material";
import type { Tag } from "@/lib/posts";

interface Category {
  id: string;
  slug: string;
  name: string;
}

interface Props {
  allTags: Tag[];
  allCategories: Category[];
  initialSelected?: Tag[];
  createTagInline: (name: string, categoryId: string) => Promise<Tag>;
}

export default function TagSelector({
  allTags,
  allCategories,
  initialSelected = [],
  createTagInline,
}: Props) {
  const [tags, setTags] = useState<Tag[]>(allTags);
  const [selected, setSelected] = useState<Tag[]>(initialSelected);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagCategory, setNewTagCategory] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSelect = (_: unknown, value: Tag[]) => setSelected(value);

  const openCreateDialog = (inputValue: string) => {
    setNewTagName(inputValue);
    setNewTagCategory("");
    setDialogOpen(true);
  };

  const handleCreate = () => {
    startTransition(async () => {
      const newTag = await createTagInline(newTagName, newTagCategory);
      setTags((prev) => [...prev, newTag]);
      setSelected((prev) => [...prev, newTag]);
      setDialogOpen(false);
      setNewTagName("");
      setNewTagCategory("");
    });
  };

  return (
    <Box>
      {selected.map((tag) => (
        <input type="hidden" name="tagIds" value={tag.id} key={tag.id} />
      ))}

      <Autocomplete
        multiple
        options={tags}
        getOptionLabel={(option) => option.name}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        value={selected}
        filterOptions={(options, { inputValue }) => {
          const filtered = options.filter(
            (o) =>
              o.name.toLowerCase().includes(inputValue.toLowerCase()) ||
              o.slug.includes(inputValue.toLowerCase())
          );
          const exactMatch = options.some(
            (o) => o.slug === inputValue.toLowerCase().replace(/\s+/g, "-")
          );
          if (inputValue && !exactMatch) {
            filtered.push({ id: "__new__", slug: "__new__", name: `"${inputValue}" 새 태그 만들기` });
          }
          return filtered;
        }}
        onChange={(_, value) => {
          const hasNew = value.find((v) => v.id === "__new__");
          if (hasNew) {
            const inputValue = hasNew.name.replace(/^"(.+)" 새 태그 만들기$/, "$1");
            openCreateDialog(inputValue);
          } else {
            setSelected(value);
          }
        }}
        renderInput={(params) => <TextField {...params} label="태그" />}
      />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>새 태그 만들기</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
          <TextField
            label="태그 이름"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            helperText={`slug: ${newTagName.toLowerCase().replace(/\s+/g, "-")}`}
            fullWidth
          />
          <TextField
            select
            label="카테고리"
            value={newTagCategory}
            onChange={(e) => setNewTagCategory(e.target.value)}
            fullWidth
          >
            <MenuItem value="">— 미지정 —</MenuItem>
            {allCategories.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                {cat.name}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>취소</Button>
          <Button
            onClick={handleCreate}
            variant="contained"
            disabled={!newTagName.trim() || isPending}
            startIcon={isPending ? <CircularProgress size={14} /> : null}
          >
            만들기
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
