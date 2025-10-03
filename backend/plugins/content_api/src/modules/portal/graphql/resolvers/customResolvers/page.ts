import { IContext } from '~/connectionResolvers';
import { IPageDocument } from '@/portal/@types/page';
import { buildCustomFieldsMap } from '@/portal/utils/common';

const Page = {
  async createdUser(page: any) {
    if (!page.createdUserId) {
      return null;
    }

    return {
      __typename: 'User',
      _id: page.createdUserId,
    };
  },

  async customFieldsMap(page: IPageDocument, _params, { models }: IContext) {
    const fieldGroups = await models.CustomFieldGroups.find({
      enabledPageIds: page._id,
    }).lean();

    return await buildCustomFieldsMap(fieldGroups, page.customFieldsData);
  },
};

export { Page };
