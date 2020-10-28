import { Integrations, Users } from '../../db/models';
import { IEmailDeliveriesDocument } from '../../db/models/definitions/emailDeliveries';

export default {
  async fromUser(emailDelivery: IEmailDeliveriesDocument) {
    return Users.findOne({ _id: emailDelivery.userId }) || {};
  },

  async fromEmail(emailDelivery: IEmailDeliveriesDocument) {
    const integration = await Integrations.findOne({ _id: emailDelivery.from });

    return integration ? integration.name : '';
  }
};
