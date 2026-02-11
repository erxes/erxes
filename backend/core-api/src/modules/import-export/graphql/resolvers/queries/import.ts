import { IContext } from '~/connectionResolvers';
import { cursorPaginate } from 'erxes-api-shared/utils';

const mapImportWithMetrics = (importDoc: any) => {
  const progress =
    importDoc.totalRows > 0
      ? Math.round((importDoc.processedRows / importDoc.totalRows) * 100)
      : 0;

  const elapsedSeconds = importDoc.startedAt
    ? Math.floor((Date.now() - new Date(importDoc.startedAt).getTime()) / 1000)
    : 0;

  const rowsPerSecond =
    elapsedSeconds > 0 && importDoc.processedRows > 0
      ? Math.round(importDoc.processedRows / elapsedSeconds)
      : 0;

  const remainingRows = importDoc.totalRows - importDoc.processedRows;
  const estimatedSecondsRemaining =
    rowsPerSecond > 0 ? Math.round(remainingRows / rowsPerSecond) : 0;

  return {
    ...importDoc,
    progress,
    elapsedSeconds,
    rowsPerSecond,
    estimatedSecondsRemaining,
  };
};

export const importQueries = {
  async importProgress(
    _root: undefined,
    { importId }: { importId: string },
    { models }: IContext,
  ) {
    const importDoc = await models.Imports.getImport(importId);

    if (!importDoc) {
      throw new Error('Import not found');
    }

    return mapImportWithMetrics(importDoc);
  },

  async activeImports(
    _root: undefined,
    { entityType }: { entityType?: string },
    { models }: IContext,
  ) {
    const query: any = {};

    if (entityType) {
      query.entityType = entityType;
    }

    const imports = await models.Imports.find(query)
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();

    return imports.map(mapImportWithMetrics);
  },

  async importHistories(
    _root: undefined,
    args: {
      entityType?: string;
      limit?: number;
      cursor?: string;
      direction?: 'forward' | 'backward';
      cursorMode?: string;
    },
    { models, subdomain, user }: IContext,
  ) {
    const { entityType, ...cursorArgs } = args;

    const query: any = {
      subdomain,
      userId: user._id,
    };

    if (entityType) {
      query.entityType = entityType;
    }

    const { list, totalCount, pageInfo } = await cursorPaginate<any>({
      model: models.Imports as any,
      params: {
        ...cursorArgs,
        orderBy: { createdAt: -1 },
      },
      query,
    });

    return {
      list: list.map(mapImportWithMetrics),
      totalCount,
      pageInfo,
    };
  },
};
