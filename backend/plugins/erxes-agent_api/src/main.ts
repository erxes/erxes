import { startPlugin } from 'erxes-api-shared/utils';
import { typeDefs } from '~/apollo/typeDefs';
import { resolvers } from '~/apollo/resolvers';
import { generateModels } from './connectionResolvers';
import { router } from './routes';
import { appRouter } from '~/trpc/init-trpc';

startPlugin({
  name: 'erxes-agent',
  port: 3312,
  graphql: async () => ({
    typeDefs: await typeDefs(),
    resolvers,
  }),
  expressRouter: router,
  apolloServerContext: async (subdomain, context) => {
    const models = await generateModels(subdomain);
    context.models = models;
    return context;
  },
  trpcAppRouter: {
    router: appRouter,
    createContext: async (subdomain, context) => {
      const models = await generateModels(subdomain);
      context.models = models;
      return context;
    },
  },
  onServerInit: async () => {
    // Advanced memory (opt-in via ERXES_AGENT_MEMORY=enable): ping Qdrant and ensure
    // the collection exists. Loaded lazily and only when enabled, so default
    // deployments never even import the memory module at boot.
    if ((process.env.ERXES_AGENT_MEMORY ?? '').trim() === 'enable') {
      const { initAdvancedMemory } = await import('~/mastra/memory');
      await initAdvancedMemory();
    }

    // Company knowledge RAG (opt-in via ERXES_AGENT_KNOWLEDGE=enable): start the
    // reconciliation sweep scheduler + worker. Same lazy-load contract.
    if ((process.env.ERXES_AGENT_KNOWLEDGE ?? '').trim() === 'enable') {
      const [{ initKnowledgeSync }, { redis }] = await Promise.all([
        import('~/mastra/knowledge/worker'),
        import('erxes-api-shared/utils'),
      ]);
      await initKnowledgeSync(redis);
    }
  },
});
