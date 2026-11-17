import { TAiKnowledgeSourceIndexStatus } from 'ui-modules';

export type TAiProductKnowledgeConfig = {
  includeCategoryIds: string[];
  includeProductIds: string[];
  excludeCategoryIds: string[];
  excludeProductIds: string[];
};

export type TProductKnowledgeField = keyof TAiProductKnowledgeConfig;

const SCOPE_RUN_PREFIX = '__scope_run__:';

export const toArrayValue = (value: string[] | string) =>
  Array.isArray(value) ? value : [value].filter(Boolean);

// The ids of a stored list, or undefined when nothing was stored
const stringIds = (value: unknown) =>
  Array.isArray(value)
    ? value.filter((id): id is string => typeof id === 'string')
    : undefined;

const firstNonEmpty = (...lists: (string[] | undefined)[]) =>
  lists.find((list) => list?.length) || [];

/**
 * The stored config with the legacy `categoryIds`/`productIds` read as the
 * include lists, and the agent's chosen products as a last fallback.
 */
export const normalizeProductKnowledgeConfig = (
  value?: Record<string, unknown>,
  fallbackProductIds: string[] = [],
): TAiProductKnowledgeConfig => ({
  includeCategoryIds:
    stringIds(value?.includeCategoryIds) ?? stringIds(value?.categoryIds) ?? [],
  includeProductIds:
    stringIds(value?.includeProductIds) ??
    firstNonEmpty(stringIds(value?.productIds), fallbackProductIds),
  excludeCategoryIds: stringIds(value?.excludeCategoryIds) ?? [],
  excludeProductIds: stringIds(value?.excludeProductIds) ?? [],
});

const isScopeRun = ({ sourceId }: TAiKnowledgeSourceIndexStatus) =>
  sourceId.startsWith(SCOPE_RUN_PREFIX);

export const indexedProductCount = (
  statuses: TAiKnowledgeSourceIndexStatus[],
) =>
  statuses.filter(
    (status) => status.status === 'indexed' && !isScopeRun(status),
  ).length;

/** The running index job's progress, or null when none is running. */
export const indexProgressOf = (statuses: TAiKnowledgeSourceIndexStatus[]) => {
  const latestRun = statuses.find(isScopeRun);

  return latestRun?.status === 'indexing' || latestRun?.status === 'queued'
    ? {
        processed: latestRun.processedCount || 0,
        total: latestRun.totalCount || 0,
      }
    : null;
};
