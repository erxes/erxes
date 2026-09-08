import { IModels } from '~/connectionResolvers';
import { debugError } from '@/integrations/mail/debuggers';

const LEGACY_MESSAGE_INDEX = 'messageId_1';

const SCOPED_MESSAGE_INDEX = 'inboxIntegrationId_1_messageId_1';

const MESSAGE_LOOKUP_INDEX = 'messageId_1_lookup';

const PIPELINE_INTEGRATION_INDEX = 'pipelineId_1';

const INBOX_INTEGRATION_INDEX = 'inboxId_1';

const reconciled = new Set<string>();

interface IExistingIndex {
  name?: string;
  unique?: boolean;
  sparse?: boolean;
  key?: Record<string, unknown>;
}

const isMessageIdLookup = (index: IExistingIndex) => {
  const key = index.key ?? {};

  return Object.keys(key).length === 1 && key.messageId === 1;
};

const reconcileIntegrationIndexes = async (models: IModels) => {
  const collection = models.MailIntegrations.collection;

  const indexes: IExistingIndex[] = await collection.indexes();

  const inboxIndex = indexes.find(
    (index) => Object.keys(index.key ?? {}).join() === 'inboxId',
  );

  if (inboxIndex?.name && !inboxIndex.sparse) {
    await collection.dropIndex(inboxIndex.name);
  }

  await collection.createIndex(
    { inboxId: 1 },
    { unique: true, sparse: true, name: INBOX_INTEGRATION_INDEX },
  );

  await collection.createIndex(
    { pipelineId: 1 },
    { unique: true, sparse: true, name: PIPELINE_INTEGRATION_INDEX },
  );
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

    await reconcileIntegrationIndexes(models);
  } catch (e) {
    reconciled.delete(subdomain);

    debugError('Could not reconcile mail message indexes:', e);
  }
};
