import { ILink } from '@erxes/api-utils/src/definitions/common';
import { isEnabled } from '@erxes/api-utils/src/serviceDiscovery';
import { ICustomField } from '@erxes/api-utils/src/types';
import { IContext, IModels } from '../../../connectionResolver';
import { sendCommonMessage } from '../../../messageBroker';
import {
  getSchemaLabels,
  getSocialLinkKey,
} from '../../../messageBrokers/utils';
import { graphqlPubsub } from '../../../pubsub';
import { registerOnboardHistory } from '../../utils';
import { nanoid } from 'nanoid';
// helpers

// Helper function to merge customer custom field data
const mergeCustomFieldsData = (
  existingFields: ICustomField[],
  newFields: ICustomField[]
): ICustomField[] => {
  if (existingFields.length === 0) return newFields;

  const updatedFields = [...existingFields];
  newFields.forEach((newField) => {
    const existingField = updatedFields.find((e) => e.field === newField.field);
    if (existingField) {
      if (Array.isArray(existingField.value)) {
        existingField.value = [...existingField.value, newField.value];
      } else {
        existingField.value = newField.value;
      }
    } else {
      updatedFields.push(newField);
    }
  });

  return updatedFields;
};

function mapPronounToCode(pronoun: string): number {
  switch (pronoun) {
    case 'Male':
      return 1;
    case 'Female':
      return 2;
    case 'Not applicable':
      return 9;
    default:
      return 0;
  }
}

function handleCompanyFields(
  submissionType: string,
  value: any,
  companyDoc: any
) {
  if (submissionType === 'company_avatar' && value.length > 0) {
    companyDoc.avatar = value[0].url;
  } else {
    const key = submissionType.split('_')[1];
    companyDoc[key] = value;
  }
}

function isCustomField(type: string): boolean {
  return [
    'input',
    'select',
    'multiSelect',
    'file',
    'textarea',
    'radio',
    'check',
    'map',
  ].includes(type);
}

async function createConversationAndMessage({
  customer,
  form,
  integration,
  submissions,
  subdomain,
}) {
  const message = await sendCommonMessage({
    subdomain,
    action: 'createConversationAndMessage',
    serviceName: 'inbox',
    data: {
      customerId: customer._id,
      integrationId: integration?._id,
      content: form.title,
      formWidgetData: submissions,
      status: 'new',
    },
    isRPC: true,
  });

  return message.conversationId;
}

async function saveFormSubmissions(
  models: IModels,
  { submissions, formId, customerId, conversationId }
) {
  const groupId = nanoid();
  const submissionDocs = submissions.map((submission) => {
    let value = submission.value || '';
    if (submission.validation === 'number') value = Number(submission.value);
    if (['datetime', 'date'].includes(submission.validation))
      value = new Date(submission.value);
    if (submission.validation === 'email') value = value.toLowerCase();

    return {
      formFieldId: submission._id,
      formId,
      value,
      customerId,
      contentType: 'lead',
      conversationId: conversationId || undefined,
      groupId,
    };
  });

  await models.FormSubmissions.insertMany(submissionDocs);
}

function updateCustomerDoc(
  customer,
  customerDoc,
  form,
  integration,
  customFieldsData,
  customerLinks
) {
  if (!customer.scopeBrandIds?.includes(form.brandId || '')) {
    customerDoc.scopeBrandIds = [
      ...(customer.scopeBrandIds || []),
      form.brandId,
    ];
  }

  if (
    integration &&
    !customer.relatedIntegrationIds?.includes(integration._id || '')
  ) {
    customerDoc.relatedIntegrationIds = [
      ...(customer.relatedIntegrationIds || []),
      integration._id,
    ];
  }

  if (!customer.customFieldsData) {
    customerDoc.customFieldsData = customFieldsData;
  } else if (customFieldsData.length > 0) {
    customerDoc.customFieldsData = mergeCustomFieldsData(
      customer.customFieldsData,
      customFieldsData
    );
  }

  if (Object.keys(customerLinks.links || []).length > 0) {
    const links: any = customer.links || {};

    Object.entries(customerLinks.links).forEach(([key, value]) => {
      if (typeof value === 'string' || Array.isArray(value)) {
        if (value.length > 0) {
          links[key] = value;
        }
      }
    });

    customerDoc.links = links;
  }

  if (customerDoc.email && !customer.emails.includes(customerDoc.email)) {
    customerDoc.emails = [...customer.emails, customerDoc.email];
  }

  if (customerDoc.phone && !customer.phones.includes(customerDoc.phone)) {
    customerDoc.phones = [...customer.phones, customerDoc.phone];
  }

  return customerDoc;
}

