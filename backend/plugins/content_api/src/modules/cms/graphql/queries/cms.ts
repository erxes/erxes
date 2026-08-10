import { IContext } from '~/connectionResolvers';
import { assertCmsDocAccess } from '@/cms/utils/cms-access';

export const contentCmsQueries = {
  // The CMS list stays visible to everyone ("show all"); per-CMS access is
  // enforced when a member tries to open or manage a specific CMS.
  contentCMSList: async (_parent: any, _args: any, { models }: IContext) => {
    return models.CMS.getContentCMSs();
  },
  contentCMS: async (
    _parent: any,
    { id }: { id: string },
    context: IContext,
  ) => {
    const cms = await context.models.CMS.getContentCMS(id);
    assertCmsDocAccess(context, cms);
    return cms;
  },
};
