import { Transform } from 'stream';

import { chunkArray } from '@erxes/api-utils/src/core';
import { generateFieldsFromSchema } from '@erxes/api-utils/src/fieldUtils';
import EditorAttributeUtil from '@erxes/api-utils/src/editorAttributeUtils';

import {
  customerSchema,
  ICustomerDocument,
  locationSchema,
  visitorContactSchema
} from './models/definitions/customers';
import messageBroker, {
  sendCoreMessage,
  sendEngagesMessage,
  sendFormsMessage,
  sendInboxMessage,
  sendTagsMessage
} from './messageBroker';
import { getServices } from '@erxes/api-utils/src/serviceDiscovery';
import { generateModels, IModels } from './connectionResolver';
import {
  COMPANY_INFO,
  CUSTOMER_BASIC_INFO,
  DEVICE_PROPERTIES_INFO,
  EMAIL_VALIDATION_STATUSES,
  MODULE_NAMES
} from './constants';
import { companySchema } from './models/definitions/companies';
import { ICustomField, ILink } from '@erxes/api-utils/src/types';
import { fetchEs } from '@erxes/api-utils/src/elasticsearch';
import { customFieldsDataByFieldCode } from '@erxes/api-utils/src/fieldUtils';
import { sendCommonMessage } from './messageBroker';

const EXTEND_FIELDS = {
  CUSTOMER: [
    { name: 'companiesPrimaryNames', label: 'Company Primary Names' },
    { name: 'companiesPrimaryEmails', label: 'Company Primary Emails' }
  ],
  ALL: [
    { name: 'tag', label: 'Tag' },
    { name: 'ownerEmail', label: 'Owner email' }
  ]
};

export const findCustomer = async (
  { Customers }: IModels,
  subdomain: string,
  doc
) => {
  let customer;

  const defaultFilter = { status: { $ne: 'deleted' } };

  if (doc.customerPrimaryEmail) {
    customer = await Customers.findOne({
      ...defaultFilter,
      $or: [
        { emails: { $in: [doc.customerPrimaryEmail] } },
        { primaryEmail: doc.customerPrimaryEmail }
      ]
    }).lean();
  }

  if (!customer && doc.customerPrimaryPhone) {
    customer = await Customers.findOne({
      ...defaultFilter,
      $or: [
        { phones: { $in: [doc.customerPrimaryPhone] } },
        { primaryPhone: doc.customerPrimaryPhone }
      ]
    }).lean();
  }

  if (!customer && doc.customerCode) {
    customer = await Customers.findOne({
      ...defaultFilter,
      code: doc.customerCode
    }).lean();
  }

  if (!customer && doc._id) {
    customer = await Customers.findOne({
      ...defaultFilter,
      _id: doc._id
    }).lean();
  }

  if (!customer) {
    customer = await Customers.findOne(doc).lean();
  }

  if (customer) {
    customer.customFieldsDataByFieldCode = await customFieldsDataByFieldCode(
      customer,
      subdomain,
      sendCommonMessage
    );
  }

  return customer;
};

