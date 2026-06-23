"use client";

import { useState } from "react";
import { Box, Tab, Tabs, TextField, Typography } from "@mui/material";
import Markdown from "react-markdown";

interface Props {
  defaultValue?: string;
}

export default function MarkdownEditor({ defaultValue = "" }: Props) {
  const [tab, setTab] = useState(0);
  const [content, setContent] = useState(defaultValue);

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.5 }}>
        <Typography variant="body2" color="text.secondary">
          내용 (Markdown)
        </Typography>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ minHeight: 32 }}>
          <Tab label="작성" sx={{ minHeight: 32, py: 0.5, fontSize: 13 }} />
          <Tab label="미리보기" sx={{ minHeight: 32, py: 0.5, fontSize: 13 }} />
        </Tabs>
      </Box>

      {/* display:none으로 DOM에 유지 → form 제출 시 값 포함됨 */}
      <Box sx={{ display: tab === 0 ? "block" : "none" }}>
        <TextField
          name="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          fullWidth
          multiline
          minRows={16}
          slotProps={{ input: { sx: { fontFamily: "monospace", fontSize: 14 } } }}
        />
      </Box>

      {tab === 1 && (
        <Box
          sx={{
            minHeight: 420,
            p: 2.5,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            "& h1": { fontSize: "1.75rem", fontWeight: 700, mt: 2, mb: 1 },
            "& h2": { fontSize: "1.4rem", fontWeight: 600, mt: 2, mb: 1 },
            "& h3": { fontSize: "1.15rem", fontWeight: 600, mt: 1.5, mb: 0.5 },
            "& p": { mb: 1.5, lineHeight: 1.75 },
            "& ul, & ol": { pl: 3, mb: 1.5 },
            "& li": { mb: 0.5 },
            "& code": {
              fontFamily: "monospace",
              fontSize: "0.875em",
              bgcolor: "action.hover",
              px: 0.6,
              py: 0.2,
              borderRadius: 0.5,
            },
            "& pre": {
              bgcolor: "action.hover",
              p: 2,
              borderRadius: 1,
              overflow: "auto",
              mb: 1.5,
              "& code": { bgcolor: "transparent", p: 0 },
            },
            "& blockquote": {
              borderLeft: "3px solid",
              borderColor: "divider",
              pl: 2,
              ml: 0,
              color: "text.secondary",
            },
            "& a": { color: "primary.main" },
            "& hr": { my: 2, borderColor: "divider" },
          }}
        >
          {content.trim() ? (
            <Markdown>{content}</Markdown>
          ) : (
            <Typography color="text.disabled" variant="body2">
              내용을 입력하면 여기서 미리볼 수 있습니다.
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
}
