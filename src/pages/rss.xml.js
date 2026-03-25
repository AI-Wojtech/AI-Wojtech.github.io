import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { enrichPostsForRss } from "../utils/rss";

export async function GET(context) {
  const posts = (await getCollection("blog")).filter((p) => !p.data.draft);
  const rssPosts = await enrichPostsForRss(posts);

  return rss({
    title: "Wojciech Seweryn",
    description: "A minimalist technical blog about Optimizely, AI, and software engineering.",
    site: context.site,
    items: rssPosts.map(({ post, rssDate }) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: rssDate,
      link: `/blog/${post.slug}`,
      categories: post.data.tags
    }))
  });
}
