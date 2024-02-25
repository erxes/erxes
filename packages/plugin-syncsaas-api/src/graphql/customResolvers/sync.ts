import fetch from 'node-fetch';
import { IContext } from '../../connectionResolver';

const contactsGenerateFilter = (variableValues) => {
  const {
    customerId,
    customerIds,
    companyId,
    companyIds,
    status,
    excludeCustomerIds,
    excludeCompanyIds,
  } = variableValues || {};

  let selector: any = {};

  if (customerId) {
    selector.contactTypeId = customerId;
  }

  if (customerIds) {
    selector.contactTypeId = { $in: customerIds };
  }
  if (companyId) {
    selector.contactTypeId = companyId;
  }

  if (companyIds) {
    selector.contactTypeId = { $in: companyIds };
  }

  if (status) {
    selector.status = status;
  }

  if (!!excludeCustomerIds?.length) {
    selector.contentTypeId = {
      $nin: excludeCustomerIds,
      contentType: 'customer',
    };
  }

  if (!!excludeCompanyIds?.length) {
    selector.contentTypeId = {
      $nin: excludeCompanyIds,
      contentType: 'company',
    };
  }
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
