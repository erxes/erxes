import * as dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config();

const { MONGO_URL } = process.env;

if (!MONGO_URL) {
  throw new Error('Environment variable MONGO_URL not set.');
}

const client = new MongoClient(MONGO_URL);

/**
 * Clears the stored create-form flags of customer system fields.
 *
 * Until the create form read them, toggling "Visible" upserted these flags with
 * their schema defaults, so a stored `false` was never anyone's choice. With
 * them gone, each field falls back to its declared default, which matches the
 * fields the create form has always shown.
 *
 * Safe to run again: a second pass finds nothing to unset.
 */
const resetCustomerCreateFieldSettings = async () => {
  await client.connect();

  const { modifiedCount } = await client
    .db()
    .collection('properties_system_fields')
    .updateMany(
      { contentType: 'core:customer' },
      { $unset: { isVisibleToCreate: '', isRequired: '' } },
    );

  console.info(`Reset create-form flags on ${modifiedCount} customer fields`);
};

resetCustomerCreateFieldSettings()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await client.close();
  });
