import { initTRPC } from '@trpc/server';
import { CoreTRPCContext } from '~/init-trpc';
import { branchTrpcRouter } from './branch';
import { departmentTrpcRouter } from './department';
import { unitTrpcRouter } from './unit';

const t = initTRPC.context<CoreTRPCContext>().create();

export const structureTrpcRouter = t.mergeRouters(
  branchTrpcRouter,
  departmentTrpcRouter,
  unitTrpcRouter,
);
