import { chunkArray } from "@erxes/api-utils/src";
import EditorAttributeUtil from "@erxes/api-utils/src/editorAttributeUtils";
import { customFieldsDataByFieldCode } from "@erxes/api-utils/src/fieldUtils";
import { getServices } from "@erxes/api-utils/src/serviceDiscovery";
import { ICustomField } from "@erxes/api-utils/src/types";
import { IModels } from "../connectionResolver";
import {
  EMAIL_VALIDATION_STATUSES,
  LOG_MAPPINGS
} from "../data/modules/coc/constants";
import { ICustomerDocument } from "../db/models/definitions/customers";
import { sendEngagesMessage } from "../messageBroker";

export const buildLabelList = (obj = {}): any[] => {
  const list: any[] = [];
  const fieldNames: string[] = Object.getOwnPropertyNames(obj);

  for (const name of fieldNames) {
    const field: any = obj[name];
    const label: string = field && field.label ? field.label : "";

    list.push({ name, label });
  }

  return list;
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

export const getSocialLinkKey = (type: string) => {
  return type.substring(type.indexOf("_") + 1);
};

export const getEditorAttributeUtil = async (subdomain: string) => {
  const services = await getServices();
  const editor = await new EditorAttributeUtil(
    `${process.env.DOMAIN}/gateway/pl:core`,
    services,
    subdomain
  );

  return editor;
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
        if (typeof field === "object" && field.type && field.type.obj) {
          fieldNames = fieldNames.concat(buildLabelList(field.type.obj));
        }
      }
    } // end schema for loop
  } // end schema name mapping

  return fieldNames;
};

export const findCustomer = async (
  { Customers }: IModels,
  subdomain: string,
  doc
) => {
  let customer;

  const defaultFilter = { status: { $ne: "deleted" } };

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
      subdomain
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

  const defaultFilter = { status: { $ne: "deleted" } };

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
      subdomain
    );
  }

  return company;
};

export const getContactsContentItem = async (
  { Customers, Companies }: IModels,
  activityLog
) => {
  const { action, contentType, content } = activityLog;

  if (action === "merge") {
    let result = {};

    switch (contentType) {
      case "company":
        result = await Companies.find({ _id: { $in: content } }).lean();
        break;
      case "customer":
        result = await Customers.find({ _id: { $in: content } }).lean();
        break;
      default:
        break;
    }

    return result;
  }

  return null;
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

  const emailConf = engageMessage.email ? engageMessage.email : { content: "" };
  const emailContent = emailConf.content || "";

  const editorAttributeUtil = await getEditorAttributeUtil(subdomain);
  const customerFields = await editorAttributeUtil.getCustomerFields(emailContent);

  const exists = { $exists: true, $nin: [null, "", undefined] };

  // Ensure email & phone are valid based on the engage message method
  if (engageMessage.method === "email") {
    customersSelector.primaryEmail = exists;
    customersSelector.emailValidationStatus = EMAIL_VALIDATION_STATUSES.VALID;
  }
  if (engageMessage.method === "sms") {
    customersSelector.primaryPhone = exists;
    customersSelector.phoneValidationStatus = EMAIL_VALIDATION_STATUSES.VALID;
  }

  const customersItemsMapping = JSON.parse("{}");

  // Define fields to include in customer queries
  const fieldsOption = {
    primaryEmail: 1,
    emailValidationStatus: 1,
    phoneValidationStatus: 1,
    primaryPhone: 1,
  };

  for (const field of customerFields || []) {
    fieldsOption[field] = 1;
  }

  const customersStream = (Customers.find(customersSelector, fieldsOption) as any).cursor();
  const batchSize = 1000;
  let batch: Array<ICustomerDocument> = [];

  // Function to process each batch of customers
  const processCustomerBatch = async (batch: Array<ICustomerDocument>) => {
    const chunkCustomerInfos: Array<any> = [];

    for (const customer of batch) {
      const itemsMapping = customersItemsMapping[customer._id] || [null];

      for (const item of itemsMapping) {
        const replacers = await editorAttributeUtil.generateReplacers({
          content: emailContent,
          customer,
          item,
          customerFields,
        });

        chunkCustomerInfos.push({
          _id: customer._id,
          primaryEmail: customer.primaryEmail,
          emailValidationStatus: customer.emailValidationStatus,
          phoneValidationStatus: customer.phoneValidationStatus,
          primaryPhone: customer.primaryPhone,
          replacers,
        });
      }
    }

    customerInfos.push(...chunkCustomerInfos);

    // Send the engage message for each batch
    const data: any = {
      ...engageMessage,
      customers: chunkCustomerInfos,
      fromEmail: user.email,
      engageMessageId: engageMessage._id,
    };

    if (engageMessage.method === "email" && engageMessage.email) {
      const replacedContent = await editorAttributeUtil.replaceAttributes({
        customerFields,
        content: emailContent,
        user,
      });

      engageMessage.email.content = replacedContent;
      data.email = engageMessage.email;
    }

    await sendEngagesMessage({
      subdomain,
      action: "notification",
      data: { action, data },
    });
  };

  // Final steps to perform after all customers are processed
  const onFinishPiping = async () => {
    await sendEngagesMessage({
      subdomain,
      action: "pre-notification",
      data: { engageMessage, customerInfos },
    });

    // You can perform any final actions here after processing all batches
  };

  // Stream processing using async iterator
  for await (const customer of customersStream) {
    batch.push(customer);

    if (batch.length >= batchSize) {
      await processCustomerBatch(batch);
      batch = []; // Reset the batch after processing
    }
  }

  // Process any remaining customers in the last batch
  if (batch.length > 0) {
    await processCustomerBatch(batch);
  }

  // Final actions after all data is processed
  await onFinishPiping();

  return { status: "done", customerInfos };
};


