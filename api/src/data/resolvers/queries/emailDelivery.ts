import { EmailDeliveries } from '../../../db/models';
import { requireLogin } from '../../permissions/wrappers';

const emailDeliveryQueries = {
  emailDeliveryDetail(_root, { _id }: { _id: string }) {
    return EmailDeliveries.findOne({ _id });
  },
};

requireLogin(emailDeliveryQueries, 'emailDeliveryDetail');

export default emailDeliveryQueries;
