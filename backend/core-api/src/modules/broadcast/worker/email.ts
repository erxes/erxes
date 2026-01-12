import { generateModels } from '~/connectionResolvers';
import { createTransporter, prepareEmailParams } from '../utils';

const CHUNK_SIZE = 50; // Send 50 emails at a time
const CHUNK_DELAY = 2000; // 2 second delay between each chunk

export const handleEmailProcessor = async (payload) => {
  const { subdomain, customers, engageMessage, fromEmail, configSet } =
    payload ?? {};

  const models = await generateModels(subdomain);

  const transporter = await createTransporter(models);

  const STATS = { validCustomersCount: 0, failureCount: 0 };

  for (let i = 0; i < customers.length; i += CHUNK_SIZE) {
    const chunk = customers.slice(i, i + CHUNK_SIZE);

    for (const customer of chunk) {
      try {
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

  if (
    message &&
    message.progress.processedBatches >= message.progress.totalBatches
  ) {
    await models.EngageMessages.updateOne(
      { _id: engageMessage._id, status: { $eq: 'sending' } },
      {
        $set: {
          status: 'completed',
        },
      },
    );
  }
};
