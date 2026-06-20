"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "./supabase-admin";

export async function createPost(formData: FormData) {
  const slug = String(formData.get("slug")).trim();
  const title = String(formData.get("title")).trim();
  const date = String(formData.get("date")).trim();
  const tags = String(formData.get("tags"))
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const links = String(formData.get("links"))
    .split(",")
    .map((l) => l.trim())
    .filter(Boolean);
  const content = String(formData.get("content")).trim();

  const { error } = await supabaseAdmin
    .from("posts")
    .insert({ slug, title, date, tags, links, content });

  if (error) throw new Error(error.message);

  revalidatePath("/posts");
  revalidatePath("/graph");
  revalidatePath("/admin");
  redirect("/admin");
}

export async function updatePost(slug: string, formData: FormData) {
  const title = String(formData.get("title")).trim();
  const date = String(formData.get("date")).trim();
  const tags = String(formData.get("tags"))
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const links = String(formData.get("links"))
    .split(",")
    .map((l) => l.trim())
    .filter(Boolean);
  const content = String(formData.get("content")).trim();

  const { error } = await supabaseAdmin
    .from("posts")
    .update({ title, date, tags, links, content, updated_at: new Date().toISOString() })
    .eq("slug", slug);

  if (error) throw new Error(error.message);

  revalidatePath("/posts");
  revalidatePath("/graph");
  revalidatePath(`/posts/${slug}`);
  revalidatePath("/admin");
  redirect("/admin");
}

export async function deletePost(slug: string) {
  const { error } = await supabaseAdmin
    .from("posts")
    .update({ is_deleted: true, updated_at: new Date().toISOString() })
    .eq("slug", slug);

  if (error) throw new Error(error.message);

  revalidatePath("/posts");
  revalidatePath("/graph");
  revalidatePath("/admin");
}
