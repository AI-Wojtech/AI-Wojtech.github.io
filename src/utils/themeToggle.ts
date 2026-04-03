const STORAGE_KEY = "theme";
const TOGGLE_SELECTOR = "[data-theme-toggle]";

type Theme = "light" | "dark";

const getCurrentTheme = (): Theme =>
  document.documentElement.classList.contains("dark") ? "dark" : "light";

const syncToggleState = (theme: Theme) => {
  document.querySelectorAll<HTMLElement>(TOGGLE_SELECTOR).forEach((toggle) => {
    toggle.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
  });
};

const applyTheme = (theme: Theme) => {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.dataset.theme = theme;
  syncToggleState(theme);

  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Ignore storage failures in restricted environments.
  }
};

export const initThemeToggles = (root: ParentNode = document) => {
  const toggles = Array.from(root.querySelectorAll<HTMLElement>(TOGGLE_SELECTOR));
  if (toggles.length === 0) return;

  syncToggleState(getCurrentTheme());

  toggles.forEach((toggle) => {
    if (toggle.dataset.themeToggleBound === "true") return;

    toggle.dataset.themeToggleBound = "true";
    toggle.addEventListener("click", () => {
      const nextTheme = getCurrentTheme() === "dark" ? "light" : "dark";
      applyTheme(nextTheme);
    });
  });
};
