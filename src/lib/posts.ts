import { remark } from "remark";
import html from "remark-html";
import { supabase } from "./supabase";

export interface Tag {
  id: string;
  slug: string;
  name: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  parent_id: string | null;
}

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  tags: Tag[];
  category_id: string | null;
  review_count: number;
  last_reviewed_at: string | null;
  next_review_at: string | null;
}

export function getReviewStatus(nextReviewAt: string | null): "due" | "upcoming" | "ok" {
  if (!nextReviewAt) return "due";
  const next = new Date(nextReviewAt);
  const now = new Date();
  if (next <= now) return "due";
  if (next <= new Date(now.getTime() + 3 * 86400000)) return "upcoming";
  return "ok";
}

export interface Post extends PostMeta {
  contentHtml: string;
}

export interface GraphData {
  nodes: { id: string; name: string; count: number }[];
  links: { source: string; target: string }[];
}

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, name, parent_id")
    .order("name");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export function getCategoryDescendantIds(categories: Category[], rootId: string): string[] {
  const ids = [rootId];
  for (const cat of categories) {
    if (cat.parent_id === rootId) {
      ids.push(...getCategoryDescendantIds(categories, cat.id));
    }
  }
  return ids;
}

export async function getAllPostMeta(): Promise<PostMeta[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("slug, title, date, category_id, review_count, last_reviewed_at, next_review_at, post_tags(tags(id, slug, name))")
    .order("date", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((post: any) => ({
    slug: post.slug,
    title: post.title,
    date: post.date,
    category_id: post.category_id ?? null,
    review_count: post.review_count ?? 0,
    last_reviewed_at: post.last_reviewed_at ?? null,
    next_review_at: post.next_review_at ?? null,
    tags: (post.post_tags ?? []).map((pt: any) => pt.tags).filter(Boolean),
  }));
}

export async function getPost(slug: string): Promise<Post> {
  const { data, error } = await supabase
    .from("posts")
    .select("slug, title, date, content, category_id, review_count, last_reviewed_at, next_review_at, post_tags(tags(id, slug, name))")
    .eq("slug", slug)
    .single();

  if (error) throw new Error(error.message);

  const processed = await remark().use(html).process(data.content);
  return {
    slug: data.slug,
    title: data.title,
    date: data.date,
    category_id: data.category_id ?? null,
    review_count: data.review_count ?? 0,
    last_reviewed_at: data.last_reviewed_at ?? null,
    next_review_at: data.next_review_at ?? null,
    tags: (data.post_tags ?? []).map((pt: any) => pt.tags).filter(Boolean),
    contentHtml: processed.toString(),
  };
}

export async function getReviewDueCount(): Promise<number> {
  const { count, error } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true })
    .lte("next_review_at", new Date().toISOString());
  if (error) return 0;
  return count ?? 0;
}

export async function getRelatedPosts(slug: string, tagIds: string[], limit = 4): Promise<PostMeta[]> {
  if (tagIds.length === 0) return [];

  const { data: links } = await supabase
    .from("post_tags")
    .select("post_id")
    .in("tag_id", tagIds);

  if (!links || links.length === 0) return [];

  const postIds = [...new Set(links.map((l: any) => l.post_id))];

  const { data, error } = await supabase
    .from("posts")
    .select("slug, title, date, category_id, review_count, last_reviewed_at, next_review_at, post_tags(tags(id, slug, name))")
    .in("id", postIds)
    .neq("slug", slug)
    .order("date", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map((post: any) => ({
    slug: post.slug,
    title: post.title,
    date: post.date,
    category_id: post.category_id ?? null,
    review_count: post.review_count ?? 0,
    last_reviewed_at: post.last_reviewed_at ?? null,
    next_review_at: post.next_review_at ?? null,
    tags: (post.post_tags ?? []).map((pt: any) => pt.tags).filter(Boolean),
  }));
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
