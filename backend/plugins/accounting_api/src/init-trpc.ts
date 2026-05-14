import { initTRPC } from '@trpc/server';

import { ITRPCContext, sendTRPCMessage } from 'erxes-api-shared/utils';

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

export const getCoreConfig = async (
  subdomain: string,
  code: string,
  defaultValue?: any,
) => {
  return await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    module: 'configs',
    action: 'getConfig',
    input: { code, defaultValue },
  });
};
