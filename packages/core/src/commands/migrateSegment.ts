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

  const segments = await SegmentsCollections.find({
    name: { $exists: true }
  }).toArray();

  for (const segment of segments) {
    if (segment.conditions && segment.conditions.length > 0) {
      const subSegmentId = segment.conditions[0].subSegmentId;

      const doc = {
        conditionsConjunction: segment.conditionsConjunction,
        scopeBrandIds: segment.scopeBrandIds,
        contentType: segment.contentType,
        name: segment.name,
        description: segment.description,
        subOf: segment.subOf,
        color: segment.color,
        boardId: segment.boardId,
        pipelineId: segment.pipelineId
      };

      await SegmentsCollections.updateMany(
        {
          subOf: segment._id
        },
        { $set: { subOf: subSegmentId } }
      );

      await SegmentsCollections.remove({ _id: segment._id });

      await SegmentsCollections.updateOne({ _id: subSegmentId }, { $set: doc });
    }
  }

  console.log(`Process finished at: ${new Date()}`);

  process.exit();
};

command();
