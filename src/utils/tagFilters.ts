import { initBlogSearch } from "./blogSearch";

type FilterMode = "and" | "or";

const setVisible = (element: Element | null, visible: boolean) => {
  if (!element) return;
  element.classList.toggle("hidden", !visible);
};

const readParamTags = () => {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("tags");
  if (!raw) return [];
  return raw
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
};

const readMode = (): FilterMode => {
  const params = new URLSearchParams(window.location.search);
  return params.get("mode") === "or" ? "or" : "and";
};

export const initTagFilters = () => {
  const root = document.querySelector<HTMLElement>("[data-tag-filter]");
  if (!root) return;

  const posts = Array.from(document.querySelectorAll<HTMLElement>("[data-post-tags]"));
  const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-tag]"));
  const activeContainer = root.querySelector<HTMLElement>("[data-active-tags]");
  const clearButton = root.querySelector<HTMLButtonElement>("[data-clear-tags]");
  const modeToggles = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-mode-toggle]"));
  const emptyState = document.querySelector<HTMLElement>("[data-empty-state]");
  const titleElement = document.querySelector<HTMLElement>("[data-filter-title]");
  const filterUi = document.querySelector<HTMLElement>("[data-filter-ui]");
  const defaultTitle = titleElement?.textContent ?? "";
  const searchInput = document.querySelector<HTMLInputElement>("[data-search-input]");
  const searchResults = document.querySelector<HTMLElement>("[data-search-results]");
  const searchEmpty = document.querySelector<HTMLElement>("[data-search-empty]");
  const postList = document.querySelector<HTMLElement>("[data-post-list]");
  const searchWrapper = document.querySelector<HTMLElement>("[data-search-wrapper]");
  const initialPrimaryTag = root.dataset.primaryTag ?? "";

  const active = new Set([initialPrimaryTag, ...readParamTags()].filter(Boolean));
  let mode: FilterMode = readMode();
  let searchActive = false;

  const updateSearchVisibility = () => {
    if (!searchWrapper) return;
    searchWrapper.classList.toggle("hidden", active.size !== 0);
  };

  const applyFilter = () => {
    if (searchActive) return;

    const activeTags = Array.from(active);
    let matchesCount = 0;

    posts.forEach((post) => {
      const tags = (post.dataset.postTags ?? "").split(",").filter(Boolean);
      const matches =
        mode === "or"
          ? activeTags.some((tag) => tags.includes(tag))
          : activeTags.every((tag) => tags.includes(tag));

      if (matches) {
        matchesCount += 1;
      }

      post.classList.toggle("hidden", !matches);
    });

    if (emptyState) {
      emptyState.classList.toggle("hidden", matchesCount > 0);
    }
  };

  const updateUrl = () => {
    const activeTags = Array.from(active);
    const [primaryTag = initialPrimaryTag] = activeTags;
    const params = new URLSearchParams();

    params.set("tags", activeTags.join(","));
    params.set("mode", mode);

    history.replaceState(null, "", `/tag/${primaryTag}?${params.toString()}`);
    root.dataset.primaryTag = primaryTag;
  };

  const setLatestArticlesState = () => {
    searchActive = false;
    posts.forEach((post) => post.classList.remove("hidden"));
    filterUi?.classList.add("hidden");

    if (titleElement) {
      titleElement.textContent = "Latest Articles";
    }

    history.replaceState(null, "", "/blog");

    if (clearButton) {
      clearButton.hidden = true;
    }

    emptyState?.classList.add("hidden");

    if (searchInput) {
      searchInput.value = "";
    }

    setVisible(searchResults, false);
    setVisible(searchEmpty, false);
    setVisible(postList, true);
    updateSearchVisibility();
  };

  const renderActive = () => {
    if (!activeContainer) return;

    activeContainer.innerHTML = "";

    Array.from(active).forEach((tag) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "tag-chip tag-chip-compact";
      chip.setAttribute("data-remove-tag", tag);
      chip.setAttribute("aria-label", `Remove ${tag}`);

      const text = document.createElement("span");
      text.textContent = `#${tag}`;

      const icon = document.createElement("span");
      icon.className = "tag-chip-x";
      icon.setAttribute("aria-hidden", "true");

      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", "0 0 16 16");
      svg.setAttribute("width", "10");
      svg.setAttribute("height", "10");

      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", "M4 4l8 8M12 4l-8 8");
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", "currentColor");
      path.setAttribute("stroke-width", "2");
      path.setAttribute("stroke-linecap", "round");

      svg.append(path);
      icon.append(svg);
      chip.append(text, icon);
      chip.addEventListener("click", () => {
        toggleTag(tag);
      });

      activeContainer.append(chip);
    });

    if (clearButton) {
      clearButton.hidden = active.size <= 1;
    }
  };

  const syncButtons = () => {
    buttons.forEach((button) => {
      const tag = button.dataset.tag ?? "";
      const isActive = active.has(tag);
      button.dataset.active = isActive ? "true" : "false";
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  };

  const setMode = (nextMode: FilterMode, options: { updateHistory?: boolean } = {}) => {
    mode = nextMode;

    modeToggles.forEach((toggle) => {
      toggle.dataset.mode = mode;
      toggle.setAttribute("aria-checked", mode === "or" ? "true" : "false");
      toggle.setAttribute("aria-label", `Filter mode: ${mode.toUpperCase()}`);
    });

    if (active.size === 0) {
      setLatestArticlesState();
      return;
    }

    applyFilter();

    if (options.updateHistory !== false) {
      updateUrl();
    }
  };

  function toggleTag(tag: string) {
    if (active.has(tag)) {
      active.delete(tag);
    } else {
      active.add(tag);
    }

    renderActive();
    syncButtons();

    if (active.size === 0) {
      setLatestArticlesState();
      return;
    }

    if (searchInput) {
      searchInput.value = "";
    }

    searchActive = false;
    setVisible(searchResults, false);
    setVisible(searchEmpty, false);
    updateSearchVisibility();
    filterUi?.classList.remove("hidden");

    if (titleElement) {
      titleElement.textContent = defaultTitle;
    }

    applyFilter();
    updateUrl();
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const tag = button.dataset.tag;
      if (!tag) return;
      toggleTag(tag);
    });
  });

  modeToggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      setMode(mode === "and" ? "or" : "and");
    });
  });

  clearButton?.addEventListener("click", () => {
    active.clear();
    renderActive();
    syncButtons();
    setLatestArticlesState();
  });

  renderActive();
  syncButtons();
  setMode(mode, { updateHistory: false });
  updateSearchVisibility();

  initBlogSearch({
    allowSearch: () => active.size === 0,
    onSearchStart: () => {
      searchActive = true;
      updateSearchVisibility();
      filterUi?.classList.add("hidden");

      if (titleElement) {
        titleElement.textContent = "Latest Articles";
      }
    },
    onSearchClear: () => {
      if (active.size === 0) {
        setLatestArticlesState();
        return;
      }

      searchActive = false;
      updateSearchVisibility();
      filterUi?.classList.remove("hidden");

      if (titleElement) {
        titleElement.textContent = defaultTitle;
      }

      applyFilter();
    },
    onSearchBlocked: () => {
      searchActive = false;
      updateSearchVisibility();
    },
  });
};
