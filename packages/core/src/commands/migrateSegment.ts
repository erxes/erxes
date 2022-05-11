import * as dotenv from 'dotenv';

dotenv.config();

import { Collection, Db, MongoClient } from 'mongodb';

const { MONGO_URL } = process.env;

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

const client = new MongoClient(MONGO_URL);

let db: Db;

let SegmentsCollections: Collection<any>;

const command = async () => {
  await client.connect();
  db = client.db() as Db;

  SegmentsCollections = db.collection('segments');

  const segments1 = await SegmentsCollections.find({
    name: { $exists: true }
  }).toArray();

  for (const segment1 of segments1) {
    if (segment1.conditions && segment1.conditions.length > 0) {
      const subSegmentId = segment1.conditions[0].subSegmentId;

      await SegmentsCollections.updateMany(
        {
          subOf: segment1._id
        },
        { $set: { subOf: subSegmentId } }
      );
    }
  }

  const segments2 = await SegmentsCollections.find({
    name: { $exists: true }
  }).toArray();

  for (const segment2 of segments2) {
    if (segment2.conditions && segment2.conditions.length > 0) {
      const subSegmentId = segment2.conditions[0].subSegmentId;

      const doc = {
        conditionsConjunction: segment2.conditionsConjunction,
        scopeBrandIds: segment2.scopeBrandIds,
        contentType: segment2.contentType,
        name: segment2.name,
        description: segment2.description,
        subOf: segment2.subOf,
        color: segment2.color,
        boardId: segment2.boardId,
        pipelineId: segment2.pipelineId
      };

      await SegmentsCollections.remove({ _id: segment2._id });

      await SegmentsCollections.updateOne({ _id: subSegmentId }, { $set: doc });
    }
  }

  console.log(`Process finished at: ${new Date()}`);

  process.exit();
};

command();
