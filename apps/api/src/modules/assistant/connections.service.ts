import type { AssistantProvider } from '@erxes/core-contract';
import type { Db } from '@erxes/core-db';
import { fail } from '~/http/errors';
import { type ConnectedProvider, connectedProviders } from './connectedProviders';
import { DEFAULT_MODELS, unreadableKey } from './providers';
import { getSettings } from './settings.service';

const usable = (connected: ConnectedProvider | undefined) => {
  if (!connected) {
    throw fail(
      'ASSISTANT_NO_CONNECTION',
      'Connect an AI provider in Settings › Integrations › AI Provider to use the assistant',
    );
  }

  if (!connected.key) throw fail('ASSISTANT_KEY_UNREADABLE', unreadableKey(connected.provider));

  return connected.key;
};

type Asked = { provider?: AssistantProvider | undefined; model?: string | undefined };

/**
 * The connection and model a run asks for, else the organisation's default provider and model;
 * no connection when that provider isn't connected.
 */
export const chosenModel = async (client: Db, asked: Asked = {}) => {
  const connected = await connectedProviders(client);
  const settings = await getSettings(client);
  const byDefault = connected.find((entry) => entry.provider === settings.defaultProvider);
  const provider = asked.provider ?? (byDefault ?? connected[0])?.provider;

  const fallback =
    provider && provider === settings.defaultProvider && settings.defaultModel
      ? settings.defaultModel
      : provider && DEFAULT_MODELS[provider];

  return {
    connection: connected.find((entry) => entry.provider === provider),
    model: asked.model ?? fallback,
  };
};

export const modelKey = async (client: Db, asked: Asked = {}) => {
  const { connection, model } = await chosenModel(client, asked);
  const key = usable(connection);

  return { ...key, model: model ?? DEFAULT_MODELS[key.provider] };
};
