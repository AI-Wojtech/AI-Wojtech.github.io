const ROTATOR_SELECTOR = "[data-rotating-words]";

export const initRotatingWords = (root: ParentNode = document) => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  root.querySelectorAll<HTMLElement>(ROTATOR_SELECTOR).forEach((element) => {
    if (element.dataset.rotatorBound === "true") return;

    const words = (element.dataset.rotatingWords || "")
      .split("|")
      .map((word) => word.trim())
      .filter(Boolean);
    const types = (element.dataset.rotatingTypes || "")
      .split("|")
      .map((type) => type.trim())
      .filter(Boolean);

    if (words.length === 0) return;

    element.dataset.rotatorBound = "true";

    let wordIndex = 0;
    let charIndex = 0;
    let deleting = false;

    const typeSpeed = 80;
    const deleteSpeed = 50;
    const pause = 1200;

    const updateColor = () => {
      const currentType = types[wordIndex] || (wordIndex % 2 === 0 ? "optimizely" : "ai");
      element.classList.toggle("rotating-word--optimizely", currentType === "optimizely");
      element.classList.toggle("rotating-word--ai", currentType === "ai");
    };

    updateColor();

    if (prefersReducedMotion) {
      return;
    }

    const tick = () => {
      const word = words[wordIndex];

      if (!deleting) {
        charIndex += 1;
        element.textContent = word.slice(0, charIndex);

        if (charIndex === word.length) {
          deleting = true;
          window.setTimeout(tick, pause);
          return;
        }
      } else {
        charIndex -= 1;
        element.textContent = word.slice(0, charIndex);

        if (charIndex === 0) {
          deleting = false;
          wordIndex = (wordIndex + 1) % words.length;
          updateColor();
        }
      }

      window.setTimeout(tick, deleting ? deleteSpeed : typeSpeed);
    };

    tick();
  });
};
