/**
 * In-process cache of plugin Mongoose models keyed by subdomain.
 *
 * Models are captured when the plugin's GraphQL or tRPC context is built
 * (both conventionally carry a `models` property), so the agent-tools
 * endpoints can resolve them without any plugin source changes.
 * Intentionally process-local: no Redis, no BullMQ.
 */
const capturedPluginModels = new Map<string, Record<string, unknown>>();

export const capturePluginModels = (
  subdomain: string,
  models: unknown,
): void => {
  if (!subdomain || !models || typeof models !== 'object') {
    return;
  }

  capturedPluginModels.set(subdomain, models as Record<string, unknown>);
};

export const getCapturedPluginModels = (
  subdomain: string,
): Record<string, unknown> | null => {
  return capturedPluginModels.get(subdomain) || null;
};
