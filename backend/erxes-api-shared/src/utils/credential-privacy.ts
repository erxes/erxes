/** Vault traffic must not enter general-purpose logging or extension hooks. */
export const isCredentialField = (field: string): boolean =>
  /^credentials[A-Z]/.test(field);

const CREDENTIAL_TRAFFIC =
  /\bcredentials[A-Z][A-Za-z]*\b|\/credentials\/consume\b/;

/**
 * Inspect telemetry, not just operationName: aliases, unnamed operations,
 * inline literals and fragments must receive the same protection. A match
 * drops the whole event, including breadcrumbs and attached request bodies.
 */
export const containsCredentialTraffic = (value: unknown): boolean => {
  const seen = new WeakSet<object>();
  const inspect = (item: unknown): boolean => {
    if (typeof item === 'string') return CREDENTIAL_TRAFFIC.test(item);
    if (!item || typeof item !== 'object' || seen.has(item)) return false;
    seen.add(item);
    return Object.entries(item).some(
      ([key, child]) => CREDENTIAL_TRAFFIC.test(key) || inspect(child),
    );
  };
  return inspect(value);
};
