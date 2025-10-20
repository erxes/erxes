import { IContext } from '~/connectionResolvers';

export const assignmentMutations = {
  createAssignment: async (
    _parent: undefined,
    { name },
    { models }: IContext,
  ) => {
    return models.Assignment.createAssignment({ name });
  },

  updateAssignment: async (
    _parent: undefined,
    { _id, name },
    { models }: IContext,
  ) => {
    return models.Assignment.updateAssignment(_id, { name });
  },

  removeAssignment: async (
    _parent: undefined,
    { _id },
    { models }: IContext,
  ) => {
    return models.Assignment.removeAssignment(_id);
  },
};
