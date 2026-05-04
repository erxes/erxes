import { initTRPC } from '@trpc/server';
import { ITRPCContext } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';

export type EbarimtTRPCContext = ITRPCContext<{ models: IModels }>;

const t = initTRPC.context<EbarimtTRPCContext>().create();

export const ebarimtTrpcRouter = t.router({
  ebarimt: {},
});
