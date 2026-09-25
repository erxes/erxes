import { IModels } from '~/connectionResolvers';
import { getValueAsString } from '~/modules/organization/settings/db/models/Configs';
import { CAMPAIGN_METHODS } from '../constants';
import { IEngageMessageDocument } from '../@types';
import { resolveCampaignFromEmail } from './engage';
import { publishBroadcastChanged } from './publishBroadcast';
import { customerTargetFilter } from './targeting';
import { addBroadcastWorkerQueue, BROADCAST_QUEUES } from './worker';
import { scheduleHeartbeat } from '../worker/drain';
import { findCampaignAutomation } from './workflowAutomation';

const CUSTOMER_BATCH_SIZE = 1000;
const MAX_DRAIN_WORKERS = 4;

const countAllCustomers = ({
  models,
  targetType,
  targetIds,
}: {
  models: IModels;
  targetType: string;
  targetIds: string[];
}) => {
  return models.Customers.countDocuments(
    customerTargetFilter(targetType, targetIds),
  );
};

/**
 * Everyone the campaign's audience matches, as a cursor.
 *
 * No filtering here beyond the audience itself. Someone with no address or an
 * unsubscribe is still part of who was targeted, and the manifest says so with
 * a reason rather than leaving them out of the record entirely.
 */
const prepareAudience = ({
  models,
  targetType,
  targetIds,
}: {
  models: IModels;
  targetType: string;
  targetIds: string[];
}) =>
  models.Customers.find(customerTargetFilter(targetType, targetIds), { _id: 1 })
    .batchSize(CUSTOMER_BATCH_SIZE)
    .lean();

/**
 * Opens a run: freezes what it sends, writes down who it is for, and sets the
 * drains going. Every method reaches its recipients the same way, so only what
 * a delivery needs beyond the campaign differs.
 */
const startManifestRun = async ({
  models,
  subdomain,
  engageMessage,
  extras,
}: {
  models: IModels;
  subdomain: string;
  engageMessage: IEngageMessageDocument;
  extras?: { automationId?: string; configSet?: string; scheduledFor?: Date };
}) => {
  const { _id, targetType, targetIds } = engageMessage;

  const totalCustomersCount = await countAllCustomers({
    models,
    targetType,
    targetIds,
  });

  const started = await models.EngageMessages.findOneAndUpdate(
    { _id },
    {
      $set: {
        status: 'sending',
        lastRunAt: new Date(),
        totalCustomersCount,
        'progress.processedBatches': 0,
        'progress.totalBatches': 0,
        'progress.successCount': 0,
        'progress.failureCount': 0,
        'progress.lastUpdated': new Date(),
      },
      $inc: { runCount: 1 },
    },
    { new: true },
  );

  const runCount = started?.runCount || 1;

  const run = await models.BroadcastRuns.startRun(
    engageMessage,
    runCount,
    extras,
  );

  let enrolled = 0;
  let block: string[] = [];

  for await (const customer of prepareAudience({
    models,
    targetType,
    targetIds,
  })) {
    block.push(customer._id);

    if (block.length >= CUSTOMER_BATCH_SIZE) {
      enrolled += await models.BroadcastRecipients.enrol(
        run._id,
        _id,
        block,
        extras?.automationId,
      );
      block = [];
    }
  }

  if (block.length) {
    enrolled += await models.BroadcastRecipients.enrol(
      run._id,
      _id,
      block,
      extras?.automationId,
    );
  }

  await models.BroadcastRuns.updateOne(
    { _id: run._id },
    { $set: { totalCount: enrolled } },
  );

  await models.EngageMessages.updateOne(
    { _id },
    { $set: { 'progress.totalBatches': enrolled } },
  );

  publishBroadcastChanged(subdomain, {
    engageMessageId: _id,
    status: 'sending',
    progress: {
      totalBatches: enrolled,
      processedBatches: 0,
      successCount: 0,
      failureCount: 0,
    },
  });

  await queueDrains({
    subdomain,
    engageMessage,
    runId: run._id,
    runCount,
    remaining: enrolled,
  });
};

const sendBroadcastEmail = async ({
  models,
  subdomain,
  engageMessage,
  scheduledFor,
}: {
  models: IModels;
  subdomain: string;
  engageMessage: IEngageMessageDocument;
  scheduledFor?: Date;
}) => {
  const fromEmail = await resolveCampaignFromEmail(models, engageMessage);

  if (!fromEmail) {
    throw new Error('Invalid from sender');
  }

  const configSet = await getValueAsString(
    models,
    'BROADCAST_AWS_SES_CONFIG_SET',
    'AWS_SES_CONFIG_SET',
    'erxes',
  );
  await startManifestRun({
    models,
    subdomain,
    engageMessage: {
      ...engageMessage.toObject(),
      fromEmail,
    } as IEngageMessageDocument,
    extras: { configSet, scheduledFor },
  });
};

