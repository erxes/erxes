import {
  Brands,
  Companies,
  Conformities,
  Conversations,
  Customers,
  EngageMessages,
  Fields,
  FieldsGroups,
  FormSubmissions,
  Integrations
} from '../db/models';
import Messages from '../db/models/ConversationMessages';
import { IBrowserInfo } from '../db/models/Customers';
import { ICustomField, ILink } from '../db/models/definitions/common';
import { KIND_CHOICES } from '../db/models/definitions/constants';
import { ICustomerDocument } from '../db/models/definitions/customers';
import { ISubmission } from '../db/models/definitions/fields';
import { debugBase, debugError } from '../debuggers';
import { client, fetchElk, getIndexPrefix } from '../elasticsearch';
import { getVisitorLog, sendToVisitorLog } from './logUtils';
import { findCompany, findCustomer } from './utils';

export const getOrCreateEngageMessage = async (
  browserInfo: IBrowserInfo,
  visitorId?: string,
  customerId?: string
) => {
  let integrationId;

  let customer;

  if (customerId) {
    customer = await Customers.getCustomer(customerId);
    integrationId = customer.integrationId;
  }

  let visitor;

  if (visitorId) {
    visitor = await getVisitorLog(visitorId);
    integrationId = visitor.integrationId;
  }

  const integration = await Integrations.findOne({
    _id: integrationId,
    kind: KIND_CHOICES.MESSENGER
  });

  if (!integration) {
    throw new Error('Integration not found');
  }

  const brand = await Brands.getBrand({ _id: integration.brandId || '' });

  // try to create engage chat auto messages
  await EngageMessages.createVisitorOrCustomerMessages({
    brandId: brand._id,
    integrationId: integration._id,
    customer,
    visitor,
    browserInfo
  });

  // find conversations
  const query = customerId
    ? { integrationId, customerId }
    : { integrationId, visitorId };

  const convs = await Conversations.find(query);

  return Messages.findOne(Conversations.widgetsUnreadMessagesQuery(convs));
};

export const convertVisitorToCustomer = async (visitorId: string) => {
  let visitor;

  try {
    visitor = await getVisitorLog(visitorId);

    delete visitor.visitorId;
    delete visitor._id;
  } catch (e) {
    debugError(e.message);
  }

  const doc = { state: 'visitor', ...visitor };
  const customer = await Customers.createCustomer(doc);

  await Messages.updateVisitorEngageMessages(visitorId, customer._id);
  await Conversations.updateMany(
    {
      visitorId
    },
    { $set: { customerId: customer._id, visitorId: '' } }
  );

  const index = `${getIndexPrefix()}events`;

  try {
    const response = await client.updateByQuery({
      index,
      body: {
        script: {
          lang: 'painless',
          source:
            'ctx._source.visitorId = null; ctx._source.customerId = params.customerId',
          params: {
            customerId: customer._id
          }
        },
        query: {
          term: {
            visitorId
          }
        }
      }
    });

    debugBase(`Response ${JSON.stringify(response)}`);
  } catch (e) {
    debugError(`Update event error ${e.message}`);
  }

  await sendToVisitorLog({ visitorId }, 'remove');

  return customer;
};

const fetchHelper = async (index: string, query, errorMessage?: string) => {
  const response = await fetchElk('search', index, { query }, '', {
    hits: { hits: [] }
  });

  const hits = response.hits.hits.map(hit => {
    return {
      _id: hit._id,
      ...hit._source
    };
  });

  if (errorMessage) {
    if (hits.length === 0) {
      throw new Error(errorMessage);
    }

    return hits[0];
  }

  return hits;
};

export const getOrCreateEngageMessageElk = async (
  browserInfo: IBrowserInfo,
  visitorId?: string,
  customerId?: string
) => {
  let integrationId;

  let customer;

  if (customerId) {
    const customers = await fetchHelper('customers', {
      match: {
        _id: customerId
      }
    });

    if (customers.length > 0) {
      customer = customers[0];
      integrationId = customer.integrationId;
    }
  }

  let visitor;

  if (visitorId) {
    visitor = await getVisitorLog(visitorId);
    integrationId = visitor ? visitor.integrationId : null;
  }

  if (!integrationId) {
    return null;
  }

  const integration = await fetchHelper(
    'integrations',
    {
      bool: {
        must: [
          { match: { _id: integrationId } },
          { match: { kind: KIND_CHOICES.MESSENGER } }
        ]
      }
    },
    'Integration not found'
  );

  const brand = await fetchHelper(
    'brands',
    {
      match: {
        _id: integration.brandId
      }
    },
    'Brand not found'
  );

  // try to create engage chat auto messages
  await EngageMessages.createVisitorOrCustomerMessages({
    brandId: brand._id,
    integrationId: integration._id,
    customer,
    visitor,
    browserInfo
  });

  // find conversations
  const customerSelector = {
    term: customer
      ? { 'customerId.keyword': customerId }
      : { 'visitorId.keyword': visitorId }
  };

  const convs = await fetchHelper('conversations', {
    bool: {
      must: [
        { term: { 'integrationId.keyword': integrationId } },
        customerSelector
      ]
    }
  });

  const conversationIds = convs.map(c => c._id);

  const messages = await fetchHelper('conversation_messages', {
    bool: {
      must: [
        { exists: { field: 'userId' } },
        { term: { internal: false } },
        { terms: { 'conversationId.keyword': conversationIds } }
      ],
      must_not: [{ term: { isCustomerRead: true } }]
    }
  });

  return messages.pop();
};

