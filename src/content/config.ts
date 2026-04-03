import { z, defineCollection } from "astro:content";

const blog = defineCollection({
  type: "content",
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.date(),
      tags: z.array(z.string()),
      draft: z.boolean(),
      heroImage: image().optional()
    })
});

const blogDummy = defineCollection({
  type: "content",
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.date(),
      tags: z.array(z.string()),
      draft: z.boolean(),
      heroImage: image().optional()
    })
});

export const collections = { blog, "blog-dummy": blogDummy };
