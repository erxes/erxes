import { initTRPC } from '@trpc/server';
import { CoreTRPCContext } from '~/init-trpc';
import { fieldTrpcRouter } from './field';
import { groupTrpcRouter } from './group';

const t = initTRPC.context<CoreTRPCContext>().create();

export const propertiesTrpcRouter = t.mergeRouters(
  fieldTrpcRouter,
  groupTrpcRouter,
);
