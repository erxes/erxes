import fetch from 'node-fetch';
import { IContext } from '../../connectionResolver';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.Sync.findOne({ _id });
  },

  async organizationDetail({ subdomain }) {
    const { SAAS_CORE_URL } = process.env;

    if (!SAAS_CORE_URL) {
      return null;
    }

    const response = await fetch(`${SAAS_CORE_URL}/check-subdomain`, {
      headers: {
        origin: `${subdomain}..app.erxes.io`,
      },
    }).then((res) => res.json());

    return response ? response : null;
  },

  async syncedContactId(
    { _id, syncId, contactTypeId },
    args,
    { models }: IContext,
  ) {
    let selector = { syncId: _id, contactTypeId };

    if (syncId) {
      selector.syncId = syncId;
    }

    const syncedContact = await models.SyncedContacts.findOne(selector);

    return syncedContact ? syncedContact.syncedContactTypeId : null;
  },

  async contactStatus(
    { contactType, contactTypeId },
    {},
    { models }: IContext,
  ) {
    const syncedContact = await models.SyncedContacts.findOne({
      contactTypeId,
      contactType,
    });

    return syncedContact ? syncedContact?.status : null;
  },
};
