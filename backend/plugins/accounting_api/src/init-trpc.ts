import { initTRPC } from '@trpc/server';

import {
  ITRPCContext,
  MessageProps,
  sendTRPCMessage,
} from 'erxes-api-shared/utils';

import { IModels } from './connectionResolvers';
import { accountTrpcRouter } from './modules/accounting/trpc/account';
import { transactionTrpcRouter } from './modules/accounting/trpc/transaction';

export type AccountingTRPCContext = ITRPCContext<{ models: IModels }>;

const t = initTRPC.context<AccountingTRPCContext>().create();

export const appRouter = t.mergeRouters(
  accountTrpcRouter,
  transactionTrpcRouter,
);

export type AppRouter = typeof appRouter;

export const sendCoreMessage = async (args: MessageProps): Promise<any> => {
  return await sendTRPCMessage({
    ...args,
    pluginName: 'core',
  });
};

export const getConfig = async (code: string, defaultValue?: any) => {
  return await sendTRPCMessage({
    pluginName: 'core',
    module: 'configs',
    action: 'getConfig',
    input: { code, defaultValue },
  });
};
