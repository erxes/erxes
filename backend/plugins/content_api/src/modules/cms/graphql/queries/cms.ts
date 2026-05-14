import { IContext } from '~/connectionResolvers';

export const contentCmsQueries = {
  contentCMSList: async (_parent: any, _args: any, { models }: IContext) => {
    return models.CMS.getContentCMSs();
  },
  contentCMS: async (
    _parent: any,
    { id }: { id: string },
    { models }: IContext,
  ) => {
    return models.CMS.getContentCMS(id);
  },
};
