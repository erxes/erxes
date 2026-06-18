import { z } from 'zod';

export const providerFormSchema = z.object({
  // Required: a custom provider with a blank key would otherwise silently
  // no-op on save. Presets pre-fill this with their own key.
  provider: z.string().min(1, 'Provider key is required'),
  apiKey: z.string(),
  baseUrl: z.string(),
  modelsEndpoint: z.string(),
  isOpenAICompatible: z.boolean(),
  envKey: z.string(),
  // Custom headers edited as one `Header-Name: value` per line.
  headersText: z.string(),
  isDefault: z.boolean(),
  isEnabled: z.boolean(),
});

export type ProviderFormValues = z.infer<typeof providerFormSchema>;

export const PROVIDER_FORM_DEFAULTS: ProviderFormValues = {
  provider: '',
  apiKey: '',
  baseUrl: '',
  modelsEndpoint: '',
  isOpenAICompatible: false,
  envKey: '',
  headersText: '',
  isDefault: false,
  isEnabled: true,
};

export const generalSettingsSchema = z.object({
  erxesApiUrl: z.string(),
  erxesApiToken: z.string(),
  defaultAgentId: z.string(),
  attachmentsEnabled: z.boolean(),
});

export type GeneralSettingsValues = z.infer<typeof generalSettingsSchema>;

export const GENERAL_SETTINGS_DEFAULTS: GeneralSettingsValues = {
  erxesApiUrl: 'http://localhost:4000',
  erxesApiToken: '',
  defaultAgentId: '',
  attachmentsEnabled: true,
};
