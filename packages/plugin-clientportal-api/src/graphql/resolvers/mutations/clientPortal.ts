import { checkPermission } from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';
import { sendCardsMessage, sendContactsMessage } from '../../../messageBroker';
import { IClientPortal } from '../../../models/definitions/clientPortal';

export interface IVerificationParams {
  userId: string;
  emailOtp?: string;
  phoneOtp?: string;
}

const clientPortalMutations = {
  clientPortalConfigUpdate(_root, args: IClientPortal, { models }: IContext) {
    return models.ClientPortals.createOrUpdateConfig(args);
  },

  clientPortalRemove(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.ClientPortals.deleteOne({ _id });
  },

  async clientPortalCreateCard(
    _root,
    { type, email, subject, priority, description, stageId },
    { subdomain }: IContext
  ) {
    const customer = await sendContactsMessage({
      subdomain,
      action: 'customers.findOne',
      data: {
        primaryEmail: email
      },
      isRPC: true
    });

    if (!customer) {
      throw new Error('Customer not registered');
    }

    return sendCardsMessage({
      subdomain,
      action: `${type}s.create`,
      data: {
        userId: customer._id,
        name: subject,
        description,
        priority,
        stageId,
        status: 'active'
      },
      isRPC: true
    });
  }
};

checkPermission(
  clientPortalMutations,
  'clientPortalConfigUpdate',
  'manageClientPortal'
);

checkPermission(
  clientPortalMutations,
  'clientPortalRemove',
  'manageClientPortal'
);

export default clientPortalMutations;
