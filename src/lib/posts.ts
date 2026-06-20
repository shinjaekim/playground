import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

const contentDir = path.join(process.cwd(), "content");

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
  nodes: { id: string; name: string; tags: string[] }[];
  links: { source: string; target: string }[];
}

export function getAllPostMeta(): PostMeta[] {
  const files = fs.readdirSync(contentDir).filter((f) => f.endsWith(".md"));
  return files.map((filename) => {
    const slug = filename.replace(/\.md$/, "");
    const raw = fs.readFileSync(path.join(contentDir, filename), "utf8");
    const { data } = matter(raw);
    return {
      slug,
      title: data.title ?? slug,
      date: data.date ?? "",
      tags: data.tags ?? [],
      links: data.links ?? [],
    };
  });
}

export async function getPost(slug: string): Promise<Post> {
  const raw = fs.readFileSync(path.join(contentDir, `${slug}.md`), "utf8");
  const { data, content } = matter(raw);
  const processed = await remark().use(html).process(content);
  return {
    slug,
    title: data.title ?? slug,
    date: data.date ?? "",
    tags: data.tags ?? [],
    links: data.links ?? [],
    contentHtml: processed.toString(),
  };
}

export function buildGraphData(posts: PostMeta[]): GraphData {
  const slugSet = new Set(posts.map((p) => p.slug));
  const linkSet = new Set<string>();
  const links: GraphData["links"] = [];

  const addLink = (source: string, target: string) => {
    const key = [source, target].sort().join("--");
    if (!linkSet.has(key)) {
      linkSet.add(key);
      links.push({ source, target });
    }
  };

  // explicit links from frontmatter
  for (const post of posts) {
    for (const target of post.links) {
      if (slugSet.has(target)) addLink(post.slug, target);
    }
  }

  // implicit links: posts sharing a tag
  const tagMap = new Map<string, string[]>();
  for (const post of posts) {
    for (const tag of post.tags) {
      const group = tagMap.get(tag) ?? [];
      group.push(post.slug);
      tagMap.set(tag, group);
    }
  }
  for (const slugs of tagMap.values()) {
    for (let i = 0; i < slugs.length; i++) {
      for (let j = i + 1; j < slugs.length; j++) {
        addLink(slugs[i], slugs[j]);
      }
    }
  }

  return {
    nodes: posts.map((p) => ({ id: p.slug, name: p.title, tags: p.tags })),
    links,
  };
}
