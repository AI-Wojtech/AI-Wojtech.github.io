const initCopyButtons = () => {
  document.querySelectorAll<HTMLElement>("pre").forEach((pre) => {
    const code = pre.querySelector("code");
    if (!code || pre.querySelector(".code-copy")) return;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "code-copy";
    button.textContent = "Copy";

    button.addEventListener("click", async () => {
      const text = code.textContent ?? "";

      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const area = document.createElement("textarea");
        area.value = text;
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.append(area);
        area.focus();
        area.select();
        document.execCommand("copy");
        area.remove();
      }

      button.textContent = "Copied";
      window.setTimeout(() => {
        button.textContent = "Copy";
      }, 1400);
    });

    pre.append(button);
  });
};

const initImageLightbox = () => {
  const images = document.querySelectorAll<HTMLImageElement>("article.prose img");
  if (images.length === 0) return;

  let overlay: HTMLDivElement | null = null;
  let onKeyDown: ((event: KeyboardEvent) => void) | null = null;

  const close = () => {
    if (!overlay) return;
    overlay.remove();
    overlay = null;
    document.body.style.overflow = "";
    if (onKeyDown) {
      document.removeEventListener("keydown", onKeyDown);
      onKeyDown = null;
    }
  };

  images.forEach((image) => {
    if (image.dataset.lightboxBound === "true") return;

    image.dataset.lightboxBound = "true";
    image.addEventListener("click", () => {
      if (overlay) return;

      overlay = document.createElement("div");
      overlay.className = "lightbox";

      const clone = document.createElement("img");
      clone.src = image.getAttribute("src") ?? "";
      clone.alt = image.getAttribute("alt") ?? "";

      clone.addEventListener("click", (event) => {
        event.stopPropagation();
        overlay?.classList.toggle("is-zoomed");
      });

      overlay.append(clone);
      overlay.addEventListener("click", (event) => {
        if (event.target === overlay) {
          close();
        }
      });

      onKeyDown = (event) => {
        if (event.key === "Escape") {
          close();
        }
      };

      document.addEventListener("keydown", onKeyDown);

      document.body.append(overlay);
      document.body.style.overflow = "hidden";
    });
  });
};

const initReadingProgress = () => {
  const bar = document.querySelector<HTMLElement>("[data-reading-progress]");
  if (!bar || bar.dataset.readingProgressBound === "true") return;

  bar.dataset.readingProgressBound = "true";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let ticking = false;
  let scrollTimeout: number | null = null;

  const update = () => {
    const doc = document.documentElement;
    const scrollTop = doc.scrollTop || document.body.scrollTop;
    const height = doc.scrollHeight - doc.clientHeight;
    const progress = height > 0 ? Math.min(scrollTop / height, 1) : 0;

    bar.style.setProperty("--progress", `${progress}`);

    if (prefersReduced) {
      bar.style.width = `${progress * 100}%`;
    } else {
      bar.style.transform = `scaleX(${progress})`;
    }

    ticking = false;
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;

    bar.classList.add("is-scrolling");
    if (scrollTimeout !== null) {
      window.clearTimeout(scrollTimeout);
    }

    scrollTimeout = window.setTimeout(() => {
      bar.classList.remove("is-scrolling");
    }, 140);

    window.requestAnimationFrame(update);
  };

  update();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
};

const initBackToTop = () => {
  const button = document.querySelector<HTMLButtonElement>("[data-back-to-top]");
  if (!button || button.dataset.backToTopBound === "true") return;

  button.dataset.backToTopBound = "true";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let ticking = false;

  const update = () => {
    const doc = document.documentElement;
    const scrollTop = doc.scrollTop || document.body.scrollTop;
    const height = doc.scrollHeight - doc.clientHeight;
    const threshold = Math.min(640, height * 0.3);
    const shouldShow = height > 600 && scrollTop > threshold;
    button.classList.toggle("is-visible", shouldShow);
    ticking = false;
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  };

  button.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
  });

  update();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
};

const getCollapsedTocLimit = () => {
  if (window.innerWidth >= 1024) return 5;
  if (window.innerWidth >= 640) return 4;
  return 3;
};

const initTocToggle = () => {
  const toc = document.querySelector<HTMLElement>("[data-toc]");
  const button = document.querySelector<HTMLButtonElement>("[data-toc-toggle]");
  if (!toc || !button || button.dataset.tocToggleBound === "true") return;

  button.dataset.tocToggleBound = "true";

  const count = Number(toc.dataset.tocCount ?? "0");

  const update = () => {
    const limit = getCollapsedTocLimit();
    const needsToggle = count > limit;
    const isExpanded = toc.dataset.expanded === "true";

    button.hidden = !needsToggle;
    button.disabled = !needsToggle;

    if (!needsToggle) {
      toc.dataset.expanded = "false";
      button.setAttribute("aria-expanded", "false");
      button.textContent = "Show more...";
      return;
    }

    button.setAttribute("aria-expanded", String(isExpanded));

    if (isExpanded) {
      button.textContent = "Show less";
      return;
    }

    const remaining = Math.max(count - limit, 0);
    button.textContent = `Show ${remaining} more...`;
  };

  button.addEventListener("click", () => {
    const isExpanded = toc.dataset.expanded === "true";
    toc.dataset.expanded = isExpanded ? "false" : "true";
    update();
  });

  update();
  window.addEventListener("resize", update);
};

export const initPostPageEnhancements = () => {
  initCopyButtons();
  initImageLightbox();
  initReadingProgress();
  initBackToTop();
  initTocToggle();
};
