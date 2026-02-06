import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

export default defineConfig({
  site: "https://wseweryn.dev",
  integrations: [
    tailwind({ applyBaseStyles: false }),
    sitemap()
  ],
  markdown: {
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: "append",
          test: ["h2", "h3", "h4", "h5", "h6"],
          properties: {
            className: ["heading-anchor"],
            ariaLabel: "Permalink"
          },
          content: {
            type: "text",
            value: "#"
          }
        }
      ]
    ],
    shikiConfig: {
      theme: "github-dark",
      wrap: true
    }
  }
});