export const findCompany = async (
  { Companies }: IModels,
  subdomain: string,
  doc
) => {
  let company;

  const defaultFilter = { status: { $ne: 'deleted' } };

  if (doc.companyPrimaryName) {
    company = await Companies.findOne({
      ...defaultFilter,
      $or: [
        { names: { $in: [doc.companyPrimaryName] } },
        { primaryName: doc.companyPrimaryName }
      ]
    }).lean();
  }

  if (!company && doc.name) {
    company = await Companies.findOne({
      ...defaultFilter,
      $or: [{ names: { $in: [doc.name] } }, { primaryName: doc.name }]
    }).lean();
  }

  if (!company && doc.email) {
    company = await Companies.findOne({
      ...defaultFilter,
      $or: [{ emails: { $in: [doc.email] } }, { primaryEmail: doc.email }]
    }).lean();
  }

  if (!company && doc.phone) {
    company = await Companies.findOne({
      ...defaultFilter,
      $or: [{ phones: { $in: [doc.phone] } }, { primaryPhone: doc.phone }]
    }).lean();
  }

  if (!company && doc.companyPrimaryEmail) {
    company = await Companies.findOne({
      ...defaultFilter,
      $or: [
        { emails: { $in: [doc.companyPrimaryEmail] } },
        { primaryEmail: doc.companyPrimaryEmail }
      ]
    }).lean();
  }

  if (!company && doc.companyPrimaryPhone) {
    company = await Companies.findOne({
      ...defaultFilter,
      $or: [
        { phones: { $in: [doc.companyPrimaryPhone] } },
        { primaryPhone: doc.companyPrimaryPhone }
      ]
    }).lean();
  }

  if (!company && doc.companyCode) {
    company = await Companies.findOne({
      ...defaultFilter,
      code: doc.companyCode
    }).lean();
  }

  if (!company && doc._id) {
    company = await Companies.findOne({
      ...defaultFilter,
      _id: doc._id
    }).lean();
  }

  if (!company) {
    company = await Companies.findOne(doc).lean();
  }

  if (company) {
    company.customFieldsDataByFieldCode = await customFieldsDataByFieldCode(
      company,
      subdomain,
      sendCommonMessage
    );
  }

  return company;
};

const generateUsersOptions = async (
  name: string,
  label: string,
  type: string,
  subdomain: string
) => {
  const users = await sendCoreMessage({
    subdomain,
    action: 'users.find',
    data: {
      query: {}
    },
    isRPC: true
  });

  const options: Array<{ label: string; value: any }> = users.map(user => ({
    value: user._id,
    label: user.username || user.email || ''
  }));

  return {
    _id: Math.random(),
    name,
    label,
    type,
    selectOptions: options
  };
};

const generateBrandsOptions = async (
  name: string,
  label: string,
  type: string,
  subdomain: string
) => {
  const brands = await sendCoreMessage({
    subdomain,
    action: 'brands.find',
    data: {
      query: {}
    },
    isRPC: true
  });

  const options: Array<{ label: string; value: any }> = brands.map(brand => ({
    value: brand._id,
    label: brand.name
  }));

  return {
    _id: Math.random(),
    name,
    label,
    type,
    selectOptions: options
  };
};

const getTags = async (type: string, subdomain: string) => {
  const tags = await sendTagsMessage({
    subdomain,
    action: 'find',
    data: {
      type: `contacts:${['lead', 'visitor'].includes(type) ? 'customer' : type}`
    },
    isRPC: true,
    defaultValue: []
  });

  const selectOptions: Array<{ label: string; value: any }> = [];

  for (const tag of tags) {
    selectOptions.push({
      value: tag._id,
      label: tag.name
    });
  }

  return {
    _id: Math.random(),
    name: 'tagIds',
    label: 'Tag',
    type: 'tag',
    selectOptions
  };
};

const getIntegrations = async (subdomain: string) => {
  const integrations = await sendInboxMessage({
    subdomain,
    action: 'integrations.find',
    data: { query: {} },
    isRPC: true,
    defaultValue: []
  });

  const selectOptions: Array<{ label: string; value: any }> = [];

  for (const integration of integrations) {
    selectOptions.push({
      value: integration._id,
      label: integration.name
    });
  }

  return {
    _id: Math.random(),
    name: 'relatedIntegrationIds',
    label: 'Related integration',
    selectOptions
  };
};