const getSocialLinkKey = (type: string) => {
  return type.substring(type.indexOf('_') + 1);
};

const prepareCustomFieldsData = (
  customerDatas: ICustomField[],
  submissionDatas: ICustomField[]
) => {
  const customFieldsData: ICustomField[] = [];

  if (customerDatas.length === 0) {
    return submissionDatas;
  }

  for (const customerData of customerDatas) {
    for (const data of submissionDatas) {
      if (customerData.field !== data.field) {
        customFieldsData.push(customerData);
      } else {
        if (Array.isArray(customerData.value)) {
          data.value = customerData.value.concat(data.value);
        }

        customFieldsData.push(data);
      }
    }
  }

  return customFieldsData;
};

export const updateCustomerFromForm = async (
  browserInfo: any,
  doc: any,
  customer: ICustomerDocument
) => {
  const customerDoc: any = {
    location: browserInfo,
    firstName: customer.firstName || doc.firstName,
    lastName: customer.lastName || doc.lastName,
    middleName: customer.middleName || doc.middleName,
    sex: doc.pronoun,
    birthDate: doc.birthDate,
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

  if (doc.avatar.length > 0) {
    customerDoc.avatar = doc.avatar;
  }

  if (doc.department.length > 0) {
    customerDoc.department = doc.department;
  }

  if (doc.position.length > 0) {
    customerDoc.position = doc.position;
  }

  if (doc.description.length > 0) {
    customerDoc.description = doc.description;
  }

  if (doc.hasAuthority.length > 0) {
    customerDoc.hasAuthority = doc.hasAuthority;
  }

  if (doc.doNotDisturb.length > 0) {
    customerDoc.doNotDisturb = doc.doNotDisturb;
  }

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

  await Customers.updateCustomer(customer._id, customerDoc);
};

const groupSubmissions = (submissions: ISubmission[]) => {
  const submissionsGrouped: { [key: string]: ISubmission[] } = {};

  submissions.forEach(submission => {
    if (submission.groupId) {
      if (submissionsGrouped[submission.groupId]) {
        submissionsGrouped[submission.groupId].push(submission);
      } else {
        submissionsGrouped[submission.groupId] = [submission];
      }
    } else {
      if (submissionsGrouped.default) {
        submissionsGrouped.default.push(submission);
      } else {
        submissionsGrouped.default = [submission];
      }
    }
  });
  return submissionsGrouped;
};

export const solveSubmissions = async (args: {
  integrationId: string;
  formId: string;
  submissions: ISubmission[];
  browserInfo: any;
  cachedCustomerId?: string;
}) => {
  let { cachedCustomerId } = args;
  const { integrationId, browserInfo, formId } = args;

  const submissionsGrouped = groupSubmissions(args.submissions);

  const conformityIds: {
    [key: string]: { customerId: string; companyId: string };
  } = {};

  let cachedCustomer;

  for (const groupId of Object.keys(submissionsGrouped)) {
    let email;
    let phone;
    let firstName = '';
    let lastName = '';
    let middleName = '';
    let pronoun = 0;
    let avatar = '';
    let birthDate;
    let hasAuthority = '';
    let doNotDisturb = '';
    let description = '';
    let department = '';
    let position = '';
    const customerLinks: ILink = {};

    let companyName = '';
    let companyEmail = '';
    let companyPhone = '';
    let companyDescription = '';
    let companyDoNotDisturb = '';
    let logo = '';
    let size = 0;
    let industries = '';
    let businessType = '';
    let location = '';

    const companyLinks: ILink = {};

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

      switch (submissionType) {
        case 'email':
          email = submission.value;
          break;
        case 'phone':
          phone = submission.value;
          break;
        case 'firstName':
          firstName = submission.value;
          break;
        case 'lastName':
          lastName = submission.value;
          break;
        case 'middleName':
          middleName = submission.value;
          break;
        case 'companyName':
          companyName = submission.value;
          break;
        case 'companyEmail':
          companyEmail = submission.value;
          break;
        case 'companyPhone':
          companyPhone = submission.value;
          break;
        case 'avatar':
          if (submission.value && submission.value.length > 0) {
            avatar = submission.value[0].url;
          }
          break;
        case 'companyAvatar':
          if (submission.value && submission.value.length > 0) {
            logo = submission.value[0].url;
          }
          break;
        case 'industry':
          industries = submission.value;
          break;
        case 'size':
          size = submission.value;
          break;
        case 'businessType':
          businessType = submission.value;
          break;
        case 'pronoun':
          switch (submission.value) {
            case 'Male':
              pronoun = 1;
              break;
            case 'Female':
              pronoun = 2;
              break;
            case 'Not applicable':
              pronoun = 9;
              break;
            default:
              pronoun = 0;
              break;
          }
          break;
        case 'doNotDisturb':
          doNotDisturb = submission.value;
          break;
        case 'hasAuthority':
          hasAuthority = submission.value;
          break;
        case 'birthDate':
          birthDate = new Date(submission.value);
          break;
        case 'description':
          description = submission.value;
          break;
        case 'department':
          department = submission.value;
          break;
        case 'position':
          position = submission.value;
          break;
        case 'companyDescription':
          companyDescription = submission.value;
          break;
        case 'companyDoNotDisturb':
          companyDoNotDisturb = submission.value;
          break;
        case 'location':
          location = submission.value;
          break;
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
          'check'
        ].includes(submissionType)
      ) {
        const field = await Fields.findById(submission.associatedFieldId);
        if (!field) {
          continue;
        }

        const fieldGroup = await FieldsGroups.findById(field.groupId);

        if (fieldGroup && fieldGroup.contentType === 'company') {
          companyCustomData.push({
            field: submission.associatedFieldId,
            value: submission.value
          });
        }

        if (fieldGroup && fieldGroup.contentType === 'customer') {
          customFieldsData.push({
            field: submission.associatedFieldId,
            value: submission.value
          });
        }
      }
    }

    if (groupId === 'default') {
      cachedCustomer = await Customers.getWidgetCustomer({
        integrationId,
        cachedCustomerId,
        email,
        phone
      });

      if (!cachedCustomer) {
        cachedCustomer = await Customers.createCustomer({
          integrationId,
          primaryEmail: email,
          emails: [email],
          firstName,
          lastName,
          middleName,
          primaryPhone: phone
        });
      }

      await updateCustomerFromForm(
        browserInfo,
        {
          firstName,
          lastName,
          middleName,
          pronoun,
          birthDate,
          customFieldsData,
          avatar,
          department,
          position,
          description,
          hasAuthority,
          doNotDisturb,
          email,
          phone,
          links: customerLinks
        },
        cachedCustomer
      );

      cachedCustomerId = cachedCustomer._id;

      conformityIds[groupId] = {
        customerId: cachedCustomer._id,
        companyId: ''
      };
    } else {
      let customer = await findCustomer({
        customerPrimaryEmail: email,
        customerPrimaryPhone: phone
      });

      if (!customer) {
        customer = await Customers.createCustomer({
          integrationId,
          primaryEmail: email,
          emails: [email],
          firstName,
          lastName,
          middleName,
          primaryPhone: phone
        });
      }

      await updateCustomerFromForm(
        browserInfo,
        {
          firstName,
          lastName,
          middleName,
          pronoun,
          birthDate,
          customFieldsData,
          avatar,
          department,
          position,
          description,
          hasAuthority,
          doNotDisturb,
          email,
          phone,
          links: customerLinks
        },
        customer
      );

      conformityIds[groupId] = { customerId: customer._id, companyId: '' };
    }

    if (!(companyEmail || companyPhone || companyName)) {
      continue;
    }

    let company = await findCompany({
      companyPrimaryName: companyName,
      companyPrimaryEmail: companyEmail,
      companyPrimaryPhone: companyPhone
    });

    const companyDoc: any = {
      primaryName: companyName,
      primaryEmail: companyEmail,
      primaryPhone: companyPhone,
      emails: [companyEmail],
      phones: [companyPhone],
      size,
      doNotDisturb: companyDoNotDisturb,
      description: companyDescription,
      businessType
    };

    if (logo.length > 0) {
      companyDoc.avatar = logo;
    }

    if (industries.length > 0) {
      companyDoc.industry = industries;
    }

    if (location.length > 0) {
      companyDoc.location = location;
    }

    if (!company) {
      company = await Companies.createCompany(companyDoc);
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

    company = await Companies.updateCompany(company._id, companyDoc);

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
      await Conformities.addConformity({
        mainType: 'company',
        mainTypeId: companyId,
        relType: 'customer',
        relTypeId: customerId
      });
    }

    if (key !== 'default' && !companyId && customerId) {
      relTypeIds.push(customerId);
    }
  }

  if (mainCompanyId !== '' && relTypeIds.length > 0) {
    for (const relTypeId of relTypeIds) {
      await Conformities.addConformity({
        mainType: 'company',
        mainTypeId: mainCompanyId,
        relType: 'customer',
        relTypeId
      });
    }
  }

  // Inserting customer id into submitted customer ids
  await FormSubmissions.createFormSubmission({
    formId,
    customerId: cachedCustomerId,
    submittedAt: new Date()
  });

  return cachedCustomer;
};
