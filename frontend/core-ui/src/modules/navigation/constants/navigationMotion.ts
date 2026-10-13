export const NAVIGATION_EASE = [0.22, 1, 0.36, 1] as const;

export const NAVIGATION_EASE_CSS = `cubic-bezier(${NAVIGATION_EASE.join(
  ', ',
)})`;
