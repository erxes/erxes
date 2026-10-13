import * as dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config();

const { MONGO_URL } = process.env;

if (!MONGO_URL) {
  throw new Error('Environment variable MONGO_URL not set.');
}

const client = new MongoClient(MONGO_URL);

const CONTENT_TYPE = 'core:customer';

// No longer part of a customer's Basic information.
const REMOVED_CODES = ['position', 'department', 'hasAuthority', 'leadStatus'];

// Now hidden until turned on; a stored `true` was the old default, not a choice.
const NOW_HIDDEN_CODES = ['middleName', 'sex'];

/**
 * Brings customer Basic information settings in line with its declared fields.
 *
 * Safe to run again: a second pass finds nothing to change.
 */
const cleanCustomerBasicInformation = async () => {
  await client.connect();

  const db = client.db();
  const settings = db.collection('properties_system_fields');
  const layouts = db.collection('properties_system_field_layouts');

  const removed = await settings.deleteMany({
    contentType: CONTENT_TYPE,
    code: { $in: REMOVED_CODES },
  });

  const reset = await settings.updateMany(
    { contentType: CONTENT_TYPE, code: { $in: NOW_HIDDEN_CODES } },
    { $unset: { isVisible: '' } },
  );

  const layout = await layouts.findOne({ contentType: CONTENT_TYPE });
  let layoutCleaned = false;

  if (layout) {
    const rows = (layout.layout as string[][])
      .map((row) => row.filter((code) => !REMOVED_CODES.includes(code)))
      .filter((row) => row.length);

    await layouts.updateOne({ _id: layout._id }, { $set: { layout: rows } });
    layoutCleaned = true;
  }

  console.info(
    `Removed ${removed.deletedCount} settings, reset ${
      reset.modifiedCount
    } visibility flags, layout ${layoutCleaned ? 'cleaned' : 'not saved'}`,
  );
};

cleanCustomerBasicInformation()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await client.close();
  });
