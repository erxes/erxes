import { sendCardsMessage, sendContactsMessage } from '../../../messageBroker';

import { IClientPortal } from '../../../models/definitions/clientPortal';
import { IContext } from '../../../connectionResolver';
import { checkPermission } from '@erxes/api-utils/src';

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
    {
      type,
      subject,
      priority,
      description,
      stageId,
      parentId,
      closeDate,
      startDate,
      customFieldsData,
      attachments,
      labelIds,
      productsData
    },
    { subdomain, cpUser, models }: IContext
  ) {
    if (!cpUser) {
      throw new Error('You are not logged in');
    }

    const customer = await sendContactsMessage({
      subdomain,
      action: 'customers.findOne',
      data: {
        _id: cpUser.erxesCustomerId
      },
      isRPC: true
    });

    if (!customer) {
      throw new Error('Customer not registered');
    }

    if (['High', 'Critical'].includes(priority)) {
      priority = 'Normal';
    }

    const card = await sendCardsMessage({
      subdomain,
      action: `${type}s.create`,
      data: {
        userId: cpUser._id,
        name: subject,
        description,
        priority,
        stageId,
        status: 'active',
        customerId: customer._id,
        createdAt: new Date(),
        stageChangedDate: null,
        parentId,
        closeDate,
        startDate,
        customFieldsData,
        attachments,
        labelIds,
        productsData
      },
      isRPC: true
    });

    await models.ClientPortalUserCards.createOrUpdateCard(
      {
        type,
        cardId: card._id
      },
      cpUser._id
    );

    return card;
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
