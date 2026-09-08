import { IModels } from '~/connectionResolvers';
import { debugError } from '@/integrations/mail/debuggers';

const LEGACY_MESSAGE_INDEX = 'messageId_1';

const SCOPED_MESSAGE_INDEX = 'inboxIntegrationId_1_messageId_1';

const MESSAGE_LOOKUP_INDEX = 'messageId_1_lookup';

const reconciled = new Set<string>();

interface IExistingIndex {
  name?: string;
  unique?: boolean;
  key?: Record<string, unknown>;
}

const isMessageIdLookup = (index: IExistingIndex) => {
  const key = index.key ?? {};

  return Object.keys(key).length === 1 && key.messageId === 1;
};

export const ensureMailIndexes = async (
  models: IModels,
  subdomain: string,
): Promise<void> => {
  if (reconciled.has(subdomain)) {
    return;
  }

  reconciled.add(subdomain);

  const collection = models.MailMessages.collection;

  try {
    const indexes: IExistingIndex[] = await collection.indexes();
    const byName = (name: string) =>
      indexes.find((index) => index.name === name);

    const legacy = byName(LEGACY_MESSAGE_INDEX);
    const droppedLegacy = Boolean(legacy?.unique);

    if (droppedLegacy) {
      await collection.dropIndex(LEGACY_MESSAGE_INDEX);
    }

    if (!byName(SCOPED_MESSAGE_INDEX)) {
      await collection.createIndex(
        { inboxIntegrationId: 1, messageId: 1 },
        { unique: true, name: SCOPED_MESSAGE_INDEX },
      );
    }

    const keepsMessageIdLookup = indexes.some(
      (index) =>
        isMessageIdLookup(index) &&
        !(droppedLegacy && index.name === LEGACY_MESSAGE_INDEX),
    );

    if (!keepsMessageIdLookup) {
      await collection.createIndex(
        { messageId: 1 },
        { name: MESSAGE_LOOKUP_INDEX },
      );
    }
  } catch (e) {
    reconciled.delete(subdomain);

    debugError('Could not reconcile mail message indexes:', e);
  }
};
