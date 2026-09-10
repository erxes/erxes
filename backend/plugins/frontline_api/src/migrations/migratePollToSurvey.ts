const { MongoClient } = require('mongodb');
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

const COLLECTION_RENAMES: [string, string][] = [
  ['frontline_polls', 'frontline_surveys'],
  ['frontline_poll_votes', 'frontline_survey_votes'],
];

// An erxes survey snapshot always carries `pollId`; a Discord poll never does.
const OURS_ON_MESSAGE = { 'extraData.poll.pollId': { $exists: true } };

async function migrate() {
  await client.connect();

  const db = client.db();
  const existing = (await db.listCollections().toArray()).map(
    (c: { name: string }) => c.name,
  );

  const plan: string[] = [];

  for (const [from, to] of COLLECTION_RENAMES) {
    if (existing.includes(from) && !existing.includes(to)) {
      plan.push(`rename collection ${from} -> ${to}`);
    }
  }

  const voteField = existing.includes('frontline_poll_votes')
    ? await db
        .collection('frontline_poll_votes')
        .countDocuments({ pollId: { $exists: true } })
    : 0;
  const hasFlag = await db
    .collection('conversations')
    .countDocuments({ hasPoll: { $exists: true } });
  const snapshots = await db
    .collection('conversation_messages')
    .countDocuments(OURS_ON_MESSAGE);
  const discordUntouched = await db
    .collection('conversation_messages')
    .countDocuments({
      'extraData.poll': { $exists: true },
      'extraData.poll.pollId': { $exists: false },
    });
  const tickets = await db
    .collection('frontline_tickets')
    .countDocuments({ sourcePoll: { $exists: true } });

  plan.push(`frontline_survey_votes.pollId -> surveyId: ${voteField}`);
  plan.push(`conversations.hasPoll -> hasSurvey: ${hasFlag}`);
  plan.push(`conversation_messages.extraData.poll -> .survey: ${snapshots}`);
  plan.push(`frontline_tickets.sourcePoll -> sourceSurvey: ${tickets}`);
  plan.push(`Discord polls left alone: ${discordUntouched}`);

  console.log(plan.map((line) => `  ${line}`).join('\n'));

  if (DRY_RUN) {
    console.log('DRY_RUN is on, nothing written. Re-run with DRY_RUN=false.');
    return;
  }

  for (const [from, to] of COLLECTION_RENAMES) {
    if (existing.includes(from) && !existing.includes(to)) {
      await db.collection(from).rename(to);
    }
  }

  const voteIndexes = await db
    .collection('frontline_survey_votes')
    .indexes()
    .catch(() => []);

  for (const index of voteIndexes) {
    if (index.name !== '_id_' && JSON.stringify(index.key).includes('pollId')) {
      await db.collection('frontline_survey_votes').dropIndex(index.name);
    }
  }

  await db
    .collection('frontline_survey_votes')
    .updateMany(
      { pollId: { $exists: true } },
      { $rename: { pollId: 'surveyId' } },
    );

  await db
    .collection('conversations')
    .updateMany(
      { hasPoll: { $exists: true } },
      { $rename: { hasPoll: 'hasSurvey' } },
    );

  await db.collection('conversation_messages').updateMany(OURS_ON_MESSAGE, {
    $rename: {
      'extraData.poll': 'extraData.survey',
    },
  });

  await db
    .collection('conversation_messages')
    .updateMany(
      { 'extraData.survey.pollId': { $exists: true } },
      { $rename: { 'extraData.survey.pollId': 'extraData.survey.surveyId' } },
    );

  await db.collection('frontline_tickets').updateMany(
    { sourcePoll: { $exists: true } },
    {
      $rename: {
        sourcePoll: 'sourceSurvey',
      },
    },
  );

  await db.collection('frontline_tickets').updateMany(
    { 'sourceSurvey.pollId': { $exists: true } },
    {
      $rename: {
        'sourceSurvey.pollId': 'sourceSurvey.surveyId',
        'sourceSurvey.pollStepId': 'sourceSurvey.surveyStepId',
        'sourceSurvey.pollOptionId': 'sourceSurvey.surveyOptionId',
      },
    },
  );

  console.log('Renamed poll to survey.');
}

migrate()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => client.close());
