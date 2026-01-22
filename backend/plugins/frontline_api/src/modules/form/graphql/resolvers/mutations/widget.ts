import { ICustomField } from 'erxes-api-shared/core-types';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { nanoid } from 'nanoid';
import { IContext, IModels } from '~/connectionResolvers';
import { getSocialLinkKey } from '~/modules/form/utils';
import { ILink } from '~/modules/inbox/@types/integrations';
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

function handleCompanyFields(
  submissionType: string,
  value: any,
  companyDoc: any,
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

  if (
    customerDoc.email &&
    !customer.emails.find((e) => e.email === customerDoc.email)
  ) {
    customerDoc.emails = [
      ...customer.emails,
      { email: customerDoc.email, type: 'other' },
    ];
  }

  if (
    customerDoc.phone &&
    !customer.phones.find((p) => p.phone === customerDoc.phone)
  ) {
    customerDoc.phones = [
      ...customer.phones,
      { phone: customerDoc.phone, type: 'other' },
    ];
  }

  return customerDoc;
}

export const widgetFormMutation = {
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

    if (form && form.integrationId) {
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
    const companyfields = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'fields',
      action: 'getFieldList',
      input: {
        moduleType: 'contact',
        collectionType: 'company',
      },
    });

    const customerSchemaLabels: SchemaLabel[] = customerfields.map((f) => ({
      name: f.name,
      label: f.label || f.name,
    }));
    const companySchemaLabels: SchemaLabel[] = companyfields.map((f) => ({
      name: f.name,
      label: f.label || f.name,
    }));

    const customerDoc: any = {};
    const companyDoc: any = {};
    const customFieldsData: ICustomField[] = [];
    const customerLinks: ILink = {};
    const companyLinks: ILink = {};
    const submissionValues = {};

    for (const submission of submissions) {
      const submissionType = submission.type || '';
      const value = submission.value || '';
      submissionValues[submission._id] = submission.value;

      if (submissionType.includes('customerLinks')) {
        customerLinks[getSocialLinkKey(submissionType)] = value;
      } else if (submissionType.includes('companyLinks')) {
        companyLinks[getSocialLinkKey(submissionType)] = value;
      }

      if (submissionType === 'pronoun') {
        customerDoc.pronoun = mapPronounToCode(value);
      }

      if (customerSchemaLabels.some((e) => e.name === submissionType)) {
        if (submissionType === 'avatar' && value.length > 0) {
          customerDoc.avatar = value[0].url;
        } else {
          customerDoc[submissionType] = value;
        }
      }

      if (submissionType.includes('company_')) {
        handleCompanyFields(submissionType, value, companyDoc);
      }

      if (companySchemaLabels.some((e) => e.name === submissionType)) {
        companyDoc[submissionType] = value;
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

    let customerQry: any = {
      _id: args.cachedCustomerId,
    };

    const { saveAsCustomer } = form.leadData || {};

    if (saveAsCustomer) {
      customerQry = {
        $or: [{ _id: args.cachedCustomerId }],
      };

      if (customerDoc.email) {
        customerQry.$or.push({ primaryEmail: customerDoc.email });
      }
      if (customerDoc.phone) {
        customerQry.$or.push({ primaryPhone: customerDoc.phone });
      }

      if (!customerDoc.email && !customerDoc.phone && !args.cachedCustomerId) {
        customerQry = null;
      }
    }

    if (form.leadData?.clearCacheAfterSave) {
      customerQry = {
        $or: [],
      };

      if (customerDoc.email) {
        customerQry.$or.push({ primaryEmail: customerDoc.email });
      }
      if (customerDoc.phone) {
        customerQry.$or.push({ primaryPhone: customerDoc.phone });
      }

      if (customerQry.$or.length === 0) {
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
        input: { customerQry },
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
            emails: [customerDoc.email],
            phones: [customerDoc.phone],
            primaryEmail: saveAsCustomer ? customerDoc.email : null,
            primaryPhone: saveAsCustomer ? customerDoc.phone : null,
            state: saveAsCustomer ? 'customer' : 'lead',
            links: customerLinks,
            customFieldsData,
            integrationId: integration?._id,
            relatedIntegrationIds: [integration?._id],
            scopeBrandIds: [form.channelId],
          },
        },
      });

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

      if (saveAsCustomer) {
        doc.state = 'customer';
        doc.primaryEmail = customerDoc.email;
        doc.primaryPhone = customerDoc.phone;
      }
      customer = await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        method: 'mutation',
        module: 'customers',
        action: 'updateCustomer',
        input: {
          _id: customer._id,
          doc: {
            doc,
          },
        },
      });
    }

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
