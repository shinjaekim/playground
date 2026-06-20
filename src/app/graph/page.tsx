import MindMapWrapper from "@/components/MindMapWrapper";
import { getAllPostMeta, buildGraphData } from "@/lib/posts";

export const revalidate = 60;

export default async function GraphPage() {
  const posts = await getAllPostMeta();
  const graphData = buildGraphData(posts);

  return (
    <div style={{ height: "calc(100vh - 56px)" }}>
      <MindMapWrapper data={graphData} posts={posts} />
    </div>
  );
}
