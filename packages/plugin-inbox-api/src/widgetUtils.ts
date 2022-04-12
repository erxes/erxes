import { IBrowserInfo, ICustomField, ILink } from "@erxes/api-utils/src/definitions/common";
import { KIND_CHOICES } from "./models/definitions/constants";
import { debug } from "./configs";

import { es } from "./configs";
import { sendContactsMessage, sendCoreMessage, sendEngagesMessage, sendFormsMessage, sendLogsMessage } from "./messageBroker";
import { IModels } from "./connectionResolver";

export const getOrCreateEngageMessage = async (
  models: IModels,
  subdomain: string,
  integrationId: string,
  browserInfo: IBrowserInfo,
  visitorId?: string,
  customerId?: string
) => {
  let customer;

  if (customerId) {
    customer = await sendContactsMessage({
      subdomain,
      action: 'customers.findOne',
      data: {
        _id: customerId
      },
      isRPC: true
    });
  }

  if (!customer && !visitorId) {
    return null;
  }

  const integration = await models.Integrations.getIntegration({
    _id: integrationId,
    kind: KIND_CHOICES.MESSENGER,
  });

  const brand = await sendCoreMessage({
    subdomain,
    action: 'brands.findOne',
    data: {
      query: {
        _id: integration.brandId
      }
    },
    isRPC: true,
    defaultValue: {}
  });

  // try to create engage chat auto messages
  await sendEngagesMessage({
    subdomain,
    action: 'createVisitorOrCustomerMessages',
    data: {
      brandId: brand._id,
      integrationId: integration._id,
      customer,
      visitorId,
      browserInfo
    },
    isRPC: true
  });

  // find conversations
  const query = customerId
    ? { integrationId, customerId }
    : { integrationId, visitorId };

  const convs = await models.Conversations.find(query);

  return models.ConversationMessages.findOne(models.Conversations.widgetsUnreadMessagesQuery(convs));
};

export const receiveVisitorDetail = async (subdomain: string, visitor) => {
  const { visitorId } = visitor;

  delete visitor.visitorId;
  delete visitor._id;

  const customer = await sendContactsMessage({
    subdomain,
    action: 'customers.updateOne',
    data: {
      selector: { visitorId },
      modifier: { $set: visitor }
    },
    isRPC: true
  });

  const index = `${es.getIndexPrefix()}events`;

  try {
    const response = await es.client.updateByQuery({
      index,
      body: {
        script: {
          lang: "painless",
          source:
            "ctx._source.visitorId = null; ctx._source.customerId = params.customerId",
          params: {
            customerId: customer._id,
          },
        },
        query: {
          term: {
            visitorId,
          },
        },
      },
    });

    debug.info(`Response ${JSON.stringify(response)}`);
  } catch (e) {
    debug.error(`Update event error ${e.message}`);
  }

  await sendLogsMessage({
    subdomain,
    action: 'visitor.removeEntry',
    data: {
       visitorId 
    }
  });

  return customer;
};

const getSocialLinkKey = (type: string) => {
  return type.substring(type.indexOf("_") + 1);
};

const createCustomer = async (
  subdomain: string,
  integrationId: string,
  customerDoc: any,
  brandId?: string
) => {

  return sendContactsMessage({
    subdomain,
    action: 'customers.createCustomer',
    data: {
      integrationId,
      primaryEmail: customerDoc.email || '',
      emails: [customerDoc.email || ''],
      firstName: customerDoc.firstName || '',
      lastName: customerDoc.lastName || '',
      middleName: customerDoc.middleName || '',
      primaryPhone: customerDoc.phone || '',
      scopeBrandIds: [brandId || '']
    },
    isRPC: true
  });
};

const prepareCustomFieldsData = (
  customerData: ICustomField[],
  submissionData: ICustomField[]
) => {
  const customFieldsData: ICustomField[] = [];

  if (customerData.length === 0) {
    return submissionData;
  }

  for (const data of submissionData) {
    const existingData = customerData.find((e) => e.field === data.field);

    if (existingData && Array.isArray(existingData.value)) {
      data.value = existingData.value.concat(data.value);
    }

    customFieldsData.push(data);
  }

  return customFieldsData;
};

