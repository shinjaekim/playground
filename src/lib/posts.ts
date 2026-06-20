import { remark } from "remark";
import html from "remark-html";
import { supabase } from "./supabase";

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  links: string[];
}

export interface Post extends PostMeta {
  contentHtml: string;
}

export interface GraphData {
  nodes: { id: string; name: string }[];
  links: { source: string; target: string }[];
}

export async function getAllPostMeta(): Promise<PostMeta[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("slug, title, date, tags, links")
    .order("date", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getPost(slug: string): Promise<Post> {
  const { data, error } = await supabase
    .from("posts")
    .select("slug, title, date, tags, links, content")
    .eq("slug", slug)
    .single();

  if (error) throw new Error(error.message);

  const processed = await remark().use(html).process(data.content);
  return {
    slug: data.slug,
    title: data.title,
    date: data.date,
    tags: data.tags ?? [],
    links: data.links ?? [],
    contentHtml: processed.toString(),
  };
}

// 노드 = 태그, 엣지 = 같은 글에 함께 등장한 태그 쌍
export function buildGraphData(posts: PostMeta[]): GraphData {
  const tagSet = new Set<string>();
  for (const post of posts) {
    for (const tag of post.tags) tagSet.add(tag);
  }

  const nodes = Array.from(tagSet).map((tag) => ({ id: tag, name: tag }));

  const linkSet = new Set<string>();
  const links: GraphData["links"] = [];

  for (const post of posts) {
    for (let i = 0; i < post.tags.length; i++) {
      for (let j = i + 1; j < post.tags.length; j++) {
        const key = [post.tags[i], post.tags[j]].sort().join("--");
        if (!linkSet.has(key)) {
          linkSet.add(key);
          links.push({ source: post.tags[i], target: post.tags[j] });
        }
      }
    }
  }

  return { nodes, links };
}
