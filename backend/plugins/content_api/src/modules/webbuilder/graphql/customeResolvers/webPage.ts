import { buildCustomFieldsMap } from '@/cms/utils/common';
import { IContext } from '~/connectionResolvers';
import { IWebPageDocument } from '@/webbuilder/@types/webPage';

const WebPage = {
  async createdUser(page: any) {
    if (!page.createdUserId) {
      return null;
    }

    return {
      __typename: 'User',
      _id: page.createdUserId,
    };
  },

  async customFieldsMap(
    page: IWebPageDocument,
    _params: unknown,
    { models, subdomain }: IContext,
  ) {
    const fieldGroups = await models.CustomFieldGroups.find({
      enabledPageIds: page._id,
    }).lean();

    return buildCustomFieldsMap(subdomain, fieldGroups, page.customFieldsData);
  },
};

export default WebPage;

