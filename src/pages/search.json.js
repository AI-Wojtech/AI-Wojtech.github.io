import { getCollection } from "astro:content";
import { getReadingTime } from "../utils/readingTime";

export async function GET() {
  const posts = (await getCollection("blog"))
    .filter((post) => !post.data.draft)
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
    .map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate.toISOString(),
      tags: post.data.tags,
      url: `/blog/${post.slug}`,
      readingTime: getReadingTime(post.body ?? "").minutes
    }));

  return new Response(JSON.stringify(posts), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}
