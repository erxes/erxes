import { generateFieldsFromSchema } from '@erxes/api-utils/src/fieldUtils';
import { sendRequest } from '@erxes/api-utils/src/requests';
import * as _ from 'underscore';

import { generateModels } from './connectionResolver';
import { sendCardsMessage } from './messageBroker';
import { IPlaceDocument } from './models/definitions/places';

const gatherNames = async params => {
  const {
    collection,
    idFields,
    foreignKey,
    prevList,
    nameFields = []
  } = params;
  let options: any = [];

  if (prevList && prevList.length > 0) {
    options = prevList;
  }

  const uniqueIds = _.compact(_.uniq(idFields));

  for (const id of uniqueIds) {
    const item = await collection.findOne({ _id: id });
    let name: string = `item with id "${id}" has been deleted`;

    if (item) {
      for (const n of nameFields) {
        if (item[n]) {
          name = item[n];
        }
      }
    }

    options.push({ [foreignKey]: id, name });
  }

  return options;
};

const gatherCarFieldNames = async (models, doc, prevList = null) => {
  let options = [];

  if (prevList) {
    options = prevList;
  }

  if (doc.categoryId) {
    options = await gatherNames({
      collection: models.CarCategories,
      idFields: [doc.categoryId],
      foreignKey: 'categoryId',
      prevList: options,
      nameFields: ['name']
    });
  }

  return options;
};

export const gatherDescriptions = async params => {
  const { action, obj, type, updatedDocument, extraParams } = params;
  const { models } = extraParams;

  let extraDesc: any = [];
  let description = '';

  switch (type) {
    case 'car': {
      description = `${obj.plateNumber || obj.vinNumber} has been ${action}d`;

      extraDesc = await gatherCarFieldNames(models, obj);

      if (updatedDocument) {
        extraDesc = await gatherCarFieldNames(
          models,
          updatedDocument,
          extraDesc
        );
      }
      break;
    }
    case 'car-category': {
      description = `"${obj.name}" has been ${action}d`;

      const parentIds: string[] = [];

      if (obj.parentId) {
        parentIds.push(obj.parentId);
      }

      if (updatedDocument && updatedDocument.parentId !== obj.parentId) {
        parentIds.push(updatedDocument.parentId);
      }

      if (parentIds.length > 0) {
        extraDesc = await gatherNames({
          collection: models.CarCategories,
          idFields: parentIds,
          foreignKey: 'parentId',
          nameFields: ['name']
        });
      }
    }
    default:
      break;
  }
  return { extraDesc, description };
};

export const generateFields = async ({ subdomain }) => {
  const models = await generateModels(subdomain);

  const { Cars } = models;

  const schema = Cars.schema as any;
  let fields: Array<{
    _id: number;
    name: string;
    group?: string;
    label?: string;
    type?: string;
    validation?: string;
    options?: string[];
    selectOptions?: Array<{ label: string; value: string }>;
  }> = [];

  if (schema) {
    // generate list using customer or company schema
    fields = [...fields, ...(await generateFieldsFromSchema(schema, ''))];

    for (const name of Object.keys(schema.paths)) {
      const path = schema.paths[name];

      // extend fields list using sub schema fields
      if (path.schema) {
        fields = [
          ...fields,
          ...(await generateFieldsFromSchema(path.schema, `${name}.`))
        ];
      }
    }
  }

  return fields;
};

export const generateRandomString = async (
  subdomain,
  modelName,
  prefix,
  numberOfDigits = 6
) => {
  const randomNumber = Math.floor(Math.random() * Math.pow(10, numberOfDigits));
  const randomName = `${prefix}${randomNumber}`;

  const item = await sendCardsMessage({
    subdomain,
    action: `${modelName}s.findOne`,
    data: {
      name: randomName
    },
    isRPC: true
  });

  if (item) {
    return generateRandomString(subdomain, modelName, prefix, numberOfDigits);
  }

  return randomName;
};

export const getPureDate = (date: Date) => {
  const ndate = new Date(date);
  const diffTimeZone = ndate.getTimezoneOffset() * 1000 * 60;
  return new Date(ndate.getTime() - diffTimeZone);
};

export const getFullDate = (date: Date) => {
  const ndate = getPureDate(date);
  const year = ndate.getFullYear();
  const month = ndate.getMonth();
  const day = ndate.getDate();

  const today = new Date(year, month, day);
  today.setHours(0, 0, 0, 0);
  return today;
};

export const getTomorrow = (date: Date) => {
  return getFullDate(new Date(date.getTime() + 24 * 60 * 60 * 1000));
};

export const getPath = async (apiKey: string, places: IPlaceDocument[]) => {
  if (places.length === 0 || places.length !== 2) {
    return null;
  }

  const [placeA, placeB] = places;

  const url = `https://maps.googleapis.com/maps/api/directions/json?key=${apiKey}&origin=${placeA.center.lat},${placeA.center.lng}&destination=${placeB.center.lat},${placeB.center.lng}&mode=driving`;

  try {
    const response = await sendRequest({
      url,
      method: 'GET'
    });

    if (response.status !== 'OK' || response.routes.length === 0) {
      return null;
    }

    return response.routes[0].overview_polyline.points;
  } catch {
    return null;
  }
};
