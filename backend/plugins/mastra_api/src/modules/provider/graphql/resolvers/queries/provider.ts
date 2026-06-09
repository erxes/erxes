import { IContext } from '~/connectionResolvers';
import { PROVIDER_PRESETS } from '~/mastra/providers';

export const providerQueries = {
  mastraProviders: async (_: any, __: any, { models }: IContext) => {
    return models.MastraProvider.getProviders();
  },

  mastraProvider: async (_: any, { _id }: { _id: string }, { models }: IContext) => {
    return models.MastraProvider.getProvider(_id);
  },

  // Returns static presets — used only by the "Add Provider" form in the UI
  // to pre-fill fields when a user picks a known provider.
  mastraProviderPresets: async () => {
    return PROVIDER_PRESETS;
  },

  // Returns all known providers (from presets list) enriched with isConfigured.
  // Models array is intentionally empty — the UI fetches those via mastraProviderModels.
  mastraProviderCatalog: async (_: any, __: any, { models }: IContext) => {
    const storedProviders = await models.MastraProvider.find({ isEnabled: true });
    const storedSet = new Set(storedProviders.map((p: any) => p.provider));

    return PROVIDER_PRESETS.map((preset) => ({
      provider: preset.provider,
      label: preset.label,
      isOpenAICompatible: preset.isOpenAICompatible ?? false,
      isConfigured:
        storedSet.has(preset.provider) ||
        !!(preset.envKey && process.env[preset.envKey]),
      models: [],
    }));
  },

  // Returns models for a provider by reading the stored DB doc's fields first.
  // Falls back to the preset's static model list.
  mastraProviderModels: async (
    _: any,
    { provider }: { provider: string },
    { models }: IContext,
  ) => {
    // Prefer the stored DB doc (supports custom/unknown providers too)
    const stored = await models.MastraProvider.findOne({ provider });

    // Fall back to preset data for missing fields
    const preset = PROVIDER_PRESETS.find((p) => p.provider === provider);

    const apiKey = stored?.apiKey || (stored?.envKey ? process.env[stored.envKey] : undefined)
      || (preset?.envKey ? process.env[preset.envKey] : undefined);

    const endpoint = stored?.modelsEndpoint
      ?? preset?.modelsEndpoint
      ?? (stored?.isOpenAICompatible && stored?.baseUrl ? `${stored.baseUrl}/models` : undefined)
      ?? (preset?.isOpenAICompatible && preset?.baseUrl ? `${preset.baseUrl}/models` : undefined);

    if (endpoint && apiKey) {
      try {
        // Include any custom headers (e.g. the coding-agent User-Agent that
        // Kimi For Coding requires) so gated catalog endpoints also resolve.
        const customHeaders = { ...(preset?.headers || {}), ...(stored?.headers || {}) };
        const res = await fetch(endpoint, {
          headers: { Authorization: `Bearer ${apiKey}`, ...customHeaders },
        });
        if (res.ok) {
          const json: any = await res.json();
          // OpenAI-style: { data: [{ id, ... }] }  |  Mistral-style: { data: [{ id, name }] }
          const list: any[] = Array.isArray(json.data)
            ? json.data
            : Array.isArray(json.models)
            ? json.models
            : [];
          if (list.length > 0) {
            return list
              .filter((m: any) => m.id)
              .map((m: any) => ({ id: m.id, name: m.name || m.display_name || m.id }));
          }
        }
      } catch {
        // Fall through to static list
      }
    }

    return preset?.models ?? [];
  },
};
