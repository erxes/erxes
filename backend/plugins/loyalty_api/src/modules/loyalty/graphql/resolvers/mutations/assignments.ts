import { checkPermission } from 'erxes-api-shared/core-modules';
import { IContext } from '~/connectionResolvers';
import { IAssignment } from '~/modules/loyalty/@types/assignments';

const assignmentsMutations = {
  async assignmentsAdd(_root, doc: IAssignment, { models }: IContext) {
    return models.Assignments.createAssignment(doc);
  },

  async assignmentsRemove(
    _root,
    { _ids }: { _ids: string[] },
    { models }: IContext,
  ) {
    return models.Assignments.removeAssignments(_ids);
  },

  async cpAssignmentsAdd(_root, doc: IAssignment, { models }: IContext) {
    return models.Assignments.createAssignment({ ...doc });
  },

  async cpAssignmentsRemove(
    _root,
    { _ids }: { _ids: string[] },
    { models }: IContext,
  ) {
    return models.Assignments.removeAssignments(_ids);
  },
};

checkPermission(assignmentsMutations, 'assignmentsAdd', 'manageLoyalties');
checkPermission(assignmentsMutations, 'assignmentsRemove', 'manageLoyalties');

export default assignmentsMutations;
