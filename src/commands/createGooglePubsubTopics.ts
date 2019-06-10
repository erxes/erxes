import * as PubSub from '@google-cloud/pubsub';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as ora from 'ora';
import * as path from 'path';

// load environment variables
dotenv.config();

const {
  PUBSUB_TYPE,
  GOOGLE_APPLICATION_CREDENTIALS,
}: {
  PUBSUB_TYPE?: string;
  GOOGLE_APPLICATION_CREDENTIALS?: string;
} = process.env;

const topics = [
  'activityLogsChanged',
  'conversationAdminMessageInserted',
  'conversationChanged',
  'conversationClientMessageInserted',
  'conversationMessageInserted',
  'customerConnectionChanged',
  'widgetNotification',
];

const spinnerOptions = {
  prefixText: 'Creating google pubsub topics \n',
};

const spinner = ora(spinnerOptions);

// Create google pubsub's topics for subscriptions
const start = async () => {
  spinner.start();

  if (PUBSUB_TYPE !== 'GOOGLE') {
    throw new Error('Pubsub type is not configured for Google');
  }

  const checkHasConfigFile = fs.existsSync(path.join(__dirname, '..', '../google_cred.json'));

  if (!checkHasConfigFile) {
    throw new Error('Google credentials file not found!');
  }

  const serviceAccount = require('../../google_cred.json');

  const googleClient = PubSub({
    projectId: serviceAccount.project_id,
    keyFilename: GOOGLE_APPLICATION_CREDENTIALS,
  });

  /*
   * Schema
   * [[ Topic: { name, pubsub, parent, request } ]]
   */
  const [pubsubTopics = []] = await googleClient.getTopics();
  const existingTopics: string[] = [];

  if (pubsubTopics.length > 0) {
    for (const topic of pubsubTopics) {
      const name = topic.name.split('/');
      const lastName = name.pop();

      existingTopics.push(lastName);
    }
  }

  const filteredTopics = topics.filter(topic => !existingTopics.includes(topic));

  if (filteredTopics.length === 0) {
    return spinner.succeed('You already have topics');
  }

  for (const topic of filteredTopics) {
    await googleClient.createTopic(topic);
  }

  spinner.succeed('Successfully created google pubsub topics.');
};

start();
