import { ICompany, ICustomField, Resolver } from 'erxes-api-shared/core-types';
import { markResolvers, sendTRPCMessage } from 'erxes-api-shared/utils';
import { nanoid } from 'nanoid';
import { IContext, IModels } from '~/connectionResolvers';
import { ISubmission } from '~/modules/form/db/definitions/fields';
import { getSocialLinkKey } from '~/modules/form/utils';
import { ILink } from '~/modules/inbox/@types/integrations';
import { findMessengerCompany } from '~/modules/inbox/graphql/resolvers/mutations/widget';
import { createConversationAndMessage } from '~/modules/inbox/trpc/inbox';
// helpers

type SchemaLabel = {
  name: string;
  label: string;
};

// Helper function to merge customer custom field data
const mergeCustomFieldsData = (
  existingFields: ICustomField[],
  newFields: ICustomField[],
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

type CompanyFormDoc = Pick<
  ICompany,
  'primaryName' | 'avatar' | 'website' | 'size' | 'description'
> & {
  email?: string;
  phone?: string;
  industry?: string[];
};

function getFileUrl(value: unknown): string | undefined {
  const file = Array.isArray(value) ? value[0] : value;

  if (typeof file === 'string') return file;

  if (file && typeof file === 'object' && 'url' in file) {
    return typeof file.url === 'string' ? file.url : undefined;
  }

  return undefined;
}

function getFieldText(value: unknown): string {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number') return String(value);

  return '';
}

function handleCoreCompanyField(
  fieldName: string,
  value: unknown,
  companyDoc: CompanyFormDoc,
) {
  if (fieldName === 'avatar') {
    const url = getFileUrl(value);
    if (url) companyDoc.avatar = url;
    return;
  }

  const text = getFieldText(value);
  if (!text) return;

  switch (fieldName) {
    case 'primaryName':
      companyDoc.primaryName = text;
      break;
    case 'primaryEmail':
      companyDoc.email = text;
      break;
    case 'primaryPhone':
      companyDoc.phone = text;
      break;
    case 'website':
      companyDoc.website = text;
      break;
    case 'industry':
      companyDoc.industry = [text];
      break;
    case 'size': {
      const size = Number(text);
      if (!Number.isNaN(size)) companyDoc.size = size;
      break;
    }
    case 'description':
      companyDoc.description = text;
      break;
    default:
      break;
  }
}

async function saveFormCompany(
  subdomain: string,
  submissions: ISubmission[],
  customerId: string,
) {
  const companyDoc: CompanyFormDoc = {};

  for (const { type, value } of submissions) {
    if (type?.startsWith('core:company:')) {
      handleCoreCompanyField(
        type.slice('core:company:'.length),
        value,
        companyDoc,
      );
    }
  }

  const { primaryName, email, phone } = companyDoc;

  if (!primaryName && !email && !phone) return;

  const company: { _id?: string } | null =
    (await findMessengerCompany(subdomain, {
      name: primaryName,
      email,
      phone,
    })) ||
    (await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'mutation',
      module: 'companies',
      action: 'createCompany',
      input: {
        doc: { ...companyDoc, names: primaryName ? [primaryName] : [] },
      },
      defaultValue: null,
    }));

  if (!company?._id) return;

  const relatedCompanyIds: string[] = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'relation',
    action: 'getRelationIds',
    input: {
      contentType: 'core:customer',
      contentId: customerId,
      relatedContentType: 'core:company',
    },
    defaultValue: [],
  });

  if (relatedCompanyIds.includes(company._id)) return;

  await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'mutation',
    module: 'relation',
    action: 'createRelation',
    input: {
      relation: {
        entities: [
          { contentType: 'core:customer', contentId: customerId },
          { contentType: 'core:company', contentId: company._id },
        ],
      },
    },
  });
}

