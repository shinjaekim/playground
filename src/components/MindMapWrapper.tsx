"use client";

import dynamic from "next/dynamic";
import type { GraphData, PostMeta } from "@/lib/posts";

const MindMap = dynamic(() => import("@/components/MindMap"), { ssr: false });

export default function MindMapWrapper({ data, posts }: { data: GraphData; posts: PostMeta[] }) {
  return <MindMap data={data} posts={posts} />;
}
