import MindMapWrapper from "@/components/MindMapWrapper";
import { getAllPostMeta, buildGraphData } from "@/lib/posts";

export default function GraphPage() {
  const posts = getAllPostMeta();
  const graphData = buildGraphData(posts);

  return <MindMapWrapper data={graphData} />;
}
