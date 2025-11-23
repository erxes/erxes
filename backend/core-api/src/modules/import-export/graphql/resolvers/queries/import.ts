import { IContext } from '~/connectionResolvers';

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

    const progress =
      importDoc.totalRows > 0
        ? Math.round((importDoc.processedRows / importDoc.totalRows) * 100)
        : 0;

    const elapsedSeconds = importDoc.startedAt
      ? Math.floor(
          (Date.now() - new Date(importDoc.startedAt).getTime()) / 1000,
        )
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

    return imports.map((importDoc) => {
      const progress =
        importDoc.totalRows > 0
          ? Math.round((importDoc.processedRows / importDoc.totalRows) * 100)
          : 0;

      const elapsedSeconds = importDoc.startedAt
        ? Math.floor(
            (Date.now() - new Date(importDoc.startedAt).getTime()) / 1000,
          )
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
    });
  },
};
