import * as PubSub from '@google-cloud/pubsub';
import { google } from 'googleapis';
import { IGmail as IMsgGmail } from '../db/models/definitions/conversationMessages';
import { getGmailUpdates, parseMessage, syncConversation } from './gmail';
import { getOauthClient } from './googleTracker';

/**
 * Get permission granted email information
 */
export const getGmailUserProfile = async (credentials: any): Promise<{ emailAddress?: string; historyId?: string }> => {
  const auth = getOauthClient('gmail');

  auth.setCredentials(credentials);

  const gmail = await google.gmail('v1');

  return new Promise((resolve, reject) => {
    gmail.users.getProfile({ auth, userId: 'me' }, (err, response) => {
      if (err) {
        reject(err);
      }

      if (response) {
        resolve(response.data);
      }
    });
  });
};

/**
 * Send email
 */
const sendEmail = async (credentials: any, raw: string, threadId?: string) => {
  const auth = getOauthClient('gmail');

  auth.setCredentials(credentials);

  const gmail = await google.gmail('v1');

  const data = {
    auth,
    userId: 'me',
    resource: {
      raw,
      threadId,
    },
  };

  return gmail.users.messages.send(data);
};

/**
 * Get attachment by attachmentId
 */
const getGmailAttachment = async (credentials: any, gmailData: IMsgGmail, attachmentId: string) => {
  if (!gmailData || !gmailData.attachments) {
    throw new Error('GmailData not found');
  }

  const gmail = await google.gmail('v1');
  const auth = getOauthClient('gmail');

  const { messageId } = gmailData;

  auth.setCredentials(credentials);

  const { data } = await gmail.users.messages.attachments.get({
    auth,
    id: attachmentId,
    userId: 'me',
    messageId,
  });

  const attachment = await gmailData.attachments.find(a => a.attachmentId === attachmentId);

  if (!attachment) {
    throw new Error(`Gmail attachment not found id with ${attachmentId}`);
  }

  return {
    data: data.data,
    filename: attachment.filename,
  };
};

/**
 * Get new messages by stored history id
 */
const getMessagesByHistoryId = async (historyId: string, integrationId: string, credentials: any) => {
  const auth = getOauthClient('gmail');

  auth.setCredentials(credentials);

  const gmail = await google.gmail('v1');

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
  const { GOOGLE_APPLICATION_CREDENTIALS, GOOGLE_TOPIC, GOOGLE_SUPSCRIPTION_NAME, GOOGLE_PROJECT_ID } = process.env;

  const pubsubClient = PubSub({
    projectId: GOOGLE_PROJECT_ID,
    keyFilename: GOOGLE_APPLICATION_CREDENTIALS,
  });

  if (!GOOGLE_TOPIC) {
    throw new Error('GOOGLE_TOPIC not found in env');
  }

  if (!GOOGLE_SUPSCRIPTION_NAME) {
    throw new Error('GOOGLE_SUPSCRIPTION_NAME not found in env');
  }

  const topic = pubsubClient.topic(GOOGLE_TOPIC);

  topic.createSubscription(GOOGLE_SUPSCRIPTION_NAME, (error, subscription) => {
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

export const callWatch = async (credentials: any) => {
  const auth = getOauthClient('gmail');
  const gmail: any = await google.gmail('v1');
  const { GOOGLE_TOPIC } = process.env;

  auth.setCredentials(credentials);
  const response = await gmail.users.watch({
    auth,
    userId: 'me',
    requestBody: {
      topicName: GOOGLE_TOPIC,
    },
  });
  return response;
};

export const stopReceivingEmail = async (email: string, credentials: any) => {
  const auth = getOauthClient('gmail');
  const gmail: any = await google.gmail('v1');

  auth.setCredentials(credentials);

  gmail.users.stop({
    auth,
    userId: email,
  });
};

export const utils = {
  getMessagesByHistoryId,
  getGmailAttachment,
  sendEmail,
  stopReceivingEmail,
  callWatch,
};
