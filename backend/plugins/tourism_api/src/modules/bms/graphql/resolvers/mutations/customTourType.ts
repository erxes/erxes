import { Resolver } from 'erxes-api-shared/core-types';
import { IContext } from '~/connectionResolvers';

const systemTypes = ['tour'];

const mutations: Record<string, Resolver> = {
  async bmsCustomTourGroupsAdd(_parent: any, args: any, { models }: IContext) {
    const { input } = args;

    return models.CustomTourFieldGroups.createFieldGroup(input);
  },

  async bmsCustomTourGroupsEdit(_parent: any, args: any, { models }: IContext) {
    const { _id, input } = args;

    return models.CustomTourFieldGroups.updateFieldGroup(_id, input);
  },

  async bmsCustomTourGroupsRemove(
    _parent: any,
    args: any,
    { models }: IContext,
  ) {
    const { _id } = args;

    return models.CustomTourFieldGroups.deleteFieldGroup(_id);
  },

  bmsCustomTourTypesAdd(_parent: any, args: any, { models }: IContext) {
    const { input } = args;

    if (systemTypes.includes(input.code)) {
      throw new Error('Cannot add system tour type');
    }

    return models.CustomTourTypes.createCustomTourType(input);
  },

  bmsCustomTourTypesEdit(_parent: any, args: any, { models }: IContext) {
    const { _id, input } = args;

    if (input.code && systemTypes.includes(input.code)) {
      throw new Error('Cannot edit system tour type');
    }

    return models.CustomTourTypes.updateCustomTourType(_id, input);
  },

  bmsCustomTourTypesRemove(_parent: any, args: any, { models }: IContext) {
    const { _id } = args;

    return models.CustomTourTypes.removeCustomTourType(_id);
  },
};

export default mutations;
