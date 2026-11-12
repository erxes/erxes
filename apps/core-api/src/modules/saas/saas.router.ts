import { db } from '@erxes/core-db';
import { pluginPlan, subscriptionInfo } from '~/modules/saas/saas.service';
import { authed, plugin } from '~/orpc';

export const saasRouter = {
  plan: authed.saas.plan.handler(({ context }) => subscriptionInfo(db(), context.actor)),
  pluginPlan: plugin.saas.pluginPlan.handler(({ context }) => pluginPlan(context.plugin)),
};
