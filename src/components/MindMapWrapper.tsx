"use client";

import dynamic from "next/dynamic";
import type { GraphData } from "@/lib/posts";

const MindMap = dynamic(() => import("@/components/MindMap"), { ssr: false });

export default function MindMapWrapper({ data }: { data: GraphData }) {
  return <MindMap data={data} />;
}