export const generateFields = async ({ subdomain, data }) => {
  const { type, usageType } = data;

  const models = await generateModels(subdomain);

  const { Customers, Companies } = models;

  let schema: any;
  let fields: Array<{
    _id: number;
    name: string;
    group?: string;
    label?: string;
    type?: string;
    validation?: string;
    options?: string[];
    selectOptions?: Array<{ label: string; value: string }>;
  }> = [];

  switch (type) {
    case 'lead':
      schema = Customers.schema;

    case 'customer':
      schema = Customers.schema;
      break;

    case 'company':
      schema = Companies.schema;
      break;
  }

  if (schema) {
    // generate list using customer or company schema
    fields = [...fields, ...(await generateFieldsFromSchema(schema, ''))];

    for (const name of Object.keys(schema.paths)) {
      const path = schema.paths[name];

      // extend fields list using sub schema fields
      if (path.schema) {
        fields = [
          ...fields,
          ...(await generateFieldsFromSchema(path.schema, `${name}.`))
        ];
      }
    }
  }

  if (!usageType || usageType === 'export') {
    const aggre = await fetchEs({
      subdomain,
      action: 'search',
      index: type === 'company' ? 'companies' : 'customers',
      body: {
        size: 0,
        _source: false,
        aggs: {
          trackedDataKeys: {
            nested: {
              path: 'trackedData'
            },
            aggs: {
              fieldKeys: {
                terms: {
                  field: 'trackedData.field',
                  size: 10000
                }
              }
            }
          }
        }
      },
      defaultValue: { aggregations: { trackedDataKeys: {} } }
    });

    const aggregations = aggre.aggregations || { trackedDataKeys: {} };
    const buckets = (aggregations.trackedDataKeys.fieldKeys || { buckets: [] })
      .buckets;

    for (const bucket of buckets) {
      fields.push({
        _id: Math.random(),
        name: `trackedData.${bucket.key}`,
        label: bucket.key
      });
    }
  }

  const ownerOptions = await generateUsersOptions(
    'ownerId',
    'Owner',
    'user',
    subdomain
  );

  const tags = await getTags(type, subdomain);

  fields = [...fields, tags];

  if (type === 'customer' || type === 'lead') {
    const integrations = await getIntegrations(subdomain);

    fields = [...fields, integrations];

    if (usageType === 'import') {
      fields.push({
        _id: Math.random(),
        name: 'companiesPrimaryNames',
        label: 'Company Primary Names'
      });

      fields.push({
        _id: Math.random(),
        name: 'companiesPrimaryEmails',
        label: 'Company Primary Emails'
      });
    }
  }

  if (process.env.USE_BRAND_RESTRICTIONS) {
    const brandsOptions = await generateBrandsOptions(
      'scopeBrandIds',
      'Brands',
      'brand',
      subdomain
    );

    fields.push(brandsOptions);
  }

  fields = [...fields, ownerOptions];

  if (usageType === 'import') {
    for (const extendField of EXTEND_FIELDS.ALL) {
      fields.push({
        _id: Math.random(),
        ...extendField
      });
    }
  }

  return fields;
};

export const getContentItem = async (
  { Customers, Companies }: IModels,
  activityLog
) => {
  const { action, contentType, content } = activityLog;

  if (action === 'merge') {
    let result = {};

    switch (contentType) {
      case 'company':
        result = await Companies.find({ _id: { $in: content } }).lean();
        break;
      case 'customer':
        result = await Customers.find({ _id: { $in: content } }).lean();
        break;
      default:
        break;
    }

    return result;
  }

  return null;
};

export const getEditorAttributeUtil = async (subdomain: string) => {
  const services = await getServices();
  const editor = await new EditorAttributeUtil(
    messageBroker(),
    `${process.env.DOMAIN}/gateway/pl:core`,
    services,
    subdomain
  );

  return editor;
};

