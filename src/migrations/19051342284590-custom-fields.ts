import * as mongoose from 'mongoose';
import * as validator from 'validator';
import { isValidDate, ITypedListItem } from '../db/models/Fields';

const generateTypedItem = (field: string, value: string): ITypedListItem => {
  let stringValue;
  let numberValue;
  let dateValue;

  if (value) {
    stringValue = value.toString();

    // number
    if (validator.isFloat(value.toString())) {
      numberValue = value;
      stringValue = null;
    }

    if (isValidDate(value)) {
      dateValue = value;
      stringValue = null;
    }
  }

  return { field, value, stringValue, numberValue, dateValue };
};

const generateTypedListFromMap = (data: { [key: string]: any }): ITypedListItem[] => {
  const ids = Object.keys(data || {});
  return ids.map(_id => generateTypedItem(_id, data[_id]));
};

module.exports.up = async () => {
  const { MONGO_URL = '' } = process.env;

  const mongoClient = await mongoose.createConnection(MONGO_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
  });

  const customersCollection = mongoClient.db.collection('customers');

  await customersCollection
    .find({
      customFieldsData: { $exists: true },
    })
    .forEach(async c => {
      if (c.leadStatus === 'connected') {
        c.leadStatus = 'attemptedToContact';
      }

      c.customFieldsDataBackup = c.customFieldsData;

      c.customFieldsData = generateTypedListFromMap(c.customFieldsData);

      await customersCollection.save(c);
    });

  await customersCollection
    .find({
      trackedData: { $exists: true },
    })
    .forEach(async c => {
      c.trackedDataBackup = c.trackedData;

      c.trackedData = generateTypedListFromMap(c.trackedData);

      await customersCollection.save(c);
    });
};