function handleCoreCustomerField(
  fieldName: string,
  value: any,
  customerDoc: any,
) {
  switch (fieldName) {
    case 'avatar':
      if (Array.isArray(value) && value.length > 0) {
        customerDoc.avatar = value[0].url;
      } else if (value?.url) {
        customerDoc.avatar = value.url;
      }
      break;
    case 'primaryEmail':
      customerDoc.email = value;
      break;
    case 'primaryPhone':
      customerDoc.phone = value;
      break;
    case 'sex':
      customerDoc.sex = mapPronounToCode(value);
      break;
    case 'birthDate':
      customerDoc.birthDate = value ? new Date(value) : value;
      break;
    default:
      customerDoc[fieldName] = value;
      break;
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

async function saveFormSubmissions(
  models: IModels,
  { submissions, formId, customerId, conversationId },
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
  customerLinks,
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
      customFieldsData,
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

  // emails/phones are string[] in the schema
  if (customerDoc.email) {
    const existingEmails: string[] = customer.emails || [];
    if (!existingEmails.includes(customerDoc.email)) {
      customerDoc.emails = [...existingEmails, customerDoc.email];
    }
  }

  if (customerDoc.phone) {
    const existingPhones: string[] = customer.phones || [];
    if (!existingPhones.includes(customerDoc.phone)) {
      customerDoc.phones = [...existingPhones, customerDoc.phone];
    }
  }

  return customerDoc;
}

export const widgetFormMutation: Record<
  string,
  Resolver<any, any, IContext>
> = {
  async widgetsLeadConnect(
    _root,
    args: { channelId: string; formCode: string; cachedCustomerId?: string },
    { models }: IContext,
  ) {
    const channel = await models.Channels.findOne({
      _id: args.channelId,
    }).lean();

    const form = await models.Forms.findOne({
      $or: [{ code: args.formCode }, { _id: args.formCode }],
      status: 'active',
    }).lean();
    if (!channel || !form) {
      throw new Error('Invalid configuration');
    }

    if (form.leadData) {
      await models.Forms.increaseViewCount(form._id);
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
      submissions: any;
      browserInfo: any;
      cachedCustomerId?: string;
    },
    { models, subdomain }: IContext,
  ) {
    const { submissions, formId } = args;

    const form = await models.Forms.getForm(formId);
    const errors = await models.Forms.validateForm(formId, submissions);
    if (errors.length > 0) return { status: 'error', errors };

    let integration: any = null;

    if (form?.integrationId) {
      integration = await models.Integrations.findOne({
        _id: form.integrationId,
      });
    }

    const customerfields = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'fields',
      action: 'getFieldList',
      input: {
        moduleType: 'contact',
        collectionType: 'customer',
      },
    });
    const customerSchemaLabels: SchemaLabel[] = customerfields.map((f) => ({
      name: f.name,
      label: f.label || f.name,
    }));

    const customerDoc: any = {};
    const customFieldsData: ICustomField[] = [];
    const customerLinks: ILink = {};
    const submissionValues = {};

    for (const submission of submissions) {
      const submissionType = submission.type || '';
      const value = submission.value || '';
      submissionValues[submission._id] = submission.value;

      if (submissionType.includes('customerLinks')) {
        customerLinks[getSocialLinkKey(submissionType)] = value;
      }

      if (submissionType === 'pronoun') {
        customerDoc.pronoun = mapPronounToCode(value);
      }

      if (submissionType.startsWith('core:customer:')) {
        const fieldName = submissionType.slice('core:customer:'.length);
        handleCoreCustomerField(fieldName, value, customerDoc);
      } else if (customerSchemaLabels.some((e) => e.name === submissionType)) {
        if (submissionType === 'avatar' && value.length > 0) {
          customerDoc.avatar = value[0].url;
        } else {
          customerDoc[submissionType] = value;
        }
      }

      if (submission.associatedFieldId && isCustomField(submissionType)) {
        const field = await models.Fields.findOne({
          _id: submission.associatedFieldId,
        });
        if (!field) continue;

        const targetData = customFieldsData;
        targetData.push({ field: submission.associatedFieldId, value });
      }
    }

    let customerQry: any = args.cachedCustomerId
      ? { _id: args.cachedCustomerId }
      : null;

    const { saveAsCustomer } = form.leadData || {};

    if (saveAsCustomer) {
      if (args.cachedCustomerId) {
        customerQry = { _id: args.cachedCustomerId };
      } else if (customerDoc.email) {
        customerQry = { customerPrimaryEmail: customerDoc.email };
      } else if (customerDoc.phone) {
        customerQry = { customerPrimaryPhone: customerDoc.phone };
      } else {
        customerQry = null;
      }
    }

    if (form.leadData?.clearCacheAfterSave) {
      if (customerDoc.email) {
        customerQry = { customerPrimaryEmail: customerDoc.email };
      } else if (customerDoc.phone) {
        customerQry = { customerPrimaryPhone: customerDoc.phone };
      } else {
        customerQry = null;
      }
    }

    let customer: any = null;

    if (customerQry) {
      customer = await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        method: 'query',
        module: 'customers',
        action: 'findOne',
        input: { query: customerQry },
        defaultValue: null,
      });
    }
    if (!customer) {
      customer = await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        method: 'mutation',
        module: 'customers',
        action: 'createCustomer',
        input: {
          doc: {
            ...customerDoc,
            emails: customerDoc.email ? [customerDoc.email] : [],
            phones: customerDoc.phone ? [customerDoc.phone] : [],
            primaryEmail: saveAsCustomer ? customerDoc.email : null,
            primaryPhone: saveAsCustomer ? customerDoc.phone : null,
            state: saveAsCustomer ? 'customer' : 'lead',
            links: customerLinks,
            customFieldsData,
            integrationId: integration?._id,
            relatedIntegrationIds: integration?._id ? [integration._id] : [],
            scopeBrandIds: form.channelId ? [form.channelId] : [],
          },
        },
        defaultValue: null,
      });

      if (!customer) {
        throw new Error('Failed to create customer');
      }

      await models.Forms.increaseContactsGathered(form._id);
    } else {
      const doc = updateCustomerDoc(
        customer,
        customerDoc,
        form,
        integration,
        customFieldsData,
        customerLinks,
      );

      if (doc.email) {
        if (saveAsCustomer) {
          doc.primaryEmail = doc.email;
        }
        delete doc.email;
      }

      if (doc.phone) {
        if (saveAsCustomer) {
          doc.primaryPhone = doc.phone;
        }
        delete doc.phone;
      }

      if (saveAsCustomer) {
        doc.state = 'customer';
      }

      const updatedCustomer = await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        method: 'mutation',
        module: 'customers',
        action: 'updateCustomer',
        input: {
          _id: customer._id,
          doc,
        },
        defaultValue: null,
      });
      customer = updatedCustomer || customer;
    }

    await saveFormCompany(subdomain, submissions, customer._id);

    const { conversation } = await createConversationAndMessage(models, {
      customerId: customer._id,
      integrationId: integration?._id,
      content: form.title,
      formWidgetData: submissions,
      status: 'new',
    });
    const conversationId = conversation?._id || '';

    await saveFormSubmissions(models, {
      submissions,
      formId,
      customerId: customer._id,
      conversationId,
    });

    // sendCommonMessage({
    //   subdomain,
    //   serviceName: 'automations',
    //   action: 'trigger',
    //   data: {
    //     type: 'core:form_submission',
    //     targets: [
    //       {
    //         ...submissionValues,
    //         _id: customer._id,
    //         conversationId: conversationId || null,
    //       },
    //     ],
    //   },
    //   isRPC: true,
    //   defaultValue: null,
    // });

    return {
      status: 'ok',
      customerId: customer._id,
      conversationId: conversationId || null,
    };
  },

  async cpWidgetsSaveLead(
    _root,
    args: {
      formId: string;
      submissions: any;
      browserInfo: any;
      cachedCustomerId?: string;
    },
    { models, subdomain }: IContext,
  ) {
    const { submissions, formId } = args;

    const form = await models.Forms.getForm(formId);
    const errors = await models.Forms.validateForm(formId, submissions);
    if (errors.length > 0) return { status: 'error', errors };

    let integration: any = null;

    if (form?.integrationId) {
      integration = await models.Integrations.findOne({
        _id: form.integrationId,
      });
    }

    const customerfields = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'fields',
      action: 'getFieldList',
      input: {
        moduleType: 'contact',
        collectionType: 'customer',
      },
    });
    const customerSchemaLabels: SchemaLabel[] = customerfields.map((f) => ({
      name: f.name,
      label: f.label || f.name,
    }));

    const customerDoc: any = {};
    const customFieldsData: ICustomField[] = [];
    const customerLinks: ILink = {};
    const submissionValues = {};

    for (const submission of submissions) {
      const submissionType = submission.type || '';
      const value = submission.value || '';
      submissionValues[submission._id] = submission.value;

      if (submissionType.includes('customerLinks')) {
        customerLinks[getSocialLinkKey(submissionType)] = value;
      }

      if (submissionType === 'pronoun') {
        customerDoc.pronoun = mapPronounToCode(value);
      }

      if (submissionType.startsWith('core:customer:')) {
        const fieldName = submissionType.slice('core:customer:'.length);
        handleCoreCustomerField(fieldName, value, customerDoc);
      } else if (customerSchemaLabels.some((e) => e.name === submissionType)) {
        if (submissionType === 'avatar' && value.length > 0) {
          customerDoc.avatar = value[0].url;
        } else {
          customerDoc[submissionType] = value;
        }
      }

      if (submission.associatedFieldId && isCustomField(submissionType)) {
        const field = await models.Fields.findOne({
          _id: submission.associatedFieldId,
        });
        if (!field) continue;

        const targetData = customFieldsData;
        targetData.push({ field: submission.associatedFieldId, value });
      }
    }

    let customerQry: any = args.cachedCustomerId
      ? { _id: args.cachedCustomerId }
      : null;

    const { saveAsCustomer } = form.leadData || {};

    if (saveAsCustomer) {
      if (args.cachedCustomerId) {
        customerQry = { _id: args.cachedCustomerId };
      } else if (customerDoc.email) {
        customerQry = { customerPrimaryEmail: customerDoc.email };
      } else if (customerDoc.phone) {
        customerQry = { customerPrimaryPhone: customerDoc.phone };
      } else {
        customerQry = null;
      }
    }

    if (form.leadData?.clearCacheAfterSave) {
      if (customerDoc.email) {
        customerQry = { customerPrimaryEmail: customerDoc.email };
      } else if (customerDoc.phone) {
        customerQry = { customerPrimaryPhone: customerDoc.phone };
      } else {
        customerQry = null;
      }
    }

    let customer: any = null;

    console.log('Customer __Query:', customerQry, customerDoc);
    if (customerQry) {
      customer = await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        method: 'query',
        module: 'customers',
        action: 'findOne',
        input: { query: customerQry },
        defaultValue: null,
      });
    }
    if (!customer) {
      customer = await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        method: 'mutation',
        module: 'customers',
        action: 'createCustomer',
        input: {
          doc: {
            ...customerDoc,
            emails: customerDoc.email ? [customerDoc.email] : [],
            phones: customerDoc.phone ? [customerDoc.phone] : [],
            primaryEmail: saveAsCustomer ? customerDoc.email : null,
            primaryPhone: saveAsCustomer ? customerDoc.phone : null,
            state: saveAsCustomer ? 'customer' : 'lead',
            links: customerLinks,
            customFieldsData,
            integrationId: integration?._id,
            relatedIntegrationIds: integration?._id ? [integration._id] : [],
            scopeBrandIds: form.channelId ? [form.channelId] : [],
          },
        },
        defaultValue: null,
      });

      if (!customer) {
        throw new Error('Failed to create customer');
      }

      await models.Forms.increaseContactsGathered(form._id);
    } else {
      const doc = updateCustomerDoc(
        customer,
        customerDoc,
        form,
        integration,
        customFieldsData,
        customerLinks,
      );

      if (doc.email) {
        if (saveAsCustomer) {
          doc.primaryEmail = doc.email;
        }
        delete doc.email;
      }

      if (doc.phone) {
        if (saveAsCustomer) {
          doc.primaryPhone = doc.phone;
        }
        delete doc.phone;
      }

      if (saveAsCustomer) {
        doc.state = 'customer';
      }

      const updatedCustomer = await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        method: 'mutation',
        module: 'customers',
        action: 'updateCustomer',
        input: {
          _id: customer._id,
          doc,
        },
        defaultValue: null,
      });
      customer = updatedCustomer || customer;
    }

    await saveFormCompany(subdomain, submissions, customer._id);

    const { conversation } = await createConversationAndMessage(models, {
      customerId: customer._id,
      integrationId: integration?._id,
      content: form.title,
      formWidgetData: submissions,
      status: 'new',
    });
    const conversationId = conversation?._id || '';

    await saveFormSubmissions(models, {
      submissions,
      formId,
      customerId: customer._id,
      conversationId,
    });

    // sendCommonMessage({
    //   subdomain,
    //   serviceName: 'automations',
    //   action: 'trigger',
    //   data: {
    //     type: 'core:form_submission',
    //     targets: [
    //       {
    //         ...submissionValues,
    //         _id: customer._id,
    //         conversationId: conversationId || null,
    //       },
    //     ],
    //   },
    //   isRPC: true,
    //   defaultValue: null,
    // });

    return {
      status: 'ok',
      customerId: customer._id,
      conversationId: conversationId || null,
    };
  },
};

markResolvers(widgetFormMutation, {
  wrapperConfig: {
    skipPermission: true,
  },
});

widgetFormMutation.cpWidgetsSaveLead.wrapperConfig = {
  forClientPortal: true,
};
