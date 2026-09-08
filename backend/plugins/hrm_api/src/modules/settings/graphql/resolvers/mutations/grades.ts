import { IContext } from '~/connectionResolvers';
import { GradeInput } from '../../../db/models/Grades';
import { validateGradeInput } from '../validators';

export const gradeMutations = {
  async hrmGradesCreate(
    _root: undefined,
    { doc }: { doc: GradeInput },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('hrmSettingsManage');
    return models.Grades.createGrade(validateGradeInput(doc));
  },

  async hrmGradesUpdate(
    _root: undefined,
    { _id, doc }: { _id: string; doc: GradeInput },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('hrmSettingsManage');
    return models.Grades.updateGrade(_id, validateGradeInput(doc));
  },

  async hrmGradesArchive(
    _root: undefined,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('hrmSettingsManage');
    return models.Grades.archiveGrade(_id);
  },

  async hrmGradesRemove(
    _root: undefined,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('hrmSettingsRemove');
    return models.Grades.removeGrade(_id);
  },
};
