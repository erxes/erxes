import { Job } from 'bullmq';
import {
  createMQWorkerWithListeners,
  redis,
  sendWorkerQueue,
} from 'erxes-api-shared/utils';
import { generateModels } from '~/connectionResolvers';
import { FILES_QUEUE, FILES_SWEEP_EVERY_MS } from '@/files/constants';
import { TFilesPreviewResult, TFilesSweepResult } from '@/files/db/models/Files';

type TFilesJob = { subdomain: string; versionId?: string; folderId?: string };

const armed = new Set<string>();
let started = false;

// The returned counts are kept on the job, so each run can be inspected.
const filesProcessor = async (
  job: Job<TFilesJob>,
): Promise<TFilesSweepResult | TFilesPreviewResult | { folders: number }> => {
  const models = await generateModels(job.data.subdomain);

  if (job.name === 'preview' && job.data.versionId) {
    return models.Files.derivePreview(job.data.versionId);
  }

  // Queued by FileFolders.refreshAccess for trees too big to rewrite in a request.
  if (job.name === 'access' && job.data.folderId) {
    return { folders: await models.FileFolders.recomputeAccess(job.data.folderId) };
  }

  return models.Files.sweep();
};

export const startFilesWorker = () => {
  if (started) {
    return;
  }

  started = true;

  createMQWorkerWithListeners('core', FILES_QUEUE, filesProcessor, redis, () => {
    console.log(`Worker for queue ${FILES_QUEUE} is ready`);
  });
};

/**
 * There is no tenant list to walk on start-up, so each tenant arms its own
 * hourly sweep the first time it uploads or trashes something.
 */
export const scheduleFilesSweep = async (subdomain: string) => {
  if (armed.has(subdomain)) {
    return;
  }

  armed.add(subdomain);

  try {
    await sendWorkerQueue('core', FILES_QUEUE).upsertJobScheduler(
      `files-sweep-${subdomain}`,
      { every: FILES_SWEEP_EVERY_MS },
      {
        name: 'sweep',
        data: { subdomain },
        opts: { removeOnComplete: 24, removeOnFail: 50 },
      },
    );
  } catch {
    armed.delete(subdomain);
  }
};

// One job per version: a retried complete call never builds it twice.
export const queueFilesPreview = async (subdomain: string, versionId: string) => {
  await sendWorkerQueue('core', FILES_QUEUE).add(
    'preview',
    { subdomain, versionId },
    {
      jobId: `files-preview-${versionId}`,
      removeOnComplete: 100,
      removeOnFail: 100,
    },
  );
};
