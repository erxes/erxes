/**
 * Lightweight, dependency-free debug loggers for the Discord integration.
 * Mirrors the `debugX` / `debugError` helpers used by other erxes integrations.
 */
export const debugDiscord = (...args: unknown[]) =>
  console.log('[discord]', ...args);

/** Error-level variant of {@link debugDiscord}. */
export const debugError = (...args: unknown[]) =>
  console.error('[discord:error]', ...args);