const sendBroadcastNotification = async ({
  models,
  subdomain,
  engageMessage,
  scheduledFor,
}: {
  models: IModels;
  subdomain: string;
  engageMessage: IEngageMessageDocument;
  scheduledFor?: Date;
}) => {
  const { cpId } = engageMessage;

  if (!cpId) {
    throw new Error(
      'Please select "Clientportal" in the notification campaign',
    );
  }

  const clientPortal = await models.ClientPortal.findOne({ _id: cpId }).lean();

  if (!clientPortal) {
    throw new Error('Client portal not found');
  }

  await startManifestRun({
    models,
    subdomain,
    engageMessage,
    extras: { scheduledFor },
  });
};

const queueDrains = async ({
  subdomain,
  engageMessage,
  runId,
  runCount,
  remaining,
}: {
  subdomain: string;
  engageMessage: IEngageMessageDocument;
  runId: string;
  runCount: number;
  remaining: number;
}) => {
  const workers = Math.min(
    Math.max(Math.ceil(remaining / CUSTOMER_BATCH_SIZE), 1),
    MAX_DRAIN_WORKERS,
  );
  const attempt = Date.now();

  await scheduleHeartbeat({
    subdomain,
    runId,
    campaignTitle: engageMessage.title,
  });

  for (let index = 0; index < workers; index++) {
    await addBroadcastWorkerQueue({
      queueName: BROADCAST_QUEUES.SENDING,
      data: {
        method: engageMessage.method,
        payload: { runId, subdomain, campaignTitle: engageMessage.title },
      },
      jobId: `${engageMessage._id}_run${runCount}_drain${index}_${attempt}`,
    });
  }
};

/**
 * Going live again after a pause continues the run that stopped rather than
 * enrolling the audience a second time. Re-targeting is a new run, which is
 * what going live on a finished campaign gives.
 */
const resumeRun = async ({
  models,
  subdomain,
  engageMessage,
}: {
  models: IModels;
  subdomain: string;
  engageMessage: IEngageMessageDocument;
}) => {
  const run = await models.BroadcastRuns.findOne({
    engageMessageId: engageMessage._id,
    status: 'running',
  })
    .sort({ runCount: -1 })
    .lean();

  if (!run) {
    return false;
  }

  const remaining = await models.BroadcastRecipients.countDocuments({
    runId: run._id,
    status: { $in: ['pending', 'claimed'] },
  });

  if (!remaining) {
    return false;
  }

  await models.EngageMessages.updateOne(
    { _id: engageMessage._id },
    { $set: { status: 'sending' } },
  );

  publishBroadcastChanged(subdomain, {
    engageMessageId: engageMessage._id,
    status: 'sending',
  });

  await models.BroadcastTraces.createTrace(
    engageMessage._id,
    'regular',
    `Resumed run ${run.runCount} with ${remaining} recipients left.`,
  );

  await queueDrains({
    subdomain,
    engageMessage,
    runId: run._id,
    runCount: run.runCount,
    remaining,
  });

  return true;
};

const sendBroadcastWorkflow = async ({
  models,
  subdomain,
  engageMessage,
  scheduledFor,
}: {
  models: IModels;
  subdomain: string;
  engageMessage: IEngageMessageDocument;
  scheduledFor?: Date;
}) => {
  const automation = await findCampaignAutomation(models, engageMessage._id);

  if (!automation) {
    throw new Error('This campaign has no workflow');
  }

  await startManifestRun({
    models,
    subdomain,
    engageMessage,
    extras: { automationId: automation._id, scheduledFor },
  });
};

export const sendBroadcast = async ({
  models,
  subdomain,
  engageMessage,
  scheduledFor,
}: {
  models: IModels;
  subdomain: string;
  engageMessage: IEngageMessageDocument;
  /** The occurrence this send belongs to, when a schedule opened it. */
  scheduledFor?: Date;
}) => {
  const { method } = engageMessage;

  // Going live again continues the run that stopped rather than enrolling the
  // audience a second time. Re-targeting is a new run, which is what going
  // live on a finished campaign gives.
  if (await resumeRun({ models, subdomain, engageMessage })) {
    return;
  }

  if (method === 'email') {
    return sendBroadcastEmail({
      models,
      subdomain,
      engageMessage,
      scheduledFor,
    });
  }

  if (method === 'notification') {
    return sendBroadcastNotification({
      models,
      subdomain,
      engageMessage,
      scheduledFor,
    });
  }

  if (method === CAMPAIGN_METHODS.WORKFLOW) {
    return sendBroadcastWorkflow({
      models,
      subdomain,
      engageMessage,
      scheduledFor,
    });
  }
};
