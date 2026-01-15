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
    { id, input }: { id: string; input: IContentCMSInput },
    { models }: IContext,
  ) => {
    return models.CMS.updateContentCMS(id, input);
  },
  contentDeleteCMS: async (
    _parent: any,
    { id }: { id: string },
    { models }: IContext,
  ) => {
    return models.CMS.deleteContentCMS(id);
  },
};
