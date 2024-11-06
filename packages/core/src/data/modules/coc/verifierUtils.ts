import { Transform } from "stream";

import { getEnv } from "@erxes/api-utils/src";
import { IModels } from "../../../connectionResolver";
import fetch from "node-fetch";
import { debugError } from "@erxes/api-utils/src/debuggers";
import {
  IValidationResponse,
  IVisitorContact
} from "../../../db/models/definitions/customers";

export const validateSingle = async (
  subdomain: string,
  contact: IVisitorContact
) => {
  const EMAIL_VERIFIER_ENDPOINT = getEnv({
    name: "EMAIL_VERIFIER_ENDPOINT",
    defaultValue: "http://localhost:4100"
  });
  if (!EMAIL_VERIFIER_ENDPOINT) {
    return;
  }
  const { email, phone } = contact;

  const DOMAIN = getEnv({ name: "DOMAIN" })
    ? `${getEnv({ name: "DOMAIN" })}/gateway`
    : "http://localhost:4000";
  const domain = DOMAIN.replace("<subdomain>", subdomain);

  const callback_url = `${domain}/pl:core`;

  let body = {};

  phone
    ? (body = { phone, hostname: callback_url })
    : (body = { email, hostname: callback_url });

  try {
    await fetch(`${EMAIL_VERIFIER_ENDPOINT}/verify-single`, {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    debugError(
      `An error occurred while sending request to the email verifier. Error: ${e.message}`
    );
  }
};

export const updateContactValidationStatus = async (
  { Customers }: IModels,
  data: IValidationResponse
) => {
  const { email, phone, status } = data;

  if (email) {
    await Customers.updateMany(
      { primaryEmail: email },
      { $set: { emailValidationStatus: status } }
    );
  }

  if (phone) {
    await Customers.updateMany(
      { primaryPhone: phone },
      { $set: { phoneValidationStatus: status } }
    );
  }
};

export const validateBulk = async (
  models: IModels,
  subdomain: string,
  verificationType: string
) => {
  const EMAIL_VERIFIER_ENDPOINT = getEnv({
    name: "EMAIL_VERIFIER_ENDPOINT",
    defaultValue: "http://localhost:4100"
  });

  const DOMAIN = getEnv({ name: "DOMAIN" })
    ? `${getEnv({ name: "DOMAIN" })}/gateway`
    : "http://localhost:4000";
  const domain = DOMAIN.replace("<subdomain>", subdomain);

  const callback_url = `${domain}/pl:core`;

  const BATCH_SIZE = 1000;

  const sendBatch = async (data: string[], type: "email" | "phone") => {
    // Filter out empty strings from the data array
    const filteredData = data.filter(item => item.trim() !== "");

    if (filteredData.length === 0) {
      return; // No valid data to send, skip this batch
    }
    const endpoint = `${EMAIL_VERIFIER_ENDPOINT}/verify-bulk`;
    const body =
      type === "email"
        ? { emails: filteredData, hostname: callback_url }
        : { phones: filteredData, hostname: callback_url };

    await fetch(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" }
    });
  };

  const processBatch = async (customersCursor, type: "email" | "phone") => {
    const batch: string[] = [];

    for await (const customer of customersCursor) {
      if (type === "email") {
        batch.push(customer.primaryEmail);
      } else {
        batch.push(customer.primaryPhone);
      }

      if (batch.length >= BATCH_SIZE) {
        await sendBatch(batch, type);
        batch.length = 0; // Clear the batch
      }
    }

    if (batch.length > 0) {
      await sendBatch(batch, type);
    }
  };

  try {
    if (verificationType === "email") {
      const customersCursor = models.Customers.find(
        {
          primaryEmail: { $exists: true, $nin: [null, ""] },
          $or: [
            { emailValidationStatus: "unknown" },
            { emailValidationStatus: { $exists: false } }
          ]
        },
        { primaryEmail: 1, _id: 0 }
      ).cursor();

      await processBatch(customersCursor, "email");
    } else {
      const customersCursor = models.Customers.find(
        {
          primaryPhone: { $exists: true, $nin: [null, ""] },
          $or: [
            { phoneValidationStatus: "unknown" },
            { phoneValidationStatus: { $exists: false } }
          ]
        },
        { primaryPhone: 1, _id: 0 }
      ).cursor();

      await processBatch(customersCursor, "phone");
    }

    return "done";
  } catch (error) {
    throw error;
  }
};

export const updateContactsValidationStatus = async (
  models: IModels,
  type: string,
  data: Array<{ email?: string; phone?: string; status: string }>
) => {
  console.log(data);
  
  if (type === "email") {
    try {
      const bulkOps: Array<{
        updateMany: {
          filter: { primaryEmail: string };
          update: { $set: { emailValidationStatus: string } };
        };
      }> = [];

      for (const { email, status } of data) {
        if (email) {
          bulkOps.push({
            updateMany: {
              filter: { primaryEmail: email },
              update: { $set: { emailValidationStatus: status } }
            }
          });
        }
      }

      if (bulkOps.length > 0) {
        await models.Customers.bulkWrite(bulkOps);
      }
    } catch (e) {
      console.log(e);
    }
  }

  const phoneBulkOps: Array<{
    updateMany: {
      filter: { primaryPhone: string };
      update: { $set: { phoneValidationStatus: string } };
    };
  }> = [];

  for (const { phone, status } of data) {
    if (phone) {
      phoneBulkOps.push({
        updateMany: {
          filter: { primaryPhone: phone },
          update: { $set: { phoneValidationStatus: status } }
        }
      });
    }
  }

  if (phoneBulkOps.length > 0) {
    await models.Customers.bulkWrite(phoneBulkOps);
  }
};

