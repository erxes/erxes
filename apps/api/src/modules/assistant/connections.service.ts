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

export const modelKey = async (
  client: Db,
  asked: { provider?: AssistantProvider | undefined; model?: string | undefined } = {},
) => {
  const connected = await connectedProviders(client);
  const settings = await getSettings(client);
  const byDefault = connected.find((entry) => entry.provider === settings.defaultProvider);
  const provider = asked.provider ?? (byDefault ?? connected[0])?.provider;
  const key = usable(connected.find((entry) => entry.provider === provider));

  const fallback =
    key.provider === settings.defaultProvider && settings.defaultModel
      ? settings.defaultModel
      : DEFAULT_MODELS[key.provider];

  return { ...key, model: asked.model ?? fallback };
};
