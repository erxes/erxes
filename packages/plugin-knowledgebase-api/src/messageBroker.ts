import { generateModels } from "./connectionResolver";

let client;

export const initBroker = async (cl) => {
  client = cl;

  const { consumeRPCQueue } = client;


  consumeRPCQueue(
    'knowledgebase:topics.findOne',
    async ({ subdomain, data: { query } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.KnowledgeBaseTopics.findOne(query)
      };
    }
  );

  consumeRPCQueue(
    'knowledgebase:articles.find',
    async ({ subdomain, data: { query } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.KnowledgeBaseArticles.find(query)
      };
    }
  );
}

export default function() {
  return client;
}
