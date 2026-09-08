import { initTRPC } from '@trpc/server';

import { ITRPCContext, sendTRPCMessage } from 'erxes-api-shared/utils';

import { IModels } from './connectionResolvers';

export type HrmTRPCContext = ITRPCContext<{ models: IModels }>;

const t = initTRPC.context<HrmTRPCContext>().create();

export const appRouter = t.router({});

export type AppRouter = typeof appRouter;

export const getCoreConfig = async (
  subdomain: string,
  code: string,
  defaultValue?: unknown,
) => {
  return await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    module: 'configs',
    action: 'getConfig',
    input: { code, defaultValue },
  });
};
