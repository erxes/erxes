import * as PubSub from '@google-cloud/pubsub';
import { google } from 'googleapis';
import { IGmail as IMsgGmail } from '../db/models/definitions/conversationMessages';
import { getGmailUpdates, parseMessage, refreshAccessToken, syncConversation } from './gmail';
import { getOauthClient } from './googleTracker';

/**
 * Get auth with valid credentials
 */
const getOAuth = (integrationId: string, credentials: any) => {
  const auth = getOauthClient('gmail');

  // Access tokens expire. This library will automatically use a refresh token to obtain a new access token
  auth.on('tokens', async tokens => {
    await refreshAccessToken(integrationId, tokens);
    credentials = tokens;
  });

  auth.setCredentials(credentials);
  return auth;
};
/**
 * Get permission granted email information
 */
export const getGmailUserProfile = (credentials: any) => {
  const auth = getOauthClient('gmail');

  auth.setCredentials(credentials);

  const gmail = google.gmail('v1');

  return gmail.users.getProfile({ auth, userId: 'me' }).catch(({ response }) => {
    throw new Error(response.data.error.message);
  });
};

/**
 * Send email
 */
const sendEmail = (integrationId: string, credentials: any, raw: string, threadId?: string) => {
  const auth = getOAuth(integrationId, credentials);
  const gmail = google.gmail('v1');

  const data = {
    auth,
    userId: 'me',
    resource: {
      raw,
      threadId,
    },
  };

  return gmail.users.messages.send(data).catch(({ response }) => {
    throw new Error(response.data.error.message);
  });
};

/**
 * Get attachment by attachmentId
 */
const getGmailAttachment = async (credentials: any, gmailData: IMsgGmail, attachmentId: string) => {
  if (!gmailData || !gmailData.attachments) {
    throw new Error('GmailData not found');
  }

  const attachment = await gmailData.attachments.find(a => a.attachmentId === attachmentId);

  if (!attachment) {
    throw new Error(`Gmail attachment not found id with ${attachmentId}`);
  }

  const { messageId } = gmailData;

  const gmail = await google.gmail('v1');
  const auth = getOauthClient('gmail');

  auth.setCredentials(credentials);

  return gmail.users.messages.attachments
    .get({
      auth,
      id: attachmentId,
      userId: 'me',
      messageId,
    })
    .catch(({ response }) => {
      throw new Error(response.data.error.message);
    })
    .then(({ data }) => {
      return {
        data: data.data,
        filename: attachment.filename,
      };
    });
};

/**
 * Get new messages by stored history id
 */
const getMessagesByHistoryId = async (historyId: string, integrationId: string, credentials: any) => {
  const auth = getOAuth(integrationId, credentials);
  const gmail = google.gmail('v1');

  const response = await gmail.users.history.list({
    auth,
    userId: 'me',
    startHistoryId: historyId,
  });

  if (!response.data.history) {
    return;
  }

  for (const history of response.data.history) {
    if (!history.messages) {
      continue;
    }

    for (const message of history.messages) {
      const { data } = await gmail.users.messages.get({
        auth,
        userId: 'me',
        id: message.id,
      });
      // get gmailData
      const gmailData = await parseMessage(data);

      if (!gmailData) {
        throw new Error('Couldn`t parse users.messages.get response');
      }

      await syncConversation(integrationId, gmailData);
    }
  }
};

/**
 * Listening email that connected with
 */
export const trackGmail = async () => {
  const { GOOGLE_APPLICATION_CREDENTIALS, GOOGLE_TOPIC, GOOGLE_SUBSCRIPTION_NAME, GOOGLE_PROJECT_ID } = process.env;

  if (!GOOGLE_APPLICATION_CREDENTIALS || !GOOGLE_PROJECT_ID || !GOOGLE_TOPIC || !GOOGLE_SUBSCRIPTION_NAME) {
    return;
  }

  const pubsubClient = PubSub({
    projectId: GOOGLE_PROJECT_ID,
    keyFilename: GOOGLE_APPLICATION_CREDENTIALS,
  });

  const topic = pubsubClient.topic(GOOGLE_TOPIC);

  topic.createSubscription(GOOGLE_SUBSCRIPTION_NAME, (error, subscription) => {
    if (error) {
      throw error;
    }

    const errorHandler = (err: any) => {
      subscription.removeListener('message', messageHandler);
      subscription.removeListener('error', errorHandler);
      throw new Error(err);
    };

    const messageHandler = async (message: any) => {
      try {
        const data = JSON.parse(message.data.toString());
        await getGmailUpdates(data);
      } catch (error) {
        console.log(error.message);
      }

      // All notifications need to be acknowledged as per the Cloud Pub/Sub
      message.ack();
    };

    subscription.on('error', errorHandler);
    subscription.on('message', messageHandler);
  });
};

export const callWatch = (credentials: any, integrationId: string) => {
  const gmail: any = google.gmail('v1');
  const { GOOGLE_TOPIC } = process.env;
  const auth = getOAuth(integrationId, credentials);

  return gmail.users
    .watch({
      auth,
      userId: 'me',
      requestBody: {
        topicName: GOOGLE_TOPIC,
      },
    })
    .catch(({ response }) => {
      throw new Error(response.data.error.message);
    });
};

export const stopReceivingEmail = (email: string, credentials: any) => {
  const auth = getOauthClient('gmail');
  const gmail: any = google.gmail('v1');

  auth.setCredentials(credentials);

  gmail.users.stop({
    auth,
    userId: email,
  });
};

export const utils = {
  getMessagesByHistoryId,
  getGmailUserProfile,
  getGmailAttachment,
  sendEmail,
  stopReceivingEmail,
  callWatch,
};
