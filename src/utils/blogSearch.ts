import { createPostCardElement, type PostCardData } from "./postCardDom";

type SearchPost = PostCardData;

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
let searchShortcutBound = false;

const initSearchShortcut = () => {
  if (searchShortcutBound) return;

  searchShortcutBound = true;
  document.addEventListener("keydown", (event) => {
    if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;

    const target = event.target;
    if (
      target instanceof HTMLElement &&
      (target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable)
    ) {
      return;
    }

    const visibleInput = Array.from(document.querySelectorAll<HTMLInputElement>("[data-search-input]")).find(
      (input) => {
        const element = input as HTMLElement;
        if (element.closest(".hidden")) return false;
        return element.offsetParent !== null;
      }
    );

    if (!visibleInput) return;

    event.preventDefault();
    visibleInput.focus();
    visibleInput.select();
  });
};

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

  const renderResults = (matches: SearchPost[]) => {
    if (!results) return;

    results.replaceChildren();

    const fragment = doc.createDocumentFragment();
    matches.forEach((post) => {
      fragment.appendChild(createPostCardElement(doc, post));
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
  initSearchShortcut();
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
