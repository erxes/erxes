import { checkPermission } from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';
import { IRiskFormSubmissionParams } from '../../../models/definitions/common';

const formSubmissionQueries = {
  riskFormSubmitHistory(
    _root,
    { riskAssessmentId }: { riskAssessmentId: string },
    { models }: IContext
  ) {
    return models.RiksFormSubmissions.formSubmitHistory(riskAssessmentId);
  }
};

checkPermission(formSubmissionQueries, 'formSubmissionQueries', 'showRiskAssessment');

export default formSubmissionQueries;
