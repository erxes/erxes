import { checkPermission } from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';
import { IRiskFormSubmissionParams } from '../../../models/definitions/common';

const formSubmissionMutations = {
  riskFormSaveSubmissions(
    _root,
    params: IRiskFormSubmissionParams,
    { models }: IContext
  ) {
    return models.RiskFormSubmissions.formSaveSubmission(params);
  },
  RAIndicatorTestScore(_root, params, { models }: IContext) {
    return models.RiskFormSubmissions.testScore(params);
  }
};

checkPermission(
  formSubmissionMutations,
  'riskFormSaveSubmissions',
  'showRiskAssessment'
);

export default formSubmissionMutations;
