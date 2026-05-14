import { IContext } from '~/connectionResolvers';
import { IContentCMSInput } from '@/cms/@types/cms';
import { Resolver } from 'erxes-api-shared/core-types';
import { requireClientPortalId } from '@/cms/graphql/utils/clientPortal';

export const contentCmsMutations: Record<string, Resolver> = {
  contentCreateCMS: async (
    _parent: any,
    { input }: { input: IContentCMSInput },
    { models }: IContext,
  ) => {
    return models.CMS.createContentCMS(input);
  },

  cpContentCreateCMS: async (
    _parent: any,
    { input }: { input: IContentCMSInput },
    context: IContext,
  ) => {
    const { models } = context;
    const clientPortalId = requireClientPortalId(context);
    const { clientPortalId: _ignored, ...cmsInput } = input || {};

    return models.CMS.createContentCMS({
      ...cmsInput,
      clientPortalId,
    });
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


contentCmsMutations.cpContentCreateCMS.wrapperConfig = {
  forClientPortal: true,
};
