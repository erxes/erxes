import { IContext } from '~/connectionResolvers';
import {
  sendCoreModuleProducer,
  sendTRPCMessage,
} from 'erxes-api-shared/utils';
import {
  splitType,
  TImportExportProducers,
} from 'erxes-api-shared/core-modules';
import { validateExportConfig } from '~/modules/import-export/utils/validateConfig';

export const exportQueries = {
  async exportProgress(
    _root: undefined,
    { exportId }: { exportId: string },
    { models, subdomain, user }: IContext,
  ) {
    const exportDoc = await models.Exports.getExport(exportId);

    if (!exportDoc) {
      throw new Error('Export not found');
    }

    if (exportDoc.userId !== user._id) {
      throw new Error('Unauthorized');
    }

    return exportDoc;
  },

  async activeExports(
    _root: undefined,
    { entityType }: { entityType?: string },
    { models, subdomain, user }: IContext,
  ) {
    const query: any = {
      subdomain,
      userId: user._id,
    };

    if (entityType) {
      query.entityType = entityType;
    }

    // Get last 3 exports (including completed/failed for retry)
    const exports = await models.Exports.find(query)
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();

    return exports.map((exportDoc) => {
      const progress =
        exportDoc.totalRows > 0
          ? Math.round((exportDoc.processedRows / exportDoc.totalRows) * 100)
          : 0;

      const elapsedSeconds = exportDoc.startedAt
        ? Math.floor(
            (Date.now() - new Date(exportDoc.startedAt).getTime()) / 1000,
          )
        : 0;

      const rowsPerSecond =
        elapsedSeconds > 0 && exportDoc.processedRows > 0
          ? Math.round(exportDoc.processedRows / elapsedSeconds)
          : 0;

      const remainingRows = Math.max(
        0,
        exportDoc.totalRows - exportDoc.processedRows,
      );
      const estimatedSecondsRemaining =
        (exportDoc as any).estimatedSecondsRemaining ||
        (rowsPerSecond > 0 ? Math.round(remainingRows / rowsPerSecond) : 0);

      return {
        ...exportDoc,
        progress,
        elapsedSeconds,
        rowsPerSecond,
        estimatedSecondsRemaining,
      };
    });
  },

  async exportHeaders(
    _root: undefined,
    { entityType }: { entityType: string },
    { subdomain }: IContext,
  ) {
    const [pluginName, moduleName, collectionName] = splitType(entityType);

    await validateExportConfig({
      pluginName,
      collectionName,
      requireGetExportHeaders: true,
    });

    return await sendCoreModuleProducer({
      subdomain,
      pluginName,
      moduleName: 'importExport',
      method: 'query',
      producerName: TImportExportProducers.GET_EXPORT_HEADERS,
      input: {
        moduleName,
        collectionName,
      },
      defaultValue: [],
    });
  },
};
