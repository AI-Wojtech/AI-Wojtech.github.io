type BlogPost = {
  id: string;
  slug: string;
  data: {
    title: string;
    description: string;
    pubDate: Date;
    publishedAt?: Date;
    tags: string[];
    draft: boolean;
  };
};

export function getPostRssDate(post: BlogPost) {
  return post.data.publishedAt ?? post.data.pubDate;
}

export async function enrichPostsForRss(posts: BlogPost[]) {
  const enriched = posts.map((post) => ({
    post,
    rssDate: getPostRssDate(post)
  }));

  return enriched.sort((a, b) => b.rssDate.valueOf() - a.rssDate.valueOf());
}
