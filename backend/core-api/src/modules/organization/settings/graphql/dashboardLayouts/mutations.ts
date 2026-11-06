import { IContext } from '~/connectionResolvers';
import { IDashboardLayoutItem } from '@/organization/settings/db/definitions/dashboardLayouts';

export const dashboardLayoutMutations = {
  dashboardLayoutSave: async (
    _parent: undefined,
    { items }: { items: IDashboardLayoutItem[] },
    { models, user }: IContext,
  ) => models.DashboardLayouts.saveUserLayout(user._id, items),

  dashboardLayoutReset: async (
    _parent: undefined,
    _args: undefined,
    { models, user }: IContext,
  ) => models.DashboardLayouts.resetUserLayout(user._id),
};
