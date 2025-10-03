import { initTRPC } from '@trpc/server';

import {
  ITRPCContext,
  MessageProps,
  sendTRPCMessage,
} from 'erxes-api-shared/utils';

import { IModels } from './connectionResolvers';

export type PosTRPCContext = ITRPCContext<{ models: IModels }>;

const t = initTRPC.context<PosTRPCContext>().create();

export const appRouter = t.mergeRouters();

export type AppRouter = typeof appRouter;

export const sendCoreMessage = async (
  args: MessageProps & { pluginName?: string },
): Promise<any> => {
  return await sendTRPCMessage({
    ...args,
    pluginName: 'core',
  });
};