export const updateCustomerFromForm = async (
  subdomain: string,
  browserInfo: any,
  doc: any,
//   customer: ICustomerDocument
  customer
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
          primaryEmail: doc.email,
        }),
    ...(customer.primaryPhone
      ? {}
      : {
          phones: [doc.phone],
          primaryPhone: doc.phone,
        }),
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

  await sendContactsMessage({
    subdomain,
    action: 'customers.updateCustomer',
    data: {
      _id: customer._id,
      doc: customerDoc
    },
    isRPC: true
  });
};

// const groupSubmissions = (submissions: ISubmission[]) => {
const groupSubmissions = (submissions: any[]) => {
//   const submissionsGrouped: { [key: string]: ISubmission[] } = {};
  const submissionsGrouped: { [key: string]: any[] } = {};

  submissions.forEach((submission) => {
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

export const solveSubmissions = async (models: IModels, subdomain: string, args: {
  integrationId: string;
  formId: string;
  submissions;
  browserInfo: any;
  cachedCustomerId?: string;
}) => {
  let { cachedCustomerId } = args;
  const { integrationId, browserInfo } = args;
  const integration: any = await models.Integrations.findOne({ _id: integrationId });

  const submissionsGrouped = groupSubmissions(args.submissions);
  const conformityIds: { [key: string]: { customerId: string; companyId: string } } = {};

  let cachedCustomer;

// ?  const customerSchemaLabels = await getDbSchemaLabels("customer");
// ?  const companySchemaLabels = await getDbSchemaLabels("company");
  const customerSchemaLabels: any[] = [];
  const companySchemaLabels: any[] = [];

  for (const groupId of Object.keys(submissionsGrouped)) {
    const customerLinks: ILink = {};
    const companyLinks: ILink = {};
    const customerDoc: any = {};
    const companyDoc: any = {};

    const customFieldsData: ICustomField[] = [];
    const companyCustomData: ICustomField[] = [];

    for (const submission of submissionsGrouped[groupId]) {
      const submissionType = submission.type || "";

      if (submissionType.includes("customerLinks")) {
        customerLinks[getSocialLinkKey(submissionType)] = submission.value;
        continue;
      }

      if (submissionType.includes("companyLinks")) {
        companyLinks[getSocialLinkKey(submissionType)] = submission.value;
        continue;
      }

      if (submissionType === "pronoun") {
        switch (submission.value) {
          case "Male":
            customerDoc.pronoun = 1;
            break;
          case "Female":
            customerDoc.pronoun = 2;
            break;
          case "Not applicable":
            customerDoc.pronoun = 9;
            break;
          default:
            customerDoc.pronoun = 0;
            break;
        }
        continue;
      }

      if (
        customerSchemaLabels.findIndex((e) => e.name === submissionType) !== -1
      ) {
        if (
          submissionType === "avatar" &&
          submission.value &&
          submission.value.length > 0
        ) {
          customerDoc.avatar = submission.value[0].url;
          continue;
        }

        customerDoc[submissionType] = submission.value;
        continue;
      }

      if (submissionType.includes("company_")) {
        if (
          submissionType === "company_avatar" &&
          submission.value &&
          submission.value.length > 0
        ) {
          companyDoc.avatar = submission.value[0].url;
          continue;
        }

        const key = submissionType.split("_")[1];
        companyDoc[key] = submission.value;
        continue;
      }

      if (
        companySchemaLabels.findIndex((e) => e.name === submissionType) !== -1
      ) {
        companyDoc[submissionType] = submission.value;
        continue;
      }

      if (
        submission.associatedFieldId &&
        [
          "input",
          "select",
          "multiSelect",
          "file",
          "textarea",
          "radio",
          "check",
        ].includes(submissionType)
      ) {
        const field = await sendFormsMessage({
          subdomain,
          action: 'fields.findOne',
          data: { query: { _id: submission.associatedFieldId } },
          isRPC: true
        });

        if (!field) {
          continue;
        }

        const fieldGroup = await sendFormsMessage({
          subdomain,
          action: 'fieldsGroups.findOne',
          data: { query: { _id: field.groupId }, isRPC: true }
        });

        if (fieldGroup && fieldGroup.contentType === "company") {
          companyCustomData.push({
            field: submission.associatedFieldId,
            value: submission.value,
          });
        }

        if (fieldGroup && fieldGroup.contentType === "customer") {
          customFieldsData.push({
            field: submission.associatedFieldId,
            value: submission.value,
          });
        }
       }
    }

    if (groupId === "default") {
      cachedCustomer = await sendContactsMessage({
        subdomain,
        action: 'customers.getWidgetCustomer',
        data: {
          integrationId,
          cachedCustomerId,
          email: customerDoc.email || '',
          phone: customerDoc.phone || ''
        },
        isRPC: true
      });

      if (!cachedCustomer) {
        cachedCustomer = await createCustomer(
          subdomain,
          integrationId,
          customerDoc,
          integration.brandId || ""
        );
      }

      await updateCustomerFromForm(
        subdomain,
        browserInfo,
        {
          ...customerDoc,
          customFieldsData,
          links: customerLinks,
          scopeBrandIds: [integration.brandId || ""],
        },
        cachedCustomer
      );

      cachedCustomerId = cachedCustomer._id;

      conformityIds[groupId] = {
        customerId: cachedCustomer._id,
        companyId: "",
      };
    } else {

      let customer = await sendContactsMessage({
        subdomain,
        action: 'customers.findOne',
        data: {
          customerPrimaryEmail: customerDoc.email || '',
          customerPrimaryPhone: customerDoc.phone || ''
        },
        isRPC: true
      });

      if (!customer) {
        customer = await createCustomer(
          subdomain,
          integrationId,
          customerDoc,
          integration.brandId || ""
        );
      }

      await updateCustomerFromForm(
        subdomain,
        browserInfo,
        {
          ...customerDoc,
          customFieldsData,
          links: customerLinks,
          scopeBrandIds: [integration.brandId || ""],
        },
        customer
      );

      conformityIds[groupId] = { customerId: customer._id, companyId: "" };
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

    let company = await sendContactsMessage({
      subdomain,
      action: 'companies.findOne',
      data: {
        companyPrimaryName: companyDoc.primaryName || '',
        companyPrimaryEmail: companyDoc.primaryEmail || '',
        companyPrimaryPhone: companyDoc.primaryPhone || ''
      },
      isRPC: true
    });

    companyDoc.scopeBrandIds = [integration.brandId || ""];

    if (!company) {
      company = await sendContactsMessage({
        subdomain,
        action: "companies.createCompany",
        data: companyDoc,
        isRPC: true
      })
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

    company = await sendContactsMessage({
      subdomain,
      action: 'companies.updateCompany',
      data: {
        _id: company._id,
        doc: companyDoc
      },
      isRPC: true
    });

    // if company scopeBrandIds does not contain brandId
    if (
      company.scopeBrandIds.findIndex((e) => e === integration.brandId) === -1
    ) {
      await sendContactsMessage({
        subdomain,
        action: 'companies.updateCommon',
        data: {
          selector: { _id: company._id },
          modifier: { $push: { scopeBrandIds: integration.brandId } }
        },
        isRPC: true
      });
    }

    conformityIds[groupId] = {
      companyId: company._id,
      customerId: conformityIds[groupId].customerId,
    };
  }

  let mainCompanyId = "";
  const relTypeIds: string[] = [];

  for (const key of Object.keys(conformityIds)) {
    const { companyId, customerId } = conformityIds[key];

    if (key === "default" && companyId && customerId) {
      mainCompanyId = companyId;
      relTypeIds.push(customerId);
    }

    if (key !== "default" && companyId && customerId) {
      await sendCoreMessage({
        subdomain,
        action: 'conformities.addConformity',
        data: {
          mainType: 'company',
          mainTypeId: companyId,
          relType: 'customer',
          relTypeId: customerId
        },
        isRPC: true
      });
    }

    if (key !== "default" && !companyId && customerId) {
      relTypeIds.push(customerId);
    }
  }

  if (mainCompanyId !== "" && relTypeIds.length > 0) {
    for (const relTypeId of relTypeIds) {
      await sendCoreMessage({
        subdomain,
        action: 'conformities.addConformity',
        data: {
          mainType: 'company',
          mainTypeId: mainCompanyId,
          relType: 'customer',
          relTypeId
        },
        isRPC: true
      });
    }
  }

  // ? Inserting customer id into submitted customer ids
//   await FormSubmissions.createFormSubmission({
//     formId,
//     customerId: cachedCustomerId,
//     submittedAt: new Date(),
//   });

  return cachedCustomer;
};
