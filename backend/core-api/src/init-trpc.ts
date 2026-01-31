import { initTRPC } from '@trpc/server';

import { ITRPCContext } from 'erxes-api-shared/utils';

import { conformityTrpcRouter } from '~/modules/conformities/trpc/conformity';
import { contactTrpcRouter } from '~/modules/contacts/trpc';
import { exchangeRateTrpcRouter } from '~/modules/exchangeRates/trpc/exchangeRate';
import { brandTrpcRouter } from '~/modules/organization/brand/trpc/brand';
import { configTrpcRouter } from '~/modules/organization/settings/trpc/config';
import { structureTrpcRouter } from '~/modules/organization/structure/trpc';
import { userTrpcRouter } from '~/modules/organization/team-member/trpc/user';
import { productTrpcRouter } from '~/modules/products/trpc';
import { relationTrpcRouter } from '~/modules/relations/trpc/relation';
import { tagTrpcRouter } from '~/modules/tags/trpc/tag';
import { formsTrpcRouter } from './modules/forms/trpc';
import { permissionTrpcRouter } from './modules/permissions/trpc';
import { segmentsTRPCRouter } from './modules/segments/trpc';
import { automationsRouter } from './modules/automations/trpc/automations';
import { IModels } from './connectionResolvers';
import { notificationTrpcRouter } from '~/modules/notifications/trpc';
import { importExportTrpcRouter } from '~/modules/import-export/trpc';
import { logsTrpcRouter } from './modules/logs/trpc';
import { clientPortalNotificationTrpcRouter } from '@/clientportal/trpc';

export type CoreTRPCContext = ITRPCContext<{
  models: IModels;
  subdomain: string;
}>;

const t = initTRPC.context<CoreTRPCContext>().create({});

export const appRouter = t.mergeRouters(
  configTrpcRouter,
  formsTrpcRouter,
  contactTrpcRouter,
  conformityTrpcRouter,
  relationTrpcRouter,
  userTrpcRouter,
  structureTrpcRouter,
  productTrpcRouter,
  brandTrpcRouter,
  tagTrpcRouter,
  exchangeRateTrpcRouter,
  permissionTrpcRouter,
  segmentsTRPCRouter,
  automationsRouter,
  notificationTrpcRouter,
  importExportTrpcRouter,
  logsTrpcRouter,
  clientPortalNotificationTrpcRouter,
);

export type AppRouter = typeof appRouter;