export const prepareEngageCustomers = async (
  { Customers }: IModels,
  subdomain: string,
  { engageMessage, customersSelector, action, user }
): Promise<any> => {
  const customerInfos: Array<{
    _id: string;
    primaryEmail?: string;
    emailValidationStatus?: string;
    phoneValidationStatus?: string;
    primaryPhone?: string;
    replacers: Array<{ key: string; value: string }>;
  }> = [];

  const emailConf = engageMessage.email ? engageMessage.email : { content: '' };
  const emailContent = emailConf.content || '';

  const editorAttributeUtil = await getEditorAttributeUtil(subdomain);
  const customerFields = await editorAttributeUtil.getCustomerFields(
    emailContent
  );

  const exists = { $exists: true, $nin: [null, '', undefined] };

  // make sure email & phone are valid
  if (engageMessage.method === 'email') {
    customersSelector.primaryEmail = exists;
    customersSelector.emailValidationStatus = EMAIL_VALIDATION_STATUSES.VALID;
  }
  if (engageMessage.method === 'sms') {
    customersSelector.primaryPhone = exists;
    customersSelector.phoneValidationStatus = EMAIL_VALIDATION_STATUSES.VALID;
  }

  const onFinishPiping = async () => {
    await sendEngagesMessage({
      subdomain,
      action: 'pre-notification',
      data: { engageMessage, customerInfos }
    });

    if (customerInfos.length > 0) {
      const data: any = {
        ...engageMessage,
        customers: [],
        fromEmail: user.email,
        engageMessageId: engageMessage._id
      };

      if (engageMessage.method === 'email' && engageMessage.email) {
        const replacedContent = await editorAttributeUtil.replaceAttributes({
          customerFields,
          content: emailContent,
          user
        });

        engageMessage.email.content = replacedContent;

        data.email = engageMessage.email;
      }

      const chunks = chunkArray(customerInfos, 3000);

      for (const chunk of chunks) {
        data.customers = chunk;

        await sendEngagesMessage({
          subdomain,
          action: 'notification',
          data: { action, data }
        });
      }
    }
  };

  const customersItemsMapping = JSON.parse('{}');

  const customerTransformerStream = new Transform({
    objectMode: true,

    async transform(customer: ICustomerDocument, _encoding, callback) {
      const itemsMapping = customersItemsMapping[customer._id] || [null];

      for (const item of itemsMapping) {
        const replacers = await editorAttributeUtil.generateReplacers({
          content: emailContent,
          customer,
          item,
          customerFields
        });

        customerInfos.push({
          _id: customer._id,
          primaryEmail: customer.primaryEmail,
          emailValidationStatus: customer.emailValidationStatus,
          phoneValidationStatus: customer.phoneValidationStatus,
          primaryPhone: customer.primaryPhone,
          replacers
        });
      }

      // signal upstream that we are ready to take more data
      callback();
    }
  });

  // generate fields option =======
  const fieldsOption = {
    primaryEmail: 1,
    emailValidationStatus: 1,
    phoneValidationStatus: 1,
    primaryPhone: 1
  };

  for (const field of customerFields || []) {
    fieldsOption[field] = 1;
  }

  const customersStream = (Customers.find(
    customersSelector,
    fieldsOption
  ) as any).stream();

  return new Promise((resolve, reject) => {
    const pipe = customersStream.pipe(customerTransformerStream);

    pipe.on('finish', async () => {
      try {
        await onFinishPiping();
      } catch (e) {
        return reject(e);
      }

      resolve({ status: 'done', customerInfos });
    });
  });
};

export const generateSystemFields = ({ data: { groupId } }) => {
  const contactsFields: any = [];

  const serviceName = 'contacts';

  CUSTOMER_BASIC_INFO.ALL.map(e => {
    contactsFields.push({
      text: e.label,
      type: e.field,
      canHide: e.canHide,
      validation: e.validation,
      groupId,
      contentType: `${serviceName}:customer`,
      isDefinedByErxes: true
    });
  });

  COMPANY_INFO.ALL.map(e => {
    contactsFields.push({
      text: e.label,
      type: e.field,
      canHide: e.canHide,
      validation: e.validation,
      groupId,
      contentType: `${serviceName}:company`,
      isDefinedByErxes: true
    });
  });

  DEVICE_PROPERTIES_INFO.ALL.map(e => {
    contactsFields.push({
      text: e.label,
      type: e.field,
      groupId,
      contentType: `${serviceName}:device`,
      isDefinedByErxes: true
    });
  });

  return contactsFields;
};

