import dayjs from 'dayjs';
import * as _ from 'lodash';
import { generateModels, IModels } from '~/connectionResolvers';
import { blocksToHtml } from '~/modules/documents/blocksToHtml';
import { replaceContent } from '~/modules/documents/utils';
import { deliverEmail } from 'erxes-api-shared/utils';
import { createDeliveryLogPort } from '~/utils/email/deliveryLog';
import {
  formatPostalAddress,
  getPostalAddress,
} from '~/utils/email/postalAddress';
import { prepareEmailParams, readFileUrl } from '../utils';
import {
  getBroadcastCacheKey,
  getBroadcastEmailConfig,
  toOutboundEmail,
} from '../utils/outboundEmail';

const CHUNK_SIZE = 50; // Send 50 emails at a time
const CHUNK_DELAY = 2000; // 2 second delay between each chunk
const FAILURE_THRESHOLD = 0.8; // Mark as failed if 80% of emails fail

/**
 * The recipient list is fixed when the campaign is queued, and a large one
 * takes hours to work through. Anyone who unsubscribes in the meantime did
 * everything right and must not receive the rest of it, so each chunk is
 * checked again just before it goes out.
 *
 * Matched by `_id` because that is what the batch carries and what is indexed;
 * the email fields are not.
 */
const listUnsubscribed = async (models: IModels, chunk: any[]) => {
  const ids = await models.Customers.find({
    _id: { $in: chunk.map((customer) => customer._id) },
    // The exact complement of what `generateCustomerSelector` let through, so
    // the re-check and the original filter can never disagree.
    isSubscribed: { $exists: true, $ne: 'Yes' },
  }).distinct('_id');

  return new Set(ids.map(String));
};

export const handleEmailProcessor = async (payload) => {
  const { subdomain, customers, engageMessage, fromEmail, configSet } =
    payload ?? {};

  const models = await generateModels(subdomain);

  const providerConfig = await getBroadcastEmailConfig(models);
  const cacheKey = getBroadcastCacheKey(models);
  const log = createDeliveryLogPort(models);
  const postalAddress = formatPostalAddress(await getPostalAddress(models));

  await models.Stats.findOneAndUpdate(
    { engageMessageId: engageMessage._id },
    { engageMessageId: engageMessage._id },
    { upsert: true },
  );

  const STATS = { validCustomersCount: 0, failureCount: 0 };

  try {
    for (let i = 0; i < customers.length; i += CHUNK_SIZE) {
      const chunk = customers.slice(i, i + CHUNK_SIZE);
      const unsubscribed = await listUnsubscribed(models, chunk);

      for (const customer of chunk) {
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

          const DOMAIN = (
            process.env.DOMAIN || 'http://localhost:4000'
          ).replace('<subdomain>', subdomain);

          const unsubscribeUrl = `${DOMAIN}/gateway/pl:core/unsubscribe/?cid=${customer._id}`;

          const htmlContent = blocksToHtml(replacedContent, {
            wrapper: { email: true, unsubscribeUrl, postalAddress },
            resolveImageUrl: (url) => readFileUrl(url, subdomain),
          });

          await deliverEmail({
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
              unsubscribeUrl,
            ),
            log,
            meta: { source: 'broadcast', sourceId: engageMessage._id },
          });

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
