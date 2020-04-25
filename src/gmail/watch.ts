import { PubSub } from '@google-cloud/pubsub';
import * as fs from 'fs';
import { debugGmail } from '../debuggers';
import { Accounts } from '../models';
import { getOauthClient, gmailClient } from './api';
import { syncPartially } from './receiveEmails';
import { ICredentials, IPubsubMessage } from './types';
import { getCredentialsByEmailAccountId, getGoogleConfigs, refreshAccessToken } from './util';

/**
 * Create topic and subscription for gmail
 */
export const trackGmail = async () => {
  const {
    GOOGLE_PROJECT_ID,
    GOOGLE_GMAIL_TOPIC,
    GOOGLE_APPLICATION_CREDENTIALS,
    GOOGLE_GMAIL_SUBSCRIPTION_NAME,
  } = await getGoogleConfigs();

  if (!GOOGLE_PROJECT_ID || !GOOGLE_GMAIL_TOPIC || !GOOGLE_APPLICATION_CREDENTIALS || !GOOGLE_GMAIL_SUBSCRIPTION_NAME) {
    return new Error(`
      Error Google: Failed to create google pubsub topic following config missing
      GOOGLE_PROJECT_ID: ${GOOGLE_PROJECT_ID || 'Not defined'}
      GOOGLE_GMAIL_TOPIC: ${GOOGLE_GMAIL_TOPIC || 'Not defined'}
      GOOGLE_APPLICATION_CREDENTIALS: ${GOOGLE_APPLICATION_CREDENTIALS || 'Not defined'}
      GOOGLE_GMAIL_SUBSCRIPTION_NAME: ${GOOGLE_GMAIL_SUBSCRIPTION_NAME || 'Not defined'}
    `);
  }

  const googleCredExists = fs.existsSync(GOOGLE_APPLICATION_CREDENTIALS);

  if (!googleCredExists) {
    return debugGmail('Error Google: Google credentials file not found');
  }

  let pubsubClient: PubSub;

  try {
    pubsubClient = new PubSub({
      projectId: GOOGLE_PROJECT_ID,
      keyFilename: GOOGLE_APPLICATION_CREDENTIALS,
    });
  } catch (e) {
    debugGmail('Error occured while trying to create pubsub instance');
    throw e;
  }

  debugGmail(`Pubsub: Check existing gmail topic in google cloud`);

  let topic;

  try {
    topic = await pubsubClient.topic(GOOGLE_GMAIL_TOPIC);
  } catch (e) {
    debugGmail(`Pubsub: Failed to create topic: ${e.message}`);
    throw e;
  }

  let topicExists;

  try {
    [topicExists] = await topic.exists();
  } catch (e) {
    debugGmail(`Pubsub: Failed to check topic exists: ${e.message}`);

    throw e;
  }

  if (!topicExists) {
    let topicResponse;

    debugGmail(`Pubsub: Creating gmail pubsub topic as ${GOOGLE_GMAIL_TOPIC}`);

    try {
      [topicResponse] = await pubsubClient.createTopic(GOOGLE_GMAIL_TOPIC);
    } catch (e) {
      debugGmail(`Failed to create gmail topic: ${e.message}`);
      throw e;
    }

    topic = topicResponse;
  }

  debugGmail(`Pubsub: Check existing gmail subscription in google cloud`);

  let subscription;

  try {
    subscription = await pubsubClient.subscription(GOOGLE_GMAIL_SUBSCRIPTION_NAME);
  } catch (e) {
    debugGmail(`Pubsub: Failed to get subscription: ${e.message}`);
    return e;
  }

  let subscriptionExists;

  try {
    [subscriptionExists] = await subscription.exists();
  } catch (e) {
    debugGmail(`Pubsub: Failed to check subscription exists: ${e.message}`);

    return e;
  }

  if (!subscriptionExists) {
    debugGmail(`Pubsub: Creating a subscription of gmail topic`);

    const options = { flowControl: { maxBytes: 10000, maxMessages: 5 } };

    try {
      topic.createSubscription(GOOGLE_GMAIL_SUBSCRIPTION_NAME, options, (error, newSubscription) => {
        if (error) {
          debugGmail(`Pubsub: Failed to create google pubsub topic for gmail ${error}`);
          return;
        }

        newSubscription.on('message', onMessage);
        newSubscription.on('error', onError);
      });
    } catch (e) {
      debugGmail(`Failed to create subscription: ${e}`);
      throw e;
    }

    return;
  }

  subscription.on('message', onMessage);
  subscription.on('error', onError);

  const accounts = await Accounts.find({ kind: 'gmail' });

  const auth = await getOauthClient();

  // Refresh access tokens
  for (const account of accounts) {
    auth.on('tokens', async (tokens: ICredentials) => {
      await refreshAccessToken(account._id, tokens);
      auth.setCredentials(tokens);
    });
  }
};

/**
 * Error handler for subscription of gmail
 */
const onError = (error: string) => {
  debugGmail(`Error Pubsub: occured in google pubsub subscription of gmail ${error}`);
};

/**
 * Gmail subscription receive message
 */
const onMessage = async (message: IPubsubMessage) => {
  const base64Url = message.data;
  const { emailAddress, historyId } = JSON.parse(base64Url.toString());

  debugGmail(`New email received to: ${emailAddress}`);

  // Get mailbox updates with latest received historyId
  await syncPartially(emailAddress, historyId);

  message.ack();
};

/**
 * NOTE: Before use this api Google Topic must be created in Google console
 * and grant gmail publish permission
 * Set up or update a push notification watch on the given user mailbox.
 */
export const watchPushNotification = async (email: string) => {
  const { GOOGLE_PROJECT_ID, GOOGLE_GMAIL_TOPIC } = await getGoogleConfigs();

  if (!GOOGLE_PROJECT_ID || !GOOGLE_GMAIL_TOPIC) {
    throw new Error(`
      GOOGLE_PROJECT_ID: ${GOOGLE_PROJECT_ID || 'Not defined'}
      GOOGLE_GMAIL_TOPIC: ${GOOGLE_GMAIL_TOPIC || 'Not defined'}
    `);
  }

  debugGmail(`Google OAuthClient request to watch push notification for the given user mailbox`);

  try {
    const auth = await getOauthClient();

    const credentials = await getCredentialsByEmailAccountId({ email });

    auth.setCredentials(credentials);

    return gmailClient.watch({
      auth,
      userId: 'me',
      requestBody: {
        labelIds: ['INBOX', 'CATEGORY_PERSONAL'],
        labelFilterAction: 'include',
        topicName: `projects/${GOOGLE_PROJECT_ID}/topics/${GOOGLE_GMAIL_TOPIC}`,
      },
    });
  } catch (e) {
    debugGmail(`Google OAuthClient request to watch push notification failed ${e}`);
    throw e;
  }
};

/**
 * Stop receiving push notifications for the given user mailbox
 */
export const stopPushNotification = async (email: string) => {
  debugGmail(`Google OAuthClient request to stop push notification for the given user mailbox`);

  try {
    const auth = await getOauthClient();

    const credentials = await getCredentialsByEmailAccountId({ email });

    auth.setCredentials(credentials);

    await gmailClient.stop({
      auth,
      userId: email,
    });
  } catch (e) {
    debugGmail(`Google OAuthClient failed to stop push notification for the given user mailbox ${e}`);
    throw e;
  }
};
