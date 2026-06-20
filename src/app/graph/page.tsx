import MindMapWrapper from "@/components/MindMapWrapper";
import { getAllPostMeta, buildGraphData } from "@/lib/posts";

export default function GraphPage() {
  const posts = getAllPostMeta();
  const graphData = buildGraphData(posts);

  return (
    <div style={{ height: "calc(100vh - 56px)" }}>
      <MindMapWrapper data={graphData} posts={posts} />
    </div>
  );
}
