import { IContext } from '~/connectionResolvers';
import { GradeListParams, gradeSelector } from '../../../db/models/Grades';
import { pager } from '../utils';

export const gradeQueries = {
  async hrmGradeDetail(
    _root: undefined,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('hrmSettingsView');
    return models.Grades.getGrade(_id);
  },

  async hrmGradeByCode(
    _root: undefined,
    { code }: { code: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('hrmSettingsView');
    return models.Grades.getGradeByCode(code);
  },

  async hrmGrades(
    _root: undefined,
    params: GradeListParams,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('hrmSettingsView');
    const pagination = pager(params);

    return models.Grades.find(gradeSelector(params))
      .sort({ rank: 1, createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean();
  },

  async hrmGradesCount(
    _root: undefined,
    params: GradeListParams,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('hrmSettingsView');
    return models.Grades.find(gradeSelector(params)).countDocuments();
  },
};