export const updateContactsField = async (
  models: IModels,
  subdomain: string,
  args: {
    browserInfo: any;
    cachedCustomerId?: string;
    integration: any;
    submissionsGrouped: any;
  }
) => {
  let { cachedCustomerId } = args;
  const { browserInfo, integration, submissionsGrouped } = args;

  const { leadData } = integration;

  const conformityIds: {
    [key: string]: { customerId: string; companyId: string };
  } = {};

  let cachedCustomer;

  const customerSchemaLabels = await getSchemaLabels('customer');
  const companySchemaLabels = await getSchemaLabels('company');

  for (const groupId of Object.keys(submissionsGrouped)) {
    const customerLinks: ILink = {};
    const companyLinks: ILink = {};
    const customerDoc: any = {};
    const companyDoc: any = {};

    const customFieldsData: ICustomField[] = [];
    const companyCustomData: ICustomField[] = [];

    for (const submission of submissionsGrouped[groupId]) {
      const submissionType = submission.type || '';

      if (submissionType.includes('customerLinks')) {
        customerLinks[getSocialLinkKey(submissionType)] = submission.value;
        continue;
      }

      if (submissionType.includes('companyLinks')) {
        companyLinks[getSocialLinkKey(submissionType)] = submission.value;
        continue;
      }

      if (submissionType === 'pronoun') {
        switch (submission.value) {
          case 'Male':
            customerDoc.pronoun = 1;
            break;
          case 'Female':
            customerDoc.pronoun = 2;
            break;
          case 'Not applicable':
            customerDoc.pronoun = 9;
            break;
          default:
            customerDoc.pronoun = 0;
            break;
        }
        continue;
      }

      if (
        customerSchemaLabels.findIndex(e => e.name === submissionType) !== -1
      ) {
        if (
          submissionType === 'avatar' &&
          submission.value &&
          submission.value.length > 0
        ) {
          customerDoc.avatar = submission.value[0].url;
          continue;
        }

        customerDoc[submissionType] = submission.value;
        continue;
      }

      if (submissionType.includes('company_')) {
        if (
          submissionType === 'company_avatar' &&
          submission.value &&
          submission.value.length > 0
        ) {
          companyDoc.avatar = submission.value[0].url;
          continue;
        }

        const key = submissionType.split('_')[1];
        companyDoc[key] = submission.value;
        continue;
      }

      if (
        companySchemaLabels.findIndex(e => e.name === submissionType) !== -1
      ) {
        companyDoc[submissionType] = submission.value;
        continue;
      }

      if (
        submission.associatedFieldId &&
        [
          'input',
          'select',
          'multiSelect',
          'file',
          'textarea',
          'radio',
          'check',
          'map'
        ].includes(submissionType)
      ) {
        const field = await sendFormsMessage({
          subdomain,
          action: 'fields.findOne',
          data: {
            query: {
              _id: submission.associatedFieldId
            }
          },
          isRPC: true
        });

        if (!field) {
          continue;
        }

        const fieldGroup = await sendFormsMessage({
          subdomain,
          action: 'fieldsGroups.findOne',
          data: {
            query: {
              _id: field.groupId
            }
          },
          isRPC: true
        });

        if (fieldGroup && fieldGroup.contentType === 'contacts:company') {
          companyCustomData.push({
            field: submission.associatedFieldId,
            value: submission.value
          });
        }

        if (fieldGroup && fieldGroup.contentType === 'contacts:customer') {
          customFieldsData.push({
            field: submission.associatedFieldId,
            value: submission.value
          });
        }
      }
    }

    if (groupId === 'default') {
      cachedCustomer = await models.Customers.getWidgetCustomer({
        integrationId: integration._id,
        cachedCustomerId,
        email: customerDoc.email || '',
        phone: customerDoc.phone || ''
      });

      if (!cachedCustomer) {
        cachedCustomer = await createCustomer(
          models,
          integration._id,
          customerDoc,
          integration.brandId || '',
          leadData.saveAsCustomer
        );
      }

      await updateCustomerFromForm(
        models,
        browserInfo,
        {
          ...customerDoc,
          customFieldsData,
          links: customerLinks,
          scopeBrandIds: [integration.brandId || '']
        },
        cachedCustomer
      );

      cachedCustomerId = cachedCustomer._id;

      conformityIds[groupId] = {
        customerId: cachedCustomer._id,
        companyId: ''
      };
    } else {
      let customer = await findCustomer(models, subdomain, {
        customerPrimaryEmail: customerDoc.email || '',
        customerPrimaryPhone: customerDoc.phone || ''
      });

      if (!customer) {
        customer = await createCustomer(
          models,
          integration._id,
          customerDoc,
          integration.brandId || ''
        );
      }

      await updateCustomerFromForm(
        models,
        browserInfo,
        {
          ...customerDoc,
          customFieldsData,
          links: customerLinks,
          scopeBrandIds: [integration.brandId || '']
        },
        customer
      );

      conformityIds[groupId] = { customerId: customer._id, companyId: '' };
    }

    if (
      !(
        companyDoc.primaryEmail ||
        companyDoc.primaryPhone ||
        companyDoc.primaryName
      )
    ) {
      continue;
    }

    let company = await findCompany(models, subdomain, {
      companyPrimaryName: companyDoc.primaryName || '',
      companyPrimaryEmail: companyDoc.primaryEmail || '',
      companyPrimaryPhone: companyDoc.primaryPhone || ''
    });

    companyDoc.scopeBrandIds = [integration.brandId || ''];
    companyDoc.names = [companyDoc.primaryName || ''];

    if (!company) {
      company = await models.Companies.createCompany(companyDoc);
    }

    if (Object.keys(companyLinks).length > 0) {
      const links = company.links || {};

      for (const key of Object.keys(companyLinks)) {
        const value = companyLinks[key];
        if (!value || value.length === 0) {
          continue;
        }

        links[key] = value;
      }
      companyDoc.links = links;
    }

    if (!company.customFieldsData) {
      companyDoc.customFieldsData = companyCustomData;
    }

    if (company.customFieldsData && companyCustomData.length > 0) {
      companyDoc.customFieldsData = prepareCustomFieldsData(
        company.customFieldsData,
        companyCustomData
      );
    }

    company = await models.Companies.updateCompany(company._id, companyDoc);

    // if company scopeBrandIds does not contain brandId
    if (
      company.scopeBrandIds.findIndex(e => e === integration.brandId) === -1
    ) {
      await models.Companies.update(
        { _id: company._id },
        { $push: { scopeBrandIds: integration.brandId } }
      );
    }

    conformityIds[groupId] = {
      companyId: company._id,
      customerId: conformityIds[groupId].customerId
    };
  }

  let mainCompanyId = '';
  const relTypeIds: string[] = [];

  for (const key of Object.keys(conformityIds)) {
    const { companyId, customerId } = conformityIds[key];

    if (key === 'default' && companyId && customerId) {
      mainCompanyId = companyId;
      relTypeIds.push(customerId);
    }

    if (key !== 'default' && companyId && customerId) {
      await sendCoreMessage({
        subdomain,
        action: 'conformities.addConformities',
        data: {
          mainType: 'company',
          mainTypeId: companyId,
          relType: 'customer',
          relTypeId: customerId
        }
      });
    }

    if (key !== 'default' && !companyId && customerId) {
      relTypeIds.push(customerId);
    }
  }

  if (mainCompanyId !== '' && relTypeIds.length > 0) {
    for (const relTypeId of relTypeIds) {
      await sendCoreMessage({
        subdomain,
        action: 'conformities.addConformity',
        data: {
          mainType: 'company',
          mainTypeId: mainCompanyId,
          relType: 'customer',
          relTypeId
        }
      });
    }
  }

  return models.Customers.findOne({ _id: cachedCustomerId });
};

