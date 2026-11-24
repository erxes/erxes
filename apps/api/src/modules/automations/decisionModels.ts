import type { DecisionModel, DecisionProvider } from '@erxes/core-contract';
import { integrationConnections, requestOrgId, withOrg } from '@erxes/core-db';
import { DECISION_INTEGRATIONS, type ModelClient } from '@erxes/integrations/server';
import { and, asc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { fail, notFound } from '~/http/errors';
import { logger } from '~/logger';
import { buildModelCatalog } from '~/modules/assistant/modelCatalog';
import { modelDisplayName } from '~/modules/assistant/modelThinking';
import { fetchProviderModels } from '~/modules/assistant/providerModels';
import {
  DEFAULT_MODELS,
  providerErrorMessage,
  sanitizeProviderMessage,
} from '~/modules/assistant/providers';
import { manages } from '~/modules/integrations/connectable';
import { clientOf, connectionsWithSecret } from '~/modules/integrations/connections';

const log = logger.child({ component: 'automations' });

export const DEFAULT_DECISION_MODELS: Record<DecisionProvider, string> = {
  typesafe: 'jev-latest',
  openai: DEFAULT_MODELS.openai,
};

const formatJevName = (id: string) => (/^jev-/i.test(id) ? `Jev ${id.slice(4)}` : id);

const FALLBACK_TYPESAFE_MODELS: DecisionModel[] = [
  { id: 'jev-latest', name: 'Jev latest', recommended: true },
  { id: 'jev-preview', name: 'Jev preview', recommended: false },
];

const TypeSafeEntry = z.looseObject({
  id: z.string().optional(),
  name: z.string().optional(),
});

const TypeSafeListing = z.union([
  z.object({ data: z.array(TypeSafeEntry) }),
  z.object({ models: z.array(TypeSafeEntry) }),
  z.array(TypeSafeEntry),
]);

const defaultModelName = (provider: DecisionProvider) => {
  const id = DEFAULT_DECISION_MODELS[provider];

  return provider === 'typesafe' ? formatJevName(id) : (modelDisplayName('openai', id) ?? id);
};

const defaultsOf = (provider: DecisionProvider) => ({
  defaultModel: DEFAULT_DECISION_MODELS[provider],
  defaultModelName: defaultModelName(provider),
});

const typeSafeRank = (id: string) => {
  if (id === DEFAULT_DECISION_MODELS.typesafe) return 0;

  if (/^jev-\d/.test(id)) return 1;

  if (id === 'jev-preview') return 2;

  return 3;
};

const compareTypeSafe = (a: { id: string }, b: { id: string }) => {
  const tier = typeSafeRank(a.id) - typeSafeRank(b.id);

  if (tier !== 0) return tier;

  if (typeSafeRank(a.id) === 1)
    return b.id.localeCompare(a.id, undefined, { numeric: true, sensitivity: 'base' });

  return a.id.localeCompare(b.id);
};

const describeTypeSafeFailure = (status: number, body: unknown, apiKey: string) => {
  const detail = sanitizeProviderMessage(providerErrorMessage(body), apiKey);
  const said = detail ? ` TypeSafe said: "${detail}"` : '';

  if (status === 401)
    return `TypeSafe rejected the connected API key (401). Update it in Settings › Integrations.${said}`;

  if (status === 403) return `TypeSafe refused to list models for this key (403).${said}`;

  if (status === 429)
    return `TypeSafe rate-limited the model list (429). Try again shortly.${said}`;

  return `TypeSafe could not list models (${status}).${said}`;
};

const extractTypeSafeEntries = (body: unknown) => {
  const parsed = TypeSafeListing.safeParse(body);

  if (!parsed.success) return null;

  const raw = Array.isArray(parsed.data)
    ? parsed.data
    : 'data' in parsed.data
      ? parsed.data.data
      : parsed.data.models;

  const seen = new Map<string, string>();

  for (const entry of raw) {
    const id = entry.id?.trim() || entry.name?.trim() || '';

    if (!id || seen.has(id)) continue;

    const given = entry.name?.trim();
    const name = given && given.toLowerCase() !== id.toLowerCase() ? given : formatJevName(id);

    seen.set(id, name);
  }

  return [...seen.entries()]
    .map(([id, name]) => ({ id, name }))
    .toSorted(compareTypeSafe)
    .map((entry, index) => ({
      ...entry,
      recommended: entry.id === DEFAULT_DECISION_MODELS.typesafe || index === 0,
    }));
};

const listTypeSafeModels = async (client: ModelClient) => {
  const response = await fetch(client.modelsUrl, {
    headers: client.headers,
    signal: AbortSignal.timeout(10_000),
  }).catch(() => null);

  if (!response)
    return {
      ...defaultsOf('typesafe'),
      models: [],
      error: 'Could not reach TypeSafe to list models.',
    };

  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 404 || response.status === 405)
      return { ...defaultsOf('typesafe'), models: FALLBACK_TYPESAFE_MODELS, error: null };

    return {
      ...defaultsOf('typesafe'),
      models: [],
      error: describeTypeSafeFailure(response.status, body, client.apiKey),
    };
  }

  const models = extractTypeSafeEntries(body);

  if (!models)
    return {
      ...defaultsOf('typesafe'),
      models: [],
      error: "TypeSafe sent a model list we can't read.",
    };

  return {
    ...defaultsOf('typesafe'),
    models: models.length ? models : FALLBACK_TYPESAFE_MODELS,
    error: null,
  };
};

