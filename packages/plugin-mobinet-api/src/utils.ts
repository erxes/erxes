import fetch from 'node-fetch';
import { generateModels } from './connectionResolver';
import { generateFieldsFromSchema } from '@erxes/api-utils/src';
import { GeoJSON } from 'geojson';

const sendSms = async (phone, message) => {
  // check message length and split then send multiple sms
  if (message.length > 160) {
    const messages = message.match(/.{1,160}/g);
    for (const msg of messages) {
      await sendSms(phone, msg);
    }
    return;
  }

  const url = `http://27.123.214.168/smsmt/mt?servicename=132222&username=132222&from=132222&to=${phone}&msg=${message}`;
  const response = await fetch(url, {
    method: 'GET',
  });

  if (response.status !== 200) {
    throw new Error('Failed to send sms');
  }

  const res = await response.text();

  console.log('*************** mobinet:sendSms response', res);

  if (res.includes('Sent')) {
    return 'ok';
  }

  throw new Error(res);
};

export const generateFields = async ({ subdomain }) => {
  const models = await generateModels(subdomain);

  const { Buildings } = models;

  const schema = Buildings.schema as any;
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
    fields = [...fields, ...(await generateFieldsFromSchema(schema, ''))];

    for (const name of Object.keys(schema.paths)) {
      const path = schema.paths[name];

      // extend fields list using sub schema fields
      if (path.schema) {
        fields = [
          ...fields,
          ...(await generateFieldsFromSchema(path.schema, `${name}.`)),
        ];
      }
    }
  }

  return fields;
};

// http://localhost:4000/pl:mobinet/buildings?southWest=47.9085481324375,106.91689106245177&northEast=47.9085481324375,106.9313963453378

export const getBuildingsByBounds = async (req, res) => {
  const { bounds } = req.query;
  const subdomain = req.subdomain;

  if (!bounds) {
    return res.status(400).json({ error: 'Bounds are required' });
  }

  const boundsJson = JSON.parse(bounds);

  const boundsArr = boundsJson.map((bound) => [
    bound.longitude,
    bound.latitude,
  ]);

  boundsArr.push(boundsArr[0]);

  const models = await generateModels(subdomain);
  const query = {
    location: {
      $geoWithin: { $polygon: boundsArr },
    },
  };

  const buildings = await models.Buildings.find(query).lean();

  const getCoordinates = (boundingbox) => {
    if (!boundingbox) {
      return [];
    }
    return [
      [boundingbox.minLong, boundingbox.minLat],
      [boundingbox.maxLong, boundingbox.minLat],
      [boundingbox.maxLong, boundingbox.maxLat],
      [boundingbox.minLong, boundingbox.maxLat],
      [boundingbox.minLong, boundingbox.minLat],
    ];
  };

  const features: any[] = buildings.map((building) => {
    return {
      id: building.osmbId || building._id,
      type: 'Feature',
      properties: {
        ...building,
        minHeight: 0,
        height: Number(building.floors * 3),
        id: building.osmbId || building._id,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [getCoordinates(building.boundingbox)],
      },
    };
  });

  const geoJson: GeoJSON = {
    type: 'FeatureCollection',
    features,
  };

  return res.json(geoJson);
};

export { sendSms };
