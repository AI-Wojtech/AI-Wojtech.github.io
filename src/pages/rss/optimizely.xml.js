import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export async function GET(context) {
  const posts = (await getCollection("blog"))
    .filter((p) => {
      if (p.data.draft) {
        return false;
      }

      return p.data.tags.some((tag) => tag.toLowerCase() === "optimizely");
    })
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  return rss({
    title: "Wojciech Seweryn Blog",
    description: "Posts tagged optimizely.",
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/blog/${post.slug}`,
      categories: post.data.tags
    }))
  });
}
