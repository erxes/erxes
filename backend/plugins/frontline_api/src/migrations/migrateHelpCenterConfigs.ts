const { MongoClient } = require('mongodb');
import * as dotenv from 'dotenv';
dotenv.config();

const MONGO_URL =
  process.env.MONGO_URL ||
  'mongodb://localhost:27017/erxes?directConnection=true';

if (!MONGO_URL) {
  throw new Error('MONGO_URL not provided');
}

const HELP_CENTER_FIELDS = [
  'url',
  'kbToggle',
  'kbLabel',
  'kbTopicId',
  'ticketToggle',
  'ticketLabel',
  'ticketChannelId',
  'ticketPipelineId',
  'ticketStatusId',
  'styles',
];

const client = new MongoClient(MONGO_URL);

async function migrate() {
  await client.connect();

  const db = client.db();

  const Topics = db.collection('knowledgebase_topics');
  const Configs = db.collection('frontline_help_center_configs');

  const topics = await Topics.find({
    $or: HELP_CENTER_FIELDS.map((field) => ({ [field]: { $exists: true } })),
  }).toArray();

  let created = 0;
  let skipped = 0;

  for (const topic of topics) {
    const _id = topic._id.toString();

    const exists = await Configs.findOne({ _id });

    if (exists) {
      skipped++;
    } else {
      const kbToggle = topic.kbToggle ?? true;

      await Configs.insertOne({
        _id,
        title: topic.title || 'Help center',
        description: topic.description || '',
        url: topic.url || '',
        brandId: topic.brandId || '',
        languageCode: topic.languageCode || '',

        kbToggle,
        kbLabel: topic.kbLabel || '',
        kbTopicId: kbToggle ? topic.kbTopicId || _id : '',

        ticketToggle: topic.ticketToggle ?? false,
        ticketLabel: topic.ticketLabel || '',
        ticketChannelId: topic.ticketChannelId || '',
        ticketPipelineId: topic.ticketPipelineId || '',
        ticketStatusId: topic.ticketStatusId || '',

        color: topic.color || '',
        backgroundImage: topic.backgroundImage || '',
        styles: topic.styles || undefined,

        createdBy: topic.createdBy,
        modifiedBy: topic.modifiedBy,
        createdAt: topic.createdDate || topic.createdAt || new Date(),
        updatedAt: new Date(),
      });

      created++;
    }

    await Topics.updateOne(
      { _id: topic._id },
      {
        $unset: HELP_CENTER_FIELDS.reduce(
          (unset, field) => ({ ...unset, [field]: '' }),
          {},
        ),
      },
    );
  }

  console.log(
    `Help center configs: ${created} created, ${skipped} already present, ${topics.length} topics cleaned ✅`,
  );

  process.exit(0);
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
