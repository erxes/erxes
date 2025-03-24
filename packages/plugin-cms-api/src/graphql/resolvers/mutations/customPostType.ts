
import {
  checkPermission,
  requireLogin,
} from '@erxes/api-utils/src/permissions';

import { IContext } from '../../../connectionResolver';

const mutations = {
  async cmsCustomFieldGroupsAdd(_parent: any, args: any, context: IContext) {
    const { models } = context;
    const { input } = args;

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


  cmsCustomPostTypesAdd(_parent: any, args: any, context: IContext) {
    const { models } = context;
    const { input } = args;

    return models.CustomPostTypes.createCustomPostType(input);
  },

  cmsCustomPostTypesEdit(_parent: any, args: any, context: IContext) {
    const { models } = context;
    const { _id, input } = args;

    return models.CustomPostTypes.updateCustomPostType(_id, input);
  },

  cmsCustomPostTypesRemove(_parent: any, args: any, context: IContext) {
    const { models } = context;
    const { _id } = args;

    return models.CustomPostTypes.removeCustomPostType(_id);
  },
};

requireLogin(mutations, 'cmsCustomPostTypesAdd');
requireLogin(mutations, 'cmsCustomPostTypesEdit');
requireLogin(mutations, 'cmsCustomPostTypesRemove');


export default mutations;
