const CARD_SELECTOR = "[data-card-click], [data-tilt-card]";

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const resetTilt = (card: HTMLElement) => {
  card.style.setProperty("--top-glow", "0.55");
  card.style.setProperty("--bottom-glow", "0.55");
  card.style.setProperty("--rx", "0deg");
  card.style.setProperty("--ry", "0deg");
  card.style.setProperty("--ox", "0px");
  card.style.setProperty("--oy", "0px");
  card.style.setProperty("--mx", "50%");
  card.style.setProperty("--my", "50%");
};

const shouldIgnoreCardClick = (event: Event) => {
  if (event.defaultPrevented) return true;
  if (!(event.target instanceof Element)) return false;
  return Boolean(event.target.closest("[data-tag-link], a, button, input, textarea, select"));
};

const bindClickableCard = (card: HTMLElement) => {
  if (card.dataset.cardClickBound === "true") return;

  const url = card.dataset.cardUrl;
  if (!url) return;

  card.dataset.cardClickBound = "true";

  const navigate = () => {
    window.location.href = url;
  };

  card.addEventListener("click", (event) => {
    if (shouldIgnoreCardClick(event)) return;
    navigate();
  });

  card.addEventListener("keydown", (event) => {
    if (shouldIgnoreCardClick(event)) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      navigate();
    }
  });
};

const bindTiltCard = (card: HTMLElement) => {
  if (card.dataset.tiltBound === "true") return;

  card.dataset.tiltBound = "true";
  resetTilt(card);

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  let frame: number | null = null;
  let pendingEvent: PointerEvent | null = null;

  const update = () => {
    if (!pendingEvent) {
      frame = null;
      return;
    }

    const rect = card.getBoundingClientRect();
    const x = pendingEvent.clientX - rect.left;
    const y = pendingEvent.clientY - rect.top;
    const ratio = clamp(y / rect.height, 0, 1);
    const mx = (x / rect.width) * 100;
    const my = (y / rect.height) * 100;
    const rx = clamp((y / rect.height - 0.5) * -8, -6, 6);
    const ry = clamp((x / rect.width - 0.5) * 8, -6, 6);
    const ox = clamp((x / rect.width - 0.5) * 10, -6, 6);
    const oy = clamp((y / rect.height - 0.5) * 10, -6, 6);

    card.style.setProperty("--top-glow", `${(1 - ratio).toFixed(3)}`);
    card.style.setProperty("--bottom-glow", `${ratio.toFixed(3)}`);
    card.style.setProperty("--mx", `${mx}%`);
    card.style.setProperty("--my", `${my}%`);
    card.style.setProperty("--rx", `${rx}deg`);
    card.style.setProperty("--ry", `${ry}deg`);
    card.style.setProperty("--ox", `${ox}px`);
    card.style.setProperty("--oy", `${oy}px`);

    frame = null;
  };

  card.addEventListener("pointermove", (event) => {
    pendingEvent = event;
    if (frame !== null) return;
    frame = window.requestAnimationFrame(update);
  });

  card.addEventListener("pointerleave", () => {
    pendingEvent = null;
    if (frame !== null) {
      window.cancelAnimationFrame(frame);
      frame = null;
    }
    resetTilt(card);
  });
};

const collectCards = (root: ParentNode) => {
  const cards = new Set<HTMLElement>();

  if (root instanceof HTMLElement && root.matches(CARD_SELECTOR)) {
    cards.add(root);
  }

  root.querySelectorAll<HTMLElement>(CARD_SELECTOR).forEach((card) => {
    cards.add(card);
  });

  return cards;
};

export const enhancePostCard = (card: HTMLElement) => {
  if (card.hasAttribute("data-card-click")) {
    bindClickableCard(card);
  }

  if (card.hasAttribute("data-tilt-card")) {
    bindTiltCard(card);
  }
};

export const enhancePostCards = (root: ParentNode = document) => {
  collectCards(root).forEach((card) => {
    enhancePostCard(card);
  });
};
