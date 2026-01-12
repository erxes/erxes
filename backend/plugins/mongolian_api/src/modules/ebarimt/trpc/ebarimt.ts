import { initTRPC } from '@trpc/server';
import { ITRPCContext } from 'erxes-api-shared/utils';
import { z } from 'zod';
import { IModels } from '~/connectionResolvers';
import { afterMutationHandlers } from '../afterMutations';
import { beforeResolverHandlers } from '../beforeResolvers';

export type EbarimtTRPCContext = ITRPCContext<{ models: IModels }>;

const t = initTRPC.context<EbarimtTRPCContext>().create();

export const ebarimtTrpcRouter = t.router({
  ebarimt: {
  },
});
