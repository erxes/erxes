import { IAssignment } from '@/assignment/@types/assignment';
import { IContext } from '~/connectionResolvers';

export const assignmentMutations = {
  async assignmentsAdd(
    _root: undefined,
    doc: IAssignment,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('assignmentCreate');
    return models.Assignments.createAssignment(doc);
  },

  async assignmentsRemove(
    _root: undefined,
    { _ids }: { _ids: string[] },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('assignmentRemove');
    return models.Assignments.removeAssignments(_ids);
  },

  async cpAssignmentsAdd(
    _root: undefined,
    doc: IAssignment,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('assignmentCreate');
    return models.Assignments.createAssignment(doc, true);
  },

  async cpAssignmentsRemove(
    _root: undefined,
    { _ids }: { _ids: string[] },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('assignmentRemove');
    return models.Assignments.removeAssignments(_ids);
  },
};