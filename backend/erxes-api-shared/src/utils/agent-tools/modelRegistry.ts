/**
 * In-process cache of plugin Mongoose models keyed by subdomain.
 *
 * Models are captured when the plugin's GraphQL or tRPC context is built
 * (both conventionally carry a `models` property), so the agent-tools
 * endpoints can resolve them without any plugin source changes.
 * Intentionally process-local: no Redis, no BullMQ.
 *
 * The map is bounded: in SaaS deployments one process serves many tenants,
 * so the oldest entries are evicted once the cap is reached instead of
 * pinning every tenant's model set for the process lifetime.
 */
const MAX_CAPTURED_TENANTS = 200;

const capturedPluginModels = new Map<
  string,
  { models: Record<string, unknown>; at: number }
>();

/** Store the tenant's models, evicting the oldest entries beyond the cap. */
export const capturePluginModels = (
  subdomain: string,
  models: unknown,
): void => {
  if (!subdomain || !models || typeof models !== 'object') {
    return;
  }

  if (capturedPluginModels.has(subdomain)) {
    capturedPluginModels.delete(subdomain);
  }

  capturedPluginModels.set(subdomain, {
    models: models as Record<string, unknown>,
    at: Date.now(),
  });

  while (capturedPluginModels.size > MAX_CAPTURED_TENANTS) {
    const oldestKey = capturedPluginModels.keys().next().value;

    if (!oldestKey) {
      break;
    }

    capturedPluginModels.delete(oldestKey);
  }
};

/** Look up the captured tenant models, refreshing their recency. */
export const getCapturedPluginModels = (
  subdomain: string,
): Record<string, unknown> | null => {
  const entry = capturedPluginModels.get(subdomain);

  if (!entry) {
    return null;
  }

  // Refresh recency so active tenants are not evicted under pressure.
  capturedPluginModels.delete(subdomain);
  capturedPluginModels.set(subdomain, { ...entry, at: Date.now() });

  return entry.models;
};

/**
 * Capture models from a plugin context object when it carries a `models`
 * property; a no-op for any other context shape. Shared by the Apollo and
 * tRPC context wrappers.
 */
export const captureModelsFromContext = (
  subdomain: string,
  context: unknown,
): void => {
  if (!context || typeof context !== 'object' || !('models' in context)) {
    return;
  }

  capturePluginModels(subdomain, (context as { models?: unknown }).models);
};
