import dayjs from 'dayjs';
import * as _ from 'lodash';
import { generateModels } from '~/connectionResolvers';
import { blocksToHtml } from '~/modules/documents/blocksToHtml';
import { replaceContent } from '~/modules/documents/utils';
import { createTransporter, prepareEmailParams } from '../utils';

const CHUNK_SIZE = 50; // Send 50 emails at a time
const CHUNK_DELAY = 2000; // 2 second delay between each chunk
const FAILURE_THRESHOLD = 0.8; // Mark as failed if 80% of emails fail

export const handleEmailProcessor = async (payload) => {
  const { subdomain, customers, engageMessage, fromEmail, configSet } =
    payload ?? {};

  const models = await generateModels(subdomain);

  const transporter = await createTransporter(models);

  const STATS = { validCustomersCount: 0, failureCount: 0 };

  try {
    for (let i = 0; i < customers.length; i += CHUNK_SIZE) {
      const chunk = customers.slice(i, i + CHUNK_SIZE);

      for (const customer of chunk) {
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

          const htmlContent = blocksToHtml(replacedContent, {
            wrapper: { email: true },
          });

          engageMessage.email.content = htmlContent;

          await transporter.sendMail(
            prepareEmailParams(
              subdomain,
              customer,
              engageMessage,
              fromEmail,
              configSet,
            ),
          );

          STATS.validCustomersCount++;
        } catch (error) {
          console.log('Error sending email:', error);
          STATS.failureCount++;
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
      const failureRate = totalProcessed > 0 ? STATS.failureCount / totalProcessed : 0;

      if (message.progress.processedBatches >= message.progress.totalBatches) {
        const finalStatus = failureRate >= FAILURE_THRESHOLD ? 'failed' : 'completed';

        await models.EngageMessages.updateOne(
          { _id: engageMessage._id, status: { $eq: 'sending' } },
          { $set: { status: finalStatus } },
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
  }
};
