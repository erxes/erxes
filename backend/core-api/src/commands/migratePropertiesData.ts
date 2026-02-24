import * as dotenv from 'dotenv';

dotenv.config();

import { Db, MongoClient } from 'mongodb';

const { MONGO_URL = 'mongodb://localhost:27017/erxes?directConnection=true' } =
  process.env;

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

const client = new MongoClient(MONGO_URL);

let db: Db;

const parseValue = (field, value) => {
  const fieldType = field.type;

  try {
    if (value === undefined || value === null) {
      return value;
    }

    switch (fieldType) {
      case 'multiSelect':
      case 'check':
        if (Array.isArray(value)) {
          return value.map((v) => (v ? String(v).toLowerCase() : v));
        } else if (typeof value === 'string') {
          return value.split(',').map((v) => String(v).toLowerCase());
        } else {
          return value;
        }

      case 'select':
        return Array.isArray(value) ? value.join(',').toLowerCase() : value;

      case 'date':
        return typeof value === 'string' ? new Date(value) : value;

      case 'number':
        return Number(value);

      case 'file':
        return value;

      default:
        return typeof value === 'string' ? String(value).toLowerCase() : value;
    }
  } catch (error) {
    console.log(
      'Error occurred while parsing value:',
      field._id,
      'value:',
      value,
      'error:',
      error,
    );

    return value;
  }
};

const toObject = (contentType, document, fields, groups) => {
  const { customFieldsData } = document || {};

  const propertiesData = {};

  for (const customField of customFieldsData || []) {
    let field = fields.find((field) => field._id === customField.field);

    if (!field) {
      console.log(
        `${contentType} Document (${document._id}) can't find field ${customField.field}. Trying to find group`,
      );

      const group = groups.find((group) => group._id === customField.field);

      if (!group) {
        console.log(
          `${contentType} Document (${document._id}) can't find group ${customField.field}.`,
        );
        continue;
      }

      if (group?.configs?.isMultiple && Array.isArray(customField.value)) {
        const values: any[] = [];

        for (const value of customField.value) {
          if (!value) {
            console.log(
              `${contentType} Group is multiple and Document (${document._id}) can't find value ${customField.field}.`,
            );
            continue;
          }

          if (Object.prototype.toString.call(value) !== '[object Object]') {
            console.log(
              `${contentType} Group is multiple and Document (${document._id}) can't find value is not object ${customField.field}.`,
            );

            continue;
          }

          const fieldIds = Object.keys(value);

          if (!fieldIds.length) {
            console.log(
              `${contentType} Group is multiple and Document (${document._id}) object dont have any field ${customField.field}.`,
            );
            continue;
          }

          const parsedValues = {};

          for (const fieldId of fieldIds) {
            const field = fields.find((field) => field._id === fieldId);

            if (!field) {
              console.log(
                `${contentType} Group is multiple and Document (${document._id}) can't find nested field ${fieldId}.`,
              );
              continue;
            }

            const parsedValue = parseValue(field, value[fieldId]);

            if (parsedValue !== null && parsedValue !== undefined) {
              parsedValues[field._id] = parsedValue;
            }
          }

          if (Object.keys(parsedValues).length) {
            values.push(parsedValues);
          }
        }

        if (values.length) {
          propertiesData[group._id] = values;
        }
      }

      continue;
    }

    const parsedValue = parseValue(field, customField.value);

    if (parsedValue !== null && parsedValue !== undefined) {
      propertiesData[field?._id || customField.field] = parsedValue;
    }
  }

  return propertiesData;
};

const BATCH_SIZE = 1000;

const command = async () => {
  await client.connect();
  db = client.db() as Db;

  const CONTENT_TYPE_COLLECTIONS = {
    // IMPORTANT: Do not add collections here unless they have a `customFieldsData` field.
    // This script will break or have no effect if the collection does not contain `customFieldsData`.

    // core:modules: collection

    'core:customer': db.collection('customers'),
    'core:company': db.collection('companies'),
    'core:product': db.collection('products'),
    'core:user': db.collection('users'),

    // plugin:modules: collection

    // 'frontline:ticket': db.collection('frontline_tickets'),
    // 'frontline:conversation': db.collection('conversations'),

    // "sales:deal": db.collection('deals')
  };

  try {
    const contentTypes = Object.keys(CONTENT_TYPE_COLLECTIONS);

    for (const contentType of contentTypes) {
      const collection = CONTENT_TYPE_COLLECTIONS[contentType];

      const documents = collection.find({}).batchSize(BATCH_SIZE);

      const fields = await db
        .collection('properties_fields')
        .find({ contentType })
        .toArray();

      const groups = await db
        .collection('properties_groups')
        .find({ contentType })
        .toArray();

      const operations: any[] = [];

      for await (const document of documents) {
        if (!document.customFieldsData?.length) {
          console.log(
            `${contentType} Document (${document._id}) has no customFieldsData`,
          );

          continue;
        }

        try {
          const propertiesData = toObject(
            contentType,
            document,
            fields,
            groups,
          );

          if (!propertiesData) {
            console.log(
              `${contentType} Document (${document._id}) can't get propertiesData from customFieldsData ${document?.customFieldsData?.length}`,
            );

            continue;
          }

          operations.push({
            updateOne: {
              filter: { _id: document._id },
              update: { $set: { propertiesData } },
            },
          });
        } catch (error) {
          console.log(
            `Error occurred for ${contentType} document: ${document._id}: ${error.message}`,
          );
        }
      }

      if (operations.length > 0) {
        try {
          const result = await collection.bulkWrite(operations, {
            ordered: false,
          });

          console.log(
            `Updated ${result.modifiedCount} documents for ${contentType}`,
          );
        } catch (bulkError) {
          console.error(`Bulk update failed for ${contentType}:`, bulkError);
        }
      }
    }
  } catch (e) {
    console.log(`Error occurred: ${e.message}`);
  }

  console.log(`Process finished at: ${new Date().toISOString()}`);

  await client.close();
  process.exit();
};

command();
