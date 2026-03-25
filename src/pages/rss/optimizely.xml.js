import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { enrichPostsForRss } from "../../utils/rss";

export async function GET(context) {
  const posts = (await getCollection("blog")).filter((p) => {
    if (p.data.draft) {
      return false;
    }

    return p.data.tags.some((tag) => tag.toLowerCase() === "optimizely");
  });
  const rssPosts = await enrichPostsForRss(posts);

  return rss({
    title: "Wojciech Seweryn Blog",
    description: "Posts tagged optimizely.",
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
