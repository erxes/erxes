import * as dotenv from 'dotenv';
import { MongoClient, ObjectId } from 'mongodb';
import { nanoid } from 'nanoid';

dotenv.config();

const { MONGO_URL } = process.env;

if (!MONGO_URL) {
  throw new Error('Environment variable MONGO_URL not set.');
}

const client = new MongoClient(MONGO_URL);

type TFolderRow = {
  _id: string;
  name: string;
  installationId: string;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
};

type TInstallationRow = {
  _id: string;
  name?: string;
  automationIds?: Record<string, string>;
  createdBy?: string;
  createdAt?: Date;
};

/**
 * Gives every template installation made before folders its own folder and
 * puts its automations there, the way an install does now.
 *
 * Safe to run again: an installation that has a folder is skipped, and an
 * automation someone already filed elsewhere keeps its folder.
 */
const backfillAutomationFolders = async () => {
  await client.connect();

  const db = client.db();
  const installations = db
    .collection<TInstallationRow>('template_installations')
    .find({}, { projection: { name: 1, automationIds: 1, createdBy: 1, createdAt: 1 } });

  let createdCount = 0;
  let filedCount = 0;

  for await (const installation of installations) {
    const hasFolder = await db
      .collection('automation_folders')
      .countDocuments({ installationId: installation._id }, { limit: 1 });

    if (hasFolder) {
      continue;
    }

    const folderId = nanoid();
    const now = new Date();

    await db.collection<TFolderRow>('automation_folders').insertOne({
      _id: folderId,
      name: installation.name || 'Template',
      installationId: installation._id,
      createdBy: installation.createdBy,
      createdAt: installation.createdAt || now,
      updatedAt: now,
    });
    createdCount++;

    // Stored as ObjectIds, kept on the installation as text
    const automationIds = Object.values(installation.automationIds || {})
      .filter((id) => ObjectId.isValid(id))
      .map((id) => new ObjectId(id));

    if (!automationIds.length) {
      continue;
    }

    const { modifiedCount } = await db.collection('automations').updateMany(
      {
        _id: { $in: automationIds },
        folderId: { $in: [null, ''] },
      },
      { $set: { folderId } },
    );
    filedCount += modifiedCount;
  }

  console.info(
    `Created ${createdCount} folders, filed ${filedCount} automations.`,
  );
};

backfillAutomationFolders()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => client.close());
