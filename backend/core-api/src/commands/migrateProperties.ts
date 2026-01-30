import * as dotenv from 'dotenv';

dotenv.config();

import { Collection, Db, MongoClient, ObjectId } from 'mongodb';

const { MONGO_URL = 'mongodb://localhost:27017/erxes?directConnection=true' } =
  process.env;

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

const client = new MongoClient(MONGO_URL);

let db: Db;

let OLD_PROPERTY_GROUPS: Collection;
let OLD_PROPERTY_FIELDS: Collection;

let NEW_PROPERTY_GROUPS: Collection;
let NEW_PROPERTY_FIELDS: Collection;

const CONTENT_TYPE_REGEX = /^[a-z]+:[a-z]+$/;

const parseContentType = (contentType) => {
  if (!contentType || !CONTENT_TYPE_REGEX.test(contentType)) {
    return '';
  }

  const [pluginName, moduleName] = contentType.split(':');

  switch (pluginName) {
    case 'inbox':
      return `frontline:${moduleName}`;
    case 'tickets':
      return `frontline:${moduleName}`;
    case 'tasks':
      return `operation:${moduleName}`;
    default:
      return contentType;
  }
};

const DEFAULT_ORDER_GAP = 1000;

const parseOrder = (order = 0) => order * DEFAULT_ORDER_GAP;

const parseLogics = (group) => {
  const { logics, logicAction } = group || {};

  return (logics || []).map((logic) => ({
    field: logic.fieldId,
    operator: logic.logicOperator,
    value: logic.logicValue,
    action: logicAction,
  }));
};

const parseConfigs = (item, type) => {
  if (type === 'group') {
    const { config, alwaysOpen, isMultiple, isVisible, isVisibleInDetail } =
      item || {};

    return {
      ...(config || {}),
      categoryIds: config?.category || [],
      alwaysOpen: alwaysOpen,
      isMultiple: isMultiple,
      isVisible: isVisible,
      isVisibleInDetail: isVisibleInDetail,
    };
  }

  const {
    isVisibleToCreate,
    canHide,
    isVisible,
    searchable,
    showInCard,
    isDisabled,
  } = item || {};

  return {
    isVisibleToCreate,
    canHide,
    isVisible,
    searchable,
    showInCard,
    isDisabled,
  };
};

const parseValidations = (field) => {
  const { validation, regexValidation, isRequired } = field || {};

  const validations = {};

  if (validation) {
    validations[validation] = !!validation;
  }

  if (isRequired) {
    validations['required'] = isRequired;
  }

  if (regexValidation) {
    validations['regex'] = regexValidation;
  }

  return validations;
};

const parseOptions = (field) => {
  const { options, locationOptions } = field || {};

  const parsedLocationOptions = (locationOptions || []).map((option) => ({
    label: option.description,
    value: option.description,
    coordinates: { lat: option.lat, lng: option.lng },
  }));

  const parsedOptions = (options || []).map((option) => ({
    label: option.label,
    value: option.value,
  }));

  return [...(parsedOptions || []), ...(parsedLocationOptions || [])];
};

const BATCH_SIZE = 1000;

const command = async () => {
  await client.connect();

  db = client.db() as Db;

  OLD_PROPERTY_GROUPS = db.collection('fields_groups');
  OLD_PROPERTY_FIELDS = db.collection('form_fields');

  NEW_PROPERTY_GROUPS = db.collection('properties_groups');
  NEW_PROPERTY_FIELDS = db.collection('properties_fields');

  try {
    const property_groups = OLD_PROPERTY_GROUPS.find({}).batchSize(BATCH_SIZE);

    let property_groups_bulk: any = [];

    for await (const property_group of property_groups) {
      if (!property_group) {
        console.log('Skipping empty property group');
        continue;
      }

      property_groups_bulk.push({
        insertOne: {
          document: {
            _id: new ObjectId(property_group._id),
            name: property_group.name,
            code: property_group.code,
            description: property_group.description,
            contentType: parseContentType(property_group.contentType),
            contentTypeId: property_group.contentTypeId,
            order: parseOrder(property_group.order),
            logics: parseLogics(property_group),
            configs: parseConfigs(property_group, 'group'),

            createdBy: property_group.createdBy,
            updatedBy: property_group.lastUpdatedUserId,
            createdAt: property_group.createdAt || new Date(),
            updatedAt: property_group.updatedAt || new Date(),
          },
        },
      });

      if (property_groups_bulk?.length >= BATCH_SIZE) {
        await NEW_PROPERTY_GROUPS.bulkWrite(property_groups_bulk, {
          ordered: false,
        });

        property_groups_bulk = [];
      }
    }

    if (property_groups_bulk?.length) {
      await NEW_PROPERTY_GROUPS.bulkWrite(property_groups_bulk, {
        ordered: false,
      });
    }
  } catch (e) {
    console.log(`Error occurred while migrating property groups: ${e.message}`);
  }

  try {
    const property_fields = OLD_PROPERTY_FIELDS.find({}).batchSize(BATCH_SIZE);

    let property_fields_bulk: any = [];

    for await (const property_field of property_fields) {
      if (!property_field) {
        console.log('Skipping empty property field');
        continue;
      }

      property_fields_bulk.push({
        insertOne: {
          document: {
            _id: new ObjectId(property_field._id),
            name: property_field.text,
            code: property_field.code,
            description: property_field.description,
            contentType: parseContentType(property_field.contentType),
            contentTypeId: property_field.contentTypeId,
            order: parseOrder(property_field.order),
            logics: parseLogics(property_field),
            configs: parseConfigs(property_field, 'field'),
            type: property_field.type,
            validations: parseValidations(property_field),
            groupId: property_field.groupId
              ? new ObjectId(property_field.groupId)
              : null,
            options: parseOptions(property_field),

            createdBy: property_field.createdBy,
            updatedBy: property_field.lastUpdatedUserId,
            createdAt: property_field.createdAt || new Date(),
            updatedAt: property_field.updatedAt || new Date(),
          },
        },
      });

      if (property_fields_bulk?.length >= BATCH_SIZE) {
        await NEW_PROPERTY_FIELDS.bulkWrite(property_fields_bulk, {
          ordered: false,
        });

        property_fields_bulk = [];
      }
    }

    if (property_fields_bulk?.length) {
      await NEW_PROPERTY_FIELDS.bulkWrite(property_fields_bulk, {
        ordered: false,
      });
    }
  } catch (e) {
    console.log(`Error occurred while migrating property fields: ${e.message}`);
  }

  console.log(`Process finished at: ${new Date().toISOString()}`);

  await client.close();
  process.exit();
};

command();
