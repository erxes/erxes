import { IContext } from '../../connectionResolver';
import { IPostCategoryDocument } from '../../models/definitions/categories';
import { IPageDocument } from '../../models/definitions/pages';
import { buildCustomFieldsMap } from './utils';

const Page = {
  async createdUser(page: any, _params, { models }: IContext) {
    if (!page.createdUserId) {
      return null;
    }

    return {
      __typename: 'User',
      _id: page.createdUserId,
    };
  },

  async customFieldsMap(
    page: IPageDocument,
    _params,
    { models, subdomain }: IContext
  ) {
    const fieldGroups = await models.CustomFieldGroups.find({
      enabledPageIds: page._id,
    }).lean();

    return await buildCustomFieldsMap(
      subdomain,
      fieldGroups,
      page.customFieldsData
    );
  },
};

export { Page };