const listOpenAiModels = async (client: ModelClient) => {
  const listing = await fetchProviderModels({ ...client, provider: 'openai' });

  if (listing.error !== null) return { ...defaultsOf('openai'), models: [], error: listing.error };

  const catalog = buildModelCatalog('openai', listing.entries, [DEFAULT_MODELS.openai]);

  return {
    ...defaultsOf('openai'),
    models: catalog.map((model) => ({
      id: model.id,
      name: modelDisplayName('openai', model.id) ?? model.id,
      recommended: model.recommended,
    })),
    error: null,
  };
};

const openDecisionClient = async (provider: DecisionProvider, connectionId?: string) => {
  const integration = DECISION_INTEGRATIONS[provider];

  return withOrg(requestOrgId(), async (tx) => {
    const active = await connectionsWithSecret(tx)
      .where(
        and(
          eq(integrationConnections.key, integration.key),
          eq(integrationConnections.status, 'active'),
        ),
      )
      .orderBy(asc(integrationConnections.createdAt), asc(integrationConnections.id));

    const row = connectionId ? active.find((item) => item.id === connectionId) : active[0];

    if (!row) {
      if (connectionId) throw notFound('Connection');

      return { status: 'unconnected' as const };
    }

    try {
      return { status: 'ready' as const, client: await clientOf(tx, integration, row) };
    } catch (error) {
      log.warn(
        { err: error, provider, connectionId: row.id },
        'automations: a decision provider connection does not open',
      );

      return {
        status: 'unreadable' as const,
        error: `The ${integration.name} key can't be decrypted on this server (its encryption key changed). Connect it again in Settings › Integrations.`,
      };
    }
  });
};

export const listDecisionModels = async ({
  provider,
  connection,
}: {
  provider: DecisionProvider;
  connection?: string;
}) => {
  const integration = DECISION_INTEGRATIONS[provider];

  if (!manages(integration))
    throw fail('NOT_ALLOWED', "Your role doesn't allow this", {
      permission: integration.permission,
    });

  const opened = await openDecisionClient(provider, connection);

  if (opened.status === 'unconnected') return { ...defaultsOf(provider), models: [], error: null };

  if (opened.status === 'unreadable')
    return { ...defaultsOf(provider), models: [], error: opened.error };

  return provider === 'typesafe'
    ? listTypeSafeModels(opened.client)
    : listOpenAiModels(opened.client);
};
