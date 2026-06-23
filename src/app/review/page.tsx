import { getAllPostMeta, getCategories } from "@/lib/posts";
import ReviewDashboard from "@/components/ReviewDashboard";

export const revalidate = 60;

export default async function ReviewPage() {
  const [posts, categories] = await Promise.all([getAllPostMeta(), getCategories()]);
  return <ReviewDashboard posts={posts} categories={categories} />;
}
