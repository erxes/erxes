import { Resolver } from 'erxes-api-shared/core-types';
import { IContext } from '~/connectionResolvers';

const SYSTEM_TYPES = new Set(['tour']);

const mutations: Record<string, Resolver> = {
  bmsCustomTourGroupsAdd: async (_parent, { input }, { models }: IContext) => {
    return models.CustomTourFieldGroups.createFieldGroup(input);
  },

  bmsCustomTourGroupsEdit: async (
    _parent,
    { _id, input },
    { models }: IContext,
  ) => {
    return models.CustomTourFieldGroups.updateFieldGroup(_id, input);
  },

  bmsCustomTourGroupsRemove: async (_parent, { _id }, { models }: IContext) => {
    return models.CustomTourFieldGroups.deleteFieldGroup(_id);
  },

  bmsCustomTourTypesAdd: async (_parent, { input }, { models }: IContext) => {
    if (SYSTEM_TYPES.has(input.code)) {
      throw new Error('Cannot add system tour type');
    }

    return models.CustomTourTypes.createCustomTourType(input);
  },

  bmsCustomTourTypesEdit: async (
    _parent,
    { _id, input },
    { models }: IContext,
  ) => {
    if (input.code && SYSTEM_TYPES.has(input.code)) {
      throw new Error('Cannot edit system tour type');
    }

    return models.CustomTourTypes.updateCustomTourType(_id, input);
  },

  bmsCustomTourTypesRemove: async (_parent, { _id }, { models }: IContext) => {
    return models.CustomTourTypes.removeCustomTourType(_id);
  },
};

export default mutations;
