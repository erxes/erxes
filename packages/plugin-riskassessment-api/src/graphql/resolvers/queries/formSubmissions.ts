import { checkPermission } from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';
import { IRiskFormSubmissionParams } from '../../../models/definitions/common';

const formSubmissionQueries = {
  riskFormSubmitHistory(
    _root,
    {
      cardId,
      cardType,
      riskAssessmentId
    }: { cardId: string; cardType: string; riskAssessmentId: string },
    { models }: IContext
  ) {
    return models.RiksFormSubmissions.formSubmitHistory(cardId, cardType, riskAssessmentId);
  }
};

checkPermission(formSubmissionQueries, 'formSubmissionQueries', 'showRiskAssessment');

export default formSubmissionQueries;
