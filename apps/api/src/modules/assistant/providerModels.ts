import type { AssistantProvider } from '@erxes/core-contract';
import { z } from 'zod';
import { type ProviderModelEntry } from './modelCatalog';
import {
  endpointOf,
  providerErrorMessage,
  providerLabel,
  sanitizeProviderMessage,
} from './providers';

const Listing = z.object({
  data: z.array(
    z.looseObject({
      id: z.string().optional(),
      created: z.number().optional(),
      created_at: z.string().optional(),
    }),
  ),
});

export type ModelListing =
  | { entries: ProviderModelEntry[]; error: null; unsupported: false }
  | { entries: []; error: string; unsupported: boolean };

const failed = (error: string, unsupported = false): ModelListing => ({
  entries: [],
  error,
  unsupported,
});

const describeFailure = (
  provider: AssistantProvider,
  status: number,
  body: unknown,
  apiKey: string,
): ModelListing => {
  const label = providerLabel(provider);
  const detail = sanitizeProviderMessage(providerErrorMessage(body), apiKey);
  const said = detail ? ` ${label} said: "${detail}"` : '';

  if (/api\.model\.read|missing scopes?|insufficient permissions/i.test(detail)) {
    return failed(
      `This ${label} key can't list models (missing Models: Read permission). Type a model id to use it, or allow Models: Read for the key.`,
    );
  }

  if (status === 401)
    return failed(`${label} rejected the saved API key (401). Save it again.${said}`);

  if (status === 403) return failed(`${label} refused to list models for this key (403).${said}`);

  if (status === 404 || status === 405) {
    return failed(`${label} has no model list endpoint (${status}).`, true);
  }

  if (status === 429)
    return failed(`${label} rate-limited the model list (429). Try again shortly.${said}`);

  return failed(`${label} could not list models (${status}).${said}`);
};

const createdOf = (entry: { created?: number; created_at?: string }) => {
  if (entry.created !== undefined) return entry.created;

  const time = entry.created_at ? Date.parse(entry.created_at) : Number.NaN;

  return Number.isNaN(time) ? undefined : Math.floor(time / 1000);
};

export const fetchProviderModels = async (
  provider: AssistantProvider,
  apiKey: string,
): Promise<ModelListing> => {
  const response = await fetch(`${endpointOf(provider)}/models`, {
    headers: { Authorization: `Bearer ${apiKey}`, 'x-api-key': apiKey },
    signal: AbortSignal.timeout(10_000),
  }).catch(() => null);

  if (!response) return failed(`Could not reach ${providerLabel(provider)} to list models.`);

  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) return describeFailure(provider, response.status, body, apiKey);

  const listing = Listing.safeParse(body);

  if (!listing.success)
    return failed(`${providerLabel(provider)} sent a model list we can't read.`);

  const entries = listing.data.data.flatMap((entry) => {
    const id = entry.id?.trim();
    const created = createdOf(entry);

    return id ? [created === undefined ? { id } : { id, created }] : [];
  });

  return { entries, error: null, unsupported: false };
};
