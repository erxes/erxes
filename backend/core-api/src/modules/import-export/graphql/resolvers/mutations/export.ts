import { sendWorkerQueue } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { splitType } from 'erxes-api-shared/core-modules';
import { validateExportConfig } from '~/modules/import-export/utils/validateConfig';

async function getJobIdFromQueue(
  subdomain: string,
  exportId: string,
  pluginName: string,
): Promise<string | null> {
  const queue = sendWorkerQueue(pluginName, 'export-processor');
  const jobs = await queue.getJobs(['active', 'waiting', 'delayed']);
  const job = jobs.find(
    (j) => j.data.subdomain === subdomain && j.data.data.exportId === exportId,
  );
  return job ? String(job.id) : null;
}

export const exportMutations = {
  async exportStart(
    _root: undefined,
    {
      entityType,
      fileFormat = 'csv',
      filters,
      ids,
      selectedFields,
    }: {
      entityType: string;
      fileFormat?: 'csv' | 'xlsx';
      filters?: Record<string, any>;
      ids?: string[];
      selectedFields?: string[];
    },
    { models, subdomain, user }: IContext,
  ) {
    const [pluginName, moduleName, collectionName] = splitType(entityType);

    await validateExportConfig({
      pluginName,
      collectionName,
      requireGetExportHeaders: true,
    });

    const fileName = `export-${entityType}-${Date.now()}`;

    const exportDoc = await models.Exports.create({
      entityType,
      pluginName,
      moduleName,
      collectionName,
      fileName,
      status: 'pending',
      fileFormat,
      filters: filters || {},
      ids: ids || [],
      selectedFields: selectedFields || [],
      userId: user._id,
      subdomain,
    });

    const queue = sendWorkerQueue(pluginName, 'export-processor');
    const job = await queue.add(
      'processExport',
      {
        subdomain,
        data: {
          exportId: exportDoc._id,
          entityType,
          fileFormat,
        },
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    );

    await models.Exports.updateOne(
      { _id: exportDoc._id },
      { $set: { jobId: String(job.id) } },
    );

    return { ...exportDoc, jobId: String(job.id) };
  },

  async exportCancel(
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

    if (exportDoc.status === 'completed' || exportDoc.status === 'failed') {
      throw new Error(`Cannot cancel ${exportDoc.status} export`);
    }

    const jobId = await getJobIdFromQueue(
      subdomain,
      exportId,
      exportDoc.pluginName,
    );

    if (jobId) {
      const queue = sendWorkerQueue(exportDoc.pluginName, 'export-processor');
      const job = await queue.getJob(jobId);
      if (job) {
        await job.remove();
      }
    }

    await models.Exports.updateOne(
      { _id: exportId },
      {
        $set: {
          status: 'cancelled',
          completedAt: new Date(),
        },
      },
    );

    return models.Exports.getExport(exportId);
  },

  async exportRetry(
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

    if (exportDoc.status !== 'failed') {
      throw new Error('Can only retry failed exports');
    }

    if (!exportDoc.lastCursor) {
      throw new Error('Cannot retry: no cursor position saved');
    }

    // Reset status and restart the job
    await models.Exports.updateOne(
      { _id: exportId },
      {
        $set: {
          status: 'pending',
          errorMessage: undefined,
        },
      },
    );

    const queue = sendWorkerQueue(exportDoc.pluginName, 'export-processor');
    const job = await queue.add(
      'processExport',
      {
        subdomain,
        data: {
          exportId: exportDoc._id,
          entityType: exportDoc.entityType,
          fileFormat: exportDoc.fileFormat,
        },
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    );

    await models.Exports.updateOne(
      { _id: exportId },
      { $set: { jobId: String(job.id) } },
    );

    return models.Exports.getExport(exportId);
  },
};
