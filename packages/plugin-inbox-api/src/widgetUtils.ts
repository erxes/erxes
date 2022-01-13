import {
  Conversations,
  Integrations,
  ConversationMessages
} from "./models";

import {
  Brands,
  Companies,
  Conformities,
  Customers,
  Fields,
  FieldsGroups
} from "./apiCollections";

import { IBrowserInfo, ICustomField, ILink } from "@erxes/api-utils/src/definitions/common";
import { KIND_CHOICES } from "./models/definitions/constants";

// import { ICustomerDocument } from "../db/models/definitions/customers";

// import { ISubmission } from "../db/models/definitions/fields";

import { debugBase, debugError } from "./debuggers";

// import { getDbSchemaLabels } from "./logUtils";

import { getDocument } from "./cacheUtils";
import { client, getIndexPrefix } from "./elasticsearch";
import { sendContactRPCMessage, sendToLog } from "./messageBroker";

// import { findCompany, findCustomer } from "./utils";

export const getOrCreateEngageMessage = async (
  integrationId: string,
  browserInfo: IBrowserInfo,
  visitorId?: string,
  customerId?: string
) => {
  let customer;

  if (customerId) {
    customer = await Customers.getCustomer(customerId);
  }

  if (!customer && !visitorId) {
    return null;
  }

  const integration = await Integrations.getIntegration({
    _id: integrationId,
    kind: KIND_CHOICES.MESSENGER,
  });

  const brand = await Brands.getBrand({ _id: integration.brandId || "" });

  // try to create engage chat auto messages
//   await EngageMessages.createVisitorOrCustomerMessages({
//     brandId: brand._id,
//     integrationId: integration._id,
//     customer,
//     visitorId,
//     browserInfo,
//   });

  // find conversations
  const query = customerId
    ? { integrationId, customerId }
    : { integrationId, visitorId };

  const convs = await Conversations.find(query);

  return ConversationMessages.findOne(Conversations.widgetsUnreadMessagesQuery(convs));
};

export const receiveVisitorDetail = async (visitor) => {
  const { visitorId } = visitor;

  delete visitor.visitorId;
  delete visitor._id;

  const customer = await Customers.update({ visitorId }, { $set: visitor });

  const index = `${getIndexPrefix()}events`;

  try {
    const response = await client.updateByQuery({
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

    debugBase(`Response ${JSON.stringify(response)}`);
  } catch (e) {
    debugError(`Update event error ${e.message}`);
  }

  sendToLog("visitor:removeEntry", { visitorId });

  return customer;
};

const getSocialLinkKey = (type: string) => {
  return type.substring(type.indexOf("_") + 1);
};

const createCustomer = async (
  integrationId: string,
  customerDoc: any,
  brandId?: string
) => {
  return sendContactRPCMessage('create_customer', {
    integrationId,
    primaryEmail: customerDoc.email || "",
    emails: [customerDoc.email || ""],
    firstName: customerDoc.firstName || "",
    lastName: customerDoc.lastName || "",
    middleName: customerDoc.middleName || "",
    primaryPhone: customerDoc.phone || "",
    scopeBrandIds: [brandId || ""],
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

  await Customers.updateCustomer(customer._id, customerDoc);
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

export const solveSubmissions = async (args: {
  integrationId: string;
  formId: string;
//   submissions: ISubmission[];
  submissions;
  browserInfo: any;
  cachedCustomerId?: string;
}) => {
  let { cachedCustomerId } = args;
  const { integrationId, browserInfo, formId } = args;
  const integration = await getDocument("integrations", { _id: integrationId });

  const submissionsGrouped = groupSubmissions(args.submissions);

  const conformityIds: {
    [key: string]: { customerId: string; companyId: string };
  } = {};

  let cachedCustomer;

//   const customerSchemaLabels = await getDbSchemaLabels("customer");
//   const companySchemaLabels = await getDbSchemaLabels("company");
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
        const field = await Fields.findById(submission.associatedFieldId);
        if (!field) {
          continue;
        }

        const fieldGroup = await FieldsGroups.findById(field.groupId);

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
      cachedCustomer = await sendContactRPCMessage('getWidgetCustomer', {
        integrationId,
        cachedCustomerId,
        email: customerDoc.email || "",
        phone: customerDoc.phone || "",
      });

      if (!cachedCustomer) {
        cachedCustomer = await createCustomer(
          integrationId,
          customerDoc,
          integration.brandId || ""
        );
      }

      await updateCustomerFromForm(
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
//       let customer = await findCustomer({
//         customerPrimaryEmail: customerDoc.email || "",
//         customerPrimaryPhone: customerDoc.phone || "",
//       });

      let customer;

      if (!customer) {
        customer = await createCustomer(
          integrationId,
          customerDoc,
          integration.brandId || ""
        );
      }

      await updateCustomerFromForm(
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

//     let company = await findCompany({
//       companyPrimaryName: companyDoc.primaryName || "",
//       companyPrimaryEmail: companyDoc.primaryEmail || "",
//       companyPrimaryPhone: companyDoc.primaryPhone || "",
//     });

    let company;

    companyDoc.scopeBrandIds = [integration.brandId || ""];

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

    // if company scopeBrandIds does not contain brandId
    if (
      company.scopeBrandIds.findIndex((e) => e === integration.brandId) === -1
    ) {
      await Companies.update(
        { _id: company._id },
        { $push: { scopeBrandIds: integration.brandId } }
      );
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
      await Conformities.addConformity({
        mainType: "company",
        mainTypeId: companyId,
        relType: "customer",
        relTypeId: customerId,
      });
    }

    if (key !== "default" && !companyId && customerId) {
      relTypeIds.push(customerId);
    }
  }

  if (mainCompanyId !== "" && relTypeIds.length > 0) {
    for (const relTypeId of relTypeIds) {
      await Conformities.addConformity({
        mainType: "company",
        mainTypeId: mainCompanyId,
        relType: "customer",
        relTypeId,
      });
    }
  }

  // Inserting customer id into submitted customer ids
//   await FormSubmissions.createFormSubmission({
//     formId,
//     customerId: cachedCustomerId,
//     submittedAt: new Date(),
//   });

  return cachedCustomer;
};
