import { initTRPC } from '@trpc/server';
import { CoreTRPCContext } from '~/init-trpc';
import { permissionTrpcRouter as permissionRouter } from './permission';
import { userGroupTrpcRouter } from './userGroup';
import { roleTrpcRouter } from './role';

const t = initTRPC.context<CoreTRPCContext>().create();

export const permissionTrpcRouter = t.mergeRouters(
  roleTrpcRouter,
  permissionRouter,
  userGroupTrpcRouter,
);
