import dayjs from 'dayjs';
import * as _ from 'lodash';
import { generateModels, IModels } from '~/connectionResolvers';
import { blocksToHtml } from '~/modules/documents/blocksToHtml';
import { replaceContent } from '~/modules/documents/utils';
import { deliverEmail, normalizeEmail } from 'erxes-api-shared/utils';
import {
  formatPostalAddress,
  getPostalAddress,
} from '~/utils/email/postalAddress';
import { unsubscribeUrl } from '~/utils/email/links';
import { claim } from '~/utils/email/ramp';
import {
  createDeliveryLogPort,
  createSuppressionPort,
} from '~/utils/email/ports';
import { addBroadcastWorkerQueue } from '../utils/worker';
import { prepareEmailParams, readFileUrl } from '../utils';
import {
  getBroadcastAlignedFrom,
  getBroadcastCacheKey,
  getBroadcastEmailConfig,
  toOutboundEmail,
} from '../utils/outboundEmail';

const CHUNK_SIZE = 50; // Send 50 emails at a time
const CHUNK_DELAY = 2000; // 2 second delay between each chunk
const FAILURE_THRESHOLD = 0.8; // Mark as failed if 80% of emails fail

const listUnsubscribed = async (models: IModels, chunk: any[]) => {
  const ids = await models.Customers.find({
    _id: { $in: chunk.map((customer) => customer._id) },
    isSubscribed: { $exists: true, $ne: 'Yes' },
  }).distinct('_id');

  return new Set(ids.map(String));
};

const claimChunk = async (models: IModels, chunk: any[]) => {
  const proven = await models.EmailAddresses.listProven(
    chunk.map((customer) => customer.primaryEmail),
  );

  const allowed = new Set<string>();
  const unproven: any[] = [];

  for (const customer of chunk) {
    if (proven.has(normalizeEmail(customer.primaryEmail || ''))) {
      allowed.add(String(customer._id));
    } else {
      unproven.push(customer);
    }
  }

  const granted = await claim(models, unproven.length);

  for (const customer of unproven.slice(0, granted)) {
    allowed.add(String(customer._id));
  }

  return allowed;
};

/** Resumes at the next UTC midnight, when the daily allowance resets. */
const untilTomorrow = () => {
  const next = new Date();

  next.setUTCHours(24, 0, 0, 0);

  return next.getTime() - Date.now();
};

const isStillCurrent = async (
  models: IModels,
  engageMessageId: string,
  queuedRun?: number,
) => {
  if (queuedRun === undefined) {
    return true;
  }

  const campaign = await models.EngageMessages.findOne({
    _id: engageMessageId,
  });

  return !!campaign && campaign.runCount === queuedRun;
};

