const { MongoClient } = require('mongodb');
const { nanoid } = require('nanoid');
import * as dotenv from 'dotenv';
dotenv.config();

const MONGO_URL =
  process.env.MONGO_URL ||
  'mongodb://localhost:27017/erxes?directConnection=true';

if (!MONGO_URL) {
  throw new Error('MONGO_URL not provided');
}

const DRY_RUN = process.env.DRY_RUN !== 'false';

const client = new MongoClient(MONGO_URL);

const missingSteps = {
  $or: [{ steps: { $exists: false } }, { steps: { $size: 0 } }],
};

const buildStep = (survey: any) => ({
  _id: nanoid(),
  name: 'Step 1',
  description: '',
  order: 0,
  question: survey.question,
  options: (survey.options || []).map((option: any, index: number) => ({
    _id: option._id,
    text: option.text,
    order: typeof option.order === 'number' ? option.order : index,
    ticketCreationEnabled: Boolean(option.ticketCreationEnabled),
    ...(option.ticketCreationThreshold
      ? { ticketCreationThreshold: option.ticketCreationThreshold }
      : {}),
    ...(option.ticketPipelineId
      ? { ticketPipelineId: option.ticketPipelineId }
      : {}),
    ...(option.ticketStatusId ? { ticketStatusId: option.ticketStatusId } : {}),
    ...(option.ticketCreated ? { ticketCreated: true } : {}),
    ...(option.ticketId ? { ticketId: option.ticketId } : {}),
  })),
  allowMultiselect: Boolean(survey.allowMultiselect),
});

async function migrate() {
  await client.connect();

  const collection = client.db().collection('frontline_surveys');
  const candidates = await collection.find(missingSteps).toArray();

  if (!candidates.length) {
    console.log('No surveys need a steps array.');
    return;
  }

  const migratable = candidates.filter(
    (survey: any) =>
      typeof survey.question === 'string' &&
      survey.question.trim().length > 0 &&
      Array.isArray(survey.options) &&
      survey.options.length >= 2 &&
      survey.options.every((option: any) => option?._id && option?.text),
  );

  const skipped = candidates.filter(
    (survey: any) => !migratable.includes(survey),
  );

  console.log(
    `${candidates.length} surveys without steps: ${migratable.length} migratable, ${skipped.length} skipped.`,
  );

  for (const survey of skipped) {
    console.log(
      `  skipped ${survey._id} "${survey.title}" — question=${JSON.stringify(
        survey.question,
      )} options=${(survey.options || []).length}`,
    );
  }

  if (DRY_RUN) {
    for (const survey of migratable) {
      const step = buildStep(survey);
      console.log(
        `  would migrate ${survey._id} "${survey.title}" -> 1 step, ${
          step.options.length
        } options (${step.options
          .map((option: any) => option._id)
          .join(', ')})`,
      );
    }
    console.log('DRY_RUN is on, nothing written. Re-run with DRY_RUN=false.');
    return;
  }

  let migrated = 0;

  for (const survey of migratable) {
    const result = await collection.updateOne(
      { _id: survey._id, ...missingSteps },
      { $set: { steps: [buildStep(survey)] } },
    );

    migrated += result.modifiedCount;
  }

  const remaining = await collection.countDocuments(missingSteps);

  console.log(
    `Migrated ${migrated} surveys. ${remaining} still without steps.`,
  );
}

migrate()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => client.close());
