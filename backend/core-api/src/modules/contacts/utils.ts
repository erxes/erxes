import { EditorAttributeUtil, getPlugins, sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { CONTACT_STATUSES, EMAIL_VALIDATION_STATUSES } from './constants';
import { ICustomerDocument } from 'erxes-api-shared/core-types';

export const generateFilter = async (
  subdomain: string,
  params: any,
  models: IModels,
) => {
  const {
    searchValue,
    tagIds,
    excludeTagIds,
    tagWithRelated,
    type,
    dateFilters,
    brandIds,
    integrationIds,
    integrationTypes,
    status,
    ids,
    excludeIds,
  } = params;

  const filter = {};

  if (type) {
    filter['state'] = { $eq: type };
  }

  if (status) {
    filter['status'] = { $eq: CONTACT_STATUSES[status] };
  }

  if (searchValue) {
    filter['searchText'] = { $regex: searchValue, $options: 'i' };
  }

  if (ids?.length) {
    filter['_id'] = excludeIds ? { $nin: ids } : { $in: ids };
  }

  if (brandIds || integrationIds || integrationTypes) {
    const relatedIntegrationIdSet = new Set();

    if (brandIds) {
      const integrations = await findIntegrations(subdomain, {
        brandId: { $in: brandIds },
      });
      integrations.forEach((i) => relatedIntegrationIdSet.add(i._id));
    }

    if (integrationIds) {
      const integrations = await findIntegrations(subdomain, {
        _id: { $in: integrationIds },
      });
      integrations.forEach((i) => relatedIntegrationIdSet.add(i._id));
    }

    if (integrationTypes) {
      const integrations = await findIntegrations(subdomain, {
        kind: { $in: integrationTypes },
      });
      integrations.forEach((i) => relatedIntegrationIdSet.add(i._id));
    }

    if (relatedIntegrationIdSet.size > 0) {
      filter['relatedIntegrationIds'] = {
        $in: Array.from(relatedIntegrationIdSet),
      };
    }
  }

  if (tagIds?.length || excludeTagIds?.length) {
    let baseTagIds = tagIds || excludeTagIds || [];

    if (tagWithRelated) {
      const tagObjs = await models.Tags.find({ _id: { $in: baseTagIds } });

      tagObjs.forEach((tag) => {
        baseTagIds = baseTagIds.concat(tag.relatedIds || []);
      });
    }

    baseTagIds = [...new Set(baseTagIds)];

    if (tagIds?.length && excludeTagIds?.length) {
      filter['tagIds'] = {
        $in: baseTagIds.filter((id) => tagIds.includes(id)),
        $nin: baseTagIds.filter((id) => excludeTagIds.includes(id)),
      };
    } else if (tagIds?.length) {
      filter['tagIds'] = { $in: baseTagIds };
    } else if (excludeTagIds?.length) {
      filter['tagIds'] = { $nin: baseTagIds };
    }
  }

  if (dateFilters) {
    try {
      const dateFilter = JSON.parse(dateFilters);

      for (const [key, value] of Object.entries(dateFilter)) {
        const { gte, lte } = (value || {}) as { gte?: string; lte?: string };

        if (gte || lte) {
          filter[key] = {};

          if (gte) {
            filter[key]['$gte'] = gte;
          }

          if (lte) {
            filter[key]['$lte'] = lte;
          }
        }
      }
    } catch (err) {
      throw new Error(`Invalid dateFilters JSON: ${err}`);
    }
  }

  return filter;
};

export const createOrUpdate = async ({
  collection,
  data: { rows, doNotReplaceExistingValues },
}) => {
  const operations: any = [];

  for (const row of rows) {
    const { selector, doc, customFieldsData } = row;

    const prevEntry = await collection.findOne(selector).lean();

    if (prevEntry) {
      let cfData = prevEntry.customFieldsData || [];

      // remove existing rows
      for (const cf of customFieldsData || []) {
        cfData = cfData.filter(({ field }) => field !== cf.field);
      }

      // add new rows
      for (const cf of customFieldsData || []) {
        cfData.push(cf);
      }

      const newDoc = { ...doc };

      if (doNotReplaceExistingValues) {
        for (const fieldName of Object.keys(doc)) {
          if (prevEntry[fieldName]) {
            delete newDoc[fieldName];
          }
        }
      }

      newDoc.customFieldsData = cfData;

      operations.push({
        updateOne: { filter: selector, update: { $set: newDoc } },
      });
    } else {
      doc.customFieldsData = customFieldsData;
      doc.createdAt = new Date();
      doc.updatedAt = new Date();
      operations.push({ insertOne: { document: doc } });
    }
  }

  return collection.bulkWrite(operations);
};

export const findIntegrations = (subdomain: string, query, options?) =>
  sendTRPCMessage({
    subdomain,

    pluginName: 'frontline',
    method: 'query',
    module: 'integration',
    action: 'find',
    input: { query },
    defaultValue: [],
    options,
  });

export const getEditorAttributeUtil = async (subdomain: string) => {
  const services = await getPlugins();
  const editor = await new EditorAttributeUtil(
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

    // TODO: uncomment
    // await sendEngagesMessage({
    //   subdomain,
    //   action: "notification",
    //   data: { action, data },
    // });
  };

  // Final steps to perform after all customers are processed
  const onFinishPiping = async () => {
    // TODO: uncomment
    // await sendEngagesMessage({
    //   subdomain,
    //   action: "pre-notification",
    //   data: { engageMessage, customerInfos },
    // });

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