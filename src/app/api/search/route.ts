import { getAllPostMeta } from "@/lib/posts";
import { NextResponse } from "next/server";

export const revalidate = 60;

export async function GET() {
  const posts = await getAllPostMeta();
  return NextResponse.json(
    posts.map((p) => ({
      slug: p.slug,
      title: p.title,
      tags: p.tags.map((t) => ({ name: t.name })),
    }))
  );
}
