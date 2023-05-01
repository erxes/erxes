import mongoDb from 'mongodb';

import requestify from 'requestify';
import fs from 'fs';
import Random from 'meteor-random';
const MongoClient = mongoDb.MongoClient;
const MONGO_URL = process.argv[2];

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

const client = new MongoClient(MONGO_URL, { useUnifiedTopology: true });

console.log('Connected to ', MONGO_URL);

let db;

let Buildings;
let Quarters;

let Companies;
let FormFields;
let FieldsGroups;

let InternalNotes;
const getLocation = (input) => {
  const regex = /(-?\d+\.\d+)\s*-\s*(-?\d+\.\d+)/;
  if (input) {
    const match = input.match(regex);

    if (match) {
      const lat = parseFloat(match[1]);
      const lng = parseFloat(match[2]);
      return {
        lat: lat || '0',
        lng: lng || '0'
      };
    } else {
      return {
        lat: '0',
        lng: '0'
      };
    }
  }
  return {
    lat: '0',
    lng: '0'
  };
};

const command = async () => {
  await client.connect();
  db = client.db();
  Buildings = db.collection('mobinet_buildings');
  Quarters = db.collection('mobinet_quarters');

  Companies = db.collection('companies');
  FieldsGroups = db.collection('fields_groups');
  FormFields = db.collection('form_fields');

  InternalNotes = db.collection('internal_notes');

  const buildingsData = fs
    .readFileSync('./smartdata/datahbblocation.csv')
    .toLocaleString();

  const buildingsRows = buildingsData.split(',&&N');

  const fieldsGroups = await FieldsGroups.findOne({
    name: 'SUH'
  });

  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'Accept-language': 'en'
  };

  let formFields = [];
  if (fieldsGroups) {
    const form_fields = await FormFields.find({
      groupId: fieldsGroups._id
    }).toArray();
    formFields = form_fields;
  }

  // create company
  for (let i = 0; i < buildingsRows.length; i++) {
    const columns = buildingsRows[i].split(',');
    const companyData = {
      primaryName: columns[2],
      _id: Random.id()
    };

    let customFieldsData = [];
    formFields.map((formField) => {
      if (formField) {
        formField.code === 'c_aoa_contact' &&
          customFieldsData.push({
            field: formField._id,
            value: columns[0],
            stringValue: columns[0]?.toString()
          });
        formField.code === 'c_aoa_contract_number' &&
          customFieldsData.push({
            field: formField._id,
            value: columns[1],
            stringValue: columns[1]?.toString()
          });
        formField.code === 'c_elevator_contact' &&
          customFieldsData.push({
            field: formField._id,
            value: columns[3],
            stringValue: columns[3]?.toString()
          });
        formField.code === 'c_support_office_contact' &&
          customFieldsData.push({
            field: formField._id,
            value: columns[4],
            stringValue: columns[4]?.toString()
          });
        formField.code === 'c_support_office_name' &&
          customFieldsData.push({
            field: formField._id,
            value: columns[5],
            stringValue: columns[5]?.toString()
          });
      }
    });
    companyData.customFieldsData = customFieldsData;

    let company = await Companies.findOne({
      primaryName: companyData.primaryName
    });

    if (!company) {
      await Companies.insertOne(companyData);
    }
  }

  // create buildings
  for (let i = 0; i < buildingsRows.length; i++) {
    const columns = buildingsRows && buildingsRows?.[i]?.split(',');
    let buildingData = {};
    if (columns) {
      const quarter = await Quarters.findOne({
        code: columns?.[8] || ''
      });
      const building = await Buildings.findOne({
        name: `${columns[19]} ${columns[20]}`
      });

      const company = await Companies.findOne({
        primaryName: columns?.[2]
      });
      if (company) {
        buildingData = {
          _id: Random.id(),
          code: columns[8],
          connectedDate: columns[9],
          desctiption: `${(columns[10], columns[21])}`,
          entrances: columns[16],
          floors: columns[17],
          families: columns[18],
          name: `${columns[19]} ${columns[20]}`,
          serviceStatus:
            columns[23] === 'Сүлжээ орсон'
              ? 'active'
              : columns[23] === 'Сүлжээ ороогүй'
              ? 'inactive'
              : columns[23] === 'СӨХ зөвшөөрөөгүй'
              ? 'inprogress'
              : 'inactive',

          suhId: company._id,
          networkType: 'ftth',
          quarterId: (quarter && quarter._id) || ''
        };

        const { lat, lng } = columns?.[22] && getLocation(columns[22]);
        if (lat && lng) {
          const districtQry = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;

          const distResponse = await requestify.request(districtQry, {
            method: 'GET',
            headers
          });

          const distResponseJson = await JSON.parse(distResponse.body);
          buildingData = {
            ...buildingData,
            boundingbox: {
              minLat: distResponseJson?.boundingbox?.[0],
              maxLat: distResponseJson?.boundingbox?.[1],
              minLong: distResponseJson?.boundingbox?.[2],
              maxLong: distResponseJson?.boundingbox?.[3]
            },
            osmbId: distResponseJson.osm_id,
            location: {
              type: 'Point',
              coordinates: [
                parseFloat(distResponseJson.lon),
                parseFloat(distResponseJson.lat)
              ]
            }
          };
          if (!building) {
            await Buildings.insertOne(buildingData);
          }
        }
      }
    }
  }

  //create internalNotes
  for (let i = 0; i < buildingsRows.length; i++) {
    const columns = buildingsRows[i].split(',');
    if (columns) {
      const building = await Buildings.findOne({
        name: `${columns[19]} ${columns[20]}`
      });
      if (building) {
        for (let k = 11; k <= 15; k++) {
          const internalNoteData = columns?.[k] && {
            _id: Random.id(),
            title: `Buildings updated`,
            createdUser: '',
            action: `mentioned you in mobinet:buildings`,
            receivers: [],
            content: columns[k],
            link: '',
            notifType: '',
            contentType: 'mobinet:buildings',
            contentTypeId: building._id,
            type: 'buildings',
            createdAt: Date.now()
          };
          internalNoteData && (await InternalNotes.insertOne(internalNoteData));
        }
      }
    }
  }

  console.log(`Process finished`);

  process.exit();
};
command();
