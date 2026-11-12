import { IModels } from '~/connectionResolvers';

const LEGACY_TEAM_INDEX = 'teamId_1_subdomain_1';

const NAMESPACE_NOT_FOUND = 26;

const reconciled = new Set<string>();

const reconciling = new Map<string, Promise<void>>();

type TExistingIndex = { name?: string; unique?: boolean };

const isNamespaceNotFound = (error: unknown) =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  error.code === NAMESPACE_NOT_FOUND;

const listConfigIndexes = async (
  models: IModels,
): Promise<TExistingIndex[]> => {
  try {
    return await models.DiscordConfig.collection.indexes();
  } catch (error) {
    if (isNamespaceNotFound(error)) {
      return [];
    }

    throw error;
  }
};

const reconcileDiscordConfigIndexes = async (models: IModels) => {
  const indexes = await listConfigIndexes(models);

  if (
    indexes.some((index) => index.name === LEGACY_TEAM_INDEX && index.unique)
  ) {
    await models.DiscordConfig.collection.dropIndex(LEGACY_TEAM_INDEX);
  }

  await models.DiscordConfig.createIndexes();
};

export const ensureDiscordConfigIndexes = (
  models: IModels,
  subdomain: string,
): Promise<void> => {
  if (reconciled.has(subdomain)) {
    return Promise.resolve();
  }

  const running = reconciling.get(subdomain);

  if (running) {
    return running;
  }

  const run = reconcileDiscordConfigIndexes(models)
    .then(() => {
      reconciled.add(subdomain);
    })
    .finally(() => {
      reconciling.delete(subdomain);
    });

  reconciling.set(subdomain, run);

  return run;
};
