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
  nodes: { id: string; name: string }[];
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
