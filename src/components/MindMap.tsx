"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import ForceGraph2D from "react-force-graph-2d";
import type { GraphData } from "@/lib/posts";

export default function MindMap({ data }: { data: GraphData }) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100vh", background: "#0f0f0f" }}>
      <ForceGraph2D
        graphData={data}
        nodeLabel="name"
        nodeAutoColorBy="tags"
        nodeRelSize={6}
        linkColor={() => "#444"}
        onNodeClick={(node) => router.push(`/posts/${node.id}`)}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = node.name as string;
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          ctx.beginPath();
          ctx.arc(node.x!, node.y!, 6, 0, 2 * Math.PI);
          ctx.fillStyle = (node as { color?: string }).color ?? "#4fc3f7";
          ctx.fill();

          ctx.fillStyle = "#ffffff";
          ctx.fillText(label, node.x!, node.y! + 12);
        }}
      />
    </div>
  );
}
