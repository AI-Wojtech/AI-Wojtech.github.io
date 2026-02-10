import { formatShortDate } from "./formatDate";

type SearchPost = {
  title: string;
  description: string;
  pubDate: string;
  tags?: string[];
  url: string;
  readingTime?: number;
};

type BlogSearchOptions = {
  root?: ParentNode;
  fetchUrl?: string;
  allowSearch?: () => boolean;
  onSearchStart?: (query: string) => void;
  onSearchClear?: () => void;
  onSearchBlocked?: () => void;
};

type BlogSearchController = {
  clear: () => void;
  isActive: () => boolean;
};

const DEFAULT_FETCH_URL = "/search.json";

export const initBlogSearch = (options: BlogSearchOptions = {}): BlogSearchController | null => {
  const root = options.root ?? document;
  const searchInput = root.querySelector("[data-search-input]");
  if (!(searchInput instanceof HTMLInputElement)) {
    return null;
  }

  const doc = searchInput.ownerDocument;
  const postList = root.querySelector("[data-post-list]");
  const results = root.querySelector("[data-search-results]");
  const empty = root.querySelector("[data-search-empty]");
  const pagination = root.querySelector("[data-pagination]");
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
  const fetchUrl = options.fetchUrl ?? DEFAULT_FETCH_URL;
  let cachedPosts: SearchPost[] | null = null;
  let requestId = 0;
  let active = false;

  const setVisible = (element: Element | null, visible: boolean) => {
    if (!element) return;
    element.classList.toggle("hidden", !visible);
  };

  const loadPosts = async () => {
    if (cachedPosts) return cachedPosts;
    try {
      const response = await fetch(fetchUrl);
      if (!response.ok) {
        cachedPosts = [];
        return cachedPosts;
      }
      const payload = await response.json();
      cachedPosts = Array.isArray(payload) ? (payload as SearchPost[]) : [];
      return cachedPosts;
    } catch {
      cachedPosts = [];
      return cachedPosts;
    }
  };

  const attachCardInteractions = (card: HTMLElement) => {
    const url = card.dataset.cardUrl;
    if (!url) return;

    const shouldIgnore = (event: Event) => {
      if (event.defaultPrevented) return true;
      if (event.target instanceof Element && event.target.closest("[data-tag-link]")) return true;
      if (event.target instanceof Element && event.target.closest("a")) return true;
      return false;
    };

    card.addEventListener("click", (event) => {
      if (shouldIgnore(event)) return;
      window.location.href = url;
    });

    card.addEventListener("keydown", (event) => {
      if (shouldIgnore(event)) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        window.location.href = url;
      }
    });

    if (prefersReduced) return;
    let frame: number | null = null;
    const onMove = (event: PointerEvent) => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const mx = (x / rect.width) * 100;
        const my = (y / rect.height) * 100;
        const rx = clamp(((y / rect.height) - 0.5) * -8, -6, 6);
        const ry = clamp(((x / rect.width) - 0.5) * 8, -6, 6);
        const ox = clamp(((x / rect.width) - 0.5) * 10, -6, 6);
        const oy = clamp(((y / rect.height) - 0.5) * 10, -6, 6);

        card.style.setProperty("--mx", `${mx}%`);
        card.style.setProperty("--my", `${my}%`);
        card.style.setProperty("--rx", `${rx}deg`);
        card.style.setProperty("--ry", `${ry}deg`);
        card.style.setProperty("--ox", `${ox}px`);
        card.style.setProperty("--oy", `${oy}px`);
        frame = null;
      });
    };

    const onLeave = () => {
      card.style.setProperty("--rx", "0deg");
      card.style.setProperty("--ry", "0deg");
      card.style.setProperty("--ox", "0px");
      card.style.setProperty("--oy", "0px");
      card.style.setProperty("--mx", "50%");
      card.style.setProperty("--my", "50%");
    };

    card.addEventListener("pointermove", onMove);
    card.addEventListener("pointerleave", onLeave);
  };

  const createCard = (post: SearchPost) => {
    const article = doc.createElement("article");
    article.className = "card card-tilt";
    article.setAttribute("data-tilt-card", "");
    article.setAttribute("data-card-click", "");
    article.dataset.cardUrl = post.url;
    article.tabIndex = 0;

    const surface = doc.createElement("div");
    surface.className = "card-surface p-6";

    const stack = doc.createElement("div");
    stack.className = "flex flex-col gap-3";

    const link = doc.createElement("a");
    link.href = post.url;
    link.className = "block";

    const title = doc.createElement("h3");
    title.className = "text-lg font-semibold";
    title.textContent = post.title;

    const desc = doc.createElement("p");
    desc.className = "mt-2 text-sm text-ink-900/80 dark:text-ink-200/80";
    desc.textContent = post.description;

    link.append(title, desc);

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

    const tags = doc.createElement("div");
    tags.className = "mt-1 flex flex-wrap gap-2";
    (post.tags || []).forEach((tag) => {
      const tagLink = doc.createElement("a");
      tagLink.className = "tag-chip tag-chip-large";
      tagLink.href = `/tag/${tag}`;
      tagLink.setAttribute("aria-label", `Tag: ${tag}`);
      tagLink.setAttribute("data-tag-link", "");
      tagLink.textContent = `#${tag}`;
      tags.append(tagLink);
    });

    stack.append(link, meta, tags);
    surface.append(stack);
    article.append(surface);
    attachCardInteractions(article);
    return article;
  };

  const renderResults = (matches: SearchPost[]) => {
    if (!results) return;
    results.innerHTML = "";
    const fragment = doc.createDocumentFragment();
    matches.forEach((post) => {
      fragment.appendChild(createCard(post));
    });
    results.appendChild(fragment);
  };

  const showListState = () => {
    setVisible(results, false);
    setVisible(empty, false);
    setVisible(postList, true);
    setVisible(pagination, true);
  };

  const showSearchState = (matches: SearchPost[]) => {
    setVisible(postList, false);
    setVisible(pagination, false);
    setVisible(results, true);
    setVisible(empty, matches.length === 0);
  };

  const applySearch = async () => {
    if (options.allowSearch && !options.allowSearch()) {
      searchInput.value = "";
      active = false;
      options.onSearchBlocked?.();
      showListState();
      return;
    }

    const query = searchInput.value.trim().toLowerCase();
    if (query === "") {
      active = false;
      options.onSearchClear?.();
      showListState();
      return;
    }

    active = true;
    options.onSearchStart?.(query);
    const localRequest = ++requestId;
    const posts = await loadPosts();
    if (localRequest !== requestId) return;
    const matches = posts.filter((post) => {
      const tagText = (post.tags ?? []).map((tag) => `#${tag} ${tag}`).join(" ");
      const haystack = `${post.title} ${post.description} ${tagText}`.toLowerCase();
      return haystack.includes(query);
    });
    renderResults(matches);
    showSearchState(matches);
  };

  searchInput.addEventListener("input", applySearch);
  applySearch();

  return {
    clear: () => {
      searchInput.value = "";
      active = false;
      showListState();
    },
    isActive: () => active,
  };
};
