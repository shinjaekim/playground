"use client";

import { useState, useEffect, useRef } from "react";
import { Dialog, Box, InputBase, Divider, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

interface SearchPost {
  slug: string;
  title: string;
  tags: { name: string }[];
}

export default function SearchModal() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState<SearchPost[]>([]);
  const [selected, setSelected] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const fetchedRef = useRef(false);

  async function fetchPosts() {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    const res = await fetch("/api/search");
    const data = await res.json();
    setPosts(data);
  }

  // Cmd+K / Ctrl+K 글로벌 단축키
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        fetchPosts();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const results =
    query.trim() === ""
      ? []
      : posts
          .filter((p) => {
            const q = query.toLowerCase();
            return (
              p.title.toLowerCase().includes(q) ||
              p.tags.some((t) => t.name.toLowerCase().includes(q))
            );
          })
          .slice(0, 8);

  // 모달 열릴 때 인풋 포커스
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  // 쿼리 바뀌면 선택 초기화
  useEffect(() => {
    setSelected(0);
  }, [query]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
    } else if (e.key === "Enter" && results[selected]) {
      router.push(`/posts/${results[selected].slug}`);
      handleClose();
    }
  }

  function handleClose() {
    setOpen(false);
    setQuery("");
    setSelected(0);
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      slotProps={{
        paper: { sx: { width: 500, maxWidth: "90vw", m: 2, borderRadius: 2, overflow: "hidden" } },
      }}
    >
      <Box sx={{ px: 2, py: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
        <InputBase
          inputRef={inputRef}
          fullWidth
          placeholder="제목 또는 태그로 검색..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          sx={{ fontSize: "1rem" }}
        />
        <Typography variant="caption" color="text.disabled" sx={{ flexShrink: 0 }}>
          ESC
        </Typography>
      </Box>

      {results.length > 0 && (
        <>
          <Divider />
          <Box>
            {results.map((post, i) => (
              <Box
                key={post.slug}
                onClick={() => {
                  router.push(`/posts/${post.slug}`);
                  handleClose();
                }}
                sx={{
                  px: 2,
                  py: 1.25,
                  cursor: "pointer",
                  bgcolor: selected === i ? "action.selected" : "transparent",
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {post.title}
                </Typography>
                {post.tags.length > 0 && (
                  <Typography variant="caption" color="text.secondary">
                    {post.tags.map((t) => t.name).join(" · ")}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        </>
      )}

      {query.trim() !== "" && results.length === 0 && (
        <>
          <Divider />
          <Box sx={{ px: 2, py: 2 }}>
            <Typography variant="body2" color="text.secondary">
              검색 결과가 없습니다.
            </Typography>
          </Box>
        </>
      )}
    </Dialog>
  );
}