const mutations = {
  async widgetsLeadConnect(
    _root,
    args: { brandCode: string; formCode: string; cachedCustomerId?: string },
    { models, subdomain }: IContext
  ) {
    const brand = await models.Brands.findOne({ code: args.brandCode }).lean();

    const form = await models.Forms.findOne({
      $or: [{ code: args.formCode }, { _id: args.formCode }],
      status: 'active',
    }).lean();

    if (!brand || !form) {
      throw new Error('Invalid configuration');
    }

    if (form.leadData) {
      await models.Forms.increaseViewCount(form._id);
    }

    if (form.createdUserId) {
      const user = await models.Users.findOne({ _id: form.createdUserId });
      if (user) {
        await registerOnboardHistory({
          models,
          type: 'leadIntegrationInstalled',
          user,
        });
      }
    }

    if (form.leadData?.isRequireOnce && args.cachedCustomerId) {
      const submission = await models.FormSubmissions.findOne({
        formId: form._id,
        customerId: args.cachedCustomerId,
      });
      if (submission) {
        return null;
      }
    }

    return {
      form,
    };
  },

  async widgetsSaveLead(
    _root,
    args: {
      formId: string;
      submissions: any[];
      browserInfo: any;
      cachedCustomerId?: string;
    },
    { models, subdomain, user }: IContext
  ) {
    const { submissions, formId } = args;

    // Step 1: Validate form and submissions
    const form = await models.Forms.getForm(formId);
    const errors = await models.Forms.validateForm(formId, submissions);
    if (errors.length > 0) return { status: 'error', errors };

    // Step 2: Handle integration
    let integration: any = null;
    if (isEnabled('inbox')) {
      integration = await sendCommonMessage({
        serviceName: 'inbox',
        action: 'integrations.findOne',
        data: { _id: form.integrationId },
        isRPC: true,
        defaultValue: null,
        subdomain,
      });
    }

    const customerSchemaLabels = await getSchemaLabels('customer');
    const companySchemaLabels = await getSchemaLabels('company');
    const customerDoc: any = {};
    const companyDoc: any = {};
    const customFieldsData: ICustomField[] = [];
    const companyCustomData: ICustomField[] = [];
    const customerLinks: ILink = {};
    const companyLinks: ILink = {};
    const submissionValues = {};

    // Step 3: Process submissions
    for (const submission of submissions) {
      const submissionType = submission.type || '';
      const value = submission.value || '';
      submissionValues[submission._id] = submission.value;

      // Handle links (customer or company)
      if (submissionType.includes('customerLinks')) {
        customerLinks[getSocialLinkKey(submissionType)] = value;
      } else if (submissionType.includes('companyLinks')) {
        companyLinks[getSocialLinkKey(submissionType)] = value;
      }

      // Handle pronouns
      if (submissionType === 'pronoun') {
        customerDoc.pronoun = mapPronounToCode(value);
      }

      // Handle customer-specific fields
      if (customerSchemaLabels.some((e) => e.name === submissionType)) {
        if (submissionType === 'avatar' && value.length > 0) {
          customerDoc.avatar = value[0].url;
        } else {
          customerDoc[submissionType] = value;
        }
      }

      // Handle company-specific fields
      if (submissionType.includes('company_')) {
        handleCompanyFields(submissionType, value, companyDoc);
      }

      if (companySchemaLabels.some((e) => e.name === submissionType)) {
        companyDoc[submissionType] = value;
      }

      // Handle custom field submissions
      if (submission.associatedFieldId && isCustomField(submissionType)) {
        const field = await models.Fields.findOne({
          _id: submission.associatedFieldId,
        });
        if (!field) continue;

        const fieldGroup = await models.FieldsGroups.findOne({
          _id: field.groupId,
        });
        if (!fieldGroup) continue;

        const targetData =
          fieldGroup.contentType === 'core:company'
            ? companyCustomData
            : customFieldsData;
        targetData.push({ field: submission.associatedFieldId, value });
      }
    }

    // Step 4: Create or update customer

    let customerQry: any = {
      _id: args.cachedCustomerId,
    };

    const { saveAsCustomer } = form.leadData || {};

    if (saveAsCustomer) {
      customerQry = {
        $or: [
          { primaryEmail: customerDoc.email },
          { phones: customerDoc.phone },
          { _id: args.cachedCustomerId },
        ],
      };
    }

    let customer = await models.Customers.findOne(customerQry);
    if (!customer) {
      customer = await models.Customers.createCustomer({
        ...customerDoc,
        emails: [customerDoc.email],
        phones: [customerDoc.phone],
        primaryEmail: saveAsCustomer ? customerDoc.email : null,
        primaryPhone: saveAsCustomer ? customerDoc.phone : null,
        state: saveAsCustomer ? 'customer' : 'lead',
        links: customerLinks,
        customFieldsData,
        integrationId: integration?._id,
        relatedIntegrationIds: [integration?._id],
        scopeBrandIds: [form.brandId],
      });

      await models.Forms.increaseContactsGathered(form._id);
    } else {
      const doc = updateCustomerDoc(
        customer,
        customerDoc,
        form,
        integration,
        customFieldsData,
        customerLinks
      );

      if (saveAsCustomer) {
        doc.state = 'customer';
        doc.primaryEmail = customerDoc.email;
        doc.primaryPhone = customerDoc.phone;
      }

      await models.Customers.updateCustomer(customer._id, doc);
    }

    // Step 5: Handle conversation and messages (if inbox is enabled)
    let conversationId = '';
    if (isEnabled('inbox')) {
      conversationId = await createConversationAndMessage({
        customer,
        form,
        integration,
        submissions,
        subdomain,
      });
    }

    // Step 6: Save form submissions
    await saveFormSubmissions(models, {
      submissions,
      formId,
      customerId: customer._id,
      conversationId,
    });

    sendCommonMessage({
      subdomain,
      serviceName: 'automations',
      action: 'trigger',
      data: {
        type: 'core:form_submission',
        targets: [
          {
            ...submissionValues,
            _id: customer._id,
            conversationId: conversationId || null,
          },
        ],
      },
      isRPC: true,
      defaultValue: null,
    });

    return {
      status: 'ok',
      customerId: customer._id,
      conversationId: conversationId || null,
    };
  },
};

export default mutations;
