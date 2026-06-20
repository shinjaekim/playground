import { remark } from "remark";
import html from "remark-html";
import { supabase } from "./supabase";

export interface Tag {
  id: string;
  slug: string;
  name: string;
}

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  tags: Tag[];
}

export interface Post extends PostMeta {
  contentHtml: string;
}

export interface GraphData {
  nodes: { id: string; name: string; count: number }[];
  links: { source: string; target: string }[];
}

export async function getAllPostMeta(): Promise<PostMeta[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("slug, title, date, post_tags(tags(id, slug, name))")
    .order("date", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((post: any) => ({
    slug: post.slug,
    title: post.title,
    date: post.date,
    tags: (post.post_tags ?? []).map((pt: any) => pt.tags).filter(Boolean),
  }));
}

export async function getPost(slug: string): Promise<Post> {
  const { data, error } = await supabase
    .from("posts")
    .select("slug, title, date, content, post_tags(tags(id, slug, name))")
    .eq("slug", slug)
    .single();

  if (error) throw new Error(error.message);

  const processed = await remark().use(html).process(data.content);
  return {
    slug: data.slug,
    title: data.title,
    date: data.date,
    tags: (data.post_tags ?? []).map((pt: any) => pt.tags).filter(Boolean),
    contentHtml: processed.toString(),
  };
}

export function buildGraphData(posts: PostMeta[]): GraphData {
  const tagMap = new Map<string, { count: number; name: string }>();
  for (const post of posts) {
    for (const tag of post.tags) {
      const existing = tagMap.get(tag.slug);
      if (existing) {
        existing.count++;
      } else {
        tagMap.set(tag.slug, { count: 1, name: tag.name });
      }
    }
  }

  const nodes = Array.from(tagMap.entries()).map(([slug, { count, name }]) => ({
    id: slug,
    name,
    count,
  }));

  const linkSet = new Set<string>();
  const links: GraphData["links"] = [];

  for (const post of posts) {
    for (let i = 0; i < post.tags.length; i++) {
      for (let j = i + 1; j < post.tags.length; j++) {
        const key = [post.tags[i].slug, post.tags[j].slug].sort().join("--");
        if (!linkSet.has(key)) {
          linkSet.add(key);
          links.push({ source: post.tags[i].slug, target: post.tags[j].slug });
        }
      }
    }
  }

  return { nodes, links };
}