export const handleEmailProcessor = async (payload) => {
  const { subdomain, customers, engageMessage, fromEmail, configSet } =
    payload ?? {};

  const models = await generateModels(subdomain);

  if (!(await isStillCurrent(models, engageMessage._id, payload.queuedRun))) {
    console.log(
      `Skipped a deferred batch for ${engageMessage._id}: the campaign has moved on`,
    );

    return;
  }

  const providerConfig = await getBroadcastEmailConfig(models);
  const cacheKey = getBroadcastCacheKey(models);
  const log = createDeliveryLogPort(models);
  const suppression = createSuppressionPort(models);
  const postalAddress = formatPostalAddress(await getPostalAddress(models));
  const alignedFrom = await getBroadcastAlignedFrom(models);

  await models.Stats.findOneAndUpdate(
    { engageMessageId: engageMessage._id },
    { engageMessageId: engageMessage._id },
    { upsert: true },
  );

  const STATS = { validCustomersCount: 0, failureCount: 0 };
  const deferred: any[] = [];

  try {
    for (let i = 0; i < customers.length; i += CHUNK_SIZE) {
      const chunk = customers.slice(i, i + CHUNK_SIZE);
      const unsubscribed = await listUnsubscribed(models, chunk);
      const allowed = await claimChunk(models, chunk);

      for (const customer of chunk) {
        if (!allowed.has(String(customer._id))) {
          deferred.push(customer);

          continue;
        }

        if (unsubscribed.has(String(customer._id))) {
          await models.BroadcastTraces.createTrace(
            engageMessage._id,
            'regular',
            `Skipped customer ${customer._id}: unsubscribed after the campaign started`,
          );

          continue;
        }

        try {
          const replacedContent = await replaceContent({
            replacer: customer,
            content: engageMessage.email.content,
            replacement: (replacer, path) => {
              const value = _.get(replacer, path);

              if (typeof value === 'number') {
                return value.toString();
              }

              if (value instanceof Date) {
                return dayjs(value).format('YYYY-MM-DD');
              }

              return value?.toString() || '-';
            },
          });

          const link = unsubscribeUrl(subdomain, { cid: customer._id });

          const htmlContent = blocksToHtml(replacedContent, {
            wrapper: { email: true, unsubscribeUrl: link, postalAddress },
            resolveImageUrl: (url) => readFileUrl(url, subdomain),
          });

          const outcome = await deliverEmail({
            cacheKey,
            config: providerConfig,
            message: toOutboundEmail(
              prepareEmailParams(
                subdomain,
                customer,
                {
                  ...engageMessage,
                  email: { ...engageMessage.email, content: htmlContent },
                },
                fromEmail,
                configSet,
              ),
              { unsubscribeUrl: link, alignedFrom },
            ),
            log,
            suppression,
            meta: {
              source: 'broadcast',
              sourceId: engageMessage._id,
              subdomain,
            },
          });

          if (outcome.skipped) {
            await models.BroadcastTraces.createTrace(
              engageMessage._id,
              'regular',
              `Skipped customer ${customer._id}: ${outcome.suppressed?.join(
                ', ',
              )} is suppressed`,
            );

            continue;
          }

          STATS.validCustomersCount++;

          await models.Stats.updateOne(
            { engageMessageId: engageMessage._id },
            { $inc: { total: 1 } },
          );

          await models.BroadcastTraces.createTrace(
            engageMessage._id,
            'success',
            `Sent email to: ${customer.primaryEmail}`,
          );
        } catch (error) {
          STATS.failureCount++;

          await models.BroadcastTraces.createTrace(
            engageMessage._id,
            'failure',
            `Error occurred while sending email to ${customer.primaryEmail}: ${error.message}`,
          );
        }
      }

      if (i + CHUNK_SIZE < customers.length) {
        await new Promise((resolve) => setTimeout(resolve, CHUNK_DELAY));
      }
    }

    if (deferred.length) {
      // Counted as another batch so the campaign is not declared finished while
      // part of its audience is still waiting.
      await models.EngageMessages.updateOne(
        { _id: engageMessage._id },
        { $inc: { 'progress.totalBatches': 1 } },
      );

      const campaign = await models.EngageMessages.findOne({
        _id: engageMessage._id,
      });

      const resumeCount = (payload.resumeCount || 0) + 1;

      addBroadcastWorkerQueue({
        queueName: 'broadcast_processor',
        data: {
          method: 'email',
          payload: {
            ...payload,
            customers: deferred,
            resumeCount,
            // Stamped so a batch queued by an earlier run is dropped rather
            // than mailing the same people a second time.
            queuedRun: campaign?.runCount ?? payload.queuedRun,
          },
        },
        // The run is part of the id, so restarting a campaign never collides
        // with a batch the previous run left waiting.
        jobId: `${engageMessage._id}_run${
          campaign?.runCount ?? 0
        }_resume${resumeCount}`,
        delay: untilTomorrow(),
      });

      await models.BroadcastTraces.createTrace(
        engageMessage._id,
        'regular',
        `Deferred ${deferred.length} recipients to tomorrow: today's sending allowance is spent`,
      );
    }

    await models.EngageMessages.updateOne(
      { _id: engageMessage._id },
      {
        $inc: {
          validCustomersCount: STATS.validCustomersCount,
          'progress.processedBatches': 1,
          'progress.successCount': STATS.validCustomersCount,
          'progress.failureCount': STATS.failureCount,
        },
        $set: {
          'progress.lastUpdated': new Date(),
        },
      },
    );

    const message = await models.EngageMessages.findOne({
      _id: engageMessage._id,
    });

    if (message) {
      const totalProcessed = STATS.validCustomersCount + STATS.failureCount;
      const failureRate =
        totalProcessed > 0 ? STATS.failureCount / totalProcessed : 0;

      if (message.progress.processedBatches >= message.progress.totalBatches) {
        const finalStatus =
          failureRate >= FAILURE_THRESHOLD ? 'failed' : 'completed';

        await models.EngageMessages.updateOne(
          { _id: engageMessage._id, status: { $eq: 'sending' } },
          { $set: { status: finalStatus } },
        );

        await models.BroadcastTraces.createTrace(
          engageMessage._id,
          finalStatus === 'failed' ? 'failure' : 'success',
          `Campaign ${finalStatus}. Sent: ${STATS.validCustomersCount}, Failed: ${STATS.failureCount}`,
        );
      }
    }
  } catch (error) {
    console.error('Critical error in email processor:', error);

    await models.EngageMessages.updateOne(
      { _id: engageMessage._id },
      {
        $set: { status: 'failed' },
        $inc: {
          'progress.processedBatches': 1,
          'progress.failureCount': customers.length - STATS.validCustomersCount,
        },
      },
    );

    await models.BroadcastTraces.createTrace(
      engageMessage._id,
      'failure',
      `Critical error in email processor: ${error.message}`,
    );
  }
};
