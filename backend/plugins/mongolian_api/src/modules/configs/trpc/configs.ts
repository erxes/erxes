import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { ITRPCContext } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';

export type ConfigsTRPCContext = ITRPCContext<{ models: IModels }>;

const t = initTRPC.context<ConfigsTRPCContext>().create();

export const configsTrpcRouter = t.router({
  mnConfig: t.procedure
  .input(z.object({ code: z.string(), subId: z.string().optional() }))
  .query(async ({ input, ctx }) => {
    console.log('🔍 configs.mnConfig called with:', input);
    const { models } = ctx;
    const { code, subId } = input;
    
    // Log the collection name being used
    console.log('models.Configs collection name:', models.Configs.collection.name);
    
    // Count documents with the query
    const count = await models.Configs.countDocuments({ code, subId });
    console.log(`count for code=${code}, subId=${subId}:`, count);
    
    // If count > 0, try to find one
    if (count > 0) {
      const config = await models.Configs.findOne({ code, subId }).lean();
      console.log('config found:', config ? 'yes' : 'no');
      if (config) console.log('config:', config);
      return config;
    } else {
      console.log('No documents match the query.');
      return null;
    }
  }),
});