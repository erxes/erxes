import { sendCardsMessage, sendContactsMessage } from '../../../messageBroker';

import { IClientPortal } from '../../../models/definitions/clientPortal';
import { IContext } from '../../../connectionResolver';
import { checkPermission } from '@erxes/api-utils/src';
import { putActivityLog } from '../../../logUtils';
import { getUserName } from '../../../utils';
import { createCard } from '../../../models/utils';

export interface IVerificationParams {
  userId: string;
  emailOtp?: string;
  phoneOtp?: string;
}

const clientPortalMutations = {
  clientPortalConfigUpdate(
    _root,
    { config }: { config: IClientPortal },
    { models }: IContext
  ) {
    return models.ClientPortals.createOrUpdateConfig(config);
  },

  clientPortalRemove(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.ClientPortals.deleteOne({ _id });
  },

  async clientPortalCreateCard(
    _root,
    args,
    { subdomain, cpUser, models }: IContext
  ) {
    if (!cpUser) {
      throw new Error('You are not logged in');
    }

    return createCard(subdomain, models, cpUser, args);
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
  'removeClientPortal'
);

export default clientPortalMutations;
