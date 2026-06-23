"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "./supabase-admin";
import type { Tag } from "./posts";

// ─── Review ──────────────────────────────────────────────

const REVIEW_INTERVALS = [1, 3, 7, 14, 30, 60];

export async function markReviewed(slug: string) {
  const { data: post, error } = await supabaseAdmin
    .from("posts")
    .select("review_count, next_review_at")
    .eq("slug", slug)
    .single();

  if (error) throw new Error(error.message);

  const now = new Date();
  const currentCount = post.review_count ?? 0;
  const currentIntervalDays = REVIEW_INTERVALS[Math.min(currentCount, REVIEW_INTERVALS.length - 1)];

  // 기한 초과 여부: 현재 단계 인터벌보다 더 많이 밀렸으면 단계 올리지 않음
  const dueDate = post.next_review_at ? new Date(post.next_review_at) : now;
  const overdueDays = (now.getTime() - dueDate.getTime()) / 86400000;
  const isLate = overdueDays > currentIntervalDays;

  const nextIntervalDays = isLate
    ? currentIntervalDays // 늦었으면 같은 단계 다시
    : REVIEW_INTERVALS[Math.min(currentCount + 1, REVIEW_INTERVALS.length - 1)];

  const nextReviewAt = new Date(now.getTime() + nextIntervalDays * 86400000);

  const { error: updateError } = await supabaseAdmin
    .from("posts")
    .update({
      review_count: isLate ? currentCount : currentCount + 1,
      last_reviewed_at: now.toISOString(),
      next_review_at: nextReviewAt.toISOString(),
    })
    .eq("slug", slug);

  if (updateError) throw new Error(updateError.message);

  revalidatePath("/posts");
  revalidatePath("/review");
  revalidatePath(`/posts/${slug}`);
}

// ─── Posts ───────────────────────────────────────────────

export async function createPost(formData: FormData) {
  const slug = String(formData.get("slug")).trim();
  const title = String(formData.get("title")).trim();
  const date = String(formData.get("date")).trim();
  const content = String(formData.get("content")).trim();
  const categoryId = String(formData.get("categoryId")).trim() || null;
  const tagIds = formData.getAll("tagIds") as string[];

  const nextReviewAt = new Date(Date.now() + 86400000).toISOString();

  const { data: post, error } = await supabaseAdmin
    .from("posts")
    .insert({ slug, title, date, content, category_id: categoryId, next_review_at: nextReviewAt })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  if (tagIds.length > 0) {
    const { error: tagError } = await supabaseAdmin
      .from("post_tags")
      .insert(tagIds.map((tag_id) => ({ post_id: post.id, tag_id })));
    if (tagError) throw new Error(tagError.message);
  }

  revalidatePath("/posts");
  revalidatePath("/graph");
  revalidatePath("/admin");
  redirect("/admin");
}

export async function updatePost(slug: string, formData: FormData) {
  const title = String(formData.get("title")).trim();
  const date = String(formData.get("date")).trim();
  const content = String(formData.get("content")).trim();
  const categoryId = String(formData.get("categoryId")).trim() || null;
  const tagIds = formData.getAll("tagIds") as string[];

  const { data: post, error } = await supabaseAdmin
    .from("posts")
    .update({ title, date, content, category_id: categoryId, updated_at: new Date().toISOString() })
    .eq("slug", slug)
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  await supabaseAdmin.from("post_tags").delete().eq("post_id", post.id);

  if (tagIds.length > 0) {
    const { error: tagError } = await supabaseAdmin
      .from("post_tags")
      .insert(tagIds.map((tag_id) => ({ post_id: post.id, tag_id })));
    if (tagError) throw new Error(tagError.message);
  }

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

// ─── Tags ────────────────────────────────────────────────

export async function createTagInline(name: string): Promise<Tag> {
  const slug = name.toLowerCase().trim().replace(/\s+/g, "-");
  const { data, error } = await supabaseAdmin
    .from("tags")
    .insert({ name: name.trim(), slug })
    .select("id, slug, name")
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
  return data;
}

export async function createTagAdmin(formData: FormData) {
  const name = String(formData.get("name")).trim();
  const slug = name.toLowerCase().replace(/\s+/g, "-");

  const { error } = await supabaseAdmin.from("tags").insert({ name, slug });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/tags");
}

export async function updateTag(id: string, formData: FormData) {
  const name = String(formData.get("name")).trim();
  const slug = name.toLowerCase().replace(/\s+/g, "-");

  const { error } = await supabaseAdmin
    .from("tags")
    .update({ name, slug })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/tags");
  revalidatePath("/graph");
}

export async function deleteTag(id: string) {
  const { error } = await supabaseAdmin.from("tags").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/tags");
  revalidatePath("/graph");
}

// ─── Categories ──────────────────────────────────────────

export async function createCategory(formData: FormData) {
  const name = String(formData.get("name")).trim();
  const domain = String(formData.get("domain")).trim();
  const parentId = String(formData.get("parentId")).trim();
  const slug = name.toLowerCase().replace(/\s+/g, "-");

  const { error } = await supabaseAdmin.from("categories").insert({
    name,
    slug,
    domain,
    parent_id: parentId || null,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/categories");
}

export async function updateCategory(id: string, formData: FormData) {
  const name = String(formData.get("name")).trim();
  const domain = String(formData.get("domain")).trim();
  const parentId = String(formData.get("parentId")).trim();
  const slug = name.toLowerCase().replace(/\s+/g, "-");

  const { error } = await supabaseAdmin
    .from("categories")
    .update({ name, slug, domain, parent_id: parentId || null })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/categories");
}

export async function deleteCategory(id: string) {
  const [{ count: childCount }, { count: postCount }, { count: tagCount }] = await Promise.all([
    supabaseAdmin.from("categories").select("*", { count: "exact", head: true }).eq("parent_id", id),
    supabaseAdmin.from("posts").select("*", { count: "exact", head: true }).eq("category_id", id),
    supabaseAdmin.from("tags").select("*", { count: "exact", head: true }).eq("category_id", id),
  ]);

  if (childCount && childCount > 0)
    throw new Error(`하위 카테고리가 ${childCount}개 있습니다. 먼저 삭제하거나 이동해주세요.`);
  if (postCount && postCount > 0)
    throw new Error(`이 카테고리에 글이 ${postCount}개 있습니다. 먼저 다른 카테고리로 이동해주세요.`);
  if (tagCount && tagCount > 0)
    throw new Error(`이 카테고리에 태그가 ${tagCount}개 있습니다. 먼저 다른 카테고리로 이동해주세요.`);

  const { error } = await supabaseAdmin.from("categories").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/categories");
}
