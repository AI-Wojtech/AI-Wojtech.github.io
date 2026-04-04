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
    let timerId: number | undefined;

    const typeSpeed = Number.parseInt(element.dataset.rotatingTypeSpeed || "42", 10);
    const deleteSpeed = Number.parseInt(element.dataset.rotatingDeleteSpeed || "22", 10);
    const hold = Number.parseInt(element.dataset.rotatingHold || "1020", 10);
    const nextWordDelay = Number.parseInt(element.dataset.rotatingNextDelay || "120", 10);

    const updateColor = () => {
      const currentType = types[wordIndex] || (wordIndex % 2 === 0 ? "optimizely" : "ai");
      const shell = element.parentElement;
      element.classList.toggle("rotating-word--optimizely", currentType === "optimizely");
      element.classList.toggle("rotating-word--ai", currentType === "ai");
      shell?.classList.toggle("rotating-word-shell--optimizely", currentType === "optimizely");
      shell?.classList.toggle("rotating-word-shell--ai", currentType === "ai");
    };

    const schedule = (delay: number) => {
      timerId = window.setTimeout(tick, delay);
    };

    const cleanup = () => {
      if (timerId !== undefined) {
        window.clearTimeout(timerId);
      }
      window.removeEventListener("pagehide", cleanup);
    };

    updateColor();

    if (prefersReducedMotion) {
      window.addEventListener("pagehide", cleanup, { once: true });
      return;
    }

    element.textContent = "";
    window.addEventListener("pagehide", cleanup, { once: true });

    const tick = () => {
      const word = words[wordIndex];

      if (!deleting) {
        charIndex += 1;
        element.textContent = word.slice(0, charIndex);

        if (charIndex === word.length) {
          deleting = true;
          schedule(hold);
          return;
        }
      } else {
        charIndex -= 1;
        element.textContent = word.slice(0, charIndex);

        if (charIndex === 0) {
          deleting = false;
          wordIndex = (wordIndex + 1) % words.length;
          updateColor();
          schedule(nextWordDelay);
          return;
        }
      }

      schedule(deleting ? deleteSpeed : typeSpeed);
    };

    tick();
  });
};
