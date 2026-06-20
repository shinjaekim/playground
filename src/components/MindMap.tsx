"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useRef, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { Box, Button, Chip, Paper, Typography } from "@mui/material";
import type { GraphData } from "@/lib/posts";

type NodeObject = GraphData["nodes"][number] & { x?: number; y?: number; color?: string };
type LinkObject = GraphData["links"][number];

export default function MindMap({ data }: { data: GraphData }) {
  const router = useRouter();
  const [selected, setSelected] = useState<NodeObject | null>(null);

  const connectedIds = useMemo(() => {
    if (!selected) return null;
    const ids = new Set<string>([selected.id]);
    for (const link of data.links) {
      const src = typeof link.source === "object" ? (link.source as NodeObject).id : link.source;
      const tgt = typeof link.target === "object" ? (link.target as NodeObject).id : link.target;
      if (src === selected.id || tgt === selected.id) {
        ids.add(src);
        ids.add(tgt);
      }
    }
    return ids;
  }, [selected, data.links]);

  const handleNodeClick = useCallback((node: NodeObject) => {
    setSelected((prev) => (prev?.id === node.id ? null : node));
  }, []);

  const handleBackgroundClick = useCallback(() => {
    setSelected(null);
  }, []);

  const nodeCanvasObject = useCallback(
    (node: NodeObject, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const isSelected = selected?.id === node.id;
      const isConnected = connectedIds ? connectedIds.has(node.id) : true;
      const dimmed = connectedIds && !isConnected;

      const radius = isSelected ? 9 : 6;
      const alpha = dimmed ? 0.15 : 1;
      const baseColor = node.color ?? "#4fc3f7";

      ctx.save();
      ctx.globalAlpha = alpha;

      // 선택된 노드 글로우
      if (isSelected) {
        ctx.beginPath();
        ctx.arc(node.x!, node.y!, radius + 4, 0, 2 * Math.PI);
        ctx.fillStyle = baseColor + "44";
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(node.x!, node.y!, radius, 0, 2 * Math.PI);
      ctx.fillStyle = baseColor;
      ctx.fill();

      const fontSize = (isSelected ? 13 : 11) / globalScale;
      ctx.font = `${isSelected ? "bold " : ""}${fontSize}px Sans-Serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(node.name, node.x!, node.y! + radius + fontSize);

      ctx.restore();
    },
    [selected, connectedIds]
  );

  const linkColor = useCallback(
    (link: LinkObject) => {
      if (!connectedIds) return "#555";
      const src = typeof link.source === "object" ? (link.source as NodeObject).id : link.source;
      const tgt = typeof link.target === "object" ? (link.target as NodeObject).id : link.target;
      return connectedIds.has(src) && connectedIds.has(tgt) ? "#aaa" : "#222";
    },
    [connectedIds]
  );

  return (
    <Box sx={{ position: "relative", width: "100%", height: "100vh", background: "#0f0f0f" }}>
      <ForceGraph2D
        graphData={data}
        nodeLabel=""
        nodeAutoColorBy="tags"
        nodeRelSize={6}
        linkColor={linkColor}
        onNodeClick={handleNodeClick}
        onBackgroundClick={handleBackgroundClick}
        nodeCanvasObject={nodeCanvasObject}
        nodeCanvasObjectMode={() => "replace"}
      />

      {/* 선택된 노드 정보 패널 */}
      {selected && (
        <Paper
          elevation={4}
          sx={{
            position: "absolute",
            bottom: 32,
            right: 32,
            p: 3,
            minWidth: 240,
            maxWidth: 320,
            background: "#1a1a1a",
            color: "#fff",
            border: "1px solid #333",
          }}
        >
          <Typography variant="subtitle2" color="grey.500" gutterBottom>
            선택된 노드
          </Typography>
          <Typography variant="h6" gutterBottom>
            {selected.name}
          </Typography>
          <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mb: 2 }}>
            {selected.tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                sx={{ background: "#333", color: "#ccc", fontSize: 11 }}
              />
            ))}
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="contained"
              size="small"
              onClick={() => router.push(`/posts/${selected.id}`)}
            >
              글 보기
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setSelected(null)}
              sx={{ borderColor: "#555", color: "#aaa" }}
            >
              닫기
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
}
