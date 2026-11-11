import { IContext } from '~/connectionResolvers';

export const dashboardLayoutQueries = {
  dashboardLayoutByCurrentUser: async (
    _parent: undefined,
    _args: undefined,
    { models, user }: IContext,
  ) => models.DashboardLayouts.getUserLayout(user._id),
};
