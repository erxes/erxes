import { IContext } from '~/connectionResolvers';

export const assignmentQueries = {
  getAssignment: async (_parent: undefined, { _id }, { models }: IContext) => {
    return models.Assignment.getAssignment(_id);
  },

  getAssignments: async (_parent: undefined, { models }: IContext) => {
    return models.Assignment.getAssignments();
  },
};
