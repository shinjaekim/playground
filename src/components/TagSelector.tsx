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
  TextField,
} from "@mui/material";
import type { Tag } from "@/lib/posts";

interface Props {
  allTags: Tag[];
  initialSelected?: Tag[];
  createTagInline: (name: string) => Promise<Tag>;
}

export default function TagSelector({ allTags, initialSelected = [], createTagInline }: Props) {
  const [tags, setTags] = useState<Tag[]>(allTags);
  const [selected, setSelected] = useState<Tag[]>(initialSelected);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [isPending, startTransition] = useTransition();

  const openCreateDialog = (inputValue: string) => {
    setNewTagName(inputValue);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    startTransition(async () => {
      const newTag = await createTagInline(newTagName);
      setTags((prev) => [...prev, newTag]);
      setSelected((prev) => [...prev, newTag]);
      setDialogOpen(false);
      setNewTagName("");
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
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            label="태그 이름"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            helperText={`slug: ${newTagName.toLowerCase().replace(/\s+/g, "-")}`}
            fullWidth
          />
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