export const updateCustomerFromForm = async (
  models: IModels,
  browserInfo: any,
  doc: any,
  customer: ICustomerDocument
) => {
  const customerDoc: any = {
    ...doc,
    location: browserInfo,
    firstName: customer.firstName || doc.firstName,
    lastName: customer.lastName || doc.lastName,
    middleName: customer.middleName || doc.middleName,
    sex: doc.pronoun,
    birthDate: doc.birthDate,
    scopeBrandIds: [...doc.scopeBrandIds, ...(customer.scopeBrandIds || [])],
    ...(customer.primaryEmail
      ? {}
      : {
          emails: [doc.email],
          primaryEmail: doc.email
        }),
    ...(customer.primaryPhone
      ? {}
      : {
          phones: [doc.phone],
          primaryPhone: doc.phone
        })
  };

  if (!customer.customFieldsData) {
    customerDoc.customFieldsData = doc.customFieldsData;
  }

  if (customer.customFieldsData && doc.customFieldsData.length > 0) {
    customerDoc.customFieldsData = prepareCustomFieldsData(
      customer.customFieldsData,
      doc.customFieldsData
    );
  }

  if (Object.keys(doc.links).length > 0) {
    const links = customer.links || {};

    for (const key of Object.keys(doc.links)) {
      const value = doc.links[key];
      if (!value || value.length === 0) {
        continue;
      }

      links[key] = value;
    }
    customerDoc.links = links;
  }

  await models.Customers.updateCustomer(customer._id, customerDoc);
};

