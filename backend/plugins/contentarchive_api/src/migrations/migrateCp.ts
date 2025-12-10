import mongoose from 'mongoose';

const MONGO_URL =
  process.argv[2] || 'mongodb://localhost:27017/erxes?directConnection=true';

if (!MONGO_URL) {
  throw new Error('MONGO_URL not provided');
}

const schema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('client_portal_users', schema);
const Companies = mongoose.model('client_portal_companies', schema);
const Notifications = mongoose.model('client_portal_notifications', schema);

const migrate = async () => {
  console.time('Migration time');

  try {
    await mongoose.connect(MONGO_URL);
    console.log('Connected to', MONGO_URL);

    const result = await User.updateMany(
      { clientPortalId: { $exists: true } },
      { $rename: { clientPortalId: 'portalId' } },
    );

    console.log(`Updated users ${result.modifiedCount} documents`);

    const result2 = await Companies.updateMany(
      { clientPortalId: { $exists: true } },
      { $rename: { clientPortalId: 'portalId' } },
    );

    console.log(`Updated companies ${result2.modifiedCount} documents`);

    const result3 = await Notifications.updateMany(
      { clientPortalId: { $exists: true } },
      { $rename: { clientPortalId: 'portalId' } },
    );

    console.log(`Updated notifications ${result3.modifiedCount} documents`);
  } catch (err) {
    console.error('Migration failed:', err);
  }

  console.timeEnd('Migration time');
  process.exit();
};

migrate();
