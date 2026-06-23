"use client";

import { useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { deleteCategory } from "@/lib/actions";

export default function DeleteCategoryButton({ id, name }: { id: string; name: string }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleOpen() {
    setError(null);
    setOpen(true);
  }

  function handleClose() {
    if (loading) return;
    setOpen(false);
  }

  async function handleConfirm() {
    setLoading(true);
    setError(null);
    try {
      await deleteCategory(id);
      setOpen(false);
    } catch (e: any) {
      setError(e.message ?? "삭제 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button size="small" variant="outlined" color="error" onClick={handleOpen}>
        삭제
      </Button>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>카테고리 삭제</DialogTitle>
        <DialogContent sx={{ minWidth: 340 }}>
          {error ? (
            <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>
          ) : (
            <DialogContentText>
              <strong>{name}</strong> 카테고리를 삭제하시겠습니까?
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            {error ? "닫기" : "취소"}
          </Button>
          {!error && (
            <Button onClick={handleConfirm} color="error" disabled={loading}>
              {loading ? "삭제 중..." : "삭제"}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}