const prepareCustomFieldsData = (
  customerData: ICustomField[],
  submissionData: ICustomField[]
) => {
  const customFieldsData: ICustomField[] = customerData;

  if (customerData.length === 0) {
    return submissionData;
  }

  for (const data of submissionData) {
    const existingData = customerData.find(e => e.field === data.field);

    if (existingData) {
      if (Array.isArray(existingData.value)) {
        existingData.value = existingData.value.concat(data.value);
      } else {
        existingData.value = data.value;
      }
    } else {
      customFieldsData.push(data);
    }
  }

  return customFieldsData;
};

const createCustomer = async (
  models: IModels,
  integrationId: string,
  customerDoc: any,
  brandId?: string,
  saveAsCustomer?: boolean
) => {
  const doc: any = {
    integrationId,
    primaryEmail: customerDoc.email || '',
    emails: [customerDoc.email || ''],
    firstName: customerDoc.firstName || '',
    lastName: customerDoc.lastName || '',
    middleName: customerDoc.middleName || '',
    primaryPhone: customerDoc.phone || '',
    scopeBrandIds: [brandId || '']
  };

  if (saveAsCustomer) {
    doc.state = 'customer';
  }

  return models.Customers.createCustomer(doc);
};

const getSocialLinkKey = (type: string) => {
  return type.substring(type.indexOf('_') + 1);
};

export const getSchemaLabels = async (type: string) => {
  let fieldNames: any[] = [];

  const found: any = LOG_MAPPINGS.find(m => m.name === type);

  if (found) {
    const schemas: any = found.schemas || [];

    for (const schema of schemas) {
      // schema comes as either mongoose schema or plain object
      const names: string[] = Object.getOwnPropertyNames(schema.obj || schema);

      for (const name of names) {
        const field: any = schema.obj ? schema.obj[name] : schema[name];

        if (field && field.label) {
          fieldNames.push({ name, label: field.label });
        }

        // nested object field names
        if (typeof field === 'object' && field.type && field.type.obj) {
          fieldNames = fieldNames.concat(buildLabelList(field.type.obj));
        }
      }
    } // end schema for loop
  } // end schema name mapping

  return fieldNames;
};

export const buildLabelList = (obj = {}): any[] => {
  const list: any[] = [];
  const fieldNames: string[] = Object.getOwnPropertyNames(obj);

  for (const name of fieldNames) {
    const field: any = obj[name];
    const label: string = field && field.label ? field.label : '';

    list.push({ name, label });
  }

  return list;
};

const LOG_MAPPINGS = [
  {
    name: MODULE_NAMES.CUSTOMER,
    schemas: [customerSchema, locationSchema, visitorContactSchema]
  },
  {
    name: MODULE_NAMES.COMPANY,
    schemas: [companySchema]
  }
];
