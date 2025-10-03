import { dealTrpcRouter } from '@/sales/trpc/deal';
import { posTrpcRouter } from '@/pos/trpc/pos';

import { initTRPC } from '@trpc/server';

import {
  ITRPCContext,
  MessageProps,
  sendTRPCMessage,
} from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';

export type SalesTRPCContext = ITRPCContext<{ models: IModels }>;

const t = initTRPC.context<SalesTRPCContext>().create();

export const appRouter = t.mergeRouters(
  dealTrpcRouter
);

export type AppRouter = typeof appRouter;

export const sendCoreMessage = async (
  args: MessageProps & { pluginName?: string },
): Promise<any> => {
  return await sendTRPCMessage({
    ...args,
    pluginName: 'core',
  });
};
