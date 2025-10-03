import { initTRPC } from '@trpc/server';
import { fieldsTrpcRouter } from './fields';
import { fieldsGroupsTrpcRouter } from './fieldsGroups';

const t = initTRPC.create();

export const formsTrpcRouter = t.mergeRouters(
  fieldsTrpcRouter,
  fieldsGroupsTrpcRouter,
);
