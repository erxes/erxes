import { nanoid } from 'nanoid';
import { sendWorkerQueue } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { splitType } from 'erxes-api-shared/core-modules';

async function getJobIdFromQueue(
  subdomain: string,
  importId: string,
  pluginName: string,
): Promise<string | null> {
  const queue = sendWorkerQueue(pluginName, 'import-processor');
  const jobs = await queue.getJobs(['active', 'waiting', 'delayed']);
  const job = jobs.find(
    (j) => j.data.subdomain === subdomain && j.data.data.importId === importId,
  );
  return job ? String(job.id) : null;
}

export const importMutations = {
  async importStart(
    _root: undefined,
    {
      entityType,
      fileKey,
      fileName,
    }: { entityType: string; fileKey: string; fileName: string },
    { models, subdomain, user }: IContext,
  ) {
    const [pluginName, moduleName, collectionName] = splitType(entityType);

    const importDoc = await models.Imports.create({
      _id: nanoid(),
      entityType,
      pluginName,
      moduleName,
      collectionName,
      fileKey,
      fileName,
      status: 'pending',
      userId: user._id,
      subdomain,
    });

    const queue = sendWorkerQueue(pluginName, 'import-processor');
    const job = await queue.add(
      'processImport',
      {
        subdomain,
        data: {
          importId: importDoc._id,
          entityType,
          fileKey,
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

    await models.Imports.updateOne(
      { _id: importDoc._id },
      { $set: { jobId: String(job.id) } },
    );

    return { ...importDoc, jobId: String(job.id) };
  },

  async importCancel(
    _root: undefined,
    { importId }: { importId: string },
    { models, subdomain, user }: IContext,
  ) {
    const importDoc = await models.Imports.getImport(importId);

    if (!importDoc) {
      throw new Error('Import not found');
    }

    if (importDoc.userId !== user._id) {
      throw new Error('Unauthorized');
    }

    if (
      importDoc.status === 'completed' ||
      importDoc.status === 'failed' ||
      importDoc.status === 'cancelled'
    ) {
      throw new Error(`Cannot cancel import with status: ${importDoc.status}`);
    }

    const queue = sendWorkerQueue(importDoc.pluginName, 'import-processor');

    if (importDoc.jobId) {
      try {
        const job = await queue.getJob(importDoc.jobId);
        if (job) {
          const state = await job.getState();
          if (
            state === 'active' ||
            state === 'waiting' ||
            state === 'delayed'
          ) {
            await job.remove();
          }
        }
      } catch (error) {
        // Job might not exist, continue anyway
      }
    } else {
      // Try to find job by importId
      const jobId = await getJobIdFromQueue(
        subdomain,
        importId,
        importDoc.pluginName,
      );
      if (jobId) {
        try {
          const job = await queue.getJob(jobId);
          if (job) {
            const state = await job.getState();
            if (
              state === 'active' ||
              state === 'waiting' ||
              state === 'delayed'
            ) {
              await job.remove();
            }
          }
        } catch (error) {
          // Job might not exist, continue anyway
        }
      }
    }

    await models.Imports.updateImportProgress(importId, {
      status: 'cancelled',
    });

    return models.Imports.getImport(importId);
  },

  async importRetry(
    _root: undefined,
    { importId }: { importId: string },
    { models, subdomain, user }: IContext,
  ) {
    const importDoc = await models.Imports.getImport(importId);

    if (!importDoc) {
      throw new Error('Import not found');
    }

    if (importDoc.userId !== user._id) {
      throw new Error('Unauthorized');
    }

    if (importDoc.status !== 'failed') {
      throw new Error(
        `Can only retry failed imports. Current status: ${importDoc.status}`,
      );
    }

    const queue = sendWorkerQueue(importDoc.pluginName, 'import-processor');
    const job = await queue.add(
      'processImport',
      {
        subdomain,
        data: {
          importId: importDoc._id,
          entityType: importDoc.entityType,
          fileKey: importDoc.fileKey,
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

    await models.Imports.updateOne(
      { _id: importId },
      {
        $set: {
          jobId: String(job.id),
          status: 'pending',
          processedRows: 0,
          successRows: 0,
          errorRows: 0,
          totalRows: 0,
        },
        $unset: {
          completedAt: 1,
        },
      },
    );

    return models.Imports.getImport(importId);
  },

  async importResume(
    _root: undefined,
    { importId }: { importId: string },
    { models, subdomain, user }: IContext,
  ) {
    const importDoc = await models.Imports.getImport(importId);

    if (!importDoc) {
      throw new Error('Import not found');
    }

    if (importDoc.userId !== user._id) {
      throw new Error('Unauthorized');
    }

    if (importDoc.status !== 'cancelled' && importDoc.status !== 'failed') {
      throw new Error(
        `Can only resume cancelled or failed imports. Current status: ${importDoc.status}`,
      );
    }

    const queue = sendWorkerQueue(importDoc.pluginName, 'import-processor');
    const job = await queue.add(
      'processImport',
      {
        subdomain,
        data: {
          importId: importDoc._id,
          entityType: importDoc.entityType,
          fileKey: importDoc.fileKey,
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

    await models.Imports.updateOne(
      { _id: importId },
      {
        $set: {
          jobId: String(job.id),
          status: 'pending',
        },
        $unset: {
          completedAt: 1,
        },
      },
    );

    return models.Imports.getImport(importId);
  },
};
