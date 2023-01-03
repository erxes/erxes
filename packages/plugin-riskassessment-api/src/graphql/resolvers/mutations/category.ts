import { checkPermission } from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';
import { IRiskAssessmentCategoryField } from '../../../models/definitions/common';

const RiskAssessmentCategoryMutation = {
  async addAssessmentCategory(
    _root,
    params: IRiskAssessmentCategoryField,
    { models }: IContext
  ) {
    return await models.RiskAssessmentCategory.addAssessmentCategory(params);
  },

  async removeAssessmentCategory(
    _root,
    params: { _id: string },
    { models }: IContext
  ) {
    return await models.RiskAssessmentCategory.removeAssessmentCategory(params);
  },

  async editAssessmentCategory(
    _root,
    params: IRiskAssessmentCategoryField,
    { models }: IContext
  ) {
    return await models.RiskAssessmentCategory.editAssessmentCategory(params);
  },
  async removeUnsavedRiskAssessmentCategoryForm(
    _root,
    { formId }: { formId: string },
    { models }: IContext
  ) {
    return await models.RiskAssessmentCategory.removeUnsavedRiskAssessmentCategoryForm(
      formId
    );
  }
};

checkPermission(
  RiskAssessmentCategoryMutation,
  'addAssessmentCategory',
  'manageRiskAssessment'
);
checkPermission(
  RiskAssessmentCategoryMutation,
  'removeAssessmentCategory',
  'manageRiskAssessment'
);
checkPermission(
  RiskAssessmentCategoryMutation,
  'editAssessmentCategory',
  'manageRiskAssessment'
);

export default RiskAssessmentCategoryMutation;
