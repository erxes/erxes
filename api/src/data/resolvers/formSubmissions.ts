import { Customers } from '../../db/models';
import { IFormSubmissionDocument } from '../../db/models/definitions/forms';

export default {
  customer(submission: IFormSubmissionDocument) {
    return Customers.getCustomer(submission.customerId || '');
  }
};
