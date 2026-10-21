/** Keep vault forms and one-time consumer tokens out of browser telemetry. */
export const isCredentialSettingsPage = (): boolean =>
  typeof window !== 'undefined' &&
  /\/settings\/credentials(?:\/|$)/.test(window.location.pathname);

export const containsCredentialTelemetry = (value: unknown): boolean => {
  const seen = new WeakSet<object>();
  const inspect = (item: unknown): boolean => {
    if (typeof item === 'string') {
      return /\bcredentials[A-Z][A-Za-z]*\b|\/credentials\/consume\b|\/settings\/credentials(?:\/|\b)/.test(
        item,
      );
    }
    if (!item || typeof item !== 'object' || seen.has(item)) return false;
    seen.add(item);
    return Object.entries(item).some(
      ([key, child]) => inspect(key) || inspect(child),
    );
  };
  return inspect(value);
};
