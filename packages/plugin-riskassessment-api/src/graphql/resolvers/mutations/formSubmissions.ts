import { checkPermission } from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';
import { IRiskFormSubmissionParams } from '../../../models/definitions/common';

const formSubmissionMutations = {
  riskFormSaveSubmissions(
    _root,
    params: IRiskFormSubmissionParams,
    { models }: IContext
  ) {
    return models.RiksFormSubmissions.formSaveSubmission(params);
  }
};

checkPermission(
  formSubmissionMutations,
  'riskFormSaveSubmissions',
  'manageRiskAssessment'
);

export default formSubmissionMutations;
