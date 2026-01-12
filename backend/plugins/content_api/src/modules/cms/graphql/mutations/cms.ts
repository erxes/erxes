import { IContext } from '~/connectionResolvers';
import { IContentCMSInput } from '@/cms/@types/cms';

export const contentCmsMutations = {
  contentCreateCMS: async (
    _parent: any,
    { input }: { input: IContentCMSInput },
    { models }: IContext,
  ) => {
    return models.CMS.createContentCMS(input);
  },
  contentUpdateCMS: async (
    _parent: any,
    { _id, input }: { _id: string; input: IContentCMSInput },
    { models }: IContext,
  ) => {
    return models.CMS.updateContentCMS(_id, input);
  },
  contentDeleteCMS: async (
    _parent: any,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    return models.CMS.deleteContentCMS(_id);
  },
};
