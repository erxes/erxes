import { getEnv } from '@erxes/api-utils/src/core';
import { generateModels } from '../connectionResolver';
import { getOrganizations } from '@erxes/api-utils/src/saas/saas';

export const publish = async (subdomain: string) => {
  const models = await generateModels(subdomain);

  const now = new Date();

  const articlesToPublish = await models.KnowledgeBaseArticles.find({
    status: 'scheduled',
    scheduledDate: { $lte: now },
  });

  if (articlesToPublish.length === 0) {
    return;
  }

  if (articlesToPublish.length > 100) {
    for (const article of articlesToPublish) {
      await models.KnowledgeBaseArticles.updateOne(
        { _id: article._id },
        { $set: { status: 'publish' } }
      );
    }
  } else {
    await Promise.all(
      articlesToPublish.map((article) =>
        models.KnowledgeBaseArticles.updateOne(
          { _id: article._id },
          { $set: { status: 'publish' } }
        )
      )
    );
  }

  console.debug(
    `publishing ${articlesToPublish.length} articles at ${now} for ${subdomain}`
  );

  articlesToPublish.forEach(async (article) => {
    await models.KnowledgeBaseArticles.updateOne(
      { _id: article._id },
      { $set: { status: 'publish' } }
    );
  });
};

export default {
  handleMinutelyJob: async () => {
    const VERSION = getEnv({ name: 'VERSION' });

    try {
      if (VERSION && VERSION === 'saas') {
        const organizations = await getOrganizations();
        const BATCH_SIZE = 10;

        for (let i = 0; i < organizations.length; i += BATCH_SIZE) {
          const batch = organizations.slice(i, i + BATCH_SIZE);

          await Promise.all(
            batch.map(async (org) => {
              if (org.subdomain.length === 0) return;

              try {
                await publish(org.subdomain);
              } catch (error) {
                console.error(
                  `Failed to publish for subdomain ${org.subdomain}:`,
                  error
                );
              }
            })
          );
        }
      } else {
        await publish('os');
      }
    } catch (error) {
      console.error('Error in handleMinutelyJob:', error);
    }
  },
};
