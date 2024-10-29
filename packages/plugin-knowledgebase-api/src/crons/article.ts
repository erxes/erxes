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

    if (VERSION && VERSION === 'saas') {
      const organizations = await getOrganizations();

      for (const org of organizations) {
        if (org.subdomain.length === 0) {
          continue;
        }
      
        await publish(org.subdomain);
      }
    } else {
      await publish('os');
    }
  },
};
