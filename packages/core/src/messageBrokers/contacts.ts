import {
  consumeQueue,
  consumeRPCQueue
} from "@erxes/api-utils/src/messageBroker";
import { generateModels } from "../connectionResolver";
import {
  findCompany,
  findCustomer,
  getContactsContentItem,
  prepareEngageCustomers
} from "./utils";
import {
  AWS_EMAIL_STATUSES,
  EMAIL_VALIDATION_STATUSES
} from "../data/modules/coc/constants";
import { getNumberOfVisits } from "../events";

const createOrUpdate = async ({
  collection,
  data: { rows, doNotReplaceExistingValues }
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

      let newDoc = doc;

      if (doNotReplaceExistingValues) {
        for (const fieldName of Object.keys(doc)) {
          if (prevEntry[fieldName]) {
            delete newDoc[fieldName];
          }
        }
      }

      newDoc.customFieldsData = cfData;

      operations.push({
        updateOne: { filter: selector, update: { $set: newDoc } }
      });
    } else {
      doc.customFieldsData = customFieldsData;
      doc.createdAt = new Date();
      doc.modifiedAt = new Date();
      operations.push({ insertOne: { document: doc } });
    }
  }

  return collection.bulkWrite(operations);
};

export const setupContactsMessageBroker = async (): Promise<void> => {
  consumeRPCQueue("core:customers.findOne", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: "success",
      data: await findCustomer(models, subdomain, data)
    };
  });

  consumeRPCQueue(
    "core:customers.count",
    async ({ subdomain, data: { selector } }) => {
      const models = await generateModels(subdomain);

      return {
        status: "success",
        data: await models.Customers.find(selector).countDocuments()
      };
    }
  );

  consumeRPCQueue("core:companies.findOne", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: "success",
      data: await findCompany(models, subdomain, data)
    };
  });

  consumeRPCQueue("core:companies.find", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: "success",
      data: await models.Companies.find(data).lean()
    };
  });

  consumeRPCQueue("core:customers.find", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: "success",
      data: await models.Customers.find(data).lean()
    };
  });

  consumeRPCQueue(
    "core:customers.getCustomerIds",
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        status: "success",
        data: await models.Customers.find(data).distinct("_id")
      };
    }
  );

  consumeRPCQueue(
    "core:customers.findActiveCustomers",
    async ({ subdomain, data: { selector, fields, skip, limit } }) => {
      const models = await generateModels(subdomain);

      return {
        status: "success",
        data: await models.Customers.findActiveCustomers(
          selector,
          fields,
          skip,
          limit
        )
      };
    }
  );

  consumeRPCQueue(
    "core:companies.getCompanyName",
    async ({ subdomain, data: { company } }) => {
      const models = await generateModels(subdomain);

      return {
        status: "success",
        data: await models.Companies.getCompanyName(company)
      };
    }
  );

  consumeRPCQueue(
    "core:companies.findActiveCompanies",
    async ({ subdomain, data: { selector, fields, skip, limit } }) => {
      const models = await generateModels(subdomain);

      return {
        status: "success",
        data: await models.Companies.findActiveCompanies(
          selector,
          fields,
          skip,
          limit
        )
      };
    }
  );

  consumeRPCQueue(
    "core:customers.createCustomer",
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        status: "success",
        data: await models.Customers.createCustomer(data)
      };
    }
  );

  consumeRPCQueue(
    "core:companies.createCompany",
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        status: "success",
        data: await models.Companies.createCompany(data)
      };
    }
  );

  consumeRPCQueue(
    "core:customers.updateCustomer",
    async ({ subdomain, data: { _id, doc } }) => {
      const models = await generateModels(subdomain);

      return {
        status: "success",
        data: await models.Customers.updateCustomer(_id, doc)
      };
    }
  );

  consumeRPCQueue(
    "core:customers.updateOne",
    async ({ subdomain, data: { selector, modifier } }) => {
      const models = await generateModels(subdomain);

      return {
        status: "success",
        data: await models.Customers.updateOne(selector, modifier)
      };
    }
  );

  consumeRPCQueue(
    "core:customers.updateMany",
    async ({ subdomain, data: { selector, modifier } }) => {
      const models = await generateModels(subdomain);

      return {
        status: "success",
        data: await models.Customers.updateMany(selector, modifier)
      };
    }
  );

  consumeRPCQueue(
    "core:companies.updateMany",
    async ({ subdomain, data: { selector, modifier } }) => {
      const models = await generateModels(subdomain);

      return {
        status: "success",
        data: await models.Companies.updateMany(selector, modifier)
      };
    }
  );

  consumeRPCQueue(
    "core:customers.markCustomerAsActive",
    async ({ subdomain, data: { customerId } }) => {
      const models = await generateModels(subdomain);

      return {
        status: "success",
        data: await models.Customers.markCustomerAsActive(customerId)
      };
    }
  );

  consumeQueue(
    "core:customers.removeCustomers",
    async ({ subdomain, data: { customerIds } }) => {
      const models = await generateModels(subdomain);

      return {
        status: "success",
        data: await models.Customers.removeCustomers(customerIds)
      };
    }
  );

  consumeRPCQueue(
    "core:companies.updateCompany",
    async ({ subdomain, data: { _id, doc } }) => {
      const { Companies } = await generateModels(subdomain);

      return {
        status: "success",
        data: await Companies.updateCompany(_id, doc)
      };
    }
  );

  consumeRPCQueue(
    "core:companies.removeCompanies",
    async ({ subdomain, data: { _ids } }) => {
      const { Companies } = await generateModels(subdomain);

      return {
        status: "success",
        data: await Companies.removeCompanies(_ids)
      };
    }
  );

  consumeRPCQueue(
    "core:companies.updateCommon",
    async ({ subdomain, data: { selector, modifier } }) => {
      const { Companies } = await generateModels(subdomain);

      return {
        status: "success",
        data: await Companies.updateOne(selector, modifier)
      };
    }
  );

  consumeRPCQueue(
    "core:customers.getWidgetCustomer",
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        status: "success",
        data: await models.Customers.getWidgetCustomer(data)
      };
    }
  );

  consumeRPCQueue(
    "core:customers.updateMessengerCustomer",
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        status: "success",
        data: await models.Customers.updateMessengerCustomer(data)
      };
    }
  );

  consumeRPCQueue(
    "core:customers.createMessengerCustomer",
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      const customer = await models.Customers.createMessengerCustomer(data);

      return {
        status: "success",
        data: customer
      };
    }
  );

  consumeRPCQueue(
    "core:customers.saveVisitorContactInfo",
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        status: "success",
        data: await models.Customers.saveVisitorContactInfo(data)
      };
    }
  );

  consumeQueue(
    "core:customers.updateLocation",
    async ({ subdomain, data: { customerId, browserInfo } }) => {
      const models = await generateModels(subdomain);

      await models.Customers.updateLocation(customerId, browserInfo);
    }
  );

  consumeQueue(
    "core:customers.updateSession",
    async ({ subdomain, data: { customerId } }) => {
      const models = await generateModels(subdomain);

      await models.Customers.updateSession(customerId);
    }
  );

  consumeRPCQueue(
    "core:customers.getCustomerName",
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        data: models.Customers.getCustomerName(data),
        status: "success"
      };
    }
  );

  consumeRPCQueue("contacts.getContentItem", async data => {
    const models = await generateModels("os");
    return {
      status: "success",
      data: await getContactsContentItem(models, data)
    };
  });

  consumeQueue(
    "core:customers.prepareEngageCustomers",
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        status: "success",
        data: await prepareEngageCustomers(models, subdomain, data)
      };
    }
  );

  consumeRPCQueue("core:getNumberOfVisits", async ({ data }) => ({
    status: "success",
    data: await getNumberOfVisits(data)
  }));

  consumeQueue(
    "core:customers.setUnsubscribed",
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      const { customerIds = [], status, _id } = data;

      const update: any = { isSubscribed: "No" };

      if (status === AWS_EMAIL_STATUSES.BOUNCE) {
        update.emailValidationStatus = EMAIL_VALIDATION_STATUSES.INVALID;
      }

      if (_id && status) {
        return {
          status: "success",
          data: await models.Customers.updateOne({ _id }, { $set: update })
        };
      }

      if (customerIds.length > 0 && !status) {
        return {
          status: "success",
          data: await models.Customers.updateMany(
            { _id: { $in: customerIds } },
            { $set: update }
          )
        };
      }
    }
  );

  consumeRPCQueue(
    "core:customers.createOrUpdate",
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        status: "success",
        data: await createOrUpdate({ collection: models.Customers, data })
      };
    }
  );

  consumeRPCQueue(
    "core:companies.createOrUpdate",
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        status: "success",
        data: await createOrUpdate({ collection: models.Companies, data })
      };
    }
  );
};
