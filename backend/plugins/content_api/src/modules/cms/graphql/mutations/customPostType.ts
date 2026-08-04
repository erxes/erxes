import { Resolver } from 'erxes-api-shared/core-types';
import { IContext } from '~/connectionResolvers';
import { requireClientPortalId } from '@/cms/graphql/utils/clientPortal';
const systemTypes = ['page', 'post', 'category'];

const mutations : Record<string, Resolver> = {
  async cmsCustomFieldGroupsAdd(_parent: any, args: any, context: IContext) {
    const { models } = context;
    const { input } = args;

    return models.CustomFieldGroups.createFieldGroup(input);
  },

  async cpCmsCustomFieldGroupsAdd(_parent: any, args: any, context: IContext) {
    const { models } = context;
    const clientPortalId = requireClientPortalId(context);
    const { input } = args;
    const { clientPortalId: _ignored, ...fieldGroupInput } = input;

    return models.CustomFieldGroups.createFieldGroup({
      ...fieldGroupInput,
      clientPortalId,
    });
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

    if (systemTypes.includes(input.code)) {
      throw new Error('Cannot add system post type');
    }

    return models.CustomPostTypes.createCustomPostType(input);
  },

  cpCmsCustomPostTypesAdd(_parent: any, args: any, context: IContext) {
    const { models } = context;
    const clientPortalId = requireClientPortalId(context);
    const { input } = args;
    const { clientPortalId: _ignored, ...customPostTypeInput } = input;

    if (systemTypes.includes(customPostTypeInput.code)) {
      throw new Error('Cannot add system post type');
    }

    return models.CustomPostTypes.createCustomPostType({
      ...customPostTypeInput,
      clientPortalId,
    });
  },

  cmsCustomPostTypesEdit(_parent: any, args: any, context: IContext) {
    const { models } = context;
    const { _id, input } = args;

    if (input.code) {
      if (systemTypes.includes(input.code)) {
        throw new Error('Cannot edit system post type');
      }
    }

    return models.CustomPostTypes.updateCustomPostType(_id, input);
  },

  cmsCustomPostTypesRemove(_parent: any, args: any, context: IContext) {
    const { models } = context;
    const { _id } = args;

    return models.CustomPostTypes.removeCustomPostType(_id);
  },
};

export default mutations;

mutations.cpCmsCustomFieldGroupsAdd.wrapperConfig = {
  forClientPortal: true,
};
mutations.cpCmsCustomPostTypesAdd.wrapperConfig = {
  forClientPortal: true,
};
