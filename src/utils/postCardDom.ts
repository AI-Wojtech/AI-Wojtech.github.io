import { formatShortDate } from "./formatDate";
import { getPostCardAppearance } from "./postCardMeta";
import { enhancePostCard } from "./postCardUi";

export type PostCardData = {
  title: string;
  description: string;
  pubDate: string;
  tags?: string[];
  url: string;
  readingTime?: number;
};

export const createPostCardElement = (doc: Document, post: PostCardData) => {
  const tags = post.tags ?? [];
  const { primaryTag, tagSlug, labelText } = getPostCardAppearance(tags);

  const article = doc.createElement("article");
  article.className = `card card-tilt card-tilt--${tagSlug}`;
  article.setAttribute("data-tilt-card", "");
  article.setAttribute("data-card-click", "");
  article.dataset.cardUrl = post.url;
  article.tabIndex = 0;

  const surface = doc.createElement("div");
  surface.className = "card-surface flex gap-0";

  if (primaryTag) {
    const label = doc.createElement("div");
    label.className = `post-label post-label--${tagSlug}`;
    label.setAttribute("aria-hidden", "true");

    const labelSpan = doc.createElement("span");
    labelSpan.className = "post-label-text";
    labelSpan.textContent = labelText;

    label.append(labelSpan);
    surface.append(label);
  }

  const stack = doc.createElement("div");
  stack.className = "flex flex-col flex-1 min-w-0 gap-3 p-6";

  const meta = doc.createElement("div");
  meta.className = "text-xs text-ink-900/70 dark:text-ink-200/70";

  const time = doc.createElement("time");
  time.dateTime = post.pubDate;
  time.textContent = formatShortDate(new Date(post.pubDate));

  const dot = doc.createElement("span");
  dot.textContent = " \u00b7 ";
  dot.setAttribute("aria-hidden", "true");

  const reading = doc.createElement("span");
  reading.textContent = `${post.readingTime ?? 1} min read`;

  meta.append(time, dot, reading);

  const link = doc.createElement("a");
  link.href = post.url;
  link.className = "block";

  const title = doc.createElement("h3");
  title.className = "text-lg font-semibold";
  title.textContent = post.title;

  const description = doc.createElement("p");
  description.className = "mt-2 text-sm text-ink-900/80 dark:text-ink-200/80";
  description.textContent = post.description;

  link.append(title, description);

  const tagList = doc.createElement("div");
  tagList.className = "mt-1 flex flex-wrap gap-2";

  tags.forEach((tag) => {
    const tagLink = doc.createElement("a");
    tagLink.className = "tag-chip tag-chip-large";
    tagLink.href = `/tag/${tag}`;
    tagLink.setAttribute("aria-label", `Tag: ${tag}`);
    tagLink.setAttribute("data-tag-link", "");
    tagLink.textContent = `#${tag}`;
    tagList.append(tagLink);
  });

  stack.append(meta, link, tagList);
  surface.append(stack);
  article.append(surface);

  enhancePostCard(article);
  return article;
};
