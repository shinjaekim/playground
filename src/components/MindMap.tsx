"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { Box, Chip, Divider, List, ListItemButton, ListItemText, Paper, Typography } from "@mui/material";
import type { GraphData, PostMeta } from "@/lib/posts";

type NodeObject = { id: string; name: string; count: number; x?: number; y?: number; color?: string };
type LinkObject = GraphData["links"][number];

const NODE_COLOR = "#4fc3f7";
const NODE_COLOR_HOVER = "#81d4fa";

export default function MindMap({ data, posts }: { data: GraphData; posts: PostMeta[] }) {
  const router = useRouter();
  const [hovered, setHovered] = useState<NodeObject | null>(null);
  const [selected, setSelected] = useState<NodeObject | null>(null);

  const connectedIds = useMemo(() => {
    const source = hovered ?? selected;
    if (!source) return null;
    const ids = new Set<string>([source.id]);
    for (const link of data.links) {
      const src = typeof link.source === "object" ? (link.source as NodeObject).id : link.source;
      const tgt = typeof link.target === "object" ? (link.target as NodeObject).id : link.target;
      if (src === source.id || tgt === source.id) {
        ids.add(src);
        ids.add(tgt);
      }
    }
    return ids;
  }, [hovered, selected, data.links]);

  const relatedPosts = useMemo(() => {
    if (!selected) return [];
    return posts.filter((p) => p.tags.includes(selected.id));
  }, [selected, posts]);

  const nodeCanvasObject = useCallback(
    (node: NodeObject, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const isActive = hovered?.id === node.id || selected?.id === node.id;
      const isConnected = connectedIds ? connectedIds.has(node.id) : true;
      const dimmed = connectedIds && !isConnected;

      // 기본 반지름: 글 수가 많을수록 로그 스케일로 커짐
      const baseRadius = 2 + Math.log((node.count ?? 1) + 1) * 2;
      const radius = isActive ? baseRadius + 3 : baseRadius;
      const alpha = dimmed ? 0.12 : 1;

      ctx.save();
      ctx.globalAlpha = alpha;

      if (isActive) {
        ctx.beginPath();
        ctx.arc(node.x!, node.y!, radius + 5, 0, 2 * Math.PI);
        ctx.fillStyle = NODE_COLOR + "33";
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(node.x!, node.y!, radius, 0, 2 * Math.PI);
      ctx.fillStyle = isActive ? NODE_COLOR_HOVER : NODE_COLOR;
      ctx.fill();

      const fontSize = (isActive ? 13 : 11) / globalScale;
      ctx.font = `${isActive ? "bold " : ""}${fontSize}px Sans-Serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(node.name, node.x!, node.y! + radius + fontSize);

      ctx.restore();
    },
    [hovered, selected, connectedIds]
  );

  const linkColor = useCallback(
    (link: LinkObject) => {
      if (!connectedIds) return "#333";
      const src = typeof link.source === "object" ? (link.source as NodeObject).id : link.source;
      const tgt = typeof link.target === "object" ? (link.target as NodeObject).id : link.target;
      return connectedIds.has(src) && connectedIds.has(tgt) ? "#888" : "#1a1a1a";
    },
    [connectedIds]
  );

  return (
    <Box sx={{ position: "relative", width: "100%", height: "100%", background: "#0f0f0f" }}>
      <ForceGraph2D
        graphData={data}
        nodeLabel=""
        nodeRelSize={6}
        linkColor={linkColor}
        onNodeHover={(node) => setHovered(node as NodeObject | null)}
        onNodeClick={(node) => {
          const n = node as NodeObject;
          setSelected((prev) => (prev?.id === n.id ? null : n));
        }}
        onBackgroundClick={() => setSelected(null)}
        nodeCanvasObject={nodeCanvasObject}
        nodeCanvasObjectMode={() => "replace"}
      />

      {/* hover 툴팁 */}
      {hovered && !selected && (
        <Paper
          sx={{
            position: "absolute",
            bottom: 32,
            right: 32,
            px: 2,
            py: 1,
            background: "#1a1a1a",
            color: "#fff",
            border: "1px solid #333",
            pointerEvents: "none",
          }}
        >
          <Typography variant="body2" color="grey.400">
            클릭하면 관련 글 보기
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {hovered.name}
          </Typography>
          <Typography variant="caption" color="grey.500">
            글 {hovered.count}개
          </Typography>
        </Paper>
      )}

      {/* 클릭 시 관련 글 목록 패널 */}
      {selected && (
        <Paper
          elevation={6}
          sx={{
            position: "absolute",
            top: 24,
            right: 24,
            width: 280,
            maxHeight: "80vh",
            overflow: "auto",
            background: "#1a1a1a",
            color: "#fff",
            border: "1px solid #333",
          }}
        >
          <Box sx={{ px: 2.5, pt: 2.5, pb: 1.5 }}>
            <Typography variant="caption" color="grey.500">
              태그
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {selected.name}
            </Typography>
            <Typography variant="caption" color="grey.500">
              관련 글 {relatedPosts.length}개
            </Typography>
          </Box>
          <Divider sx={{ borderColor: "#333" }} />
          <List dense disablePadding>
            {relatedPosts.map((post) => (
              <ListItemButton
                key={post.slug}
                onClick={() => router.push(`/posts/${post.slug}`)}
                sx={{ "&:hover": { background: "#2a2a2a" } }}
              >
                <Box sx={{ py: 0.5 }}>
                  <Typography variant="body2" sx={{ color: "#fff" }}>
                    {post.title}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 0.5 }}>
                    {post.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: 10,
                          background: tag === selected.id ? "#1565c0" : "#2a2a2a",
                          color: "#ccc",
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </ListItemButton>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
}
