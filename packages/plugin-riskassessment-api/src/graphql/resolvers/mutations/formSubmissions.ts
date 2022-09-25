import { IContext } from '../../../connectionResolver';
import { IRiskFormSubmissionParams } from '../../../models/definitions/common';

const formSubmissionMutations = {
  riskFormSaveSubmissions(_root, params: IRiskFormSubmissionParams, { models }: IContext) {
    return models.RiksFormSubmissions.formSaveSubmission(params);
  }
};

export default formSubmissionMutations;
