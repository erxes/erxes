import { generateFieldsFromSchema } from '@erxes/api-utils/src/fieldUtils';
import { sendRequest } from '@erxes/api-utils/src/requests';
import * as _ from 'underscore';

import { generateModels } from './connectionResolver';
import { sendCardsMessage, sendCoreMessage } from './messageBroker';
import { IPlaceDocument } from './models/definitions/places';
import { google } from 'googleapis';
import * as moment from 'moment';
import { paginate } from '@erxes/api-utils/src/core';

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

  if (doc.carCategoryId) {
    options = await gatherNames({
      collection: models.CarCategories,
      idFields: [doc.carCategoryId],
      foreignKey: 'carCategoryId',
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

  fields = fields.filter(field => {
    if (
      field.name === 'parentCarCategoryId' ||
      field.name === 'carCategoryId'
    ) {
      return false;
    }

    return true;
  });

  const parentCategories = await models.CarCategories.find({
    $or: [{ parentId: null }, { parentId: '' }]
  });

  const categories = await models.CarCategories.find({
    $or: [{ parentId: { $ne: null } }, { parentId: { $ne: '' } }]
  });

  const additionalFields = [
    {
      _id: Math.random(),
      name: 'parentCarCategoryId',
      label: 'Category',
      type: 'String',
      selectOptions: parentCategories.map(category => ({
        value: category._id,
        label: category.name
      }))
    },
    {
      _id: Math.random(),
      name: 'carCategoryId',
      label: 'Sub category',
      type: 'String',
      selectOptions: categories.map(category => ({
        value: category._id,
        label: category.name
      }))
    },
    {
      _id: Math.random(),
      name: 'drivers',
      label: 'Driver(s)',
      type: 'String',
      selectOptions: undefined
    },
    {
      _id: Math.random(),
      name: 'companies',
      label: 'Company(s)',
      type: 'String',
      selectOptions: undefined
    }
  ];

  return [...additionalFields, ...fields];
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

export const getTransportData = async (req, res, subdomain) => {
  const { unixtimestamp, offset, pagesize } = req.body;

  // const {  } = JSON.parse(json || '{}');

  const models = await generateModels(subdomain);

  const config = await sendCoreMessage({
    subdomain,
    action: 'configs.findOne',
    data: {
      query: {
        code: 'GOOGLE_APPLICATION_CREDENTIALS_JSON'
      }
    },
    isRPC: true,
    defaultValue: null
  });

  if (!config) {
    return res.json([]);
  }

  const lastData = await models.TransportDatas.find({})
    .sort({ tid: -1 })
    .limit(1);

  const lastTid = lastData.length > 0 ? lastData[0].tid : 0;

  const lastTransport = await models.TransportDatas.findOne({ tid: lastTid });

  let range = 'A:O';

  if (lastTid > 0 && lastTransport) {
    range = lastTransport.range;
  }

  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(config.value),
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });

  const authClientObject = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: authClientObject });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId:
      process.env.TRANSPORT_SPREADSHEET_ID ||
      '18CwXZcOU4THxhvkvdA80mPNmGg7xsWpEfkHJh1M1bg0',
    range
  });

  const sheetData = response.data;

  const rows = sheetData.values || [];

  const data: any[] = [];

  for (const [index, value] of rows.entries()) {
    if (index < 3) {
      continue;
    }

    const obj = {
      tid: Number(value[0]),
      from: value[1],
      to: value[2],
      payloadtype: value[3],
      weight: value[4],
      payloadsize: value[5],
      trantype: value[6],
      vehicletype: value[7],
      trunktype: value[8],
      tran_start_dt: moment(new Date(value[9])).format('YYYY-MM-DD'),
      year: Number(value[10]),
      month: Number(value[11]),
      week: Number(value[12]),
      day: Number(value[13]),
      range: `A${index + 1}:O${index + 1}`
    };

    data.push(obj);
  }

  await models.TransportDatas.insertMany(data);

  await models.TransportDatas.find({});

  const qry: any = {};

  if (unixtimestamp) {
    qry.tid = { $gt: Number(unixtimestamp) };
  }

  const list = await paginate(
    models.TransportDatas.find(qry, '-scopeBrandIds -range').sort({
      tid: 1
    }),
    { page: Number(offset || 1), perPage: Number(pagesize || 20) }
  );

  if (list.length === 0) {
    return res.json({
      response: { status: 'error', message: 'No data found' }
    });
  }

  return res.json({
    response: { status: 'success', result: list }
  });
};

export const updateTrackingData = async (req, res, subdomain) => {
  const models = await generateModels(subdomain);

  const { tripId, trackingData } = req.body;

  models.Trips.updateTracking(
    tripId,
    trackingData.map(item => {
      return {
        lat: item.lat,
        lng: item.lng,
        trackedDate: new Date(item.trackedDate)
      };
    })
  );

  return res.json({
    response: { status: 'success' }
  });
};
