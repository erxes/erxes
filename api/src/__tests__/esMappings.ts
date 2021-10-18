import { client, getIndexPrefix } from '../elasticsearch';

const nestedType = {
  type: 'nested',
  properties: {
    field: { type: 'keyword' },
    value: { type: 'text' },
    stringValue: { type: 'text' },
    numberValue: { type: 'float' },
    dateValue: { type: 'date' }
  }
};

const customer_mapping = {
  state: {
    type: 'keyword'
  },
  primaryEmail: {
    type: 'text',
    analyzer: 'uax_url_email_analyzer'
  },
  primaryPhone: {
    type: 'text',
    fields: {
      raw: {
        type: 'keyword'
      }
    }
  },
  code: {
    type: 'text',
    fields: {
      raw: {
        type: 'keyword'
      }
    }
  },
  integrationId: {
    type: 'keyword'
  },
  relatedIntegrationIds: {
    type: 'keyword'
  },
  scopeBrandIds: {
    type: 'keyword'
  },
  ownerId: {
    type: 'keyword'
  },
  position: {
    type: 'keyword'
  },
  leadStatus: {
    type: 'keyword'
  },
  tagIds: {
    type: 'keyword'
  },
  companyIds: {
    type: 'keyword'
  },
  mergedIds: {
    type: 'keyword'
  },
  status: {
    type: 'keyword'
  },
  emailValidationStatus: {
    type: 'keyword'
  },
  customFieldsData: nestedType,
  trackedData: nestedType
};

const company_mapping = {
  primaryEmail: {
    type: 'text',
    analyzer: 'uax_url_email_analyzer'
  },
  primaryName: {
    type: 'text',
    fields: {
      raw: {
        type: 'keyword'
      }
    }
  },
  scopeBrandIds: {
    type: 'keyword'
  },
  plan: {
    type: 'keyword'
  },
  industry: {
    type: 'keyword'
  },
  parentCompanyId: {
    type: 'keyword'
  },
  ownerId: {
    type: 'keyword'
  },

  tagIds: {
    type: 'keyword'
  },
  mergedIds: {
    type: 'keyword'
  },
  status: {
    type: 'keyword'
  },
  businessType: {
    type: 'keyword'
  },
  customFieldsData: nestedType
};

const item_mapping = {
  userId: {
    type: 'keyword'
  },
  stageId: {
    type: 'keyword'
  },
  modifiedBy: {
    type: 'keyword'
  },
  status: {
    type: 'keyword'
  },
  assignedUserIds: {
    type: 'keyword'
  },
  watchedUserIds: {
    type: 'keyword'
  },
  labelIds: {
    type: 'keyword'
  },
  customFieldsData: nestedType
};

const conformity_mapping = {
  mainType: {
    type: 'keyword'
  },
  mainTypeId: {
    type: 'keyword'
  },
  relType: {
    type: 'keyword'
  },
  relTypeId: {
    type: 'keyword'
  }
};

const deal_mapping = item_mapping;
const task_mapping = item_mapping;
const ticket_mapping = item_mapping;

const event_mapping = {
  type: {
    type: 'keyword'
  },
  name: {
    type: 'keyword'
  },
  customerId: {
    type: 'keyword'
  },
  visitorId: {
    type: 'keyword'
  },
  attributes: nestedType
};

const form_submissions_mapping = {};

const users_mapping = {
  email: { type: 'keyword' },
  username: { type: 'keyword' },
  details: nestedType,
  links: nestedType,
  isActive: { type: 'keyword' },
  groupIds: { type: 'keyword' },
  brandIds: { type: 'keyword' }
};

const analysis = {
  analyzer: {
    uax_url_email_analyzer: {
      tokenizer: 'uax_url_email_tokenizer'
    }
  },
  tokenizer: {
    uax_url_email_tokenizer: {
      type: 'uax_url_email'
    }
  }
};

const putMapping = async (index, mapping) => {
  await new Promise(resolve => {
    client.indices.create({ index, body: { settings: { analysis } } }, resolve);
  });

  return new Promise(resolve => {
    client.indices.putMapping(
      { index, body: { properties: mapping } },
      resolve
    );
  });
};

export const putMappings = async () => {
  const prefix = getIndexPrefix();
  await putMapping(`${prefix}customers`, customer_mapping);
  await putMapping(`${prefix}companies`, company_mapping);
  await putMapping(`${prefix}events`, event_mapping);
  await putMapping(`${prefix}deals`, deal_mapping);
  await putMapping(`${prefix}tasks`, task_mapping);
  await putMapping(`${prefix}tickets`, ticket_mapping);
  await putMapping(`${prefix}conformities`, conformity_mapping);
  await putMapping(`${prefix}form_submissions`, form_submissions_mapping);
  await putMapping(`${prefix}users`, users_mapping);
};

export const deleteAllIndexes = async () => {
  const prefix = getIndexPrefix();

  const del = index =>
    new Promise(resolve =>
      client.indices.delete({ index: `${prefix}${index}` }, resolve)
    );

  await del('customers');
  await del('companies');
  await del('events');
  await del('deals');
  await del('tasks');
  await del('tickets');
  await del('conformities');
  await del('form_submissions');
  await del('users');
};
