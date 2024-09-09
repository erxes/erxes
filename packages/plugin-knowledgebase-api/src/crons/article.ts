import { generateModels } from '../connectionResolver';

export const publish = async (subdomain: string) => {
  const models = await generateModels(subdomain);

  const now = new Date();

  const articlesToPublish = await models.KnowledgeBaseArticles.find({
    status: 'scheduled',
    scheduledDate: { $lte: now },
  });

  articlesToPublish.forEach(async (article) => {
    await models.KnowledgeBaseArticles.updateOne(
      { _id: article._id },
      { $set: { status: 'publish' } }
    );
  });
};

export default {
  handleMinutelyJob: async ({ subdomain }) => {
    await publish(subdomain);
  },
};
