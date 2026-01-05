import { IContext } from '~/connectionResolvers';
import { IAssignment } from '~/modules/assignment/@types/assignment';

export const assignmentMutations = {
  createAssignment: async (
    _parent: undefined,
    doc: IAssignment,
    { models }: IContext,
  ) => {
    return models.Assignment.createAssignment(doc);
  },

  updateAssignment: async (
    _parent: undefined,
    { _id, ...doc }: IAssignment & { _id: string },
    { models }: IContext,
  ) => {
    return models.Assignment.updateAssignment(_id, doc);
  },

  removeAssignment: async (
    _parent: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    return models.Assignment.removeAssignment(_id);
  },
};
