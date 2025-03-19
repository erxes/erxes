// cmsCustomPostTypeList(clientPortalId: String, searchValue: String, page: Int, perPage: Int): CustomFieldGroupResponse
// cmsCustomPostTypes(clientPortalId: String, searchValue: String, page: Int, perPage: Int): [CustomPostType]
// cmsCustomPostType(_id: String): CustomPostType

// cmsCustomFieldGroupList(clientPortalId: String!, searchValue: String, page: Int, perPage: Int): CustomFieldGroupResponse
// cmsCustomFieldGroups(clientPortalId: String!, searchValue: String, page: Int, perPage: Int): [CustomFieldGroup]
// cmsCustomFieldGroup(_id: String): CustomFieldGroup

import { paginate } from '@erxes/api-utils/src';
import {
  checkPermission,
  requireLogin,
} from '@erxes/api-utils/src/permissions';

import { IContext } from '../../../connectionResolver';

const queries = {
  async cmsCustomFieldGroupList(_parent: any, args: any, context: IContext) {
    const { models } = context;
    const { clientPortalId, searchValue, page = 1, perPage = 20 } = args;

    const query: any = {
      clientPortalId,
    };

    if (searchValue) {
      query.$or = [
        { code: { $regex: searchValue, $options: 'i' } },
        { label: { $regex: searchValue, $options: 'i' } },
      ];
    }

    const totalCount =
      await models.CustomFieldGroups.find(query).countDocuments();

    const list = await paginate(models.CustomFieldGroups.find(query), {
      page,
      perPage,
    });

    const totalPages = Math.ceil(totalCount / perPage);

    return {
      totalCount,
      totalPages,
      currentPage: page,
      list,
    };
  },
  async cmsCustomFieldGroups(_parent: any, args: any, context: IContext) {
    const { models } = context;
    const { clientPortalId, searchValue, page = 1, perPage = 20 } = args;

    const query: any = {
      clientPortalId,
    };

    if (searchValue) {
      query.$or = [
        { code: { $regex: searchValue, $options: 'i' } },
        { label: { $regex: searchValue, $options: 'i' } },
      ];
    }

    return paginate(models.CustomFieldGroups.find(query), {
      page,
      perPage,
    });
  },

  async cmsCustomFieldGroup(_parent: any, args: any, context: IContext) {
    const { models } = context;
    const { _id } = args;
    return models.CustomFieldGroups.findOne({ _id });
  },
};

requireLogin(queries, 'cmsCustomPostTypes');
requireLogin(queries, 'cmsCustomPostType');
checkPermission(queries, 'cmsCustomPostTypes', 'showCmsCustomPostTypes', []);

export default queries;
