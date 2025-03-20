// cmsCustomPostTypesAdd(input: CustomPostTypeInput!): CustomPostType
// cmsCustomPostTypesEdit(_id: String!, input: CustomPostTypeInput!): CustomPostType
// cmsCustomPostTypesRemove(_id: String!): JSON

// cmsCustomFieldGroupsAdd(input: CustomFieldGroupInput!): CustomFieldGroup
// cmsCustomFieldGroupsEdit(_id: String!, input: CustomFieldGroupInput!): CustomFieldGroup
// cmsCustomFieldGroupsRemove(_id: String!): JSON
import {
  checkPermission,
  requireLogin,
} from '@erxes/api-utils/src/permissions';

import { IContext } from '../../../connectionResolver';

const mutations = {
  async cmsCustomFieldGroupsAdd(_parent: any, args: any, context: IContext) {
    const { models } = context;
    const { input } = args;
    console.log(input);
    return models.CustomFieldGroups.createFieldGroup(input);
  },

  async cmsCustomFieldGroupsEdit(_parent: any, args: any, context: IContext) {
    const { models } = context;
    const { _id, input } = args;

    return models.CustomFieldGroups.updateFieldGroup(_id, input);
  },

  async cmsCustomFieldGroupsRemove(_parent: any, args: any, context: IContext) {
    const { models } = context;
    const { _id } = args;

    return models.CustomFieldGroups.deleteFieldGroup(_id);
  },
};

requireLogin(mutations, 'cmsCustomPostTypesAdd');
requireLogin(mutations, 'cmsCustomPostTypesEdit');
requireLogin(mutations, 'cmsCustomPostTypesRemove');

checkPermission(
  mutations,
  'cmsCustomPostTypesAdd',
  'cmsCustomPostTypesAdd',
  []
);
checkPermission(
  mutations,
  'cmsCustomPostTypesEdit',
  'cmsCustomPostTypesEdit',
  []
);
checkPermission(
  mutations,
  'cmsCustomPostTypesRemove',
  'cmsCustomPostTypesRemove',
  []
);

export default mutations;
