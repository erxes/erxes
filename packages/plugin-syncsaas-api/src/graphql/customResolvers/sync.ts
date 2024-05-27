import fetch from 'node-fetch';
import { IContext } from '../../connectionResolver';

const contactsGenerateFilter = (variableValues) => {
  const {
    contactTypeId,
    contactTypeIds,
    status,
    contactType,
    excludeContactTypeIds,
  } = variableValues || {};

  let selector: any = {};

  if (contactType) {
    selector.contactType = contactType;
  }

  if (contactTypeId) {
    selector.contactTypeId = contactTypeId;
  }

  if (contactTypeIds) {
    selector.contactTypeId = { $in: contactTypeIds };
  }
  if (status) {
    selector.status = status;
  }

  if (!!excludeContactTypeIds?.length) {
    selector.contentTypeId = {
      $nin: excludeContactTypeIds,
    };
  }

  return selector;
};

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.Sync.findOne({ _id });
  },

  async organizationDetail({ subdomain }) {
    const { SAAS_CORE_URL } = process.env;

    if (!SAAS_CORE_URL) {
      return null;
    }

    let response;

    try {
      response = await fetch(`${SAAS_CORE_URL}/check-subdomain`, {
        headers: {
          origin: `${subdomain}..app.erxes.io`,
        },
      }).then((res) => res.json());
    } catch (error) {
      return null;
    }

    return response ? response : null;
  },

  async contactsDetail(parent, args, { models }: IContext, info) {
    const { variableValues } = info;
    let selector = contactsGenerateFilter(variableValues);

    const syncedContact = await models.SyncedContacts.find(selector);

    return syncedContact;
  },
};
