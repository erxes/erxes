import { sendCoreModuleProducer } from 'erxes-api-shared/utils';
import { TImportExportProducers } from 'erxes-api-shared/core-modules';

interface ProcessBatchParams {
  subdomain: string;
  pluginName: string;
  moduleName: string;
  collectionName: string;
  batch: any[];
}

export async function processBatch({
  subdomain,
  pluginName,
  moduleName,
  collectionName,
  batch,
}: ProcessBatchParams): Promise<{ successIds: string[]; errorRows: any[] }> {
  try {
    const result = await sendCoreModuleProducer({
      subdomain,
      moduleName: 'importExport',
      pluginName,
      producerName: TImportExportProducers.INSERT_IMPORT_ROWS,
      input: {
        moduleName,
        collectionName,
        rows: batch,
      },
      defaultValue: { successRows: [], errorRows: [] },
    });

    const successIds =
      result.successRows?.map((r: any) => r._id || r.id).filter(Boolean) || [];
    const errorRows = result.errorRows || [];

    return { successIds, errorRows };
  } catch (error) {
    // If the entire batch fails, mark all rows as errors with the error message
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to process batch';
    const errorRows = batch.map((row) => ({
      ...row,
      error: errorMessage,
    }));

    return { successIds: [], errorRows };
  }
}
