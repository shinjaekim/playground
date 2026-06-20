"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useRef, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { Box, Chip, Paper, Typography } from "@mui/material";
import type { GraphData } from "@/lib/posts";

type NodeObject = GraphData["nodes"][number] & { x?: number; y?: number; color?: string };
type LinkObject = GraphData["links"][number];

export default function MindMap({ data }: { data: GraphData }) {
  const router = useRouter();
  const [hovered, setHovered] = useState<NodeObject | null>(null);

  const connectedIds = useMemo(() => {
    if (!hovered) return null;
    const ids = new Set<string>([hovered.id]);
    for (const link of data.links) {
      const src = typeof link.source === "object" ? (link.source as NodeObject).id : link.source;
      const tgt = typeof link.target === "object" ? (link.target as NodeObject).id : link.target;
      if (src === hovered.id || tgt === hovered.id) {
        ids.add(src);
        ids.add(tgt);
      }
    }
    return ids;
  }, [hovered, data.links]);

  const handleNodeHover = useCallback((node: NodeObject | null) => {
    setHovered(node);
  }, []);

  const handleNodeClick = useCallback(
    (node: NodeObject) => {
      router.push(`/posts/${node.id}`);
    },
    [router]
  );

  const nodeCanvasObject = useCallback(
    (node: NodeObject, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const isHovered = hovered?.id === node.id;
      const isConnected = connectedIds ? connectedIds.has(node.id) : true;
      const dimmed = connectedIds && !isConnected;

      const radius = isHovered ? 9 : 6;
      const alpha = dimmed ? 0.12 : 1;
      const baseColor = node.color ?? "#4fc3f7";

      ctx.save();
      ctx.globalAlpha = alpha;

      if (isHovered) {
        ctx.beginPath();
        ctx.arc(node.x!, node.y!, radius + 5, 0, 2 * Math.PI);
        ctx.fillStyle = baseColor + "33";
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(node.x!, node.y!, radius, 0, 2 * Math.PI);
      ctx.fillStyle = baseColor;
      ctx.fill();

      const fontSize = (isHovered ? 13 : 11) / globalScale;
      ctx.font = `${isHovered ? "bold " : ""}${fontSize}px Sans-Serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(node.name, node.x!, node.y! + radius + fontSize);

      ctx.restore();
    },
    [hovered, connectedIds]
  );

  const linkColor = useCallback(
    (link: LinkObject) => {
      if (!connectedIds) return "#555";
      const src = typeof link.source === "object" ? (link.source as NodeObject).id : link.source;
      const tgt = typeof link.target === "object" ? (link.target as NodeObject).id : link.target;
      return connectedIds.has(src) && connectedIds.has(tgt) ? "#aaa" : "#1e1e1e";
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
        onNodeHover={handleNodeHover}
        onNodeClick={handleNodeClick}
        nodeCanvasObject={nodeCanvasObject}
        nodeCanvasObjectMode={() => "replace"}
      />

      {hovered && (
        <Paper
          elevation={4}
          sx={{
            position: "absolute",
            bottom: 32,
            right: 32,
            p: 2.5,
            minWidth: 220,
            maxWidth: 300,
            background: "#1a1a1a",
            color: "#fff",
            border: "1px solid #333",
            pointerEvents: "none",
          }}
        >
          <Typography variant="subtitle2" color="grey.500" sx={{ mb: 0.5 }}>
            클릭하면 글로 이동
          </Typography>
          <Typography variant="h6" sx={{ mb: 1 }}>
            {hovered.name}
          </Typography>
          <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
            {hovered.tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                sx={{ background: "#333", color: "#ccc", fontSize: 11 }}
              />
            ))}
          </Box>
        </Paper>
      )}
    </Box>
  );
}
